"use client";

import type { FechaISO } from "@lc/dominio";
import { CloudSlash } from "@phosphor-icons/react";
import type { EstadoUI, SituacionOb } from "@/lib/calculos";
import { relativa } from "@/lib/formato";
import { useApp } from "@/lib/store";
import type { Contrato, Obligacion } from "@/lib/tipos";
import { EstadoChip, colorRail } from "./Estado";
import { FuenteChip, usePaneles } from "./Paneles";

export function detalleEstado(s: SituacionOb, hoy: FechaISO): string | undefined {
  if (!s.vence) return undefined;
  if (s.estado === "terminada" || s.estado === "cumplida") return "evidencia aceptada";
  if (s.estado === "vencida") return `venció ${relativa(s.vence, hoy)}`;
  if (s.estado === "en_verificacion") return "el Verificador la está revisando";
  return `vence ${relativa(s.vence, hoy)}`;
}

/** Tarjeta de tarea: estado (ícono + texto), qué, de dónde sale y UNA acción. */
export function Tarea({
  contrato,
  obligacion,
  situacion,
  mostrarContrato,
}: {
  contrato: Contrato;
  obligacion: Obligacion;
  situacion: SituacionOb;
  mostrarContrato?: boolean;
}) {
  const { hoy, tituloDe, responsableDe } = useApp();
  const { abrirSubida } = usePaneles();
  const estado: EstadoUI = situacion.estado;
  const rechazada = situacion.evidencia?.estado === "rechazada";
  const responsable = responsableDe(contrato, obligacion);
  return (
    <article className="tarea" style={{ ["--rail" as string]: colorRail(estado) }}>
      <EstadoChip estado={estado} detalle={detalleEstado(situacion, hoy)} />
      <h3 className="titulo-3 mt-1">{tituloDe(obligacion)}</h3>
      <p className="apoyo">
        <FuenteChip contrato={contrato} fuente={obligacion.fuente} />
        {mostrarContrato ? ` · ${contrato.nombreCorto}` : ""}
        {responsable ? ` · ${responsable}` : ""}
      </p>
      {rechazada ? <p className="mt-2 rounded-lg bg-vencida-suave px-3 py-2 text-vencida">{situacion.evidencia?.motivo}</p> : null}
      {situacion.evidencia?.pendienteSync ? (
        <p className="mt-2 flex items-center gap-2 apoyo">
          <CloudSlash size={18} aria-hidden /> Esperando señal para subirse.
        </p>
      ) : null}
      {estado !== "en_verificacion" ? (
        <button type="button" className="btn mt-3 w-full" onClick={() => abrirSubida(contrato, obligacion, situacion.vence)}>
          {rechazada ? "Subir otra vez" : obligacion.accion}
        </button>
      ) : null}
    </article>
  );
}
