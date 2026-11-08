# Live Contracts – Contratista · Sistema de diseño

> Fase 1, **revisión 2: alineada con la marca LiveContracts** (capturas de `cobrav5.netlify.app` del 8 nov 2026).
> Vista previa navegable: `docs/design-preview/index.html`. Capturas: `docs/design-preview/capturas/`.

Tema emocional: **control, calma y certeza frente al riesgo contractual**. La sensación es tener un copiloto al que no se le escapa nada.

---

## 1. Dos direcciones

### Dirección A · «Expediente»

El contrato como expediente notarial bien llevado. Carpetas con pestañas, papel, tinta y un **sello de lacre** que «estampa» cada obligación cuando el Verificador acepta su evidencia.

| Nombre | Hex | Rol |
|---|---|---|
| Tinta | `#1B2A4A` | Texto y superficies oscuras |
| Papel | `#F7F8FA` | Fondo |
| Lacre | `#9E2235` | Acento: el sello |
| Latón | `#8C6A1F` | Acento secundario (pólizas, dinero) |
| Grafito | `#3B4252` | Texto secundario |

- **Tipografía:** IBM Plex Sans (UI) + IBM Plex Serif (títulos).
- **Audacia:** el sello animado de verificación.
- **Layout:** pestañas de carpeta por sección (Obligaciones · Pólizas · Pagos · Bitácora).

### Dirección B · «Horizonte» ✅ elegida

El contrato como **una línea en el tiempo**, viva, que va del acta de inicio a la liquidación. Así como una app de inversión pone en el centro la línea de tu portafolio, aquí el centro es **la línea de tu contrato**. Muestra dónde estás hoy, qué pagos vienen, cuánta plata desbloquea cada uno y qué los tiene en riesgo. Todo lo demás es sobrio, con fondos fríos, mucho aire, cifras grandes y una sola acción por tarjeta.

- **Audacia concentrada en un lugar: la Línea del contrato.** Se *dibuja a sí misma* durante la lectura en vivo, a medida que el Lector encuentra fechas, hitos y pagos. Ese es el único momento orquestado del producto.

### Por qué elijo Horizonte

| Criterio | Expediente | Horizonte |
|---|---|---|
| Emoción objetivo (calma y control) | Evoca el trámite y la burocracia, justo lo que le da miedo al contratista | Evoca orientación: «sé dónde estoy y qué viene» |
| Promesa de cobro | El dinero es secundario en la metáfora | Cada pago es un hito visible en la Línea, con su monto |
| Fintech moderna (referente Robinhood) | Pesada y ornamental | Cifras grandes, una línea protagonista, botones enormes |
| Semáforo | El rojo lacre del acento choca con «Vencida» | El acento (Ciruela) queda libre de significados de estado |
| Mobile-first en obra | Las pestañas de carpeta no caben en 360 px | Una columna, una línea horizontal desplazable |
| Riesgo de verse genérica | IBM Plex + sello es un recurso visto en productos «serios» | La Línea como eje de navegación es propia del dominio (plazos) |

### Revisión 2 · Horizonte con la marca LiveContracts

Las capturas de COBRA V5 / LiveContracts muestran una identidad clara:
- un **ciruela casi negro** en la navegación;
- un **gradiente frambuesa → mandarina** en el logo (anillo con pulso) y en la cabecera;
- acentos frambuesa y mandarina en cifras y títulos;
- fondos con tinte rosado;
- una geométrica redondeada (tipo Lexend) en el logotipo y los títulos.

Horizonte se queda con su idea (la Línea) y se viste con esa marca:

| De la marca adoptamos | Cómo lo usamos aquí |
|---|---|
| Ciruela como color profundo | Texto principal, botón primario y fondo del modo oscuro. Reemplaza al Noche y al Cobalto: **la acción es ciruela**, sobria y con mucho contraste. |
| Gradiente frambuesa → mandarina | **Un solo lugar:** el tramo recorrido de la Línea del contrato (del acta de inicio a hoy), además del logo. Así, la firma de la marca *es* el progreso del contrato. |
| Frambuesa | Marcador «Hoy», anillo de foco y momentos de marca. **Nunca** en un estado del semáforo. |
| Tipografía geométrica de marca | Lexend para títulos y cifras. |
| Tinte cálido de fondo | Bruma: un gris lavanda muy suave, más calmado que el rosado de la entidad. |

