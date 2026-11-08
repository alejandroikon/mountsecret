/**
 * Plazo y cronograma del contrato.
 *
 * Calcula la fecha de terminación desde el acta de inicio y la recalcula con los
 * eventos contractuales (suspensiones, prórrogas, otrosíes y adiciones), aplicados
 * en orden cronológico.
 *
 * Convenciones de conteo (configurables por contrato, ver docs/plan.md, supuestos 5 y 12):
 *  - "inclusivo" (por defecto, la práctica usual en actas): el día del acta de inicio es el día 1.
 *     120 días desde el 3 feb → 2 jun. 6 meses desde el 1 feb → 31 jul.
 *  - "codigo_civil": el plazo corre desde el día siguiente y, en meses, termina el mismo
 *     número de día (C. C., art. 67). 6 meses desde el 1 feb → 1 ago.
 */
import { ErrorDominio } from "./errores";
import { type FechaISO, aNumeroDia, diferenciaDias, partes, sumarDias, sumarMeses } from "./fecha";
import { type Intervalo, type OpcionesHabiles, siguienteHabil, sumarDiasHabiles } from "./habiles";

export type UnidadPlazo = "dias" | "dias_habiles" | "meses";
export type Conteo = "inclusivo" | "codigo_civil";

export interface Plazo {
  cantidad: number;
  unidad: UnidadPlazo;
}

export type EventoContractual =
  | {
      id: string;
      tipo: "suspension";
      /** Primer día suspendido. */
      desde: FechaISO;
      /** Último día suspendido (el contrato se reanuda el día siguiente). */
      hasta: FechaISO;
    }
  | { id: string; tipo: "prorroga"; fecha: FechaISO; plazo: Plazo }
  | { id: string; tipo: "adicion"; fecha: FechaISO; valor: number }
  | {
      id: string;
      tipo: "otrosi";
      fecha: FechaISO;
      /** Si el otrosí fija una fecha de terminación explícita. */
      nuevaTerminacion?: FechaISO;
      /** Si el otrosí cambia el valor (positivo suma, negativo resta). */
      cambioValor?: number;
    };

export interface DatosContrato {
  actaInicio: FechaISO;
  plazo: Plazo;
  valorInicial: number;
  conteo?: Conteo;
  sabadoHabil?: boolean;
}

export interface PasoCronograma {
  eventoId: string;
  tipo: EventoContractual["tipo"];
  fecha: FechaISO;
  terminacionAntes: FechaISO;
  terminacionDespues: FechaISO;
  valorAntes: number;
  valorDespues: number;
}

export interface Cronograma {
  inicio: FechaISO;
  terminacionInicial: FechaISO;
  terminacion: FechaISO;
  valorInicial: number;
  valor: number;
  suspensiones: Intervalo[];
  diasSuspendidos: number;
  historial: PasoCronograma[];
  /** Avisos que no bloquean, p. ej. adiciones que superan el 50 % del valor inicial. */
  advertencias: Advertencia[];
}

export interface Advertencia {
  codigo: "ADICION_SUPERA_50" | "PRORROGA_SOBRE_SUSPENSION";
  eventoId: string;
  mensaje: string;
}

function validarPlazo(plazo: Plazo): void {
  if (!Number.isInteger(plazo.cantidad) || plazo.cantidad <= 0) {
    throw new ErrorDominio("PLAZO_INVALIDO", `El plazo debe ser un entero positivo; recibí ${plazo.cantidad} ${plazo.unidad}.`);
  }
}

/** Fecha de terminación de un plazo que empieza en `inicio`. */
export function terminacionDesde(
  inicio: FechaISO,
  plazo: Plazo,
  conteo: Conteo = "inclusivo",
  opciones: OpcionesHabiles = {},
): FechaISO {
  validarPlazo(plazo);
  const ajuste = conteo === "inclusivo" ? -1 : 0;
  switch (plazo.unidad) {
    case "dias":
      return sumarDias(inicio, plazo.cantidad + ajuste);
    case "meses":
      return sumarDias(sumarMeses(inicio, plazo.cantidad), ajuste);
    case "dias_habiles":
      return conteo === "inclusivo"
        ? sumarDiasHabiles(siguienteHabil(inicio, opciones, true), plazo.cantidad - 1, opciones)
        : sumarDiasHabiles(inicio, plazo.cantidad, opciones);
  }
}

