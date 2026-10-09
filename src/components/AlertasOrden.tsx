import { AlertTriangle, Info } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { alertasOrden, type Audiencia, type NivelAlerta } from '@/data/orden'
import { cn } from '@/lib/utils'

/** El color va siempre con ícono y título: nunca identifica solo. */
const ESTILO: Record<
  NivelAlerta,
  { caja: string; tono: string; icono: LucideIcon }
> = {
  atencion: {
    caja: 'border-ambar/40 bg-ambar-100/70',
    tono: 'text-ambar',
    icono: AlertTriangle,
  },
  aviso: {
    caja: 'border-marino/10 bg-menta/50',
    tono: 'text-teal',
    icono: Info,
  },
}

interface AlertasOrdenProps {
  /** Quién lee: cambia la acción que pide cada alerta. */
  audiencia: Audiencia
  /** `compacto` reduce tipografía y espacios para el marco de celular. */
  compacto?: boolean
  className?: string
}

/**
 * Alertas de la orden médica. Se muestran en el pre-registro, cuando el
 * paciente sube la orden, y otra vez en recepción antes de confirmar la
 * admisión, que es el último momento para resolverlas.
 */
export function AlertasOrden({
  audiencia,
  compacto = false,
  className,
}: AlertasOrdenProps) {
  const alertas = alertasOrden(audiencia)

  return (
    <section
      className={cn('entra', className)}
      aria-label="Alertas de la orden médica"
    >
      <h3
        className={cn(
          'font-semibold text-marino-300',
          compacto ? 'text-[11px]' : 'text-[12px]',
        )}
      >
        Alertas de la orden
      </h3>

      <ul className={cn('space-y-2', compacto ? 'mt-1.5' : 'mt-2')}>
        {alertas.map((alerta) => {
          const { caja, tono, icono: Icono } = ESTILO[alerta.nivel]

          return (
            <li
              key={alerta.id}
              className={cn(
                'flex items-start gap-2 rounded-xl border',
                caja,
                compacto ? 'p-2.5' : 'p-3',
              )}
            >
              <Icono
                className={cn(
                  'mt-px shrink-0',
                  tono,
                  compacto ? 'size-3.5' : 'size-4',
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    'font-semibold',
                    compacto ? 'text-[12px]' : 'text-[13px]',
                  )}
                >
                  {alerta.titulo}
                </p>
                <p
                  className={cn(
                    'mt-0.5 leading-snug text-marino-700',
                    compacto ? 'text-[11px]' : 'text-[12px]',
                  )}
                >
                  {alerta.detalle}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
