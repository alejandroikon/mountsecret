"use client";

import { X } from "@phosphor-icons/react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Panel modal accesible sobre <dialog>: atrapa el foco, cierra con Escape y
 * devuelve el foco al disparador. En móvil sube desde abajo; en escritorio es un panel lateral.
 */
export function Panel({
  abierto,
  onCerrar,
  titulo,
  children,
  ancho = "md",
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
  ancho?: "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === ref.current) onCerrar();
      }}
      aria-label={titulo}
      className={`m-0 mt-auto w-full max-w-none rounded-t-2xl bg-fondo text-texto p-0 backdrop:bg-black/40 max-h-[92dvh]
        md:ml-auto md:mt-0 md:h-dvh md:max-h-none md:rounded-none md:rounded-l-2xl ${ancho === "lg" ? "md:w-[640px]" : "md:w-[480px]"}`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-borde bg-fondo px-5 py-3">
        <h2 className="titulo-2">{titulo}</h2>
        <button type="button" onClick={onCerrar} className="grid size-11 place-items-center rounded-full hover:bg-superficie" aria-label="Cerrar">
          <X size={22} aria-hidden />
        </button>
      </div>
      <div className="px-5 py-5">{children}</div>
    </dialog>
  );
}