Lo que **no** adoptamos de la interfaz de COBRA (lado entidad), y por qué:
- **Etiquetas en mayúsculas** («LÍNEA DE ACCIÓN», «DASHBOARD»). El brief las prohíbe, y en el celular del residente cansan. Usamos oraciones.
- **Cabecera con gradiente en todas las pantallas.** Diluye la firma. Aquí el gradiente vive solo en la Línea y el logo.
- **Tablero de donas y KPI como inicio.** El contratista empieza en «Hoy», no en indicadores.
- **Íconos dentro de cuadros rosados en cada campo.** Es ruido visual. Los íconos se reservan para estados y acciones.

Esto mantiene a LiveContracts – Contratista reconocible como hermano de COBRA, pero con una voz propia, la del lado del contratista.

---

## 2. Principios de la marca

1. **La línea manda.** Toda pantalla responde a «¿dónde estoy en el contrato?». Las obligaciones, pagos y pólizas se ubican en el tiempo del contrato, nunca en un tablero sin fechas.
2. **Dos voces.** La voz del contrato (serif, citada textual, nunca reescrita) y la nuestra (sans, directa, en segunda persona). El usuario siempre sabe quién habla: el documento o el copiloto.
3. **Plata primero.** Un riesgo se expresa en lo que bloquea: «Esto frena el pago de noviembre ($ 4.760.000)», no «Obligación 4.2.3 vencida».
4. **Calma por defecto, alarma con razón.** El ladrillo (vencida) es escaso: como máximo un elemento de alarma destacado por pantalla fuera de las listas. Si todo es urgente, nada lo es.
5. **Prueba a un toque.** Ningún estado aparece sin su porqué. «Cumplida» abre la evidencia y una obligación abre la cláusula resaltada en su página.

---

## 3. Paleta (Horizonte · marca LiveContracts)

Hay **cuatro colores de marca** y **tres de semáforo**. Los grupos no se mezclan: un color de marca nunca comunica un estado.

### Marca

| Nombre | Claro | Oscuro | Rol | Contraste (claro / oscuro) |
|---|---|---|---|---|
| **Ciruela** | `#1E0F2E` | `#F3EEF6` como texto · `#140A20` como fondo | Texto principal y **botón primario** (blanco sobre ciruela: 18 : 1). En oscuro, el botón es Rubor `#F7C6D6` con texto ciruela (12,8 : 1). | 18,1 : 1 / 16,8 : 1 |
| **Bruma** | `#F6F4F8` | `#21132F` (superficie oscura) | Fondo claro, lavanda casi neutro | — |
| **Frambuesa** | `#C8234F` | `#FF7A9C` | Marcador «Hoy», foco, logo e inicio del gradiente. **Nunca en estados.** | 5,5 : 1 / 7,8 : 1 |
| **Mandarina** | `#D4702A` (gráfico) | `#F59A5B` | Final del gradiente de la Línea y del logo. **No se usa como texto en claro.** Si hiciera falta, la versión para texto es `#B85A1A` (4,65 : 1). | 3,0 : 1 (gráfico) / 8,8 : 1 |

Gradiente de marca: `linear-gradient(90deg, Frambuesa, Mandarina)`. Solo se usa en el tramo recorrido de la Línea y en el logo.

### Semáforo

| Nombre | Claro | Oscuro | Estado | Contraste |
|---|---|---|---|---|
| **Páramo** | `#17784F` | `#5CCB97` | Cumplida y paquete completo | 5,5 : 1 / 9,6 : 1 |
| **Ámbar** | `#8A6200` | `#E9BC4F` | En riesgo (más amarillo que la Mandarina para no confundirse) | 5,5 : 1 / 10,8 : 1 |
| **Ladrillo** | `#B3261E` | `#FF8A78` | Vencida y error bloqueante | 6,5 : 1 / 8,4 : 1 |

