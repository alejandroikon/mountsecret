"use client";

/**
 * Paneles globales: el visor de la fuente (la cláusula resaltada en su página) y la
 * subida de evidencias (con cola sin conexión y verificación).
 */
import { type FechaISO } from "@lc/dominio";
import { Camera, CloudSlash, FileText, UploadSimple } from "@phosphor-icons/react";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { fechaCorta, nombreMes } from "@/lib/formato";
import { useApp } from "@/lib/store";
import type { Contrato, Evidencia, Fuente, Obligacion } from "@/lib/tipos";
import { Panel } from "./Hoja";

interface Ctx {
  abrirFuente: (contrato: Contrato, fuente: Fuente) => void;
  abrirSubida: (contrato: Contrato, ob: Obligacion, vence?: FechaISO) => void;
}
const PanelesCtx = createContext<Ctx | null>(null);

export function usePaneles(): Ctx {
  const c = useContext(PanelesCtx);
  if (!c) throw new Error("usePaneles fuera de ProveedorPaneles");
  return c;
}

export function ProveedorPaneles({ children }: { children: ReactNode }) {
  const [fuente, setFuente] = useState<{ contrato: Contrato; fuente: Fuente } | null>(null);
  const [subida, setSubida] = useState<{ contrato: Contrato; ob: Obligacion; vence: FechaISO | undefined } | null>(null);
  useVerificador();

  const abrirFuente = useCallback((contrato: Contrato, f: Fuente) => setFuente({ contrato, fuente: f }), []);
  const abrirSubida = useCallback((contrato: Contrato, ob: Obligacion, vence?: FechaISO) => setSubida({ contrato, ob, vence }), []);

  return (
    <PanelesCtx.Provider value={{ abrirFuente, abrirSubida }}>
      {children}
      <Panel abierto={Boolean(fuente)} onCerrar={() => setFuente(null)} titulo="De dónde sale" ancho="lg">
        {fuente ? <VisorFuente contrato={fuente.contrato} fuente={fuente.fuente} /> : null}
      </Panel>
      <Panel abierto={Boolean(subida)} onCerrar={() => setSubida(null)} titulo="Subir evidencia">
        {subida ? <SubirEvidencia {...subida} onListo={() => setSubida(null)} /> : null}
      </Panel>
    </PanelesCtx.Provider>
  );
}

/** Chip de fuente: «Cláusula 6.1 · pág. 4». Al tocarlo abre el documento con el texto resaltado. */
export function FuenteChip({ contrato, fuente, className = "" }: { contrato: Contrato; fuente: Fuente; className?: string }) {
  const { abrirFuente } = usePaneles();
  return (
    <button
      type="button"
      onClick={() => abrirFuente(contrato, fuente)}
      className={`apoyo text-left underline decoration-borde underline-offset-[3px] hover:decoration-texto-2 min-h-6 ${className}`}
    >
      {fuente.clausula} · pág. {fuente.pagina}
    </button>
  );
}

function VisorFuente({ contrato, fuente }: { contrato: Contrato; fuente: Fuente }) {
  const doc = contrato.documentos.find((d) => d.id === fuente.documentoId);
  const pagina = doc?.paginas.find((p) => p.numero === fuente.pagina);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "center" });
  }, [fuente]);
  if (!doc || !pagina) return <p>No encontramos esa página en el documento. Revisa que el documento siga cargado.</p>;
  return (
    <div>
      <p className="apoyo mb-3 flex items-center gap-2">
        <FileText size={18} aria-hidden /> {doc.nombre} · página {pagina.numero}
      </p>
      <article className="hoja px-6 py-7 font-cita text-[1.0625rem] leading-[1.75]" aria-label={`Página ${pagina.numero}`}>
        {pagina.bloques.map((b) => {
          const activo = b.id === fuente.bloqueId;
          return (
            <div
              key={b.id}
              ref={activo ? ref : undefined}
              className={`mb-4 rounded-sm ${activo ? "bg-resaltado -mx-2 px-2 py-1 outline-2 outline-marca" : ""}`}
              {...(activo ? { "aria-current": "true" as const } : {})}
            >
              {b.titulo || b.clausula ? (
                <p className="font-ui font-semibold text-[0.9375rem] mb-1">
                  {b.clausula}
                  {b.clausula && b.titulo ? " · " : ""}
                  {b.titulo}
                </p>
              ) : null}
              <p>{b.texto}</p>
            </div>
          );
        })}
        <p className="font-ui text-[0.8125rem] text-[#5a4e66] text-right mt-6">Página {pagina.numero}</p>
      </article>
      <p className="apoyo mt-3">El resaltado es el texto exacto que leyó el Lector. Nada de esto está parafraseado.</p>
    </div>
  );
}

