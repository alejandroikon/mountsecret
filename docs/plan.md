# Live Contracts – Contratista · Plan de trabajo

> Fase 0, reconocimiento. Documento vivo: cada fase lo actualiza.
> Última actualización: 2026-11-08.

## 1. Lo que encontré en el repo

| Hallazgo | Implicación |
|---|---|
| El repo `mountsecret` solo contiene `Untitled.txt`, un relato narrativo («Montaña secreta») con 5 commits. | **No hay stack de COBRA V5** que respetar. Uso el stack por defecto del brief (§8). |
| No hay `package.json`, ni CI, ni convenciones de código, ni licencia. | Defino las convenciones aquí (§4) y quedan como propuesta revisable. |
| Entorno disponible: Node 22, pnpm 10, PostgreSQL 16 y Docker. | Desarrollo local con `docker compose` (Postgres + pgvector, MinIO y Mailpit) y sin servicios en la nube. |

**Decisión:** no toco `Untitled.txt`. El producto vive en carpetas nuevas. Si el relato no pertenece a este repo, conviene moverlo (ver duda 1).

## 2. Stack elegido y por qué

| Capa | Elección | Razón | Alternativa descartada |
|---|---|---|---|
| Monorepo | pnpm workspaces + Turborepo | El dominio (plazos, festivos) y los agentes se prueban sin levantar la web | Repo único plano: mezcla el dominio con la UI |
| Web | Next.js 15 (App Router), TypeScript estricto, React Server Components | Lo pide el brief; con RSC la pantalla Hoy carga rápido en 3G | — |
| Estilos | Tailwind v4 con tokens propios (ver `design-system.md`), componentes propios sobre Radix Primitives | Accesibilidad resuelta (foco, ARIA) sin heredar la estética de shadcn | shadcn/ui tal cual: el producto se vería genérico |
| Movimiento | Motion (Framer Motion) | Solo para la lectura en vivo y las respuestas a acciones del usuario | — |
| PWA y offline | Service worker (Serwist) + IndexedDB (Dexie) como cola de evidencias, con Background Sync y reintento manual | Los residentes de obra trabajan sin señal | — |
| i18n | `next-intl`, mensajes en `es-CO` (base) y `en` | Listo para inglés desde el día 1 | — |
| Base de datos | PostgreSQL 16 + pgvector + Drizzle ORM | SQL explícito, migraciones legibles y RLS declarable | Prisma: soporte de RLS incómodo |
| Multi-tenant | `organizacion_id` en cada tabla + RLS con `current_setting('app.org_id')` fijado por transacción | Aislamiento en la base, no solo en la app | — |
| Cola durable | **Inngest** (dev server local, self-host en producción) | Pasos durables, idempotencia por `event.id`, reintentos y reanudación. Sus `step.run` encajan con los lazos de COBRA. | Temporal: más poder, más operación. BullMQ: exige Redis y la durabilidad la construimos nosotros. |
| Tiempo real | SSE desde un route handler que escucha `LISTEN/NOTIFY` de Postgres | La lectura en vivo empuja cada obligación en cuanto se persiste | WebSockets: innecesario para un flujo unidireccional |
| Agentes | Claude API con tool use. Modelo por agente en `LC_MODEL_<AGENTE>`. Prompts en `/agents/<agente>/prompt.md` | Lo pide el brief | — |
| Documentos | S3 compatible (MinIO local), `pdfjs-dist` para texto con coordenadas, `ocrmypdf`/Tesseract (`spa`) para escaneados y `mammoth` para DOCX | Necesitamos coordenadas por página para resaltar la cláusula exacta | — |
| Visor | pdf.js propio con capa de resaltado por *bounding boxes* de la cláusula | La confianza se ve: el toque lleva al texto resaltado | — |
| Exportación | `docx` (plantilla del cliente con marcadores) y PDF con Playwright | Respeta la plantilla que sube el cliente | — |
| Auth y MFA | Better Auth con los plugins `twoFactor` (TOTP + códigos de respaldo) y `organization` | MFA nativo, obligatorio por política para administradores | Auth.js: sin MFA nativo |
| Correo | Adaptador `Notificador` → SMTP (Mailpit local). WhatsApp y Slack quedan para v2 con la misma interfaz | Adaptadores intercambiables | — |
| Tests | Vitest (dominio y agentes), Playwright (E2E), axe y Lighthouse CI (a11y ≥ 95) | Criterios de aceptación medibles | — |

