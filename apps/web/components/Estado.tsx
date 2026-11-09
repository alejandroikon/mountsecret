"use client";

import { CheckCircle, CircleDashed, HourglassMedium, Infinity as Infinito, Warning, WarningOctagon } from "@phosphor-icons/react";
import type { EstadoUI } from "@/lib/calculos";

const CONFIG: Record<EstadoUI, { Icono: typeof Warning; texto: string; color: string; peso?: "fill" | "regular" }> = {
  cumplida: { Icono: CheckCircle, texto: "Cumplida", color: "text-cumplida", peso: "fill" },
  terminada: { Icono: CheckCircle, texto: "Al día", color: "text-cumplida", peso: "fill" },
  en_riesgo: { Icono: Warning, texto: "En riesgo", color: "text-riesgo", peso: "fill" },
  vencida: { Icono: WarningOctagon, texto: "Vencida", color: "text-vencida", peso: "fill" },
  pendiente: { Icono: CircleDashed, texto: "Pendiente", color: "text-texto-2" },
  en_verificacion: { Icono: HourglassMedium, texto: "En verificación", color: "text-texto-2" },
  permanente: { Icono: Infinito, texto: "Permanente", color: "text-texto-2" },
};

/** Estado del semáforo: siempre ícono (con forma distinta) + texto, nunca solo color. */
export function EstadoChip({ estado, detalle, className = "" }: { estado: EstadoUI; detalle?: string | undefined; className?: string }) {
  const { Icono, texto, color, peso } = CONFIG[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold text-[0.9375rem] ${color} ${className}`}>
      <Icono size={18} weight={peso ?? "regular"} aria-hidden className="shrink-0" />
      <span>
        {texto}
        {detalle ? <span className="font-normal"> · {detalle}</span> : null}
      </span>
    </span>
  );
}

export function colorRail(estado: EstadoUI): string {
  switch (estado) {
    case "vencida":
      return "var(--c-vencida)";
    case "en_riesgo":
      return "var(--c-riesgo)";
    case "cumplida":
    case "terminada":
      return "var(--c-cumplida)";
    default:
      return "var(--c-texto-2)";
  }
}
