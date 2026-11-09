"use client";

/**
 * La Línea del contrato: el componente insignia (design-system §5).
 * Del acta de inicio a la terminación vigente. El tramo recorrido lleva el gradiente de marca;
 * el futuro va punteado; los pagos son rombos con su estado; las suspensiones, franjas rayadas;
 * las prórrogas, el tramo final. El SVG es decorativo: debajo hay una lista equivalente.
 */
import { type FechaISO, diferenciaDias, formatearPesos, formatearPesosCorto } from "@lc/dominio";
import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cronogramaDe } from "@/lib/calculos";
import { fechaCorta, nombreMes } from "@/lib/formato";
import type { Contrato, Pago } from "@/lib/tipos";

export type EstadoRombo = "pagado" | "listo" | "en_riesgo" | "vencida" | "pendiente";

export interface RomboPago {
  pago: Pago;
  estado: EstadoRombo;
}

interface Props {
  contrato: Contrato;
  rombos: RomboPago[];
  hoy?: FechaISO;
  variante?: "compacta" | "ampliada";
  /** Durante la lectura en vivo: la Línea solo llega hasta aquí. */
  dibujadaHasta?: FechaISO;
  destacarPagoId?: string;
  onPago?: (pago: Pago) => void;
}

const COLOR: Record<EstadoRombo, string> = {
  pagado: "var(--c-cumplida)",
  listo: "var(--c-cumplida)",
  en_riesgo: "var(--c-riesgo)",
  vencida: "var(--c-vencida)",
  pendiente: "var(--c-texto-2)",
};

const TEXTO: Record<EstadoRombo, string> = {
  pagado: "pagado",
  listo: "listo para radicar",
  en_riesgo: "en riesgo",
  vencida: "con requisitos vencidos",
  pendiente: "pendiente",
};

