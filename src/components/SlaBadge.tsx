import { AlertTriangle, Check, Clock } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import type { Caso } from '@/data/tipos'
import { infoSla, type NivelSla } from '@/lib/sla'
import { cn, duracion } from '@/lib/utils'

/** El color va siempre acompañado de ícono y texto: nunca identifica solo. */
const ESTILO: Record<NivelSla, { clase: string; icono: LucideIcon }> = {
  ok: { clase: 'bg-verde-100 text-verde', icono: Clock },
  riesgo: { clase: 'bg-ambar-100 text-ambar', icono: Clock },
  vencido: { clase: 'bg-coral-100 text-coral-700', icono: AlertTriangle },
  entregado: { clase: 'bg-marino/5 text-marino-300', icono: Check },
}

interface SlaBadgeProps {
  caso: Caso
  /** `compacto` omite la palabra "SLA" para las tarjetas del tablero. */
  compacto?: boolean
  className?: string
}

export function SlaBadge({ caso, compacto = false, className }: SlaBadgeProps) {
  const { nivel, restanteMin } = infoSla(caso)
  const { clase, icono: Icono } = ESTILO[nivel]

  const texto =
    nivel === 'entregado'
      ? 'Entregado'
      : nivel === 'vencido'
        ? `Vencido hace ${duracion(restanteMin)}`
        : `Faltan ${duracion(restanteMin)}`

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        clase,
        className,
      )}
      title={`SLA de ${duracion(caso.slaMin)}`}
    >
      <Icono className="size-3" aria-hidden />
      {compacto ? texto : `SLA · ${texto}`}
    </span>
  )
}
