import { useEffect, useRef, useState } from 'react'
import {
  BadgeCheck,
  Building2,
  Check,
  Loader2,
  QrCode,
  ScanLine,
  Stethoscope,
  Timer,
  UserRound,
} from 'lucide-react'

import { AlertasOrden } from '@/components/AlertasOrden'
import { SlaBadge } from '@/components/SlaBadge'
import { StatusPill } from '@/components/StatusPill'
import { CASO_PROTAGONISTA_ID } from '@/data/mockCasos'
import { MOTIVO_ASIGNACION, RADIOLOGO_ASIGNADO } from '@/data/radiologos'
import { ETIQUETA_MODALIDAD, ETIQUETA_TIPO } from '@/data/tipos'
import { cn, mmss } from '@/lib/utils'
import { selCasoProtagonista, useDemoStore } from '@/store/useDemoStore'

/** Referencia de la industria con digitación manual, para el contraste. */
const PROMEDIO_MANUAL = '~5 min'

export function Recepcion() {
  const caso = useDemoStore(selCasoProtagonista)
  const flujo = useDemoStore((s) => s.flujo)
  const marcarFlujo = useDemoStore((s) => s.marcarFlujo)
  const avanzarCaso = useDemoStore((s) => s.avanzarCaso)
  const asignarRadiologo = useDemoStore((s) => s.asignarRadiologo)

  const [codigo, setCodigo] = useState('')
  const [creandoAdmision, setCreandoAdmision] = useState(false)
  const [asignando, setAsignando] = useState(false)
  const campoRef = useRef<HTMLInputElement>(null)

  const yaAsignado = Boolean(caso.radiologo)

  // El lector de QR de recepción se comporta como un teclado: el campo
  // recupera el foco mientras no se haya escaneado.
  useEffect(() => {
    if (!flujo.qrEscaneado) campoRef.current?.focus()
  }, [flujo.qrEscaneado])

  function escanear() {
    // Si el presentador salta el pre-registro, el caso se pone al día aquí.
    if (caso.estado === 'registro_iniciado') {
      avanzarCaso(caso.id, 'registro_completo')
    }
    marcarFlujo({
      qrEscaneado: true,
      preRegistroHecho: true,
      inicioRegistroMs: Date.now(),
    })
  }

  function confirmarAdmision() {
    setCreandoAdmision(true)
    window.setTimeout(() => {
      const inicio = useDemoStore.getState().flujo.inicioRegistroMs
      avanzarCaso(caso.id, 'admitido')
      marcarFlujo({
        admisionCreada: true,
        segundosRegistro: inicio
          ? Math.round((Date.now() - inicio) / 1000)
          : flujo.segundosRegistro,
      })
      setCreandoAdmision(false)
    }, 1800)
  }

  function marcarEstudioRealizado() {
    avanzarCaso(caso.id, 'estudio_realizado')
    setAsignando(true)
    window.setTimeout(() => {
      asignarRadiologo(caso.id, RADIOLOGO_ASIGNADO.nombre)
      avanzarCaso(caso.id, 'enviado_radiologo')
      setAsignando(false)
    }, 1600)
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-5">
        <header>
          <h1 className="text-xl font-semibold">Recepción</h1>
          <p className="text-sm text-marino-300">
            El paciente llega con su código. No se digita nada.
          </p>
        </header>

        <PanelEscaneo
          escaneado={flujo.qrEscaneado}
          codigo={codigo}
          onCodigo={setCodigo}
          onEscanear={escanear}
          campoRef={campoRef}
        />

        {flujo.qrEscaneado && (
          <TarjetaPaciente
            caso={caso}
            admisionCreada={flujo.admisionCreada}
            creandoAdmision={creandoAdmision}
            onConfirmar={confirmarAdmision}
          />
        )}

        {flujo.admisionCreada && (
          <PanelEstudio
            asignando={asignando}
            yaAsignado={yaAsignado}
            estudioRealizado={caso.estado !== 'admitido'}
            onMarcar={marcarEstudioRealizado}
          />
        )}
      </div>

      <Cronometro
        corriendo={flujo.qrEscaneado && !flujo.admisionCreada}
        detenido={flujo.admisionCreada}
      />
    </div>
  )
}