export function Linea({ contrato, rombos, hoy, variante = "compacta", dibujadaHasta, destacarPagoId, onPago }: Props) {
  const id = useId().replace(/:/g, "");
  const reducir = useReducedMotion();
  const cr = cronogramaDe(contrato);
  const total = Math.max(1, diferenciaDias(cr.inicio, cr.terminacion));
  const ampliada = variante === "ampliada";
  const W = ampliada ? Math.max(720, Math.round(total * 2.6)) : 340;
  const H = ampliada ? 132 : 64;
  const PAD = 12;
  const y = ampliada ? 62 : 26;
  const x = (f: FechaISO) => PAD + (Math.min(Math.max(diferenciaDias(cr.inicio, f), 0), total) / total) * (W - 2 * PAD);

  const hasta = dibujadaHasta ?? cr.terminacion;
  const xHasta = x(hasta);
  const xHoy = hoy && !dibujadaHasta ? x(hoy) : null;
  const xRecorrido = xHoy ?? (dibujadaHasta ? xHasta : PAD);
  const prorroga = contrato.eventos.find((e) => e.tipo === "prorroga");
  const pasoProrroga = prorroga ? cr.historial.find((h) => h.eventoId === prorroga.id) : undefined;

  const transicion = reducir ? { duration: 0 } : { duration: 0.4, ease: "easeOut" as const };
  const visibles = rombos.filter((r) => r.pago.radicarAntes <= hasta || dibujadaHasta === undefined);

  return (
    <div className={ampliada ? "overflow-x-auto pb-2 -mx-1 px-1" : ""}>
      <svg viewBox={`0 0 ${W} ${H}`} width={ampliada ? W : "100%"} height={ampliada ? H : undefined} aria-hidden className="block">
        <defs>
          <linearGradient id={`g-${id}`} gradientUnits="userSpaceOnUse" x1={PAD} x2={Math.max(xRecorrido, PAD + 1)}>
            <stop offset="0" stopColor="var(--c-marca)" />
            <stop offset="1" stopColor="var(--c-marca-2)" />
          </linearGradient>
          <pattern id={`r-${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="3" height="6" fill="var(--c-texto-2)" opacity="0.35" />
          </pattern>
        </defs>

        {/* Suspensiones */}
        {cr.suspensiones
          .filter((s) => s.desde <= hasta)
          .map((s) => (
            <g key={s.desde}>
              <rect x={x(s.desde)} y={y + 9} width={Math.max(3, x(s.hasta) - x(s.desde))} height={ampliada ? 12 : 7} fill={`url(#r-${id})`} rx="2" />
              {ampliada ? (
                <text x={x(s.desde)} y={y + 46} fontSize="13" fill="var(--c-texto-2)" className="font-ui">
                  Suspensión {diferenciaDias(s.desde, s.hasta) + 1} d
                </text>
              ) : null}
            </g>
          ))}

        {/* Futuro (punteado) */}
        <motion.line
          x1={PAD}
          y1={y}
          y2={y}
          initial={false}
          animate={{ x2: xHasta }}
          transition={transicion}
          stroke="var(--c-texto-2)"
          strokeWidth="3"
          strokeDasharray="6 6"
          opacity="0.6"
        />
        {/* Recorrido (gradiente de marca) */}
        <motion.line
          x1={PAD}
          y1={y}
          y2={y}
          initial={false}
          animate={{ x2: Math.max(PAD, xRecorrido) }}
          transition={transicion}
          stroke={`url(#g-${id})`}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx={PAD} cy={y} r="5" fill="var(--c-marca)" />
        {!dibujadaHasta ? <circle cx={W - PAD} cy={y} r="5" fill="var(--c-fondo)" stroke="var(--c-texto)" strokeWidth="2.5" /> : null}
        {dibujadaHasta ? (
          <circle cx={xHasta} cy={y} r="5" fill="var(--c-marca-2)">
            {!reducir ? <animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite" /> : null}
          </circle>
        ) : null}

        {/* Prórroga */}
        {ampliada && pasoProrroga && !dibujadaHasta ? (
          <g>
            <line x1={x(pasoProrroga.terminacionAntes)} x2={x(pasoProrroga.terminacionAntes)} y1={y - 8} y2={y + 8} stroke="var(--c-texto-2)" strokeWidth="1.5" />
            <text x={W - PAD} y={y + 46} textAnchor="end" fontSize="13" fill="var(--c-texto-2)">
              {prorroga?.titulo.split(":")[0]} · +{diferenciaDias(pasoProrroga.terminacionAntes, pasoProrroga.terminacionDespues)} d
            </text>
          </g>
        ) : null}

        {/* Pagos */}
        {visibles.map(({ pago, estado }, i) => {
          const px = x(pago.radicarAntes);
          const c = COLOR[estado];
          const lleno = estado === "pagado" || estado === "listo";
          const destacado = destacarPagoId === pago.id;
          // En la vista ampliada, se omite la etiqueta si choca con la anterior (salvo la destacada).
          const anterior = i > 0 ? x(visibles[i - 1]!.pago.radicarAntes) : -Infinity;
          const holgura = px - anterior >= 58;
          const mostrarMonto = destacado || (ampliada && holgura);
          return (
            <g key={pago.id}>
              <motion.polygon
                points={`${px},${y - 8} ${px + 8},${y} ${px},${y + 8} ${px - 8},${y}`}
                fill={lleno ? c : "var(--c-fondo)"}
                stroke={c}
                strokeWidth="2.5"
                strokeLinejoin="round"
                initial={dibujadaHasta && !reducir ? { opacity: 0, scale: 0.4 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={transicion}
                style={{ transformOrigin: `${px}px ${y}px`, transformBox: "view-box" }}
              />
              {mostrarMonto ? (
                <text x={px} y={y - 14} textAnchor="middle" fontSize="13" fontWeight="600" fill={estado === "pendiente" ? "var(--c-texto-2)" : c}>
                  {estado === "en_riesgo" || estado === "vencida" ? "⚠ " : ""}
                  {formatearPesosCorto(pago.valor)}
                </text>
              ) : null}
              {ampliada && holgura ? (
                <text x={px} y={y + 26} textAnchor="middle" fontSize="12" fill="var(--c-texto-2)">
                  {pago.periodo ? nombreMes(pago.periodo).slice(0, 3) : pago.etiqueta.slice(0, 8)}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Hoy */}
        {xHoy !== null && hoy && hoy >= cr.inicio && hoy <= cr.terminacion ? (
          <g>
            <line x1={xHoy} x2={xHoy} y1={ampliada ? 22 : 6} y2={y + 14} stroke="var(--c-marca)" strokeWidth="2.5" />
            <text x={xHoy - 4} y={ampliada ? 16 : y + 30} textAnchor={ampliada ? "middle" : "end"} fontSize="13" fontWeight="600" fill="var(--c-marca)">
              Hoy
            </text>
          </g>
        ) : null}

        {!ampliada && !dibujadaHasta ? (
          <text x={W - PAD} y={y + 30} textAnchor="end" fontSize="13" fill="var(--c-texto-2)">
            {fechaCorta(cr.terminacion)}
          </text>
        ) : null}
        {ampliada ? (
          <>
            <text x={PAD} y={H - 6} fontSize="13" fill="var(--c-texto-2)">
              Inicio {fechaCorta(cr.inicio)}
            </text>
            <text x={W - PAD} y={H - 6} textAnchor="end" fontSize="13" fill="var(--c-texto-2)">
              Termina {fechaCorta(cr.terminacion)}
            </text>
          </>
        ) : null}
      </svg>

      {/* Equivalente accesible */}
      <ol className="sr-only">
        <li>Acta de inicio: {fechaCorta(cr.inicio)}.</li>
        {rombos.map(({ pago, estado }) => (
          <li key={pago.id}>
            {pago.etiqueta.charAt(0).toUpperCase() + pago.etiqueta.slice(1)}, radicar antes del {fechaCorta(pago.radicarAntes)},{" "}
            {formatearPesos(pago.valor)}, {TEXTO[estado]}.
          </li>
        ))}
        <li>Terminación vigente: {fechaCorta(cr.terminacion)}.</li>
      </ol>
      {onPago && ampliada ? (
        <div className="mt-2 flex flex-wrap gap-2" aria-label="Pagos del contrato">
          {rombos
            .filter((r) => r.estado !== "pagado")
            .slice(0, 4)
            .map(({ pago, estado }) => (
              <button
                key={pago.id}
                type="button"
                onClick={() => onPago(pago)}
                className="lamina px-3 py-1.5 text-[0.9375rem] font-semibold hover:border-texto-2"
                style={{ color: estado === "pendiente" ? undefined : COLOR[estado] }}
              >
                Cobro de {pago.periodo ? nombreMes(pago.periodo) : pago.etiqueta} · {formatearPesosCorto(pago.valor)}
              </button>
            ))}
        </div>
      ) : null}
    </div>
  );
}
