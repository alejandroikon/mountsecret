/**
 * Datos semilla: dos contratos ficticios pero realistas.
 * Las entidades, empresas y personas son inventadas. Cualquier parecido es coincidencia.
 */
import { amortizarAnticipo, calcularCronograma, vencimientosMensuales } from "@lc/dominio";
import type { Contrato, Documento, Fuente, Pago } from "./tipos";

function f(documentoId: string, bloqueId: string, clausula: string, pagina: number): Fuente {
  return { documentoId, bloqueId, clausula, pagina };
}

// ————————————————————————————————————————————————————————————————
// 1. Prestación de servicios de software · Instituto Distrital de Datos Abiertos (ficticio)
// ————————————————————————————————————————————————————————————————

const docSoftware: Documento = {
  id: "sw-contrato",
  nombre: "Contrato IDDA-PS-2026-114.pdf",
  tipo: "contrato",
  paginas: [
    {
      numero: 1,
      bloques: [
        {
          id: "sw-partes",
          titulo: "Contrato de prestación de servicios N.º IDDA-PS-2026-114",
          texto:
            "Entre los suscritos, el INSTITUTO DISTRITAL DE DATOS ABIERTOS (en adelante, el Instituto), y NODO ANDINO S.A.S., NIT 901.555.214-7 (en adelante, el Contratista), se celebra el presente contrato, que se regirá por las siguientes cláusulas.",
        },
        {
          id: "sw-c1",
          clausula: "Cláusula 1",
          titulo: "Objeto",
          texto:
            "Prestar servicios especializados para el soporte, mantenimiento evolutivo y operación de la plataforma de datos abiertos del Instituto, de conformidad con el anexo técnico y la propuesta presentada.",
        },
        {
          id: "sw-c2",
          clausula: "Cláusula 2",
          titulo: "Plazo",
          texto:
            "El plazo de ejecución será de once (11) meses, contados a partir de la suscripción del acta de inicio.",
        },
      ],
    },
    {
      numero: 2,
      bloques: [
        {
          id: "sw-c3",
          clausula: "Cláusula 3",
          titulo: "Valor",
          texto:
            "El valor del contrato es de CINCUENTA Y DOS MILLONES TRESCIENTOS SESENTA MIL PESOS M/CTE ($52.360.000), incluidos todos los impuestos a que haya lugar.",
        },
        {
          id: "sw-c4",
          clausula: "Cláusula 4",
          titulo: "Forma de pago",
          texto:
            "El Instituto pagará en mensualidades vencidas de CUATRO MILLONES SETECIENTOS SESENTA MIL PESOS M/CTE ($4.760.000), previa presentación del informe de actividades aprobado por el supervisor, la cuenta de cobro y la certificación de pago de aportes al Sistema de Seguridad Social Integral del mes correspondiente. El Contratista radicará los documentos dentro de los cinco (5) primeros días hábiles del mes siguiente.",
        },
      ],
    },
    {
      numero: 3,
      bloques: [
        {
          id: "sw-c5-2",
          clausula: "Cláusula 5.2",
          titulo: "Obligaciones generales",
          texto:
            "Acreditar mensualmente el pago de los aportes al Sistema de Seguridad Social Integral (salud, pensión y riesgos laborales) del personal vinculado a la ejecución del contrato, mediante la planilla integrada de liquidación de aportes del mes correspondiente.",
        },
        {
          id: "sw-c5-3",
          clausula: "Cláusula 5.3",
          texto:
            "Guardar estricta confidencialidad sobre la información a la que tenga acceso con ocasión del contrato, aun después de su terminación.",
        },
        {
          id: "sw-c5-4",
          clausula: "Cláusula 5.4",
          texto:
            "Asistir a las reuniones de seguimiento convocadas por el supervisor, como mínimo una cada quince (15) días calendario, y dejar constancia en acta.",
        },
      ],
    },
    {
      numero: 4,
      bloques: [
        {
          id: "sw-c6-1",
          clausula: "Cláusula 6.1",
          titulo: "Obligaciones específicas",
          texto:
            "Presentar, dentro de los cinco (5) primeros días hábiles de cada mes, un informe de actividades del mes anterior con sus respectivas evidencias, en el formato que indique el supervisor.",
        },
        {
          id: "sw-c6-2",
          clausula: "Cláusula 6.2",
          texto:
            "Atender los incidentes reportados por el Instituto con un tiempo de respuesta no superior a cuatro (4) horas hábiles, y registrarlos en la mesa de ayuda.",
        },
        {
          id: "sw-c6-3",
          clausula: "Cláusula 6.3",
          texto:
            "Garantizar una disponibilidad mensual de la plataforma no inferior al noventa y nueve coma cinco por ciento (99,5 %) y presentar el reporte de disponibilidad junto con el informe mensual.",
        },
        {
          id: "sw-c6-4",
          clausula: "Cláusula 6.4",
          texto:
            "Realizar la transferencia de conocimiento al equipo técnico del Instituto, con manuales actualizados, a más tardar quince (15) días calendario antes de la terminación del contrato.",
        },
      ],
    },
    {
      numero: 5,
      bloques: [
        {
          id: "sw-c7-1",
          clausula: "Cláusula 7.1",
          titulo: "Seguridad de la información",
          texto:
            "Mantener activo el doble factor de autenticación en todas las cuentas con privilegios administrativos sobre la plataforma y acreditarlo mensualmente ante el supervisor.",
        },
        {
          id: "sw-c7-2",
          clausula: "Cláusula 7.2",
          texto:
            "Reportar al supervisor cualquier incidente de seguridad de la información dentro de las veinticuatro (24) horas siguientes a su detección.",
        },
      ],
    },
    {
      numero: 6,
      bloques: [
        {
          id: "sw-c8",
          clausula: "Cláusula 8",
          titulo: "Garantías",
          texto:
            "El Contratista constituirá a favor del Instituto una garantía única que ampare: a) cumplimiento, por el diez por ciento (10 %) del valor del contrato, con vigencia igual al plazo y cuatro (4) meses más; b) calidad del servicio, por el diez por ciento (10 %) del valor del contrato, con vigencia igual al plazo y cuatro (4) meses más.",
        },
      ],
    },
    {
      numero: 7,
      bloques: [
        {
          id: "sw-c9",
          clausula: "Cláusula 9",
          titulo: "Multas",
          texto:
            "En caso de retardo o incumplimiento parcial, el Instituto podrá imponer multas diarias sucesivas del cero coma uno por ciento (0,1 %) del valor del contrato, sin que superen el diez por ciento (10 %) de su valor total.",
        },
        {
          id: "sw-c10",
          clausula: "Cláusula 10",
          titulo: "Cláusula penal",
          texto: "En caso de incumplimiento definitivo, el Contratista pagará a título de pena el diez por ciento (10 %) del valor del contrato.",
        },
      ],
    },
  ],
};

