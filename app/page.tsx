'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.growlia.es'

const C = {
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#EFF6FF',
  ink: '#111827',
  inkMid: '#6B7280',
  inkLight: '#9CA3AF',
  border: '#E5E7EB',
  white: '#FFFFFF',
  bg: '#F9FAFB',
}

/* ─── Navbar ─────────────────────────────────────── */
function Navbar({ onLogin }: { onLogin: () => void }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
      borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 5vw', height: 64,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 32, height: 32, background: C.blue, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <circle cx="8" cy="8" r="2" fill="white"/>
          </svg>
        </div>
        <span style={{ fontWeight: 800, fontSize: 20, color: C.ink, letterSpacing: '-0.02em' }}>Growlia</span>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        {[['Agente', '#agente'], ['Conexiones', '#connections'], ['Templates', '#templates'], ['Precios', '#precios']].map(([label, href]) => (
          <a key={label} href={href} style={{ fontSize: 14, color: C.inkMid, textDecoration: 'none', fontWeight: 500 }}>{label}</a>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={onLogin} style={{ background: 'none', border: 'none', fontSize: 14, color: C.inkMid, cursor: 'pointer', fontWeight: 500 }}>
          Iniciar sesión
        </button>
        <button onClick={onLogin} style={{ background: C.blue, border: 'none', borderRadius: 8, padding: '8px 20px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Empezar gratis
        </button>
      </div>
    </nav>
  )
}

/* ─── Chat Box ───────────────────────────────────── */
interface Msg { role: 'user' | 'ai'; text: string }

function ChatBox() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'ai', text: '¡Hola! Soy Growlia, tu agente de marketing con IA. ¿En qué campaña trabajamos hoy?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/ai/chat-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'ai', text: data.response || 'Error al procesar tu consulta.' }])
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'No puedo conectar con el servidor ahora mismo.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', maxWidth: 580, width: '100%' }}>
      <div style={{ background: C.blue, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Growlia — Agente IA</span>
      </div>
      <div style={{ height: 260, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px', borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user' ? C.blue : C.bg,
              color: m.role === 'user' ? '#fff' : C.ink,
              fontSize: 13, lineHeight: 1.6,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.inkLight, animation: `bounce 1s ${i*0.15}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, display: 'flex', padding: 12, gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="¿En qué campaña trabajamos hoy?"
          style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={send} disabled={loading}
          style={{ background: C.blue, border: 'none', borderRadius: 8, padding: '10px 16px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          →
        </button>
      </div>
    </div>
  )
}

/* ─── Hero ───────────────────────────────────────── */
function SectionHero({ onCta }: { onCta: () => void }) {
  return (
    <section id="agente" style={{ padding: '80px 5vw 60px', background: C.white }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 60, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.blueLight, borderRadius: 20, padding: '6px 14px', marginBottom: 24 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.05em' }}>AGENTE IA PARA MARKETING</span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px,4.5vw,56px)', fontWeight: 800, color: C.ink, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Tu copiloto de<br />
            <span style={{ color: C.blue }}>marketing digital</span>
          </h1>
          <p style={{ fontSize: 17, color: C.inkMid, lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
            Conecta Google Ads, Meta Ads y TikTok en un solo lugar. La IA optimiza tus campañas, detecta oportunidades y genera informes automáticamente.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={onCta} style={{ background: C.blue, border: 'none', borderRadius: 10, padding: '14px 28px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Empezar gratis →
            </button>
            <button onClick={() => document.getElementById('connections')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 28px', color: C.ink, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Ver conexiones
            </button>
          </div>
          <p style={{ fontSize: 12, color: C.inkLight, marginTop: 12 }}>Sin tarjeta de crédito · Cancela cuando quieras</p>
        </div>
        <div style={{ flex: 1, minWidth: 300, display: 'flex', justifyContent: 'center' }}>
          <ChatBox />
        </div>
      </div>
    </section>
  )
}

/* ─── Connections ────────────────────────────────── */
const PLATFORMS = [
  { name: 'Google Ads', desc: 'Gestiona campañas de Google Ads', soon: false },
  { name: 'Meta Ads', desc: 'Anuncios en Facebook e Instagram', soon: false },
  { name: 'TikTok Ads', desc: 'Gestiona campañas en TikTok', soon: true },
  { name: 'LinkedIn Ads', desc: 'Anuncios B2B en LinkedIn', soon: true },
  { name: 'Microsoft Ads', desc: 'Campañas en Bing y Microsoft', soon: true },
  { name: 'Google Analytics', desc: 'Analítica web avanzada', soon: true },
]

function SectionConnections({ onCta }: { onCta: () => void }) {
  return (
    <section id="connections" style={{ padding: '80px 5vw', background: C.bg }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>CONEXIONES</p>
      <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 14 }}>
        Conecta tu stack de marketing
      </h2>
      <p style={{ fontSize: 15, color: C.inkMid, textAlign: 'center', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.7 }}>
        Una plataforma para todas tus cuentas. Conexión en segundos con OAuth — sin contraseñas, sin complicaciones.
      </p>
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
            <button onClick={p.soon ? undefined : onCta}
              style={{ padding: '8px 18px', background: p.soon ? C.bg : C.white, color: p.soon ? C.inkLight : C.ink, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: p.soon ? 'default' : 'pointer' }}>
              {p.soon ? 'Próximamente' : '+ Conectar'}
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Features ───────────────────────────────────── */
function SectionFeatures() {
  const feats = [
    { icon: '🤖', title: 'IA que trabaja por ti', desc: 'El agente analiza tus campañas, detecta anomalías y sugiere optimizaciones en tiempo real.' },
    { icon: '📊', title: 'Dashboard unificado', desc: 'Todas tus métricas de Google Ads y Meta en un solo panel. Sin cambiar de pestaña.' },
    { icon: '📝', title: 'Reportes automáticos', desc: 'Informes semanales generados por IA listos para enviar a tu cliente o equipo.' },
    { icon: '🔗', title: 'Conexión sin código', desc: 'OAuth con un click. Sin APIs manuales, sin contraseñas compartidas.' },
  ]
  return (
    <section style={{ padding: '80px 5vw', background: C.white }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>FUNCIONALIDADES</p>
      <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 48 }}>
        Todo lo que necesitas, nada más
      </h2>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
        {feats.map(f => (
          <div key={f.title} style={{ padding: 28, background: C.bg, borderRadius: 14, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: C.ink, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.6 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Pricing ────────────────────────────────────── */
function SectionPricing({ onCta }: { onCta: () => void }) {
  const plans = [
    { name: 'Starter', price: 49, desc: 'Para freelancers y consultores', features: ['2 cuentas de ads', 'Agente IA básico', 'Reportes mensuales', 'Soporte email'] },
    { name: 'Growth', price: 99, desc: 'Para agencias pequeñas', features: ['10 cuentas de ads', 'Agente IA avanzado', 'Reportes semanales', 'Dashboard multi-cliente', 'Soporte prioritario'], highlight: true },
    { name: 'Agency', price: 249, desc: 'Para agencias y equipos grandes', features: ['Cuentas ilimitadas', 'Agente IA premium', 'Reportes diarios', 'White-label', 'Onboarding dedicado'] },
  ]
  return (
    <section id="precios" style={{ padding: '80px 5vw', background: C.bg }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>PRECIOS</p>
      <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', marginBottom: 48 }}>
        Sencillo y transparente
      </h2>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
        {plans.map(p => (
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
            <button onClick={onCta} style={{ background: p.highlight ? '#fff' : C.blue, border: 'none', borderRadius: 10, padding: '12px', color: p.highlight ? C.blue : '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 'auto' }}>
              Empezar gratis
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: C.ink, padding: '40px 5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, background: C.blue, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <circle cx="8" cy="8" r="2" fill="white"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>Growlia</span>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        {[['Privacidad', '/privacidad'], ['Términos', '/terminos']].map(([label, href]) => (
          <a key={label} href={href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>{label}</a>
        ))}
      </div>
      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>© 2025 Growlia</span>
    </footer>
  )
}

/* ─── Modal Auth ─────────────────────────────────── */
function ModalAuth({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 20, padding: 40, maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, background: C.blue, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
            <circle cx="8" cy="8" r="2" fill="white"/>
          </svg>
        </div>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: C.ink, marginBottom: 8 }}>Empieza con Growlia</h2>
        <p style={{ fontSize: 14, color: C.inkMid, marginBottom: 28, lineHeight: 1.6 }}>Crea tu cuenta gratuita y conecta tus cuentas de ads en segundos.</p>
        <button onClick={() => router.push('/auth')}
          style={{ width: '100%', background: C.blue, border: 'none', borderRadius: 10, padding: '14px', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 12 }}>
          Crear cuenta gratis
        </button>
        <button onClick={() => router.push('/auth')}
          style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px', color: C.ink, fontWeight: 600, fontSize: 15, cursor: 'pointer', marginBottom: 20 }}>
          Ya tengo cuenta — Iniciar sesión
        </button>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 13, color: C.inkLight, cursor: 'pointer' }}>Cerrar</button>
      </div>
    </div>
  )
}

/* ─── App ────────────────────────────────────────── */
export default function Home() {
  const [showModal, setShowModal] = useState(false)
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
      `}</style>
      <Navbar onLogin={() => setShowModal(true)} />
      <SectionHero onCta={() => setShowModal(true)} />
      <SectionFeatures />
      <SectionConnections onCta={() => setShowModal(true)} />
      <SectionPricing onCta={() => setShowModal(true)} />
      <Footer />
      {showModal && <ModalAuth onClose={() => setShowModal(false)} />}
    </>
  )
}
