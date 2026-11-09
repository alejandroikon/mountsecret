"use client";

/**
 * Lectura en vivo: el único momento orquestado del producto (design-system §7).
 *
 * En la demo, los eventos reproducen lo que el Lector extrajo del contrato de ejemplo, en el
 * orden del documento. En producción llegan por SSE desde el agente; esta pantalla no cambia.
 */
import { type FechaISO, formatearPesos } from "@lc/dominio";
import { CheckCircle, FastForward } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Linea } from "@/components/Linea";
import { Logo } from "@/components/Logo";
import { FuenteChip } from "@/components/Paneles";
import { UMBRAL_CONFIANZA, cronogramaDe } from "@/lib/calculos";
import { fechaCorta } from "@/lib/formato";
import { contratoPorId } from "@/lib/semillas";
import { useApp } from "@/lib/store";
import { plural } from "@/lib/textos";
import type { Contrato, Fuente } from "@/lib/tipos";

type Hallazgo =
  | { tipo: "pagina"; clave: string; documentoId: string; pagina: number }
  | { tipo: "obligacion"; clave: string; titulo: string; fuente: Fuente; confianza: number }
  | { tipo: "pago"; clave: string; titulo: string; valor: number; fecha: FechaISO; fuente: Fuente }
  | { tipo: "poliza"; clave: string; titulo: string; fuente: Fuente }
  | { tipo: "fecha"; clave: string; titulo: string; fecha: FechaISO; fuente?: Fuente };

function guion(c: Contrato): { h: Hallazgo; ms: number }[] {
  const cr = cronogramaDe(c);
  const pasos: { h: Hallazgo; ms: number }[] = [];
  for (const doc of c.documentos) {
    for (const pag of doc.paginas) {
      pasos.push({ h: { tipo: "pagina", clave: `${doc.id}-${pag.numero}`, documentoId: doc.id, pagina: pag.numero }, ms: 650 });
      for (const b of pag.bloques) {
        const enBloque = (f: Fuente) => f.documentoId === doc.id && f.bloqueId === b.id;
        if (doc.id === c.documentos[0]!.id && b.clausula === "Cláusula 2") {
          pasos.push({
            h: { tipo: "fecha", clave: "plazo", titulo: "Termina (plazo inicial)", fecha: cr.terminacionInicial, fuente: { documentoId: doc.id, bloqueId: b.id, clausula: b.clausula, pagina: pag.numero } },
            ms: 500,
          });
        }
        for (const p of c.pagos.filter((x) => enBloque(x.fuente))) {
          pasos.push({
            h: { tipo: "pago", clave: p.id, titulo: p.periodo ? `Pago de ${p.etiqueta}` : `Pago: ${p.etiqueta}`, valor: p.valor, fecha: p.radicarAntes, fuente: p.fuente },
            ms: 220,
          });
        }
        for (const o of c.obligaciones.filter((x) => enBloque(x.fuente))) {
          pasos.push({ h: { tipo: "obligacion", clave: o.id, titulo: o.titulo, fuente: o.fuente, confianza: o.confianza }, ms: 480 });
        }
        for (const p of c.polizas.filter((x) => enBloque(x.fuente))) {
          pasos.push({ h: { tipo: "poliza", clave: p.id, titulo: `${p.amparo} · ${p.porcentaje}`, fuente: p.fuente }, ms: 300 });
        }
        for (const e of c.eventos.filter((x) => x.fuente && enBloque(x.fuente))) {
          const paso = cr.historial.find((h) => h.eventoId === e.id);
          if (paso) pasos.push({ h: { tipo: "fecha", clave: e.id, titulo: e.titulo, fecha: paso.terminacionDespues, ...(e.fuente ? { fuente: e.fuente } : {}) }, ms: 600 });
        }
      }
    }
  }
  return pasos;
}

function Grupo({ titulo, cuenta, children }: { titulo: string; cuenta: number; children: React.ReactNode }) {
  if (cuenta === 0) return null;
  return (
    <section className="mt-5">
      <h3 className="flex justify-between apoyo font-semibold">
        <span>{titulo}</span>
        <span className="num">{cuenta}</span>
      </h3>
      <ul className="mt-1">{children}</ul>
    </section>
  );
}

