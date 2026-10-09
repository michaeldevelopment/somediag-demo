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

export interface EtapaTiempo {
  etapa: string
  /** Minutos promedio que toma la etapa con el proceso digital. */
  minutos: number
}

/** Promedios del mes, para la gráfica de tiempo por etapa. */
export const TIEMPOS_POR_ETAPA: EtapaTiempo[] = [
  { etapa: 'Pre-registro', minutos: 2 },
  { etapa: 'Admisión', minutos: 1 },
  { etapa: 'Estudio', minutos: 14 },
  { etapa: 'Lectura', minutos: 22 },
  { etapa: 'Entrega', minutos: 3 },
]
