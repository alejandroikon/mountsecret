"use client";

import { formatearPesos } from "@lc/dominio";
import { Plus } from "@phosphor-icons/react";
import Link from "next/link";
import { Linea } from "@/components/Linea";
import { Pantalla } from "@/components/Shell";
import { cronogramaDe, itemsHoy, rombosDe } from "@/lib/calculos";
import { fechaCorta } from "@/lib/formato";
import { useApp } from "@/lib/store";
import { TIPO_CONTRATO, plural } from "@/lib/textos";

export default function Contratos() {
  return (
    <Pantalla>
      <Lista />
    </Pantalla>
  );
}

function Lista() {
  const { contratos, estado, hoy, estaConfirmada } = useApp();
  return (
    <>
      <h1 className="titulo-1">Tus contratos</h1>
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {contratos.map((c) => {
          const cr = cronogramaDe(c);
          const pendientes = itemsHoy([c], estaConfirmada, estado.evidencias, estado.externos, estado.pagados, hoy);
          const urgentes = pendientes.filter((i) => i.situacion.estado === "vencida" || i.situacion.estado === "en_riesgo").length;
          return (
            <Link key={c.id} href={`/contratos/${c.id}/`} className="lamina block p-5 hover:border-texto-2">
              <p className="apoyo">
                {TIPO_CONTRATO[c.tipo]} · {c.codigo}
              </p>
              <h2 className="titulo-2">{c.nombreCorto}</h2>
              <p className="apoyo">{c.contratante}</p>
              <div className="mt-3">
                <Linea contrato={c} rombos={rombosDe(c, estado.evidencias, estado.externos, estado.pagados, hoy)} hoy={hoy} />
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-2 text-[0.9375rem]">
                <div>
                  <dt className="text-texto-2">Valor</dt>
                  <dd className="font-semibold num">{formatearPesos(cr.valor)}</dd>
                </div>
                <div>
                  <dt className="text-texto-2">Termina</dt>
                  <dd className="font-semibold">{fechaCorta(cr.terminacion)}</dd>
                </div>
              </dl>
              <p className="mt-3 font-semibold">{urgentes > 0 ? `${plural(urgentes, "cosa necesita", "cosas necesitan")} atención` : "Al día"}</p>
            </Link>
          );
        })}
        <Link href="/bienvenida/" className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-borde p-5 text-texto-2 hover:border-texto-2 hover:text-texto">
          <Plus size={28} aria-hidden />
          <span className="font-semibold">Agregar un contrato</span>
        </Link>
      </div>
    </>
  );
}
