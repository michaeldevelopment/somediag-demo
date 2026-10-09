import { Bot, UserRound } from 'lucide-react'

import { ATENCION_INICIAL, PORCENTAJE_RESUELTO } from '@/data/metricas'

const { contactos, resueltos, preRegistros, escalados, canales } =
  ATENCION_INICIAL

export function PanelContencion() {
  return (
    <article className="rounded-xl border border-marino/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Atención inicial</h2>
          <p className="text-[12px] text-marino-300">
            {contactos} contactos recibidos hoy
          </p>
        </div>
        <Bot className="size-4 shrink-0 text-teal" aria-hidden />
      </div>

      {/* La cifra del empleado digital: cuánto cierra solo. */}
      <p className="mt-4 text-3xl font-semibold text-teal-700 tabular-nums">
        {PORCENTAJE_RESUELTO}%
      </p>
      <p className="text-[12px] text-marino-300">
        de los contactos se resuelven sin intervención de una persona
      </p>

      <div
        className="mt-3 flex h-2 overflow-hidden rounded-full bg-marino/5"
        aria-hidden
      >
        <span
          className="bg-teal"
          style={{ width: `${(resueltos / contactos) * 100}%` }}
        />
        <span
          className="bg-ambar"
          style={{ width: `${(escalados / contactos) * 100}%` }}
        />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        <Dato valor={resueltos} etiqueta="Orientados por el agente" />
        <Dato valor={preRegistros} etiqueta="Pre-registros iniciados" />
        <Dato valor={escalados} etiqueta="Escalados a una persona" icono />
        <Dato valor={contactos} etiqueta="Contactos del día" />
      </dl>

      <div className="mt-4 border-t border-marino/10 pt-3">
        <p className="text-[11px] font-medium text-marino-300">
          Canal de ingreso
        </p>
        <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
          {canales.map(({ canal, porcentaje }) => (
            <li key={canal} className="text-[12px]">
              <span className="font-medium">{canal}</span>{' '}
              <span className="text-marino-300 tabular-nums">
                {porcentaje}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function Dato({
  valor,
  etiqueta,
  icono = false,
}: {
  valor: number
  etiqueta: string
  icono?: boolean
}) {
  return (
    <div>
      <dt className="sr-only">{etiqueta}</dt>
      <dd>
        <span className="flex items-center gap-1.5 text-xl font-semibold tabular-nums">
          {icono && (
            <UserRound className="size-3.5 text-ambar" aria-hidden />
          )}
          {valor}
        </span>
        <span className="text-[11px] text-marino-300">{etiqueta}</span>
      </dd>
    </div>
  )
}
