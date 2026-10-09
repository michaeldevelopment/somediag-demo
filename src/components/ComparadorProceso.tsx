import { ArrowRight } from 'lucide-react'

import {
  DIGITACIONES,
  totalAdministrativo,
  totalProceso,
  type ModoProceso,
} from '@/data/metricas'
import { cn, duracion } from '@/lib/utils'
import { useDemoStore } from '@/store/useDemoStore'

const MODOS: { id: ModoProceso; etiqueta: string }[] = [
  { id: 'actual', etiqueta: 'Proceso actual' },
  { id: 'programa', etiqueta: 'Con el programa' },
]

export function ComparadorProceso() {
  const comparador = useDemoStore((s) => s.comparador)
  const verComparador = useDemoStore((s) => s.verComparador)
  const manual = comparador === 'actual'

  return (
    <section
      className={cn(
        'rounded-xl border p-5 transition-colors',
        manual
          ? 'border-ambar/40 bg-ambar-100/60'
          : 'border-teal/30 bg-menta/60',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Comparación de proceso</h2>
          <p className="text-[12px] text-marino-300">
            El mismo recorrido, antes y después del programa.
          </p>
        </div>

        <div
          role="group"
          aria-label="Vista de la comparación"
          className="flex rounded-lg bg-white p-1"
        >
          {MODOS.map(({ id, etiqueta }) => {
            const activo = comparador === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => verComparador(id)}
                aria-pressed={activo}
                className={cn(
                  'rounded-md px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition',
                  activo
                    ? id === 'actual'
                      ? 'bg-ambar text-white'
                      : 'bg-teal text-white'
                    : 'text-marino-300 hover:text-marino',
                )}
              >
                {etiqueta}
              </button>
            )
          })}
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Cifra
          etiqueta="Gestión administrativa"
          nota="Pre-registro, admisión y entrega"
          antes={duracion(totalAdministrativo('actual'))}
          despues={duracion(totalAdministrativo('programa'))}
          manual={manual}
        />
        <Cifra
          etiqueta="Proceso total"
          nota="Suma de las cinco etapas"
          antes={duracion(totalProceso('actual'))}
          despues={duracion(totalProceso('programa'))}
          manual={manual}
        />
        <Cifra
          etiqueta="Digitación del mismo dato"
          nota="Veces que alguien lo vuelve a teclear"
          antes={`${DIGITACIONES.actual} veces`}
          despues={`${DIGITACIONES.programa} veces`}
          manual={manual}
        />
      </dl>

      <p className="mt-4 text-[11px] leading-relaxed text-marino-300">
        Supuesto ilustrativo sobre 150 estudios al día · suma de las etapas del
        proceso, sin incluir las esperas entre una y otra · datos ficticios.
      </p>
    </section>
  )
}

/**
 * Las dos caras de una misma cifra. La del modo activo manda tipográficamente
 * y la otra queda de referencia, para que el contraste se lea de un vistazo
 * sin tener que alternar el toggle.
 */
function Cifra({
  etiqueta,
  nota,
  antes,
  despues,
  manual,
}: {
  etiqueta: string
  nota: string
  antes: string
  despues: string
  manual: boolean
}) {
  return (
    <div className="rounded-lg bg-white p-4">
      <dt className="text-[12px] font-medium text-marino-300">{etiqueta}</dt>

      <dd className="mt-1.5 flex items-baseline gap-2">
        <span
          className={cn(
            'font-semibold tabular-nums transition-all',
            manual ? 'text-2xl text-ambar' : 'text-sm text-marino-300',
          )}
        >
          {antes}
        </span>

        <ArrowRight className="size-3.5 shrink-0 text-marino-300" aria-hidden />

        <span
          className={cn(
            'font-semibold tabular-nums transition-all',
            manual ? 'text-sm text-marino-300' : 'text-2xl text-teal-700',
          )}
        >
          {despues}
        </span>
      </dd>

      <p className="mt-1 text-[11px] text-marino-300">{nota}</p>
    </div>
  )
}
