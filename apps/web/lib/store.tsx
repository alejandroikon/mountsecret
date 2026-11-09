"use client";

/**
 * Estado de la demo, guardado en el navegador (localStorage).
 * En producción esto vive en PostgreSQL con RLS; la forma de los datos es la misma.
 */
import { type FechaISO } from "@lc/dominio";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { evidenciasIniciales, externosIniciales, pagadosIniciales } from "./estado-inicial";
import { contratoPorId } from "./semillas";
import type { Contrato, Evidencia, Obligacion } from "./tipos";

export type Validacion = "confirmada" | "descartada";
export type Tema = "sistema" | "claro" | "oscuro";

export interface EstadoApp {
  version: 1;
  consentimiento: boolean;
  /** Contratos cargados, en orden. */
  contratos: string[];
  /** Contratos cuya validación inicial ya terminó. */
  validados: string[];
  validacion: Record<string, Validacion>;
  responsables: Record<string, string>;
  /** Títulos corregidos por el usuario al validar. */
  titulos: Record<string, string>;
  evidencias: Evidencia[];
  externos: Record<string, boolean>;
  pagados: Record<string, FechaISO>;
  tema: Tema;
  contratoActivo?: string;
}

const INICIAL: EstadoApp = {
  version: 1,
  consentimiento: false,
  contratos: [],
  validados: [],
  validacion: {},
  responsables: {},
  titulos: {},
  evidencias: [],
  externos: {},
  pagados: {},
  tema: "sistema",
};

type Accion =
  | { tipo: "hidratar"; estado: EstadoApp }
  | { tipo: "consentir" }
  | { tipo: "cargarContrato"; id: string }
  | { tipo: "validar"; obId: string; valor: Validacion | null }
  | { tipo: "validarVarias"; obIds: string[] }
  | { tipo: "terminarValidacion"; contratoId: string }
  | { tipo: "asignar"; obId: string; personaId: string }
  | { tipo: "renombrar"; obId: string; titulo: string }
  | { tipo: "agregarEvidencia"; evidencia: Evidencia }
  | { tipo: "actualizarEvidencia"; id: string; cambios: Partial<Evidencia> }
  | { tipo: "marcarExterno"; clave: string; valor: boolean }
  | { tipo: "tema"; tema: Tema }
  | { tipo: "activar"; contratoId: string }
  | { tipo: "reiniciar" };

function reducir(e: EstadoApp, a: Accion): EstadoApp {
  switch (a.tipo) {
    case "hidratar":
      return a.estado;
    case "consentir":
      return { ...e, consentimiento: true };
    case "cargarContrato": {
      if (e.contratos.includes(a.id)) return { ...e, contratoActivo: a.id };
      return {
        ...e,
        contratos: [...e.contratos, a.id],
        contratoActivo: a.id,
        evidencias: [...e.evidencias, ...evidenciasIniciales(a.id)],
        pagados: { ...e.pagados, ...pagadosIniciales(a.id) },
        externos: { ...e.externos, ...externosIniciales(a.id) },
      };
    }
    case "validar": {
      const validacion = { ...e.validacion };
      if (a.valor) validacion[a.obId] = a.valor;
      else delete validacion[a.obId];
      return { ...e, validacion };
    }
    case "validarVarias":
      return { ...e, validacion: { ...e.validacion, ...Object.fromEntries(a.obIds.map((id) => [id, "confirmada" as const])) } };
    case "terminarValidacion":
      return e.validados.includes(a.contratoId) ? e : { ...e, validados: [...e.validados, a.contratoId] };
    case "asignar":
      return { ...e, responsables: { ...e.responsables, [a.obId]: a.personaId } };
    case "renombrar":
      return { ...e, titulos: { ...e.titulos, [a.obId]: a.titulo } };
    case "agregarEvidencia":
      return { ...e, evidencias: [...e.evidencias, a.evidencia] };
    case "actualizarEvidencia":
      return { ...e, evidencias: e.evidencias.map((ev) => (ev.id === a.id ? { ...ev, ...a.cambios } : ev)) };
    case "marcarExterno":
      return { ...e, externos: { ...e.externos, [a.clave]: a.valor } };
    case "tema":
      return { ...e, tema: a.tema };
    case "activar":
      return { ...e, contratoActivo: a.contratoId };
    case "reiniciar":
      return { ...INICIAL, tema: e.tema };
  }
}

