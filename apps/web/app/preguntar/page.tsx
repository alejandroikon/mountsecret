"use client";

/**
 * Consulta. En la demo, responde a las preguntas frecuentes calculando sobre los datos del
 * contrato (no inventa nada) y cita la fuente. Con la clave de Claude, el agente Consulta
 * responde preguntas libres con las mismas reglas: toda afirmación con su fuente.
 */
import { diasHabilesEntre, formatearPesos } from "@lc/dominio";
import { PaperPlaneRight } from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";
import { EstadoChip } from "@/components/Estado";
import { FuenteChip } from "@/components/Paneles";
import { Pantalla } from "@/components/Shell";
import { cronogramaDe, itemsHoy, opcionesDe, proximoPago, requisitosDe, situacionDe } from "@/lib/calculos";
import { fechaCompleta, fechaCorta, nombreMes, relativa } from "@/lib/formato";
import { useApp } from "@/lib/store";
import { plural } from "@/lib/textos";

type Clave = "cobro" | "termina" | "polizas" | "semana";

export default function Preguntar() {
  return (
    <Pantalla>
      <Chat />
    </Pantalla>
  );
}

function Chat() {
  const { contratos, estado, hoy } = useApp();
  const [hilo, setHilo] = useState<{ pregunta: string; clave: Clave | null }[]>([]);
  const [texto, setTexto] = useState("");
  const primero = contratos[0]!;
  const pago = proximoPago(primero, estado.evidencias, estado.externos, estado.pagados, hoy);

  const SUGERENCIAS: { clave: Clave; texto: string }[] = [
    { clave: "cobro", texto: `¿Qué me falta para cobrar ${pago?.periodo ? nombreMes(pago.periodo) : "el próximo pago"}?` },
    { clave: "semana", texto: "¿Qué vence esta semana?" },
    { clave: "termina", texto: "¿Cuándo termina el contrato?" },
    { clave: "polizas", texto: "¿Qué pólizas tengo que ampliar?" },
  ];

  const clasificar = (q: string): Clave | null => {
    const t = q.toLowerCase();
    if (/cobr|pag|falta|plata/.test(t)) return "cobro";
    if (/termin|plazo|prórroga|prorroga|vence el contrato|acaba/.test(t)) return "termina";
    if (/póliza|poliza|garant|amparo/.test(t)) return "polizas";
    if (/semana|vence|hoy|pendiente/.test(t)) return "semana";
    return null;
  };

  const preguntar = (q: string, clave?: Clave) => {
    if (!q.trim()) return;
    setHilo((h) => [...h, { pregunta: q, clave: clave ?? clasificar(q) }]);
    setTexto("");
  };

  return (
    <div className="max-w-[720px]">
      <h1 className="titulo-1">Pregúntale a tu contrato</h1>
      <p className="apoyo">Cada respuesta dice de dónde sale. Si algo no tiene soporte en el contrato, te lo digo.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {SUGERENCIAS.map((s) => (
          <button key={s.clave} type="button" className="lamina px-4 py-2 text-left font-semibold hover:border-texto-2" onClick={() => preguntar(s.texto, s.clave)}>
            {s.texto}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5" aria-live="polite">
        {hilo.map((m, i) => (
          <div key={i}>
            <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-accion px-4 py-2 text-accion-texto">{m.pregunta}</p>
            <div className="mt-3 lamina p-4">{m.clave ? <Respuesta clave={m.clave} /> : <SinRespuesta />}</div>
          </div>
        ))}
      </div>

      <form
        className="sticky bottom-24 mt-6 flex gap-2 md:bottom-6"
        onSubmit={(e) => {
          e.preventDefault();
          preguntar(texto);
        }}
      >
        <label htmlFor="pregunta" className="sr-only">
          Tu pregunta
        </label>
        <input
          id="pregunta"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe tu pregunta"
          className="min-h-13 flex-1 rounded-full border border-borde bg-superficie px-5"
        />
        <button className="btn aspect-square px-0" aria-label="Preguntar">
          <PaperPlaneRight size={22} weight="fill" aria-hidden />
        </button>
      </form>
    </div>
  );
}

function SinRespuesta() {
  return (
    <p>
      En esta demo respondo las preguntas sugeridas, calculando sobre tus contratos. Las preguntas libres las responde el agente Consulta cuando conectemos
      la clave de Claude.
    </p>
  );
}

function Respuesta({ clave }: { clave: Clave }) {
  const { contratos, estado, hoy, estaConfirmada, tituloDe } = useApp();
  const bloques: ReactNode[] = [];

  for (const c of contratos) {
    const encabezado = contratos.length > 1 ? <p className="apoyo font-semibold">{c.nombreCorto}</p> : null;
    if (clave === "cobro") {
      const pago = proximoPago(c, estado.evidencias, estado.externos, estado.pagados, hoy);
      if (!pago) continue;
      const faltan = requisitosDe(pago, c, estado.evidencias, estado.externos, hoy).filter((r) => !r.listo);
      bloques.push(
        <div key={c.id}>
          {encabezado}
          <p>
            Para el cobro de {pago.periodo ? nombreMes(pago.periodo) : pago.etiqueta} ({formatearPesos(pago.valor)}, radicar a más tardar el{" "}
            {fechaCorta(pago.radicarAntes)}) {faltan.length === 0 ? "ya tienes todo." : `te ${faltan.length === 1 ? "falta" : "faltan"}:`}
          </p>
          <ul className="mt-2 grid gap-2">
            {faltan.map((r) => (
              <li key={r.requisito.id} className="border-l-2 border-borde pl-3">
                <span className="font-semibold">{r.requisito.nombre}</span>
                {r.requisito.externo ? <span className="apoyo block">Lo da {r.requisito.externo.quien}.</span> : null}
                {r.obligacion ? <FuenteChip contrato={c} fuente={r.obligacion.fuente} className="block" /> : null}
              </li>
            ))}
          </ul>
          <p className="apoyo mt-2">
            La forma de pago sale de <FuenteChip contrato={c} fuente={pago.fuente} />.
          </p>
        </div>,
      );
    }
    if (clave === "termina") {
      const cr = cronogramaDe(c);
      bloques.push(
        <div key={c.id}>
          {encabezado}
          <p>
            Termina el <strong>{fechaCompleta(cr.terminacion)}</strong>.{" "}
            {cr.historial.length
              ? `Empezó a correr el ${fechaCorta(cr.inicio)} y se movió ${plural(cr.historial.length, "vez", "veces")}:`
              : `Son ${c.plazo.cantidad} ${c.plazo.unidad === "meses" ? "meses" : "días"} desde el acta de inicio (${fechaCorta(cr.inicio)}), sin prórrogas ni suspensiones.`}
          </p>
          <ul className="mt-2 grid gap-1">
            {cr.historial.map((h) => {
              const ev = c.eventos.find((e) => e.id === h.eventoId)!;
              return (
                <li key={h.eventoId}>
                  {ev.titulo}: {fechaCorta(h.terminacionAntes)} → {fechaCorta(h.terminacionDespues)}. {ev.fuente ? <FuenteChip contrato={c} fuente={ev.fuente} /> : null}
                </li>
              );
            })}
          </ul>
        </div>,
      );
    }
    if (clave === "polizas") {
      const porAmpliar = c.polizas.filter((p) => {
        const ob = p.obligacionAmpliacionId ? c.obligaciones.find((o) => o.id === p.obligacionAmpliacionId) : undefined;
        if (!ob) return false;
        const s = situacionDe(ob, c, estado.evidencias, hoy);
        return s.estado !== "terminada" && s.estado !== "cumplida";
      });
      bloques.push(
        <div key={c.id}>
          {encabezado}
          {porAmpliar.length === 0 ? (
            <p>Ninguna. Todas las pólizas cubren la vigencia que exige el contrato.</p>
          ) : (
            <>
              <p>Tienes que ampliar {plural(porAmpliar.length, "póliza", "pólizas")}:</p>
              <ul className="mt-2 grid gap-1">
                {porAmpliar.map((p) => {
                  const ob = c.obligaciones.find((o) => o.id === p.obligacionAmpliacionId)!;
                  return (
                    <li key={p.id}>
                      <span className="font-semibold">{p.amparo}</span>, hasta el {fechaCorta(p.vigenciaHasta)}. Lo exige <FuenteChip contrato={c} fuente={ob.fuente} />.
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>,
      );
    }
    if (clave === "semana") {
      const items = itemsHoy([c], estaConfirmada, estado.evidencias, estado.externos, estado.pagados, hoy).filter(
        (i) => i.situacion.estado === "vencida" || (i.situacion.vence && diasHabilesEntre(hoy, i.situacion.vence, opcionesDe(c)) <= 5),
      );
      bloques.push(
        <div key={c.id}>
          {encabezado}
          {items.length === 0 ? (
            <p>Nada vence esta semana.</p>
          ) : (
            <ul className="grid gap-2">
              {items.map((i) => (
                <li key={i.obligacion.id}>
                  <EstadoChip estado={i.situacion.estado} detalle={i.situacion.vence ? relativa(i.situacion.vence, hoy) : undefined} />
                  <span className="block font-semibold">{tituloDe(i.obligacion)}</span>
                  <FuenteChip contrato={c} fuente={i.obligacion.fuente} />
                </li>
              ))}
            </ul>
          )}
        </div>,
      );
    }
  }
  return <div className="grid gap-4">{bloques}</div>;
}