Neutro de apoyo: **Pizarra** `#5A4E66` / `#B8ABC6` para texto secundario (7,7 : 1 / 8,9 : 1).

> Frambuesa y Ladrillo son parecidos (contraste 1,19 : 1 entre ellos). Por eso Frambuesa nunca toca un estado. Además, «Vencida» siempre lleva octágono y texto, y «Hoy» es una línea vertical, no un relleno.

### Tokens

```css
:root {
  --c-fondo: #F6F4F8;      --c-superficie: #FFFFFF;   --c-borde: #E2DCE8;
  --c-texto: #1E0F2E;      --c-texto-2: #5A4E66;
  --c-accion: #1E0F2E;     --c-accion-texto: #FFFFFF;
  --c-marca: #C8234F;      --c-marca-2: #D4702A;
  --g-marca: linear-gradient(90deg, var(--c-marca), var(--c-marca-2));
  --c-cumplida: #17784F;   --c-riesgo: #8A6200;       --c-vencida: #B3261E;
  --c-cumplida-suave: #E3F2EA; --c-riesgo-suave: #F8EFD6; --c-vencida-suave: #FAE4E1;
  --c-hoja: #FFFFFF;       /* el documento */
  --foco: 0 0 0 2px var(--c-fondo), 0 0 0 4px var(--c-marca);
}
[data-theme="dark"] {
  --c-fondo: #140A20;      --c-superficie: #21132F;   --c-borde: #3A2A4A;
  --c-texto: #F3EEF6;      --c-texto-2: #B8ABC6;
  --c-accion: #F7C6D6;     --c-accion-texto: #140A20;
  --c-marca: #FF7A9C;      --c-marca-2: #F59A5B;
  --c-cumplida: #5CCB97;   --c-riesgo: #E9BC4F;       --c-vencida: #FF8A78;
  --c-cumplida-suave: #12332A; --c-riesgo-suave: #3A2E0E; --c-vencida-suave: #3D1B18;
  --c-hoja: #F7F8FA;       /* el papel sigue claro: el contrato se lee como papel */
}
```

---

## 4. Tipografía

| Rol | Familia | Pesos | Uso |
|---|---|---|---|
| **Cifras y títulos** | Lexend | 600, 700 | Montos, nombre del contrato, títulos de pantalla. Es la geométrica de la marca LiveContracts (*supuesto: confirmar con el archivo del logo*). Se diseñó para lectura fácil, lo que encaja con «sin sufrir». |
| **Interfaz** | Source Sans 3 | 400, 600 | Todo el texto de la UI. Numerales tabulares (`font-variant-numeric: tabular-nums`) en fechas, montos de tabla y conteos. **Sin monoespaciada.** |
| **Voz del contrato** | Source Serif 4 | 400, 400 itálica | Solo para citas textuales de cláusulas y en el visor. Es la «segunda voz» del principio 2. |

Escala (base de 17 px en móvil por legibilidad en campo; razón ≈ 1,25):

| Token | Tamaño / interlínea | Familia | Ejemplo |
|---|---|---|---|
| `cifra-xl` | 48 / 52 | Lexend 700, numerales proporcionales | **$ 4.760.000** en Hoy (los tabulares abren huecos en los puntos de miles a este tamaño) |
| `titulo-1` | 34 / 40 | Lexend 700 | «Te faltan 3 cosas para cobrar noviembre» |
| `titulo-2` | 26 / 32 | Lexend 600 | Encabezado de sección |
| `titulo-3` | 21 / 28 | Source Sans 600 | Título de tarjeta |
| `cuerpo-l` | 19 / 28 | Source Sans 400 | Texto destacado y botones grandes |
| `cuerpo` | 17 / 26 | Source Sans 400 | Texto general |
| `apoyo` | 15 / 22 | Source Sans 400 | Metadatos, fuente («Cláusula 7.2 · pág. 12») |
| `minimo` | 13 / 18 | Source Sans 600 | Solo las marcas de la Línea. Nunca texto corrido. |
| `cita` | 18 / 30 | Source Serif 400 | Texto del contrato |