const anexoSoftware: Documento = {
  id: "sw-anexo",
  nombre: "Anexo técnico.pdf",
  tipo: "anexo",
  paginas: [
    {
      numero: 1,
      bloques: [
        {
          id: "sw-a1",
          clausula: "Anexo técnico 1",
          titulo: "Alcance",
          texto: "La plataforma comprende el portal de datos abiertos, el catálogo de conjuntos de datos y las bases de datos PostgreSQL que los soportan.",
        },
      ],
    },
    {
      numero: 2,
      bloques: [
        {
          id: "sw-a3-4",
          clausula: "Anexo técnico 3.4",
          titulo: "Respaldo y recuperación",
          texto:
            "El Contratista deberá realizar copias de seguridad semanales de las bases de datos del sistema, los días viernes, y conservar evidencia de su ejecución.",
        },
        {
          id: "sw-a3-5",
          clausula: "Anexo técnico 3.5",
          texto:
            "Cada trimestre se realizará una prueba de restauración en un ambiente de pruebas, de la cual se levantará acta con el tiempo de recuperación obtenido.",
        },
      ],
    },
    {
      numero: 3,
      bloques: [
        {
          id: "sw-a4-1",
          clausula: "Anexo técnico 4.1",
          titulo: "Actualizaciones",
          texto:
            "Se procurará aplicar los parches de seguridad críticos en un término razonable, preferiblemente dentro de los diez (10) días hábiles siguientes a su publicación.",
        },
      ],
    },
  ],
};

const equipoSoftware = [
  { id: "p-andrea", nombre: "Andrea Gómez", rol: "Gerente", correo: "andrea@nodoandino.co" },
  { id: "p-jhon", nombre: "Jhon Ríos", rol: "Ingeniero de operaciones", correo: "jhon@nodoandino.co" },
  { id: "p-laura", nombre: "Laura Mejía", rol: "Administrativa", correo: "laura@nodoandino.co" },
];

const REGLA_5_HABILES = { tipo: "habil_mes_siguiente", n: 5 } as const;

