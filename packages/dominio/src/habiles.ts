/**
 * Días hábiles colombianos.
 *
 * Por defecto: lunes a viernes, excluyendo festivos nacionales. Algunos contratos de
 * obra pactan el sábado como hábil; se configura con `sabadoHabil`.
 * Los días de suspensión del contrato también pueden excluirse.
 */
import { type FechaISO, diaSemana, estaEntre, sumarDias } from "./fecha";
import { esFestivo } from "./festivos";

export interface Intervalo {
  desde: FechaISO;
  hasta: FechaISO;
}

export interface OpcionesHabiles {
  sabadoHabil?: boolean;
  /** Intervalos (inclusivos) que no cuentan, p. ej. suspensiones del contrato. */
  excluir?: readonly Intervalo[];
}

export function esHabil(fecha: FechaISO, opciones: OpcionesHabiles = {}): boolean {
  const dow = diaSemana(fecha);
  if (dow === 0) return false;
  if (dow === 6 && !opciones.sabadoHabil) return false;
  if (esFestivo(fecha)) return false;
  if (opciones.excluir?.some((i) => estaEntre(fecha, i.desde, i.hasta))) return false;
  return true;
}

/**
 * Suma `n` días hábiles. El conteo empieza el día siguiente a `fecha`
 * («dentro de los cinco días hábiles siguientes a…»). Con `n` negativo, cuenta hacia atrás.
 * Con `n = 0` devuelve `fecha` si es hábil, o el siguiente día hábil si no lo es.
 */
export function sumarDiasHabiles(fecha: FechaISO, n: number, opciones: OpcionesHabiles = {}): FechaISO {
  if (!Number.isInteger(n)) throw new RangeError(`Los días hábiles deben ser enteros; recibí ${n}.`);
  if (n === 0) return siguienteHabil(fecha, opciones, true);
  const paso = n > 0 ? 1 : -1;
  let restantes = Math.abs(n);
  let actual = fecha;
  while (restantes > 0) {
    actual = sumarDias(actual, paso);
    if (esHabil(actual, opciones)) restantes--;
  }
  return actual;
}

/** Primer día hábil estrictamente después de `fecha` (o igual, si `incluir` y es hábil). */
export function siguienteHabil(fecha: FechaISO, opciones: OpcionesHabiles = {}, incluir = false): FechaISO {
  let actual = incluir ? fecha : sumarDias(fecha, 1);
  while (!esHabil(actual, opciones)) actual = sumarDias(actual, 1);
  return actual;
}

/** Días hábiles en el intervalo (a, b]: los que «faltan» desde `a` hasta `b`. Negativo si b < a. */
export function diasHabilesEntre(a: FechaISO, b: FechaISO, opciones: OpcionesHabiles = {}): number {
  if (a === b) return 0;
  const signo = b > a ? 1 : -1;
  let [desde, hasta] = signo > 0 ? [a, b] : [b, a];
  let cuenta = 0;
  while (desde < hasta) {
    desde = sumarDias(desde, 1);
    if (esHabil(desde, opciones)) cuenta++;
  }
  return signo * cuenta;
}

/** Enésimo día hábil del mes (1 = primero). */
export function enesimoHabilDelMes(anio: number, mes: number, n: number, opciones: OpcionesHabiles = {}): FechaISO {
  const ultimoDelMesAnterior = sumarDias(`${String(anio).padStart(4, "0")}-${String(mes).padStart(2, "0")}-01`, -1);
  return sumarDiasHabiles(ultimoDelMesAnterior, n, opciones);
}
