import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { CASO_PROTAGONISTA_ID, casosIniciales } from '@/data/mockCasos'
import {
  MINUTOS_POR_ESTADO,
  ORDEN_ESTADOS,
  type Caso,
  type Estado,
  type Modalidad,
} from '@/data/tipos'
import { horaAhora } from '@/lib/utils'

export type Pestana =
  | 'whatsapp'
  | 'pre-registro'
  | 'recepcion'
  | 'radiologo'
  | 'entrega'
  | 'centro-control'

export const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: 'whatsapp', etiqueta: 'WhatsApp' },
  { id: 'pre-registro', etiqueta: 'Pre-registro' },
  { id: 'recepcion', etiqueta: 'Recepción' },
  { id: 'radiologo', etiqueta: 'Radiólogo' },
  { id: 'entrega', etiqueta: 'Entrega' },
  { id: 'centro-control', etiqueta: 'Centro de control' },
]

/**
 * Banderas de avance de cada pantalla. Viven en el store para que el
 * presentador pueda saltar entre pestañas sin perder el progreso.
 */
export interface Flujo {
  /** WhatsApp: mensajes del guion ya mostrados. */
  mensajesVistos: number
  /** Pre-registro: la orden médica ya fue "subida" y leída por la IA. */
  ordenLeida: boolean
  /** Pre-registro: formulario finalizado, QR disponible. */
  preRegistroHecho: boolean
  /** Recepción: QR escaneado y datos validados. */
  qrEscaneado: boolean
  /** Recepción: admisión creada en Manager Clinic. */
  admisionCreada: boolean
  /** Recepción: marca de tiempo en que se leyó el QR; null si aún no pasa. */
  inicioRegistroMs: number | null
  /** Recepción: segundos que tardó el registro digital, ya congelados. */
  segundosRegistro: number
  /** Radiólogo: el dictado ya se reprodujo y transcribió. */
  dictadoTranscrito: boolean
  /** Radiólogo: informe firmado. */
  informeFirmado: boolean
  /** Entrega: el paciente validó los últimos 4 dígitos del documento. */
  identidadVerificada: boolean
}

const FLUJO_INICIAL: Flujo = {
  mensajesVistos: 0,
  ordenLeida: false,
  preRegistroHecho: false,
  qrEscaneado: false,
  admisionCreada: false,
  inicioRegistroMs: null,
  segundosRegistro: 12,
  dictadoTranscrito: false,
  informeFirmado: false,
  identidadVerificada: false,
}

interface EstadoDemo {
  casos: Caso[]
  pestana: Pestana
  /** Caso abierto en el panel lateral del Centro de control. */
  casoSeleccionadoId: string | null
  flujo: Flujo
}

interface AccionesDemo {
  irA: (pestana: Pestana) => void
  seleccionarCaso: (id: string | null) => void
  marcarFlujo: (parche: Partial<Flujo>) => void
  /** Fija el estado de un caso y le agrega los eventos intermedios al historial. */
  avanzarCaso: (id: string, estado: Estado) => void
  asignarRadiologo: (id: string, radiologo: string) => void
  /** Cambia el estudio elegido en el pre-registro y su modalidad. */
  actualizarEstudio: (id: string, estudio: string, modalidad: Modalidad) => void
  guardarTranscripcion: (id: string, transcripcion: string) => void
  reiniciarDemo: () => void
}

export type StoreDemo = EstadoDemo & AccionesDemo

function estadoInicial(): EstadoDemo {
  return {
    casos: casosIniciales(),
    pestana: 'whatsapp',
    casoSeleccionadoId: null,
    flujo: { ...FLUJO_INICIAL },
  }
}

export const useDemoStore = create<StoreDemo>()(
  persist(
    (set) => ({
      ...estadoInicial(),

      irA: (pestana) => set({ pestana }),

      seleccionarCaso: (casoSeleccionadoId) => set({ casoSeleccionadoId }),

      marcarFlujo: (parche) =>
        set((s) => ({ flujo: { ...s.flujo, ...parche } })),

      avanzarCaso: (id, estado) =>
        set((s) => ({
          casos: s.casos.map((caso) => {
            if (caso.id !== id) return caso

            const desde = ORDEN_ESTADOS.indexOf(caso.estado)
            const hasta = ORDEN_ESTADOS.indexOf(estado)
            if (hasta <= desde) return caso

            const nuevos = ORDEN_ESTADOS.slice(desde + 1, hasta + 1).map(
              (paso) => ({ estado: paso, hora: horaAhora() }),
            )

            return {
              ...caso,
              estado,
              // El reloj del caso avanza con la etapa, nunca retrocede: los
              // casos de relleno ya van más adelantados y no se tocan.
              creadoHace: Math.max(caso.creadoHace, MINUTOS_POR_ESTADO[estado]),
              historial: [...caso.historial, ...nuevos],
            }
          }),
        })),

      asignarRadiologo: (id, radiologo) =>
        set((s) => ({
          casos: s.casos.map((caso) =>
            caso.id === id ? { ...caso, radiologo } : caso,
          ),
        })),

      actualizarEstudio: (id, estudio, modalidad) =>
        set((s) => ({
          casos: s.casos.map((caso) =>
            caso.id === id ? { ...caso, estudio, modalidad } : caso,
          ),
        })),

      guardarTranscripcion: (id, transcripcion) =>
        set((s) => ({
          casos: s.casos.map((caso) =>
            caso.id === id ? { ...caso, transcripcion } : caso,
          ),
        })),

      reiniciarDemo: () => set(estadoInicial()),
    }),
    { name: 'demo-somediag' },
  ),
)

// --- Selectores -------------------------------------------------------------

export const selCasos = (s: StoreDemo) => s.casos

export const selCasoProtagonista = (s: StoreDemo) =>
  s.casos.find((c) => c.id === CASO_PROTAGONISTA_ID)!

export const selCasoSeleccionado = (s: StoreDemo) =>
  s.casos.find((c) => c.id === s.casoSeleccionadoId) ?? null

export function selCasoPorId(id: string) {
  return (s: StoreDemo) => s.casos.find((c) => c.id === id) ?? null
}

/** Hook de conveniencia: el caso de Laura, que recorre toda la demo. */
export const usePacienteDemo = () => useDemoStore(selCasoProtagonista)
