/**
 * Error de dominio con un código estable (para i18n y para la UI) y un mensaje
 * que dice qué pasó y cómo arreglarlo.
 */
export type CodigoError =
  | "FECHA_INVALIDA"
  | "PLAZO_INVALIDO"
  | "EVENTO_FUERA_DE_PLAZO"
  | "SUSPENSION_INVALIDA"
  | "SUSPENSIONES_SUPERPUESTAS"
  | "VALOR_INVALIDO";

export class ErrorDominio extends Error {
  override readonly name = "ErrorDominio";
  constructor(
    readonly codigo: CodigoError,
    mensaje: string,
  ) {
    super(mensaje);
  }
}
