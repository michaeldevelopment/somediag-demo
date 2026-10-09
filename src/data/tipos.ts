export type Modalidad = 'RX' | 'TAC' | 'ECO'

export type TipoPaciente = 'particular' | 'convenio' | 'poliza' | 'empresa'

export type Estado =
  | 'registro_iniciado'
  | 'registro_completo'
  | 'admitido'
  | 'estudio_realizado'
  | 'enviado_radiologo'
  | 'lectura_recibida'
  | 'resultado_aprobado'
  | 'resultado_entregado'

export interface EventoHistorial {
  estado: Estado
  hora: string
}

/**
 * Por qué un caso aparece en "Requieren atención". `sla_vencido` se deriva en
 * runtime del reloj del caso; los demás vienen marcados en los datos.
 */
export type MotivoAtencion =
  | 'sla_vencido'
  | 'orden_ilegible'
  | 'dato_clinico_faltante'
  | 'sin_radiologo_asignado'
  | 'pendiente_validacion'

export interface InfoAtencion {
  motivo: MotivoAtencion
  /** Quién tiene la pelota: un tablero sin dueño no es accionable. */
  responsable: string
  /** Minutos que el caso lleva esperando por este motivo. */
  esperandoMin: number
}

export interface Caso {
  id: string
  paciente: { nombre: string; documento: string; telefono: string }
  tipo: TipoPaciente
  empresa?: string
  modalidad: Modalidad
  estudio: string
  radiologo?: string
  estado: Estado
  /** Minutos objetivo para la entrega. */
  slaMin: number
  /** Minutos transcurridos desde la creación del caso. */
  creadoHace: number
  transcripcion?: string
  historial: EventoHistorial[]
  /** Presente solo si el caso está bloqueado por algo distinto al SLA. */
  atencion?: InfoAtencion
}

export interface Radiologo {
  id: string
  nombre: string
  especialidad: string
  modalidades: Modalidad[]
  disponible: boolean
  casosEnCola: number
  /** Minutos promedio de lectura. */
  tiempoPromedioMin: number
}

/** Orden en que avanzan los estados durante la demo. */
export const ORDEN_ESTADOS: Estado[] = [
  'registro_iniciado',
  'registro_completo',
  'admitido',
  'estudio_realizado',
  'enviado_radiologo',
  'lectura_recibida',
  'resultado_aprobado',
  'resultado_entregado',
]

/**
 * Minutos transcurridos desde la creación del caso al llegar a cada estado.
 * Mantiene el reloj del caso de la demo coherente con la gráfica de tiempo
 * por etapa: sin esto el caso quedaría entregado a los 3 minutos de creado,
 * algo que contradice los 14 min de estudio y los 22 de lectura.
 */
export const MINUTOS_POR_ESTADO: Record<Estado, number> = {
  registro_iniciado: 3,
  registro_completo: 5,
  admitido: 8,
  estudio_realizado: 23,
  enviado_radiologo: 25,
  lectura_recibida: 47,
  resultado_aprobado: 50,
  resultado_entregado: 53,
}

export const ETIQUETA_ESTADO: Record<Estado, string> = {
  registro_iniciado: 'Registro iniciado',
  registro_completo: 'Registro completo',
  admitido: 'Admitido',
  estudio_realizado: 'Estudio realizado',
  enviado_radiologo: 'Enviado a radiólogo',
  lectura_recibida: 'Lectura recibida',
  resultado_aprobado: 'Resultado aprobado',
  resultado_entregado: 'Resultado entregado',
}

export const ETIQUETA_TIPO: Record<TipoPaciente, string> = {
  particular: 'Particular',
  convenio: 'Convenio',
  poliza: 'Póliza',
  empresa: 'Empresa',
}

export const ETIQUETA_MODALIDAD: Record<Modalidad, string> = {
  RX: 'Rayos X',
  TAC: 'Tomografía',
  ECO: 'Ecografía',
}

export const ETIQUETA_MOTIVO: Record<MotivoAtencion, string> = {
  sla_vencido: 'SLA vencido',
  orden_ilegible: 'Orden médica ilegible',
  dato_clinico_faltante: 'Dato clínico faltante',
  sin_radiologo_asignado: 'Sin radiólogo asignado',
  pendiente_validacion: 'Pendiente de validación',
}