// ——— Evidencias ———

const DEMORA_VERIFICACION_MS = 2200;

/**
 * Verificador de la demo: acepta la evidencia tras un momento, salvo que el archivo se llame
 * «borrador», para mostrar cómo se ve un rechazo explicado. El Verificador real (Claude) revisa
 * el contenido contra la obligación.
 */
function useVerificador() {
  const { estado, despachar } = useApp();
  const enCurso = useRef(new Set<string>());

  useEffect(() => {
    const sincronizar = () => {
      for (const ev of estado.evidencias) {
        if (ev.pendienteSync && navigator.onLine) despachar({ tipo: "actualizarEvidencia", id: ev.id, cambios: { pendienteSync: false } });
      }
    };
    window.addEventListener("online", sincronizar);
    return () => window.removeEventListener("online", sincronizar);
  }, [estado.evidencias, despachar]);

  useEffect(() => {
    for (const ev of estado.evidencias) {
      if (ev.estado !== "en_verificacion" || ev.pendienteSync || enCurso.current.has(ev.id)) continue;
      enCurso.current.add(ev.id);
      setTimeout(() => {
        const rechazar = /borrador/i.test(ev.nombre);
        despachar({
          tipo: "actualizarEvidencia",
          id: ev.id,
          cambios: rechazar
            ? { estado: "rechazada", motivo: "No alcanza: el archivo es un borrador. Sube la versión firmada o definitiva." }
            : { estado: "aceptada" },
        });
        enCurso.current.delete(ev.id);
      }, DEMORA_VERIFICACION_MS);
    }
  }, [estado.evidencias, despachar]);
}

function SubirEvidencia({ contrato, ob, vence, onListo }: { contrato: Contrato; ob: Obligacion; vence: FechaISO | undefined; onListo: () => void }) {
  const { despachar, hoy } = useApp();
  const camara = useRef<HTMLInputElement>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const [enLinea, setEnLinea] = useState(true);
  useEffect(() => setEnLinea(navigator.onLine), []);

  const subir = (nombre: string) => {
    const offline = !navigator.onLine;
    const ev: Evidencia = {
      id: `ev-${Date.now().toString(36)}`,
      obligacionId: ob.id,
      vence: vence ?? hoy,
      nombre,
      subidaEl: hoy,
      estado: "en_verificacion",
      ...(offline ? { pendienteSync: true } : {}),
    };
    despachar({ tipo: "agregarEvidencia", evidencia: ev });
    onListo();
  };

  const alElegir = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 25 * 1024 * 1024) {
      alert("El archivo pesa más de 25 MB. Bájale la calidad o súbelo desde el computador.");
      return;
    }
    subir(f.name);
  };

  return (
    <div>
      <p className="titulo-3">{ob.titulo}</p>
      <p className="apoyo mt-1">
        {vence ? `Para el vencimiento del ${fechaCorta(vence)}${ob.periodicidad.tipo === "mensual" ? ` (${nombreMes(vence.slice(0, 7))})` : ""}. ` : ""}
        {contrato.nombreCorto}
      </p>
      <div className="lamina mt-4 p-4">
        <p className="font-semibold">Qué sirve como evidencia</p>
        <p className="mt-1">{ob.evidenciaEsperada}.</p>
        <FuenteChip contrato={contrato} fuente={ob.fuente} className="mt-1" />
      </div>
      {!enLinea ? (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-riesgo-suave p-3 text-riesgo">
          <CloudSlash size={20} aria-hidden className="mt-0.5 shrink-0" />
          <span>Estás sin conexión. La evidencia queda guardada en el celular y se sube sola cuando vuelva la señal.</span>
        </p>
      ) : null}
      <div className="mt-5 grid gap-3">
        <button type="button" className="btn w-full" onClick={() => camara.current?.click()}>
          <Camera size={22} aria-hidden /> Tomar foto
        </button>
        <button type="button" className="btn btn-sec w-full" onClick={() => archivo.current?.click()}>
          <UploadSimple size={22} aria-hidden /> Elegir archivo
        </button>
        <input ref={camara} type="file" accept="image/*" capture="environment" className="sr-only" onChange={alElegir} tabIndex={-1} aria-hidden />
        <input ref={archivo} type="file" accept="image/*,.pdf,.docx,.xlsx" className="sr-only" onChange={alElegir} tabIndex={-1} aria-hidden />
      </div>
      <p className="apoyo mt-5">
        Demo: el archivo no sale de tu navegador. El Verificador revisa en unos segundos; si el nombre del archivo dice «borrador», lo rechaza para que
        veas cómo explica el motivo.
      </p>
    </div>
  );
}
