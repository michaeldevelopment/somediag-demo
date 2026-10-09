import {
  ORDEN_ESTADOS,
  type Caso,
  type Estado,
  type InfoAtencion,
  type Modalidad,
  type TipoPaciente,
} from './tipos'

export const CASO_PROTAGONISTA_ID = 'SMD-0147'

export const TRANSCRIPCION_LAURA =
  'Radiografía de tórax en proyecciones posteroanterior y lateral. ' +
  'Campos pulmonares bien expandidos, sin opacidades focales ni consolidaciones. ' +
  'No se observa derrame pleural ni neumotórax. ' +
  'Silueta cardiomediastínica de tamaño y configuración normales; índice cardiotorácico conservado. ' +
  'Hilios pulmonares de aspecto vascular. Senos costofrénicos libres. ' +
  'Estructuras óseas de la caja torácica sin lesiones líticas ni blásticas. ' +
  'Conclusión: estudio de tórax dentro de límites normales. ' +
  'Apto para el cargo desde el punto de vista radiológico.'

/** Plantillas cortas para los casos de relleno que el presentador abra. */
const PLANTILLA_TRANSCRIPCION: Record<Modalidad, string> = {
  RX: 'Estudio radiográfico de adecuada técnica y penetración. No se identifican lesiones óseas agudas ni alteraciones de partes blandas. Conclusión: estudio sin hallazgos patológicos.',
  TAC: 'Tomografía con adecuada opacificación de estructuras vasculares. No se observan colecciones, masas ni adenopatías de tamaño significativo. Conclusión: estudio dentro de límites normales.',
  ECO: 'Ecografía realizada con transductor convexo. Estructuras evaluadas de ecogenicidad y tamaño conservados, sin líquido libre. Conclusión: estudio sin alteraciones.',
}

/** Texto que el dictado produce para un caso dado. */
export function transcripcionDe(caso: Caso) {
  return caso.id === CASO_PROTAGONISTA_ID
    ? TRANSCRIPCION_LAURA
    : PLANTILLA_TRANSCRIPCION[caso.modalidad]
}

/**
 * Construye el historial a partir del estado alcanzado, repartiendo los
 * eventos entre el momento de creación del caso y ahora.
 */
function construirHistorial(estado: Estado, creadoHace: number) {
  const pasos = ORDEN_ESTADOS.slice(0, ORDEN_ESTADOS.indexOf(estado) + 1)
  const ahora = Date.now()
  const inicio = ahora - creadoHace * 60_000
  const tramo = pasos.length > 1 ? (ahora - inicio) / (pasos.length - 1) : 0

  return pasos.map((paso, i) => ({
    estado: paso,
    hora: new Date(inicio + tramo * i).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  }))
}

type FilaCaso = [
  id: string,
  nombre: string,
  documento: string,
  telefono: string,
  tipo: TipoPaciente,
  empresa: string | undefined,
  modalidad: Modalidad,
  estudio: string,
  radiologo: string | undefined,
  estado: Estado,
  slaMin: number,
  creadoHace: number,
]

/**
 * 25 casos de relleno. Los que tienen `creadoHace > slaMin` y no están
 * entregados salen con SLA vencido: SMD-0124, SMD-0128 y SMD-0132.
 */
