import { describe, expect, it } from "vitest";
import { amortizarAnticipo, formatearPesos, formatearPesosCorto, valorEnLetras } from "../src";

describe("Valor en letras (cuenta de cobro)", () => {
  it.each([
    [1, "UN PESO M/CTE"],
    [100, "CIEN PESOS M/CTE"],
    [101, "CIENTO UN PESOS M/CTE"],
    [1_001, "MIL UN PESOS M/CTE"],
    [21_000, "VEINTIÚN MIL PESOS M/CTE"],
    [1_000_000, "UN MILLÓN DE PESOS M/CTE"],
    [4_760_000, "CUATRO MILLONES SETECIENTOS SESENTA MIL PESOS M/CTE"],
    [31_000_000, "TREINTA Y UN MILLONES DE PESOS M/CTE"],
    [96_580_000, "NOVENTA Y SEIS MILLONES QUINIENTOS OCHENTA MIL PESOS M/CTE"],
    [482_900_000, "CUATROCIENTOS OCHENTA Y DOS MILLONES NOVECIENTOS MIL PESOS M/CTE"],
    [1_000_000_000, "MIL MILLONES DE PESOS M/CTE"],
    [2_500_000_001, "DOS MIL QUINIENTOS MILLONES UN PESOS M/CTE"],
  ])("%i → %s", (n, letras) => {
    expect(valorEnLetras(n)).toBe(letras);
  });

  it("rechaza decimales y negativos", () => {
    expect(() => valorEnLetras(10.5)).toThrow(/entero de pesos/);
    expect(() => valorEnLetras(-1)).toThrow(/entero de pesos/);
  });
});

describe("Formato de pesos", () => {
  it("es-CO con punto de miles", () => {
    expect(formatearPesos(4_760_000)).toBe("$ 4.760.000");
    expect(formatearPesos(0)).toBe("$ 0");
  });
  it("abreviado para la Línea", () => {
    expect(formatearPesosCorto(4_760_000)).toBe("$4,8M");
    expect(formatearPesosCorto(96_580_000)).toBe("$96,6M");
    expect(formatearPesosCorto(5_000_000)).toBe("$5M");
    expect(formatearPesosCorto(850_000)).toBe("$850 mil");
  });
});

describe("Amortización del anticipo (acta parcial de obra)", () => {
  const base = { valorContrato: 482_900_000, anticipo: 96_580_000 };

  it("descuenta proporcionalmente el 20 %", () => {
    expect(amortizarAnticipo({ ...base, ejecutadoPeriodo: 77_000_000, amortizadoAcumulado: 0 })).toEqual({
      amortizacionPeriodo: 15_400_000,
      amortizadoAcumulado: 15_400_000,
      saldoPorAmortizar: 81_180_000,
      netoAPagar: 61_600_000,
    });
  });

  it("nunca amortiza más que el saldo pendiente", () => {
    const r = amortizarAnticipo({ ...base, ejecutadoPeriodo: 77_000_000, amortizadoAcumulado: 90_000_000 });
    expect(r.amortizacionPeriodo).toBe(6_580_000);
    expect(r.saldoPorAmortizar).toBe(0);
  });

  it("resta otros descuentos del neto", () => {
    const r = amortizarAnticipo({ ...base, ejecutadoPeriodo: 77_000_000, amortizadoAcumulado: 0, otrosDescuentos: 3_850_000 });
    expect(r.netoAPagar).toBe(57_750_000);
  });

  it("rechaza un anticipo mayor que el contrato", () => {
    expect(() => amortizarAnticipo({ valorContrato: 10, anticipo: 20, ejecutadoPeriodo: 1, amortizadoAcumulado: 0 })).toThrow(
      /no puede superar/,
    );
  });
});
