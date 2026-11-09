"use client";

import { formatearPesos } from "@lc/dominio";
import { FileArrowUp, HardHat, Code, Info } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { CONTRATOS } from "@/lib/semillas";
import { useApp } from "@/lib/store";
import { TIPO_CONTRATO } from "@/lib/textos";

export default function Bienvenida() {
  const { estado, despachar, contratos } = useApp();
  const router = useRouter();
  const [arrastrando, setArrastrando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [faltaConsentimiento, setFaltaConsentimiento] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const exigirConsentimiento = () => {
    if (estado.consentimiento) return true;
    setFaltaConsentimiento(true);
    document.getElementById("consentimiento")?.focus();
    return false;
  };

  const cargarDemo = (id: string) => {
    if (!exigirConsentimiento()) return;
    despachar({ tipo: "cargarContrato", id });
    router.push(`/lectura/${id}/`);
  };

  const archivoPropio = (nombre: string) => {
    if (!exigirConsentimiento()) return;
    setAviso(
      `Recibimos «${nombre}». En esta demo la lectura de documentos propios todavía no está conectada: se activa cuando configuremos la clave de Claude en el servidor. Mientras tanto, prueba con uno de los contratos de ejemplo.`,
    );
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[720px] flex-col px-5 py-8 md:py-14">
      <Logo tamano={34} />
      <h1 className="titulo-1 mt-10 md:text-[2.5rem] md:leading-[1.15]">Sube tu contrato. Nosotros nos encargamos de que lo cumplas y lo cobres.</h1>
      <p className="mt-3 text-[1.0625rem] text-texto-2">
        En unos minutos te decimos qué tienes que cumplir, cuándo, y qué te falta para cada pago. Cada obligación con la cláusula y la página de donde sale.
      </p>

      <label className={`mt-8 flex items-start gap-3 rounded-xl p-3 ${faltaConsentimiento && !estado.consentimiento ? "bg-vencida-suave" : ""}`}>
        <input
          id="consentimiento"
          type="checkbox"
          checked={estado.consentimiento}
          onChange={() => {
            if (!estado.consentimiento) despachar({ tipo: "consentir" });
            setFaltaConsentimiento(false);
          }}
          className="mt-1 size-5 shrink-0 accent-[var(--c-accion)]"
          aria-describedby="consentimiento-ayuda"
        />
        <span>
          Autorizo el tratamiento de los datos personales de mis documentos para este servicio (Ley 1581 de 2012).
          <span id="consentimiento-ayuda" className="apoyo block mt-1">
            Los documentos los lee un modelo de IA alojado en EE. UU. Nada se envía a tu cliente sin tu aprobación.
            {faltaConsentimiento && !estado.consentimiento ? <strong className="block text-vencida mt-1">Marca esta casilla para seguir.</strong> : null}
          </span>
        </span>
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastrando(false);
          const f = e.dataTransfer.files[0];
          if (f) archivoPropio(f.name);
        }}
        className={`mt-4 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${arrastrando ? "border-marca bg-resaltado" : "border-borde"}`}
      >
        <FileArrowUp size={40} className="mx-auto text-texto-2" aria-hidden />
        <p className="titulo-3 mt-2">Arrastra aquí tu contrato</p>
        <p className="apoyo">PDF (también escaneado) o DOCX, con sus anexos, adendas y otrosíes.</p>
        <button type="button" className="btn mt-4" onClick={() => input.current?.click()}>
          Elegir archivo
        </button>
        <input
          ref={input}
          type="file"
          accept=".pdf,.docx"
          className="sr-only"
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) archivoPropio(f.name);
          }}
        />
      </div>
      {aviso ? (
        <p role="status" className="mt-3 flex gap-2 rounded-xl bg-riesgo-suave p-3 text-riesgo">
          <Info size={20} className="mt-0.5 shrink-0" aria-hidden />
          <span>{aviso}</span>
        </p>
      ) : null}

      <h2 className="titulo-2 mt-10">O prueba con un contrato de ejemplo</h2>
      <p className="apoyo">Entidades y empresas ficticias, con cláusulas y fechas realistas.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {CONTRATOS.map((c) => {
          const Icono = c.tipo === "obra" ? HardHat : Code;
          const cargado = contratos.some((x) => x.id === c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => (cargado ? router.push(`/contratos/${c.id}/`) : cargarDemo(c.id))}
              className="lamina p-4 text-left hover:border-texto-2"
            >
              <Icono size={28} className="text-marca" aria-hidden />
              <p className="titulo-3 mt-2">{c.nombreCorto}</p>
              <p className="apoyo">
                {TIPO_CONTRATO[c.tipo]} · {c.contratante}
              </p>
              <p className="mt-2 font-semibold num">{formatearPesos(c.valorInicial)}</p>
              <p className="apoyo mt-2">
                {c.tipo === "obra" ? "Anticipo, actas parciales, 4 pólizas, una suspensión y una prórroga." : "Backups, doble factor, SLA, informe y pago mensual."}
              </p>
              <span className="mt-3 inline-block font-semibold">{cargado ? "Ya está cargado: abrir" : "Leer este contrato"}</span>
            </button>
          );
        })}
      </div>

      {contratos.length > 0 ? (
        <Link href="/hoy/" className="btn btn-sec mt-8 self-start">
          Ir a mi pantalla de hoy
        </Link>
      ) : null}
    </main>
  );
}
