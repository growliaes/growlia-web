import type { Metadata } from 'next'
import { LegalPage } from '../_legal/LegalPage'
import { LEGAL } from '../_legal/config'

export const metadata: Metadata = { title: 'Cómo eliminar tus datos · Growlia' }

export default function EliminarDatos() {
  return (
    <LegalPage title="Cómo eliminar tus datos">
      <p>Puedes retirar el acceso de Growlia a tus cuentas y eliminar tus datos en cualquier momento.</p>

      <h2>Retirar el acceso a una plataforma</h2>
      <p>En Growlia, entra en <a href="/dashboard">Conexiones</a> y pulsa <strong>Desconectar</strong> en Google Ads o Meta Ads. El acceso guardado y los datos de campañas de esa plataforma se borran al momento.</p>
      <p>También puedes retirarlo desde la propia plataforma:</p>
      <ul>
        <li><strong>Facebook / Meta:</strong> Configuración y privacidad, Configuración, Integraciones comerciales. Selecciona Growlia y pulsa Eliminar.</li>
        <li><strong>Google:</strong> en <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>, selecciona Growlia y pulsa Eliminar todos los accesos.</li>
      </ul>

      <h2>Eliminar tu cuenta y todos tus datos</h2>
      <p>Escribe a <a href={`mailto:${LEGAL.email}?subject=Eliminar%20mi%20cuenta`}>{LEGAL.email}</a> desde el email de tu cuenta con el asunto <strong>Eliminar mi cuenta</strong>. Borraremos tu cuenta, tus conexiones, tu historial y tus conversaciones en un máximo de 30 días y te confirmaremos por email cuando esté hecho.</p>
    </LegalPage>
  )
}
