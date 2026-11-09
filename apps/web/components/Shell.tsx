"use client";

import { ArrowCounterClockwise, Camera, ChatCircleText, Files, House, Moon, Sun, Desktop } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { itemsHoy } from "@/lib/calculos";
import { useApp, type Tema } from "@/lib/store";
import { Logo } from "./Logo";
import { usePaneles } from "./Paneles";

const NAV = [
  { href: "/hoy/", texto: "Hoy", Icono: House },
  { href: "/contratos/", texto: "Contratos", Icono: Files },
  { href: "#subir", texto: "Subir", Icono: Camera },
  { href: "/preguntar/", texto: "Preguntar", Icono: ChatCircleText },
] as const;

const SIGUIENTE_TEMA: Record<Tema, Tema> = { sistema: "claro", claro: "oscuro", oscuro: "sistema" };
const ICONO_TEMA = { sistema: Desktop, claro: Sun, oscuro: Moon };
const TEXTO_TEMA = { sistema: "Tema del sistema", claro: "Tema claro", oscuro: "Tema oscuro" };

/** Pantalla con navegación. Si no hay contratos cargados, lleva a la bienvenida. */
export function Pantalla({ children }: { children: ReactNode }) {
  const { estado, listo, contratos, despachar, estaConfirmada, hoy } = useApp();
  const { abrirSubida } = usePaneles();
  const router = useRouter();
  const ruta = usePathname();

  useEffect(() => {
    if (listo && contratos.length === 0) router.replace("/bienvenida/");
  }, [listo, contratos.length, router]);

  const subir = () => {
    const [primero] = itemsHoy(contratos, estaConfirmada, estado.evidencias, estado.externos, estado.pagados, hoy);
    if (primero) abrirSubida(primero.contrato, primero.obligacion, primero.situacion.vence);
    else router.push("/contratos/");
  };

  const IconoTema = ICONO_TEMA[estado.tema];

  if (!listo || contratos.length === 0) {
    return <div className="min-h-dvh" aria-busy="true" />;
  }

  return (
    <div className="min-h-dvh md:pl-[92px]">
      <a href="#contenido" className="sr-only-focusable fixed left-3 top-3 z-50 btn">
        Saltar al contenido
      </a>

      {/* Riel (escritorio) */}
      <nav aria-label="Principal" className="fixed inset-y-0 left-0 z-30 hidden w-[92px] flex-col items-center gap-2 border-r border-borde bg-superficie py-5 md:flex">
        <Link href="/hoy/" className="mb-4" aria-label="LiveContracts, inicio">
          <Logo conTexto={false} tamano={36} />
        </Link>
        {NAV.map(({ href, texto, Icono }) => {
          const activo = href !== "#subir" && ruta.startsWith(href);
          const clase = `flex w-[76px] flex-col items-center gap-1 rounded-xl py-2.5 text-[0.8125rem] font-semibold ${
            activo ? "bg-fondo text-texto" : "text-texto-2 hover:text-texto"
          }`;
          return href === "#subir" ? (
            <button key={href} type="button" onClick={subir} className={clase}>
              <span className="grid size-10 place-items-center rounded-full bg-accion text-accion-texto">
                <Icono size={22} weight="fill" aria-hidden />
              </span>
              {texto}
            </button>
          ) : (
            <Link key={href} href={href} className={clase} aria-current={activo ? "page" : undefined}>
              <Icono size={26} weight={activo ? "fill" : "regular"} aria-hidden />
              {texto}
            </Link>
          );
        })}
        <div className="mt-auto flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => despachar({ tipo: "tema", tema: SIGUIENTE_TEMA[estado.tema] })}
            className="grid size-11 place-items-center rounded-full text-texto-2 hover:text-texto"
            aria-label={`${TEXTO_TEMA[estado.tema]}. Cambiar tema`}
            title={TEXTO_TEMA[estado.tema]}
          >
            <IconoTema size={22} aria-hidden />
          </button>
          <BotonReiniciar />
        </div>
      </nav>

      {/* Cabecera móvil */}
      <header className="flex items-center justify-between px-5 pt-4 md:hidden">
        <Link href="/hoy/" aria-label="LiveContracts, inicio">
          <Logo tamano={28} />
        </Link>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => despachar({ tipo: "tema", tema: SIGUIENTE_TEMA[estado.tema] })}
            className="grid size-11 place-items-center rounded-full text-texto-2"
            aria-label={`${TEXTO_TEMA[estado.tema]}. Cambiar tema`}
          >
            <IconoTema size={22} aria-hidden />
          </button>
          <BotonReiniciar />
        </div>
      </header>

      <main id="contenido" className="mx-auto w-full max-w-[1200px] px-5 pb-32 pt-4 md:px-10 md:pb-16 md:pt-10">
        {children}
      </main>

      {/* Barra inferior (móvil) */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-borde bg-superficie px-1 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {NAV.map(({ href, texto, Icono }) => {
          const activo = href !== "#subir" && ruta.startsWith(href);
          const clase = `flex min-h-12 flex-col items-center justify-center gap-0.5 text-[0.8125rem] font-semibold ${activo ? "text-texto" : "text-texto-2"}`;
          return href === "#subir" ? (
            <button key={href} type="button" onClick={subir} className={clase}>
              <span className="-mt-3 grid size-11 place-items-center rounded-full bg-accion text-accion-texto">
                <Icono size={22} weight="fill" aria-hidden />
              </span>
              {texto}
            </button>
          ) : (
            <Link key={href} href={href} className={clase} aria-current={activo ? "page" : undefined}>
              <Icono size={26} weight={activo ? "fill" : "regular"} aria-hidden />
              {texto}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function BotonReiniciar() {
  const { despachar } = useApp();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("¿Reiniciar la demo? Se borran los contratos cargados y lo que hayas subido en este navegador.")) {
          despachar({ tipo: "reiniciar" });
          router.replace("/bienvenida/");
        }
      }}
      className="grid size-11 place-items-center rounded-full text-texto-2 hover:text-texto"
      aria-label="Reiniciar la demo"
      title="Reiniciar la demo"
    >
      <ArrowCounterClockwise size={22} aria-hidden />
    </button>
  );
}
