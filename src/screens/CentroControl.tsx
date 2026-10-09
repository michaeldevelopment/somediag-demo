import { useEffect, useMemo, useRef } from 'react'
import { Activity, AlertTriangle, Timer, Users, X } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { KpiCard } from '@/components/KpiCard'
import { SlaBadge } from '@/components/SlaBadge'
import { StatusPill } from '@/components/StatusPill'
import { CASO_PROTAGONISTA_ID } from '@/data/mockCasos'
import {
  COLOR_MODALIDAD,
  COLOR_SERIE_TIEMPO,
  TIEMPOS_POR_ETAPA,
} from '@/data/metricas'
import {
  ETIQUETA_ESTADO,
  ETIQUETA_MODALIDAD,
  ETIQUETA_TIPO,
  ORDEN_ESTADOS,
  type Caso,
  type Modalidad,
} from '@/data/tipos'
import { infoSla } from '@/lib/sla'
import { cn, duracion } from '@/lib/utils'
import { selCasoSeleccionado, useDemoStore } from '@/store/useDemoStore'

const MODALIDADES: Modalidad[] = ['RX', 'TAC', 'ECO']

export function CentroControl() {
  const casos = useDemoStore((s) => s.casos)
  const seleccionado = useDemoStore(selCasoSeleccionado)
  const seleccionarCaso = useDemoStore((s) => s.seleccionarCaso)

  const kpis = useMemo(() => calcularKpis(casos), [casos])
  const vencidos = useMemo(
    () => casos.filter((c) => infoSla(c).nivel === 'vencido'),
    [casos],
  )
  const porModalidad = useMemo(
    () =>
      MODALIDADES.map((m) => ({
        modalidad: m,
        nombre: ETIQUETA_MODALIDAD[m],
        total: casos.filter((c) => c.modalidad === m).length,
      })).filter((d) => d.total > 0),
    [casos],
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold">Centro de control</h1>
        <p className="text-sm text-marino-300">
          Operación del día en vivo. Se actualiza con cada paso de la demo.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          etiqueta="Pacientes de hoy"
          valor={kpis.total}
          detalle={`${kpis.entregados} con resultado entregado`}
          icono={Users}
        />
        <KpiCard
          etiqueta="En proceso"
          valor={kpis.enProceso}
          detalle="Entre pre-registro y entrega"
          icono={Activity}
        />
        <KpiCard
          etiqueta="SLA vencidos"
          valor={kpis.vencidos}
          detalle={kpis.vencidos > 0 ? 'Requieren atención' : 'Todo al día'}
          icono={AlertTriangle}
          alerta={kpis.vencidos > 0}
        />
        <KpiCard
          etiqueta="Tiempo promedio hasta la entrega"
          valor={duracion(kpis.promedioEntregaMin)}
          detalle="Sobre los casos ya entregados"
          icono={Timer}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <GraficaModalidad datos={porModalidad} total={casos.length} />
        <GraficaTiempos />
        <PanelAtencion casos={vencidos} onAbrir={seleccionarCaso} />
      </section>

      <Tablero casos={casos} onAbrir={seleccionarCaso} />

      {seleccionado && (
        <PanelCaso caso={seleccionado} onCerrar={() => seleccionarCaso(null)} />
      )}
    </div>
  )
}

// --- KPIs -------------------------------------------------------------------

function calcularKpis(casos: Caso[]) {
  const entregados = casos.filter((c) => c.estado === 'resultado_entregado')
  const promedioEntregaMin = entregados.length
    ? entregados.reduce((suma, c) => suma + c.creadoHace, 0) / entregados.length
    : 0

  return {
    total: casos.length,
    entregados: entregados.length,
    enProceso: casos.length - entregados.length,
    vencidos: casos.filter((c) => infoSla(c).nivel === 'vencido').length,
    promedioEntregaMin,
  }
}

// --- Gráficas ---------------------------------------------------------------

interface DatoModalidad {
  modalidad: Modalidad
  nombre: string
  total: number
}