// --- Escaneo ----------------------------------------------------------------

interface PanelEscaneoProps {
  escaneado: boolean
  codigo: string
  onCodigo: (v: string) => void
  onEscanear: () => void
  campoRef: React.RefObject<HTMLInputElement | null>
}

function PanelEscaneo({
  escaneado,
  codigo,
  onCodigo,
  onEscanear,
  campoRef,
}: PanelEscaneoProps) {
  if (escaneado) {
    return (
      <div className="entra flex items-center gap-2 rounded-xl border border-verde/30 bg-verde-100 px-4 py-3 text-sm font-medium text-verde">
        <Check className="size-4" aria-hidden />
        Código {CASO_PROTAGONISTA_ID} leído correctamente
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onEscanear()
      }}
      className="rounded-xl border border-marino/10 bg-white p-5"
    >
      <label
        htmlFor="campo-qr"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <QrCode className="size-4 text-teal" aria-hidden />
        Escanee el QR
      </label>

      <div className="mt-3 flex gap-2">
        <input
          id="campo-qr"
          ref={campoRef}
          value={codigo}
          onChange={(e) => onCodigo(e.target.value)}
          autoFocus
          autoComplete="off"
          placeholder="Acerque el código al lector…"
          className="min-w-0 flex-1 rounded-lg border border-marino/15 px-3 py-2 text-sm tracking-wide placeholder:text-marino-300 focus:border-teal focus:outline-none"
        />
        <button
          type="submit"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <ScanLine className="size-4" aria-hidden />
          Simular escaneo
        </button>
      </div>

      <p className="mt-2 text-[12px] text-marino-300">
        El lector funciona como un teclado: el código entra solo y confirma con
        Enter.
      </p>
    </form>
  )
}

// --- Datos del paciente -----------------------------------------------------

interface TarjetaPacienteProps {
  caso: ReturnType<typeof selCasoProtagonista>
  admisionCreada: boolean
  creandoAdmision: boolean
  onConfirmar: () => void
}

function TarjetaPaciente({
  caso,
  admisionCreada,
  creandoAdmision,
  onConfirmar,
}: TarjetaPacienteProps) {
  const campos = [
    { etiqueta: 'Paciente', valor: caso.paciente.nombre, icono: UserRound },
    {
      etiqueta: 'Documento',
      valor: caso.paciente.documento,
      icono: BadgeCheck,
    },
    { etiqueta: 'Teléfono', valor: caso.paciente.telefono, icono: UserRound },
    {
      etiqueta: 'Convenio',
      valor: caso.empresa ?? ETIQUETA_TIPO[caso.tipo],
      icono: Building2,
    },
    {
      etiqueta: 'Estudio',
      valor: `${caso.estudio} · ${ETIQUETA_MODALIDAD[caso.modalidad]}`,
      icono: Stethoscope,
    },
  ]

  return (
    <section className="entra rounded-xl border border-marino/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Datos recibidos del pre-registro</h2>
          <p className="text-[12px] text-marino-300">
            Caso {caso.id} · validados contra la orden médica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill estado={caso.estado} />
          <SlaBadge caso={caso} />
        </div>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {campos.map(({ etiqueta, valor, icono: Icono }) => (
          <div key={etiqueta} className="flex items-start gap-2">
            <Icono
              className="mt-0.5 size-4 shrink-0 text-marino-300"
              aria-hidden
            />
            <div className="min-w-0">
              <dt className="text-[11px] text-marino-300">{etiqueta}</dt>
              <dd className="flex items-center gap-1.5 text-sm font-medium">
                <span className="truncate">{valor}</span>
                <Check
                  className="size-3.5 shrink-0 text-verde"
                  aria-label="Validado"
                />
              </dd>
            </div>
          </div>
        ))}
      </dl>

      {/* Las alertas van arriba del botón: este es el último punto del flujo
          donde todavía se pueden resolver sin deshacer la admisión. */}
      <AlertasOrden audiencia="recepcion" className="mt-5" />

      <div className="mt-5 border-t border-marino/10 pt-4">
        {admisionCreada ? (
          <p className="entra flex items-center gap-2 text-sm font-semibold text-verde">
            <Check className="size-4" aria-hidden />
            Admisión creada en Manager Clinic
          </p>
        ) : creandoAdmision ? (
          <p className="flex items-center gap-2 text-sm font-medium text-teal-700">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Creando admisión en Manager Clinic…
          </p>
        ) : (
          <button
            type="button"
            onClick={onConfirmar}
            className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Confirmar admisión
          </button>
        )}
      </div>
    </section>
  )
}

