import type { Metadata } from 'next'
import { LegalPage } from '../_legal/LegalPage'
import { LEGAL, TITULAR, HAS_IDENTITY } from '../_legal/config'

export const metadata: Metadata = { title: 'Términos del servicio · Growlia' }

export default function Terminos() {
  return (
    <LegalPage title="Términos del servicio">
      <p>Estos términos regulan el uso de Growlia, prestado por <strong>{TITULAR}</strong>{HAS_IDENTITY ? ` (NIF ${LEGAL.nif})` : ''}. Al crear una cuenta los aceptas.</p>

      <h2>1. Qué es Growlia</h2>
      <p>Growlia es un software que se conecta a tus cuentas de Google Ads y Meta Ads, analiza su rendimiento, te envía alertas y recomendaciones, y te propone cambios concretos (por ejemplo, ajustar un presupuesto o pausar una campaña) que se aplican solo si los apruebas.</p>
      <p>Growlia está dirigido a profesionales y empresas que gestionan su propia publicidad.</p>

      <h2>2. Tu cuenta</h2>
      <p>Debes dar datos verdaderos, mantener tu contraseña en secreto y avisarnos si sospechas un acceso no autorizado. Solo puedes conectar cuentas publicitarias que tengas derecho a gestionar.</p>

      <h2>3. Acceso anticipado</h2>
      <p>Durante el acceso anticipado Growlia es gratuito y algunas funciones pueden cambiar o fallar. Antes de que el servicio pase a ser de pago te informaremos de los precios y nunca te cobraremos sin que contrates un plan de forma expresa.</p>

      <h2>4. Tus cuentas publicitarias y tus decisiones</h2>
      <ul>
        <li>Tus cuentas publicitarias, su facturación y su contenido son tuyos. Growlia no crea cuentas a tu nombre ni se queda con ellas.</li>
        <li>Las recomendaciones de Growlia son orientativas. <strong>Tú decides qué cambios aprobar</strong> y eres responsable de la inversión publicitaria y del contenido de tus anuncios.</li>
        <li>Antes de aplicar un cambio aprobado, Growlia comprueba que la campaña sigue como cuando se propuso. Puedes deshacer los cambios aplicados durante 7 días desde la propia aplicación.</li>
        <li>Debes cumplir las políticas publicitarias de Google y Meta. Growlia no responde de las decisiones que tomen esas plataformas sobre tus cuentas o anuncios.</li>
      </ul>

      <h2>5. Inteligencia artificial</h2>
      <p>Algunas funciones, como el asistente, usan modelos de inteligencia artificial. Pueden cometer errores; revisa la información importante antes de tomar decisiones.</p>

      <h2>6. Sin garantía de resultados</h2>
      <p>El rendimiento publicitario depende de muchos factores ajenos a Growlia (mercado, competencia, producto, algoritmos de las plataformas). No garantizamos un resultado concreto.</p>

      <h2>7. Uso aceptable</h2>
      <p>No puedes usar Growlia para actividades ilegales, fraude publicitario, acceder a cuentas ajenas, saturar el servicio con peticiones automatizadas ni copiar o realizar ingeniería inversa del software.</p>

      <h2>8. Disponibilidad</h2>
      <p>Trabajamos para que Growlia esté disponible siempre, pero puede haber interrupciones por mantenimiento, por fallos de proveedores o por cambios en las API de Google y Meta.</p>

      <h2>9. Responsabilidad</h2>
      <p>En la medida en que lo permita la ley, no respondemos de daños indirectos ni del lucro cesante. Nuestra responsabilidad total frente a ti se limita a lo que hayas pagado por Growlia en los 12 meses anteriores al hecho que la origine. Nada de lo anterior limita la responsabilidad que no pueda limitarse por ley, como la derivada de dolo o culpa grave.</p>

      <h2>10. Baja</h2>
      <p>Puedes desconectar tus plataformas y dejar de usar Growlia en cualquier momento, y pedirnos que eliminemos tu cuenta escribiendo a <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Podemos suspender cuentas que incumplan estos términos.</p>

      <h2>11. Cambios</h2>
      <p>Si cambiamos estos términos de forma relevante, te avisaremos con antelación por email o dentro de Growlia.</p>

      <h2>12. Ley aplicable</h2>
      <p>Estos términos se rigen por la ley española. Los conflictos se someterán a los juzgados y tribunales que correspondan conforme a la ley.</p>

      <h2>13. Contacto</h2>
      <p><a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a></p>
    </LegalPage>
  )
}
