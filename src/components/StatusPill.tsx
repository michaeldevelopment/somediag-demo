import { ETIQUETA_ESTADO, type Estado } from '@/data/tipos'
import { cn } from '@/lib/utils'

/** Gris para lo que aún no arranca, teal para lo que está en curso, verde al cerrar. */
const TONO: Record<Estado, string> = {
  registro_iniciado: 'bg-marino/5 text-marino-300',
  registro_completo: 'bg-marino/5 text-marino-700',
  admitido: 'bg-menta text-teal-700',
  estudio_realizado: 'bg-menta text-teal-700',
  enviado_radiologo: 'bg-menta-200 text-teal-700',
  lectura_recibida: 'bg-menta-200 text-teal-700',
  resultado_aprobado: 'bg-verde-100 text-verde',
  resultado_entregado: 'bg-verde-100 text-verde',
}

interface StatusPillProps {
  estado: Estado
  className?: string
}

export function StatusPill({ estado, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap',
        TONO[estado],
        className,
      )}
    >
      {ETIQUETA_ESTADO[estado]}
    </span>
  )
}
