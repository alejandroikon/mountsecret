/**
 * Dinero en pesos colombianos (enteros), valor en letras para la cuenta de cobro
 * y amortización del anticipo para las actas parciales de obra.
 */
import { ErrorDominio } from "./errores";

function validarEntero(n: number, campo: string): void {
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new ErrorDominio("VALOR_INVALIDO", `${campo} debe ser un entero de pesos mayor o igual a cero; recibí ${n}.`);
  }
}

/** «$ 4.760.000». Sin depender de los datos ICU del servidor. */
export function formatearPesos(n: number): string {
  const signo = n < 0 ? "-" : "";
  const entero = Math.round(Math.abs(n)).toString();
  return `${signo}$ ${entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

/** «$4,8M» o «$96,6M» para la Línea; «$850 mil» por debajo del millón. */
export function formatearPesosCorto(n: number): string {
  const abs = Math.abs(n);
  const signo = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${signo}$${(abs / 1_000_000_000).toFixed(1).replace(".", ",").replace(/,0$/, "")} mil M`;
  if (abs >= 1_000_000) return `${signo}$${(abs / 1_000_000).toFixed(1).replace(".", ",").replace(/,0$/, "")}M`;
  if (abs >= 1_000) return `${signo}$${Math.round(abs / 1_000)} mil`;
  return `${signo}$${abs}`;
}

const UNIDADES = ["", "UNO", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const DIEZ_A_VEINTINUEVE = [
  "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE",
  "VEINTE", "VEINTIUNO", "VEINTIDÓS", "VEINTITRÉS", "VEINTICUATRO", "VEINTICINCO", "VEINTISÉIS", "VEINTISIETE",
  "VEINTIOCHO", "VEINTINUEVE",
];
const DECENAS = ["", "", "", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const CENTENAS = [
  "", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS",
  "OCHOCIENTOS", "NOVECIENTOS",
];

/** 0 a 999. `apocope` convierte «UNO» en «UN» y «VEINTIUNO» en «VEINTIÚN» (antes de un sustantivo). */
function hastaMil(n: number, apocope: boolean): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]!);
  if (resto >= 10 && resto < 30) {
    let w = DIEZ_A_VEINTINUEVE[resto - 10]!;
    if (apocope && resto === 21) w = "VEINTIÚN";
    partes.push(w);
  } else if (resto >= 30) {
    const d = Math.floor(resto / 10);
    const u = resto % 10;
    partes.push(u === 0 ? DECENAS[d]! : `${DECENAS[d]} Y ${apocope && u === 1 ? "UN" : UNIDADES[u]}`);
  } else if (resto > 0) {
    partes.push(apocope && resto === 1 ? "UN" : UNIDADES[resto]!);
  }
  return partes.join(" ");
}

/** 0 a 999.999. */
function hastaMillon(n: number, apocope: boolean): string {
  const miles = Math.floor(n / 1000);
  const resto = n % 1000;
  const partes: string[] = [];
  if (miles === 1) partes.push("MIL");
  else if (miles > 1) partes.push(`${hastaMil(miles, true)} MIL`);
  if (resto > 0) partes.push(hastaMil(resto, apocope));
  return partes.join(" ");
}

/** Número entero en letras, en mayúsculas, con apócope final («UN», «VEINTIÚN»). */
export function numeroALetras(n: number): string {
  validarEntero(n, "El valor");
  if (n > 999_999_999_999) throw new ErrorDominio("VALOR_INVALIDO", "El valor supera 999.999.999.999 pesos.");
  if (n === 0) return "CERO";
  const millones = Math.floor(n / 1_000_000);
  const resto = n % 1_000_000;
  const partes: string[] = [];
  if (millones === 1) partes.push("UN MILLÓN");
  else if (millones > 1) partes.push(`${hastaMillon(millones, true)} MILLONES`);
  if (resto > 0) partes.push(hastaMillon(resto, true));
  return partes.join(" ");
}

/** «CUATRO MILLONES SETECIENTOS SESENTA MIL PESOS M/CTE» · «UN MILLÓN DE PESOS M/CTE». */
export function valorEnLetras(n: number): string {
  const letras = numeroALetras(n);
  const millonesExactos = n >= 1_000_000 && n % 1_000_000 === 0;
  return `${letras} ${millonesExactos ? "DE " : ""}${n === 1 ? "PESO" : "PESOS"} M/CTE`;
}

// ——— Anticipo ———

export interface EntradaAmortizacion {
  valorContrato: number;
  anticipo: number;
  /** Valor ejecutado (bruto) en el acta de este periodo. */
  ejecutadoPeriodo: number;
  /** Anticipo ya amortizado en actas anteriores. */
  amortizadoAcumulado: number;
  /** Retenciones o descuentos adicionales del acta (garantía, multas aplicadas, etc.). */
  otrosDescuentos?: number;
}

export interface ResultadoAmortizacion {
  amortizacionPeriodo: number;
  amortizadoAcumulado: number;
  saldoPorAmortizar: number;
  netoAPagar: number;
}

/**
 * Amortización proporcional: cada acta descuenta `ejecutado × (anticipo / valor del contrato)`,
 * sin exceder el saldo pendiente. Se redondea al peso.
 */
export function amortizarAnticipo(e: EntradaAmortizacion): ResultadoAmortizacion {
  validarEntero(e.valorContrato, "El valor del contrato");
  validarEntero(e.anticipo, "El anticipo");
  validarEntero(e.ejecutadoPeriodo, "El valor ejecutado");
  validarEntero(e.amortizadoAcumulado, "El anticipo amortizado");
  if (e.valorContrato === 0) throw new ErrorDominio("VALOR_INVALIDO", "El valor del contrato no puede ser cero.");
  if (e.anticipo > e.valorContrato) throw new ErrorDominio("VALOR_INVALIDO", "El anticipo no puede superar el valor del contrato.");
  const saldoAntes = Math.max(0, e.anticipo - e.amortizadoAcumulado);
  const proporcional = Math.round((e.ejecutadoPeriodo * e.anticipo) / e.valorContrato);
  const amortizacionPeriodo = Math.min(proporcional, saldoAntes);
  const amortizadoAcumulado = e.amortizadoAcumulado + amortizacionPeriodo;
  return {
    amortizacionPeriodo,
    amortizadoAcumulado,
    saldoPorAmortizar: e.anticipo - amortizadoAcumulado,
    netoAPagar: e.ejecutadoPeriodo - amortizacionPeriodo - (e.otrosDescuentos ?? 0),
  };
}
