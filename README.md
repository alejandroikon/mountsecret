# LiveContracts – Contratista

> Sube tu contrato. Nosotros nos encargamos de que lo cumplas y lo cobres.

El gemelo digital del contrato, visto desde quien lo ejecuta. Sus agentes leen el contrato, convierten cada cláusula en obligaciones con su fuente, persiguen la evidencia y arman el informe y el paquete de cobro.

## Estado

| Fase | Estado |
|---|---|
| 0 · Reconocimiento | ✅ [`docs/plan.md`](docs/plan.md) |
| 1 · Diseño | ✅ [`docs/design-system.md`](docs/design-system.md) · [vista previa](docs/design-preview/index.html) · [formatos](docs/formatos.md) |
| 2 · Corte vertical | 🟡 `packages/dominio` listo con tests; sigue la app |

## Desarrollo

```bash
pnpm install
pnpm test        # tests de dominio (festivos, plazos, cronograma, cobro)
pnpm typecheck
```

Requiere Node 22 y pnpm 10.

## Estructura

```
packages/dominio/   Lógica pura: festivos de Colombia, días hábiles, cronograma con
                    prórrogas y suspensiones, vencimientos, semáforo, recordatorios,
                    valor en letras y amortización del anticipo.
docs/               Plan, sistema de diseño, formatos y capturas.
```

`Untitled.txt` es un texto previo al producto y no forma parte de la aplicación.
