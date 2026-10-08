import type { Metadata } from 'next'
import { LegalPage } from '../_legal/LegalPage'
import { LEGAL, TITULAR, HAS_IDENTITY } from '../_legal/config'

export const metadata: Metadata = { title: 'Política de privacidad · Growlia' }

export default function Privacidad() {
  return (
    <LegalPage title="Política de privacidad">
      <p>Esta política explica qué datos trata Growlia, para qué, durante cuánto tiempo y qué derechos tienes. La hemos escrito para que se entienda sin ser abogado.</p>

      <h2>1. Responsable del tratamiento</h2>
      <p>{HAS_IDENTITY ? <><strong>{LEGAL.titular}</strong>, con NIF {LEGAL.nif} y domicilio en {LEGAL.domicilio}. </> : <><strong>{TITULAR}</strong>. </>}Contacto: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>.</p>

      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li><strong>Datos de tu cuenta:</strong> nombre, email y contraseña (guardada de forma irreversible, nunca en texto legible).</li>
        <li><strong>Datos de tus plataformas publicitarias:</strong> cuando conectas Google Ads o Meta Ads, recibimos un acceso autorizado por ti y leemos la información de tus cuentas publicitarias: nombre e identificador de la cuenta, campañas, presupuestos, estrategia de puja y métricas (inversión, impresiones, clics, conversiones, valor de conversión, cuota de impresiones, frecuencia), además del estado de la cuenta, la facturación, las acciones de conversión y el píxel.</li>
        <li><strong>Cambios que apruebas:</strong> el historial de propuestas de Growlia, tu decisión y el resultado de aplicarlas.</li>
        <li><strong>Preguntas al asistente:</strong> las preguntas que haces y sus respuestas.</li>
        <li><strong>Datos técnicos:</strong> registros de funcionamiento del servicio. Para limitar el uso del chat de la página de inicio guardamos una huella cifrada e irreversible de tu dirección IP, nunca la IP en sí.</li>
      </ul>
      <p>No tratamos datos de las personas que ven tus anuncios. Las métricas que leemos son agregadas por campaña.</p>

      <h2>3. Para qué los usamos y con qué base legal</h2>
      <table>
        <thead><tr><th>Finalidad</th><th>Base legal</th></tr></thead>
        <tbody>
          <tr><td>Crear y mantener tu cuenta, conectar tus plataformas, mostrarte el rendimiento, generar alertas, el resumen diario y las propuestas de cambio, y aplicar los cambios que apruebes.</td><td>Ejecución del contrato (art. 6.1.b RGPD).</td></tr>
          <tr><td>Responder a tus preguntas con el asistente de IA.</td><td>Ejecución del contrato.</td></tr>
          <tr><td>Seguridad, prevención de abusos y límites de uso.</td><td>Interés legítimo en proteger el servicio (art. 6.1.f).</td></tr>
          <tr><td>Comunicaciones sobre el servicio (cambios, incidencias, seguridad).</td><td>Ejecución del contrato.</td></tr>
          <tr><td>Facturación, cuando el servicio sea de pago.</td><td>Obligación legal (art. 6.1.c).</td></tr>
        </tbody>
      </table>
      <p>No vendemos tus datos ni los usamos para publicidad. Tampoco los usamos para entrenar modelos de inteligencia artificial.</p>

      <h2>4. Decisiones automatizadas</h2>
      <p>Growlia analiza tus campañas de forma automática y propone cambios, pero en el modo actual <strong>ningún cambio se aplica sin tu aprobación expresa</strong>. Si en el futuro activas un modo automático, será por decisión tuya, con los límites que configures, con registro de cada acción y con la posibilidad de deshacerla.</p>

      <h2>5. Datos de Google</h2>
      <p>El uso que hace Growlia de la información recibida de las API de Google y su transferencia a cualquier otra aplicación se ajustan a la <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Política de datos de usuario de los servicios de API de Google</a>, incluidos los requisitos de uso limitado (Limited Use).</p>
      <p>En concreto: solo usamos los datos de Google Ads para prestarte las funciones de Growlia que ves en el producto; no los transferimos a terceros salvo a los proveedores necesarios para prestar el servicio y en las condiciones de esta política; no los usamos para publicidad; y ninguna persona los lee salvo con tu permiso, por motivos de seguridad o por obligación legal.</p>

      <h2>6. Datos de Meta</h2>
      <p>Solo usamos los datos de Meta Ads para prestarte el servicio, conforme a las Condiciones de la Plataforma de Meta. Puedes eliminar el acceso y tus datos como se explica en <a href="/eliminar-datos">Cómo eliminar tus datos</a>.</p>

      <h2>7. Con quién compartimos datos</h2>
      <p>Solo con los proveedores que necesitamos para que Growlia funcione, que actúan como encargados del tratamiento bajo contrato:</p>
      <ul>
        <li><strong>Supabase:</strong> base de datos y autenticación. Los datos se alojan en la Unión Europea (Irlanda).</li>
        <li><strong>Vercel:</strong> alojamiento de la web y de la aplicación.</li>
        <li><strong>Anthropic:</strong> modelo de IA que redacta las respuestas del asistente. Recibe los datos de rendimiento necesarios para responder a cada pregunta.</li>
        <li><strong>Stripe:</strong> pagos, cuando el servicio sea de pago. Nosotros no guardamos datos de tarjetas.</li>
      </ul>
      <p>Google y Meta son responsables independientes de los datos de tus cuentas publicitarias en sus plataformas.</p>

      <h2>8. Transferencias internacionales</h2>
      <p>Algunos proveedores (Vercel, Anthropic y Stripe) pueden tratar datos en Estados Unidos. Estas transferencias se realizan con las garantías previstas en el RGPD, como las cláusulas contractuales tipo aprobadas por la Comisión Europea o la adhesión del proveedor al Marco de Privacidad de Datos UE-EE. UU.</p>

      <h2>9. Cuánto tiempo los conservamos</h2>
      <ul>
        <li><strong>Accesos a tus plataformas:</strong> hasta que desconectes la plataforma, momento en que se borran.</li>
        <li><strong>Datos de campañas en caché:</strong> se sustituyen en cada actualización.</li>
        <li><strong>Cuenta, historial de cambios y conversaciones con el asistente:</strong> mientras tengas la cuenta. Si la eliminas, los borramos en un máximo de 30 días.</li>
        <li><strong>Contadores de uso del chat público:</strong> 30 días.</li>
        <li><strong>Datos de facturación:</strong> el plazo que exija la ley.</li>
      </ul>

      <h2>10. Seguridad</h2>
      <p>Los accesos a tus plataformas publicitarias se guardan cifrados con AES-256. Las comunicaciones van siempre cifradas (HTTPS) y cada usuario solo puede acceder a sus propios datos.</p>

      <h2>11. Tus derechos</h2>
      <p>Puedes pedir el acceso, la rectificación, la supresión o la portabilidad de tus datos, así como oponerte a su tratamiento o pedir que se limite, escribiendo a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Respondemos en un máximo de un mes.</p>
      <p>Si consideras que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (<a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer">aepd.es</a>).</p>

      <h2>12. Cookies</h2>
      <p>Growlia solo usa las cookies técnicas imprescindibles para mantener tu sesión iniciada. No usamos cookies de analítica ni de publicidad, por lo que no necesitamos pedirte consentimiento para ellas.</p>

      <h2>13. Cambios en esta política</h2>
      <p>Si hacemos cambios importantes, te avisaremos por email o dentro de Growlia antes de que entren en vigor.</p>
    </LegalPage>
  )
}