function GraficaModalidad({
  datos,
  total,
}: {
  datos: DatoModalidad[]
  total: number
}) {
  return (
    <article className="rounded-xl border border-marino/10 bg-white p-5">
      <h2 className="text-sm font-semibold">Estudios por modalidad</h2>
      <p className="text-[12px] text-marino-300">Reparto del día</p>

      <div className="mt-2 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={datos}
              dataKey="total"
              nameKey="nombre"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              stroke="#ffffff"
              strokeWidth={2}
              isAnimationActive={false}
              labelLine={false}
              label={EtiquetaPorcion}
            >
              {datos.map((d) => (
                <Cell key={d.modalidad} fill={COLOR_MODALIDAD[d.modalidad]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(valor, nombre) => [
                `${Number(valor)} estudios`,
                String(nombre),
              ]}
              contentStyle={ESTILO_TOOLTIP}
            />
            <Legend
              verticalAlign="bottom"
              height={24}
              formatter={(valor) => (
                <span className="text-[12px] text-marino-700">{valor}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <p className="-mt-[150px] mb-[126px] text-center text-2xl font-semibold tabular-nums">
        {total}
        <span className="block text-[11px] font-medium text-marino-300">
          estudios
        </span>
      </p>
    </article>
  )
}

function GraficaTiempos() {
  return (
    <article className="rounded-xl border border-marino/10 bg-white p-5">
      <h2 className="text-sm font-semibold">Tiempo promedio por etapa</h2>
      <p className="text-[12px] text-marino-300">Minutos, promedio del mes</p>

      <div className="mt-2 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={TIEMPOS_POR_ETAPA}
            margin={{ top: 8, right: 4, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke="#0b1f3a"
              strokeOpacity={0.08}
            />
            <XAxis
              dataKey="etapa"
              tickLine={false}
              axisLine={false}
              interval={0}
              tick={{ fontSize: 11, fill: '#6b82a3' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#6b82a3' }}
            />
            <Tooltip
              cursor={{ fill: '#0b1f3a', fillOpacity: 0.04 }}
              formatter={(valor) => [`${Number(valor)} min`, 'Duración']}
              contentStyle={ESTILO_TOOLTIP}
            />
            <Bar
              dataKey="minutos"
              fill={COLOR_SERIE_TIEMPO}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  )
}

interface PropsEtiqueta {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  value: number
}

/**
 * Rótulo directo sobre cada porción: la identidad no depende solo del color.
 * Va centrado en el anillo, que mide 28 px y aguanta de sobra un número.
 */
function EtiquetaPorcion(props: unknown) {
  const { cx, cy, midAngle, innerRadius, outerRadius, value } =
    props as PropsEtiqueta
  const radio = innerRadius + (outerRadius - innerRadius) / 2
  const rad = (-midAngle * Math.PI) / 180

  return (
    <text
      x={cx + radio * Math.cos(rad)}
      y={cy + radio * Math.sin(rad)}
      fill="#ffffff"
      fontSize={11}
      fontWeight={700}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {value}
    </text>
  )
}

const ESTILO_TOOLTIP = {
  borderRadius: 10,
  border: '1px solid rgba(11,31,58,0.12)',
  fontSize: 12,
  boxShadow: '0 8px 20px -8px rgba(11,31,58,0.25)',
} as const

// --- Requieren atención -----------------------------------------------------

function PanelAtencion({
  casos,
  onAbrir,
}: {
  casos: Caso[]
  onAbrir: (id: string) => void
}) {
  return (
    <article className="rounded-xl border border-coral/40 bg-coral-100/40 p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-coral-700">
        <AlertTriangle className="size-4" aria-hidden />
        Requieren atención
      </h2>
      <p className="text-[12px] text-marino-300">Casos con el SLA vencido</p>

      {casos.length === 0 ? (
        <p className="mt-4 text-sm text-marino-300">Ningún caso vencido.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {casos.map((caso) => (
            <li key={caso.id}>
              <button
                type="button"
                onClick={() => onAbrir(caso.id)}
                className="w-full rounded-lg border border-coral/30 bg-white p-3 text-left transition hover:border-coral"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-semibold">{caso.id}</span>
                  <SlaBadge caso={caso} compacto />
                </div>
                <p className="mt-0.5 truncate text-[13px] font-medium">
                  {caso.paciente.nombre}
                </p>
                <p className="truncate text-[11px] text-marino-300">
                  {caso.estudio}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

// --- Tablero kanban ---------------------------------------------------------

function Tablero({
  casos,
  onAbrir,
}: {
  casos: Caso[]
  onAbrir: (id: string) => void
}) {
  const contenedorRef = useRef<HTMLDivElement | null>(null)
  const tarjetaRef = useRef<HTMLDivElement | null>(null)
  const estadoDemo = casos.find((c) => c.id === CASO_PROTAGONISTA_ID)?.estado

  // Al avanzar la demo la columna del caso puede quedar fuera de la vista;
  // el tablero se desplaza solo para que siga a la vista del presentador.
  useEffect(() => {
    const contenedor = contenedorRef.current
    const tarjeta = tarjetaRef.current
    if (!contenedor || !tarjeta) return

    const destino =
      tarjeta.offsetLeft - (contenedor.clientWidth - tarjeta.clientWidth) / 2

    contenedor.scrollTo({
      left: Math.max(0, destino),
      behavior: 'smooth',
    })
  }, [estadoDemo])

  return (
    <section>
      <h2 className="text-sm font-semibold">Tablero de casos</h2>
      <p className="text-[12px] text-marino-300">
        El caso resaltado es el que recorre la demo.
      </p>

      <div
        ref={contenedorRef}
        className="scrollbar-fina mt-3 flex items-start gap-3 overflow-x-auto pb-3"
      >
        {ORDEN_ESTADOS.map((estado) => {
          const columna = casos.filter((c) => c.estado === estado)

          return (
            <div
              key={estado}
              className="flex w-[232px] shrink-0 flex-col rounded-xl bg-marino/[0.035] p-2.5"
            >
              <div className="flex items-center justify-between gap-2 px-1 pb-2">
                <h3 className="text-[12px] font-semibold">
                  {ETIQUETA_ESTADO[estado]}
                </h3>
                <span className="rounded-full bg-white px-1.5 text-[11px] font-medium text-marino-300 tabular-nums">
                  {columna.length}
                </span>
              </div>

              <ul className="space-y-2">
                {columna.map((caso) => (
                  <li key={caso.id}>
                    <TarjetaCaso
                      caso={caso}
                      onAbrir={onAbrir}
                      ref={
                        caso.id === CASO_PROTAGONISTA_ID
                          ? tarjetaRef
                          : undefined
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function TarjetaCaso({
  caso,
  onAbrir,
  ref,
}: {
  caso: Caso
  onAbrir: (id: string) => void
  ref?: React.Ref<HTMLDivElement>
}) {
  const protagonista = caso.id === CASO_PROTAGONISTA_ID

  return (
    <div ref={ref}>
      <button
        type="button"
        onClick={() => onAbrir(caso.id)}
        className={cn(
          'w-full rounded-lg border bg-white p-3 text-left transition hover:border-teal',
          protagonista ? 'border-teal ring-2 ring-teal/25' : 'border-marino/10',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-marino-300 tabular-nums">
            {caso.id}
          </span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: COLOR_MODALIDAD[caso.modalidad] }}
          >
            {caso.modalidad}
          </span>
        </div>

        <p className="mt-1 truncate text-[13px] font-medium">
          {caso.paciente.nombre}
        </p>
        <p className="truncate text-[11px] text-marino-300">{caso.estudio}</p>

        <div className="mt-2 flex items-center justify-between gap-2">
          <SlaBadge caso={caso} compacto />
          {protagonista && (
            <span className="text-[10px] font-semibold text-teal-700">
              Demo
            </span>
          )}
        </div>
      </button>
    </div>
  )
}

// --- Panel lateral del caso -------------------------------------------------

function PanelCaso({ caso, onCerrar }: { caso: Caso; onCerrar: () => void }) {
  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-[360px] max-w-full flex-col border-l border-marino/10 bg-white shadow-[-12px_0_32px_-16px_rgba(11,31,58,0.3)]">
      <div className="flex items-start justify-between gap-3 border-b border-marino/10 p-5 pt-20">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-marino-300 tabular-nums">
            {caso.id}
          </p>
          <h2 className="truncate text-lg font-semibold">
            {caso.paciente.nombre}
          </h2>
          <p className="text-[12px] text-marino-300">
            {caso.paciente.documento}
          </p>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar panel"
          className="rounded-lg p-1.5 text-marino-300 transition hover:bg-marino/5 hover:text-marino"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      <div className="scrollbar-fina min-h-0 flex-1 overflow-y-auto p-5">
        <div className="flex flex-wrap gap-2">
          <StatusPill estado={caso.estado} />
          <SlaBadge caso={caso} />
        </div>

        <dl className="mt-4 space-y-2.5 text-sm">
          <Fila etiqueta="Estudio" valor={caso.estudio} />
          <Fila
            etiqueta="Modalidad"
            valor={ETIQUETA_MODALIDAD[caso.modalidad]}
          />
          <Fila etiqueta="Tipo" valor={ETIQUETA_TIPO[caso.tipo]} />
          {caso.empresa && <Fila etiqueta="Empresa" valor={caso.empresa} />}
          <Fila etiqueta="Radiólogo" valor={caso.radiologo ?? 'Sin asignar'} />
          <Fila etiqueta="SLA objetivo" valor={duracion(caso.slaMin)} />
        </dl>

        <h3 className="mt-6 text-[12px] font-semibold text-marino-300">
          Historial de estados
        </h3>

        <ol className="mt-3 space-y-0">
          {caso.historial.map((evento, i) => {
            const ultimo = i === caso.historial.length - 1
            return (
              <li key={`${evento.estado}-${i}`} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className={cn(
                      'mt-1 size-2.5 shrink-0 rounded-full',
                      ultimo ? 'bg-teal' : 'bg-marino/20',
                    )}
                  />
                  {!ultimo && <span className="w-px flex-1 bg-marino/15" />}
                </div>
                <div className={cn('min-w-0', ultimo ? 'pb-0' : 'pb-4')}>
                  <p className="text-[13px] font-medium">
                    {ETIQUETA_ESTADO[evento.estado]}
                  </p>
                  <p className="text-[11px] text-marino-300 tabular-nums">
                    {evento.hora}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </aside>
  )
}

function Fila({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-marino-300">{etiqueta}</dt>
      <dd className="text-right font-medium">{valor}</dd>
    </div>
  )
}
