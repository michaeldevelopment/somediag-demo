import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "00:12" a partir de segundos. */
export function mmss(segundos: number) {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** "1 h 20 min" a partir de minutos. */
export function duracion(minutos: number) {
  const abs = Math.abs(Math.round(minutos))
  const h = Math.floor(abs / 60)
  const m = abs % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

/** Hora local de Colombia, formato "14:35". */
export function horaAhora(desplazamientoMin = 0) {
  const d = new Date(Date.now() + desplazamientoMin * 60_000)
  return d.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function fechaLarga(d = new Date()) {
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function fechaHoraLarga(d = new Date()) {
  return d.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
