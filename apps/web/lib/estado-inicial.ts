/**
 * Historia de cumplimiento de los contratos demo: qué evidencias ya estaban aceptadas
 * y qué pagos ya se recibieron cuando el usuario «carga» el contrato.
 */
import type { FechaISO } from "@lc/dominio";
import { vencimientosDe } from "./calculos";
import { contratoPorId } from "./semillas";
import type { Evidencia } from "./tipos";

/** Hasta qué fecha de vencimiento (inclusive) la obligación ya tenía evidencia aceptada. */
const HISTORIA: Record<string, Record<string, FechaISO>> = {
  software: {
    "sw-informe": "2026-11-09",
    "sw-sla": "2026-11-09",
    "sw-cuenta": "2026-11-09",
    "sw-pila": "2026-10-31", // falta la de octubre
    "sw-backup": "2026-11-01", // falta el del viernes 6 de noviembre
    "sw-mfa": "2026-11-09",
    "sw-reunion": "2026-11-01",
  },
  obra: {
    "ob-fotos": "2026-11-03", // el lunes 2 fue festivo: se entregó el martes 3
    "ob-informe": "2026-10-31",
    "ob-pila": "2026-10-31",
    "ob-poliza-cumplimiento": "2026-10-08",
    "ob-plan-anticipo": "2026-04-15",
    // Falta el certificado de la póliza de salarios (vencía el 8 de octubre).
  },
};

const PAGADOS: Record<string, Record<string, FechaISO>> = {
  software: {
    "sw-pago-2026-02": "2026-03-20",
    "sw-pago-2026-03": "2026-04-22",
    "sw-pago-2026-04": "2026-05-19",
    "sw-pago-2026-05": "2026-06-18",
    "sw-pago-2026-06": "2026-07-21",
    "sw-pago-2026-07": "2026-08-19",
    "sw-pago-2026-08": "2026-09-17",
    "sw-pago-2026-09": "2026-10-20",
  },
  obra: {
    "ob-anticipo": "2026-04-24",
    "ob-acta-2026-04": "2026-05-29",
    "ob-acta-2026-05": "2026-06-30",
    "ob-acta-2026-06": "2026-07-31",
    "ob-acta-2026-07": "2026-08-28",
    "ob-acta-2026-08": "2026-09-30",
    "ob-acta-2026-09": "2026-10-30",
  },
};

const EXTERNOS: Record<string, string[]> = {
  software: [],
  obra: [],
};

export function evidenciasIniciales(contratoId: string): Evidencia[] {
  const c = contratoPorId(contratoId);
  if (!c) return [];
  const historia = HISTORIA[contratoId] ?? {};
  const res: Evidencia[] = [];
  for (const ob of c.obligaciones) {
    const hasta = historia[ob.id];
    if (!hasta) continue;
    for (const v of vencimientosDe(ob, c)) {
      if (v.vence > hasta) continue;
      res.push({
        id: `ini-${ob.id}-${v.vence}`,
        obligacionId: ob.id,
        vence: v.vence,
        nombre: `${ob.evidenciaEsperada} · ${v.periodo}`,
        subidaEl: v.vence,
        estado: "aceptada",
      });
    }
  }
  return res;
}

export function pagadosIniciales(contratoId: string): Record<string, FechaISO> {
  return { ...(PAGADOS[contratoId] ?? {}) };
}

export function externosIniciales(contratoId: string): Record<string, boolean> {
  return Object.fromEntries((EXTERNOS[contratoId] ?? []).map((k) => [k, true]));
}
