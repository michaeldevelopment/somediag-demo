import { ChevronRight, Info, Plug, ShieldCheck } from 'lucide-react'

import {
  CADENA_INTEGRACION,
  CONTROLES,
  ETIQUETA_ESTADO_INTEGRACION,
  INTEGRACIONES,
  TONO_ESTADO_INTEGRACION,
  type Integracion,
} from '@/data/integraciones'
import { cn } from '@/lib/utils'

export function Integraciones() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-[12px] font-semibold tracking-wide text-teal-700 uppercase">
          Arquitectura propuesta
        </p>
        <h1 className="text-xl font-semibold">
          Las conexiones que sostienen el recorrido
        </h1>
        <p className="text-sm text-marino-300">
          {INTEGRACIONES.length} puntos de integración. El alcance definitivo
          depende de validar las APIs y los mecanismos disponibles en cada
          sistema.
        </p>
      </header>

      <Cadena />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRACIONES.map((integracion) => (
          <Tarjeta key={integracion.id} integracion={integracion} />
        ))}
      </section>

      <Controles />

      <p className="flex items-start gap-2 rounded-xl border border-ambar/40 bg-ambar-100/60 p-4 text-[12px] leading-relaxed text-marino-700">
        <Info className="mt-px size-4 shrink-0 text-ambar" aria-hidden />
        <span>
          Ninguna integración está conectada en esta demo. Todo lo que se ve en
          las otras pantallas es una simulación con datos ficticios: el alcance
          real depende de validar APIs, versiones y mecanismos disponibles en
          cada sistema de SOMEDIAG.
        </span>
      </p>
    </div>
  )
}

// --- Cadena de datos --------------------------------------------------------

function Cadena() {
  return (
    <section
      aria-label="Recorrido de los datos"
      className="scrollbar-fina flex items-stretch gap-2 overflow-x-auto pb-2"
    >
      {CADENA_INTEGRACION.map(({ paso, detalle }, i) => (
        <div key={paso} className="flex items-center gap-2">
          <div className="min-w-[160px] rounded-xl border border-marino/10 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold text-marino-300 tabular-nums">
              {String(i + 1).padStart(2, '0')}
            </p>
            <p className="text-[13px] font-semibold whitespace-nowrap">
              {paso}
            </p>
            <p className="text-[11px] whitespace-nowrap text-marino-300">
              {detalle}
            </p>
          </div>

          {i < CADENA_INTEGRACION.length - 1 && (
            <ChevronRight
              className="size-4 shrink-0 text-marino-300"
              aria-hidden
            />
          )}
        </div>
      ))}
    </section>
  )
}

// --- Tarjeta de integración -------------------------------------------------

function Tarjeta({ integracion }: { integracion: Integracion }) {
  const { nombre, resumen, estado, intercambio, alcance } = integracion

  return (
    <article className="flex flex-col rounded-xl border border-marino/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-marino text-white">
          <Plug className="size-4" aria-hidden />
        </span>

        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-medium whitespace-nowrap',
            TONO_ESTADO_INTEGRACION[estado],
          )}
        >
          {ETIQUETA_ESTADO_INTEGRACION[estado]}
        </span>
      </div>

      <h2 className="mt-4 text-[15px] font-semibold">{nombre}</h2>
      <p className="text-[12px] text-marino-300">{resumen}</p>

      <dl className="mt-4 space-y-3 border-t border-marino/10 pt-4">
        <div>
          <dt className="text-[11px] font-medium tracking-wide text-marino-300 uppercase">
            Intercambio
          </dt>
          <dd className="text-[13px] font-medium">{intercambio}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium tracking-wide text-marino-300 uppercase">
            Alcance
          </dt>
          <dd className="text-[12px] leading-relaxed text-marino-700">
            {alcance}
          </dd>
        </div>
      </dl>
    </article>
  )
}

// --- Controles --------------------------------------------------------------

function Controles() {
  return (
    <section className="rounded-xl border border-marino/10 bg-white p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="size-4 text-teal" aria-hidden />
        Controles clínicos y de acceso
      </h2>
      <p className="text-[12px] text-marino-300">
        Se mantienen igual en cualquiera de los escenarios de integración.
      </p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CONTROLES.map(({ titulo, detalle }) => (
          <div key={titulo} className="rounded-lg bg-menta/60 p-3">
            <dt className="text-[13px] font-semibold">{titulo}</dt>
            <dd className="mt-0.5 text-[11px] leading-relaxed text-marino-700">
              {detalle}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
