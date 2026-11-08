/**
 * Festivos de Colombia.
 *
 * Reglas:
 *  - Ley 51 de 1983 («Ley Emiliani»): ciertos festivos se trasladan al lunes siguiente
 *    cuando no caen en lunes.
 *  - Los festivos religiosos móviles se calculan desde el Domingo de Pascua
 *    (algoritmo de Meeus/Jones/Butcher, calendario gregoriano).
 *
 * Varios festivos pueden caer el mismo día (en 2025, San Pedro y San Pablo y el Sagrado
 * Corazón cayeron ambos el lunes 30 de junio). Se conservan los dos nombres.
 */
import { type FechaISO, crearFecha, diaSemana, sumarDias } from "./fecha";

export interface Festivo {
  fecha: FechaISO;
  /** Clave estable para i18n. */
  clave: ClaveFestivo;
  nombre: string;
  /** La fecha original antes del traslado, si se trasladó. */
  trasladadoDesde?: FechaISO;
}

export type ClaveFestivo =
  | "anio_nuevo"
  | "reyes_magos"
  | "san_jose"
  | "jueves_santo"
  | "viernes_santo"
  | "dia_del_trabajo"
  | "ascension"
  | "corpus_christi"
  | "sagrado_corazon"
  | "san_pedro_y_san_pablo"
  | "independencia"
  | "batalla_de_boyaca"
  | "asuncion"
  | "dia_de_la_raza"
  | "todos_los_santos"
  | "independencia_de_cartagena"
  | "inmaculada_concepcion"
  | "navidad";

export const ANIO_MIN = 1984; // primer año completo con la Ley 51 de 1983
export const ANIO_MAX = 2199;

/** Domingo de Pascua (algoritmo anónimo gregoriano). */
export function domingoDePascua(anio: number): FechaISO {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return crearFecha(anio, mes, dia);
}

/** Lunes siguiente (o el mismo día si ya es lunes). */
export function alLunes(fecha: FechaISO): FechaISO {
  const dow = diaSemana(fecha);
  return dow === 1 ? fecha : sumarDias(fecha, (8 - dow) % 7);
}

const FIJOS: Array<[number, number, ClaveFestivo, string]> = [
  [1, 1, "anio_nuevo", "Año Nuevo"],
  [5, 1, "dia_del_trabajo", "Día del Trabajo"],
  [7, 20, "independencia", "Día de la Independencia"],
  [8, 7, "batalla_de_boyaca", "Batalla de Boyacá"],
  [12, 8, "inmaculada_concepcion", "Inmaculada Concepción"],
  [12, 25, "navidad", "Navidad"],
];

const EMILIANI: Array<[number, number, ClaveFestivo, string]> = [
  [1, 6, "reyes_magos", "Reyes Magos"],
  [3, 19, "san_jose", "San José"],
  [6, 29, "san_pedro_y_san_pablo", "San Pedro y San Pablo"],
  [8, 15, "asuncion", "Asunción de la Virgen"],
  [10, 12, "dia_de_la_raza", "Día de la Raza"],
  [11, 1, "todos_los_santos", "Todos los Santos"],
  [11, 11, "independencia_de_cartagena", "Independencia de Cartagena"],
];

const cache = new Map<number, Festivo[]>();

export function festivosDelAnio(anio: number): Festivo[] {
  if (!Number.isInteger(anio) || anio < ANIO_MIN || anio > ANIO_MAX) {
    throw new RangeError(`Calculamos festivos entre ${ANIO_MIN} y ${ANIO_MAX}; pediste ${anio}.`);
  }
  const enCache = cache.get(anio);
  if (enCache) return enCache;

  const lista: Festivo[] = [];
  for (const [mes, dia, clave, nombre] of FIJOS) {
    lista.push({ fecha: crearFecha(anio, mes, dia), clave, nombre });
  }
  for (const [mes, dia, clave, nombre] of EMILIANI) {
    const original = crearFecha(anio, mes, dia);
    const fecha = alLunes(original);
    lista.push(fecha === original ? { fecha, clave, nombre } : { fecha, clave, nombre, trasladadoDesde: original });
  }

  const pascua = domingoDePascua(anio);
  lista.push({ fecha: sumarDias(pascua, -3), clave: "jueves_santo", nombre: "Jueves Santo" });
  lista.push({ fecha: sumarDias(pascua, -2), clave: "viernes_santo", nombre: "Viernes Santo" });
  // Jueves +39, +60 y viernes +68 desde Pascua, trasladados al lunes siguiente.
  for (const [desplazamiento, clave, nombre] of [
    [39, "ascension", "Ascensión del Señor"],
    [60, "corpus_christi", "Corpus Christi"],
    [68, "sagrado_corazon", "Sagrado Corazón de Jesús"],
  ] as const) {
    const original = sumarDias(pascua, desplazamiento);
    lista.push({ fecha: alLunes(original), clave, nombre, trasladadoDesde: original });
  }

  lista.sort((x, y) => (x.fecha < y.fecha ? -1 : x.fecha > y.fecha ? 1 : 0));
  cache.set(anio, lista);
  return lista;
}

const conjuntos = new Map<number, Set<FechaISO>>();

export function esFestivo(fecha: FechaISO): boolean {
  const anio = Number(fecha.slice(0, 4));
  let set = conjuntos.get(anio);
  if (!set) {
    set = new Set(festivosDelAnio(anio).map((f) => f.fecha));
    conjuntos.set(anio, set);
  }
  return set.has(fecha);
}

/** Festivos en una fecha (puede haber dos). */
export function festivosEn(fecha: FechaISO): Festivo[] {
  return festivosDelAnio(Number(fecha.slice(0, 4))).filter((f) => f.fecha === fecha);
}
