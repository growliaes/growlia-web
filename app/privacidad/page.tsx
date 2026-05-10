'use client'

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 60px', fontFamily: "'DM Sans', sans-serif", color: '#0F172A', lineHeight: 1.7 }}>
      <a href="/" style={{ color: '#2563EB', textDecoration: 'none', fontSize: 14, display: 'inline-block', marginBottom: 32 }}>← Volver a Growlia</a>

      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Política de Privacidad</h1>
      <p style={{ color: '#64748B', fontSize: 14, marginBottom: 40 }}>Última actualización: Enero 2025</p>

      <p style={{ marginBottom: 24 }}>
        En Growlia respetamos tu privacidad y nos comprometemos a proteger los datos personales que compartes con nosotros. Esta política explica qué información recopilamos, cómo la usamos y qué derechos tienes.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>1. Responsable del tratamiento</h2>
      <p style={{ marginBottom: 16 }}>
        El responsable del tratamiento de tus datos es Growlia (en adelante, "nosotros"), accesible a través del dominio growlia.es y contactable mediante el email hola@growlia.es.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>2. Qué datos recopilamos</h2>
      <p style={{ marginBottom: 12 }}>Recopilamos los siguientes tipos de datos:</p>
      <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
        <li><strong>Datos de cuenta:</strong> nombre, email y empresa cuando te registras.</li>
        <li><strong>Datos de plataformas publicitarias:</strong> al conectar tus cuentas de Google Ads, Meta Ads u otras plataformas mediante OAuth, accedemos a información de tus campañas (gasto, impresiones, conversiones, ROAS) para analizarlas y optimizarlas.</li>
        <li><strong>Datos de uso:</strong> cómo interactúas con nuestra plataforma, páginas visitadas, funcionalidades utilizadas.</li>
        <li><strong>Datos de pago:</strong> procesados directamente por Stripe; nosotros no almacenamos información de tarjetas.</li>
      </ul>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>3. Para qué usamos tus datos</h2>
      <p style={{ marginBottom: 12 }}>Usamos tus datos exclusivamente para:</p>
      <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
        <li>Proporcionarte el servicio de gestión y optimización de campañas publicitarias.</li>
        <li>Analizar el rendimiento de tus campañas y generar recomendaciones con IA.</li>
        <li>Procesar pagos de tu suscripción.</li>
        <li>Enviarte comunicaciones importantes sobre el servicio.</li>
        <li>Mejorar nuestra plataforma y desarrollar nuevas funcionalidades.</li>
      </ul>
      <p style={{ marginBottom: 16 }}>
        <strong>Nunca vendemos ni compartimos tus datos con terceros para fines publicitarios.</strong>
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>4. Conexión con Google Ads, Meta Ads y otras plataformas</h2>
      <p style={{ marginBottom: 16 }}>
        Cuando conectas una plataforma publicitaria mediante OAuth, recibimos un token de acceso que almacenamos cifrado con AES-256-GCM en nuestra base de datos. Este token nos permite leer datos de tus campañas y, si autorizas, ejecutar acciones como pausar campañas o ajustar presupuestos.
      </p>
      <p style={{ marginBottom: 16 }}>
        Nunca tenemos acceso a tu contraseña de Google, Meta o cualquier otra plataforma. Puedes revocar el acceso en cualquier momento desde la configuración de tu cuenta o directamente desde la plataforma correspondiente.
      </p>
      <p style={{ marginBottom: 16 }}>
        El uso que Growlia hace de la información recibida de Google APIs cumple con la <a href="https://developers.google.com/terms/api-services-user-data-policy" style={{ color: '#2563EB' }}>Google API Services User Data Policy</a>, incluyendo los requisitos de Limited Use.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>5. Conservación de los datos</h2>
      <p style={{ marginBottom: 16 }}>
        Conservamos tus datos mientras tengas una cuenta activa con nosotros. Si cancelas tu cuenta, eliminaremos tus datos en un plazo máximo de 30 días, salvo aquellos que estemos legalmente obligados a conservar (por ejemplo, facturas durante 5 años).
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>6. Tus derechos (RGPD)</h2>
      <p style={{ marginBottom: 12 }}>Como usuario europeo, tienes los siguientes derechos sobre tus datos:</p>
      <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
        <li><strong>Acceso:</strong> saber qué datos tenemos sobre ti.</li>
        <li><strong>Rectificación:</strong> corregir datos incorrectos.</li>
        <li><strong>Supresión:</strong> solicitar que eliminemos tus datos.</li>
        <li><strong>Oposición:</strong> oponerte a un tratamiento concreto.</li>
        <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
        <li><strong>Limitación:</strong> restringir el tratamiento.</li>
      </ul>
      <p style={{ marginBottom: 16 }}>
        Para ejercer cualquiera de estos derechos, escríbenos a hola@growlia.es. Responderemos en un plazo máximo de 30 días.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>7. Seguridad</h2>
      <p style={{ marginBottom: 16 }}>
        Aplicamos medidas técnicas y organizativas apropiadas para proteger tus datos: cifrado en tránsito (HTTPS), cifrado en reposo (AES-256-GCM para tokens), control de accesos basado en roles (RLS en base de datos), y auditorías regulares de seguridad.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>8. Servicios de terceros</h2>
      <p style={{ marginBottom: 12 }}>Growlia utiliza los siguientes servicios externos para funcionar:</p>
      <ul style={{ paddingLeft: 24, marginBottom: 16 }}>
        <li><strong>Supabase:</strong> base de datos y autenticación.</li>
        <li><strong>Vercel:</strong> hosting de la plataforma.</li>
        <li><strong>Stripe:</strong> procesamiento de pagos.</li>
        <li><strong>Anthropic Claude:</strong> análisis con inteligencia artificial.</li>
        <li><strong>Google Ads API, Meta Marketing API:</strong> conexión con plataformas publicitarias.</li>
      </ul>
      <p style={{ marginBottom: 16 }}>
        Cada uno de estos servicios cumple con sus propias políticas de privacidad y normativas RGPD.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>9. Cambios en esta política</h2>
      <p style={{ marginBottom: 16 }}>
        Podemos actualizar esta política ocasionalmente. Te notificaremos por email si los cambios son significativos. La fecha de última actualización aparece al inicio del documento.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 700, marginTop: 32, marginBottom: 12 }}>10. Contacto</h2>
      <p style={{ marginBottom: 16 }}>
        Para cualquier duda sobre esta política o el tratamiento de tus datos, escríbenos a <strong>hola@growlia.es</strong>.
      </p>
    </div>
  )
}

