import type { DiaSemana, EventoContractual, FechaISO, Plazo, ReglaMensual } from "@lc/dominio";

export type TipoContrato = "obra" | "prestacion_servicios" | "consultoria" | "suministro" | "software";

export interface Bloque {
  id: string;
  /** «Cláusula 6.1», «Anexo técnico 3.4»… */
  clausula?: string;
  titulo?: string;
  texto: string;
}

export interface Pagina {
  numero: number;
  bloques: Bloque[];
}

export interface Documento {
  id: string;
  nombre: string;
  tipo: "contrato" | "anexo" | "pliego" | "otrosi" | "acta";
  paginas: Pagina[];
}

export interface Fuente {
  documentoId: string;
  bloqueId: string;
  clausula: string;
  pagina: number;
}

export type Periodicidad =
  | { tipo: "mensual"; regla: ReglaMensual }
  | { tipo: "semanal"; dia: DiaSemana }
  | { tipo: "quincenal"; dia: DiaSemana }
  | { tipo: "unica"; fecha: FechaISO }
  | { tipo: "continua" }
  | { tipo: "por_evento"; descripcion: string };

export interface Obligacion {
  id: string;
  titulo: string;
  categoria: "general" | "especifica" | "tecnica" | "transversal";
  fuente: Fuente;
  periodicidad: Periodicidad;
  responsableId?: string;
  /** Confianza del Lector (0 a 1). Por debajo del umbral va a «Por revisar». */
  confianza: number;
  /** Qué tipo de evidencia la acredita, en lenguaje del usuario. */
  evidenciaEsperada: string;
  /** Texto de la acción principal («Subir planilla»). */
  accion: string;
}

export interface Requisito {
  id: string;
  nombre: string;
  /** Si lo cumple una obligación propia, su id. Si no, lo hace el contratante. */
  obligacionId?: string;
  externo?: { quien: string; accion: string };
}

export interface Pago {
  id: string;
  numero: number;
  etiqueta: string;
  /** Mes del periodo, «2026-10». Para el anticipo o la liquidación, `null`. */
  periodo: string | null;
  valor: number;
  /** Fecha límite para radicar. */
  radicarAntes: FechaISO;
  requisitos: Requisito[];
  fuente: Fuente;
}

export interface Poliza {
  id: string;
  amparo: string;
  porcentaje: string;
  vigencia: string;
  /** Vigencia requerida (ya con prórrogas). */
  vigenciaHasta: FechaISO;
  fuente: Fuente;
  /** Si un evento exige ampliarla, la obligación que lo acredita. */
  obligacionAmpliacionId?: string;
}

export interface Persona {
  id: string;
  nombre: string;
  rol: string;
  correo: string;
}

export interface Contrato {
  id: string;
  codigo: string;
  nombreCorto: string;
  objeto: string;
  tipo: TipoContrato;
  contratante: string;
  contratista: string;
  valorInicial: number;
  actaInicio: FechaISO;
  plazo: Plazo;
  sabadoHabil: boolean;
  eventos: (EventoContractual & { titulo: string; fuente?: Fuente })[];
  documentos: Documento[];
  obligaciones: Obligacion[];
  pagos: Pago[];
  polizas: Poliza[];
  equipo: Persona[];
}

export type EstadoEvidencia = "en_verificacion" | "aceptada" | "rechazada";

export interface Evidencia {
  id: string;
  obligacionId: string;
  /** Vencimiento al que corresponde (una obligación periódica tiene una evidencia por vencimiento). */
  vence: FechaISO;
  nombre: string;
  subidaEl: string;
  estado: EstadoEvidencia;
  motivo?: string;
  /** Subida sin conexión, esperando sincronizar. */
  pendienteSync?: boolean;
}
