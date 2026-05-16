'use client'

import { useState, useEffect, useRef } from 'react'

/* ═══════════════════════════════════════════════════════════
   GROWLIA — Landing con Chat IA Funcional + OAuth Real
═══════════════════════════════════════════════════════════ */

const API_URL = 'https://api.growlia.es'

const C = {
  white:     '#FFFFFF',
  bg:        '#F8F9FC',
  bgDot:     '#F4F6FF',
  border:    '#E5E9F0',
  borderHov: '#C8D0E8',
  blue:      '#2563EB',
  blueDark:  '#1D4ED8',
  blueLight: '#EFF6FF',
  blueMid:   '#DBEAFE',
  blueGlow:  'rgba(37,99,235,0.18)',
  green:     '#10B981',
  greenL:    '#ECFDF5',
  amber:     '#F59E0B',
  red:       '#EF4444',
  ink:       '#0F172A',
  inkMid:    '#64748B',
  inkLight:  '#94A3B8',
  inkGhost:  '#E2E8F0',
  shadow:    '0 1px 4px rgba(15,23,42,0.08)',
  shadowMd:  '0 4px 20px rgba(15,23,42,0.10)',
  shadowLg:  '0 16px 48px rgba(37,99,235,0.14)',
}

const SVG: Record<string, JSX.Element> = {
  google_ads: <svg viewBox="0 0 48 48" width="100%" height="100%"><path fill="none" stroke="#4285F4" strokeWidth="8" strokeLinejoin="round" d="M6 38 L24 6 L42 38"/><circle cx="38" cy="38" r="6" fill="#34A853"/><circle cx="10" cy="38" r="6" fill="#FBBC04"/></svg>,
  meta: <svg viewBox="0 0 48 48" width="100%" height="100%"><path fill="#0082FB" d="M8 28c0 5.5 3 9.5 7.5 9.5 2.8 0 4.8-1.4 7.5-5.5C25.7 36.1 27.7 37.5 30.5 37.5 35 37.5 38 33.5 38 28c0-5.5-3-11-7.5-11-2.8 0-4.8 1.4-7.5 5.5C20.3 18.4 18.3 17 15.5 17 11 17 8 22.5 8 28z"/></svg>,
  google_analytics: <svg viewBox="0 0 48 48" width="100%" height="100%"><rect x="30" y="8" width="10" height="32" rx="5" fill="#F9AB00"/><rect x="19" y="20" width="10" height="20" rx="5" fill="#E37400"/><circle cx="14" cy="38" r="5" fill="#E37400"/></svg>,
  tiktok: <svg viewBox="0 0 48 48" width="100%" height="100%"><path d="M37 14.5a8.5 8.5 0 01-8.5-8.5h-5.5v22a4 4 0 11-4-4v-6a10 10 0 1010 10V22c2 1.5 4.5 2 8 2v-5.5a8.5 8.5 0 01-8.5-2z" fill="#69C9D0" opacity=".7"/><path d="M35 12.5a8.5 8.5 0 01-8.5-8.5h-5.5v22a4 4 0 11-4-4v-6a10 10 0 1010 10V20c2 1.5 4.5 2 8 2v-5.5a8.5 8.5 0 01-8.5-2z" fill="#EE1D52" opacity=".7"/><path d="M36 13.5a8.5 8.5 0 01-8.5-8.5h-5.5v22a4 4 0 11-4-4v-6a10 10 0 1010 10V21c2 1.5 4.5 2 8 2v-5.5a8.5 8.5 0 01-8.5-2z" fill="#010101"/></svg>,
  linkedin: <svg viewBox="0 0 48 48" width="100%" height="100%"><rect width="48" height="48" rx="8" fill="#0A66C2"/><path fill="#fff" d="M14 20a4 4 0 100-8 4 4 0 000 8zm-3 4h6v18h-6V24zm10 0h5.7v2.5c.8-1.5 2.8-3 5.8-3 6.2 0 7.5 4 7.5 9.3V42H35v-8.3c0-2-.04-4.5-2.8-4.5-2.8 0-3.2 2.1-3.2 4.4V42H23V24z"/></svg>,
  microsoft_ads: <svg viewBox="0 0 48 48" width="100%" height="100%"><rect x="4" y="4" width="18" height="18" rx="2" fill="#F25022"/><rect x="26" y="4" width="18" height="18" rx="2" fill="#7FBA00"/><rect x="4" y="26" width="18" height="18" rx="2" fill="#00A4EF"/><rect x="26" y="26" width="18" height="18" rx="2" fill="#FFB900"/></svg>,
  google_sheets: <svg viewBox="0 0 48 48" width="100%" height="100%"><path fill="#34A853" d="M30 4H14a4 4 0 00-4 4v32a4 4 0 004 4h20a4 4 0 004-4V18L30 4z"/><path fill="#188038" d="M30 4v14h14L30 4z"/><path fill="#fff" d="M14 26h20v2H14zm0 5h20v2H14zm0 5h14v2H14zm0-15h20v2H14z"/></svg>,
  google_slides: <svg viewBox="0 0 48 48" width="100%" height="100%"><path fill="#FBBC04" d="M30 4H14a4 4 0 00-4 4v32a4 4 0 004 4h20a4 4 0 004-4V18L30 4z"/><path fill="#F29900" d="M30 4v14h14L30 4z"/><rect x="15" y="22" width="18" height="14" rx="1" fill="#fff"/></svg>,
  shopify: <svg viewBox="0 0 48 48" width="100%" height="100%"><path fill="#95BF47" d="M33 9s-.5-.4-1.4-.4c-.5 0-1.1.3-1.6.7C28.2 7.5 26 6.5 22 6.5c-.9 0-1.9.1-2.8.3A4.5 4.5 0 0015.3 10c-1.8.5-3.7 2-4.6 4C8 18 7.5 22 7.5 24.5 7.5 34 13 42 24 42s17-7.5 17-15.5c0-7.5-3.5-15-8-17.5z"/></svg>,
  bigquery: <svg viewBox="0 0 48 48" width="100%" height="100%"><path fill="#4285F4" d="M24 6L6 17v14l18 11 18-11V17L24 6z" opacity=".4"/><path fill="#4285F4" d="M6 17l18 11V6L6 17z"/><path fill="#1A73E8" d="M24 28l18-11L24 6v22z"/></svg>,
  hubspot: <svg viewBox="0 0 48 48" width="100%" height="100%"><circle cx="24" cy="24" r="22" fill="#FF7A59"/><path fill="#fff" d="M30 16v-4h-6v4a6 6 0 00-4 5.5 6 6 0 003 5.2V34h8v-7.3A6 6 0 0034 21.5 6 6 0 0030 16zm-3 10a3 3 0 110-6 3 3 0 010 6z"/></svg>,
  klaviyo: <svg viewBox="0 0 48 48" width="100%" height="100%"><circle cx="24" cy="24" r="22" fill="#1C1C1C"/><path fill="#fff" d="M14 14h6v20h-6zm8 0h12l-6 10 6 10H22V14z"/></svg>,
}