Reglas:
- Sin etiquetas en mayúsculas sostenidas. Las secciones usan oraciones: «Para hoy», «Esta semana», «Frena tu próximo pago».
- Botones en mayúscula inicial, sin flechas decorativas. «Subir evidencia», no «SUBIR →».
- El texto escala con el zoom del sistema (`rem`) y la UI no se rompe al 200 %.

---

## 5. Concepto de layout

- **Móvil (360–767 px):** una columna con márgenes de 20 px. Barra inferior de 4 destinos: **Hoy · Contratos · Subir · Preguntar**. «Subir» abre la cámara o el selector directo a la obligación sugerida. Los objetivos táctiles miden ≥ 48 px y los botones primarios 56 px de alto, a todo el ancho.
- **Escritorio (≥ 1024 px):** riel izquierdo de navegación (72 px, ícono + etiqueta), contenido de hasta 1200 px y un **panel de contexto derecho** que se abre al tocar una fuente: el visor del documento con la cláusula resaltada, sin perder la pantalla de origen.
- **Superficies:** tres tipos, no un kit de tarjetas idénticas.
  - **Lámina:** plana, borde de 1 px y sin sombra. Para listas y matrices.
  - **Tarea:** la tarjeta de Hoy. Tiene un riel de estado de 4 px a la izquierda (color + ícono + texto), un título, una línea de contexto y **un solo botón**.
  - **Hoja:** el documento. Es la **única** superficie con sombra, porque es papel.
- **Radios:** 12 px en las superficies, 999 px en los botones primarios (píldora, gesto fintech) y 4 px en las Hojas.
- **Espaciado:** base de 4 px y escala 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64.

### La Línea del contrato (componente insignia)

```
 Acta de inicio                      Hoy                         Terminación
 3 feb 2026                           │                          (prorrogada) 15 dic 2026
 ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃━ ━ ━ ━ ━ ━ ◆ ━ ━ ━ ━ ━ ━ ━ ◆ ━ ━ ━ ━ ━ ━ ━ ┅┅┅┅●
      ✓ $4,7M   ✓ $4,7M   ✓ $4,7M     ┃           ⚠ $4,7M        ○ $4,7M         prórroga +30 d
                                       ┃           30 nov         31 dic
             ░░░░ suspensión 12 d ░░░░
```

- **Pasado (recorrido):** trazo de 6 px con el gradiente de marca Frambuesa → Mandarina. Es el único gradiente del producto. **Futuro:** trazo discontinuo Pizarra. **Hoy:** línea vertical Frambuesa a toda la altura, con la etiqueta «Hoy».
- **Pagos:** rombos con monto encima y estado debajo (ícono + texto en la versión ampliada). Si un pago tiene algo en riesgo, su rombo lleva el ícono de riesgo **y** el texto.
- **Eventos contractuales:** las suspensiones son una franja rayada bajo la línea. Las prórrogas y adiciones son un tramo punteado (┅) al final, con su etiqueta.
- **Interacción:** se desplaza horizontalmente en móvil (con *snap* por mes) y con las flechas del teclado en escritorio. Cada rombo es un botón que lleva a su **Paquete de cobro**.
- **Accesibilidad:** el SVG es decorativo (`aria-hidden`) y debajo hay una lista ordenada equivalente para lectores de pantalla («Pago 4 de 6, 30 de noviembre, 4.700.000 pesos, en riesgo: falta planilla de aportes»).

---

## 6. Semáforo de estados (nunca solo color)

La forma también cambia, así que el estado se lee en escala de grises y con daltonismo.

| Estado | Ícono (Phosphor) | Forma | Texto | Color |
|---|---|---|---|---|
| Cumplida | `CheckCircle` relleno | círculo | «Cumplida» + «Ver evidencia» | Páramo |
| En riesgo | `Warning` | triángulo | «En riesgo · vence el martes» | Ámbar |
| Vencida | `WarningOctagon` | octágono | «Vencida hace 3 días» | Ladrillo |
| Pendiente | `CircleDashed` | círculo punteado | «Pendiente · 28 nov» | Pizarra |
| Por revisar | `Eye` | — | «Por revisar · confianza baja» | Ciruela, contorno |
| Sin soporte | `FileDashed` | — | «Sin soporte» | Pizarra, tachado sutil del monto en informes |

