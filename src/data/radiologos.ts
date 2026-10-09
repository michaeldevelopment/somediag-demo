import type { Radiologo } from './tipos'

export const RADIOLOGOS: Radiologo[] = [
  {
    id: 'rad-1',
    nombre: 'Dra. Carolina Restrepo',
    especialidad: 'Radiología de tórax',
    modalidades: ['RX', 'TAC'],
    disponible: true,
    casosEnCola: 2,
    tiempoPromedioMin: 18,
  },
  {
    id: 'rad-2',
    nombre: 'Dr. Andrés Villalobos',
    especialidad: 'Neurorradiología',
    modalidades: ['TAC'],
    disponible: true,
    casosEnCola: 5,
    tiempoPromedioMin: 32,
  },
  {
    id: 'rad-3',
    nombre: 'Dra. Mónica Salcedo',
    especialidad: 'Ecografía y abdomen',
    modalidades: ['ECO', 'RX'],
    disponible: false,
    casosEnCola: 7,
    tiempoPromedioMin: 24,
  },
  {
    id: 'rad-4',
    nombre: 'Dr. Felipe Arango',
    especialidad: 'Musculoesquelético',
    modalidades: ['RX', 'ECO', 'TAC'],
    disponible: true,
    casosEnCola: 1,
    tiempoPromedioMin: 15,
  },
]

/** Radiólogo que la demo asigna a Laura, con el motivo visible en pantalla. */
export const RADIOLOGO_ASIGNADO = RADIOLOGOS[0]

export const MOTIVO_ASIGNACION = [
  'Convenio ocupacional',
  'SLA 4 h',
  'Radiología de tórax disponible',
]

export function radiologoPorNombre(nombre?: string) {
  return RADIOLOGOS.find((r) => r.nombre === nombre)
}