function Logo({ id, size = 26 }: { id: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {SVG[id] || <div style={{ width: size, height: size, borderRadius: 4, background: C.inkGhost }} />}
    </div>
  )
}

const CONNECTIONS_DATA = [
  { id: 'google_ads',       name: 'Google Ads',           desc: 'Gestiona campañas de Google Ads',           cat: 'Anuncios' },
  { id: 'meta',             name: 'Meta Ads',             desc: 'Anuncios en Facebook e Instagram',          cat: 'Anuncios' },
  { id: 'google_analytics', name: 'Google Analytics 4',  desc: 'Analiza tráfico y conversiones',            cat: 'Analítica' },
  { id: 'tiktok',           name: 'TikTok Ads',           desc: 'Gestiona campañas en TikTok',               cat: 'Anuncios' },
  { id: 'linkedin',         name: 'LinkedIn Ads',         desc: 'Anuncios B2B en LinkedIn',                  cat: 'Anuncios' },
  { id: 'microsoft_ads',    name: 'Microsoft Ads',        desc: 'Campañas en Bing y Microsoft',              cat: 'Anuncios' },
  { id: 'google_sheets',    name: 'Google Sheets',        desc: 'Lee y escribe datos automáticamente',       cat: 'Productividad' },
  { id: 'google_slides',    name: 'Google Slides',        desc: 'Genera presentaciones automatizadas',       cat: 'Productividad' },
  { id: 'shopify',          name: 'Shopify',              desc: 'Datos de tu tienda en tiempo real',         cat: 'eCommerce' },
  { id: 'bigquery',         name: 'BigQuery',             desc: 'Análisis de big data',                      cat: 'Datos' },
  { id: 'hubspot',          name: 'HubSpot',              desc: 'CRM, contactos y deals',                    cat: 'CRM' },
  { id: 'klaviyo',          name: 'Klaviyo',              desc: 'Email marketing automation',                cat: 'Email' },
]