---

## 7. Movimiento

**Un solo momento orquestado: la lectura en vivo.** Todo lo demás responde a una acción y dura entre 120 y 200 ms con *ease-out*.

Coreografía de la lectura (cada paso lo dispara un evento real del backend por SSE; nada es simulado):

1. **Página leída:** la miniatura de la página en el carril del documento pasa de gris a nítida (opacidad 0,4 → 1, en 200 ms).
2. **Cláusula detectada:** una banda Frambuesa al 12 % barre esa zona de la página (300 ms).
3. **Obligación encontrada:** la fila entra en la lista desde abajo (8 px, 220 ms) con su chip de fuente. El contador del grupo sube con un *tick* numérico.
4. **Fecha, hito o pago encontrado:** la **Línea se extiende** hasta esa fecha (trazo animado, 400 ms) y aparece el rombo del pago con su monto. Es el momento cumbre.
5. **Fin:** la Línea queda completa, el marcador «Hoy» cae en su lugar y aparece el resumen («Encontré 42 obligaciones, 6 pagos y 3 pólizas. 5 necesitan tu revisión.») con el botón **Revisar lo encontrado**.

- **`prefers-reduced-motion`:** no hay desplazamientos ni trazos animados. Los elementos aparecen en su sitio y un `aria-live="polite"` anuncia cada hallazgo, agrupado cada 3 s para no saturar.
- **Celebración del paquete de cobro completo:** el rombo del pago se rellena de Páramo, el monto pasa a «Listo para radicar» y hay una vibración háptica corta (`navigator.vibrate(30)`, solo si el usuario no reduce el movimiento). No hay confeti.

---

## 8. Wireframes

### 8.1 Hoy (móvil, 360 px)

```
┌──────────────────────────────────────┐
│ Soporte SDH-114 ▾              (AG)  │  ← selector de contrato · avatar
│                                      │
│ Sábado 8 de noviembre                │  apoyo
│ Te faltan 3 cosas para               │  titulo-1
│ cobrar noviembre                     │
│ $ 4.760.000                          │  cifra-xl
│ ●━━━━━━━━━━━━━━┃━ ━ ━◆━ ━ ━ ━ ━ ◆ ━ ●│  Línea compacta
│              hoy    30 nov    31 dic │
│                                      │
│ Frena tu próximo pago                │  titulo-2
│ ┃ ⚠ En riesgo · vence el martes      │  Tarea
│ ┃ Planilla de aportes de octubre     │
│ ┃ Cláusula 9.1 · pág. 14             │  chip de fuente (toca → visor)
│ ┃ ( Subir planilla                 ) │  botón 56 px, píldora
│                                      │
│ ┃ ◌ Pendiente · 28 nov               │
│ ┃ Informe mensual de actividades     │
│ ┃ 11 de 14 obligaciones con evidencia│
│ ┃ ( Revisar borrador               ) │
│                                      │
│ Para hoy                             │
│ ┃ ⚠ Backup semanal sin evidencia     │
│ ┃ Anexo técnico 3.4 · pág. 6         │
│ ┃ ( Subir captura                  ) │
│                                      │
│ Esta semana                          │
│  ✓ Doble factor activo · Ver         │  Lámina compacta
│  ◌ Reunión de seguimiento · jue 13   │
│  ◌ Renovar póliza de cumplimiento    │
├──────────────────────────────────────┤
│  ◉ Hoy   ▢ Contratos  ⊕ Subir  ? Pregun│  barra inferior
└──────────────────────────────────────┘
```

Estado vacío (sin contratos): «Sube tu contrato y en unos minutos te decimos qué tienes que cumplir y cuándo te pagan.» + zona de arrastre + **Subir contrato**.

### 8.2 Hoy (escritorio, gerente con varios contratos)

