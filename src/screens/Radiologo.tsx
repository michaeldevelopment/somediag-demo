import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, FileSignature, Mic, PenLine, Square, X } from 'lucide-react'

import { SlaBadge } from '@/components/SlaBadge'
import { StatusPill } from '@/components/StatusPill'
import { CASO_PROTAGONISTA_ID, transcripcionDe } from '@/data/mockCasos'
import { RADIOLOGO_ASIGNADO } from '@/data/radiologos'
import {
  ETIQUETA_MODALIDAD,
  ETIQUETA_TIPO,
  type Caso,
  type Estado,
} from '@/data/tipos'
import { cn, fechaHoraLarga, mmss } from '@/lib/utils'
import { useDemoStore } from '@/store/useDemoStore'

/** Duración de la barra simulada cuando no hay `public/dictado.mp3`. */
const SEGUNDOS_SIMULADOS = 15

/**
 * Margen para que el audio empiece a sonar antes de darlo por perdido.
 * Un navegador sin el códec de MP3 deja el elemento cargando para siempre y
 * nunca dispara `error`, así que el reloj es la única señal fiable.
 */
const MS_ESPERA_AUDIO = 1200

/** Estados en los que el estudio ya llegó al radiólogo y se puede abrir. */
const ESTADOS_LEGIBLES = new Set<Estado>([
  'enviado_radiologo',
  'lectura_recibida',
  'resultado_aprobado',
  'resultado_entregado',
])

export function Radiologo() {
  const casos = useDemoStore((s) => s.casos)
  const avanzarCaso = useDemoStore((s) => s.avanzarCaso)
  const guardarTranscripcion = useDemoStore((s) => s.guardarTranscripcion)
  const marcarFlujo = useDemoStore((s) => s.marcarFlujo)

  const pendientes = useMemo(
    () =>
      casos.filter(
        (c) =>
          c.estado === 'enviado_radiologo' || c.estado === 'lectura_recibida',
      ),
    [casos],
  )

  const [abiertoId, setAbiertoId] = useState<string | null>(
    CASO_PROTAGONISTA_ID,
  )
  // El caso firmado sale de la cola pero sigue abierto en el visor, para que
  // el presentador vea la confirmación en lugar de un panel vacío.
  const abierto =
    casos.find((c) => c.id === abiertoId && ESTADOS_LEGIBLES.has(c.estado)) ??
    null

  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[320px_1fr]">
      <ListaPendientes
        casos={pendientes}
        abiertoId={abiertoId}
        onAbrir={setAbiertoId}
      />

      {abierto ? (
        <Lector
          // Reinicia el estado interno al cambiar de caso.
          key={abierto.id}
          caso={abierto}
          onLectura={(texto) => {
            guardarTranscripcion(abierto.id, texto)
            avanzarCaso(abierto.id, 'lectura_recibida')
            if (abierto.id === CASO_PROTAGONISTA_ID) {
              marcarFlujo({ dictadoTranscrito: true })
            }
          }}
          onFirmar={(texto) => {
            guardarTranscripcion(abierto.id, texto)
            avanzarCaso(abierto.id, 'resultado_aprobado')
            if (abierto.id === CASO_PROTAGONISTA_ID) {
              marcarFlujo({ informeFirmado: true })
            }
          }}
        />
      ) : (
        <div className="grid min-h-60 place-items-center rounded-xl border border-marino/10 bg-white p-8 text-center text-sm text-marino-300">
          {pendientes.length === 0
            ? 'No hay estudios pendientes de lectura.'
            : 'Seleccione un estudio de la lista para empezar la lectura.'}
        </div>
      )}
    </div>
  )
}

// --- Lista de pendientes ----------------------------------------------------

