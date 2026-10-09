import type { Modalidad } from './tipos'

/**
 * Paleta categórica de las gráficas. Validada con el script de dataviz
 * (banda de luminosidad, croma, separación bajo daltonismo y contraste
 * contra el fondo claro). El orden es fijo: la modalidad conserva su color
 * aunque se filtre o cambie el conteo.
 */
export const COLOR_MODALIDAD: Record<Modalidad, string> = {
  RX: '#0FA3A3',
  TAC: '#3B6FD4',
  ECO: '#C2771A',
}

/** Color único de la serie de tiempos; una sola serie no lleva paleta. */
export const COLOR_SERIE_TIEMPO = '#0FA3A3'

/** Ámbar para el proceso manual: el mismo tono de los avisos de la demo. */
export const COLOR_SERIE_MANUAL = '#E8A33D'

/** Las dos vistas que compara el Centro de control. */
export type ModoProceso = 'actual' | 'programa'

export interface EtapaTiempo {
  etapa: string
  /** Minutos promedio con el proceso digital. */
  minutos: number
  /** Minutos promedio con el proceso manual de hoy. */
  minutosManual: number
  /**
   * Trabajo administrativo, no clínico. El estudio y la lectura los hace una
   * persona en ambos procesos: el programa no los acelera, solo les quita de
   * encima todo lo demás.
   */
  administrativa: boolean
}

/** Promedios del mes, para la gráfica de tiempo por etapa. */
export const TIEMPOS_POR_ETAPA: EtapaTiempo[] = [
  { etapa: 'Pre-registro', minutos: 2, minutosManual: 12, administrativa: true },
  { etapa: 'Admisión', minutos: 1, minutosManual: 9, administrativa: true },
  { etapa: 'Estudio', minutos: 14, minutosManual: 16, administrativa: false },
  { etapa: 'Lectura', minutos: 22, minutosManual: 38, administrativa: false },
  { etapa: 'Entrega', minutos: 3, minutosManual: 45, administrativa: true },
]

/** Veces que el mismo dato se vuelve a teclear en cada proceso. */
export const DIGITACIONES: Record<ModoProceso, number> = {
  actual: 3,
  programa: 0,
}

export function minutosDe(etapa: EtapaTiempo, modo: ModoProceso) {
  return modo === 'actual' ? etapa.minutosManual : etapa.minutos
}

/** Serie lista para Recharts, con una sola clave sin importar el modo. */
export function serieTiempos(modo: ModoProceso) {
  return TIEMPOS_POR_ETAPA.map((e) => ({
    etapa: e.etapa,
    minutos: minutosDe(e, modo),
  }))
}

export function totalProceso(modo: ModoProceso) {
  return TIEMPOS_POR_ETAPA.reduce((suma, e) => suma + minutosDe(e, modo), 0)
}

export function totalAdministrativo(modo: ModoProceso) {
  return TIEMPOS_POR_ETAPA.filter((e) => e.administrativa).reduce(
    (suma, e) => suma + minutosDe(e, modo),
    0,
  )
}

export interface CuelloBotella {
  etapa: string
  minutos: number
  /** Porcentaje del proceso total que concentra la etapa. */
  porcentaje: number
}

/**
 * Etapa que más tiempo concentra. Se calcula, nunca se escribe a mano: así la
 * conclusión sigue siendo cierta si alguien cambia los tiempos de arriba.
 *
 * El dato interesante es que el cuello de botella se mueve con el modo: hoy
 * está en la entrega (administrativo) y con el programa pasa a la lectura
 * médica, que es trabajo clínico y debe estar ahí.
 */
export function cuelloDeBotella(modo: ModoProceso): CuelloBotella {
  const total = totalProceso(modo)
  const peor = TIEMPOS_POR_ETAPA.reduce((a, b) =>
    minutosDe(b, modo) > minutosDe(a, modo) ? b : a,
  )

  return {
    etapa: peor.etapa,
    minutos: minutosDe(peor, modo),
    porcentaje: Math.round((minutosDe(peor, modo) / total) * 100),
  }
}

// --- Atención inicial del agente --------------------------------------------

export interface CanalContacto {
  canal: string
  porcentaje: number
}

/**
 * Cuánto resuelve el agente sin intervención humana. Las cifras están a la
 * escala de la demo —26 pre-registros, los mismos 26 casos del tablero— para
 * que cuadren si alguien las suma en pantalla.
 */
export const ATENCION_INICIAL = {
  contactos: 41,
  resueltos: 33,
  preRegistros: 26,
  escalados: 8,
  canales: [
    { canal: 'WhatsApp', porcentaje: 74 },
    { canal: 'QR', porcentaje: 17 },
    { canal: 'Recepción', porcentaje: 9 },
  ] as CanalContacto[],
}

/** Porcentaje de contactos que el agente cierra solo. */
export const PORCENTAJE_RESUELTO = Math.round(
  (ATENCION_INICIAL.resueltos / ATENCION_INICIAL.contactos) * 100,
)