## 3. Arquitectura de carpetas propuesta

```
apps/web/                 Next.js (UI, route handlers, SSE, PWA)
packages/dominio/         Lógica pura: plazos, festivos CO, cronograma, semáforo, requisitos de pago
packages/db/              Esquema Drizzle, migraciones, políticas RLS, semillas
packages/agentes/         Runtime de agentes: cliente Claude, herramientas, bitácora, umbral de confianza
packages/documentos/      Ingesta: PDF/DOCX → páginas → bloques con coordenadas → cláusulas
packages/notificaciones/  Adaptadores: correo (MVP), WhatsApp y Slack (v2)
agents/<agente>/prompt.md Prompts versionados (lector, perseguidor, verificador, redactor, tesorero, consulta, director)
agents/<agente>/evals/    Casos anotados a mano y script de precisión/cobertura
seed/contratos/           Fuentes de los 2 contratos demo + PDF generados
docs/                     plan.md, design-system.md, decisiones (ADR), capturas por fase
```

## 4. Convenciones

- Código y nombres de dominio en español cuando son conceptos del negocio (`Obligacion`, `Hito`, `diasHabiles`). Infraestructura técnica en inglés (`queue`, `handler`).
- Commits pequeños con el prefijo de Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`) y el mensaje en español.
- Ninguna cadena visible al usuario queda en el código: todas van a `messages/es-CO.json`.
- Toda mutación pasa por una acción de servidor que escribe en la bitácora.

## 5. Cómo cumpliremos cada regla de los agentes

| Regla | Mecanismo |
|---|---|
| Toda afirmación cita su fuente | La herramienta `registrar_obligacion` **exige** `documento_id`, `clausula` y `pagina`. Si una salida no trae fuente, se guarda con `estado_soporte = 'sin_soporte'` y la UI la marca. |
| Nada «cumplida» sin evidencia | Restricción en la base: `obligacion.estado = 'cumplida'` exige al menos una `evidencia.verificacion = 'aceptada'` (trigger). |
| Aprobación humana para salir | Toda salida externa es un `Borrador` que solo pasa a `enviado` con una fila en `Aprobacion` firmada por un usuario. |
| Bitácora auditable | `EjecucionAgente` (agente, versión del prompt, modelo, hash de la entrada, salida, tokens, confianza) + `Aprobacion`. Tabla *append-only*: RLS sin UPDATE ni DELETE, más un hash encadenado. |
| Confianza y umbral | Cada herramienta devuelve `confianza ∈ [0,1]`. Por debajo de `LC_UMBRAL_CONFIANZA` (por defecto 0,75) la UI la manda a «Revisar». |
| Durables e idempotentes | Funciones Inngest con clave de idempotencia `(documento_id, version_prompt)`. Cada cláusula es un `step.run`, así que se reanudan sin duplicar. |
| Modelo configurable | `LC_MODEL_LECTOR`, `LC_MODEL_VERIFICADOR`, etc., con un `LC_MODEL_DEFAULT` como respaldo. |

## 6. Estrategia para los criterios de rendimiento

- **Primera obligación en menos de 20 s:** la ingesta parte el documento por cláusulas (segmentación heurística por numeración y títulos) y el Lector procesa primero las cláusulas de «Obligaciones» y «Forma de pago» con *streaming*. Cada `tool_use` completo se persiste y se emite por SSE de inmediato. El OCR de escaneados corre por página en paralelo, y las primeras páginas se procesan antes que el resto.
- **Matriz completa en menos de 3 min (30 a 60 páginas):** las cláusulas se procesan en paralelo (concurrencia configurable). El Director consolida y deduplica al final.
- **El 100 % con referencia:** es un invariante de esquema, verificado en las evals y en los tests.

## 7. Modelo de negocio en el esquema

La unidad facturable es el **contrato activo**. `Contrato` lleva `activo_desde`, `activo_hasta` y `plan`. Existe además una tabla `PeriodoFacturable(organizacion_id, contrato_id, mes)` que se llena por cron. No hay puestos por usuario y no se implementa cobro en v1.

## 8. Supuestos (decididos para no bloquear)

1. **No existe un repo COBRA V5 accesible**, así que construyo el motor aquí con los mismos nombres de lazos para facilitar una fusión futura.
2. **Jurisdicción:** Colombia. Moneda COP. Zona horaria `America/Bogota`. Los plazos son hábiles cuando la cláusula dice «hábiles»; si no lo especifica, se toman como calendario y el Lector marca la ambigüedad con baja confianza.
3. **Festivos:** se calculan con un algoritmo propio (Ley 51 de 1983, «Ley Emiliani», más festivos móviles ligados a la Pascua). No dependemos de APIs externas. Cubre de 1984 a 2100.
4. **Sábado no hábil**, salvo configuración del contrato (algunas obras pactan el sábado como hábil).
5. **Suspensión:** congela el plazo. La fecha de terminación se corre los días calendario de la suspensión, y una prórroga suma a la fecha vigente en ese momento. Los eventos se aplican en orden cronológico de firma.
6. **Las plantillas del cliente** son DOCX con marcadores `{{campo}}`. Damos plantillas base para informe mensual y cuenta de cobro.
7. **Persona natural:** el paquete de cobro incluye «cuenta de cobro» y «planilla PILA». La pyme usa «factura» (electrónica fuera de alcance, se adjunta el PDF).
8. **Correo de recordatorios** con la escalera: el responsable a T−5, T−2 y T0 días hábiles, y el gerente a T+1 si no hay evidencia. Configurable.
9. **El idioma del contrato** es español. El Lector traduce solo las etiquetas de UI, nunca el texto citado.
10. **Datos personales:** la autorización de tratamiento (Ley 1581) se pide en el onboarding con casilla explícita y versión de la política registrada.
11. **Despliegue de referencia:** contenedores. Los backups se hacen con `pg_dump` diario cifrado a S3, más un job semanal de restauración en una base efímera con *smoke test*. Queda documentado en `docs/operacion/backups.md` (fase 2).

## 9. Dudas bloqueantes (máximo 5)

1. **¿Existe código o esquema de COBRA V5 que debamos reutilizar?** Este repo (`mountsecret`) solo tiene un relato. Si hay un repo del motor, la arquitectura de §2 se adapta a él. *Mientras tanto: supuesto 1.*
2. **¿Proveedor de modelos y residencia de datos?** Puede ser Claude API directo, Bedrock o Vertex. Afecta la transferencia internacional de datos personales bajo la Ley 1581. *Mientras tanto: API directa configurable.*
3. **¿Nube y región objetivo?** Afecta S3, KMS y la estrategia de backups. *Mientras tanto: todo compatible con S3 y Postgres estándar.*
4. **¿Hay lineamientos de marca de Live Contracts o INTERKONT** (logo, color, tipografía) que deban mandar sobre la propuesta de `design-system.md`? *Mientras tanto: identidad nueva.*
5. **¿Tenemos plantillas reales** (informe de actividades, cuenta de cobro de una entidad distrital, acta parcial de obra) para calibrar el Redactor y las evals? *Mientras tanto: las fabricamos en las semillas.*

## 10. Fases y entregables

| Fase | Entregable | Estado |
|---|---|---|
| 0 · Reconocimiento | Este documento | ✅ |
| 1 · Diseño | `docs/design-system.md` + vista previa `docs/design-preview/` + capturas | ✅ **En espera de aprobación** |
| 2 · Corte vertical | Monorepo, esquema + RLS, `packages/dominio` con tests de plazos, ingesta + Lector, onboarding, lectura en vivo, validación, matriz, cronograma, Hoy y semillas con PDF | Pendiente |
| 3 · Cumplimiento y cobro | Evidencias offline, Verificador, Perseguidor + correo, Redactor (informe), Tesorero (paquete de cobro), exportación DOCX/PDF | Pendiente |
| 4 · v2 | Garante, Interlocutor, Abogado, Cartógrafo, Liquidador, portafolio y conectores técnicos | Pendiente |

Al cierre de cada fase: pasos de demo, capturas, autocrítica de diseño y tests en verde.

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| La segmentación de cláusulas falla en PDF mal escaneados | Respaldo por ventanas de páginas con superposición. Si no se identifica la cláusula, la fuente queda como «pág. N, sin numeral» con confianza baja y va a revisión. |
| Alucinación de obligaciones | La herramienta exige una cita textual (`cita`) que se valida contra el texto de la página (coincidencia difusa ≥ 0,9). Si no coincide, se rechaza. |
| Usuarios en campo con conexión pobre | Cola offline, compresión de imagen en el cliente (máx. 1600 px, WebP) y subida en partes reanudable. |
| La lectura en vivo se vuelve «teatro» | La animación solo muestra eventos reales del backend. Nada se simula. |