function pagosSoftware(): Pago[] {
  const crono = calcularCronograma({ actaInicio: "2026-02-01", plazo: { cantidad: 11, unidad: "meses" }, valorInicial: 52_360_000 });
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  return vencimientosMensuales({ inicio: crono.inicio, fin: crono.terminacion, regla: REGLA_5_HABILES }).map((v, i) => ({
    id: `sw-pago-${v.periodo.etiqueta}`,
    numero: i + 1,
    etiqueta: meses[Number(v.periodo.etiqueta.slice(5)) - 1]!,
    periodo: v.periodo.etiqueta,
    valor: 4_760_000,
    radicarAntes: v.vence,
    fuente: f("sw-contrato", "sw-c4", "Cláusula 4", 2),
    requisitos: [
      { id: "informe", nombre: "Informe de actividades", obligacionId: "sw-informe" },
      { id: "sla", nombre: "Reporte de disponibilidad", obligacionId: "sw-sla" },
      { id: "pila", nombre: "Planilla de aportes (PILA) del mes", obligacionId: "sw-pila" },
      { id: "cuenta", nombre: "Cuenta de cobro", obligacionId: "sw-cuenta" },
      { id: "vobo", nombre: "Visto bueno del supervisor", externo: { quien: "el supervisor del Instituto", accion: "Preparar solicitud" } },
    ],
  }));
}

export const contratoSoftware: Contrato = {
  id: "software",
  codigo: "IDDA-PS-2026-114",
  nombreCorto: "Soporte plataforma de datos",
  objeto: "Soporte, mantenimiento evolutivo y operación de la plataforma de datos abiertos",
  tipo: "software",
  contratante: "Instituto Distrital de Datos Abiertos",
  contratista: "Nodo Andino S.A.S.",
  valorInicial: 52_360_000,
  actaInicio: "2026-02-01",
  plazo: { cantidad: 11, unidad: "meses" },
  sabadoHabil: false,
  eventos: [],
  documentos: [docSoftware, anexoSoftware],
  equipo: equipoSoftware,
  obligaciones: [
    {
      id: "sw-informe",
      titulo: "Informe mensual de actividades",
      categoria: "especifica",
      fuente: f("sw-contrato", "sw-c6-1", "Cláusula 6.1", 4),
      periodicidad: { tipo: "mensual", regla: REGLA_5_HABILES },
      responsableId: "p-andrea",
      confianza: 0.97,
      evidenciaEsperada: "El informe del mes con sus evidencias",
      accion: "Revisar borrador",
    },
    {
      id: "sw-sla",
      titulo: "Reporte de disponibilidad (99,5 %)",
      categoria: "tecnica",
      fuente: f("sw-contrato", "sw-c6-3", "Cláusula 6.3", 4),
      periodicidad: { tipo: "mensual", regla: REGLA_5_HABILES },
      responsableId: "p-jhon",
      confianza: 0.93,
      evidenciaEsperada: "Reporte del monitor de disponibilidad del mes",
      accion: "Subir reporte",
    },
    {
      id: "sw-pila",
      titulo: "Planilla de aportes (PILA) del mes",
      categoria: "transversal",
      fuente: f("sw-contrato", "sw-c5-2", "Cláusula 5.2", 3),
      periodicidad: { tipo: "mensual", regla: REGLA_5_HABILES },
      responsableId: "p-laura",
      confianza: 0.95,
      evidenciaEsperada: "Planilla PILA pagada del mes que se cobra",
      accion: "Subir planilla",
    },
    {
      id: "sw-cuenta",
      titulo: "Cuenta de cobro",
      categoria: "general",
      fuente: f("sw-contrato", "sw-c4", "Cláusula 4", 2),
      periodicidad: { tipo: "mensual", regla: REGLA_5_HABILES },
      responsableId: "p-laura",
      confianza: 0.96,
      evidenciaEsperada: "Cuenta de cobro firmada",
      accion: "Generar cuenta de cobro",
    },
    {
      id: "sw-backup",
      titulo: "Copia de seguridad semanal de las bases de datos",
      categoria: "tecnica",
      fuente: f("sw-anexo", "sw-a3-4", "Anexo técnico 3.4", 2),
      periodicidad: { tipo: "semanal", dia: 5 },
      responsableId: "p-jhon",
      confianza: 0.94,
      evidenciaEsperada: "Captura del job de backup con fecha y estado",
      accion: "Subir captura",
    },
    {
      id: "sw-mfa",
      titulo: "Doble factor activo en cuentas administrativas",
      categoria: "tecnica",
      fuente: f("sw-contrato", "sw-c7-1", "Cláusula 7.1", 5),
      periodicidad: { tipo: "mensual", regla: REGLA_5_HABILES },
      responsableId: "p-jhon",
      confianza: 0.91,
      evidenciaEsperada: "Captura de la consola con MFA activo por cuenta",
      accion: "Subir captura",
    },
    {
      id: "sw-restauracion",
      titulo: "Prueba de restauración trimestral",
      categoria: "tecnica",
      fuente: f("sw-anexo", "sw-a3-5", "Anexo técnico 3.5", 2),
      periodicidad: { tipo: "unica", fecha: "2026-11-30" },
      responsableId: "p-jhon",
      confianza: 0.84,
      evidenciaEsperada: "Acta de la prueba con el tiempo de recuperación",
      accion: "Subir acta",
    },
    {
      id: "sw-reunion",
      titulo: "Reunión de seguimiento con el supervisor",
      categoria: "general",
      fuente: f("sw-contrato", "sw-c5-4", "Cláusula 5.4", 3),
      periodicidad: { tipo: "quincenal", dia: 4 },
      responsableId: "p-andrea",
      confianza: 0.88,
      evidenciaEsperada: "Acta de la reunión",
      accion: "Subir acta",
    },
    {
      id: "sw-transferencia",
      titulo: "Transferencia de conocimiento con manuales",
      categoria: "especifica",
      fuente: f("sw-contrato", "sw-c6-4", "Cláusula 6.4", 4),
      periodicidad: { tipo: "unica", fecha: "2026-12-16" },
      responsableId: "p-andrea",
      confianza: 0.9,
      evidenciaEsperada: "Acta de transferencia y manuales entregados",
      accion: "Subir acta",
    },
    {
      id: "sw-soporte",
      titulo: "Responder incidentes en máximo 4 horas hábiles",
      categoria: "especifica",
      fuente: f("sw-contrato", "sw-c6-2", "Cláusula 6.2", 4),
      periodicidad: { tipo: "continua" },
      responsableId: "p-jhon",
      confianza: 0.92,
      evidenciaEsperada: "Reporte de la mesa de ayuda",
      accion: "Subir reporte",
    },
    {
      id: "sw-incidentes",
      titulo: "Reportar incidentes de seguridad en 24 horas",
      categoria: "tecnica",
      fuente: f("sw-contrato", "sw-c7-2", "Cláusula 7.2", 5),
      periodicidad: { tipo: "por_evento", descripcion: "Cuando se detecte un incidente" },
      confianza: 0.89,
      evidenciaEsperada: "Correo de reporte al supervisor",
      accion: "Registrar incidente",
    },
    {
      id: "sw-confidencialidad",
      titulo: "Confidencialidad de la información",
      categoria: "general",
      fuente: f("sw-contrato", "sw-c5-3", "Cláusula 5.3", 3),
      periodicidad: { tipo: "continua" },
      confianza: 0.9,
      evidenciaEsperada: "Acuerdos de confidencialidad firmados por el equipo",
      accion: "Subir acuerdos",
    },
    {
      id: "sw-parches",
      titulo: "Aplicar parches de seguridad críticos en 10 días hábiles",
      categoria: "tecnica",
      fuente: f("sw-anexo", "sw-a4-1", "Anexo técnico 4.1", 3),
      periodicidad: { tipo: "continua" },
      confianza: 0.58,
      evidenciaEsperada: "Registro de parches aplicados",
      accion: "Subir registro",
    },
  ],
  pagos: pagosSoftware(),
  polizas: [
    {
      id: "sw-pol-cumplimiento",
      amparo: "Cumplimiento",
      porcentaje: "10 % del valor",
      vigencia: "Plazo + 4 meses",
      vigenciaHasta: "2027-04-30",
      fuente: f("sw-contrato", "sw-c8", "Cláusula 8", 6),
    },
    {
      id: "sw-pol-calidad",
      amparo: "Calidad del servicio",
      porcentaje: "10 % del valor",
      vigencia: "Plazo + 4 meses",
      vigenciaHasta: "2027-04-30",
      fuente: f("sw-contrato", "sw-c8", "Cláusula 8", 6),
    },
  ],
};

