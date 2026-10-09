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