```
┌────┬──────────────────────────────────────────────────────────────┬───────────────┐
│ ◉  │ Buenos días, Andrea                                          │ Por cobrar     │
│Hoy │ 2 contratos tienen algo que frena el pago                    │ este mes       │
│ ▢  │                                                              │ $ 61.300.000   │
│Ctos│ ┌ Soporte SDH-114 ───────────────────────────────────────┐   │ ▁▃▅▇ 4 pagos   │
│ ⊕  │ │ ●━━━━━━━━━━━━━━━┃━ ━ ━◆━ ━ ━ ━ ◆ ━ ━ ●     $14,3M      │   │               │
│Subir│ │ ⚠ Planilla de aportes · vence mar  ( Subir planilla ) │   │ Pólizas        │
│ ?  │ └────────────────────────────────────────────────────────┘   │ ⚠ 1 vence en   │
│Preg│ ┌ Mejoramiento Vivienda Usme Lote 3 ─────────────────────┐   │   18 días      │
│    │ │ ●━━━━━━━━━━━━━━━━━━━━━┃━ ◆━ ━ ━ ━┅┅┅●       $47,0M    │   │               │
│    │ │ ⊘ Vencida · registro fotográfico acta parcial 4        │   │ Equipo         │
│    │ │                         ( Asignar a Jhon )              │   │ Jhon · 3 pend. │
│    │ └────────────────────────────────────────────────────────┘   │ Laura · al día │
│    │ Esta semana (7)                                     Ver todo │               │
│    │ ─ lista Lámina ─                                             │               │
└────┴──────────────────────────────────────────────────────────────┴───────────────┘
```