// ————————————————————————————————————————————————————————————————
// 2. Obra de mejoramiento de vivienda · Fondo Distrital de Hábitat Popular (ficticio)
// ————————————————————————————————————————————————————————————————

const docObra: Documento = {
  id: "ob-contrato",
  nombre: "Contrato FDHP-OBR-2026-031.pdf",
  tipo: "contrato",
  paginas: [
    {
      numero: 1,
      bloques: [
        {
          id: "ob-partes",
          titulo: "Contrato de obra N.º FDHP-OBR-2026-031",
          texto:
            "Entre el FONDO DISTRITAL DE HÁBITAT POPULAR (en adelante, el Fondo) y CONSTRUCTORA CERRO VERDE S.A.S., NIT 900.871.330-2 (en adelante, el Contratista), se celebra el presente contrato de obra.",
        },
        {
          id: "ob-c1",
          clausula: "Cláusula 1",
          titulo: "Objeto",
          texto:
            "Ejecutar a precios unitarios fijos las obras de mejoramiento de vivienda en el lote 3 del programa Techo Digno, que comprende 42 viviendas, conforme al pliego de condiciones y sus anexos.",
        },
        {
          id: "ob-c2",
          clausula: "Cláusula 2",
          titulo: "Plazo",
          texto: "El plazo de ejecución será de seis (6) meses contados a partir de la suscripción del acta de inicio.",
        },
      ],
    },
    {
      numero: 2,
      bloques: [
        {
          id: "ob-c3",
          clausula: "Cláusula 3",
          titulo: "Valor",
          texto:
            "El valor estimado del contrato es de CUATROCIENTOS OCHENTA Y DOS MILLONES NOVECIENTOS MIL PESOS M/CTE ($482.900.000), incluido el AIU.",
        },
      ],
    },
    {
      numero: 9,
      bloques: [
        {
          id: "ob-c6-1",
          clausula: "Cláusula 6.1",
          titulo: "Anticipo",
          texto:
            "El Fondo entregará un anticipo del veinte por ciento (20 %) del valor del contrato, previa aprobación del plan de inversión y apertura de una cuenta bancaria exclusiva. El anticipo se amortizará en cada acta parcial en el mismo porcentaje.",
        },
        {
          id: "ob-c6-2",
          clausula: "Cláusula 6.2",
          titulo: "Actas parciales",
          texto:
            "El saldo se pagará mediante actas parciales mensuales de obra ejecutada, aprobadas por la interventoría, que el Contratista radicará dentro de los diez (10) días hábiles siguientes al corte de cada mes, acompañadas del informe mensual de obra, el registro fotográfico y la certificación de pago de aportes y nómina del personal.",
        },
      ],
    },
    {
      numero: 11,
      bloques: [
        {
          id: "ob-c8-3",
          clausula: "Cláusula 8.3",
          titulo: "Obligaciones específicas",
          texto:
            "Presentar a la interventoría, cada lunes, el registro fotográfico georreferenciado de la semana anterior para cada frente de obra activo.",
        },
        {
          id: "ob-c8-4",
          clausula: "Cláusula 8.4",
          texto: "Presentar un informe mensual de obra con el avance físico y financiero, dentro del mismo término de radicación del acta parcial.",
        },
        {
          id: "ob-c8-5",
          clausula: "Cláusula 8.5",
          texto: "Llevar la bitácora de obra al día, firmada por el residente, disponible en el sitio para la interventoría.",
        },
      ],
    },
    {
      numero: 12,
      bloques: [
        {
          id: "ob-c8-6",
          clausula: "Cláusula 8.6",
          texto:
            "Realizar ensayos de resistencia del concreto por cada vaciado estructural, en laboratorio acreditado, y entregar los resultados a la interventoría.",
        },
        {
          id: "ob-c8-7",
          clausula: "Cláusula 8.7",
          texto:
            "Acreditar mensualmente el pago de salarios, prestaciones sociales y aportes al Sistema de Seguridad Social del personal vinculado a la obra.",
        },
      ],
    },
    {
      numero: 15,
      bloques: [
        {
          id: "ob-c12",
          clausula: "Cláusula 12",
          titulo: "Garantías",
          texto:
            "El Contratista constituirá garantía única con los siguientes amparos: a) buen manejo y correcta inversión del anticipo, por el cien por ciento (100 %) de su valor; b) cumplimiento, por el diez por ciento (10 %) del valor del contrato, con vigencia del plazo y seis (6) meses más; c) pago de salarios, prestaciones sociales e indemnizaciones laborales, por el cinco por ciento (5 %), con vigencia del plazo y tres (3) años más; d) estabilidad y calidad de la obra, por el veinte por ciento (20 %), por cinco (5) años desde el recibo final.",
        },
      ],
    },
  ],
};

