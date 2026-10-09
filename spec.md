# SPEC — Demo "Programa Cero Digitación · SOMEDIAG"

## Objetivo
Demo de ventas, solo frontend, con datos ficticios. Muestra en ~7 minutos el recorrido de un paciente desde WhatsApp hasta la entrega del resultado. Sin backend, sin login, sin llamadas reales a IA.

## Stack
- Vite + React + TypeScript
- Tailwind + shadcn/ui, íconos lucide-react
- Zustand con `persist` (localStorage)
- Recharts (gráficas) y `qrcode` (generar QR)
- Deploy: Vercel

## Diseño
- Paleta: marino #0B1F3A, teal #0FA3A3 (primario), menta #E8F6F4 (fondos), coral #FF6B5A (alertas/SLA vencido), blanco.
- Fuente Inter. Interfaz limpia, mucho espacio en blanco.
- Pantallas de paciente dentro de un marco de celular (~390px) centrado.
- Etiqueta fija discreta en todas las pantallas: "Demo · datos ficticios".
- Todo el texto en español de Colombia.

## Navegación (barra de presentador fija arriba)
Pestañas: WhatsApp · Pre-registro · Recepción · Radiólogo · Entrega · Centro de control · Integraciones
+ botón "Reiniciar demo" (restaura el estado inicial).

## Modelo de datos
```ts
type Modalidad = 'RX' | 'TAC' | 'ECO';
type TipoPaciente = 'particular' | 'convenio' | 'poliza' | 'empresa';
type Estado =
  | 'registro_iniciado' | 'registro_completo' | 'admitido'
  | 'estudio_realizado' | 'enviado_radiologo' | 'lectura_recibida'
  | 'resultado_aprobado' | 'resultado_entregado';

interface Caso {
  id: string;              // "SMD-0147"
  paciente: { nombre: string; documento: string; telefono: string };
  tipo: TipoPaciente;
  empresa?: string;
  modalidad: Modalidad;
  estudio: string;         // "RX de tórax PA y lateral"
  radiologo?: string;
  estado: Estado;
  slaMin: number;          // minutos objetivo para entrega
  creadoHace: number;      // minutos, para calcular SLA
  transcripcion?: string;
  historial: { estado: Estado; hora: string }[];
}
```

## Datos ficticios
- Caso protagonista: Laura Gómez, CC 1.036.XXX.XXX, RX de tórax, empresa "Transportes Andinos S.A.S." (convenio ocupacional), estado inicial `registro_iniciado`.
- 25 casos de relleno repartidos en todos los estados, con modalidades RX/TAC/ECO y tipos de paciente mezclados. Al menos 3 con SLA vencido.
- 4 radiólogos ficticios con disponibilidad.
- Una imagen de orden médica ficticia (generada como SVG o PNG local) y una imagen de radiografía marcada como "Imagen ilustrativa". Nunca imágenes reales de pacientes.
- Un audio de dictado: `public/dictado.mp3` (lo grabo yo). Si no existe, simular con una barra de reproducción de 15 segundos.

## Pantallas y criterios de terminado

### 1. WhatsApp (marco de celular)
- Chat con guion: el bot saluda → el paciente elige "Rayos X" con botones de respuesta rápida → el bot da las instrucciones de preparación → el bot envía el enlace de pre-registro.
- Los mensajes aparecen con indicador de "escribiendo…".
- El bot NUNCA pide cédula ni datos clínicos por chat.
- ✅ Clic en el enlace → navega a Pre-registro.

### 2. Pre-registro (marco de celular)
- Botón "Subir orden médica" → muestra la miniatura de la orden ficticia → animación "Leyendo orden con IA…" de 2,5 s → los campos se llenan uno por uno, con un badge de confianza (ej. 98%).
- Selector de estudio: al elegir "TAC con contraste" aparecen 3 preguntas extra (alergias, función renal, embarazo).
- Checkbox obligatorio de autorización de tratamiento de datos (Ley 1581).
- ✅ "Finalizar" → muestra el QR del caso, cambia el estado a `registro_completo` y el texto dice "Presente este código al llegar".

