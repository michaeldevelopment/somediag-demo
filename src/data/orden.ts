import { fechaLarga } from '@/lib/utils'

/**
 * Datos de la orden médica ficticia que el paciente sube en el pre-registro
 * (la misma de `public/orden-medica.svg`). Vive aquí y no en cada pantalla
 * para que el pre-registro y la recepción muestren siempre las mismas
 * alertas: en la demo el presentador las enseña dos veces y no pueden
 * contradecirse.
 */
export const ORDEN_DEMO = {
  ipsRemitente: 'IPS Salud Ocupacional Andina',
  medicoRemitente: 'Dra. Ana María Duque',
  /** Días que la orden conserva vigencia desde su expedición. */
  vigenciaDias: 30,
  /** Días que lleva expedida al momento de la demo. */
  expedidaHaceDias: 24,
} as const

/** Días que le quedan de vigencia a la orden. */
export const DIAS_PARA_VENCER =
  ORDEN_DEMO.vigenciaDias - ORDEN_DEMO.expedidaHaceDias

const MS_POR_DIA = 86_400_000

/**
 * Las fechas se calculan contra el día de la presentación, nunca se escriben
 * fijas: una fecha vencida en pantalla delata la demo.
 */
export function fechaExpedicion() {
  return fechaLarga(
    new Date(Date.now() - ORDEN_DEMO.expedidaHaceDias * MS_POR_DIA),
  )
}

export function fechaVencimiento() {
  return fechaLarga(new Date(Date.now() + DIAS_PARA_VENCER * MS_POR_DIA))
}

/** `atencion` pide una acción antes de seguir; `aviso` solo informa. */
export type NivelAlerta = 'atencion' | 'aviso'

/**
 * Quién lee la alerta. El hecho es el mismo en las dos pantallas, pero al
 * paciente se le pide una acción ("traiga la orden") y a la auxiliar otra
 * ("confírmela"), así que cada una lleva su propia redacción.
 */
export type Audiencia = 'paciente' | 'recepcion'

export interface AlertaOrden {
  id: string
  nivel: NivelAlerta
  titulo: string
  detalle: string
}

/**
 * Alertas que acompañan a la orden durante todo el recorrido. Ninguna afirma
 * que el sistema compruebe la autenticidad del documento: la primera es un
 * cálculo de fechas y la segunda deriva en una revisión humana en recepción.
 */
export function alertasOrden(audiencia: Audiencia): AlertaOrden[] {
  const origen = `${ORDEN_DEMO.medicoRemitente} · ${ORDEN_DEMO.ipsRemitente}`

  return [
    {
      id: 'vigencia',
      nivel: 'atencion',
      titulo: `La orden vence en ${DIAS_PARA_VENCER} días`,
      detalle:
        `Expedida el ${fechaExpedicion()} · vigencia de ${ORDEN_DEMO.vigenciaDias} días. ` +
        (audiencia === 'paciente'
          ? `Realice el estudio antes del ${fechaVencimiento()}.`
          : `Vence el ${fechaVencimiento()}: el estudio de hoy queda dentro del plazo.`),
    },
    audiencia === 'paciente'
      ? {
          id: 'soporte-fisico',
          nivel: 'aviso',
          titulo: 'Traiga la orden impresa',
          detalle:
            `La expidió ${origen}, una IPS externa. ` +
            'En recepción confirman el sello y la firma con el documento físico.',
        }
      : {
          id: 'soporte-fisico',
          nivel: 'aviso',
          titulo: 'Orden de una IPS externa',
          detalle:
            `Expedida por ${origen}. ` +
            'Confirme el sello y la firma contra la orden impresa antes de admitir.',
        },
  ]
}
