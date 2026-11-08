/**
 * Fechas de calendario sin hora ni zona horaria.
 *
 * Los plazos contractuales se cuentan en días, no en instantes. Trabajar con
 * `Date` mezcla la zona horaria del servidor (UTC) con la del contrato
 * (America/Bogota) y produce errores de un día. Por eso representamos una fecha
 * como texto ISO `AAAA-MM-DD` y calculamos sobre un número de día absoluto.
 */
import { ErrorDominio } from "./errores";

export type FechaISO = string;

const PATRON = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_DIA = 86_400_000;

/** 0 = domingo … 6 = sábado (igual que `Date#getUTCDay`). */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export function partes(fecha: FechaISO): { anio: number; mes: number; dia: number } {
  const m = PATRON.exec(fecha);
  if (!m) throw new ErrorDominio("FECHA_INVALIDA", `«${fecha}» no es una fecha AAAA-MM-DD.`);
  const anio = Number(m[1]);
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > diasDelMes(anio, mes)) {
    throw new ErrorDominio("FECHA_INVALIDA", `«${fecha}» no existe en el calendario.`);
  }
  return { anio, mes, dia };
}

export function crearFecha(anio: number, mes: number, dia: number): FechaISO {
  return `${String(anio).padStart(4, "0")}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** Número de días desde 1970-01-01. */
export function aNumeroDia(fecha: FechaISO): number {
  const { anio, mes, dia } = partes(fecha);
  return Math.round(Date.UTC(anio, mes - 1, dia) / MS_DIA);
}

export function deNumeroDia(n: number): FechaISO {
  const d = new Date(n * MS_DIA);
  return crearFecha(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function diaSemana(fecha: FechaISO): DiaSemana {
  // 1970-01-01 fue jueves (4).
  return ((((aNumeroDia(fecha) + 4) % 7) + 7) % 7) as DiaSemana;
}

export function sumarDias(fecha: FechaISO, dias: number): FechaISO {
  return deNumeroDia(aNumeroDia(fecha) + dias);
}

/** `b - a` en días calendario. */
export function diferenciaDias(a: FechaISO, b: FechaISO): number {
  return aNumeroDia(b) - aNumeroDia(a);
}

export function diasDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

/**
 * Suma meses conservando el número de día (Código Civil, art. 67). Si el día no
 * existe en el mes de destino, se usa el último día de ese mes (31 ene + 1 mes = 28 o 29 feb).
 */
export function sumarMeses(fecha: FechaISO, meses: number): FechaISO {
  const { anio, mes, dia } = partes(fecha);
  const total = anio * 12 + (mes - 1) + meses;
  const nAnio = Math.floor(total / 12);
  const nMes = (total % 12) + 1;
  return crearFecha(nAnio, nMes, Math.min(dia, diasDelMes(nAnio, nMes)));
}

export function compararFechas(a: FechaISO, b: FechaISO): number {
  return a < b ? -1 : a > b ? 1 : 0; // el orden lexicográfico ISO coincide con el cronológico
}

export function maxFecha(a: FechaISO, b: FechaISO): FechaISO {
  return a >= b ? a : b;
}

export function minFecha(a: FechaISO, b: FechaISO): FechaISO {
  return a <= b ? a : b;
}

export function estaEntre(fecha: FechaISO, desde: FechaISO, hasta: FechaISO): boolean {
  return fecha >= desde && fecha <= hasta;
}
