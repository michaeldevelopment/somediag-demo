import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import {
  Check,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  Stamp,
  Upload,
} from 'lucide-react'

import { AlertasOrden } from '@/components/AlertasOrden'
import { PhoneFrame } from '@/components/PhoneFrame'
import { URL_PRE_REGISTRO } from '@/data/chatScript'
import type { Modalidad } from '@/data/tipos'
import { cn } from '@/lib/utils'
import { selCasoProtagonista, useDemoStore } from '@/store/useDemoStore'

const MS_LECTURA = 2500
const MS_ENTRE_CAMPOS = 420

interface OpcionEstudio {
  valor: string
  modalidad: Modalidad
  /** Los estudios con contraste disparan el cuestionario adicional. */
  requiereCuestionario?: boolean
}

const ESTUDIOS: OpcionEstudio[] = [
  { valor: 'RX de tórax PA y lateral', modalidad: 'RX' },
  { valor: 'RX de columna lumbosacra', modalidad: 'RX' },
  { valor: 'Ecografía abdominal total', modalidad: 'ECO' },
  { valor: 'TAC con contraste', modalidad: 'TAC', requiereCuestionario: true },
]

const PREGUNTAS_CONTRASTE = [
  {
    id: 'alergias',
    texto: '¿Es alérgica a medios de contraste yodados, mariscos o yodo?',
  },
  {
    id: 'renal',
    texto: '¿Tiene creatinina de los últimos 3 meses?',
  },
  {
    id: 'embarazo',
    texto: '¿Está embarazada o sospecha estarlo?',
  },
]

export function PreRegistro() {
  const caso = useDemoStore(selCasoProtagonista)
  const ordenLeida = useDemoStore((s) => s.flujo.ordenLeida)
  const preRegistroHecho = useDemoStore((s) => s.flujo.preRegistroHecho)
  const marcarFlujo = useDemoStore((s) => s.marcarFlujo)
  const avanzarCaso = useDemoStore((s) => s.avanzarCaso)
  const actualizarEstudio = useDemoStore((s) => s.actualizarEstudio)

  const campos = [
    { etiqueta: 'Nombre completo', valor: caso.paciente.nombre, confianza: 99 },
    { etiqueta: 'Documento', valor: caso.paciente.documento, confianza: 98 },
    { etiqueta: 'Teléfono', valor: caso.paciente.telefono, confianza: 97 },
    {
      etiqueta: 'Empresa / convenio',
      valor: caso.empresa ?? 'Particular',
      confianza: 98,
    },
  ]
  const totalCampos = campos.length + 1 // los campos leídos más el selector

  const [leyendo, setLeyendo] = useState(false)
  const [visibles, setVisibles] = useState(ordenLeida ? totalCampos : 0)
  const [estudio, setEstudio] = useState(caso.estudio)
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [autoriza, setAutoriza] = useState(false)

  const opcion =
    ESTUDIOS.find((e) => e.valor === estudio) ??
    ({ valor: estudio, modalidad: caso.modalidad } satisfies OpcionEstudio)
  const pideCuestionario = Boolean(opcion.requiereCuestionario)
  const cuestionarioCompleto =
    !pideCuestionario ||
    PREGUNTAS_CONTRASTE.every((p) => Boolean(respuestas[p.id]))
  const puedeFinalizar =
    visibles >= totalCampos && autoriza && cuestionarioCompleto

  // Los campos se van llenando uno por uno, como si la IA los fuera
  // confirmando contra la imagen de la orden.
  useEffect(() => {
    if (!ordenLeida || visibles >= totalCampos) return
    const id = window.setInterval(
      () => setVisibles((n) => Math.min(n + 1, totalCampos)),
      MS_ENTRE_CAMPOS,
    )
    return () => window.clearInterval(id)
  }, [ordenLeida, visibles, totalCampos])

  function subirOrden() {
    setLeyendo(true)
    window.setTimeout(() => {
      setLeyendo(false)
      marcarFlujo({ ordenLeida: true })
    }, MS_LECTURA)
  }

  function finalizar() {
    if (estudio !== caso.estudio) {
      actualizarEstudio(caso.id, estudio, opcion.modalidad)
    }
    avanzarCaso(caso.id, 'registro_completo')
    marcarFlujo({ preRegistroHecho: true })
  }

  return (
    <PhoneFrame
      colorEstado="#0B1F3A"
      estadoOscuro
      encabezado={<Encabezado casoId={caso.id} />}
      className="bg-white"
    >
      {preRegistroHecho ? (
        <PantallaQr documento={caso.paciente.documento} casoId={caso.id} />
      ) : (
        <div className="space-y-5 px-4 py-5">
          <BloqueOrden
            ordenLeida={ordenLeida}
            leyendo={leyendo}
            onSubir={subirOrden}
          />

          {ordenLeida && <AlertasOrden audiencia="paciente" compacto />}

          {(ordenLeida || leyendo) && (
            <section className="space-y-3">
              <h2 className="text-[13px] font-semibold">Sus datos</h2>

              {campos.map((campo, i) => (
                <CampoLeido
                  key={campo.etiqueta}
                  etiqueta={campo.etiqueta}
                  valor={campo.valor}
                  confianza={campo.confianza}
                  visible={visibles > i}
                />
              ))}

              <SelectorEstudio
                estudio={estudio}
                onCambiar={setEstudio}
                visible={visibles >= totalCampos}
              />
            </section>
          )}

          {pideCuestionario && visibles >= totalCampos && (
            <Cuestionario respuestas={respuestas} onResponder={setRespuestas} />
          )}

          {visibles >= totalCampos && (
            <>
              <Autorizacion marcado={autoriza} onCambiar={setAutoriza} />

              <button
                type="button"
                onClick={finalizar}
                disabled={!puedeFinalizar}
                className="w-full rounded-xl bg-teal py-3 text-sm font-semibold text-white transition enabled:hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-marino/15 disabled:text-marino-300"
              >
                Finalizar
              </button>
            </>
          )}
        </div>
      )}
    </PhoneFrame>
  )
}