const anexoPersonal: Documento = {
  id: "ob-anexo2",
  nombre: "Anexo 2 · Personal mínimo.pdf",
  tipo: "anexo",
  paginas: [
    {
      numero: 4,
      bloques: [
        {
          id: "ob-a2-1",
          clausula: "Anexo 2, numeral 1",
          titulo: "Personal mínimo",
          texto:
            "Residente de obra, ingeniero civil o arquitecto, con dedicación del cien por ciento (100 %). Director de obra con dedicación del treinta por ciento (30 %). Profesional en seguridad y salud en el trabajo con dedicación del cincuenta por ciento (50 %).",
        },
        {
          id: "ob-a2-2",
          clausula: "Anexo 2, numeral 2",
          texto: "Cualquier cambio del personal mínimo requerirá aprobación previa de la interventoría, con un perfil igual o superior.",
        },
      ],
    },
  ],
};

const pliego: Documento = {
  id: "ob-pliego",
  nombre: "Pliego de condiciones.pdf",
  tipo: "pliego",
  paginas: [
    {
      numero: 33,
      bloques: [
        {
          id: "ob-p4-7",
          clausula: "Pliego 4.7",
          titulo: "Señalización",
          texto:
            "Durante la ejecución, el contratista mantendrá la señalización preventiva y el cerramiento de los frentes de obra de acuerdo con las normas aplicables, en especial en horario nocturno cuando haya excavaciones abiertas.",
        },
      ],
    },
  ],
};

