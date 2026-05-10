'use client'

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 60px', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', lineHeight: 1.7 }}>
      <a href="/" style={{ color: '#2563EB', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 32 }}>← Volver a Growlia</a>

      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Términos de Servicio</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 40 }}>Última actualización: Enero 2025</p>

      <p style={{ marginBottom: 24 }}>
        Bienvenido a Growlia. Al utilizar nuestro servicio, aceptas estos términos. Por favor léelos con atención.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. Descripción del servicio</h2>
      <p style={{ marginBottom: 16 }}>
        Growlia es una plataforma SaaS (Software as a Service) que permite a empresas y profesionales del marketing gestionar, analizar y optimizar sus campañas publicitarias en Google Ads, Meta Ads, TikTok Ads y otras plataformas mediante inteligencia artificial.
      </p>
      <p style={{ marginBottom: 16 }}>
        El servicio incluye conexión OAuth con plataformas publicitarias, dashboard unificado, agente IA con Claude (Anthropic), automatizaciones, alertas y reportes.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. Cuenta de usuario</h2>
      <p style={{ marginBottom: 16 }}>
        Para utilizar Growlia necesitas crear una cuenta proporcionando un email válido y una contraseña segura. Eres responsable de mantener la confidencialidad de tus credenciales y de toda actividad realizada desde tu cuenta.
      </p>
      <p style={{ marginBottom: 16 }}>
        Debes ser mayor de 18 años o tener la edad legal para celebrar contratos en tu jurisdicción. Si representas a una empresa, garantizas tener autoridad para vincular a esa empresa a estos términos.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. Suscripciones y pagos</h2>
      <p style={{ marginBottom: 12 }}>Growlia se ofrece bajo modelo de suscripción mensual o anual:</p>
      <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
        <li><strong>Starter:</strong> 49€/mes o 39€/mes (anual)</li>
        <li><strong>Growth:</strong> 99€/mes o 79€/mes (anual)</li>
        <li><strong>Agency:</strong> 249€/mes o 199€/mes (anual)</li>
      </ul>
      <p style={{ marginBottom: 16 }}>
        Los pagos se procesan a través de Stripe. La suscripción se renueva automáticamente al final de cada período. Puedes cancelar en cualquier momento desde tu panel de cuenta; mantendrás acceso hasta el final del período pagado.
      </p>
      <p style={{ marginBottom: 16 }}>
        Ofrecemos un período de prueba gratuito de 14 días. Si cancelas antes de que termine la prueba, no se te cobrará nada.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>4. Conexión con plataformas publicitarias</h2>
      <p style={{ marginBottom: 16 }}>
        Para usar Growlia necesitas conectar tus cuentas de Google Ads, Meta Ads u otras plataformas mediante OAuth. Al hacerlo, autorizas a Growlia a leer datos de tus campañas y, si lo permites explícitamente, a ejecutar acciones como pausar campañas o ajustar presupuestos.
      </p>
      <p style={{ marginBottom: 16 }}>
        Tú eres el único responsable del contenido de tus anuncios, del cumplimiento de las políticas publicitarias de cada plataforma y del presupuesto que destinas a cada campaña. Growlia no se hace responsable de pérdidas económicas derivadas de campañas mal configuradas, presupuestos excesivos o decisiones tomadas en base a las recomendaciones de IA.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>5. Uso aceptable</h2>
      <p style={{ marginBottom: 12 }}>Te comprometes a no usar Growlia para:</p>
      <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
        <li>Actividades ilegales o que violen derechos de terceros.</li>
        <li>Spam, fraude publicitario o esquemas piramidales.</li>
        <li>Contenido que promueva discriminación, violencia u odio.</li>
        <li>Intentar acceder a cuentas de otros usuarios sin autorización.</li>
        <li>Realizar ingeniería inversa, copiar o intentar replicar nuestro servicio.</li>
        <li>Sobrecargar nuestros servidores con peticiones automatizadas no autorizadas.</li>
      </ul>
      <p style={{ marginBottom: 16 }}>
        Nos reservamos el derecho de suspender cuentas que violen estos términos sin previo aviso.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>6. Inteligencia artificial</h2>
      <p style={{ marginBottom: 16 }}>
        Growlia utiliza modelos de IA de Anthropic (Claude) para analizar tus campañas y generar recomendaciones. La IA puede equivocarse, ofrecer información imprecisa o generar recomendaciones inadecuadas para tu caso específico.
      </p>
      <p style={{ marginBottom: 16 }}>
        Las recomendaciones de la IA son orientativas y no constituyen asesoramiento financiero, legal ni profesional. Tú eres responsable de revisar y aprobar cualquier acción ejecutada en tus cuentas publicitarias.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>7. Propiedad intelectual</h2>
      <p style={{ marginBottom: 16 }}>
        Todo el contenido de Growlia (software, diseño, marca, documentación) es propiedad de Growlia y está protegido por las leyes de propiedad intelectual. Te concedemos una licencia limitada, no exclusiva e intransferible para usar el servicio según estos términos.
      </p>
      <p style={{ marginBottom: 16 }}>
        Los datos de tus campañas son y seguirán siendo de tu propiedad. Growlia solo accede a ellos para prestarte el servicio.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>8. Disponibilidad del servicio</h2>
      <p style={{ marginBottom: 16 }}>
        Nos esforzamos por mantener Growlia disponible 24/7, pero no garantizamos un uptime del 100%. Pueden producirse interrupciones por mantenimiento, actualizaciones o problemas técnicos. No nos hacemos responsables de pérdidas derivadas de períodos de inactividad.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>9. Limitación de responsabilidad</h2>
      <p style={{ marginBottom: 16 }}>
        En la medida permitida por la ley, Growlia no será responsable de daños indirectos, incidentales, especiales o consecuentes derivados del uso del servicio. Nuestra responsabilidad máxima en cualquier caso queda limitada al importe pagado por el usuario en los 12 meses anteriores al hecho que origine la reclamación.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>10. Cancelación y reembolsos</h2>
      <p style={{ marginBottom: 16 }}>
        Puedes cancelar tu suscripción en cualquier momento desde tu panel. La cancelación tendrá efecto al final del período pagado. No ofrecemos reembolsos por períodos parciales ya iniciados, salvo en casos de fallo grave del servicio atribuible a Growlia.
      </p>
      <p style={{ marginBottom: 16 }}>
        Cumplimos con el derecho de desistimiento de 14 días para consumidores europeos cuando aplique según la normativa.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>11. Modificaciones de los términos</h2>
      <p style={{ marginBottom: 16 }}>
        Podemos actualizar estos términos ocasionalmente. Te notificaremos por email si los cambios son materiales. El uso continuado del servicio tras los cambios implica aceptación de los nuevos términos.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>12. Ley aplicable y jurisdicción</h2>
      <p style={{ marginBottom: 16 }}>
        Estos términos se rigen por la legislación española. Cualquier disputa se resolverá ante los tribunales españoles, sin perjuicio de los derechos que la normativa de protección de consumidores otorgue a usuarios particulares.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>13. Contacto</h2>
      <p style={{ marginBottom: 16 }}>
        Para cualquier duda sobre estos términos, escríbenos a <strong>hola@growlia.es</strong>.
      </p>
    </div>
  )
}

