import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface KpiCardProps {
  etiqueta: string
  valor: string | number
  /** Línea de contexto bajo la cifra: comparación, meta o detalle. */
  detalle?: string
  icono: LucideIcon
  /** `alerta` tiñe la tarjeta de coral cuando hay algo que atender. */
  alerta?: boolean
}

export function KpiCard({
  etiqueta,
  valor,
  detalle,
  icono: Icono,
  alerta = false,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white p-4',
        alerta ? 'border-coral/40 bg-coral-100/40' : 'border-marino/10',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-medium text-marino-300">{etiqueta}</p>
        <Icono
          className={cn('size-4', alerta ? 'text-coral' : 'text-teal')}
          aria-hidden
        />
      </div>

      <p
        className={cn(
          'mt-2 text-3xl font-semibold tabular-nums',
          alerta ? 'text-coral-700' : 'text-marino',
        )}
      >
        {valor}
      </p>

      {detalle && <p className="mt-1 text-[12px] text-marino-300">{detalle}</p>}
    </div>
  )
}