const otrosi1: Documento = {
  id: "ob-otrosi1",
  nombre: "Otrosí N.º 1.pdf",
  tipo: "otrosi",
  paginas: [
    {
      numero: 1,
      bloques: [
        {
          id: "ob-o1-1",
          clausula: "Otrosí 1, cláusula primera",
          titulo: "Prórroga",
          texto:
            "Prorrogar el plazo de ejecución del contrato FDHP-OBR-2026-031 por cuarenta y cinco (45) días calendario, contados a partir del vencimiento del plazo vigente.",
        },
      ],
    },
    {
      numero: 2,
      bloques: [
        {
          id: "ob-o1-2",
          clausula: "Otrosí 1, cláusula segunda",
          titulo: "Garantías",
          texto:
            "El Contratista deberá ampliar la vigencia de los amparos de cumplimiento y de pago de salarios y prestaciones sociales, y presentar los certificados de modificación dentro de los cinco (5) días hábiles siguientes a la firma del presente otrosí.",
        },
      ],
    },
  ],
};

const actaSuspension: Documento = {
  id: "ob-suspension",
  nombre: "Acta de suspensión N.º 1.pdf",
  tipo: "acta",
  paginas: [
    {
      numero: 1,
      bloques: [
        {
          id: "ob-s1",
          clausula: "Acta de suspensión 1",
          titulo: "Suspensión por ola invernal",
          texto:
            "Las partes acuerdan suspender la ejecución del contrato desde el 8 de junio hasta el 22 de junio de 2026, inclusive, por las lluvias que impiden las labores en los frentes de obra. La obra se reanudará el 23 de junio de 2026.",
        },
      ],
    },
  ],
};

const equipoObra = [
  { id: "p-andrea", nombre: "Andrea Gómez", rol: "Gerente", correo: "andrea@cerroverde.co" },
  { id: "p-camilo", nombre: "Camilo Vargas", rol: "Residente de obra", correo: "camilo@cerroverde.co" },
  { id: "p-laura", nombre: "Laura Mejía", rol: "Administrativa", correo: "laura@cerroverde.co" },
];

const OBRA_VALOR = 482_900_000;
const OBRA_ANTICIPO = 96_580_000;
const REGLA_10_TRAS_CORTE = { tipo: "habiles_tras_corte", n: 10 } as const;

function pagosObra(): Pago[] {
  const crono = calcularCronograma(
    { actaInicio: "2026-04-06", plazo: { cantidad: 6, unidad: "meses" }, valorInicial: OBRA_VALOR },
    [
      { id: "s1", tipo: "suspension", desde: "2026-06-08", hasta: "2026-06-22" },
      { id: "o1", tipo: "prorroga", fecha: "2026-10-01", plazo: { cantidad: 45, unidad: "dias" } },
    ],
  );
  // Valor ejecutado (bruto) estimado por mes, según la programación de obra.
  const ejecutado: Record<string, number> = {
    "2026-04": 38_200_000,
    "2026-05": 61_500_000,
    "2026-06": 30_100_000,
    "2026-07": 72_400_000,
    "2026-08": 77_000_000,
    "2026-09": 69_800_000,
    "2026-10": 64_300_000,
    "2026-11": 52_000_000,
    "2026-12": 17_600_000,
  };
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const pagos: Pago[] = [
    {
      id: "ob-anticipo",
      numero: 0,
      etiqueta: "anticipo",
      periodo: null,
      valor: OBRA_ANTICIPO,
      radicarAntes: "2026-04-17",
      fuente: f("ob-contrato", "ob-c6-1", "Cláusula 6.1", 9),
      requisitos: [{ id: "plan", nombre: "Plan de inversión del anticipo", obligacionId: "ob-plan-anticipo" }],
    },
  ];
  let amortizado = 0;
  const vencs = vencimientosMensuales({
    inicio: crono.inicio,
    fin: crono.terminacion,
    regla: REGLA_10_TRAS_CORTE,
    opciones: { excluir: crono.suspensiones },
  });
  vencs.forEach((v, i) => {
    const bruto = ejecutado[v.periodo.etiqueta] ?? 0;
    const a = amortizarAnticipo({ valorContrato: OBRA_VALOR, anticipo: OBRA_ANTICIPO, ejecutadoPeriodo: bruto, amortizadoAcumulado: amortizado });
    amortizado = a.amortizadoAcumulado;
    pagos.push({
      id: `ob-acta-${v.periodo.etiqueta}`,
      numero: i + 1,
      etiqueta: `acta ${i + 1} · ${meses[Number(v.periodo.etiqueta.slice(5)) - 1]}`,
      periodo: v.periodo.etiqueta,
      valor: a.netoAPagar,
      radicarAntes: v.vence,
      fuente: f("ob-contrato", "ob-c6-2", "Cláusula 6.2", 9),
      requisitos: [
        { id: "acta", nombre: "Acta parcial de cantidades firmada", externo: { quien: "la interventoría", accion: "Preparar acta para firma" } },
        { id: "informe", nombre: "Informe mensual de obra", obligacionId: "ob-informe" },
        { id: "fotos", nombre: "Registro fotográfico de todas las semanas", obligacionId: "ob-fotos" },
        { id: "pila", nombre: "Nómina y PILA del personal", obligacionId: "ob-pila" },
        { id: "polizas", nombre: "Pólizas ampliadas por el otrosí", obligacionId: "ob-poliza-salarios" },
      ],
    });
  });
  return pagos;
}

