import { describe, expect, it } from "vitest";
import { domingoDePascua, esFestivo, festivosDelAnio, festivosEn } from "../src";

describe("Domingo de Pascua", () => {
  it.each([
    [2000, "2000-04-23"],
    [2008, "2008-03-23"],
    [2019, "2019-04-21"],
    [2024, "2024-03-31"],
    [2025, "2025-04-20"],
    [2026, "2026-04-05"],
    [2027, "2027-03-28"],
    [2038, "2038-04-25"],
  ])("%i → %s", (anio, esperado) => {
    expect(domingoDePascua(anio)).toBe(esperado);
  });
});

describe("Festivos de Colombia (Ley 51 de 1983)", () => {
  it("2026: los 18 festivos oficiales, con traslados al lunes", () => {
    expect(festivosDelAnio(2026).map((f) => f.fecha)).toEqual([
      "2026-01-01", // Año Nuevo (jueves, no se traslada)
      "2026-01-12", // Reyes: martes 6 → lunes 12
      "2026-03-23", // San José: jueves 19 → lunes 23
      "2026-04-02", // Jueves Santo
      "2026-04-03", // Viernes Santo
      "2026-05-01",
      "2026-05-18", // Ascensión: Pascua + 39 (jueves 14) → lunes 18
      "2026-06-08", // Corpus: Pascua + 60 → lunes 8
      "2026-06-15", // Sagrado Corazón: Pascua + 68 (viernes 12) → lunes 15
      "2026-06-29", // San Pedro: ya es lunes
      "2026-07-20",
      "2026-08-07",
      "2026-08-17", // Asunción: sábado 15 → lunes 17
      "2026-10-12", // Día de la Raza: ya es lunes
      "2026-11-02", // Todos los Santos: domingo 1 → lunes 2
      "2026-11-16", // Independencia de Cartagena: miércoles 11 → lunes 16
      "2026-12-08",
      "2026-12-25",
    ]);
  });

  it("2025: San Pedro y Sagrado Corazón caen el mismo lunes 30 de junio", () => {
    const lista = festivosDelAnio(2025);
    expect(lista).toHaveLength(18);
    expect(new Set(lista.map((f) => f.fecha)).size).toBe(17);
    expect(festivosEn("2025-06-30").map((f) => f.clave).sort()).toEqual(["sagrado_corazon", "san_pedro_y_san_pablo"]);
  });

  it("los festivos fijos no se trasladan aunque caigan en domingo", () => {
    // 20 de julio de 2025 fue domingo.
    expect(esFestivo("2025-07-20")).toBe(true);
    expect(esFestivo("2025-07-21")).toBe(false);
  });

  it("registra la fecha original de un festivo trasladado", () => {
    const reyes = festivosDelAnio(2026).find((f) => f.clave === "reyes_magos");
    expect(reyes).toMatchObject({ fecha: "2026-01-12", trasladadoDesde: "2026-01-06" });
  });

  it("el día original de un festivo trasladado es hábil", () => {
    expect(esFestivo("2026-11-11")).toBe(false);
    expect(esFestivo("2026-11-16")).toBe(true);
  });

  it("rechaza años fuera del rango soportado con un mensaje útil", () => {
    expect(() => festivosDelAnio(1950)).toThrow(/entre 1984 y 2199/);
  });
});