const RELLENO: FilaCaso[] = [
  ['SMD-0121', 'Jorge Alberto Mendoza', 'CC 79.452.118', '+57 310 442 8871', 'particular', undefined, 'RX', 'RX de rodilla derecha AP y lateral', 'Dr. Felipe Arango', 'resultado_entregado', 240, 198],
  ['SMD-0122', 'Nubia Esperanza Cárdenas', 'CC 41.228.903', '+57 320 118 4420', 'convenio', 'Cafesalud Ocupacional', 'ECO', 'Ecografía abdominal total', 'Dra. Mónica Salcedo', 'resultado_entregado', 300, 265],
  ['SMD-0123', 'Didier Stiven Ocampo', 'CC 1.094.337.512', '+57 315 770 2214', 'empresa', 'Transportes Andinos S.A.S.', 'RX', 'RX de columna lumbosacra', 'Dr. Felipe Arango', 'resultado_entregado', 240, 212],
  ['SMD-0124', 'Martha Lucía Peñaloza', 'CC 52.880.441', '+57 301 556 9043', 'poliza', 'Seguros Bolívar', 'TAC', 'TAC de senos paranasales', 'Dr. Andrés Villalobos', 'resultado_aprobado', 360, 410],
  ['SMD-0125', 'Hernán Darío Quiceno', 'CC 71.665.208', '+57 312 203 7756', 'particular', undefined, 'RX', 'RX de tórax PA', 'Dra. Carolina Restrepo', 'resultado_entregado', 240, 177],
  ['SMD-0126', 'Yuliana Andrea Serna', 'CC 1.017.449.336', '+57 318 994 1182', 'convenio', 'Nueva EPS', 'ECO', 'Ecografía obstétrica de segundo trimestre', 'Dra. Mónica Salcedo', 'lectura_recibida', 300, 188],
  ['SMD-0127', 'Over Antonio Palacios', 'CC 11.802.657', '+57 304 331 5509', 'empresa', 'Agroindustrias del Sinú', 'RX', 'RX de hombro izquierdo', 'Dr. Felipe Arango', 'resultado_aprobado', 240, 151],
  ['SMD-0128', 'Clara Inés Betancur', 'CC 43.991.740', '+57 310 002 8834', 'particular', undefined, 'TAC', 'TAC de abdomen con contraste', 'Dr. Andrés Villalobos', 'enviado_radiologo', 360, 395],
  ['SMD-0129', 'Brayan Camilo Rodríguez', 'CC 1.152.690.773', '+57 322 447 1160', 'empresa', 'Constructora Pórtico', 'RX', 'RX de mano derecha', 'Dr. Felipe Arango', 'lectura_recibida', 240, 132],
  ['SMD-0130', 'Rosalba Gutiérrez Mejía', 'CC 32.104.886', '+57 311 668 9025', 'convenio', 'Sanitas Ocupacional', 'ECO', 'Ecografía de tiroides', undefined, 'estudio_realizado', 300, 96],
  ['SMD-0131', 'Edinson Fabián Loaiza', 'CC 1.088.251.904', '+57 316 773 3391', 'particular', undefined, 'RX', 'RX de cadera bilateral', 'Dra. Carolina Restrepo', 'enviado_radiologo', 240, 118],
  ['SMD-0132', 'Luz Marina Agudelo', 'CC 24.773.512', '+57 300 229 6617', 'poliza', 'Colmédica', 'TAC', 'TAC de tórax de alta resolución', 'Dr. Andrés Villalobos', 'enviado_radiologo', 180, 204],
  ['SMD-0133', 'Néstor Iván Carvajal', 'CC 80.117.449', '+57 313 885 7703', 'empresa', 'Transportes Andinos S.A.S.', 'RX', 'RX de tórax PA y lateral', 'Dra. Carolina Restrepo', 'estudio_realizado', 240, 73],
  ['SMD-0134', 'Diana Carolina Zapata', 'CC 1.020.556.218', '+57 319 114 4482', 'convenio', 'Compensar', 'ECO', 'Ecografía de vías urinarias', undefined, 'admitido', 300, 54],
  ['SMD-0135', 'Wilmar Alexis Tabares', 'CC 94.336.701', '+57 317 550 2278', 'particular', undefined, 'RX', 'RX de tobillo izquierdo', undefined, 'admitido', 240, 41],
  ['SMD-0136', 'Gloria Patricia Herrera', 'CC 51.448.023', '+57 302 771 8840', 'empresa', 'Alimentos La Sabana', 'TAC', 'TAC de columna cervical', undefined, 'admitido', 360, 37],
  ['SMD-0137', 'Jhon Freddy Bermúdez', 'CC 1.063.882.115', '+57 314 226 9954', 'convenio', 'Nueva EPS', 'RX', 'RX de pie derecho AP y oblicua', undefined, 'registro_completo', 240, 29],
  ['SMD-0138', 'Sandra Milena Ospina', 'CC 39.774.260', '+57 321 339 1107', 'particular', undefined, 'ECO', 'Ecografía de partes blandas', undefined, 'registro_completo', 300, 24],
  ['SMD-0139', 'Omar Enrique Castañeda', 'CC 15.992.338', '+57 310 884 5562', 'poliza', 'Seguros SURA', 'TAC', 'TAC de cráneo simple', undefined, 'registro_completo', 360, 19],
  ['SMD-0140', 'Katherine Julieth Ramos', 'CC 1.128.447.901', '+57 318 220 7731', 'empresa', 'Call Center Antares', 'RX', 'RX de tórax PA', undefined, 'registro_iniciado', 240, 14],
  ['SMD-0141', 'Álvaro José Trujillo', 'CC 76.551.284', '+57 312 006 4418', 'particular', undefined, 'ECO', 'Ecografía de hombro derecho', undefined, 'registro_iniciado', 300, 11],
  ['SMD-0142', 'Leidy Johana Pineda', 'CC 1.075.338.662', '+57 305 447 2290', 'convenio', 'Cafesalud Ocupacional', 'RX', 'RX de columna dorsal', undefined, 'registro_iniciado', 240, 8],
  ['SMD-0143', 'Fabio Nelson Quintero', 'CC 10.448.773', '+57 311 992 6605', 'empresa', 'Transportes Andinos S.A.S.', 'TAC', 'TAC de abdomen simple', 'Dr. Andrés Villalobos', 'lectura_recibida', 360, 229],
  ['SMD-0144', 'Mireya del Carmen Sotelo', 'CC 26.118.440', '+57 304 557 3328', 'poliza', 'Colmédica', 'ECO', 'Ecografía doppler de miembros inferiores', 'Dra. Mónica Salcedo', 'resultado_aprobado', 300, 241],
  ['SMD-0145', 'Sebastián Felipe Mora', 'CC 1.001.226.558', '+57 316 118 9947', 'particular', undefined, 'RX', 'RX de senos paranasales', 'Dr. Felipe Arango', 'resultado_entregado', 240, 203],
]

