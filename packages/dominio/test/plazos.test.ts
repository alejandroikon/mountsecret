import { describe, expect, it } from "vitest";
import { ErrorDominio, type EventoContractual, avanceTiempo, calcularCronograma, estadoEnFecha, terminacionDesde } from "../src";

describe("Plazo desde el acta de inicio", () => {
  it("días calendario, conteo inclusivo: el día del acta es el día 1", () => {
    expect(terminacionDesde("2026-02-03", { cantidad: 120, unidad: "dias" })).toBe("2026-06-02");
  });

  it("días calendario, Código Civil: corre desde el día siguiente", () => {
    expect(terminacionDesde("2026-02-03", { cantidad: 120, unidad: "dias" }, "codigo_civil")).toBe("2026-06-03");
  });

  it("meses: inclusivo termina el día anterior; Código Civil, el mismo número de día", () => {
    expect(terminacionDesde("2026-02-01", { cantidad: 6, unidad: "meses" })).toBe("2026-07-31");
    expect(terminacionDesde("2026-02-01", { cantidad: 6, unidad: "meses" }, "codigo_civil")).toBe("2026-08-01");
  });

  it("días hábiles con festivo en medio", () => {
    // Viernes 13 nov: inclusivo cuenta el 13 como día 1 → 13, 17, 18.
    expect(terminacionDesde("2026-11-13", { cantidad: 3, unidad: "dias_habiles" })).toBe("2026-11-18");
    expect(terminacionDesde("2026-11-13", { cantidad: 3, unidad: "dias_habiles" }, "codigo_civil")).toBe("2026-11-19");
  });

  it("acta de inicio en día no hábil: el plazo hábil arranca el siguiente hábil", () => {
    // Domingo 15 → lunes 16 festivo → día 1 = martes 17.
    expect(terminacionDesde("2026-11-15", { cantidad: 1, unidad: "dias_habiles" })).toBe("2026-11-17");
  });

  it("rechaza plazos no positivos", () => {
    expect(() => terminacionDesde("2026-02-03", { cantidad: 0, unidad: "dias" })).toThrow(ErrorDominio);
  });
});

// Contrato semilla 2: obra de mejoramiento de vivienda.
const obra = {
  actaInicio: "2026-03-03",
  plazo: { cantidad: 6, unidad: "meses" as const },
  valorInicial: 482_900_000,
};
const suspensionLluvias: EventoContractual = { id: "acta-suspension-1", tipo: "suspension", desde: "2026-05-11", hasta: "2026-05-25" };
const prorrogaOtrosi1: EventoContractual = {
  id: "otrosi-1-prorroga",
  tipo: "prorroga",
  fecha: "2026-09-10",
  plazo: { cantidad: 45, unidad: "dias" },
};