### 8.3 Contrato

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ‹ Contratos                                                              │
│ Mejoramiento de vivienda · Usme, lote 3            Obra · $ 482.900.000   │
│ Caja de Vivienda Popular (ficticia) · CVP-OBR-2026-031                   │
│                                                                          │
│ ████████████████ LA LÍNEA (ampliada, altura 160 px) ████████████████████ │
│ ●━━━━━━━━━━━◆━━━━━━━━◆━━━━━━━━┃━━ ━ ◆ ━ ━ ━ ━ ◆ ━ ━ ┅┅┅┅┅┅┅●              │
│ inicio   anticipo   acta 1   hoy   acta 3    acta 4  prórroga +45 d      │
│ 3 mar    ✓ $96,6M   ✓ $77M        ⚠ $77M    ○ $77M   Otrosí 1 · 10 oct   │
│            ░░░ suspensión 15 d (lluvias) ░░░                             │
│                                                                          │
│ [ Obligaciones 46 ] [ Cronograma ] [ Pagos ] [ Pólizas 3 ] [ Documentos ] [ Bitácora ]│
│                                                                          │
│ Filtro: Todas ▾  Responsable ▾  Estado ▾          Buscar…                 │
│ ┌────────────────────────────────────────────────────────────────────┐   │
│ │Estado        │Obligación                 │Fuente        │Resp.│Próx.│   │
│ │⊘ Vencida     │Registro fotográfico sem.  │Cl. 8.3·p.11  │Jhon │6 nov│   │
│ │⚠ En riesgo   │Ampliar póliza estabilidad │Otrosí 1·p.2  │Laura│20 nov│  │
│ │✓ Cumplida    │Personal mínimo: residente │Anexo 2·p.4   │Andrea│ —  │   │
│ │👁 Por revisar│Señalización nocturna      │Pliego 4.7·p.33│ —  │ ?   │   │
│ └────────────────────────────────────────────────────────────────────┘   │
│  Fila → panel derecho: cita en serif + «Abrir en el documento» + evidencias│
└──────────────────────────────────────────────────────────────────────────┘
```

En móvil, la matriz se convierte en una lista agrupada por estado, cada fila con dos líneas (obligación / fuente · fecha · responsable).

### 8.4 Lectura en vivo (el momento orquestado)

```
Escritorio
┌──────────────────────────────────────────────────────────────────────────┐
│ Leyendo «Contrato CVP-OBR-2026-031.pdf» · 48 páginas · 2 anexos          │
│ ●━━━━━━━━━━━━━◆━━━━━━━━━━◆━━━━━━━━ ─ ─ ─ ─ ─ ─ ─   ← la Línea se dibuja   │
├──────────────┬───────────────────────────────────────────────────────────┤
│ Documento    │ Lo que voy encontrando                                    │
│ ┌──┐ p.1  ✓  │                                                           │
│ └──┘         │ Pagos (3)                                                 │
│ ┌──┐ p.11 ◐  │   ◆ Anticipo 20 % · $ 96.580.000      Cl. 6.1 · p. 9      │
│ │▒▒│ ← banda │   ◆ Acta parcial mensual                Cl. 6.2 · p. 9     │
│ └──┘ barre   │ Obligaciones (17)                                         │
│ ┌──┐ p.12    │   Presentar registro fotográfico semanal Cl. 8.3 · p. 11  │
│ └──┘ (gris)  │   Mantener residente de obra 100 %       Anexo 2 · p. 4   │
│   …          │   + nueva fila entra aquí                                  │
│              │ Pólizas (2)                                               │
│              │   Cumplimiento 10 % · vigencia + 6 meses Cl. 12 · p. 15   │
│              │                                                           │
│ 23 de 48 pág.│ Primera obligación en 11 s · llevamos 1 min 04 s          │
└──────────────┴───────────────────────────────────────────────────────────┘
```

En móvil, el carril del documento se convierte en una tira horizontal de miniaturas arriba y la lista ocupa el resto. El usuario puede salir: la lectura sigue en segundo plano y Hoy muestra «Seguimos leyendo tu contrato (60 %)».

### 8.5 Validación de lo extraído (sigue a la lectura)

```
┌──────────────────────────────────────┐
│ Revisa lo que encontré       12 de 42│
│                                      │
│ Presentar copia del backup semanal   │ titulo-3
│ de la base de datos al supervisor    │
│ ┌──────────────────────────────────┐ │
│ │ «El contratista deberá realizar  │ │ cita en serif
│ │ copias de seguridad semanales…»  │ │
│ │ Anexo técnico 3.4 · pág. 6  Abrir│ │
│ └──────────────────────────────────┘ │
│ Periodicidad  Semanal (viernes)      │
│ Responsable   Sin asignar ▾          │
│ Confianza     Alta                   │
│                                      │
│ ( Confirmar                     ) C  │ primario
│ ( Editar )          ( Descartar ) E D│ secundarios
│                                      │
│ Confirmar las 30 de confianza alta   │ acción masiva (enlace)
└──────────────────────────────────────┘
```

Atajos de teclado: C, E y D. Deslizar en móvil es un acelerador, nunca el único camino.

### 8.6 Paquete de cobro

```
┌──────────────────────────────────────┐
│ ‹ Soporte SDH-114                    │
│ Cobro de noviembre                   │
│ $ 4.760.000                          │ cifra-xl
│ Radicar antes del 5 de diciembre     │
│ ▰▰▰▰▱▱  4 de 6 listos                │ barra segmentada (no anillo)
│                                      │
│ Lo que te falta                      │
│ ┃ ⚠ Planilla de aportes de octubre   │
│ ┃ Cláusula 9.1 · pág. 14             │
│ ┃ ( Subir planilla                 ) │
│ ┃ ◌ Visto bueno del supervisor       │
│ ┃ Lo pide el contratante, no tú      │
│ ┃ ( Preparar solicitud             ) │ → borrador, requiere aprobación
│                                      │
│ Listo                                │
│  ✓ Informe de actividades · Ver      │
│  ✓ Cuenta de cobro · Ver             │
│  ✓ Certificación bancaria · Ver      │
│  ✓ RUT vigente · Ver                 │
│                                      │
│ ( Descargar paquete (PDF + DOCX)   ) │ deshabilitado hasta 6 de 6, con explicación
└──────────────────────────────────────┘

