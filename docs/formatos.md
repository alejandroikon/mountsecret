# Formatos propios: informe de actividades, cuenta de cobro y acta parcial

> Respuesta a la duda 5. No hay plantillas reales, así que diseñamos las nuestras a partir de cómo lo hacen las entidades colombianas.
> Son las plantillas base del Redactor y del Tesorero. El cliente puede reemplazarlas por la suya (DOCX con marcadores `{{campo}}`).

## Lo que encontramos

- **No existe un formato nacional único.** Cada entidad tiene el suyo, pero todos coinciden en tres bloques:
  1. la identificación del contrato y del periodo;
  2. el cumplimiento **obligación por obligación**, con la actividad y su soporte;
  3. la certificación de aportes y el visto bueno del supervisor.

  Ejemplos: el formato ANH-GCO-FR-45, el A-CON-FM-020 del Distrito y la guía de la UARIV para SECOP II.
- **En SECOP II**, el contratista adjunta el informe y sus evidencias, y el supervisor lo aprueba antes del pago. Por eso el informe se arma **desde la matriz de obligaciones**, que es exactamente lo que ya tenemos.
- **Retención en la fuente (art. 383 ET):** la base se reduce con los aportes a salud y pensión **del mes que se cobra**, y solo si se presenta la planilla PILA pagada de ese periodo. Si el contratista vinculó a dos o más trabajadores, no aplica la tabla del art. 383. Esto vuelve a la **planilla del mes** un requisito duro del paquete de cobro.
- **Acta parcial de obra:** el contratista y la interventoría cuantifican lo ejecutado, y el anticipo se amortiza proporcionalmente en cada acta. Algunos pliegos exigen amortizar el 100 % antes de llegar al 50 % de ejecución. Se acompaña del balance y el seguimiento del anticipo (plan de inversión y conciliación bancaria).

## 1. Informe de actividades (prestación de servicios, software, consultoría)

| Sección | Contenido | De dónde sale |
|---|---|---|
| Encabezado | Entidad, número de contrato, contratista, documento, objeto, supervisor, periodo (del–al), informe N.º | `Contrato` y `Hito` |
| Estado del contrato | Valor total, pagado acumulado, este cobro, saldo, % de ejecución de tiempo y de valor, fechas de inicio y terminación vigente (con prórrogas) | `Pago`, `EventoContractual` y el dominio de plazos |
| **Cumplimiento por obligación** | Tabla con: N.º, obligación (cita textual + fuente), actividades del periodo, evidencia (enlace o anexo N.º), estado (Cumplida / En curso / **Sin soporte**) | `Obligacion` + `Evidencia` con `verificacion = aceptada`. **Una obligación sin evidencia aceptada se imprime «Sin soporte», nunca «Cumplida».** |
| Obligaciones generales | Aportes a seguridad social, confidencialidad, uso de equipos, etc. | Matriz (tipo general) |
| Novedades | Dificultades, solicitudes y prórrogas en trámite | `Comunicacion` y `EventoContractual` |
| Anexos | Índice numerado de evidencias (nombre, fecha, obligación) | `Evidencia` |
| Firmas | Contratista y espacio para el supervisor («Recibido a satisfacción») | — |

## 2. Cuenta de cobro (persona natural no obligada a facturar)

| Campo | Nota |
|---|---|
| Ciudad y fecha, consecutivo | — |
| «[Entidad], NIT ___, DEBE A: [nombre], C.C. ___» | Fórmula usual |
| La suma de: valor en letras y en números | El dominio genera el valor en letras en es-CO |
| Concepto | «Pago N.º X de Y del contrato N.º ___, periodo ___» |
| Declaraciones | No responsable de IVA (si aplica), número de dependientes y si vinculó a 2 o más trabajadores (afecta el art. 383). Base para la depuración: aportes del mes cobrado según la PILA N.º ___ |
| Datos bancarios | Banco, tipo y número de cuenta (se adjunta la certificación bancaria) |
| Firma | — |

En el paquete de cobro del Tesorero, para persona natural, van:
1. el informe aprobado;
2. la cuenta de cobro;
3. la planilla PILA **del periodo cobrado**, pagada;
4. la certificación bancaria;
5. el RUT;
6. si aplica, la certificación de dependientes.

Una pyme reemplaza la cuenta de cobro por la **factura** (PDF adjunto; la facturación electrónica está fuera de alcance).

> Los valores de UVT, las tablas y los topes cambian cada año. El sistema **no calcula la retención**: solo arma los soportes que la entidad necesita para calcularla.

## 3. Acta parcial de obra

| Bloque | Contenido |
|---|---|
| Encabezado | Contrato, objeto, contratista, interventoría o supervisión, acta N.º, periodo de corte |
| Estado del contrato | Valor inicial, adiciones, valor actual; plazo inicial, prórrogas, suspensiones y fecha de terminación vigente |
| **Cuadro de cantidades** | Ítem, descripción, unidad, cantidad contratada, valor unitario, cantidad del periodo, cantidad acumulada anterior, acumulada total, valor del periodo, valor acumulado y % del ítem |
| Balance financiero | Valor ejecutado en el periodo + AIU, **amortización del anticipo** del periodo, anticipo amortizado acumulado, saldo por amortizar, retenciones o garantías, **valor neto a pagar** |
| Soportes | Registro fotográfico por ítem o frente (de `Evidencia` con GPS), ensayos de laboratorio, bitácora de obra, PILA y nómina del personal |
| Firmas | Contratista, residente, interventor y supervisor |

Regla del dominio: `amortizacion_periodo = valor_ejecutado_periodo × (anticipo / valor_contrato)`, salvo que el contrato fije otra regla. El Lector extrae esa regla de la cláusula de forma de pago y la cita.

## Fuentes

- [Guía de informe de actividades y supervisión, UARIV](https://www.unidadvictimas.gov.co/wp-content/uploads/2020/04/guiainformeactividadessupervisionejecucioncontractualv2.pdf)
- [Informe de supervisión, ANH](https://anh.gov.co/documents/11134/Informe_supervisi%C3%B3n_marzo_de_2018-_447.pdf)
- [Informe final de supervisión GCCON-F-030, Colombia Compra Eficiente](https://operaciones.colombiacompra.gov.co/sites/cce_public/files/documentos_adicionales_oc/gccon-f-030informefinaldesupervisionunificadobysypds.pdf)
- [Circular MinTIC 0004 de 2022 (PILA del mes cobrado)](https://normograma.mintic.gov.co/mintic/docs/pdf/circular_mintic_0004_2022.pdf)
- [Oficio DIAN 902617 de 2021](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_902617_2021.htm)
- [Circular Alcaldía de Cali 2025 (mes vencido)](https://intranet.cali.gov.co/wp-content/uploads/2025/07/Circular-No.-4131.060.22.2.1020.001053.pdf)
- [Contrato modelo AMB (amortización proporcional)](https://www.amb.gov.co/download/40217/)
- [Manual de interventoría, Norte de Santander](https://administrador.nortedesantander.gov.co/wp-content/uploads/2023/01/Manual_Interventoria_NORTE_DE_SANTANDER_2012_1.pdf)
