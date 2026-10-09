import { FlaskConical } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Aviso permanente de que nada en pantalla es información real de pacientes.
 * En pantallas anchas vive en la barra de presentador, donde no tapa el
 * tablero; aquí solo cubre las ventanas angostas, donde la barra no lo cabe.
 */
export function EtiquetaDemo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed right-4 bottom-4 z-50 flex items-center gap-1.5 xl:hidden',
        'rounded-full border border-marino/10 bg-white/85 px-3 py-1.5',
        'text-[11px] font-medium tracking-wide text-marino-300 shadow-sm backdrop-blur',
        className,
      )}
    >
      <FlaskConical className="size-3.5" aria-hidden />
      Demo · datos ficticios
    </div>
  )
}
