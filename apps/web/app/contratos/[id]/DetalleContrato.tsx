"use client";

import { diferenciaDias, formatearPesos } from "@lc/dominio";
import { CaretLeft, FileText } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EstadoChip } from "@/components/Estado";
import { Linea } from "@/components/Linea";
import { FuenteChip, usePaneles } from "@/components/Paneles";
import { Pantalla } from "@/components/Shell";
import { detalleEstado } from "@/components/Tarea";
import { type EstadoUI, cronogramaDe, estadoPago, requisitosDe, rombosDe, situacionDe } from "@/lib/calculos";
import { fechaCompleta, fechaCorta, nombreMes } from "@/lib/formato";
import { contratoPorId } from "@/lib/semillas";
import { useApp } from "@/lib/store";
import { TIPO_CONTRATO, describirPeriodicidad, plural } from "@/lib/textos";
import type { Contrato } from "@/lib/tipos";

const PESTANAS = [
  { id: "obligaciones", texto: "Obligaciones" },
  { id: "cronograma", texto: "Cronograma" },
  { id: "pagos", texto: "Pagos" },
  { id: "polizas", texto: "Pólizas" },
  { id: "documentos", texto: "Documentos" },
] as const;
type Pestana = (typeof PESTANAS)[number]["id"];

export function DetalleContrato({ id }: { id: string }) {
  return (
    <Pantalla>
      <Detalle id={id} />
    </Pantalla>
  );
}