export function Lectura({ id }: { id: string }) {
  const contrato = contratoPorId(id);
  const { listo, contratos, despachar } = useApp();
  const router = useRouter();
  const reducir = useReducedMotion();
  const pasos = useMemo(() => (contrato ? guion(contrato) : []), [contrato]);
  const [n, setN] = useState(0);
  const inicio = useRef<number>(0);
  const [primera, setPrimera] = useState<number | null>(null);
  const [transcurrido, setTranscurrido] = useState(0);
  const [anuncio, setAnuncio] = useState("");
  const pendientesAnuncio = useRef<string[]>([]);

  useEffect(() => {
    if (listo && contrato && !contratos.some((c) => c.id === contrato.id)) despachar({ tipo: "cargarContrato", id: contrato.id });
  }, [listo, contrato, contratos, despachar]);

  // Avance del guion.
  useEffect(() => {
    if (!inicio.current) inicio.current = performance.now();
    if (n >= pasos.length) return;
    const t = setTimeout(() => setN((x) => x + 1), pasos[n]!.ms);
    return () => clearTimeout(t);
  }, [n, pasos]);

  useEffect(() => {
    const t = setInterval(() => setTranscurrido(Math.round((performance.now() - inicio.current) / 1000)), 500);
    return () => clearInterval(t);
  }, []);

  const vistos = pasos.slice(0, n).map((p) => p.h);
  const ultimo = vistos[vistos.length - 1];
  useEffect(() => {
    if (!ultimo) return;
    if (ultimo.tipo === "obligacion" && primera === null) setPrimera((performance.now() - inicio.current) / 1000);
    if (ultimo.tipo !== "pagina") pendientesAnuncio.current.push(ultimo.titulo);
  }, [ultimo, primera]);

  // Anuncios agrupados cada 3 s para lectores de pantalla.
  useEffect(() => {
    const t = setInterval(() => {
      const lista = pendientesAnuncio.current.splice(0);
      if (lista.length) setAnuncio(`Encontré ${lista.length}: ${lista.slice(0, 3).join("; ")}${lista.length > 3 ? "…" : ""}`);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  if (!contrato) {
    return (
      <main className="p-8">
        <p>No encontramos ese contrato. <Link className="enlace" href="/bienvenida/">Volver al inicio</Link></p>
      </main>
    );
  }

  const terminado = n >= pasos.length;
  const paginas = vistos.filter((h) => h.tipo === "pagina");
  const totalPaginas = pasos.filter((p) => p.h.tipo === "pagina").length;
  const obligaciones = vistos.filter((h): h is Extract<Hallazgo, { tipo: "obligacion" }> => h.tipo === "obligacion");
  const pagos = vistos.filter((h): h is Extract<Hallazgo, { tipo: "pago" }> => h.tipo === "pago");
  const polizas = vistos.filter((h): h is Extract<Hallazgo, { tipo: "poliza" }> => h.tipo === "poliza");
  const fechas = vistos.filter((h): h is Extract<Hallazgo, { tipo: "fecha" }> => h.tipo === "fecha");
  const porRevisar = obligaciones.filter((o) => o.confianza < UMBRAL_CONFIANZA).length;
  const cr = cronogramaDe(contrato);

  const dibujadaHasta: FechaISO = [cr.inicio, ...pagos.map((p) => p.fecha), ...fechas.map((f) => f.fecha)].reduce((a, b) => (b > a ? b : a));
  const rombos = contrato.pagos.filter((p) => pagos.some((x) => x.clave === p.id)).map((pago) => ({ pago, estado: "pendiente" as const }));
  const paginaActual = paginas[paginas.length - 1];

  const entrar = reducir ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.22, ease: "easeOut" as const } };

  return (
    <main className="mx-auto min-h-dvh max-w-[1100px] px-5 py-6 md:px-10">
      <div className="flex items-center justify-between">
        <Logo tamano={28} />
        {!terminado ? (
          <button type="button" className="enlace flex items-center gap-1 text-texto-2" onClick={() => setN(pasos.length)}>
            <FastForward size={18} aria-hidden /> Ver todo de una vez
          </button>
        ) : null}
      </div>

      <p className="apoyo mt-6">{terminado ? "Terminé de leer" : "Leyendo tu contrato"}</p>
      <h1 className="titulo-1">{contrato.documentos[0]!.nombre}</h1>
      <p className="apoyo num">
        {plural(contrato.documentos.length, "documento", "documentos")} · {terminado ? `${totalPaginas} páginas leídas` : `vamos en la página ${paginas.length} de ${totalPaginas}`}
      </p>

      <div className="mt-5">
        <Linea contrato={contrato} rombos={rombos} dibujadaHasta={terminado ? undefined : dibujadaHasta} variante="compacta" />
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-[180px_1fr]">
        {/* Carril del documento */}
        <div aria-hidden className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {pasos
            .filter((p) => p.h.tipo === "pagina")
            .map(({ h }) => {
              const leida = paginas.some((p) => p.clave === h.clave);
              const actual = paginaActual?.clave === h.clave && !terminado;
              const doc = contrato.documentos.find((d) => h.tipo === "pagina" && d.id === h.documentoId);
              return (
                <div key={h.clave} className={`flex shrink-0 items-center gap-2 transition-opacity duration-200 ${leida ? "opacity-100" : "opacity-35"}`}>
                  <div className={`hoja relative h-14 w-11 shrink-0 overflow-hidden ${actual ? "outline-2 outline-marca" : ""}`}>
                    <div className="absolute inset-x-1.5 top-2 h-9 bg-[repeating-linear-gradient(#c9c0d3_0_2px,transparent_2px_6px)]" />
                    {actual && !reducir ? <motion.div className="absolute inset-x-0 h-3 bg-resaltado" initial={{ top: 4 }} animate={{ top: 40 }} transition={{ duration: 0.6, repeat: Infinity }} /> : null}
                  </div>
                  <span className="hidden text-[0.8125rem] text-texto-2 md:block">
                    {doc?.nombre.replace(/\.pdf$/, "").slice(0, 18)}
                    <br />
                    pág. {h.tipo === "pagina" ? h.pagina : ""}
                  </span>
                </div>
              );
            })}
        </div>

        <div>
          <h2 className="titulo-2">Lo que voy encontrando</h2>
          <Grupo titulo="Fechas" cuenta={fechas.length}>
            <AnimatePresence initial={false}>
              {fechas.map((h) => (
                <motion.li key={h.clave} {...entrar} className="border-b border-borde py-2.5">
                  <b className="block font-semibold">
                    {h.titulo}: {fechaCorta(h.fecha)}
                  </b>
                  {h.fuente ? <FuenteChip contrato={contrato} fuente={h.fuente} /> : null}
                </motion.li>
              ))}
            </AnimatePresence>
          </Grupo>
          <Grupo titulo="Pagos" cuenta={pagos.length}>
            {(pagos.length > 4 ? pagos.slice(-3) : pagos).map((h) => (
              <motion.li key={h.clave} {...entrar} className="flex items-baseline justify-between gap-3 border-b border-borde py-2">
                <span className="font-semibold">{h.titulo.charAt(0).toUpperCase() + h.titulo.slice(1)}</span>
                <span className="num">{formatearPesos(h.valor)}</span>
              </motion.li>
            ))}
            {pagos.length > 4 ? (
              <li className="apoyo py-2">
                y {pagos.length - 3} pagos más · total {formatearPesos(pagos.reduce((t, p) => t + p.valor, 0))}
              </li>
            ) : null}
          </Grupo>
          <Grupo titulo="Obligaciones" cuenta={obligaciones.length}>
            {obligaciones.map((h) => (
              <motion.li key={h.clave} {...entrar} className="border-b border-borde py-2.5">
                <b className="block font-semibold">{h.titulo}</b>
                <FuenteChip contrato={contrato} fuente={h.fuente} />
                {h.confianza < UMBRAL_CONFIANZA ? <span className="apoyo"> · confianza baja, te la mostraré para revisar</span> : null}
              </motion.li>
            ))}
          </Grupo>
          <Grupo titulo="Pólizas" cuenta={polizas.length}>
            {polizas.map((h) => (
              <motion.li key={h.clave} {...entrar} className="border-b border-borde py-2.5">
                <b className="block font-semibold">{h.titulo}</b>
                <FuenteChip contrato={contrato} fuente={h.fuente} />
              </motion.li>
            ))}
          </Grupo>

          <p className="apoyo mt-5 num">
            {primera !== null ? `Primera obligación en ${primera.toFixed(1).replace(".", ",")} s · ` : ""}
            {transcurrido} s leyendo
          </p>

          {terminado ? (
            <div className="lamina mt-6 p-5">
              <p className="flex items-center gap-2 titulo-3">
                <CheckCircle size={24} weight="fill" className="text-cumplida" aria-hidden /> Listo
              </p>
              <p className="mt-1">
                Encontré {plural(obligaciones.length, "obligación", "obligaciones")}, {plural(pagos.length, "pago", "pagos")} y{" "}
                {plural(polizas.length, "póliza", "pólizas")}. {porRevisar > 0 ? `${plural(porRevisar, "necesita", "necesitan")} tu revisión.` : ""}
              </p>
              <button type="button" className="btn mt-4 w-full md:w-auto" onClick={() => router.push(`/revisar/${contrato.id}/`)}>
                Revisar lo encontrado
              </button>
            </div>
          ) : null}

          <p className="apoyo mt-6">
            Demo: esta lectura reproduce lo que el Lector extrajo de este contrato de ejemplo. Con tu propio contrato, cada hallazgo llega del agente en el
            momento en que lo encuentra.
          </p>
        </div>
      </div>
      <div aria-live="polite" className="sr-only">
        {anuncio}
      </div>
    </main>
  );
}