function ListaPendientes({
  casos,
  abiertoId,
  onAbrir,
}: {
  casos: Caso[]
  abiertoId: string | null
  onAbrir: (id: string) => void
}) {
  return (
    <aside className="h-fit rounded-xl border border-marino/10 bg-white p-4 lg:sticky lg:top-24">
      <h1 className="text-sm font-semibold">Estudios pendientes</h1>
      <p className="text-[12px] text-marino-300">
        {RADIOLOGO_ASIGNADO.nombre} · {casos.length} en cola
      </p>

      <ul className="mt-3 space-y-2">
        {casos.map((caso) => {
          const activo = caso.id === abiertoId
          return (
            <li key={caso.id}>
              <button
                type="button"
                onClick={() => onAbrir(caso.id)}
                aria-current={activo ? 'true' : undefined}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition',
                  activo
                    ? 'border-teal bg-menta/50 ring-2 ring-teal/20'
                    : 'border-marino/10 hover:border-teal',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-marino-300 tabular-nums">
                    {caso.id}
                  </span>
                  <SlaBadge caso={caso} compacto />
                </div>
                <p className="mt-1 truncate text-[13px] font-medium">
                  {caso.paciente.nombre}
                </p>
                <p className="truncate text-[11px] text-marino-300">
                  {caso.estudio}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

// --- Lector -----------------------------------------------------------------

interface LectorProps {
  caso: Caso
  onLectura: (texto: string) => void
  onFirmar: (texto: string) => void
}

function Lector({ caso, onLectura, onFirmar }: LectorProps) {
  const dictadoEsperado = transcripcionDe(caso)
  const yaLeido = Boolean(caso.transcripcion)
  const firmado = caso.estado === 'resultado_aprobado'

  const [texto, setTexto] = useState(caso.transcripcion ?? '')
  const [confirmando, setConfirmando] = useState(false)

  const dictado = useDictado(dictadoEsperado, {
    enProgreso: setTexto,
    alTerminar: (completo) => {
      setTexto(completo)
      onLectura(completo)
    },
  })

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-marino/10 bg-white p-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-marino-300 tabular-nums">
            {caso.id}
          </p>
          <h2 className="truncate text-lg font-semibold">
            {caso.paciente.nombre}
          </h2>
          <p className="text-[12px] text-marino-300">
            {caso.estudio} · {ETIQUETA_MODALIDAD[caso.modalidad]} ·{' '}
            {caso.empresa ?? ETIQUETA_TIPO[caso.tipo]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill estado={caso.estado} />
          <SlaBadge caso={caso} />
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,340px)_1fr]">
        <figure className="rounded-xl border border-marino/10 bg-marino p-3">
          <img
            src={`${import.meta.env.BASE_URL}radiografia.svg`}
            alt="Esquema ilustrativo de radiografía de tórax, no corresponde a un paciente real"
            className="w-full rounded-lg"
          />
          <figcaption className="mt-2 text-center text-[11px] font-medium text-marino-300">
            Imagen ilustrativa · ningún paciente real
          </figcaption>
        </figure>

        <div className="space-y-3 rounded-xl border border-marino/10 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Informe</h3>
            {yaLeido && !dictado.reproduciendo && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-marino-300">
                <PenLine className="size-3" aria-hidden />
                Texto editable
              </span>
            )}
          </div>

          <ControlDictado
            reproduciendo={dictado.reproduciendo}
            progreso={dictado.progreso}
            duracion={dictado.duracion}
            simulado={dictado.simulado}
            audioRef={dictado.audioRef}
            deshabilitado={firmado}
            onAlternar={dictado.alternar}
          />

          <label htmlFor="transcripcion" className="sr-only">
            Transcripción del dictado
          </label>
          <textarea
            id="transcripcion"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            readOnly={dictado.reproduciendo || firmado}
            rows={9}
            placeholder="Pulse «Dictar» para transcribir el informe."
            className="w-full resize-y rounded-lg border border-marino/15 p-3 text-[13px] leading-relaxed placeholder:text-marino-300 focus:border-teal focus:outline-none read-only:bg-marino/[0.03]"
          />

          {firmado ? (
            <p className="flex items-center gap-2 rounded-lg bg-verde-100 px-3 py-2.5 text-sm font-semibold text-verde">
              <Check className="size-4" aria-hidden />
              Informe firmado por {caso.radiologo ?? RADIOLOGO_ASIGNADO.nombre}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              disabled={!texto.trim() || dictado.reproduciendo}
              className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-marino/15 disabled:text-marino-300"
            >
              <FileSignature className="size-4" aria-hidden />
              Aprobar y firmar
            </button>
          )}
        </div>
      </div>

      {confirmando && (
        <ModalFirma
          medico={caso.radiologo ?? RADIOLOGO_ASIGNADO.nombre}
          onCancelar={() => setConfirmando(false)}
          onConfirmar={() => {
            onFirmar(texto)
            setConfirmando(false)
          }}
        />
      )}
    </section>
  )
}

// --- Dictado ----------------------------------------------------------------

function ControlDictado({
  reproduciendo,
  progreso,
  duracion,
  simulado,
  audioRef,
  deshabilitado,
  onAlternar,
}: {
  reproduciendo: boolean
  progreso: number
  duracion: number
  simulado: boolean
  audioRef: React.RefObject<HTMLAudioElement | null>
  deshabilitado: boolean
  onAlternar: () => void
}) {
  return (
    <div className="rounded-lg bg-menta/60 p-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAlternar}
          disabled={deshabilitado}
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
            reproduciendo
              ? 'bg-coral text-white hover:bg-coral-700'
              : 'bg-teal text-white hover:bg-teal-700',
            'disabled:cursor-not-allowed disabled:bg-marino/15 disabled:text-marino-300',
          )}
        >
          {reproduciendo ? (
            <>
              <Square className="size-3.5 fill-current" aria-hidden />
              Detener
            </>
          ) : (
            <>
              <Mic className="size-4" aria-hidden />
              Dictar
            </>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div
            className="h-1.5 overflow-hidden rounded-full bg-white"
            role="progressbar"
            aria-label="Avance del dictado"
            aria-valuenow={Math.round(progreso * 100)}
          >
            <div
              className="h-full rounded-full bg-teal transition-[width] duration-200"
              style={{ width: `${progreso * 100}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-marino-300 tabular-nums">
            {mmss(Math.round(progreso * duracion))} /{' '}
            {mmss(Math.round(duracion))}
            {simulado && ' · audio simulado'}
          </p>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={`${import.meta.env.BASE_URL}dictado.mp3`}
        preload="metadata"
        className="hidden"
      />
    </div>
  )
}

interface Dictado {
  reproduciendo: boolean
  progreso: number
  duracion: number
  simulado: boolean
  audioRef: React.RefObject<HTMLAudioElement | null>
  alternar: () => void
}

/**
 * Reproduce `public/dictado.mp3` si existe y, si no, simula una barra de
 * 15 segundos. En ambos casos la transcripción se va revelando al ritmo del
 * avance, como si el motor de voz la fuera entregando.
 */
function useDictado(
  textoCompleto: string,
  {
    enProgreso,
    alTerminar,
  }: {
    enProgreso: (parcial: string) => void
    alTerminar: (completo: string) => void
  },
): Dictado {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const vigilanteRef = useRef<number | null>(null)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [progreso, setProgreso] = useState(0)
  // Se arranca en modo simulado: solo se usa el audio real si se confirma
  // que el archivo existe y es audio.
  const [simulado, setSimulado] = useState(true)
  const [duracion, setDuracion] = useState(SEGUNDOS_SIMULADOS)

  const palabras = useMemo(() => textoCompleto.split(' '), [textoCompleto])

  // Algunos servidores devuelven index.html con código 200 para los archivos
  // que no existen, así que el evento `error` del <audio> no sirve para
  // detectarlo: hay que mirar el tipo de contenido.
  useEffect(() => {
    let vigente = true

    fetch(`${import.meta.env.BASE_URL}dictado.mp3`, { method: 'HEAD' })
      .then((respuesta) => {
        const tipo = respuesta.headers.get('content-type') ?? ''
        if (vigente && respuesta.ok && tipo.startsWith('audio')) {
          setSimulado(false)
        }
      })
      .catch(() => {
        /* Sin archivo: se queda con la barra simulada. */
      })

    return () => {
      vigente = false
    }
  }, [])

  // Con audio real, la duración la manda el archivo.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || simulado) return

    const alCargar = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDuracion(audio.duration)
      }
    }

    audio.addEventListener('loadedmetadata', alCargar)
    alCargar()
    return () => audio.removeEventListener('loadedmetadata', alCargar)
  }, [simulado])

  function aplicarProgreso(fraccion: number) {
    const acotada = Math.min(1, Math.max(0, fraccion))
    setProgreso(acotada)
    const cuantas = Math.max(1, Math.round(palabras.length * acotada))
    enProgreso(palabras.slice(0, cuantas).join(' '))
  }

  function terminar() {
    setReproduciendo(false)
    setProgreso(1)
    alTerminar(textoCompleto)
  }

  // Avance del audio real.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || simulado || !reproduciendo) return

    const alAvanzar = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        aplicarProgreso(audio.currentTime / audio.duration)
      }
    }
    audio.addEventListener('timeupdate', alAvanzar)
    audio.addEventListener('ended', terminar)
    return () => {
      audio.removeEventListener('timeupdate', alAvanzar)
      audio.removeEventListener('ended', terminar)
    }
  })

  // Avance de la barra simulada.
  useEffect(() => {
    if (!simulado || !reproduciendo) return

    const inicio = Date.now()
    const id = window.setInterval(() => {
      const fraccion = (Date.now() - inicio) / 1000 / SEGUNDOS_SIMULADOS
      if (fraccion >= 1) {
        window.clearInterval(id)
        terminar()
      } else {
        aplicarProgreso(fraccion)
      }
    }, 120)

    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulado, reproduciendo])

  function alternar() {
    const audio = audioRef.current

    if (reproduciendo) {
      if (vigilanteRef.current) window.clearTimeout(vigilanteRef.current)
      audio?.pause()
      terminar()
      return
    }

    setProgreso(0)
    setReproduciendo(true)

    if (!simulado && audio) {
      audio.currentTime = 0
      // Si el navegador bloquea la reproducción, se sigue con la simulación.
      audio.play().catch(() => setSimulado(true))

      // Red de seguridad: si el audio no arrancó, la demo sigue con la barra
      // simulada en lugar de quedarse congelada en 00:00.
      vigilanteRef.current = window.setTimeout(() => {
        if (!audio.currentTime) {
          audio.pause()
          setSimulado(true)
        }
      }, MS_ESPERA_AUDIO)
    }
  }

  return { reproduciendo, progreso, duracion, simulado, audioRef, alternar }
}

// --- Modal de firma ---------------------------------------------------------

function ModalFirma({
  medico,
  onCancelar,
  onConfirmar,
}: {
  medico: string
  onCancelar: () => void
  onConfirmar: () => void
}) {
  return (
    <div className="aparece fixed inset-0 z-50 grid place-items-center bg-marino/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-firma"
        className="entra-dialogo w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="titulo-firma" className="text-lg font-semibold">
            Aprobar y firmar informe
          </h2>
          <button
            type="button"
            onClick={onCancelar}
            aria-label="Cerrar"
            className="rounded-lg p-1 text-marino-300 transition hover:bg-marino/5 hover:text-marino"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <p className="mt-2 text-sm text-marino-300">
          La firma queda registrada con su nombre y la fecha y hora del sistema.
          El resultado se libera al paciente de inmediato.
        </p>

        <dl className="mt-4 space-y-2 rounded-lg bg-menta/60 p-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-marino-300">Médico</dt>
            <dd className="text-right font-medium">{medico}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-marino-300">Fecha y hora</dt>
            <dd className="text-right font-medium">{fechaHoraLarga()}</dd>
          </div>
        </dl>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg px-4 py-2 text-sm font-medium text-marino-300 transition hover:text-marino"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <FileSignature className="size-4" aria-hidden />
            Firmar informe
          </button>
        </div>
      </div>
    </div>
  )
}
