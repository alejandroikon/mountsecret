import { describe, expect, it } from "vitest";
import { diasHabilesEntre, enesimoHabilDelMes, esHabil, sumarDiasHabiles, sumarMeses } from "../src";

describe("Días hábiles colombianos", () => {
  it("sábado y domingo no son hábiles; el sábado puede pactarse", () => {
    expect(esHabil("2026-11-14")).toBe(false);
    expect(esHabil("2026-11-14", { sabadoHabil: true })).toBe(true);
    expect(esHabil("2026-11-15", { sabadoHabil: true })).toBe(false);
  });

  it("salta el lunes festivo de la Ley Emiliani", () => {
    // Jueves 12 nov + 3 hábiles: vie 13, (lun 16 festivo), mar 17, mié 18.
    expect(sumarDiasHabiles("2026-11-12", 3)).toBe("2026-11-18");
  });

  it("salta Jueves y Viernes Santo", () => {
    expect(sumarDiasHabiles("2026-03-31", 3)).toBe("2026-04-07");
  });

  it("cruza el año nuevo", () => {
    expect(sumarDiasHabiles("2025-12-31", 1)).toBe("2026-01-02");
  });

  it("cuenta hacia atrás con n negativo", () => {
    expect(sumarDiasHabiles("2026-11-17", -1)).toBe("2026-11-13");
  });

  it("con n = 0 devuelve el mismo día si es hábil o el siguiente hábil", () => {
    expect(sumarDiasHabiles("2026-11-13", 0)).toBe("2026-11-13");
    expect(sumarDiasHabiles("2026-11-15", 0)).toBe("2026-11-17");
  });

  it("los días de suspensión no cuentan como hábiles", () => {
    const excluir = [{ desde: "2026-11-17", hasta: "2026-11-18" }];
    expect(sumarDiasHabiles("2026-11-13", 1, { excluir })).toBe("2026-11-19");
  });

  it("cuenta los días hábiles entre dos fechas (lo que falta)", () => {
    expect(diasHabilesEntre("2026-11-12", "2026-11-18")).toBe(3);
    expect(diasHabilesEntre("2026-11-18", "2026-11-12")).toBe(-3);
    expect(diasHabilesEntre("2026-11-12", "2026-11-12")).toBe(0);
  });

  it("enésimo día hábil del mes (enero de 2026 empieza con festivo)", () => {
    expect(enesimoHabilDelMes(2026, 1, 1)).toBe("2026-01-02");
    expect(enesimoHabilDelMes(2026, 1, 5)).toBe("2026-01-08");
  });

  it("rechaza días hábiles no enteros", () => {
    expect(() => sumarDiasHabiles("2026-11-12", 1.5)).toThrow(RangeError);
  });
});

describe("Meses calendario", () => {
  it("conserva el número de día y recorta a fin de mes", () => {
    expect(sumarMeses("2026-01-31", 1)).toBe("2026-02-28");
    expect(sumarMeses("2024-01-31", 1)).toBe("2024-02-29");
    expect(sumarMeses("2026-11-15", 3)).toBe("2027-02-15");
  });
});
