import { type FechaISO, diaSemana, diferenciaDias, partes } from "@lc/dominio";

const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function fechaLarga(f: FechaISO): string {
  const { mes, dia } = partes(f);
  const d = DIAS[diaSemana(f)]!;
  return `${d.charAt(0).toUpperCase()}${d.slice(1)} ${dia} de ${MESES[mes - 1]}`;
}

export function fechaCorta(f: FechaISO): string {
  const { mes, dia } = partes(f);
  return `${dia} ${MESES_CORTOS[mes - 1]}`;
}

export function fechaCompleta(f: FechaISO): string {
  const { anio, mes, dia } = partes(f);
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}

export function nombreMes(periodo: string): string {
  return MESES[Number(periodo.slice(5, 7)) - 1] ?? periodo;
}

/** «hoy», «mañana», «el martes», «el 28 nov», «ayer», «hace 3 días». */
export function relativa(f: FechaISO, hoy: FechaISO): string {
  const d = diferenciaDias(hoy, f);
  if (d === 0) return "hoy";
  if (d === 1) return "mañana";
  if (d === -1) return "ayer";
  if (d < 0) return `hace ${-d} días`;
  if (d < 7) return `el ${DIAS[diaSemana(f)]}`;
  return `el ${fechaCorta(f)}`;
}
