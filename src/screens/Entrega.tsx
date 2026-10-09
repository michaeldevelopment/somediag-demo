import { useRef, useState } from 'react'
import {
  AlertCircle,
  Check,
  ExternalLink,
  Lock,
  ShieldCheck,
} from 'lucide-react'

import { PhoneFrame } from '@/components/PhoneFrame'
import { NOTIFICACION_RESULTADO } from '@/data/chatScript'
import { transcripcionDe } from '@/data/mockCasos'
import { RADIOLOGO_ASIGNADO } from '@/data/radiologos'
import { ETIQUETA_MODALIDAD, ETIQUETA_TIPO, type Caso } from '@/data/tipos'
import { cn, fechaLarga, horaAhora } from '@/lib/utils'
import { selCasoProtagonista, useDemoStore } from '@/store/useDemoStore'

/** Los últimos 4 dígitos del documento, sin puntos ni prefijo. */
function ultimos4(documento: string) {
  return documento.replace(/\D/g, '').slice(-4)
}

export function Entrega() {
  const caso = useDemoStore(selCasoProtagonista)
  const verificada = useDemoStore((s) => s.flujo.identidadVerificada)
  const marcarFlujo = useDemoStore((s) => s.marcarFlujo)
  const avanzarCaso = useDemoStore((s) => s.avanzarCaso)

  const [abrioEnlace, setAbrioEnlace] = useState(false)

  function verificar() {
    avanzarCaso(caso.id, 'resultado_entregado')
    marcarFlujo({ identidadVerificada: true })
  }

  return (
    <PhoneFrame
      colorEstado={verificada || abrioEnlace ? '#ffffff' : '#0B1F3A'}
      estadoOscuro={!verificada && !abrioEnlace}
      colorBase={verificada || abrioEnlace ? '#ffffff' : '#0B1F3A'}
      className={verificada ? 'bg-white' : 'bg-menta'}
    >
      {verificada ? (
        <Informe caso={caso} />
      ) : abrioEnlace ? (
        <Verificacion
          esperado={ultimos4(caso.paciente.documento)}
          onVerificado={verificar}
        />
      ) : (
        <Notificacion onAbrir={() => setAbrioEnlace(true)} />
      )}
    </PhoneFrame>
  )
}

// --- Notificación -----------------------------------------------------------

function Notificacion({ onAbrir }: { onAbrir: () => void }) {
  return (
    <div className="flex min-h-full flex-col bg-marino px-4 pt-10 pb-6">
      <div className="text-center text-white">
        <p className="text-5xl font-light tabular-nums">{horaAhora()}</p>
        <p className="mt-1 text-[13px] text-marino-300">Pantalla de bloqueo</p>
      </div>

      <button
        type="button"
        onClick={onAbrir}
        className="entra-desde-arriba mt-10 w-full rounded-2xl bg-white/95 p-3.5 text-left shadow-lg backdrop-blur transition hover:bg-white"
      >
        <div className="flex items-center gap-2">
          <span className="grid size-6 shrink-0 place-items-center rounded-md bg-teal text-[11px] font-bold text-white">
            S
          </span>
          <span className="text-[12px] font-semibold">
            {NOTIFICACION_RESULTADO.titulo}
          </span>
          <span className="ml-auto text-[11px] text-marino-300 tabular-nums">
            ahora
          </span>
        </div>

        <p className="mt-2 text-[14px] font-semibold">
          Su resultado está listo
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-marino-700">
          {NOTIFICACION_RESULTADO.texto}
        </p>

        <span className="mt-2.5 flex items-center justify-between gap-2 rounded-xl border border-teal/30 bg-menta px-3 py-2">
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-teal-700">
              {NOTIFICACION_RESULTADO.etiquetaEnlace}
            </span>
            <span className="block truncate text-[11px] text-marino-300">
              {NOTIFICACION_RESULTADO.url}
            </span>
          </span>
          <ExternalLink className="size-4 shrink-0 text-teal" aria-hidden />
        </span>
      </button>

      <p className="mt-auto flex items-start gap-1.5 pt-8 text-[11px] leading-snug text-marino-300">
        <Lock className="mt-px size-3 shrink-0" aria-hidden />
        La notificación no contiene resultados. Para verlos hay que verificar la
        identidad.
      </p>
    </div>
  )
}

// --- Verificación -----------------------------------------------------------

