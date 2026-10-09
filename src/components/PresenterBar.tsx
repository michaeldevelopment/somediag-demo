import { useState } from 'react'
import { FlaskConical, RotateCcw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { PESTANAS, useDemoStore } from '@/store/useDemoStore'

/** Alto de la barra, para que el contenido de las pantallas no quede debajo. */
export const ALTO_BARRA = 60

export function PresenterBar() {
  const pestana = useDemoStore((s) => s.pestana)
  const irA = useDemoStore((s) => s.irA)
  const reiniciarDemo = useDemoStore((s) => s.reiniciarDemo)
  const [confirmando, setConfirmando] = useState(false)

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 border-b border-marino/10 bg-marino text-white"
      style={{ height: ALTO_BARRA }}
    >
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-4 px-4">
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-teal font-bold">
            S
          </span>
          <div className="hidden leading-tight lg:block">
            <p className="text-[13px] font-semibold">SOMEDIAG</p>
            <p className="text-[11px] text-marino-300">
              Programa Cero Digitación
            </p>
          </div>

          {/* Aviso permanente de que nada en pantalla es información real. */}
          <span className="hidden items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[11px] font-medium text-marino-300 xl:flex">
            <FlaskConical className="size-3" aria-hidden />
            Demo · datos ficticios
          </span>
        </div>

        <nav aria-label="Pantallas de la demo" className="min-w-0 flex-1">
          <ul className="scrollbar-fina flex items-center gap-1 overflow-x-auto">
            {PESTANAS.map(({ id, etiqueta }) => {
              const activa = pestana === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => irA(id)}
                    aria-current={activa ? 'page' : undefined}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition',
                      activa
                        ? 'bg-teal text-white'
                        : 'text-marino-300 hover:bg-marino-700 hover:text-white',
                    )}
                  >
                    {etiqueta}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {confirmando ? (
          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden text-[12px] text-marino-300 sm:block">
              ¿Reiniciar?
            </span>
            <button
              type="button"
              onClick={() => {
                reiniciarDemo()
                setConfirmando(false)
              }}
              className="rounded-lg bg-coral px-3 py-1.5 text-[13px] font-semibold hover:bg-coral-700"
            >
              Sí, reiniciar
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              className="rounded-lg px-2 py-1.5 text-[13px] text-marino-300 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-[13px] font-medium text-marino-300 transition hover:border-white/40 hover:text-white"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            <span className="hidden sm:inline">Reiniciar demo</span>
          </button>
        )}
      </div>
    </header>
  )
}
