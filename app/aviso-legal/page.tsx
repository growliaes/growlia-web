import type { Metadata } from 'next'
import { LegalPage } from '../_legal/LegalPage'
import { LEGAL, TITULAR, HAS_IDENTITY } from '../_legal/config'

export const metadata: Metadata = { title: 'Aviso legal · Growlia' }

export default function AvisoLegal() {
  return (
    <LegalPage title="Aviso legal">
      <p>En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la información y de comercio electrónico (LSSI), estos son los datos del titular de {LEGAL.web}:</p>
      <ul>
        <li><strong>Titular:</strong> {TITULAR}</li>
        {HAS_IDENTITY && <li><strong>NIF:</strong> {LEGAL.nif}</li>}
        {HAS_IDENTITY && <li><strong>Domicilio:</strong> {LEGAL.domicilio}</li>}
        <li><strong>Email:</strong> <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></li>
      </ul>
      <p>El uso del servicio se rige por los <a href="/terminos">Términos del servicio</a> y el tratamiento de datos por la <a href="/privacidad">Política de privacidad</a>.</p>
    </LegalPage>
  )
}