export function casoProtagonista(): Caso {
  return {
    id: CASO_PROTAGONISTA_ID,
    paciente: {
      nombre: 'Laura Gómez Arenas',
      documento: 'CC 1.036.774.812',
      telefono: '+57 310 775 2284',
    },
    tipo: 'convenio',
    empresa: 'Transportes Andinos S.A.S.',
    modalidad: 'RX',
    estudio: 'RX de tórax PA y lateral',
    estado: 'registro_iniciado',
    slaMin: 240,
    creadoHace: 3,
    historial: construirHistorial('registro_iniciado', 3),
  }
}

/**
 * Casos trabados por algo que no es el SLA. Va aparte de `RELLENO` porque la
 * tupla de allá ya tiene doce posiciones y una más la vuelve ilegible.
 */
const ATENCION_POR_CASO: Record<string, InfoAtencion> = {
  'SMD-0130': {
    motivo: 'sin_radiologo_asignado',
    responsable: 'Coordinación médica',
    esperandoMin: 24,
  },
  'SMD-0137': {
    motivo: 'orden_ilegible',
    responsable: 'Recepción',
    esperandoMin: 18,
  },
  'SMD-0140': {
    motivo: 'dato_clinico_faltante',
    responsable: 'Paciente · WhatsApp',
    esperandoMin: 7,
  },
  'SMD-0144': {
    motivo: 'pendiente_validacion',
    responsable: 'Coordinación médica',
    esperandoMin: 12,
  },
}

export function casosIniciales(): Caso[] {
  const relleno = RELLENO.map<Caso>(
    ([
      id,
      nombre,
      documento,
      telefono,
      tipo,
      empresa,
      modalidad,
      estudio,
      radiologo,
      estado,
      slaMin,
      creadoHace,
    ]) => ({
      id,
      paciente: { nombre, documento, telefono },
      tipo,
      empresa,
      modalidad,
      estudio,
      radiologo,
      estado,
      slaMin,
      creadoHace,
      historial: construirHistorial(estado, creadoHace),
      atencion: ATENCION_POR_CASO[id],
    }),
  )

  return [casoProtagonista(), ...relleno]
}