Completo →  ◆ se rellena de Páramo · «Listo para radicar. $ 4.760.000 en camino.»
```

---

## 9. Voz y lenguaje

| En lugar de (sistema) | Decimos (usuario) |
|---|---|
| Obligaciones pendientes del hito 3 | Lo que te falta para cobrar noviembre |
| Error 413: payload too large | La foto pesa más de 25 MB. Bájale la calidad o súbela desde el computador. |
| Sin registros | Aún no hay evidencias. Toma una foto y la ligamos a la obligación. |
| Evidencia rechazada | No alcanza: la captura no muestra la fecha del backup. Sube una donde se vea la fecha. |
| Sincronización pendiente | 3 fotos esperando señal. Se suben solas cuando vuelvas a tener conexión. |

Reglas: segunda persona («tú»), sin disculpas («lo sentimos»), números concretos, fechas relativas cuando ayudan («el martes») y absolutas en las fuentes. Montos en formato `es-CO` (`$ 14.280.000`), con abreviatura `$14,3M` solo en la Línea.

---

## 10. Accesibilidad (WCAG 2.2 AA)

- Foco visible con doble anillo (`--foco`) en todo control, sin ocultarlo por `:focus` con el ratón: se usa `:focus-visible`.
- Objetivo táctil mínimo de 24 × 24 px (2.5.8). En la práctica, 48 px.
- La Línea tiene su lista equivalente, la matriz es una `<table>` real con encabezados y el visor tiene el texto seleccionable.
- La lectura en vivo anuncia los hallazgos agrupados con `aria-live`.
- Arrastrar para subir siempre tiene un botón alternativo (2.5.7).
- Hay modo claro y oscuro (sistema + conmutador). El papel del documento sigue claro en el oscuro.

---

## 11. Lista anti-clichés (verificada)

| Cliché | ¿Lo evitamos? |
|---|---|
| Fondo crema + serif + terracota | ✅ El fondo es Bruma (lavanda fría). La serif solo se usa para citas. La Mandarina vive solo dentro del gradiente de la Línea. |
| Negro + verde ácido | ✅ El oscuro es ciruela (#140A20), de la marca, y el acento es Rubor y Frambuesa. El verde Páramo es un estado, no un acento. |
| Gradientes decorativos | ✅ Hay un único gradiente, el de marca, y significa algo: el tramo recorrido del contrato. |
| Tarjetas idénticas con sombra y gradientes | ✅ Hay tres superficies distintas, la sombra es solo para la Hoja y no hay gradientes. |
| Etiquetas en mayúsculas sobre títulos | ✅ Prohibido en la escala. |
| «→» en todos los botones | ✅ Prohibido. Solo «‹» para volver. |
| Mono para datos pequeños | ✅ Se usa Source Sans con numerales tabulares. |

## 12. Autocrítica de esta fase

- **Lo que se ve genérico:**
  - La barra inferior de 4 íconos es el patrón estándar de las apps móviles. Lo acepto porque es «navegación obvia», pero el botón Subir debe ganarse su centro con un uso real (cámara directa).
  - La tabla de la matriz en escritorio es una tabla de backoffice. En la fase 2 probaremos agrupar por pago («lo que frena cada cobro») como vista por defecto, dejando la tabla como vista secundaria.
- **Lo que quitaría:**
  - El panel derecho de «Equipo» en Hoy escritorio compite con la Línea. Lo movería a Contratos si las pruebas lo confirman.
  - La barra segmentada del paquete de cobro duplica el «4 de 6». Una de las dos sobra.
- **Riesgo:** la Línea puede saturarse en contratos de 24 meses con pagos quincenales. La mitigación es agrupar por mes con zoom semántico, y queda por diseñar en la fase 2.
- **Revisión 2 (marca):** el botón primario ciruela es muy oscuro y en claro puede sentirse pesado si hay varios en pantalla. La regla «una acción por tarjeta» lo contiene. Si en pruebas pesa demasiado, la alternativa es Frambuesa como primario y el Ladrillo de «Vencida» girado a un rojo más anaranjado.
- **Pendiente de marca:** el logo de la vista previa es un marcador de posición dibujado a mano. Hay que reemplazarlo por el SVG oficial de LiveContracts.