function Detalle({ id }: { id: string }) {
  const contrato = contratoPorId(id);
  const { estado, hoy, contratos } = useApp();
  const router = useRouter();
  const [pestana, setPestana] = useState<Pestana>("obligaciones");
  if (!contrato || !contratos.some((c) => c.id === id)) {
    return (
      <p>
        Este contrato no está cargado. <Link className="enlace" href="/bienvenida/">Cárgalo desde el inicio</Link>.
      </p>
    );
  }
  const cr = cronogramaDe(contrato);
  return (
    <>
      <Link href="/contratos/" className="apoyo inline-flex items-center gap-1 hover:text-texto">
        <CaretLeft size={16} aria-hidden /> Contratos
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <h1 className="titulo-1">{contrato.nombreCorto}</h1>
          <p className="apoyo">
            {contrato.contratante} · {contrato.codigo}
          </p>
        </div>
        <p className="text-right">
          <span className="apoyo block">{TIPO_CONTRATO[contrato.tipo]}</span>
          <span className="font-cifra text-[1.5rem] font-bold num">{formatearPesos(cr.valor)}</span>
        </p>
      </div>

      <section className="lamina mt-5 p-4" aria-label="Línea del contrato">
        <Linea
          contrato={contrato}
          variante="ampliada"
          hoy={hoy}
          rombos={rombosDe(contrato, estado.evidencias, estado.externos, estado.pagados, hoy)}
          onPago={(p) => router.push(`/contratos/${contrato.id}/cobro/${p.id}/`)}
        />
      </section>

      <div role="tablist" aria-label="Secciones del contrato" className="mt-6 flex gap-1 overflow-x-auto border-b border-borde">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={pestana === p.id}
            aria-controls={`panel-${p.id}`}
            onClick={() => setPestana(p.id)}
            className={`min-h-12 shrink-0 border-b-[3px] px-3 font-semibold ${pestana === p.id ? "border-marca text-texto" : "border-transparent text-texto-2 hover:text-texto"}`}
          >
            {p.texto}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${pestana}`} aria-labelledby={`tab-${pestana}`} className="pt-5">
        {pestana === "obligaciones" ? <Obligaciones contrato={contrato} /> : null}
        {pestana === "cronograma" ? <Cronograma contrato={contrato} /> : null}
        {pestana === "pagos" ? <Pagos contrato={contrato} /> : null}
        {pestana === "polizas" ? <Polizas contrato={contrato} /> : null}
        {pestana === "documentos" ? <Documentos contrato={contrato} /> : null}
      </div>
    </>
  );
}

const FILTROS: { id: "todas" | EstadoUI; texto: string }[] = [
  { id: "todas", texto: "Todas" },
  { id: "vencida", texto: "Vencidas" },
  { id: "en_riesgo", texto: "En riesgo" },
  { id: "pendiente", texto: "Pendientes" },
  { id: "permanente", texto: "Permanentes" },
];

function Obligaciones({ contrato }: { contrato: Contrato }) {
  const { estado, hoy, estaConfirmada, tituloDe, responsableDe } = useApp();
  const { abrirSubida } = usePaneles();
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["id"]>("todas");
  const filas = contrato.obligaciones
    .filter((o) => estaConfirmada(contrato, o))
    .map((o) => ({ o, s: situacionDe(o, contrato, estado.evidencias, hoy) }))
    .filter(({ s }) => filtro === "todas" || s.estado === filtro)
    .sort((a, b) => ORDEN[a.s.estado] - ORDEN[b.s.estado]);
  const descartadas = contrato.obligaciones.filter((o) => estado.validacion[o.id] === "descartada").length;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filtro === f.id}
            onClick={() => setFiltro(f.id)}
            className={`min-h-10 rounded-full border px-4 text-[0.9375rem] font-semibold ${filtro === f.id ? "border-accion bg-accion text-accion-texto" : "border-borde"}`}
          >
            {f.texto}
          </button>
        ))}
      </div>
      {filas.length === 0 ? <p className="apoyo">Ninguna obligación en este estado.</p> : null}

      {/* Escritorio: tabla real */}
      <table className="hidden w-full text-left md:table">
        <caption className="sr-only">Matriz de obligaciones</caption>
        <thead className="apoyo">
          <tr className="border-b border-borde">
            <th scope="col" className="py-2 pr-3 font-semibold">Estado</th>
            <th scope="col" className="py-2 pr-3 font-semibold">Obligación</th>
            <th scope="col" className="py-2 pr-3 font-semibold">Fuente</th>
            <th scope="col" className="py-2 pr-3 font-semibold">Responsable</th>
            <th scope="col" className="py-2 font-semibold"><span className="sr-only">Acción</span></th>
          </tr>
        </thead>
        <tbody>
          {filas.map(({ o, s }) => (
            <tr key={o.id} className="border-b border-borde align-top">
              <td className="py-3 pr-3"><EstadoChip estado={s.estado} detalle={detalleEstado(s, hoy)} /></td>
              <td className="py-3 pr-3">
                <span className="font-semibold">{tituloDe(o)}</span>
                <span className="apoyo block">{describirPeriodicidad(o.periodicidad)}</span>
              </td>
              <td className="py-3 pr-3"><FuenteChip contrato={contrato} fuente={o.fuente} /></td>
              <td className="py-3 pr-3">{responsableDe(contrato, o) ?? <span className="text-texto-2">Sin asignar</span>}</td>
              <td className="py-3 text-right">
                <button type="button" className="enlace whitespace-nowrap" onClick={() => abrirSubida(contrato, o, s.vence)}>
                  Subir evidencia
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Móvil: lista de dos líneas */}
      <ul className="md:hidden">
        {filas.map(({ o, s }) => (
          <li key={o.id} className="border-b border-borde py-3">
            <EstadoChip estado={s.estado} detalle={detalleEstado(s, hoy)} />
            <p className="font-semibold">{tituloDe(o)}</p>
            <p className="apoyo">
              <FuenteChip contrato={contrato} fuente={o.fuente} /> · {responsableDe(contrato, o) ?? "Sin asignar"}
            </p>
            <button type="button" className="enlace mt-1 min-h-11" onClick={() => abrirSubida(contrato, o, s.vence)}>
              Subir evidencia
            </button>
          </li>
        ))}
      </ul>
      {descartadas > 0 ? <p className="apoyo mt-4">{plural(descartadas, "obligación descartada", "obligaciones descartadas")} en la revisión.</p> : null}
    </>
  );
}

const ORDEN: Record<EstadoUI, number> = { vencida: 0, en_riesgo: 1, en_verificacion: 2, pendiente: 3, permanente: 4, cumplida: 5, terminada: 6 };

function Cronograma({ contrato }: { contrato: Contrato }) {
  const cr = cronogramaDe(contrato);
  const filas: { fecha: string; titulo: string; detalle?: string; fuente?: (typeof contrato.eventos)[number]["fuente"] }[] = [
    { fecha: cr.inicio, titulo: "Acta de inicio", detalle: `Plazo de ${contrato.plazo.cantidad} ${contrato.plazo.unidad === "meses" ? "meses" : "días"}` },
    { fecha: cr.terminacionInicial, titulo: "Terminación inicial" },
  ];
  for (const paso of cr.historial) {
    const ev = contrato.eventos.find((e) => e.id === paso.eventoId)!;
    const corre = diferenciaDias(paso.terminacionAntes, paso.terminacionDespues);
    filas.push({
      fecha: paso.fecha,
      titulo: ev.titulo,
      detalle:
        ev.tipo === "suspension"
          ? `Del ${fechaCorta(ev.desde)} al ${fechaCorta(ev.hasta)}. La terminación se corre ${corre} días: ${fechaCorta(paso.terminacionAntes)} → ${fechaCorta(paso.terminacionDespues)}.`
          : `La terminación pasa del ${fechaCorta(paso.terminacionAntes)} al ${fechaCorta(paso.terminacionDespues)} (+${corre} días).`,
      ...(ev.fuente ? { fuente: ev.fuente } : {}),
    });
  }
  filas.sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="lamina p-4">
          <p className="apoyo">Termina</p>
          <p className="titulo-2">{fechaCompleta(cr.terminacion)}</p>
        </div>
        <div className="lamina p-4">
          <p className="apoyo">Días suspendidos</p>
          <p className="titulo-2 num">{cr.diasSuspendidos}</p>
        </div>
        <div className="lamina p-4">
          <p className="apoyo">Días hábiles</p>
          <p className="titulo-2">{contrato.sabadoHabil ? "Lunes a sábado" : "Lunes a viernes"}</p>
          <p className="apoyo">Sin festivos de Colombia</p>
        </div>
      </div>
      <ol className="mt-6 border-l-2 border-borde pl-5">
        {filas.map((f) => (
          <li key={`${f.fecha}-${f.titulo}`} className="relative pb-5">
            <span className="absolute -left-[27px] top-1.5 size-3 rounded-full bg-marca" aria-hidden />
            <p className="apoyo">{fechaCompleta(f.fecha)}</p>
            <p className="font-semibold">{f.titulo}</p>
            {f.detalle ? <p>{f.detalle}</p> : null}
            {f.fuente ? <FuenteChip contrato={contrato} fuente={f.fuente} /> : null}
          </li>
        ))}
        <li className="relative">
          <span className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-texto bg-fondo" aria-hidden />
          <p className="apoyo">{fechaCompleta(cr.terminacion)}</p>
          <p className="font-semibold">Terminación vigente</p>
        </li>
      </ol>
      <p className="apoyo mt-4">El cronograma se recalcula solo con cada suspensión, prórroga u otrosí que cargues.</p>
    </>
  );
}

function Pagos({ contrato }: { contrato: Contrato }) {
  const { estado, hoy } = useApp();
  return (
    <ul>
      {contrato.pagos.map((p) => {
        const ep = estadoPago(p, contrato, estado.evidencias, estado.externos, estado.pagados, hoy);
        const faltan = requisitosDe(p, contrato, estado.evidencias, estado.externos, hoy).filter((r) => !r.listo).length;
        const texto =
          ep === "pagado"
            ? `Pagado el ${fechaCorta(estado.pagados[p.id]!)}`
            : ep === "listo"
              ? "Listo para radicar"
              : ep === "futuro"
                ? `Radicar a más tardar el ${fechaCorta(p.radicarAntes)}`
                : `Faltan ${faltan} · radicar a más tardar el ${fechaCorta(p.radicarAntes)}`;
        return (
          <li key={p.id} className="border-b border-borde">
            <Link href={`/contratos/${contrato.id}/cobro/${p.id}/`} className="flex items-center justify-between gap-3 py-3 hover:bg-superficie">
              <span>
                <span className="font-semibold">{p.periodo ? `Cobro de ${nombreMes(p.periodo)}` : p.etiqueta.charAt(0).toUpperCase() + p.etiqueta.slice(1)}</span>
                <span className={`block text-[0.9375rem] ${ep === "pagado" || ep === "listo" ? "text-cumplida" : "text-texto-2"}`}>{texto}</span>
              </span>
              <span className="font-semibold num">{formatearPesos(p.valor)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Polizas({ contrato }: { contrato: Contrato }) {
  const { estado, hoy } = useApp();
  const { abrirSubida } = usePaneles();
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {contrato.polizas.map((p) => {
        const ob = p.obligacionAmpliacionId ? contrato.obligaciones.find((o) => o.id === p.obligacionAmpliacionId) : undefined;
        const s = ob ? situacionDe(ob, contrato, estado.evidencias, hoy) : undefined;
        const porAmpliar = s && s.estado !== "terminada" && s.estado !== "cumplida";
        return (
          <article key={p.id} className="lamina p-4">
            {porAmpliar && s ? <EstadoChip estado={s.estado} detalle="falta ampliarla por el otrosí" /> : <EstadoChip estado="cumplida" detalle="vigente" />}
            <h3 className="titulo-3 mt-1">{p.amparo}</h3>
            <p>
              {p.porcentaje} · {p.vigencia}
            </p>
            <p className="apoyo">Debe cubrir hasta el {fechaCompleta(p.vigenciaHasta)}</p>
            <FuenteChip contrato={contrato} fuente={p.fuente} />
            {porAmpliar && ob ? (
              <button type="button" className="btn mt-3 w-full" onClick={() => abrirSubida(contrato, ob, s?.vence)}>
                {ob.accion}
              </button>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function Documentos({ contrato }: { contrato: Contrato }) {
  const { abrirFuente } = usePaneles();
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {contrato.documentos.map((d) => {
        const p = d.paginas[0]!;
        const b = p.bloques[0]!;
        return (
          <li key={d.id}>
            <button
              type="button"
              className="lamina flex w-full items-center gap-3 p-4 text-left hover:border-texto-2"
              onClick={() => abrirFuente(contrato, { documentoId: d.id, bloqueId: b.id, clausula: b.clausula ?? d.nombre, pagina: p.numero })}
            >
              <FileText size={28} className="shrink-0 text-marca" aria-hidden />
              <span>
                <span className="font-semibold block">{d.nombre}</span>
                <span className="apoyo">{plural(d.paginas.length, "página extraída", "páginas extraídas")}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
