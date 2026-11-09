# Demo navegable · cómo probarla y desplegarla

> Fase 2 (corte vertical), versión demo: corre completa en el navegador, sin servidor, sin base de datos y sin clave de Claude.

## Qué se puede hacer

1. **Bienvenida:** aceptar la autorización de datos (Ley 1581) y elegir uno de los dos contratos de ejemplo.
2. **Lectura en vivo:** ver cómo aparecen fechas, pagos, obligaciones y pólizas, cada uno con su cláusula y página, mientras la Línea del contrato se dibuja.
3. **Revisar lo encontrado:** confirmar, editar o descartar cada obligación. Las de confianza baja salen primero, y las de confianza alta se pueden confirmar en bloque. Atajos de teclado: C, E y D.
4. **Hoy:** qué frena tu próximo pago, qué es para hoy y qué vence esta semana, con una sola acción por tarjeta.
5. **Tocar cualquier fuente** («Cláusula 5.2 · pág. 3») abre el documento con el texto resaltado.
6. **Subir evidencia:** con la cámara o un archivo, también sin conexión. El Verificador la revisa en unos segundos. Si el nombre del archivo dice «borrador», la rechaza y explica por qué.
7. **Paquete de cobro:** ver lo que falta, lo que está listo y la celebración al completarlo. Se puede ver e imprimir la cuenta de cobro con el valor en letras.
8. **Contrato:** la Línea ampliada y cinco pestañas: matriz de obligaciones, cronograma recalculado (suspensión y prórroga), pagos, pólizas y documentos.
9. **Preguntar:** cuatro preguntas frecuentes respondidas con cálculos sobre el contrato y su fuente.
10. **Tema claro u oscuro** (botón arriba) y **reiniciar la demo** (flecha circular).

Para presentar la demo siempre en el mismo día, agrega `?hoy=2026-11-09` a la dirección. Sin ese parámetro, usa la fecha de hoy en Bogotá y los estados cambian con los días, como pasaría en la realidad.

## Qué es real y qué es demostración

| Parte | En la demo |
|---|---|
| Festivos, días hábiles, plazos, prórrogas, suspensiones, vencimientos, semáforo, valor en letras y amortización del anticipo | **Real.** Es el motor `@lc/dominio`, con 83 tests. |
| Lectura del contrato | **Reproducida.** Muestra lo que el Lector extrae de los contratos de ejemplo. Un contrato propio todavía no se lee: falta conectar la clave de Claude en un servidor. |
| Verificador | **Simulado.** Acepta todo, salvo los archivos llamados «borrador». |
| Datos | Se guardan **solo en tu navegador** (localStorage). Nadie más los ve. |
| Correos y recordatorios | Aún no se envían. La escalera de fechas ya se calcula en el dominio. |

## Desplegar en Netlify (recomendado)

1. Entra a [app.netlify.com](https://app.netlify.com) y elige **Add new site → Import an existing project → GitHub**.
2. Elige el repo `alejandroikon/mountsecret` y la rama `claude/live-contracts-contratista-8nxtml`.
3. Netlify lee el `netlify.toml` del repo, así que no hay que configurar nada más. Dale **Deploy**.
4. En 2 a 3 minutos tienes una URL `https://<nombre>.netlify.app` que abre en el celular. Desde el menú del navegador, «Agregar a pantalla de inicio» la instala como app.

Cada vez que se suba un cambio a la rama, Netlify vuelve a publicar solo.

### Alternativa sin conectar GitHub: Netlify Drop

```bash
pnpm install
pnpm --filter web build
```

Luego arrastra la carpeta `apps/web/out` a [app.netlify.com/drop](https://app.netlify.com/drop).

## Correrla en tu computador

```bash
pnpm install
pnpm --filter web dev     # http://localhost:3000
```

Requiere Node 22 y pnpm 10.

## Lo que sigue para la versión real

1. **Servidor y base de datos:** Next.js deja de ser estático. Postgres con RLS (Neon o RDS) y almacenamiento S3 para los documentos.
2. **Lector con Claude:** extracción de texto con página y coordenadas, y las obligaciones llegando por SSE a esta misma pantalla de lectura. La clave va en una variable de entorno del servidor, nunca en el navegador.
3. **Verificador real**, recordatorios por correo, informe mensual y exportación a DOCX y PDF (fase 3).

Netlify sirve también para la versión real: soporta Next.js con servidor. La base de datos y la cola de agentes viven aparte.
