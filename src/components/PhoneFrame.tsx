import type { ReactNode } from 'react'
import { BatteryFull, Signal, Wifi } from 'lucide-react'

import { cn, horaAhora } from '@/lib/utils'

interface PhoneFrameProps {
  children: ReactNode
  /** Barra superior propia de la app (encabezado de WhatsApp, por ejemplo). */
  encabezado?: ReactNode
  /** Barra inferior fija dentro del teléfono (campo de texto, botón, etc.). */
  pie?: ReactNode
  /** Color de la barra de estado del sistema; por defecto blanco. */
  colorEstado?: string
  /** Pone en blanco la hora y los íconos cuando la barra de estado es oscura. */
  estadoOscuro?: boolean
  /** Fondo de la pantalla completa, incluida la franja del indicador. */
  colorBase?: string
  /** Fondo del área de contenido. */
  className?: string
}

/**
 * Marco de celular de ~390 px centrado en pantalla, para las pantallas de
 * paciente. El contenido hace scroll dentro del marco, no en la página.
 */
export function PhoneFrame({
  children,
  encabezado,
  pie,
  colorEstado = '#ffffff',
  estadoOscuro = false,
  colorBase = '#ffffff',
  className,
}: PhoneFrameProps) {
  return (
    <div className="flex w-full justify-center">
      <div className="w-[390px] shrink-0 rounded-[2.75rem] bg-marino p-[11px] shadow-[0_30px_60px_-15px_rgba(11,31,58,0.45)]">
        <div
          className="relative flex h-[780px] flex-col overflow-hidden rounded-[2.25rem]"
          style={{ backgroundColor: colorBase }}
        >
          <BarraEstado color={colorEstado} oscuro={estadoOscuro} />

          {encabezado}

          <div
            className={cn(
              'scrollbar-fina min-h-0 flex-1 overflow-y-auto overscroll-contain',
              className,
            )}
          >
            {children}
          </div>

          {pie}

          <div className="flex justify-center pt-1 pb-2">
            <span
              className={cn(
                'h-1 w-32 rounded-full',
                estadoOscuro ? 'bg-white/35' : 'bg-marino/25',
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function BarraEstado({ color, oscuro }: { color: string; oscuro: boolean }) {
  return (
    <div
      className={cn(
        'relative flex h-11 shrink-0 items-end justify-between px-6 pb-1 text-[12px] font-semibold',
        oscuro ? 'text-white' : 'text-marino',
      )}
      style={{ backgroundColor: color }}
    >
      <span>{horaAhora()}</span>

      {/* Muesca de la cámara frontal; sobre fondo oscuro se dibuja en negro. */}
      <span
        className={cn(
          'absolute top-2 left-1/2 h-5 w-24 -translate-x-1/2 rounded-full',
          oscuro ? 'bg-black' : 'bg-marino',
        )}
      />

      <span className="flex items-center gap-1" aria-hidden>
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-4" />
      </span>
    </div>
  )
}
