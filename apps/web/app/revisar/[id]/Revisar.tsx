"use client";

/**
 * Validación de lo extraído: el humano decide. Confirmar, editar o descartar, una por una
 * (las de confianza baja primero) o en bloque para las de confianza alta.
 */
import { ArrowUUpLeft, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { FuenteChip } from "@/components/Paneles";
import { UMBRAL_CONFIANZA } from "@/lib/calculos";
import { contratoPorId } from "@/lib/semillas";
import { useApp } from "@/lib/store";
import { confianzaTexto, describirPeriodicidad, plural } from "@/lib/textos";

export function Revisar({ id }: { id: string }) {
  const contrato = contratoPorId(id);
  const { estado, despachar, listo, tituloDe } = useApp();
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState("");
  const tituloRef = useRef<HTMLHeadingElement>(null);

  const ordenadas = useMemo(
    () => (contrato ? [...contrato.obligaciones].sort((a, b) => a.confianza - b.confianza) : []),
    [contrato],
  );
  const pendientes = ordenadas.filter((o) => !estado.validacion[o.id]);
  const actual = pendientes[0];
  const altas = pendientes.filter((o) => o.confianza >= 0.9);
  const hechas = ordenadas.length - pendientes.length;

  useEffect(() => {
    setEditando(false);
    tituloRef.current?.focus();
  }, [actual?.id]);

  // Atajos: C confirmar, E editar, D descartar, Z deshacer.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (editando || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!actual) return;
      const k = e.key.toLowerCase();
      if (k === "c") despachar({ tipo: "validar", obId: actual.id, valor: "confirmada" });
      if (k === "d") despachar({ tipo: "validar", obId: actual.id, valor: "descartada" });
      if (k === "e") {
        e.preventDefault();
        setBorrador(tituloDe(actual));
        setEditando(true);
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [actual, editando, despachar, tituloDe]);

  if (!listo) return <div className="min-h-dvh" aria-busy="true" />;
  if (!contrato) {
    return (
      <main className="p-8">
        <Link className="enlace" href="/bienvenida/">Volver al inicio</Link>
      </main>
    );
  }

  const ultimaDecidida = ordenadas.filter((o) => estado.validacion[o.id]).at(-1);
  const terminar = () => {
    despachar({ tipo: "terminarValidacion", contratoId: contrato.id });
    router.push("/hoy/");
  };

  const bloque = actual
    ? contrato.documentos.find((d) => d.id === actual.fuente.documentoId)?.paginas.find((p) => p.numero === actual.fuente.pagina)?.bloques.find((b) => b.id === actual.fuente.bloqueId)
    : undefined;

  return (
    <main className="mx-auto min-h-dvh max-w-[640px] px-5 py-6">
      <div className="flex items-center justify-between">
        <Logo tamano={28} />
        <span className="apoyo num" aria-live="polite">
          {hechas} de {ordenadas.length}
        </span>
      </div>
      <p className="apoyo mt-6">{contrato.nombreCorto}</p>
      <h1 className="titulo-1">Revisa lo que encontré</h1>
      <div className="mt-3 flex gap-1" aria-hidden>
        {ordenadas.map((o) => (
          <i key={o.id} className={`h-1.5 flex-1 rounded-full ${estado.validacion[o.id] === "descartada" ? "bg-texto-2/40" : estado.validacion[o.id] ? "bg-cumplida" : "bg-borde"}`} />
        ))}
      </div>

      {actual ? (
        <section className="mt-6" aria-labelledby="ob-titulo">
          {actual.confianza < UMBRAL_CONFIANZA ? (
            <p className="mb-2 inline-flex rounded-full bg-riesgo-suave px-3 py-1 text-[0.9375rem] font-semibold text-riesgo">No estoy seguro de esta: revísala</p>
          ) : null}
          {editando ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (borrador.trim()) despachar({ tipo: "renombrar", obId: actual.id, titulo: borrador.trim() });
                despachar({ tipo: "validar", obId: actual.id, valor: "confirmada" });
              }}
            >
              <label htmlFor="titulo-edit" className="apoyo">
                Cómo quieres llamar esta obligación
              </label>
              <input
                id="titulo-edit"
                autoFocus
                value={borrador}
                onChange={(e) => setBorrador(e.target.value)}
                className="mt-1 w-full rounded-xl border border-borde bg-superficie px-4 py-3 text-[1.125rem] font-semibold"
              />
              <div className="mt-3 flex gap-2">
                <button className="btn">Guardar y confirmar</button>
                <button type="button" className="btn btn-sec" onClick={() => setEditando(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <h2 id="ob-titulo" ref={tituloRef} tabIndex={-1} className="titulo-2 text-[1.5rem] leading-tight">
              {tituloDe(actual)}
            </h2>
          )}

          {bloque ? (
            <blockquote className="hoja mt-4 px-5 py-4 font-cita text-[1.0625rem] leading-[1.7]">
              «{bloque.texto}»
              <FuenteChip contrato={contrato} fuente={actual.fuente} className="mt-2 block font-ui" />
            </blockquote>
          ) : null}

          <dl className="mt-4 grid grid-cols-[120px_1fr] gap-x-3 gap-y-2">
            <dt className="text-texto-2">Cuándo</dt>
            <dd>{describirPeriodicidad(actual.periodicidad)}</dd>
            <dt className="text-texto-2">Responsable</dt>
            <dd>
              <label className="sr-only" htmlFor="resp">
                Responsable
              </label>
              <select
                id="resp"
                value={estado.responsables[actual.id] ?? actual.responsableId ?? ""}
                onChange={(e) => despachar({ tipo: "asignar", obId: actual.id, personaId: e.target.value })}
                className="min-h-11 w-full rounded-lg border border-borde bg-superficie px-3"
              >
                <option value="">Sin asignar</option>
                {contrato.equipo.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} · {p.rol}
                  </option>
                ))}
              </select>
            </dd>
            <dt className="text-texto-2">Evidencia</dt>
            <dd>{actual.evidenciaEsperada}</dd>
            <dt className="text-texto-2">Confianza</dt>
            <dd>{confianzaTexto(actual.confianza)}</dd>
          </dl>

          {!editando ? (
            <div className="mt-6 grid gap-2">
              <button type="button" className="btn w-full" onClick={() => despachar({ tipo: "validar", obId: actual.id, valor: "confirmada" })}>
                Confirmar <kbd className="hidden md:inline text-[0.8125rem] opacity-70">C</kbd>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="btn btn-sec"
                  onClick={() => {
                    setBorrador(tituloDe(actual));
                    setEditando(true);
                  }}
                >
                  Editar <kbd className="hidden md:inline text-[0.8125rem] opacity-70">E</kbd>
                </button>
                <button type="button" className="btn btn-sec" onClick={() => despachar({ tipo: "validar", obId: actual.id, valor: "descartada" })}>
                  Descartar <kbd className="hidden md:inline text-[0.8125rem] opacity-70">D</kbd>
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            {altas.length > 1 ? (
              <button type="button" className="enlace" onClick={() => despachar({ tipo: "validarVarias", obIds: altas.map((o) => o.id) })}>
                Confirmar las {altas.length} de confianza alta
              </button>
            ) : (
              <span />
            )}
            {ultimaDecidida ? (
              <button type="button" className="enlace flex items-center gap-1 text-texto-2" onClick={() => despachar({ tipo: "validar", obId: ultimaDecidida.id, valor: null })}>
                <ArrowUUpLeft size={16} aria-hidden /> Deshacer
              </button>
            ) : null}
          </div>
        </section>
      ) : (
        <section className="lamina mt-8 p-6 text-center">
          <CheckCircle size={44} weight="fill" className="mx-auto text-cumplida" aria-hidden />
          <h2 className="titulo-2 mt-2">Tu contrato ya es un gemelo digital</h2>
          <p className="mt-1 text-texto-2">
            {plural(ordenadas.filter((o) => estado.validacion[o.id] === "confirmada").length, "obligación confirmada", "obligaciones confirmadas")}. Desde ahora
            te avisamos antes de cada vencimiento y armamos cada cobro.
          </p>
          <button type="button" className="btn mt-5 w-full" onClick={terminar}>
            Ver qué hacer hoy
          </button>
        </section>
      )}
    </main>
  );
}
