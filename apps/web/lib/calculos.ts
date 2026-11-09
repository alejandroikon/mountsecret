/**
 * Cálculos de la app sobre el motor de dominio: vencimientos por obligación, estado del
 * semáforo, requisitos de cada pago y la lista priorizada de «Hoy».
 */
import {
  type Cronograma,
  type EstadoObligacion,
  type FechaISO,
  type OpcionesHabiles,
  calcularCronograma,
  estadoObligacion,
  sumarDias,
  vencimientosMensuales,
  vencimientosSemanales,
} from "@lc/dominio";
import type { Contrato, Evidencia, Obligacion, Pago, Requisito } from "./tipos";

export const UMBRAL_CONFIANZA = 0.75;

const cacheCrono = new Map<string, Cronograma>();
export function cronogramaDe(c: Contrato): Cronograma {
  let cr = cacheCrono.get(c.id);
  if (!cr) {
    cr = calcularCronograma(
      { actaInicio: c.actaInicio, plazo: c.plazo, valorInicial: c.valorInicial, sabadoHabil: c.sabadoHabil },
      c.eventos,
    );
    cacheCrono.set(c.id, cr);
  }
  return cr;
}

export function opcionesDe(c: Contrato): OpcionesHabiles {
  return { sabadoHabil: c.sabadoHabil, excluir: cronogramaDe(c).suspensiones };
}

export interface VencimientoOb {
  vence: FechaISO;
  /** Mes al que pertenece («2026-10»). */
  periodo: string;
}

const cacheVenc = new Map<string, VencimientoOb[]>();
export function vencimientosDe(ob: Obligacion, c: Contrato): VencimientoOb[] {
  const clave = `${c.id}:${ob.id}`;
  const enCache = cacheVenc.get(clave);
  if (enCache) return enCache;
  const cr = cronogramaDe(c);
  const opciones = opcionesDe(c);
  let r: VencimientoOb[] = [];
  const p = ob.periodicidad;
  switch (p.tipo) {
    case "mensual":
      r = vencimientosMensuales({ inicio: cr.inicio, fin: cr.terminacion, regla: p.regla, opciones }).map((v) => ({
        vence: v.vence,
        periodo: v.periodo.etiqueta,
      }));
      break;
    case "semanal":
    case "quincenal": {
      const todas = vencimientosSemanales({ inicio: cr.inicio, fin: cr.terminacion, dia: p.dia, opciones });
      const filtradas = p.tipo === "quincenal" ? todas.filter((_, i) => i % 2 === 0) : todas;
      r = filtradas.map((vence) => ({ vence, periodo: vence.slice(0, 7) }));
      break;
    }
    case "unica":
      r = [{ vence: p.fecha, periodo: p.fecha.slice(0, 7) }];
      break;
    default:
      r = [];
  }
  cacheVenc.set(clave, r);
  return r;
}

export function evidenciaDe(evidencias: Evidencia[], obId: string, vence: FechaISO): Evidencia | undefined {
  // La más reciente manda.
  const lista = evidencias.filter((e) => e.obligacionId === obId && e.vence === vence);
  return lista[lista.length - 1];
}

export type EstadoUI = EstadoObligacion | "permanente" | "en_verificacion" | "terminada";

export interface SituacionOb {
  estado: EstadoUI;
  vence?: FechaISO;
  periodo?: string;
  diasHabiles?: number;
  evidencia?: Evidencia;
}

/** El vencimiento que importa hoy: el primero sin evidencia aceptada. */
export function situacionDe(ob: Obligacion, c: Contrato, evidencias: Evidencia[], hoy: FechaISO): SituacionOb {
  const vencs = vencimientosDe(ob, c);
  if (vencs.length === 0) {
    const ultima = [...evidencias].reverse().find((e) => e.obligacionId === ob.id);
    return ultima ? { estado: ultima.estado === "aceptada" ? "cumplida" : "en_verificacion", evidencia: ultima } : { estado: "permanente" };
  }
  const pendiente = vencs.find((v) => evidenciaDe(evidencias, ob.id, v.vence)?.estado !== "aceptada");
  if (!pendiente) {
    const ultimo = vencs[vencs.length - 1]!;
    return { estado: "terminada", vence: ultimo.vence, periodo: ultimo.periodo, evidencia: evidenciaDe(evidencias, ob.id, ultimo.vence) };
  }
  const ev = evidenciaDe(evidencias, ob.id, pendiente.vence);
  const base = estadoObligacion({ vence: pendiente.vence, hoy, evidenciaAceptada: false, opciones: opcionesDe(c) });
  // Si la última evidencia aceptada fue la del vencimiento anterior y el siguiente aún está lejos, se muestra como al día.
  const anteriorOk = vencs.indexOf(pendiente) > 0 && base.estado === "pendiente";
  if (ev?.estado === "en_verificacion") return { estado: "en_verificacion", vence: pendiente.vence, periodo: pendiente.periodo, diasHabiles: base.diasHabiles, evidencia: ev };
  return {
    estado: anteriorOk ? "pendiente" : base.estado,
    vence: pendiente.vence,
    periodo: pendiente.periodo,
    diasHabiles: base.diasHabiles,
    ...(ev ? { evidencia: ev } : {}),
  };
}

// ——— Pagos ———

export interface EstadoRequisito {
  requisito: Requisito;
  listo: boolean;
  /** Para requisitos propios: el vencimiento pendiente más antiguo. */
  pendiente?: VencimientoOb;
  estado?: EstadoObligacion;
  obligacion?: Obligacion;
}

