/**
 * Mapa de integraciones del programa. Ninguna está conectada en la demo: lo
 * que esta pantalla aporta es decir con honestidad qué tan madura está cada
 * una, que es justo lo que pregunta el área de sistemas.
 */

export type EstadoIntegracion =
  | 'por_validar'
  | 'levantamiento'
  | 'propuesto'
  | 'por_definir'

export const ETIQUETA_ESTADO_INTEGRACION: Record<EstadoIntegracion, string> = {
  por_validar: 'Por validar',
  levantamiento: 'En levantamiento',
  propuesto: 'Propuesto',
  por_definir: 'Por definir',
}

/** Ámbar para lo que está en revisión, teal para lo que avanza, gris para lo que no arranca. */
export const TONO_ESTADO_INTEGRACION: Record<EstadoIntegracion, string> = {
  por_validar: 'bg-ambar-100 text-ambar',
  levantamiento: 'bg-menta text-teal-700',
  propuesto: 'bg-marino/5 text-marino-700',
  por_definir: 'bg-marino/5 text-marino-300',
}

export interface Integracion {
  id: string
  nombre: string
  resumen: string
  estado: EstadoIntegracion
  /** En qué dirección viajan los datos. */
  intercambio: string
  alcance: string
}

export const INTEGRACIONES: Integracion[] = [
  {
    id: 'manager-clinic',
    nombre: 'Manager Clinic',
    resumen: 'Registro administrativo y datos del paciente',
    estado: 'por_validar',
    intercambio: 'Lectura y escritura',
    alcance:
      'API, servicios o mecanismo de integración por confirmar con la versión que usa SOMEDIAG.',
  },
  {
    id: 'worklist',
    nombre: 'Worklist DICOM',
    resumen: 'Identidad del paciente y estudio solicitado',
    estado: 'levantamiento',
    intercambio: 'Worklist propuesta',
    alcance:
      'Relaciona paciente, orden y equipo de imágenes; elimina la digitación en la consola.',
  },
  {
    id: 'pacs',
    nombre: 'PACS · servidor de imágenes',
    resumen: 'Disponibilidad del estudio realizado',
    estado: 'levantamiento',
    intercambio: 'Consulta controlada',
    alcance:
      'Mantiene la relación consistente entre paciente, orden e imágenes generadas.',
  },
  {
    id: 'whatsapp',
    nombre: 'WhatsApp Business API',
    resumen: 'Pre-registro y notificaciones al paciente',
    estado: 'propuesto',
    intercambio: 'Entrada y salida',
    alcance:
      'Recibe documentos y envía avisos; conserva la trazabilidad por caso.',
  },
  {
    id: 'empresas',
    nombre: 'Portal de empresas',
    resumen: 'Remisiones y datos previamente capturados',
    estado: 'por_definir',
    intercambio: 'Entrada estructurada',
    alcance:
      'Evita volver a digitar la información que cada empresa ya entregó.',
  },
]

/** Recorrido de los datos, de la captura a la lectura. */
export const CADENA_INTEGRACION = [
  { paso: 'Captura digital', detalle: 'WhatsApp · QR · Recepción' },
  { paso: 'Programa', detalle: 'Valida · normaliza · coordina' },
  { paso: 'Manager Clinic', detalle: 'Registro operativo' },
  { paso: 'DICOM / PACS', detalle: 'Estudio e imágenes' },
  { paso: 'Radiólogo', detalle: 'Lectura y aprobación' },
]

/** Controles que se mantienen en cualquiera de los escenarios de integración. */
export const CONTROLES = [
  {
    titulo: 'Decisión clínica humana',
    detalle: 'La interpretación y la firma siguen siendo del radiólogo.',
  },
  {
    titulo: 'Auditoría por evento',
    detalle: 'Cada cambio de estado queda con hora y responsable.',
  },
  {
    titulo: 'Permisos por perfil',
    detalle: 'Paciente, médico remitente, empresa y personal interno ven distinto.',
  },
  {
    titulo: 'Datos cifrados',
    detalle: 'En tránsito y en reposo, conforme a la Ley 1581 de 2012.',
  },
]
