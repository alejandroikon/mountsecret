"use client";

/**
 * Hoy: no es un tablero. Qué hacer hoy, qué vence esta semana y qué frena el próximo pago.
 */
import { diasHabilesEntre, formatearPesos } from "@lc/dominio";
import { CheckCircle, Handshake } from "@phosphor-icons/react";
import Link from "next/link";
import { EstadoChip } from "@/components/Estado";
import { Linea } from "@/components/Linea";
import { Pantalla } from "@/components/Shell";
import { Tarea } from "@/components/Tarea";
import { type ItemHoy, itemsHoy, opcionesDe, proximoPago, requisitosDe, rombosDe } from "@/lib/calculos";
import { fechaLarga, nombreMes, relativa } from "@/lib/formato";
import { useApp } from "@/lib/store";
import { plural } from "@/lib/textos";
import type { Contrato } from "@/lib/tipos";

function etiquetaCobro(p: { periodo: string | null; etiqueta: string }): string {
  return p.periodo ? nombreMes(p.periodo) : p.etiqueta;
}

function ResumenCobro({ contrato, grande }: { contrato: Contrato; grande: boolean }) {
  const { estado, hoy } = useApp();
  const pago = proximoPago(contrato, estado.evidencias, estado.externos, estado.pagados, hoy);
  const rombos = rombosDe(contrato, estado.evidencias, estado.externos, estado.pagados, hoy);
  if (!pago) {
    return (
      <div className="lamina p-5">
        <p className="titulo-3">{contrato.nombreCorto}</p>
        <p className="apoyo">No quedan cobros pendientes en este contrato.</p>
      </div>
    );
  }
  const reqs = requisitosDe(pago, contrato, estado.evidencias, estado.externos, hoy);
  const faltan = reqs.filter((r) => !r.listo).length;
  const titulo =
    faltan === 0
      ? `Todo listo para cobrar ${etiquetaCobro(pago)}`
      : `Te ${faltan === 1 ? "falta 1 cosa" : `faltan ${faltan} cosas`} para cobrar ${etiquetaCobro(pago)}`;

  const contenido = (
    <>
      <p className="apoyo">{grande ? contrato.nombreCorto : `${contrato.nombreCorto} · ${contrato.codigo}`}</p>
      <h1 className={grande ? "titulo-1 mt-1" : "titulo-2 mt-1"}>{titulo}</h1>
      <p className={`${grande ? "cifra-xl" : "font-cifra text-[1.75rem] font-bold"} mt-1`}>{formatearPesos(pago.valor)}</p>
      <p className="apoyo">Radicar {relativa(pago.radicarAntes, hoy)}</p>
      <div className="mt-3">
        <Linea contrato={contrato} rombos={rombos} hoy={hoy} destacarPagoId={pago.id} />
      </div>
      <Link href={`/contratos/${contrato.id}/cobro/${pago.id}/`} className={`btn mt-3 w-full ${faltan === 0 ? "" : "btn-sec"}`}>
        {faltan === 0 ? "Ver paquete de cobro" : "Ver lo que falta"}
      </Link>
    </>
  );
  return grande ? <section>{contenido}</section> : <section className="lamina p-5">{contenido}</section>;
}

function Seccion({ titulo, items, varios }: { titulo: string; items: ItemHoy[]; varios: boolean }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="titulo-2 mb-3">{titulo}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((i) => (
          <Tarea key={`${i.contrato.id}-${i.obligacion.id}`} contrato={i.contrato} obligacion={i.obligacion} situacion={i.situacion} mostrarContrato={varios} />
        ))}
      </div>
    </section>
  );
}

export default function Hoy() {
  return (
    <Pantalla>
      <Contenido />
    </Pantalla>
  );
}

function Contenido() {
  const { contratos, estado, hoy, estaConfirmada, despachar } = useApp();
  const items = itemsHoy(contratos, estaConfirmada, estado.evidencias, estado.externos, estado.pagados, hoy);
  const varios = contratos.length > 1;

  const frenan = items.filter((i) => i.frenaPago);
  const resto = items.filter((i) => !i.frenaPago);
  const paraHoy = resto.filter((i) => i.situacion.estado === "vencida" || i.situacion.vence === hoy);
  const semana = resto.filter(
    (i) => !paraHoy.includes(i) && i.situacion.vence && diasHabilesEntre(hoy, i.situacion.vence, opcionesDe(i.contrato)) <= 5,
  );
  const despues = resto.length - paraHoy.length - semana.length;

  // Requisitos que dependen del contratante (p. ej., visto bueno): se muestran aparte.
  const externos = contratos.flatMap((c) => {
    const pago = proximoPago(c, estado.evidencias, estado.externos, estado.pagados, hoy);
    if (!pago) return [];
    return requisitosDe(pago, c, estado.evidencias, estado.externos, hoy)
      .filter((r) => !r.listo && r.requisito.externo)
      .map((r) => ({ c, pago, r }));
  });

  const conFreno = contratos.filter((c) => {
    const pago = proximoPago(c, estado.evidencias, estado.externos, estado.pagados, hoy);
    return pago ? requisitosDe(pago, c, estado.evidencias, estado.externos, hoy).some((r) => !r.listo) : false;
  }).length;

  return (
    <>
      <p className="apoyo">{fechaLarga(hoy)}</p>
      {varios ? (
        <>
          <h1 className="titulo-1 mt-1">
            {conFreno === 0 ? "Tus cobros van al día" : `${plural(conFreno, "contrato tiene", "contratos tienen")} algo que frena el pago`}
          </h1>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {contratos.map((c) => (
              <ResumenCobro key={c.id} contrato={c} grande={false} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-1 max-w-[560px]">
          <ResumenCobro contrato={contratos[0]!} grande />
        </div>
      )}

      <Seccion titulo="Frena tu próximo pago" items={frenan} varios={varios} />

      {externos.length > 0 ? (
        <section className="mt-6">
          <div className="grid gap-3 md:grid-cols-2">
            {externos.map(({ c, pago, r }) => (
              <article key={`${pago.id}-${r.requisito.id}`} className="tarea">
                <EstadoChip estado="pendiente" detalle="lo hace el contratante" />
                <h3 className="titulo-3 mt-1">{r.requisito.nombre}</h3>
                <p className="apoyo">
                  Lo da {r.requisito.externo?.quien}
                  {varios ? ` · ${c.nombreCorto}` : ""}
                </p>
                <button type="button" className="btn btn-sec mt-3 w-full" onClick={() => despachar({ tipo: "marcarExterno", clave: `${pago.id}:${r.requisito.id}`, valor: true })}>
                  <Handshake size={20} aria-hidden /> Ya lo tengo
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <Seccion titulo="Para hoy" items={paraHoy} varios={varios} />
      <Seccion titulo="Esta semana" items={semana} varios={varios} />

      {items.length === 0 && externos.length === 0 ? (
        <section className="lamina mt-8 p-6">
          <p className="flex items-center gap-2 titulo-3">
            <CheckCircle size={24} weight="fill" className="text-cumplida" aria-hidden /> Nada pendiente para hoy
          </p>
          <p className="apoyo mt-1">Todo lo que vence pronto tiene evidencia aceptada. Te avisamos antes del próximo vencimiento.</p>
        </section>
      ) : null}

      {despues > 0 ? (
        <p className="mt-8">
          <Link href="/contratos/" className="enlace">
            {plural(despues, "obligación más vence", "obligaciones más vencen")} después
          </Link>
        </p>
      ) : null}
    </>
  );
}