export function vencimientosParaPago(ob: Obligacion, c: Contrato, pago: Pago): VencimientoOb[] {
  const vencs = vencimientosDe(ob, c);
  if (ob.periodicidad.tipo === "unica") return vencs.filter((v) => v.vence <= pago.radicarAntes);
  if (!pago.periodo) return vencs;
  return vencs.filter((v) => v.periodo === pago.periodo);
}

export function requisitosDe(
  pago: Pago,
  c: Contrato,
  evidencias: Evidencia[],
  externos: Record<string, boolean>,
  hoy: FechaISO,
): EstadoRequisito[] {
  return pago.requisitos.map((req) => {
    if (req.externo || !req.obligacionId) {
      return { requisito: req, listo: Boolean(externos[`${pago.id}:${req.id}`]) };
    }
    const ob = c.obligaciones.find((o) => o.id === req.obligacionId)!;
    const vencs = vencimientosParaPago(ob, c, pago);
    const pendiente = vencs.find((v) => evidenciaDe(evidencias, ob.id, v.vence)?.estado !== "aceptada");
    if (!pendiente) return { requisito: req, listo: true, obligacion: ob };
    const { estado } = estadoObligacion({ vence: pendiente.vence, hoy, evidenciaAceptada: false, opciones: opcionesDe(c) });
    return { requisito: req, listo: false, pendiente, estado, obligacion: ob };
  });
}

export type EstadoPago = "pagado" | "listo" | "en_curso" | "futuro";

export function finDePeriodo(pago: Pago): FechaISO | null {
  if (!pago.periodo) return null;
  const [a, m] = pago.periodo.split("-").map(Number) as [number, number];
  const siguiente = m === 12 ? `${a + 1}-01-01` : `${a}-${String(m + 1).padStart(2, "0")}-01`;
  return sumarDias(siguiente, -1);
}

export function estadoPago(
  pago: Pago,
  c: Contrato,
  evidencias: Evidencia[],
  externos: Record<string, boolean>,
  pagados: Record<string, string>,
  hoy: FechaISO,
): EstadoPago {
  if (pagados[pago.id]) return "pagado";
  const fin = finDePeriodo(pago);
  const reqs = requisitosDe(pago, c, evidencias, externos, hoy);
  if (reqs.every((r) => r.listo)) return "listo";
  if (fin && hoy < sumarDias(fin, -10)) return "futuro";
  return "en_curso";
}

/** El pago que el usuario está persiguiendo ahora: el más antiguo sin pagar. */
export function proximoPago(
  c: Contrato,
  evidencias: Evidencia[],
  externos: Record<string, boolean>,
  pagados: Record<string, string>,
  hoy: FechaISO,
): Pago | undefined {
  return c.pagos.find((p) => !pagados[p.id] && estadoPago(p, c, evidencias, externos, pagados, hoy) !== "futuro") ?? c.pagos.find((p) => !pagados[p.id]);
}

// ——— Hoy ———

export interface ItemHoy {
  contrato: Contrato;
  obligacion: Obligacion;
  situacion: SituacionOb;
  /** Si frena el próximo pago. */
  frenaPago?: Pago;
  prioridad: number;
}

const PESO: Record<EstadoUI, number> = {
  vencida: 0,
  en_riesgo: 1,
  en_verificacion: 3,
  pendiente: 4,
  permanente: 9,
  cumplida: 9,
  terminada: 9,
};

export function itemsHoy(
  contratos: Contrato[],
  confirmadas: (c: Contrato, ob: Obligacion) => boolean,
  evidencias: Evidencia[],
  externos: Record<string, boolean>,
  pagados: Record<string, string>,
  hoy: FechaISO,
): ItemHoy[] {
  const items: ItemHoy[] = [];
  for (const c of contratos) {
    const pago = proximoPago(c, evidencias, externos, pagados, hoy);
    const frenan = new Set(
      pago ? requisitosDe(pago, c, evidencias, externos, hoy).filter((r) => !r.listo && r.obligacion).map((r) => r.obligacion!.id) : [],
    );
    for (const ob of c.obligaciones) {
      if (!confirmadas(c, ob)) continue;
      const situacion = situacionDe(ob, c, evidencias, hoy);
      if (["permanente", "cumplida", "terminada"].includes(situacion.estado)) continue;
      const frena = frenan.has(ob.id) ? pago : undefined;
      items.push({
        contrato: c,
        obligacion: ob,
        situacion,
        ...(frena ? { frenaPago: frena } : {}),
        prioridad: PESO[situacion.estado] * 1000 - (frena ? 500 : 0) + (situacion.diasHabiles ?? 99),
      });
    }
  }
  return items.sort((a, b) => a.prioridad - b.prioridad);
}

/** Estado de cada pago para pintar la Línea. */
export function rombosDe(
  c: Contrato,
  evidencias: Evidencia[],
  externos: Record<string, boolean>,
  pagados: Record<string, string>,
  hoy: FechaISO,
): { pago: Pago; estado: "pagado" | "listo" | "en_riesgo" | "vencida" | "pendiente" }[] {
  return c.pagos.map((pago) => {
    const ep = estadoPago(pago, c, evidencias, externos, pagados, hoy);
    if (ep === "pagado" || ep === "listo") return { pago, estado: ep };
    if (ep === "futuro") return { pago, estado: "pendiente" };
    const reqs = requisitosDe(pago, c, evidencias, externos, hoy);
    if (reqs.some((r) => r.estado === "vencida")) return { pago, estado: "vencida" };
    if (reqs.some((r) => r.estado === "en_riesgo") || hoy >= sumarDias(pago.radicarAntes, -3)) return { pago, estado: "en_riesgo" };
    return { pago, estado: "pendiente" };
  });
}