const TEMPLATES_DATA = [
  { id: 1, title: 'Informe mensual Google + Meta',   apps: ['google_ads','meta','google_slides'],  tag: 'Reportes',     desc: 'Informe consolidado con insights de IA.' },
  { id: 2, title: 'Carga masiva de anuncios Meta',   apps: ['meta','google_sheets'],               tag: 'Creatividad',  desc: 'Crea decenas de anuncios desde un Sheet.' },
  { id: 3, title: 'Auditoría completa Google Ads',   apps: ['google_ads','google_sheets'],         tag: 'Auditoría',    desc: 'Auditoría con 40+ chequeos automáticos.' },
  { id: 4, title: 'Espía de anuncios competencia',   apps: ['meta','tiktok','linkedin'],           tag: 'Creatividad',  desc: 'Exporta anuncios de competidores.' },
  { id: 5, title: 'Reporte cross-channel PPC',       apps: ['meta','google_ads','tiktok'],         tag: 'Reportes',     desc: 'KPIs unificados con IA en un solo dashboard.' },
  { id: 6, title: 'Auditoría completa Meta Ads',     apps: ['meta','google_sheets'],               tag: 'Auditoría',    desc: 'Auditoría Meta con 100+ datapoints.' },
  { id: 7, title: 'Reporte diario Shopify',          apps: ['shopify','google_sheets'],            tag: 'Reportes',     desc: 'Insights de ventas cada mañana.' },
  { id: 8, title: 'Auditoría GA4 Analytics',         apps: ['google_analytics','google_sheets'],   tag: 'Auditoría',    desc: 'Detecta gaps y errores de tracking.' },
  { id: 9, title: 'Pipeline Meta a BigQuery',        apps: ['meta','bigquery'],                    tag: 'Datos',        desc: 'Sincroniza datos de Meta diariamente.' },
]

const TAG_C: Record<string, { bg: string; color: string }> = {
  'Reportes':     { bg: '#EFF6FF', color: '#2563EB' },
  'Creatividad':  { bg: '#FDF4FF', color: '#9333EA' },
  'Auditoría':    { bg: '#ECFDF5', color: '#10B981' },
  'Datos':        { bg: '#FFF7ED', color: '#EA580C' },
}

const PLANS = [
  { name: 'Starter', price: 49,  priceA: 39,  desc: 'Para freelancers y marketers solo',       popular: false,
    features: ['1.500 créditos IA/mes','1 usuario','3 cuentas publicitarias','Soporte estándar','Historial de 7 días'] },
  { name: 'Growth',  price: 99,  priceA: 79,  desc: 'Para PYMES y agencias pequeñas',           popular: true,
    features: ['10.000 créditos IA/mes','Hasta 5 usuarios','Cuentas ilimitadas','Soporte prioritario','Historial de 30 días','Workflows personalizados','Acceso anticipado'] },
  { name: 'Agency',  price: 249, priceA: 199, desc: 'Para agencias con múltiples clientes',     popular: false,
    features: ['50.000 créditos IA/mes','Usuarios ilimitados','Cuentas ilimitadas','Soporte dedicado','Historial de 90 días','Reportes white-label','Acceso a API'] },
]

export default function Home() {
  const [modal, setModal] = useState(false)

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", color: C.ink, background: C.white, minHeight: '100vh' }}>
      <Nav onCTA={() => setModal(true)} />
      <Hero onCTA={() => setModal(true)} />
      <LogoStrip />
      <SectionConnections onConnect={() => setModal(true)} />
      <SectionStats />
      <SectionTemplates />
      <SectionPricing onCTA={() => setModal(true)} />
      <CTAFinal onCTA={() => setModal(true)} />
      <Footer />
      {modal && <RegisterModal onClose={() => setModal(false)} />}
    </div>
  )
}