function Verificacion({
  esperado,
  onVerificado,
}: {
  esperado: string
  onVerificado: () => void
}) {
  const [valor, setValor] = useState('')
  const [error, setError] = useState(false)
  const campoRef = useRef<HTMLInputElement>(null)

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (valor === esperado) {
      onVerificado()
    } else {
      setError(true)
      setValor('')
      campoRef.current?.focus()
    }
  }

  return (
    <form
      onSubmit={enviar}
      className="entra flex min-h-full flex-col items-center px-6 pt-12 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-menta">
        <ShieldCheck className="size-6 text-teal" aria-hidden />
      </span>

      <h1 className="mt-4 text-lg font-semibold">Verifique su identidad</h1>
      <p className="mt-1 text-[13px] leading-snug text-marino-300">
        Para proteger su información, ingrese los últimos 4 dígitos de su
        documento de identidad.
      </p>

      <label htmlFor="digitos" className="sr-only">
        Últimos 4 dígitos del documento
      </label>
      <input
        id="digitos"
        ref={campoRef}
        value={valor}
        onChange={(e) => {
          setValor(e.target.value.replace(/\D/g, '').slice(0, 4))
          setError(false)
        }}
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        placeholder="••••"
        aria-invalid={error}
        className={cn(
          'mt-6 w-44 rounded-xl border-2 bg-white py-3 text-center text-2xl font-semibold tracking-[0.5em] tabular-nums focus:outline-none',
          error ? 'border-coral' : 'border-marino/15 focus:border-teal',
        )}
      />

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-[12px] font-medium text-coral-700">
          <AlertCircle className="size-3.5" aria-hidden />
          Los dígitos no coinciden. Intente de nuevo.
        </p>
      )}

      <button
        type="submit"
        disabled={valor.length !== 4}
        className="mt-6 w-full rounded-xl bg-teal py-3 text-sm font-semibold text-white transition enabled:hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-marino/15 disabled:text-marino-300"
      >
        Ver mi resultado
      </button>

      <p className="mt-auto pb-6 text-[11px] leading-snug text-marino-300">
        El enlace es de un solo uso y expira a las 72 horas.
      </p>
    </form>
  )
}

// --- Informe ----------------------------------------------------------------

function Informe({ caso }: { caso: Caso }) {
  const hallazgos = caso.transcripcion ?? transcripcionDe(caso)
  const medico = caso.radiologo ?? RADIOLOGO_ASIGNADO.nombre
  const firmaHora =
    caso.historial.find((h) => h.estado === 'resultado_aprobado')?.hora ??
    horaAhora()

  return (
    <article className="entra min-h-full">
      <header className="bg-marino px-5 py-4 text-white">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-teal font-bold">
            S
          </span>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold tracking-wide">SOMEDIAG</p>
            <p className="text-[11px] text-marino-300">
              Servicios de diagnóstico por imágenes
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] text-marino-300">
          NIT 900.XXX.XXX-X · Medellín, Colombia · Habilitación 0000-00
        </p>
      </header>

      <div className="flex items-center gap-2 bg-verde-100 px-5 py-2.5 text-[12px] font-semibold text-verde">
        <Check className="size-4 shrink-0" aria-hidden />
        Resultado entregado
      </div>

      <div className="space-y-5 px-5 py-5">
        <section>
          <h1 className="text-[15px] font-semibold">Informe radiológico</h1>
          <p className="text-[11px] text-marino-300 tabular-nums">
            Caso {caso.id}
          </p>
        </section>

        <dl className="space-y-2 rounded-lg bg-menta/60 p-3 text-[12.5px]">
          <Fila etiqueta="Paciente" valor={caso.paciente.nombre} />
          <Fila etiqueta="Documento" valor={caso.paciente.documento} />
          <Fila
            etiqueta="Convenio"
            valor={caso.empresa ?? ETIQUETA_TIPO[caso.tipo]}
          />
          <Fila
            etiqueta="Estudio"
            valor={`${caso.estudio} · ${ETIQUETA_MODALIDAD[caso.modalidad]}`}
          />
        </dl>

        <section>
          <h2 className="text-[11px] font-semibold tracking-wide text-marino-300 uppercase">
            Hallazgos y conclusión
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed">{hallazgos}</p>
        </section>

        <section className="border-t border-marino/10 pt-4">
          {/* Firma manuscrita estilizada, no la rúbrica de una persona real. */}
          <svg
            viewBox="0 0 160 36"
            className="h-9 w-40 text-marino"
            aria-hidden
            fill="none"
          >
            <path
              d="M4 28 C10 10 16 6 20 14 C24 22 22 30 26 30 C31 30 32 14 36 8 C40 2 44 10 44 18 C44 26 42 30 46 30 C52 30 56 12 62 10 C68 8 66 24 72 24 C78 24 80 12 86 12 C92 12 90 26 96 26 C104 26 108 14 116 16 C124 18 122 28 130 26 C138 24 146 16 156 10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-1 text-[13px] font-semibold">{medico}</p>
          <p className="text-[11px] text-marino-300">
            {RADIOLOGO_ASIGNADO.especialidad} · R.M. 00000
          </p>
          <p className="mt-1.5 text-[11px] text-marino-300">
            Firmado electrónicamente el {fechaLarga()} a las{' '}
            <span className="tabular-nums">{firmaHora}</span>
          </p>
        </section>

        <p className="flex items-start gap-1.5 rounded-lg bg-menta/60 p-3 text-[11px] leading-snug text-marino-300">
          <ShieldCheck
            className="mt-px size-3.5 shrink-0 text-teal"
            aria-hidden
          />
          Este informe es un documento ficticio generado para la demostración.
          No tiene validez clínica ni legal.
        </p>
      </div>
    </article>
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-marino-300">{etiqueta}</dt>
      <dd className="text-right font-medium">{valor}</dd>
    </div>
  )
}
