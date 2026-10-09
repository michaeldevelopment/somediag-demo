import { EtiquetaDemo } from '@/components/EtiquetaDemo'
import { ALTO_BARRA, PresenterBar } from '@/components/PresenterBar'
import { CentroControl } from '@/screens/CentroControl'
import { Entrega } from '@/screens/Entrega'
import { PreRegistro } from '@/screens/PreRegistro'
import { Radiologo } from '@/screens/Radiologo'
import { Recepcion } from '@/screens/Recepcion'
import { WhatsApp } from '@/screens/WhatsApp'
import { useDemoStore, type Pestana } from '@/store/useDemoStore'

export default function App() {
  const pestana = useDemoStore((s) => s.pestana)

  return (
    <>
      <PresenterBar />

      <main
        className="mx-auto max-w-[1600px] px-4 py-8"
        style={{ paddingTop: ALTO_BARRA + 32 }}
      >
        <Pantalla pestana={pestana} />
      </main>

      <EtiquetaDemo />
    </>
  )
}

/** Las pantallas de paciente traen su propio marco de celular. */
function Pantalla({ pestana }: { pestana: Pestana }) {
  switch (pestana) {
    case 'whatsapp':
      return <WhatsApp />
    case 'pre-registro':
      return <PreRegistro />
    case 'recepcion':
      return <Recepcion />
    case 'radiologo':
      return <Radiologo />
    case 'entrega':
      return <Entrega />
    case 'centro-control':
      return <CentroControl />
  }
}
