"use client";

/**
 * Paquete de cobro: qué falta, qué está listo y, cuando todo está, la celebración.
 * Nada sale hacia el cliente: los borradores se aprueban y se copian a mano.
 */
import { formatearPesos, valorEnLetras } from "@lc/dominio";
import { CaretLeft, CheckCircle, Handshake, Printer } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EstadoChip } from "@/components/Estado";
import { Panel } from "@/components/Hoja";
import { Linea } from "@/components/Linea";
import { FuenteChip, usePaneles } from "@/components/Paneles";
import { Pantalla } from "@/components/Shell";
import { estadoPago, evidenciaDe, requisitosDe, rombosDe, vencimientosParaPago } from "@/lib/calculos";
import { fechaCompleta, fechaCorta, nombreMes, relativa } from "@/lib/formato";
import { contratoPorId } from "@/lib/semillas";
import { useApp } from "@/lib/store";
import type { Contrato, Pago } from "@/lib/tipos";

export function Cobro({ id, pagoId }: { id: string; pagoId: string }) {
  return (
    <Pantalla>
      <Contenido id={id} pagoId={pagoId} />
    </Pantalla>
  );
}

function Contenido({ id, pagoId }: { id: string; pagoId: string }) {
  const contrato = contratoPorId(id);
  const pago = contrato?.pagos.find((p) => p.id === pagoId);
  const { estado, hoy, despachar, contratos, tituloDe } = useApp();
  const { abrirSubida } = usePaneles();
  const reducir = useReducedMotion();
  const [borrador, setBorrador] = useState<string | null>(null);
  const [cuenta, setCuenta] = useState(false);
  const yaCelebrado = useRef<boolean | null>(null);

  const reqs = contrato && pago ? requisitosDe(pago, contrato, estado.evidencias, estado.externos, hoy) : [];
  const completo = reqs.length > 0 && reqs.every((r) => r.listo);

  useEffect(() => {
    if (yaCelebrado.current === null) {
      yaCelebrado.current = completo;
      return;
    }
    if (completo && !yaCelebrado.current) {
      yaCelebrado.current = true;
      if (!reducir && "vibrate" in navigator) navigator.vibrate(30);
    }
  }, [completo, reducir]);

  if (!contrato || !pago || !contratos.some((c) => c.id === id)) {
    return <Link className="enlace" href="/contratos/">Volver a contratos</Link>;
  }

  const ep = estadoPago(pago, contrato, estado.evidencias, estado.externos, estado.pagados, hoy);
  const listos = reqs.filter((r) => r.listo);
  const faltan = reqs.filter((r) => !r.listo);
  const nombre = pago.periodo ? `Cobro de ${nombreMes(pago.periodo)}` : pago.etiqueta.charAt(0).toUpperCase() + pago.etiqueta.slice(1);

  return (
    <div className="max-w-[640px]">
      <Link href={`/contratos/${contrato.id}/`} className="apoyo inline-flex items-center gap-1 hover:text-texto">
        <CaretLeft size={16} aria-hidden /> {contrato.nombreCorto}
      </Link>
      <p className="apoyo mt-3">{nombre}</p>
      <p className="cifra-xl">{formatearPesos(pago.valor)}</p>
      <p className="text-texto-2">
        {ep === "pagado"
          ? `Pagado el ${fechaCompleta(estado.pagados[pago.id]!)}`
          : `Radicar a más tardar el ${fechaCompleta(pago.radicarAntes)} (${relativa(pago.radicarAntes, hoy)})`}
      </p>
      {contrato.tipo === "obra" && pago.periodo ? <p className="apoyo">Neto a pagar, después de amortizar el anticipo.</p> : null}

      <div className="mt-4">
        <Linea contrato={contrato} hoy={hoy} rombos={rombosDe(contrato, estado.evidencias, estado.externos, estado.pagados, hoy)} destacarPagoId={pago.id} />
      </div>

      <p className="mt-4 font-semibold num" aria-live="polite">
        {listos.length} de {reqs.length} listos
      </p>

      {completo ? (
        <motion.section
          initial={reducir ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl bg-cumplida-suave p-5"
          role="status"
        >
          <p className="flex items-center gap-2 titulo-2 text-cumplida">
            <CheckCircle size={28} weight="fill" aria-hidden /> {ep === "pagado" ? "Cobrado" : "Listo para radicar"}
          </p>
          <p className="mt-1">
            {ep === "pagado" ? "Este pago ya llegó." : `${formatearPesos(pago.valor)} en camino en cuanto lo radiques ante ${contrato.contratante}.`}
          </p>
        </motion.section>
      ) : null}

      {faltan.length > 0 ? (
        <section className="mt-6">
          <h2 className="titulo-2 mb-3">Lo que te falta</h2>
          <div className="grid gap-3">
            {faltan.map((r) =>
              r.requisito.externo ? (
                <article key={r.requisito.id} className="tarea">
                  <EstadoChip estado="pendiente" detalle="lo hace el contratante" />
                  <h3 className="titulo-3 mt-1">{r.requisito.nombre}</h3>
                  <p className="apoyo">Lo da {r.requisito.externo.quien}, no tú. Podemos prepararte la solicitud.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <button type="button" className="btn" onClick={() => setBorrador(textoSolicitud(contrato, pago, r.requisito.nombre))}>
                      {r.requisito.externo.accion}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sec"
                      onClick={() => despachar({ tipo: "marcarExterno", clave: `${pago.id}:${r.requisito.id}`, valor: true })}
                    >
                      <Handshake size={20} aria-hidden /> Ya lo tengo
                    </button>
                  </div>
                </article>
              ) : (
                <article key={r.requisito.id} className="tarea" style={{ ["--rail" as string]: r.estado === "vencida" ? "var(--c-vencida)" : r.estado === "en_riesgo" ? "var(--c-riesgo)" : undefined }}>
                  <EstadoChip estado={r.estado ?? "pendiente"} detalle={r.pendiente ? `vence ${relativa(r.pendiente.vence, hoy)}` : undefined} />
                  <h3 className="titulo-3 mt-1">{r.requisito.nombre}</h3>
                  {r.obligacion ? <FuenteChip contrato={contrato} fuente={r.obligacion.fuente} /> : null}
                  {r.obligacion && r.pendiente && evidenciaDe(estado.evidencias, r.obligacion.id, r.pendiente.vence)?.estado === "en_verificacion" ? (
                    <p className="apoyo mt-2">El Verificador está revisando lo que subiste.</p>
                  ) : r.obligacion ? (
                    <button type="button" className="btn mt-3 w-full" onClick={() => abrirSubida(contrato, r.obligacion!, r.pendiente?.vence)}>
                      {r.obligacion.accion}
                    </button>
                  ) : null}
                  {r.obligacion && r.obligacion.periodicidad.tipo === "semanal" ? (
                    <p className="apoyo mt-2">
                      Semanas del mes con evidencia: {vencimientosParaPago(r.obligacion, contrato, pago).filter((v) => evidenciaDe(estado.evidencias, r.obligacion!.id, v.vence)?.estado === "aceptada").length} de{" "}
                      {vencimientosParaPago(r.obligacion, contrato, pago).length}
                    </p>
                  ) : null}
                </article>
              ),
            )}
          </div>
        </section>
      ) : null}

      {listos.length > 0 ? (
        <section className="mt-8">
          <h2 className="titulo-2 mb-2">Listo</h2>
          <ul className="border-t border-borde">
            {listos.map((r) => (
              <li key={r.requisito.id} className="flex items-center gap-2 border-b border-borde py-3">
                <CheckCircle size={20} weight="fill" className="shrink-0 text-cumplida" aria-hidden />
                <span className="flex-1">{r.obligacion ? tituloDe(r.obligacion) : r.requisito.nombre}</span>
                {r.requisito.externo ? (
                  <button type="button" className="apoyo enlace" onClick={() => despachar({ tipo: "marcarExterno", clave: `${pago.id}:${r.requisito.id}`, valor: false })}>
                    Deshacer
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {contrato.tipo !== "obra" && pago.periodo ? (
        <button type="button" className="btn btn-sec mt-8 w-full" onClick={() => setCuenta(true)}>
          Ver la cuenta de cobro
        </button>
      ) : null}
      <button type="button" className="btn mt-3 w-full" aria-disabled={!completo} onClick={() => completo && setCuenta(true)}>
        Descargar paquete
      </button>
      {!completo ? <p className="apoyo mt-2 text-center">Se habilita cuando estén los {reqs.length} requisitos.</p> : null}

      <Panel abierto={borrador !== null} onCerrar={() => setBorrador(null)} titulo="Borrador para aprobar">
        <p className="apoyo">Nada se envía solo. Revísalo, apruébalo y cópialo a tu correo.</p>
        <textarea
          className="mt-3 h-72 w-full rounded-xl border border-borde bg-superficie p-3 font-cita text-[1rem] leading-relaxed"
          value={borrador ?? ""}
          onChange={(e) => setBorrador(e.target.value)}
          aria-label="Texto de la solicitud"
        />
        <button
          type="button"
          className="btn mt-3 w-full"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(borrador ?? "");
            } catch {}
            setBorrador(null);
          }}
        >
          Aprobar y copiar
        </button>
      </Panel>

      <Panel abierto={cuenta} onCerrar={() => setCuenta(false)} titulo={contrato.tipo === "obra" ? "Paquete del acta" : "Cuenta de cobro"} ancho="lg">
        <CuentaDeCobro contrato={contrato} pago={pago} />
      </Panel>
    </div>
  );
}

function textoSolicitud(c: Contrato, p: Pago, requisito: string): string {
  const periodo = p.periodo ? nombreMes(p.periodo) : p.etiqueta;
  return `Respetado supervisor:

En el marco del contrato ${c.codigo}, cuyo objeto es «${c.objeto.toLowerCase()}», solicito comedidamente su ${requisito.toLowerCase()} correspondiente al periodo de ${periodo}, para radicar la cuenta de cobro antes del ${fechaCorta(p.radicarAntes)}.

Adjunto el informe de actividades con sus evidencias.

Cordialmente,

${c.contratista}`;
}

function CuentaDeCobro({ contrato, pago }: { contrato: Contrato; pago: Pago }) {
  const { hoy } = useApp();
  const ref = useRef<HTMLElement>(null);
  const imprimir = () => {
    const w = window.open("", "_blank");
    if (!w || !ref.current) return;
    w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cuenta de cobro</title><style>body{font:16px/1.6 Georgia,serif;max-width:680px;margin:48px auto;color:#1e0f2e}h1{font-size:20px;text-align:center}</style></head><body>${ref.current.innerHTML}</body></html>`);
    w.document.close();
    w.print();
  };
  const periodo = pago.periodo ? nombreMes(pago.periodo) : pago.etiqueta;
  return (
    <>
      <article ref={ref} className="hoja px-7 py-8 font-cita leading-relaxed">
        <p className="text-right">Bogotá D. C., {fechaCompleta(hoy)}</p>
        <h1 className="mt-6 text-center font-ui text-[1.25rem] font-semibold">CUENTA DE COBRO N.º {String(pago.numero).padStart(3, "0")}</h1>
        <p className="mt-6 text-center">
          {contrato.contratante.toUpperCase()}
          <br />
          DEBE A:
          <br />
          <strong>{contrato.contratista.toUpperCase()}</strong>
        </p>
        <p className="mt-6">
          La suma de <strong>{valorEnLetras(pago.valor)}</strong> ({formatearPesos(pago.valor)}).
        </p>
        <p className="mt-4">
          Por concepto de: pago N.º {pago.numero} de {contrato.pagos.length} del contrato {contrato.codigo}, correspondiente al periodo de {periodo}, según la forma de pago
          pactada ({pago.fuente.clausula}).
        </p>
        <p className="mt-4">
          Se adjuntan: informe de actividades aprobado, planilla de aportes al Sistema de Seguridad Social Integral del periodo cobrado y certificación bancaria.
        </p>
        <p className="mt-10">
          ______________________________
          <br />
          {contrato.contratista}
        </p>
      </article>
      <p className="apoyo mt-3">
        Generada con el formato propio (docs/formatos.md). El valor en letras lo calcula el sistema. Si tu cliente tiene su propia plantilla, la usaremos.
      </p>
      <button type="button" className="btn mt-3 w-full" onClick={imprimir}>
        <Printer size={20} aria-hidden /> Imprimir o guardar en PDF
      </button>
    </>
  );
}