export const contratoObra: Contrato = {
  id: "obra",
  codigo: "FDHP-OBR-2026-031",
  nombreCorto: "Mejoramiento de vivienda, lote 3",
  objeto: "Obras de mejoramiento de 42 viviendas del programa Techo Digno, lote 3",
  tipo: "obra",
  contratante: "Fondo Distrital de Hábitat Popular",
  contratista: "Constructora Cerro Verde S.A.S.",
  valorInicial: OBRA_VALOR,
  actaInicio: "2026-04-06",
  plazo: { cantidad: 6, unidad: "meses" },
  sabadoHabil: true,
  eventos: [
    {
      id: "s1",
      tipo: "suspension",
      desde: "2026-06-08",
      hasta: "2026-06-22",
      titulo: "Suspensión por ola invernal",
      fuente: f("ob-suspension", "ob-s1", "Acta de suspensión 1", 1),
    },
    {
      id: "o1",
      tipo: "prorroga",
      fecha: "2026-10-01",
      plazo: { cantidad: 45, unidad: "dias" },
      titulo: "Otrosí 1: prórroga de 45 días",
      fuente: f("ob-otrosi1", "ob-o1-1", "Otrosí 1, cláusula primera", 1),
    },
  ],
  documentos: [docObra, anexoPersonal, pliego, otrosi1, actaSuspension],
  equipo: equipoObra,
  obligaciones: [
    {
      id: "ob-fotos",
      titulo: "Registro fotográfico semanal de cada frente",
      categoria: "especifica",
      fuente: f("ob-contrato", "ob-c8-3", "Cláusula 8.3", 11),
      periodicidad: { tipo: "semanal", dia: 1 },
      responsableId: "p-camilo",
      confianza: 0.95,
      evidenciaEsperada: "Fotos con fecha y ubicación de cada frente",
      accion: "Tomar fotos",
    },
    {
      id: "ob-informe",
      titulo: "Informe mensual de obra",
      categoria: "especifica",
      fuente: f("ob-contrato", "ob-c8-4", "Cláusula 8.4", 11),
      periodicidad: { tipo: "mensual", regla: REGLA_10_TRAS_CORTE },
      responsableId: "p-camilo",
      confianza: 0.93,
      evidenciaEsperada: "Informe con avance físico y financiero",
      accion: "Revisar borrador",
    },
    {
      id: "ob-pila",
      titulo: "Nómina y PILA del personal de obra",
      categoria: "transversal",
      fuente: f("ob-contrato", "ob-c8-7", "Cláusula 8.7", 12),
      periodicidad: { tipo: "mensual", regla: REGLA_10_TRAS_CORTE },
      responsableId: "p-laura",
      confianza: 0.94,
      evidenciaEsperada: "Planilla PILA pagada y soporte de nómina",
      accion: "Subir planilla",
    },
    {
      id: "ob-poliza-salarios",
      titulo: "Ampliar póliza de salarios y prestaciones (otrosí 1)",
      categoria: "transversal",
      fuente: f("ob-otrosi1", "ob-o1-2", "Otrosí 1, cláusula segunda", 2),
      periodicidad: { tipo: "unica", fecha: "2026-10-08" },
      responsableId: "p-laura",
      confianza: 0.92,
      evidenciaEsperada: "Certificado de modificación de la póliza",
      accion: "Subir certificado",
    },
    {
      id: "ob-poliza-cumplimiento",
      titulo: "Ampliar póliza de cumplimiento (otrosí 1)",
      categoria: "transversal",
      fuente: f("ob-otrosi1", "ob-o1-2", "Otrosí 1, cláusula segunda", 2),
      periodicidad: { tipo: "unica", fecha: "2026-10-08" },
      responsableId: "p-laura",
      confianza: 0.92,
      evidenciaEsperada: "Certificado de modificación de la póliza",
      accion: "Subir certificado",
    },
    {
      id: "ob-plan-anticipo",
      titulo: "Plan de inversión del anticipo y cuenta exclusiva",
      categoria: "especifica",
      fuente: f("ob-contrato", "ob-c6-1", "Cláusula 6.1", 9),
      periodicidad: { tipo: "unica", fecha: "2026-04-15" },
      responsableId: "p-andrea",
      confianza: 0.9,
      evidenciaEsperada: "Plan aprobado y certificación de la cuenta",
      accion: "Subir plan",
    },
    {
      id: "ob-residente",
      titulo: "Residente de obra con dedicación del 100 %",
      categoria: "transversal",
      fuente: f("ob-anexo2", "ob-a2-1", "Anexo 2, numeral 1", 4),
      periodicidad: { tipo: "continua" },
      responsableId: "p-andrea",
      confianza: 0.96,
      evidenciaEsperada: "Contrato y planilla del residente",
      accion: "Subir soporte",
    },
    {
      id: "ob-cambio-personal",
      titulo: "Aprobación previa para cambiar personal mínimo",
      categoria: "transversal",
      fuente: f("ob-anexo2", "ob-a2-2", "Anexo 2, numeral 2", 4),
      periodicidad: { tipo: "por_evento", descripcion: "Antes de cualquier cambio de personal clave" },
      confianza: 0.9,
      evidenciaEsperada: "Aprobación escrita de la interventoría",
      accion: "Preparar solicitud",
    },
    {
      id: "ob-bitacora",
      titulo: "Bitácora de obra al día",
      categoria: "especifica",
      fuente: f("ob-contrato", "ob-c8-5", "Cláusula 8.5", 11),
      periodicidad: { tipo: "continua" },
      responsableId: "p-camilo",
      confianza: 0.91,
      evidenciaEsperada: "Foto de la bitácora firmada",
      accion: "Subir foto",
    },
    {
      id: "ob-ensayos",
      titulo: "Ensayos de concreto por cada vaciado",
      categoria: "tecnica",
      fuente: f("ob-contrato", "ob-c8-6", "Cláusula 8.6", 12),
      periodicidad: { tipo: "por_evento", descripcion: "Por cada vaciado estructural" },
      responsableId: "p-camilo",
      confianza: 0.9,
      evidenciaEsperada: "Resultados del laboratorio acreditado",
      accion: "Subir resultados",
    },
    {
      id: "ob-senalizacion",
      titulo: "Señalización y cerramiento nocturno de excavaciones",
      categoria: "tecnica",
      fuente: f("ob-pliego", "ob-p4-7", "Pliego 4.7", 33),
      periodicidad: { tipo: "continua" },
      confianza: 0.64,
      evidenciaEsperada: "Fotos nocturnas del cerramiento",
      accion: "Subir fotos",
    },
  ],
  pagos: pagosObra(),
  polizas: [
    {
      id: "ob-pol-anticipo",
      amparo: "Buen manejo del anticipo",
      porcentaje: "100 % del anticipo",
      vigencia: "Plazo + 6 meses",
      vigenciaHasta: "2027-06-04",
      fuente: f("ob-contrato", "ob-c12", "Cláusula 12", 15),
    },
    {
      id: "ob-pol-cumplimiento",
      amparo: "Cumplimiento",
      porcentaje: "10 % del valor",
      vigencia: "Plazo + 6 meses",
      vigenciaHasta: "2027-06-04",
      fuente: f("ob-contrato", "ob-c12", "Cláusula 12", 15),
      obligacionAmpliacionId: "ob-poliza-cumplimiento",
    },
    {
      id: "ob-pol-salarios",
      amparo: "Salarios y prestaciones sociales",
      porcentaje: "5 % del valor",
      vigencia: "Plazo + 3 años",
      vigenciaHasta: "2029-12-04",
      obligacionAmpliacionId: "ob-poliza-salarios",
      fuente: f("ob-contrato", "ob-c12", "Cláusula 12", 15),
    },
    {
      id: "ob-pol-estabilidad",
      amparo: "Estabilidad y calidad de la obra",
      porcentaje: "20 % del valor",
      vigencia: "5 años desde el recibo final",
      vigenciaHasta: "2031-12-04",
      fuente: f("ob-contrato", "ob-c12", "Cláusula 12", 15),
    },
  ],
};

export const CONTRATOS: Contrato[] = [contratoSoftware, contratoObra];

export function contratoPorId(id: string): Contrato | undefined {
  return CONTRATOS.find((c) => c.id === id);
}
