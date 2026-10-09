import { useEffect, useRef } from 'react'
import {
  ArrowLeft,
  ExternalLink,
  Lock,
  Mic,
  MoreVertical,
  Phone,
  Plus,
  Smile,
  Video,
} from 'lucide-react'

import { PhoneFrame } from '@/components/PhoneFrame'
import {
  ESTADO_BOT,
  GUION_CHAT,
  NOMBRE_BOT,
  type MensajeChat,
} from '@/data/chatScript'
import { cn, horaAhora } from '@/lib/utils'
import { useDemoStore } from '@/store/useDemoStore'

export function WhatsApp() {
  const vistos = useDemoStore((s) => s.flujo.mensajesVistos)
  const marcarFlujo = useDemoStore((s) => s.marcarFlujo)
  const irA = useDemoStore((s) => s.irA)

  const siguiente: MensajeChat | undefined = GUION_CHAT[vistos]
  // El bot escribe solo; el turno del paciente espera a que toque un botón.
  const botEscribiendo = siguiente?.autor === 'bot'

  useEffect(() => {
    if (!siguiente || siguiente.autor !== 'bot') return

    const id = window.setTimeout(
      () => marcarFlujo({ mensajesVistos: vistos + 1 }),
      siguiente.escribiendoMs ?? 1000,
    )
    return () => window.clearTimeout(id)
  }, [siguiente, vistos, marcarFlujo])

  const finRef = useRef<HTMLSpanElement | null>(null)

  // Solo al llegar un mensaje nuevo: si se dispara en cada render, le quita
  // el control del scroll a quien esté releyendo la conversación. El salto es
  // instantáneo porque con mensajes seguidos el desplazamiento suave se queda
  // atrás y el último mensaje aparece cortado.
  useEffect(() => {
    finRef.current?.scrollIntoView({ block: 'end' })
  }, [vistos, botEscribiendo])

  const mensajes = GUION_CHAT.slice(0, vistos)
  const ultimoBot = [...mensajes].reverse().find((m) => m.autor === 'bot')
  // Las respuestas rápidas solo se ofrecen si el turno es del paciente.
  const opciones =
    siguiente?.autor === 'paciente' ? (ultimoBot?.opciones ?? []) : []

  return (
    <PhoneFrame
      colorEstado="#0B1F3A"
      estadoOscuro
      encabezado={<Encabezado />}
      pie={
        <Pie
          opciones={opciones}
          onElegir={() => marcarFlujo({ mensajesVistos: vistos + 1 })}
        />
      }
      className="bg-menta"
    >
      <div className="flex min-h-full flex-col gap-2 px-3 py-4">
        <AvisoCifrado />

        {mensajes.map((mensaje) => (
          <Burbuja
            key={mensaje.id}
            mensaje={mensaje}
            onAbrirEnlace={() => irA('pre-registro')}
          />
        ))}

        {botEscribiendo && <Escribiendo />}

        {/* Ancla para que el chat quede siempre abajo. */}
        <span ref={finRef} />
      </div>
    </PhoneFrame>
  )
}

// --- Encabezado y pie -------------------------------------------------------

function Encabezado() {
  return (
    <div className="flex shrink-0 items-center gap-3 bg-marino px-3 py-2.5 text-white">
      <ArrowLeft className="size-5 shrink-0 text-white/70" aria-hidden />

      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal text-sm font-bold">
        S
      </span>

      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[14px] font-semibold">{NOMBRE_BOT}</p>
        <p className="truncate text-[11px] text-marino-300">{ESTADO_BOT}</p>
      </div>

      <Video className="size-5 shrink-0 text-white/70" aria-hidden />
      <Phone className="size-[18px] shrink-0 text-white/70" aria-hidden />
      <MoreVertical className="size-5 shrink-0 text-white/70" aria-hidden />
    </div>
  )
}

function Pie({
  opciones,
  onElegir,
}: {
  opciones: string[]
  onElegir: () => void
}) {
  return (
    <div className="shrink-0 bg-menta-200/60 px-3 pt-2 pb-1">
      {opciones.length > 0 && (
        <ul className="mb-2 flex flex-wrap justify-end gap-1.5">
          {opciones.map((opcion, i) => (
            <li key={opcion}>
              <button
                type="button"
                // Solo la primera opción avanza el guion: es la que el
                // paciente elige en la demo.
                onClick={i === 0 ? onElegir : undefined}
                disabled={i !== 0}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[13px] font-medium transition',
                  i === 0
                    ? 'border-teal bg-white text-teal-700 hover:bg-teal hover:text-white'
                    : 'border-marino/10 bg-white/60 text-marino-300',
                )}
              >
                {opcion}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-3 py-2">
          <Smile className="size-4 shrink-0 text-marino-300" aria-hidden />
          <span className="truncate text-[13px] text-marino-300">
            Escriba un mensaje
          </span>
          <Plus
            className="ml-auto size-4 shrink-0 text-marino-300"
            aria-hidden
          />
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-teal">
          <Mic className="size-4 text-white" aria-hidden />
        </span>
      </div>
    </div>
  )
}

// --- Mensajes ---------------------------------------------------------------

function AvisoCifrado() {
  return (
    <p className="mx-auto mb-1 flex max-w-[85%] items-center gap-1.5 rounded-lg bg-ambar-100 px-2.5 py-1.5 text-center text-[11px] leading-snug text-marino-700">
      <Lock className="size-3 shrink-0" aria-hidden />
      Los mensajes están cifrados de extremo a extremo.
    </p>
  )
}

function Burbuja({
  mensaje,
  onAbrirEnlace,
}: {
  mensaje: MensajeChat
  onAbrirEnlace: () => void
}) {
  const esPaciente = mensaje.autor === 'paciente'

  return (
    <div
      className={cn('entra flex', esPaciente ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[82%] rounded-2xl px-3 py-2 text-[13.5px] leading-relaxed shadow-sm',
          esPaciente
            ? 'rounded-br-sm bg-teal text-white'
            : 'rounded-bl-sm bg-white text-marino',
        )}
      >
        {mensaje.texto.map((parrafo, i) => (
          <p key={i} className={i > 0 ? 'mt-1.5' : undefined}>
            {parrafo}
          </p>
        ))}

        {mensaje.enlacePreRegistro && (
          <button
            type="button"
            onClick={onAbrirEnlace}
            className="mt-2.5 flex w-full items-center justify-between gap-2 rounded-xl border border-teal/30 bg-menta px-3 py-2 text-left transition hover:bg-menta-200"
          >
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold text-teal-700">
                {mensaje.enlacePreRegistro.etiqueta}
              </span>
              <span className="block truncate text-[11px] text-marino-300">
                {mensaje.enlacePreRegistro.url}
              </span>
            </span>
            <ExternalLink className="size-4 shrink-0 text-teal" aria-hidden />
          </button>
        )}

        <p
          className={cn(
            'mt-1 text-right text-[10px] tabular-nums',
            esPaciente ? 'text-white/70' : 'text-marino-300',
          )}
        >
          {horaAhora()}
        </p>
      </div>
    </div>
  )
}

function Escribiendo() {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-3.5 py-3 shadow-sm"
        role="status"
        aria-label="SOMEDIAG está escribiendo"
      >
        {[0, 150, 300].map((retraso) => (
          <span
            key={retraso}
            className="size-1.5 animate-bounce rounded-full bg-marino-300"
            style={{ animationDelay: `${retraso}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
