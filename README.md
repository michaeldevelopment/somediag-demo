# Demo · Programa Cero Digitación · SOMEDIAG

Demo de ventas, solo frontend, con datos ficticios. Recorre el camino de un
paciente desde WhatsApp hasta la entrega del resultado. Ver `spec.md`.

```bash
npm install
npm run dev     # http://localhost:5173
npm run build
```

El estado de la demo se guarda en `localStorage` bajo la clave `demo-somediag`.
El botón **Reiniciar demo** de la barra de presentador lo restaura.

## Estructura

```
src/
  data/        tipos.ts, mockCasos.ts, radiologos.ts, chatScript.ts
  store/       useDemoStore.ts
  lib/         utils.ts, sla.ts
  components/  PresenterBar, PhoneFrame, EtiquetaDemo
  screens/     WhatsApp, PreRegistro, Recepcion, Radiologo, Entrega, CentroControl
public/        orden-medica.svg, radiografia.svg
```

## Dictado del radiólogo

Si existe `public/dictado.mp3`, la pantalla de Radiólogo lo reproduce y la
transcripción avanza al ritmo del audio. Si no existe, cae automáticamente a
una barra simulada de 15 segundos y lo indica en pantalla.
