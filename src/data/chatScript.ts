/**
 * Guion del chat de WhatsApp. El bot nunca pide cédula ni datos clínicos:
 * eso se captura en el pre-registro, que corre sobre canal propio.
 */

export type Autor = 'bot' | 'paciente'

export interface MensajeChat {
  id: string
  autor: Autor
  /** Párrafos del mensaje; el salto de línea se respeta en pantalla. */
  texto: string[]
  /** Milisegundos que el indicador "escribiendo…" se muestra antes del mensaje. */
  escribiendoMs?: number
  /** Botones de respuesta rápida que el paciente ve tras este mensaje. */
  opciones?: string[]
  /** Si el mensaje es un enlace accionable al pre-registro. */
  enlacePreRegistro?: { etiqueta: string; url: string }
}

export const NOMBRE_BOT = 'SOMEDIAG'
export const ESTADO_BOT = 'Cuenta de empresa · en línea'
export const URL_PRE_REGISTRO = 'somediag.co/pre-registro/SMD-0147'

export const GUION_CHAT: MensajeChat[] = [
  {
    id: 'm1',
    autor: 'bot',
    escribiendoMs: 900,
    texto: [
      '¡Hola! Bienvenida a SOMEDIAG 👋',
      'Soy el asistente de agendamiento. ¿Qué examen necesita realizarse hoy?',
    ],
    opciones: ['Rayos X', 'Tomografía', 'Ecografía'],
  },
  {
    id: 'm2',
    autor: 'paciente',
    texto: ['Rayos X'],
  },
  {
    id: 'm3',
    autor: 'bot',
    escribiendoMs: 1100,
    texto: [
      'Perfecto, radiografía. Le cuento la preparación:',
      '• No requiere ayuno.',
      '• Venga con ropa cómoda, sin prendas metálicas, cremalleras ni joyas en la zona del examen.',
      '• Si está embarazada o cree estarlo, avísele al tecnólogo antes de ingresar.',
      '• Traiga la orden médica y su documento de identidad.',
    ],
  },
  {
    id: 'm4',
    autor: 'bot',
    escribiendoMs: 1400,
    texto: [
      'Para no hacer fila en recepción, complete su pre-registro desde este enlace. Toma menos de 2 minutos y puede subir la foto de la orden médica.',
    ],
    enlacePreRegistro: {
      etiqueta: 'Completar pre-registro',
      url: URL_PRE_REGISTRO,
    },
  },
  {
    id: 'm5',
    autor: 'bot',
    escribiendoMs: 800,
    texto: [
      'Por su seguridad, nunca le pediremos la cédula, datos clínicos ni información de pago por este chat. Todo eso se diligencia en el enlace seguro. 🔒',
    ],
  },
]

/** Notificación que llega al final de la demo, en la pantalla de Entrega. */
export const NOTIFICACION_RESULTADO = {
  titulo: 'SOMEDIAG',
  texto:
    'Ya puede consultarlo de forma segura. Le pediremos los últimos 4 dígitos de su documento.',
  etiquetaEnlace: 'Ver mi resultado',
  url: 'somediag.co/resultado/SMD-0147',
}
