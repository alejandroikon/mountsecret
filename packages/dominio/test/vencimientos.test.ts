import { describe, expect, it } from "vitest";
import { estadoObligacion, periodosMensuales, programarRecordatorios, vencimientosMensuales, vencimientosSemanales } from "../src";

describe("Periodos y vencimientos mensuales", () => {
  it("el primer y el último periodo son parciales", () => {
    expect(periodosMensuales("2026-02-03", "2026-04-10")).toEqual([
      { desde: "2026-02-03", hasta: "2026-02-28", etiqueta: "2026-02" },
      { desde: "2026-03-01", hasta: "2026-03-31", etiqueta: "2026-03" },
      { desde: "2026-04-01", hasta: "2026-04-10", etiqueta: "2026-04" },
    ]);
  });

  it("informe dentro de los 5 primeros días hábiles del mes siguiente (abril cruza Semana Santa)", () => {
    const v = vencimientosMensuales({ inicio: "2026-02-03", fin: "2026-03-31", regla: { tipo: "habil_mes_siguiente", n: 5 } });
    expect(v.map((x) => [x.periodo.etiqueta, x.vence])).toEqual([
      ["2026-02", "2026-03-06"],
      ["2026-03", "2026-04-09"],
    ]);
  });

  it("día fijo del mes siguiente que cae en domingo se corre al siguiente hábil", () => {
    const v = vencimientosMensuales({ inicio: "2026-02-03", fin: "2026-02-28", regla: { tipo: "dia_mes_siguiente", dia: 15 } });
    expect(v[0]?.vence).toBe("2026-03-16");
  });

  it("N días hábiles después del corte", () => {
    const v = vencimientosMensuales({ inicio: "2026-10-01", fin: "2026-10-31", regla: { tipo: "habiles_tras_corte", n: 3 } });
    // Sáb 31 oct → lun 2 nov festivo → mar 3 (1), mié 4 (2), jue 5 (3).
    expect(v[0]?.vence).toBe("2026-11-05");
  });

  it("un mes completamente suspendido no genera informe, y el siguiente vence después de la suspensión", () => {
    const v = vencimientosMensuales({
      inicio: "2026-02-03",
      fin: "2026-03-31",
      regla: { tipo: "habil_mes_siguiente", n: 5 },
      opciones: { excluir: [{ desde: "2026-03-01", hasta: "2026-03-31" }] },
    });
    expect(v.map((x) => [x.periodo.etiqueta, x.vence])).toEqual([["2026-02", "2026-04-09"]]);
  });
});

describe("Vencimientos semanales", () => {
  it("backup de los viernes: el Viernes Santo pasa al lunes hábil", () => {
    expect(vencimientosSemanales({ inicio: "2026-03-30", fin: "2026-04-12", dia: 5 })).toEqual(["2026-04-06", "2026-04-10"]);
  });

  it("no genera vencimientos durante una suspensión", () => {
    const r = vencimientosSemanales({
      inicio: "2026-05-04",
      fin: "2026-05-31",
      dia: 5,
      opciones: { excluir: [{ desde: "2026-05-11", hasta: "2026-05-25" }] },
    });
    expect(r).toEqual(["2026-05-08", "2026-05-29"]);
  });
});

describe("Semáforo", () => {
  it("en riesgo a 3 días hábiles o menos", () => {
    expect(estadoObligacion({ hoy: "2026-11-12", vence: "2026-11-18", evidenciaAceptada: false })).toEqual({
      estado: "en_riesgo",
      diasHabiles: 3,
    });
  });

  it("pendiente con holgura", () => {
    expect(estadoObligacion({ hoy: "2026-11-12", vence: "2026-11-25", evidenciaAceptada: false }).estado).toBe("pendiente");
  });

  it("vencida el día después, con días hábiles de atraso negativos", () => {
    expect(estadoObligacion({ hoy: "2026-11-19", vence: "2026-11-18", evidenciaAceptada: false })).toEqual({
      estado: "vencida",
      diasHabiles: -1,
    });
  });

  it("solo la evidencia aceptada la hace cumplida", () => {
    expect(estadoObligacion({ hoy: "2026-11-19", vence: "2026-11-18", evidenciaAceptada: true }).estado).toBe("cumplida");
  });

  it("el día del vencimiento todavía no está vencida", () => {
    expect(estadoObligacion({ hoy: "2026-11-18", vence: "2026-11-18", evidenciaAceptada: false }).estado).toBe("en_riesgo");
  });
});

describe("Escalera de recordatorios", () => {
  it("T−5, T−2, T0 al responsable y T+1 al gerente, en días hábiles", () => {
    expect(programarRecordatorios({ vence: "2026-11-18", desde: "2026-11-01" })).toEqual([
      { fecha: "2026-11-10", a: "responsable", desplazamiento: -5 },
      { fecha: "2026-11-13", a: "responsable", desplazamiento: -2 },
      { fecha: "2026-11-18", a: "responsable", desplazamiento: 0 },
      { fecha: "2026-11-19", a: "gerente", desplazamiento: 1 },
    ]);
  });

  it("omite los recordatorios que ya pasaron", () => {
    const r = programarRecordatorios({ vence: "2026-11-18", desde: "2026-11-12" });
    expect(r.map((x) => x.desplazamiento)).toEqual([-2, 0, 1]);
  });

  it("si vence en festivo, el aviso del día sale el hábil anterior", () => {
    const r = programarRecordatorios({ vence: "2026-11-16", desde: "2026-11-01" });
    expect(r.find((x) => x.desplazamiento === 0)?.fecha).toBe("2026-11-13");
  });
});