function Nav({ onCTA }: { onCTA: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      height: 60, display: 'flex', alignItems: 'center', padding: '0 5vw',
      background: scrolled ? 'rgba(255,255,255,0.96)' : '#fff',
      backdropFilter: 'blur(12px)',
      borderBottom: scrolled ? `1px solid ${C.border}` : '1px solid transparent',
      transition: 'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 2px 8px ${C.blueGlow}` }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
        </div>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em' }}>
          Grow<span style={{ color: C.blue }}>lia</span>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {[['Agente','#agent'],['Conexiones','#connections'],['Templates','#templates'],['Precios','#pricing']].map(([l,h])=>(
          <a key={l} href={h} style={{ fontSize: 14, color: C.inkMid, textDecoration: 'none', fontWeight: 500 }}>{l}</a>
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'center' }}>
        <a href="#login" style={{ fontSize: 14, color: C.inkMid, textDecoration: 'none' }}>Iniciar sesión</a>
        <button onClick={onCTA} style={{ background: C.blue, border: 'none', borderRadius: 8, padding: '8px 18px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: `0 2px 8px ${C.blueGlow}` }}>Empezar gratis</button>
      </div>
    </nav>
  )
}

function Hero({ onCTA }: { onCTA: () => void }) {
  const [input, setInput] = useState('')
  const [tIdx, setTIdx] = useState(0)
  const [tText, setTText] = useState('')
  const [typing, setTyping] = useState(true)
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)

  const TIPS = [
    'Crea una campaña de Google Search para mi tienda online de ropa...',
    'Analiza el ROAS de mis Meta Ads en los últimos 30 días...',
    'Pausa campañas con ROAS por debajo de 2x automáticamente...',
    'Crea un informe mensual en Google Slides con KPIs...',
  ]

  useEffect(() => {
    if (messages.length > 0) return
    const t = TIPS[tIdx % TIPS.length]
    let i = 0
    setTText('')
    setTyping(true)
    const iv = setInterval(() => {
      if (i < t.length) setTText(t.slice(0, ++i))
      else { clearInterval(iv); setTyping(false); setTimeout(() => setTIdx(x => x+1), 2600) }
    }, 36)
    return () => clearInterval(iv)
  }, [tIdx, messages.length])

  const sendMessage = async (text: string) => {
    const message = (text || input).trim()
    if (!message || loading) return

    setMessages(prev => [...prev, { role: 'user', content: message }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/ai/chat-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) throw new Error('Error del servidor')
      const data = await res.json()

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error. Inténtalo de nuevo en un momento.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{
      paddingTop: 80, minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '100px 5vw 60px',
      backgroundImage: `radial-gradient(${C.borderHov} 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.blueLight, border: `1px solid ${C.blueMid}`, borderRadius: 99, padding: '5px 14px', marginBottom: 22 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.blue, display: 'inline-block' }}/>
        <span style={{ fontSize: 12, color: C.blue, fontWeight: 700, letterSpacing: '0.05em' }}>AGENTE IA DE MARKETING PARA PYMES</span>
      </div>
      <h1 style={{ fontSize: 'clamp(34px,5.5vw,66px)', fontWeight: 800, color: C.ink, textAlign: 'center', lineHeight: 1.1, letterSpacing: '-0.04em', maxWidth: 800, marginBottom: 14 }}>
        ¿En qué <span style={{ color: C.blue }}>campaña</span> trabajamos hoy?
      </h1>
      <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: C.inkMid, textAlign: 'center', maxWidth: 520, lineHeight: 1.75, marginBottom: 36 }}>
        Tu Agente de Marketing IA que crea, analiza y optimiza tus campañas en Google Ads, Meta Ads, TikTok y más.
      </p>

      <div style={{ width: '100%', maxWidth: 720, background: C.white, borderRadius: 20, border: `1.5px solid ${C.border}`, boxShadow: C.shadowLg, overflow: 'hidden', marginBottom: 14 }}>

        {messages.length > 0 && (
          <div style={{ maxHeight: 360, overflowY: 'auto', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ fontSize: 11, color: C.inkLight, fontWeight: 600, marginBottom: 4 }}>
                  {m.role === 'user' ? 'Tú' : 'Growlia AI'}
                </div>
                <div style={{
                  maxWidth: '85%',
                  background: m.role === 'user' ? C.blueLight : C.bg,
                  border: `1px solid ${m.role === 'user' ? C.blueMid : C.border}`,
                  borderRadius: 12,
                  padding: '10px 14px',
                  fontSize: 14,
                  color: C.ink,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ fontSize: 11, color: C.inkLight, fontWeight: 600, marginBottom: 4 }}>Growlia AI</div>
                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 4 }}>
                  {[0, 0.2, 0.4].map(d => (
                    <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: C.inkLight, animation: `pulse 1.4s ${d}s infinite` }}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ padding: '16px 20px', position: 'relative', minHeight: 100 }}>
          {messages.length === 0 && !input && (
            <div style={{ position: 'absolute', top: 16, left: 20, fontSize: 15, color: C.inkLight, pointerEvents: 'none', maxWidth: '85%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tText}{typing && <span style={{ borderRight: `2px solid ${C.blue}`, animation: 'blink 1s step-end infinite' }}>&nbsp;</span>}
            </div>
          )}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage('') } }}
            placeholder={messages.length > 0 ? 'Escribe otra pregunta...' : ''}
            style={{ width: '100%', minHeight: 70, resize: 'none', border: 'none', outline: 'none', fontSize: 15, color: C.ink, background: 'transparent', fontFamily: 'inherit', paddingRight: 52 }}
          />
          <button onClick={() => sendMessage('')} disabled={loading} style={{ position: 'absolute', right: 16, bottom: 16, width: 38, height: 38, borderRadius: '50%', background: loading ? C.inkLight : C.blue, border: 'none', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading ? (
              <div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 52 }}>
        {[
          { id: 'google_ads', label: 'Crear campaña Google', prompt: 'Quiero crear una campaña de Google Ads para vender zapatillas online. Recomiéndame estructura y presupuesto inicial.' },
          { id: 'meta', label: 'Analizar Meta Ads', prompt: 'Mi ROAS en Meta Ads bajó del 4x al 2x este mes. ¿Qué pasos sigo para diagnosticar el problema?' },
          { id: 'tiktok', label: 'Optimizar TikTok', prompt: '¿Cómo optimizo TikTok Ads para conversiones? Mi CPA está muy alto.' },
          { id: 'google_ads', label: 'Generar informe', prompt: 'Cómo estructurarías un informe mensual de performance de paid media para presentar al cliente.' },
        ].map(q => (
          <button key={q.label} onClick={() => sendMessage(q.prompt)} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.white, border: `1px solid ${C.border}`, borderRadius: 99, padding: '6px 14px', fontSize: 12, fontWeight: 600, color: C.inkMid, cursor: loading ? 'wait' : 'pointer' }}>
            <Logo id={q.id} size={16}/>
            {q.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex' }}>
          {['CM','LP','SR','MG'].map((x, i) => (
            <div key={x} style={{ width: 30, height: 30, borderRadius: '50%', background: ['#2563EB','#10B981','#F59E0B','#8B5CF6'][i], border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff' }}>{x}</div>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', gap: 1 }}>
            {[1,2,3,4,5].map(s => <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
          </div>
          <p style={{ fontSize: 12, color: C.inkMid }}>+2.400 marketers escalando con IA</p>
        </div>
      </div>
    </section>
  )
}

function LogoStrip() {
  return (
    <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '24px 5vw' }}>
      <p style={{ textAlign: 'center', fontSize: 11, color: C.inkLight, fontWeight: 600, letterSpacing: '0.1em', marginBottom: 16 }}>SE INTEGRA CON TUS PLATAFORMAS</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {CONNECTIONS_DATA.map(c => (
          <div key={c.id} title={c.name} style={{ width: 44, height: 44, borderRadius: 10, border: `1px solid ${C.border}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, cursor: 'default' }}>
            <Logo id={c.id} size={32}/>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionConnections({ onConnect }: { onConnect: () => void }) {
  const cats = ['Anuncios','Analítica','Productividad','eCommerce','Datos','CRM','Email']
  
  const handleGoogleConnect = () => {
    const clientId = '708427883725-33ql01ep5aa8e6od515er94j7rm7i81m.apps.googleusercontent.com'
    const redirectUri = encodeURIComponent('https://api.growlia.es/api/auth/google/callback')
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent`
  }

  const handleMetaConnect = () => {
    const appId = '859352396692840'
    const redirectUri = encodeURIComponent('https://api.growlia.es/api/auth/meta/callback')
    const scopes = encodeURIComponent('ads_read,ads_management,business_management')
    window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&state=demo`
  }

  return (
    <section id="connections" style={{ padding: '80px 5vw', background: C.white }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>CONEXIONES</p>
      <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>Conecta tu stack de marketing</h2>
      <p style={{ fontSize: 15, color: C.inkMid, textAlign: 'center', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.7 }}>Una plataforma para todas tus cuentas. Conexión en segundos con OAuth — sin contraseñas, sin complicaciones.</p>

      <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {cats.map(cat => {
          const items = CONNECTIONS_DATA.filter(c => c.cat === cat)
          if (!items.length) return null
          return (
            <div key={cat}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.inkLight, letterSpacing: '0.08em', marginBottom: 10 }}>{cat.toUpperCase()}</div>
              <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
                {items.map((conn, idx) => (
                  <div key={conn.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', background: C.white, borderBottom: idx < items.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, border: `1px solid ${C.border}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 5 }}>
                      <Logo id={conn.id} size={28}/>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{conn.name}</div>
                      <div style={{ fontSize: 12, color: C.inkMid }}>{conn.desc}</div>
                    </div>
                    <button 
                      onClick={() => {
                        if (conn.id === 'google_ads') handleGoogleConnect()
                        else if (conn.id === 'meta') handleMetaConnect()
                        else onConnect()
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, color: C.ink, cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 16 }}>+</span>Conectar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SectionStats() {
  const stats = [
    { v: '+2.400', l: 'Marketers usando Growlia' },
    { v: '300+', l: 'Operaciones de marketing' },
    { v: '4.1×', l: 'Mejora media de ROAS' },
    { v: '< 2min', l: 'Tiempo de configuración' },
  ]
  return (
    <div style={{ background: C.blue, padding: '48px 5vw' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, maxWidth: 800, margin: '0 auto', background: 'rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ padding: '28px 20px', textAlign: 'center', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', marginBottom: 4 }}>{s.v}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionTemplates() {
  return (
    <section id="templates" style={{ padding: '80px 5vw', backgroundImage: `radial-gradient(${C.borderHov} 1px, transparent 1px)`, backgroundSize: '24px 24px', background: C.bgDot }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>WORKFLOWS Y TEMPLATES</p>
      <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>
        <span style={{ color: C.blue }}>Templates</span> de marketing automation
      </h2>
      <p style={{ fontSize: 15, color: C.inkMid, textAlign: 'center', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.7 }}>Automatizaciones pre-construidas listas para ejecutar en minutos. Sin código.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 14, maxWidth: 920, margin: '0 auto' }}>
        {TEMPLATES_DATA.map(tmpl => {
          const tc = TAG_C[tmpl.tag] || { bg: C.bg, color: C.inkMid }
          return (
            <div key={tmpl.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
              <div style={{ padding: '14px 14px 8px', display: 'flex', gap: 5 }}>
                {tmpl.apps.slice(0, 3).map(a => (
                  <div key={a} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`, background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3 }}>
                    <Logo id={a} size={22}/>
                  </div>
                ))}
              </div>
              <div style={{ padding: '4px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 6, lineHeight: 1.4 }}>{tmpl.title}</h3>
                <p style={{ fontSize: 12, color: C.inkMid, lineHeight: 1.6, flex: 1, marginBottom: 12 }}>{tmpl.desc}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: tc.color, background: tc.bg, borderRadius: 99, padding: '2px 9px' }}>{tmpl.tag}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SectionPricing({ onCTA }: { onCTA: () => void }) {
  const [anual, setAnual] = useState(true)
  return (
    <section id="pricing" style={{ padding: '80px 5vw', background: C.white }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: C.blue, letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>PRECIOS</p>
      <h2 style={{ fontSize: 'clamp(26px,3.5vw,44px)', fontWeight: 800, color: C.ink, textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 14 }}>Elige tu plan</h2>
      <p style={{ fontSize: 15, color: C.inkMid, textAlign: 'center', marginBottom: 8 }}>Empieza gratis con 14 días de prueba.</p>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40, marginTop: 28 }}>
        <div style={{ display: 'inline-flex', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 4, gap: 4 }}>
          {[['Mensual', false], ['Anual', true]].map(([l, v]: any) => (
            <button key={l} onClick={() => setAnual(v)} style={{ background: anual === v ? C.blue : 'transparent', border: 'none', borderRadius: 7, padding: '7px 20px', fontSize: 13, fontWeight: 700, color: anual === v ? '#fff' : C.inkMid, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              {l}{v && <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 800 }}>-20%</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 16, maxWidth: 900, margin: '0 auto' }}>
        {PLANS.map(p => (
          <div key={p.name} style={{ background: C.white, border: `${p.popular ? '2px' : '1px'} solid ${p.popular ? C.blue : C.border}`, borderRadius: 16, padding: '28px 24px', position: 'relative' }}>
            {p.popular && <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: C.blue, color: '#fff', borderRadius: 99, padding: '3px 16px', fontSize: 12, fontWeight: 700 }}>Más popular</div>}
            <h3 style={{ fontSize: 19, fontWeight: 800, color: C.ink, marginBottom: 4 }}>{p.name}</h3>
            <p style={{ fontSize: 13, color: C.inkMid, marginBottom: 20 }}>{p.desc}</p>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: C.ink, letterSpacing: '-0.04em' }}>€{anual ? p.priceA : p.price}</span>
              <span style={{ fontSize: 14, color: C.inkMid }}>/mes</span>
            </div>
            <button onClick={onCTA} style={{ width: '100%', background: p.popular ? C.blue : 'transparent', border: `1px solid ${p.popular ? 'transparent' : C.border}`, borderRadius: 10, padding: '11px', color: p.popular ? '#fff' : C.blue, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 20 }}>
              Empezar gratis
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {p.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke={C.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span style={{ fontSize: 13, color: C.inkMid }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function CTAFinal({ onCTA }: { onCTA: () => void }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #1D4ED8 100%)`, padding: '72px 5vw', textAlign: 'center' }}>
      <h2 style={{ fontSize: 'clamp(26px,4vw,48px)', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: 14 }}>¿Listo para automatizar tu marketing?</h2>
      <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32, maxWidth: 440, margin: '0 auto 32px' }}>Regístrate ahora y deja que Growlia se ocupe del trabajo manual.</p>
      <button onClick={onCTA} style={{ background: '#fff', border: 'none', borderRadius: 12, padding: '14px 36px', color: C.blue, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
        Empezar gratis →
      </button>
    </div>
  )
}

function Footer() {
  return (
    <footer style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: '52px 5vw 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>
            Grow<span style={{ color: C.blue }}>lia</span>
          </span>
        </div>
        <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.7, maxWidth: 320, margin: '0 auto' }}>Automatizaciones de marketing con IA y agentes inteligentes para PYMES y agencias.</p>
      </div>
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, textAlign: 'center', maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontSize: 12, color: C.inkLight }}>Hecho con ❤️ por marketers, para marketers. © 2025 Growlia.</p>
      </div>
    </footer>
  )
}

function RegisterModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.white, borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 24px 80px rgba(15,23,42,0.22)', overflow: 'hidden', animation: 'fadeUp 0.25s ease' }}>
        <div style={{ padding: '18px 24px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/></svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.ink, flex: 1 }}>Growlia</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.inkLight, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ textAlign: 'center', marginBottom: 4 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 4 }}>Únete a la lista de espera</h3>
                <p style={{ fontSize: 13, color: C.inkMid }}>Te avisaremos en cuanto Growlia esté disponible</p>
              </div>
              {[
                { k: 'nombre', l: 'Tu nombre', ph: 'María García' },
                { k: 'email', l: 'Email', ph: 'maria@empresa.com' },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.inkMid, display: 'block', marginBottom: 5 }}>{f.l}</label>
                  <input type='text' placeholder={f.ph} value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                    style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 14px', fontSize: 14, color: C.ink, background: C.bg, outline: 'none', boxSizing: 'border-box' }}/>
                </div>
              ))}
              <button onClick={() => { if (form.email && form.nombre) setStep(2) }} style={{ background: C.blue, border: 'none', borderRadius: 12, padding: '12px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: form.email && form.nombre ? 1 : 0.5, marginTop: 4 }}>Apuntarme →</button>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center', padding: '12px 0' }}>
              <div style={{ fontSize: 52 }}>🎉</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: C.ink }}>¡Bienvenido a Growlia!</h3>
              <p style={{ fontSize: 14, color: C.inkMid, lineHeight: 1.6 }}>
                Te hemos añadido a la lista. Recibirás un email en cuanto puedas conectar tus cuentas reales de Meta y Google Ads.
              </p>
              <button onClick={onClose} style={{ background: C.blue, border: 'none', borderRadius: 12, padding: '12px 32px', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%' }}>Entendido</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