/**
 * Extiende una terminación vigente. Una prórroga de N días suma N días calendario
 * después de la terminación vigente; en meses, conserva el número de día.
 */
export function extenderTerminacion(terminacion: FechaISO, plazo: Plazo, opciones: OpcionesHabiles = {}): FechaISO {
  validarPlazo(plazo);
  switch (plazo.unidad) {
    case "dias":
      return sumarDias(terminacion, plazo.cantidad);
    case "meses":
      return sumarMeses(terminacion, plazo.cantidad);
    case "dias_habiles":
      return sumarDiasHabiles(terminacion, plazo.cantidad, opciones);
  }
}

function fechaEvento(e: EventoContractual): FechaISO {
  return e.tipo === "suspension" ? e.desde : e.fecha;
}

/** Calcula el cronograma vigente aplicando los eventos en orden cronológico. */
export function calcularCronograma(contrato: DatosContrato, eventos: readonly EventoContractual[] = []): Cronograma {
  partes(contrato.actaInicio);
  if (!Number.isFinite(contrato.valorInicial) || contrato.valorInicial < 0) {
    throw new ErrorDominio("VALOR_INVALIDO", "El valor inicial del contrato debe ser un número mayor o igual a cero.");
  }
  const conteo = contrato.conteo ?? "inclusivo";
  const suspensiones: Intervalo[] = [];
  const opciones = (): OpcionesHabiles => ({ sabadoHabil: contrato.sabadoHabil ?? false, excluir: suspensiones });

  const terminacionInicial = terminacionDesde(contrato.actaInicio, contrato.plazo, conteo, opciones());
  let terminacion = terminacionInicial;
  let valor = contrato.valorInicial;
  let adicionado = 0;
  const historial: PasoCronograma[] = [];
  const advertencias: Advertencia[] = [];

  // Orden estable: por fecha y, dentro de la misma fecha, en el orden recibido.
  const ordenados = eventos
    .map((e, i) => ({ e, i }))
    .sort((a, b) => aNumeroDia(fechaEvento(a.e)) - aNumeroDia(fechaEvento(b.e)) || a.i - b.i)
    .map((x) => x.e);

  for (const evento of ordenados) {
    const antes = terminacion;
    const valorAntes = valor;
    const fecha = fechaEvento(evento);

    if (fecha < contrato.actaInicio) {
      throw new ErrorDominio(
        "EVENTO_FUERA_DE_PLAZO",
        `El evento «${evento.id}» (${fecha}) es anterior al acta de inicio (${contrato.actaInicio}). Revisa la fecha.`,
      );
    }
    if (fecha > terminacion) {
      throw new ErrorDominio(
        "EVENTO_FUERA_DE_PLAZO",
        `El evento «${evento.id}» (${fecha}) ocurre después de la terminación vigente (${terminacion}). ` +
          "Una prórroga, suspensión u otrosí debe firmarse antes de que venza el plazo.",
      );
    }

    switch (evento.tipo) {
      case "suspension": {
        if (evento.hasta < evento.desde) {
          throw new ErrorDominio(
            "SUSPENSION_INVALIDA",
            `La suspensión «${evento.id}» termina (${evento.hasta}) antes de empezar (${evento.desde}).`,
          );
        }
        const choca = suspensiones.find((s) => evento.desde <= s.hasta && evento.hasta >= s.desde);
        if (choca) {
          throw new ErrorDominio(
            "SUSPENSIONES_SUPERPUESTAS",
            `La suspensión «${evento.id}» se cruza con otra (${choca.desde} a ${choca.hasta}). Une las dos en una sola acta o corrige las fechas.`,
          );
        }
        const dias = diferenciaDias(evento.desde, evento.hasta) + 1;
        suspensiones.push({ desde: evento.desde, hasta: evento.hasta });
        terminacion = sumarDias(terminacion, dias);
        break;
      }
      case "prorroga": {
        terminacion = extenderTerminacion(terminacion, evento.plazo, opciones());
        const enSuspension = suspensiones.some((s) => evento.fecha >= s.desde && evento.fecha <= s.hasta);
        if (enSuspension) {
          advertencias.push({
            codigo: "PRORROGA_SOBRE_SUSPENSION",
            eventoId: evento.id,
            mensaje: "La prórroga se firmó durante una suspensión. Verifica que el plazo sumado no duplique los días suspendidos.",
          });
        }
        break;
      }
      case "adicion": {
        valor += evento.valor;
        adicionado += evento.valor;
        break;
      }
      case "otrosi": {
        if (evento.nuevaTerminacion) {
          partes(evento.nuevaTerminacion);
          if (evento.nuevaTerminacion < evento.fecha) {
            throw new ErrorDominio(
              "EVENTO_FUERA_DE_PLAZO",
              `El otrosí «${evento.id}» fija una terminación (${evento.nuevaTerminacion}) anterior a su firma (${evento.fecha}).`,
            );
          }
          terminacion = evento.nuevaTerminacion;
        }
        if (evento.cambioValor) {
          valor += evento.cambioValor;
          if (evento.cambioValor > 0) adicionado += evento.cambioValor;
        }
        break;
      }
    }

    if ((evento.tipo === "adicion" || evento.tipo === "otrosi") && adicionado > contrato.valorInicial / 2) {
      // Ley 80 de 1993, art. 40, parágrafo: las adiciones no pueden superar el 50 % del valor inicial.
      if (!advertencias.some((a) => a.codigo === "ADICION_SUPERA_50")) {
        advertencias.push({
          codigo: "ADICION_SUPERA_50",
          eventoId: evento.id,
          mensaje:
            "Las adiciones suman más del 50 % del valor inicial. En contratos estatales eso supera el tope del art. 40 de la Ley 80 de 1993.",
        });
      }
    }

    historial.push({
      eventoId: evento.id,
      tipo: evento.tipo,
      fecha,
      terminacionAntes: antes,
      terminacionDespues: terminacion,
      valorAntes,
      valorDespues: valor,
    });
  }

  return {
    inicio: contrato.actaInicio,
    terminacionInicial,
    terminacion,
    valorInicial: contrato.valorInicial,
    valor,
    suspensiones,
    diasSuspendidos: suspensiones.reduce((t, s) => t + diferenciaDias(s.desde, s.hasta) + 1, 0),
    historial,
    advertencias,
  };
}