// --- Encabezado -------------------------------------------------------------

function Encabezado({ casoId }: { casoId: string }) {
  return (
    <div className="shrink-0 border-b border-marino/10 bg-marino px-4 py-3 text-white">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-teal text-[13px] font-bold">
          S
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold">Pre-registro SOMEDIAG</p>
          <p className="text-[11px] text-marino-300">Caso {casoId}</p>
        </div>
      </div>
    </div>
  )
}

// --- Orden médica -----------------------------------------------------------

function BloqueOrden({
  ordenLeida,
  leyendo,
  onSubir,
}: {
  ordenLeida: boolean
  leyendo: boolean
  onSubir: () => void
}) {
  if (!ordenLeida && !leyendo) {
    return (
      <section>
        <h2 className="text-[13px] font-semibold">Su orden médica</h2>
        <p className="mt-1 text-[12px] text-marino-300">
          Tome una foto o suba el archivo. Nosotros leemos los datos por usted.
        </p>

        <button
          type="button"
          onClick={onSubir}
          className="mt-3 flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-teal/40 bg-menta py-7 transition hover:border-teal"
        >
          <Upload className="size-6 text-teal" aria-hidden />
          <span className="text-sm font-semibold text-teal-700">
            Subir orden médica
          </span>
          <span className="text-[11px] text-marino-300">JPG, PNG o PDF</span>
        </button>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-[13px] font-semibold">Su orden médica</h2>

      <div className="entra mt-2 flex items-center gap-3 rounded-xl border border-marino/10 bg-white p-2.5">
        <img
          src={`${import.meta.env.BASE_URL}orden-medica.svg`}
          alt="Miniatura de la orden médica ficticia"
          className="h-20 w-[60px] shrink-0 rounded-md border border-marino/10 object-cover object-top"
        />

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[13px] font-medium">
            <FileText
              className="size-3.5 shrink-0 text-marino-300"
              aria-hidden
            />
            <span className="truncate">orden-medica.jpg</span>
          </p>

          {leyendo ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-teal-700">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Leyendo orden con IA…
            </p>
          ) : (
            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-verde">
              <Check className="size-3.5" aria-hidden />
              Orden leída
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

// --- Campos -----------------------------------------------------------------

function CampoLeido({
  etiqueta,
  valor,
  confianza,
  visible,
}: {
  etiqueta: string
  valor: string
  confianza: number
  visible: boolean
}) {
  return (
    <div
      className={cn(
        'transition-all duration-300',
        visible ? 'opacity-100' : 'translate-y-1 opacity-0',
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] text-marino-300">{etiqueta}</label>
        {visible && <BadgeConfianza valor={confianza} />}
      </div>
      <p className="mt-0.5 rounded-lg border border-marino/10 bg-menta/50 px-3 py-2 text-sm font-medium">
        {visible ? valor : ' '}
      </p>
    </div>
  )
}

function BadgeConfianza({ valor }: { valor: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-menta px-1.5 py-0.5 text-[10px] font-semibold text-teal-700">
      <Sparkles className="size-2.5" aria-hidden />
      {valor}% de confianza
    </span>
  )
}

function SelectorEstudio({
  estudio,
  onCambiar,
  visible,
}: {
  estudio: string
  onCambiar: (v: string) => void
  visible: boolean
}) {
  return (
    <div
      className={cn(
        'transition-all duration-300',
        visible ? 'opacity-100' : 'translate-y-1 opacity-0',
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="estudio" className="text-[11px] text-marino-300">
          Estudio solicitado
        </label>
        {visible && <BadgeConfianza valor={98} />}
      </div>

      <select
        id="estudio"
        value={estudio}
        onChange={(e) => onCambiar(e.target.value)}
        disabled={!visible}
        className="mt-0.5 w-full rounded-lg border border-marino/10 bg-menta/50 px-3 py-2 text-sm font-medium focus:border-teal focus:outline-none"
      >
        {ESTUDIOS.map((e) => (
          <option key={e.valor} value={e.valor}>
            {e.valor}
          </option>
        ))}
      </select>
    </div>
  )
}

// --- Cuestionario de contraste ----------------------------------------------

function Cuestionario({
  respuestas,
  onResponder,
}: {
  respuestas: Record<string, string>
  onResponder: (r: Record<string, string>) => void
}) {
  return (
    <section className="entra rounded-xl border border-ambar/30 bg-ambar-100/60 p-4">
      <h2 className="text-[13px] font-semibold text-marino">
        Preguntas para el estudio con contraste
      </h2>
      <p className="mt-0.5 text-[11px] text-marino-300">
        Obligatorias antes de aplicar el medio de contraste.
      </p>

      <div className="mt-3 space-y-3">
        {PREGUNTAS_CONTRASTE.map((pregunta) => (
          <fieldset key={pregunta.id}>
            <legend className="text-[12px] leading-snug font-medium">
              {pregunta.texto}
            </legend>

            <div className="mt-1.5 flex gap-2">
              {['Sí', 'No'].map((opcion) => {
                const activa = respuestas[pregunta.id] === opcion
                return (
                  <label
                    key={opcion}
                    className={cn(
                      'flex-1 cursor-pointer rounded-lg border px-3 py-1.5 text-center text-[13px] font-medium transition',
                      activa
                        ? 'border-teal bg-teal text-white'
                        : 'border-marino/15 bg-white text-marino-700 hover:border-teal',
                    )}
                  >
                    <input
                      type="radio"
                      name={pregunta.id}
                      value={opcion}
                      checked={activa}
                      onChange={() =>
                        onResponder({ ...respuestas, [pregunta.id]: opcion })
                      }
                      className="sr-only"
                    />
                    {opcion}
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  )
}

// --- Autorización de datos --------------------------------------------------

function Autorizacion({
  marcado,
  onCambiar,
}: {
  marcado: boolean
  onCambiar: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-marino/10 bg-menta/40 p-3">
      <input
        type="checkbox"
        checked={marcado}
        onChange={(e) => onCambiar(e.target.checked)}
        required
        className="mt-0.5 size-4 shrink-0 accent-[#0FA3A3]"
      />
      <span className="text-[11.5px] leading-snug text-marino-700">
        Autorizo el tratamiento de mis datos personales y de salud por parte de
        SOMEDIAG, conforme a la Ley 1581 de 2012 y a su política de tratamiento
        de datos. <span className="text-coral-700">Obligatorio.</span>
      </span>
    </label>
  )
}

// --- QR del caso ------------------------------------------------------------

function PantallaQr({
  documento,
  casoId,
}: {
  documento: string
  casoId: string
}) {
  const qr = useQr(`${URL_PRE_REGISTRO}|${casoId}|${documento}`)

  return (
    <div className="entra flex min-h-full flex-col items-center justify-center bg-white px-6 py-8 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-verde-100">
        <Check className="size-6 text-verde" aria-hidden />
      </span>

      <h2 className="mt-4 text-lg font-semibold">Pre-registro completo</h2>
      <p className="mt-1 text-[13px] text-marino-300">
        Presente este código al llegar
      </p>

      <div className="mt-5 rounded-2xl border border-marino/10 bg-white p-4 shadow-sm">
        {qr ? (
          <img
            src={qr}
            alt={`Código QR del caso ${casoId}`}
            className="size-44"
          />
        ) : (
          <div className="grid size-44 place-items-center">
            <Loader2
              className="size-5 animate-spin text-marino-300"
              aria-hidden
            />
          </div>
        )}
        <p className="mt-2 text-[13px] font-semibold tracking-wide tabular-nums">
          {casoId}
        </p>
      </div>

      {/* Sello: el pre-registro adelanta la digitación, pero la admisión la
          cierra una persona en recepción con el documento a la vista. */}
      <p className="mt-5 flex -rotate-2 items-center gap-1.5 rounded-lg border-2 border-dashed border-ambar/60 bg-ambar-100/70 px-3 py-1.5 text-[11px] font-bold tracking-wide text-ambar uppercase">
        <Stamp className="size-3.5 shrink-0" aria-hidden />
        Pendiente de validación en recepción
      </p>

      <p className="mt-5 flex items-start gap-1.5 text-[11.5px] leading-snug text-marino-300">
        <ShieldCheck
          className="mt-px size-3.5 shrink-0 text-teal"
          aria-hidden
        />
        El código solo contiene el número de su caso. Sus datos clínicos no
        viajan en él.
      </p>
    </div>
  )
}

/** Genera el QR como data URL, en la paleta de la marca. */
function useQr(texto: string) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    let vigente = true

    QRCode.toDataURL(texto, {
      width: 360,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0B1F3A', light: '#FFFFFF' },
    })
      .then((generado) => {
        if (vigente) setUrl(generado)
      })
      .catch(() => {
        if (vigente) setUrl(null)
      })

    return () => {
      vigente = false
    }
  }, [texto])

  return url
}
