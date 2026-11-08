/**
 * Vencimientos de obligaciones periódicas, estado del semáforo y escalera de recordatorios.
 */
import { type DiaSemana, type FechaISO, crearFecha, diaSemana, diasDelMes, partes, sumarDias } from "./fecha";
import { type Intervalo, type OpcionesHabiles, diasHabilesEntre, enesimoHabilDelMes, esHabil, siguienteHabil, sumarDiasHabiles } from "./habiles";

export interface Periodo {
  desde: FechaISO;
  hasta: FechaISO;
  /** «2026-11». */
  etiqueta: string;
}

export interface Vencimiento {
  periodo: Periodo;
  vence: FechaISO;
}

export type ReglaMensual =
  /** «Dentro de los N primeros días hábiles del mes siguiente». */
  | { tipo: "habil_mes_siguiente"; n: number }
  /** «El día D del mes siguiente» (si no es hábil, se corre al siguiente hábil). */
  | { tipo: "dia_mes_siguiente"; dia: number }
  /** «Dentro de los N días hábiles siguientes al corte del periodo». */
  | { tipo: "habiles_tras_corte"; n: number };

/** Periodos mensuales calendario (primer y último mes parciales) entre `inicio` y `fin`. */
export function periodosMensuales(inicio: FechaISO, fin: FechaISO): Periodo[] {
  const periodos: Periodo[] = [];
  let { anio, mes } = partes(inicio);
  for (;;) {
    const primero = crearFecha(anio, mes, 1);
    if (primero > fin) break;
    const ultimo = crearFecha(anio, mes, diasDelMes(anio, mes));
    periodos.push({
      desde: primero < inicio ? inicio : primero,
      hasta: ultimo > fin ? fin : ultimo,
      etiqueta: `${anio}-${String(mes).padStart(2, "0")}`,
    });
    mes++;
    if (mes > 12) {
      mes = 1;
      anio++;
    }
  }
  return periodos;
}

function cubiertoPorSuspension(p: Periodo, suspensiones: readonly Intervalo[]): boolean {
  return suspensiones.some((s) => s.desde <= p.desde && s.hasta >= p.hasta);
}

export function vencimientosMensuales(args: {
  inicio: FechaISO;
  fin: FechaISO;
  regla: ReglaMensual;
  opciones?: OpcionesHabiles;
}): Vencimiento[] {
  const opciones = args.opciones ?? {};
  const suspensiones = opciones.excluir ?? [];
  return periodosMensuales(args.inicio, args.fin)
    .filter((p) => !cubiertoPorSuspension(p, suspensiones))
    .map((periodo) => {
      const { anio, mes } = partes(periodo.hasta);
      const sigAnio = mes === 12 ? anio + 1 : anio;
      const sigMes = mes === 12 ? 1 : mes + 1;
      let vence: FechaISO;
      switch (args.regla.tipo) {
        case "habil_mes_siguiente":
          vence = enesimoHabilDelMes(sigAnio, sigMes, args.regla.n, opciones);
          break;
        case "dia_mes_siguiente":
          vence = siguienteHabil(crearFecha(sigAnio, sigMes, Math.min(args.regla.dia, diasDelMes(sigAnio, sigMes))), opciones, true);
          break;
        case "habiles_tras_corte":
          vence = sumarDiasHabiles(periodo.hasta, args.regla.n, opciones);
          break;
      }
      return { periodo, vence };
    });
}

/**
 * Vencimientos semanales en un día de la semana. Si ese día no es hábil (festivo o
 * suspensión), la obligación se entrega el siguiente día hábil.
 */
export function vencimientosSemanales(args: {
  inicio: FechaISO;
  fin: FechaISO;
  dia: DiaSemana;
  opciones?: OpcionesHabiles;
}): FechaISO[] {
  const opciones = args.opciones ?? {};
  const resultado: FechaISO[] = [];
  let actual = sumarDias(args.inicio, (args.dia - diaSemana(args.inicio) + 7) % 7);
  while (actual <= args.fin) {
    const suspendido = opciones.excluir?.some((s) => actual >= s.desde && actual <= s.hasta);
    if (!suspendido) {
      const vence = esHabil(actual, opciones) ? actual : siguienteHabil(actual, opciones);
      resultado.push(vence);
    }
    actual = sumarDias(actual, 7);
  }
  return resultado;
}

// ——— Semáforo ———

export type EstadoObligacion = "cumplida" | "en_riesgo" | "vencida" | "pendiente";

export interface EntradaSemaforo {
  vence: FechaISO;
  hoy: FechaISO;
  /**
   * Solo cuenta evidencia aceptada por el Verificador. Una evidencia subida
   * pero no verificada NO hace cumplida la obligación.
   */
  evidenciaAceptada: boolean;
  /** Días hábiles antes del vencimiento en que pasa a «en riesgo». */
  umbralRiesgo?: number;
  opciones?: OpcionesHabiles;
}

export interface ResultadoSemaforo {
  estado: EstadoObligacion;
  /** Positivo: faltan. Negativo: días hábiles de atraso. */
  diasHabiles: number;
}

export function estadoObligacion(e: EntradaSemaforo): ResultadoSemaforo {
  const diasHabiles = diasHabilesEntre(e.hoy, e.vence, e.opciones);
  if (e.evidenciaAceptada) return { estado: "cumplida", diasHabiles };
  if (e.hoy > e.vence) return { estado: "vencida", diasHabiles };
  if (diasHabiles <= (e.umbralRiesgo ?? 3)) return { estado: "en_riesgo", diasHabiles };
  return { estado: "pendiente", diasHabiles };
}

// ——— Recordatorios ———

export type Destinatario = "responsable" | "gerente";

export interface PeldanoEscalera {
  /** Días hábiles respecto al vencimiento (negativo = antes). */
  desplazamiento: number;
  a: Destinatario;
}

/** T−5, T−2 y T0 al responsable; T+1 al gerente si sigue sin evidencia. */
export const ESCALERA_POR_DEFECTO: readonly PeldanoEscalera[] = [
  { desplazamiento: -5, a: "responsable" },
  { desplazamiento: -2, a: "responsable" },
  { desplazamiento: 0, a: "responsable" },
  { desplazamiento: 1, a: "gerente" },
];

export interface Recordatorio {
  fecha: FechaISO;
  a: Destinatario;
  desplazamiento: number;
}

/**
 * Fechas de recordatorio para un vencimiento. Se omiten las que ya pasaron
 * respecto a `desde` (p. ej., la fecha en que se creó la obligación).
 */
export function programarRecordatorios(args: {
  vence: FechaISO;
  desde: FechaISO;
  escalera?: readonly PeldanoEscalera[];
  opciones?: OpcionesHabiles;
}): Recordatorio[] {
  const opciones = args.opciones ?? {};
  // Si el vencimiento cae en un día no hábil, el aviso «T0» sale el día hábil anterior.
  const base = esHabil(args.vence, opciones) ? args.vence : sumarDiasHabiles(args.vence, -1, opciones);
  const vistos = new Set<string>();
  return (args.escalera ?? ESCALERA_POR_DEFECTO)
    .map((p) => ({
      fecha: p.desplazamiento === 0 ? base : sumarDiasHabiles(base, p.desplazamiento, opciones),
      a: p.a,
      desplazamiento: p.desplazamiento,
    }))
    .filter((r) => r.fecha >= args.desde)
    .filter((r) => {
      const k = `${r.fecha}|${r.a}`;
      if (vistos.has(k)) return false;
      vistos.add(k);
      return true;
    });
}