export type EstadoContrato = "por_iniciar" | "en_ejecucion" | "suspendido" | "terminado";

export function estadoEnFecha(cronograma: Cronograma, fecha: FechaISO): EstadoContrato {
  if (fecha < cronograma.inicio) return "por_iniciar";
  if (fecha > cronograma.terminacion) return "terminado";
  if (cronograma.suspensiones.some((s) => fecha >= s.desde && fecha <= s.hasta)) return "suspendido";
  return "en_ejecucion";
}

/** Avance de tiempo (0 a 1), sin contar los días suspendidos. */
export function avanceTiempo(cronograma: Cronograma, fecha: FechaISO): number {
  const total = diferenciaDias(cronograma.inicio, cronograma.terminacion) + 1 - cronograma.diasSuspendidos;
  if (fecha < cronograma.inicio) return 0;
  if (fecha >= cronograma.terminacion) return 1;
  const transcurridos = diferenciaDias(cronograma.inicio, fecha) + 1;
  const suspendidos = cronograma.suspensiones.reduce((t, s) => {
    if (fecha < s.desde) return t;
    const hasta = fecha < s.hasta ? fecha : s.hasta;
    return t + diferenciaDias(s.desde, hasta) + 1;
  }, 0);
  return total <= 0 ? 1 : Math.min(1, Math.max(0, (transcurridos - suspendidos) / total));
}