describe("Cronograma con suspensión y prórroga", () => {
  it("sin eventos: 6 meses desde el 3 de marzo terminan el 2 de septiembre", () => {
    const c = calcularCronograma(obra);
    expect(c.terminacion).toBe("2026-09-02");
    expect(c.historial).toEqual([]);
  });

  it("una suspensión de 15 días corre la terminación 15 días calendario", () => {
    const c = calcularCronograma(obra, [suspensionLluvias]);
    expect(c.diasSuspendidos).toBe(15);
    expect(c.terminacion).toBe("2026-09-17");
  });

  it("suspensión + prórroga de 45 días: termina el 1 de noviembre", () => {
    const c = calcularCronograma(obra, [suspensionLluvias, prorrogaOtrosi1]);
    expect(c.terminacionInicial).toBe("2026-09-02");
    expect(c.terminacion).toBe("2026-11-01");
    expect(c.historial.map((p) => [p.eventoId, p.terminacionAntes, p.terminacionDespues])).toEqual([
      ["acta-suspension-1", "2026-09-02", "2026-09-17"],
      ["otrosi-1-prorroga", "2026-09-17", "2026-11-01"],
    ]);
  });

  it("aplica los eventos en orden cronológico aunque lleguen desordenados", () => {
    const c = calcularCronograma(obra, [prorrogaOtrosi1, suspensionLluvias]);
    expect(c.terminacion).toBe("2026-11-01");
    expect(c.historial[0]?.eventoId).toBe("acta-suspension-1");
  });

  it("la suspensión abre la ventana: sin ella, la prórroga del 10 de septiembre llega tarde", () => {
    expect(() => calcularCronograma(obra, [prorrogaOtrosi1])).toThrow(/después de la terminación vigente \(2026-09-02\)/);
  });

  it("prórroga en meses sobre la terminación ya corrida", () => {
    const c = calcularCronograma(obra, [
      suspensionLluvias,
      { id: "p", tipo: "prorroga", fecha: "2026-08-01", plazo: { cantidad: 1, unidad: "meses" } },
    ]);
    expect(c.terminacion).toBe("2026-10-17");
  });

  it("rechaza suspensiones superpuestas y explica cómo arreglarlo", () => {
    const otra: EventoContractual = { id: "s2", tipo: "suspension", desde: "2026-05-20", hasta: "2026-05-30" };
    expect(() => calcularCronograma(obra, [suspensionLluvias, otra])).toThrow(/Une las dos en una sola acta/);
  });

  it("rechaza una suspensión que termina antes de empezar", () => {
    const mala: EventoContractual = { id: "s", tipo: "suspension", desde: "2026-05-11", hasta: "2026-05-01" };
    try {
      calcularCronograma(obra, [mala]);
      expect.unreachable();
    } catch (e) {
      expect((e as ErrorDominio).codigo).toBe("SUSPENSION_INVALIDA");
    }
  });

  it("rechaza eventos anteriores al acta de inicio", () => {
    const antes: EventoContractual = { id: "x", tipo: "adicion", fecha: "2026-03-01", valor: 1 };
    expect(() => calcularCronograma(obra, [antes])).toThrow(/anterior al acta de inicio/);
  });

  it("otrosí con nueva fecha de terminación y cambio de valor", () => {
    const c = calcularCronograma(obra, [
      { id: "o", tipo: "otrosi", fecha: "2026-06-01", nuevaTerminacion: "2026-12-15", cambioValor: 50_000_000 },
    ]);
    expect(c.terminacion).toBe("2026-12-15");
    expect(c.valor).toBe(532_900_000);
    expect(c.advertencias).toEqual([]);
  });

  it("advierte cuando las adiciones superan el 50 % del valor inicial", () => {
    const c = calcularCronograma({ ...obra, valorInicial: 100 }, [
      { id: "a1", tipo: "adicion", fecha: "2026-04-01", valor: 30 },
      { id: "a2", tipo: "adicion", fecha: "2026-05-01", valor: 30 },
    ]);
    expect(c.valor).toBe(160);
    expect(c.advertencias.map((a) => [a.codigo, a.eventoId])).toEqual([["ADICION_SUPERA_50", "a2"]]);
  });
});

describe("Estado y avance del contrato", () => {
  const c = calcularCronograma(obra, [suspensionLluvias, prorrogaOtrosi1]);

  it.each([
    ["2026-03-02", "por_iniciar"],
    ["2026-03-03", "en_ejecucion"],
    ["2026-05-15", "suspendido"],
    ["2026-10-01", "en_ejecucion"],
    ["2026-11-01", "en_ejecucion"],
    ["2026-11-02", "terminado"],
  ] as const)("%s → %s", (fecha, estado) => {
    expect(estadoEnFecha(c, fecha)).toBe(estado);
  });

  it("el avance de tiempo no crece durante la suspensión", () => {
    expect(avanceTiempo(c, "2026-05-20")).toBeCloseTo(avanceTiempo(c, "2026-05-10"), 10);
    expect(avanceTiempo(c, "2026-03-01")).toBe(0);
    expect(avanceTiempo(c, "2026-11-01")).toBe(1);
  });
});