const CLAVE = "lc-contratista-demo-v1";

interface ValorContexto {
  estado: EstadoApp;
  listo: boolean;
  despachar: (a: Accion) => void;
  contratos: Contrato[];
  hoy: FechaISO;
  estaConfirmada: (c: Contrato, ob: Obligacion) => boolean;
  responsableDe: (c: Contrato, ob: Obligacion) => string | undefined;
  tituloDe: (ob: Obligacion) => string;
}

const Contexto = createContext<ValorContexto | null>(null);

/** Fecha de hoy en Bogotá. Se puede fijar con `?hoy=AAAA-MM-DD` para presentar la demo. */
function hoyBogota(): FechaISO {
  if (typeof window !== "undefined") {
    const p = new URLSearchParams(window.location.search).get("hoy");
    if (p && /^\d{4}-\d{2}-\d{2}$/.test(p)) {
      try {
        sessionStorage.setItem("lc-hoy", p);
      } catch {}
      return p;
    }
    try {
      const guardado = sessionStorage.getItem("lc-hoy");
      if (guardado) return guardado;
    } catch {}
  }
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(),
  );
}

export function ProveedorEstado({ children }: { children: ReactNode }) {
  const [estado, despacharBase] = useReducer(reducir, INICIAL);
  const [listo, setListo] = useState(false);
  const [hoy, setHoy] = useState<FechaISO>("2026-11-09");

  useEffect(() => {
    setHoy(hoyBogota());
    try {
      const raw = localStorage.getItem(CLAVE);
      if (raw) {
        const guardado = JSON.parse(raw) as EstadoApp;
        if (guardado.version === 1) despacharBase({ tipo: "hidratar", estado: { ...INICIAL, ...guardado } });
      }
    } catch {
      // Sin almacenamiento (navegación privada): la demo funciona igual, solo no recuerda.
    }
    setListo(true);
  }, []);

  useEffect(() => {
    if (!listo) return;
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado));
    } catch {}
  }, [estado, listo]);

  // Tema: claro, oscuro o el del sistema.
  useEffect(() => {
    const raiz = document.documentElement;
    if (estado.tema === "sistema") raiz.removeAttribute("data-theme");
    else raiz.setAttribute("data-theme", estado.tema === "oscuro" ? "dark" : "light");
  }, [estado.tema]);

  const despachar = useCallback((a: Accion) => despacharBase(a), []);

  const contratos = useMemo(() => estado.contratos.map((id) => contratoPorId(id)).filter((c): c is Contrato => Boolean(c)), [estado.contratos]);

  const estaConfirmada = useCallback(
    (c: Contrato, ob: Obligacion) => {
      const v = estado.validacion[ob.id];
      if (v) return v === "confirmada";
      return estado.validados.includes(c.id);
    },
    [estado.validacion, estado.validados],
  );

  const responsableDe = useCallback(
    (c: Contrato, ob: Obligacion) => {
      const id = estado.responsables[ob.id] ?? ob.responsableId;
      return c.equipo.find((p) => p.id === id)?.nombre;
    },
    [estado.responsables],
  );

  const tituloDe = useCallback((ob: Obligacion) => estado.titulos[ob.id] ?? ob.titulo, [estado.titulos]);

  const valor = useMemo(
    () => ({ estado, listo, despachar, contratos, hoy, estaConfirmada, responsableDe, tituloDe }),
    [estado, listo, despachar, contratos, hoy, estaConfirmada, responsableDe, tituloDe],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp(): ValorContexto {
  const v = useContext(Contexto);
  if (!v) throw new Error("useApp fuera de ProveedorEstado");
  return v;
}