// --- Estudio y asignación ---------------------------------------------------

interface PanelEstudioProps {
  asignando: boolean
  yaAsignado: boolean
  estudioRealizado: boolean
  onMarcar: () => void
}

function PanelEstudio({
  asignando,
  yaAsignado,
  estudioRealizado,
  onMarcar,
}: PanelEstudioProps) {
  return (
    <section className="entra rounded-xl border border-marino/10 bg-white p-5">
      <h2 className="font-semibold">Sala de rayos X</h2>

      {!estudioRealizado && (
        <button
          type="button"
          onClick={onMarcar}
          className="mt-3 rounded-lg border border-teal px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-menta"
        >
          Marcar estudio realizado
        </button>
      )}

      {estudioRealizado && (
        <p className="entra mt-3 flex items-center gap-2 text-sm font-semibold text-verde">
          <Check className="size-4" aria-hidden />
          Estudio realizado
        </p>
      )}

      {asignando && (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-teal-700">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Asignando radiólogo…
        </p>
      )}

      {yaAsignado && (
        <div className="entra mt-3 rounded-lg bg-menta p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-teal-700">
            <Check className="size-4" aria-hidden />
            Asignado a {RADIOLOGO_ASIGNADO.nombre}
          </p>
          <p className="mt-2 text-[12px] text-marino-300">
            Motivo de la asignación
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {MOTIVO_ASIGNACION.map((motivo) => (
              <li
                key={motivo}
                className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-marino-700"
              >
                {motivo}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

// --- Cronómetro -------------------------------------------------------------

function Cronometro({
  corriendo,
  detenido,
}: {
  corriendo: boolean
  detenido: boolean
}) {
  const inicioMs = useDemoStore((s) => s.flujo.inicioRegistroMs)
  const segundosGuardados = useDemoStore((s) => s.flujo.segundosRegistro)
  const [transcurrido, setTranscurrido] = useState(0)

  // El valor se recalcula contra el instante de inicio, así que el reloj no
  // se desfasa si la pestaña pasa a segundo plano.
  useEffect(() => {
    if (!corriendo || !inicioMs) return
    const id = window.setInterval(
      () => setTranscurrido(Math.floor((Date.now() - inicioMs) / 1000)),
      250,
    )
    return () => window.clearInterval(id)
  }, [corriendo, inicioMs])

  const mostrado = detenido ? segundosGuardados : transcurrido

  return (
    <aside className="h-fit rounded-xl border border-marino/10 bg-white p-5 lg:sticky lg:top-24">
      <p className="flex items-center gap-2 text-[12px] font-medium text-marino-300">
        <Timer className="size-4 text-teal" aria-hidden />
        Tiempo de registro
      </p>

      <p
        className={cn(
          'mt-2 text-4xl font-semibold tabular-nums',
          detenido ? 'text-verde' : 'text-marino',
        )}
      >
        {mmss(mostrado)}
      </p>

      <div className="mt-4 border-t border-marino/10 pt-3">
        <p className="text-[12px] text-marino-300">Promedio manual</p>
        <p className="text-lg font-semibold text-marino-300 line-through">
          {PROMEDIO_MANUAL}
        </p>
      </div>
    </aside>
  )
}
