import type { Caso } from '@/data/tipos'

export type NivelSla = 'ok' | 'riesgo' | 'vencido' | 'entregado'

export interface InfoSla {
  nivel: NivelSla
  /** Minutos que faltan para vencer; negativo si ya venció. */
  restanteMin: number
  /** Porcentaje del SLA consumido, de 0 a 100. */
  consumido: number
}

/** Un caso entregado ya no corre SLA; a partir del 75 % consumido entra en riesgo. */
export function infoSla(caso: Caso): InfoSla {
  const restanteMin = caso.slaMin - caso.creadoHace
  const consumido = Math.min(
    100,
    Math.round((caso.creadoHace / caso.slaMin) * 100),
  )

  if (caso.estado === 'resultado_entregado') {
    return { nivel: 'entregado', restanteMin, consumido }
  }
  if (restanteMin <= 0) return { nivel: 'vencido', restanteMin, consumido }
  if (consumido >= 75) return { nivel: 'riesgo', restanteMin, consumido }
  return { nivel: 'ok', restanteMin, consumido }
}

export function slaVencido(caso: Caso) {
  return infoSla(caso).nivel === 'vencido'
}
