import ChatBox from './components/ChatBox'

const C = {
  blue: '#2563EB', ink: '#111827', inkMid: '#6B7280',
  inkLight: '#9CA3AF', border: '#E5E7EB', white: '#FFFFFF', bg: '#F9FAFB',
}

const PLATFORMS = [
  { name: 'Google Ads', desc: 'Gestiona campañas de Google Ads', soon: false },
  { name: 'Meta Ads', desc: 'Anuncios en Facebook e Instagram', soon: false },
  { name: 'TikTok Ads', desc: 'Gestiona campañas en TikTok', soon: true },
  { name: 'LinkedIn Ads', desc: 'Anuncios B2B en LinkedIn', soon: true },
  { name: 'Microsoft Ads', desc: 'Campañas en Bing y Microsoft', soon: true },
  { name: 'Google Analytics', desc: 'Analítica web avanzada', soon: true },
]

const FEATURES = [
  { icon: '🤖', title: 'IA que trabaja por ti', desc: 'El agente analiza tus campañas, detecta anomalías y sugiere optimizaciones en tiempo real.' },
  { icon: '📊', title: 'Dashboard unificado', desc: 'Todas tus métricas de Google Ads y Meta en un solo panel. Sin cambiar de pestaña.' },
  { icon: '📝', title: 'Reportes automáticos', desc: 'Informes semanales generados por IA listos para enviar a tu cliente o equipo.' },
  { icon: '🔗', title: 'Conexión sin código', desc: 'OAuth con un click. Sin APIs manuales, sin contraseñas compartidas.' },
]

const PLANS = [
  { name: 'Starter', price: 49, desc: 'Para freelancers y consultores', features: ['2 cuentas de ads', 'Agente IA básico', 'Reportes mensuales', 'Soporte email'], highlight: false },
  { name: 'Growth', price: 99, desc: 'Para agencias pequeñas', features: ['10 cuentas de ads', 'Agente IA avanzado', 'Reportes semanales', 'Dashboard multi-cliente', 'Soporte prioritario'], highlight: true },
  { name: 'Agency', price: 249, desc: 'Para agencias y equipos grandes', features: ['Cuentas ilimitadas', 'Agente IA premium', 'Reportes diarios', 'White-label', 'Onboarding dedicado'], highlight: false },
]

export default function Home() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', -apple-system, sans-serif; }
        a { text-decoration: none; }
      `}</style>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5vw', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: C.blue, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/><circle cx="8" cy="8" r="2" fill="white"/></svg>
          </div>
          <span style={{ fontWeight: 800, fontSize: 20, color: C.ink, letterSpacing: '-0.02em' }}>Growlia</span>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {[['Agente','#agente'],['Conexiones','#connections'],['Templates','#templates'],['Precios','#precios']].map(([l,h]) => (
            <a key={l} href={h} style={{ fontSize: 14, color: C.inkMid, fontWeight: 500 }}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <a href="/auth" style={{ fontSize: 14, color: C.inkMid, fontWeight: 500 }}>Iniciar sesión</a>
          <a href="/auth" style={{ background: C.blue, borderRadius: 8, padding: '8px 20px', color: '#fff', fontSize: 14, fontWeight: 600 }}>Empezar gratis</a>
        </div>
      </nav>

      {/* Hero */}
      <section id="agente" style={{ padding: '80px 5vw 60px', background: C.white }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#EFF6FF', borderRadius: 20, padding: '6px 14px', marginBottom: 24 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.05em' }}>AGENTE IA PARA MARKETING</span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px,4.5vw,56px)', fontWeight: 800, color: C.ink, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Tu copiloto de<br /><span style={{ color: C.blue }}>marketing digital</span>
            </h1>
            <p style={{ fontSize: 17, color: C.inkMid, lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              Conecta Google Ads, Meta Ads y TikTok en un solo lugar. La IA optimiza tus campañas, detecta oportunidades y genera informes automáticamente.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/auth" style={{ background: C.blue, borderRadius: 10, padding: '14px 28px', color: '#fff', fontSize: 15, fontWeight: 700 }}>Empezar gratis →</a>
              <a href="#connections" style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 28px', color: C.ink, fontSize: 15, fontWeight: 600 }}>Ver conexiones</a>
            </div>
            <p style={{ fontSize: 12, color: C.inkLight, marginTop: 12 }}>Sin tarjeta de crédito · Cancela cuando quieras</p>
          </div>
          <div style={{ flex: 1, minWidth: 300, display: 'flex', justifyContent: 'center' }}>
            <ChatBox />
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 5vw', background: C.bg }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>FUNCIONALIDADES</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 48 }}>Todo lo que necesitas, nada más</h2>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ padding: 28, background: C.white, borderRadius: 14, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Connections */}
      <section id="connections" style={{ padding: '80px 5vw', background: C.white }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>CONEXIONES</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 14 }}>Conecta tu stack de marketing</h2>
        <p style={{ fontSize: 15, color: C.inkMid, textAlign: 'center', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.7 }}>Una plataforma para todas tus cuentas. Conexión en segundos con OAuth — sin contraseñas, sin complicaciones.</p>
        <div style={{ maxWidth: 720, margin: '0 auto', background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '10px 24px', background: C.bg, borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.inkLight, letterSpacing: '0.1em' }}>ANUNCIOS</span>
          </div>
          {PLATFORMS.map((p, i) => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: i < PLATFORMS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 15, color: C.ink }}>{p.name}</span>
                  {p.soon && <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>Próximamente</span>}
                </div>
                <span style={{ fontSize: 13, color: C.inkLight }}>{p.desc}</span>
              </div>
              <a href={p.soon ? '#' : '/auth'} style={{ padding: '8px 18px', background: p.soon ? C.bg : C.white, color: p.soon ? C.inkLight : C.ink, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                {p.soon ? 'Próximamente' : '+ Conectar'}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" style={{ padding: '80px 5vw', background: C.bg }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>PRECIOS</p>
        <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 48 }}>Sencillo y transparente</h2>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {PLANS.map(p => (
            <div key={p.name} style={{ background: p.highlight ? C.blue : C.white, borderRadius: 16, border: `1px solid ${p.highlight ? C.blue : C.border}`, padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: p.highlight ? '#fff' : C.ink }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: p.highlight ? 'rgba(255,255,255,0.7)' : C.inkMid }}>{p.desc}</p>
              </div>
              <div>
                <span style={{ fontSize: 40, fontWeight: 800, color: p.highlight ? '#fff' : C.ink }}>${p.price}</span>
                <span style={{ fontSize: 14, color: p.highlight ? 'rgba(255,255,255,0.7)' : C.inkMid }}>/mes</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: 14, color: p.highlight ? 'rgba(255,255,255,0.9)' : C.inkMid, display: 'flex', gap: 8 }}>
                    <span style={{ color: p.highlight ? '#fff' : C.blue }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <a href="/auth" style={{ background: p.highlight ? '#fff' : C.blue, borderRadius: 10, padding: '12px', color: p.highlight ? C.blue : '#fff', fontWeight: 700, fontSize: 14, textAlign: 'center', marginTop: 'auto' }}>
                Empezar gratis
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: C.ink, padding: '40px 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: C.blue, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/><circle cx="8" cy="8" r="2" fill="white"/></svg>
          </div>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>Growlia</span>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <a href="/privacidad" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Privacidad</a>
          <a href="/terminos" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Términos</a>
        </div>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>© 2025 Growlia</span>
      </footer>
    </>
  )
}