### 3. Recepción (escritorio)
- Campo "Escanee el QR" con autofocus + botón "Simular escaneo".
- Al escanear: tarjeta con los datos del paciente marcados como validados ✓ y botón "Confirmar admisión".
- Al confirmar: animación "Creando admisión en Manager Clinic…" → "Admisión creada ✓".
- Cronómetro visible: "Tiempo de registro: 00:12" vs. "Promedio manual: ~5 min".
- ✅ Estado `admitido`. Botón "Marcar estudio realizado" → `estudio_realizado` → asignación automática a un radiólogo con el motivo visible ("Convenio ocupacional · SLA 4h · Dr. disponible").

### 4. Radiólogo (escritorio)
- Lista de estudios pendientes con badge de SLA (verde, amarillo o coral).
- Al abrir el caso de Laura: imagen ilustrativa + botón "Dictar" (reproduce el audio) → la transcripción literal aparece en un textarea editable.
- Botón "Aprobar y firmar" → modal de confirmación con nombre del médico y fecha y hora.
- ✅ Estado `resultado_aprobado`.

### 5. Entrega (marco de celular)
- Notificación de WhatsApp: "Su resultado está listo" + enlace.
- Pantalla de verificación: el paciente ingresa los últimos 4 dígitos de su documento.
- ✅ Muestra el informe con el membrete de SOMEDIAG y la firma del radiólogo. Estado `resultado_entregado`.

### 6. Centro de control (escritorio)
- Franja "Comparación de proceso" con toggle **Proceso actual ↔ Con el programa**. Tres cifras que voltean: gestión administrativa (1 h 6 min → 6 min), proceso total (2 h → 42 min) y digitación del mismo dato (3 veces → 0). Las dos primeras se derivan de `TIEMPOS_POR_ETAPA`, no se escriben aparte. Pie con los supuestos a la vista.
- Los 4 KPIs **no** cambian con el toggle: siguen siendo datos vivos del tablero (pacientes de hoy, en proceso, SLA vencidos, tiempo promedio hasta la entrega).
- Tablero tipo kanban con columnas por estado. El caso de Laura va resaltado y se mueve de columna según avanza la demo.
- Panel "Requieren atención": un caso entra por SLA vencido o por un motivo marcado en los datos (orden ilegible, dato clínico faltante, sin radiólogo, pendiente de validación). Cada fila muestra **motivo, responsable y minutos esperando**; los vencidos van primero.
- Panel "Atención inicial": cuánto resuelve el agente solo (41 contactos → 33 orientados → 26 pre-registros → 8 escalados) y el mix de canal. Las cifras van a la escala de la demo para que cuadren con el KPI "Pacientes de hoy".
- 2 gráficas: estudios por modalidad (dona) y tiempo por etapa (barras, con la serie del modo activo).
- La gráfica de etapas cierra con el **cuello de botella calculado**: hoy la entrega (38%), con el programa la lectura médica (52%). Que se mueva es el argumento.
- Clic en un caso → panel lateral con su historial de estados.
- ✅ Refleja en vivo los cambios hechos en las otras pantallas.

### 7. Integraciones (escritorio)
- 5 puntos con estado de madurez honesto: Manager Clinic (por validar), Worklist DICOM y PACS (en levantamiento), WhatsApp Business API (propuesto), portal de empresas (por definir).
- Cada tarjeta declara intercambio y alcance. Arriba, la tira del recorrido de los datos; abajo, los controles (decisión clínica humana, auditoría por evento, permisos por perfil, datos cifrados).
- ✅ Aviso al pie: ninguna integración está conectada; el alcance real depende de validar APIs, versiones y mecanismos de cada sistema.

## Fuera de alcance
Login, roles reales, administración, integraciones reales, IA real, manejo de errores, tests, portal de empresas.

Pendientes detectados al comparar con la plataforma de Wise, todavía sin
construir: caso de negocio en pesos, entrega a la empresa remitente además del
paciente, un caso donde la IA se equivoca y alguien corrige, y devolución del
informe con observaciones desde el radiólogo.

## Estructura
```
src/
  data/        mockCasos.ts, radiologos.ts, chatScript.ts
  store/       useDemoStore.ts
  components/  PresenterBar, PhoneFrame, SlaBadge, StatusPill, KpiCard,
               ComparadorProceso, PanelContencion
  screens/     WhatsApp, PreRegistro, Recepcion, Radiologo, Entrega,
               CentroControl, Integraciones
```