import { formatearPesos, type FechaISO } from "@lc/dominio";
import { fechaCorta } from "./formato";
import type { Periodicidad, TipoContrato } from "./tipos";

const DIAS = ["domingos", "lunes", "martes", "miércoles", "jueves", "viernes", "sábados"];

export function describirPeriodicidad(p: Periodicidad): string {
  switch (p.tipo) {
    case "mensual":
      switch (p.regla.tipo) {
        case "habil_mes_siguiente":
          return `Cada mes, dentro de los ${p.regla.n} primeros días hábiles del mes siguiente`;
        case "dia_mes_siguiente":
          return `Cada mes, el día ${p.regla.dia} del mes siguiente`;
        case "habiles_tras_corte":
          return `Cada mes, ${p.regla.n} días hábiles después del corte`;
      }
      break;
    case "semanal":
      return `Cada semana, los ${DIAS[p.dia]}`;
    case "quincenal":
      return `Cada 15 días, los ${DIAS[p.dia]}`;
    case "unica":
      return `Una vez, a más tardar el ${fechaCorta(p.fecha)}`;
    case "continua":
      return "Permanente, durante todo el contrato";
    case "por_evento":
      return p.descripcion;
  }
}

export const TIPO_CONTRATO: Record<TipoContrato, string> = {
  obra: "Obra",
  prestacion_servicios: "Prestación de servicios",
  consultoria: "Consultoría",
  suministro: "Suministro",
  software: "Servicios de software",
};

export function confianzaTexto(c: number): string {
  if (c >= 0.9) return "Alta";
  if (c >= 0.75) return "Media";
  return "Baja: revísala";
}

export function pesos(n: number): string {
  return formatearPesos(n);
}

export function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

export type { FechaISO };
