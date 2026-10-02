'use client'

import { useEffect, useRef, useState } from 'react'

function Mark() {
  return (
    <span className="g-mark" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
    </span>
  )
}

// Captura del producto: lo que el cliente ve cada mañana
function ProductShot() {
  return (
    <div className="l-shot" aria-label="Ejemplo del resumen diario de Growlia">
      <p className="g-muted">Martes, 14 de octubre</p>
      <p style={{ fontSize: 22, fontWeight: 650, letterSpacing: '-0.03em', marginTop: 4 }}>Buenas noticias: hay oportunidades para crecer</p>
      <p className="num" style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 10 }}>
        Ayer invertiste 312 € y conseguiste 24 conversiones a 13,00 € cada una. Frente a tu media de la semana: coste por conversión −9%.
      </p>
      <div className="g-panel g-kpis" style={{ marginTop: 16, gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {[['Inversión', '2.140 €', '+4%', 'var(--ink-3)'], ['Conversiones', '168', '+12%', 'var(--pos)'], ['Coste por conv.', '12,74 €', '−7%', 'var(--pos)']].map(([l, v, c, col]) => (
          <div key={l} className="g-kpi" style={{ padding: '14px 16px' }}>
            <div className="g-kpi-label" style={{ fontSize: 12 }}>{l}</div>
            <div className="g-kpi-value" style={{ fontSize: 20 }}>{v}</div>
            <span className="num" style={{ fontSize: 12, color: col, fontWeight: 550 }}>{c}</span>
          </div>
        ))}
      </div>
      <div className="g-panel" style={{ marginTop: 12, padding: 16 }}>
        <p className="g-muted" style={{ fontSize: 12 }}>Google Ads, Search Marca</p>
        <p className="num" style={{ fontWeight: 600, marginTop: 2 }}>Subir el presupuesto diario de 40,00 € a 48,00 €</p>
        <p style={{ color: 'var(--ink-2)', fontSize: 13, marginTop: 4 }}>Pierde el 31% de las impresiones por falta de presupuesto, con un CPA un 38% mejor que la media.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <span className="g-btn g-btn-primary g-btn-sm" aria-hidden>Aprobar y aplicar</span>
          <span className="g-btn g-btn-sm" aria-hidden>Descartar</span>
        </div>
      </div>
    </div>
  )
}

function DemoChat() {
  const [msgs, setMsgs] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { if (msgs.length) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [msgs, loading])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const res = await fetch('https://api.growlia.es/api/ai/chat-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'ai', text: data.response || data.error || 'No se ha podido responder.' }])
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'No se ha podido conectar. Vuelve a intentarlo.' }])
    }
    setLoading(false)
  }

  const examples = ['¿Cuándo debería subir el presupuesto de una campaña?', '¿Por qué sube mi coste por lead en Meta?']
  return (
    <div className="g-panel" style={{ padding: 20 }}>
      {msgs.length === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          {examples.map(e => <button key={e} className="g-chip" onClick={() => send(e)}>{e}</button>)}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 340, overflowY: 'auto' }}>
        {msgs.map((m, i) => <div key={i} className={`g-msg ${m.role === 'user' ? 'g-msg-user' : 'g-msg-ai'}`} style={{ fontSize: 14 }}>{m.text}</div>)}
        {loading && <div className="g-msg g-msg-ai" style={{ color: 'var(--ink-3)', fontSize: 14 }}>Pensando…</div>}
        <div ref={endRef} />
      </div>
      <form onSubmit={e => { e.preventDefault(); send(input) }} style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <input className="g-input" value={input} onChange={e => setInput(e.target.value)} maxLength={500} placeholder="Pregunta sobre Google Ads o Meta Ads" aria-label="Pregunta" />
        <button className="g-btn g-btn-dark" type="submit" disabled={loading || !input.trim()}>Preguntar</button>
      </form>
    </div>
  )
}

const RULES: [string, string][] = [
  ['Primero la medición', 'Si una cuenta entera deja de convertir de golpe, avisa de tracking roto y no toca ninguna campaña. Casi nunca es rendimiento.'],
  ['Respeta el aprendizaje', 'No modifica campañas de Meta en fase de aprendizaje ni toca la misma campaña dos veces en tres días.'],
  ['Lee la cuota de impresiones', 'Distingue una campaña limitada por presupuesto, que conviene escalar, de una limitada por calidad, donde más dinero no sirve.'],
  ['Cambios graduales', 'Nunca mueve más del 20% del presupuesto de una vez, para no reiniciar los algoritmos de Google y Meta.'],
  ['Controla el mes', 'Proyecta el cierre de mes y no propone subidas si vas a pasarte del presupuesto que has fijado.'],
]

export default function Home() {
  return (
    <>
      <header className="l-nav">
        <div className="l-wrap l-nav-row">
          <a href="/" className="g-brand" style={{ padding: 0, textDecoration: 'none', color: 'var(--ink)' }}><Mark />Growlia</a>
          <nav className="l-nav-links" aria-label="Secciones">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#criterio">Criterio</a>
            <a href="#confianza">Seguridad</a>
          </nav>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="/auth" className="g-btn" style={{ textDecoration: 'none', border: 0 }}>Iniciar sesión</a>
            <a href="/auth" className="g-btn g-btn-dark" style={{ textDecoration: 'none' }}>Crear cuenta</a>
          </div>
        </div>
      </header>

      <main>
        <section className="l-wrap l-hero">
          <div>
            <h1 className="l-title">Tu performance manager, cada mañana</h1>
            <p className="l-lead">Growlia revisa tus campañas de Google Ads y Meta Ads todos los días, te explica qué ha pasado y te propone cambios concretos. Tú apruebas con un clic.</p>
            <div className="l-cta">
              <a href="/auth" className="g-btn g-btn-primary">Crear cuenta gratis</a>
              <a href="#como-funciona" className="g-btn">Ver cómo funciona</a>
            </div>
            <p className="l-fine">Acceso anticipado gratuito. Sin tarjeta.</p>
          </div>
          <ProductShot />
        </section>

        <section id="como-funciona" className="l-section">
          <div className="l-wrap">
            <h2 className="l-h2">Lo que hace una agencia, sin esperar al informe del mes</h2>
            <div className="l-steps">
              {[
                ['Conecta tus cuentas', 'Inicia sesión con Google y con Facebook. Eliges qué cuenta publicitaria gestiona Growlia y revisamos que el tracking y la facturación estén bien.'],
                ['Cada mañana, un resumen', 'Qué ha pasado ayer, cómo va la semana, cuánto llevas gastado del mes y qué es lo más importante hoy.'],
                ['Apruebas los cambios', 'Pausar lo que no convierte, recortar lo que se come el presupuesto, escalar lo que funciona. Cada propuesta explica por qué.'],
              ].map(([t, d], i) => (
                <div key={t} className="l-step">
                  <span className="l-step-n">Paso {i + 1}</span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="criterio" className="l-section">
          <div className="l-wrap l-split">
            <div>
              <h2 className="l-h2">Criterio de senior, no reglas automáticas</h2>
              <p className="l-p">La diferencia entre gestionar bien una cuenta y quemar presupuesto está en saber cuándo no tocar nada. Growlia aplica el criterio de alguien con años gestionando inversión real.</p>
            </div>
            <div className="l-rules">
              {RULES.map(([t, d]) => (
                <div key={t} className="l-rule"><strong>{t}</strong><span>{d}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section id="confianza" className="l-section">
          <div className="l-wrap">
            <h2 className="l-h2">Tu dinero, tus cuentas, tus decisiones</h2>
            <div className="l-trust">
              <div><h3>Nada sin tu aprobación</h3><p>Growlia propone y tú decides. Antes de aplicar, comprueba que la campaña no ha cambiado.</p></div>
              <div><h3>Todo se puede deshacer</h3><p>Cada cambio queda registrado y puedes revertirlo con un clic durante 7 días.</p></div>
              <div><h3>Credenciales cifradas</h3><p>Conexión con los permisos oficiales de Google y Meta. Los accesos se guardan cifrados.</p></div>
              <div><h3>La cuenta es tuya</h3><p>No creamos ni nos quedamos tus cuentas publicitarias. Desconectas cuando quieras.</p></div>
            </div>
          </div>
        </section>

        <section className="l-section">
          <div className="l-wrap l-split">
            <div>
              <h2 className="l-h2">Pregunta lo que le preguntarías a un experto</h2>
              <p className="l-p">Con tu cuenta conectada, Growlia responde con tus datos reales: qué campaña te trae clientes más baratos o dónde pondrías más presupuesto. Prueba aquí la versión general.</p>
            </div>
            <DemoChat />
          </div>
        </section>

        <section className="l-section" style={{ borderTop: 0, paddingTop: 0 }}>
          <div className="l-wrap">
            <div className="l-dark">
              <div>
                <h2 className="l-h2" style={{ color: '#fff' }}>Empieza con Google Ads y Meta Ads</h2>
                <p className="l-p">LinkedIn Ads y TikTok Ads llegarán después. Durante el acceso anticipado, Growlia es gratis.</p>
              </div>
              <a href="/auth" className="g-btn" style={{ height: 44, padding: '0 20px', textDecoration: 'none', color: 'var(--ink)' }}>Crear cuenta gratis</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="l-wrap l-foot">
        <span>© {new Date().getFullYear()} Growlia</span>
        <span style={{ display: 'flex', gap: 20 }}>
          <a href="/privacidad">Privacidad</a>
          <a href="/terminos">Términos</a>
          <a href="mailto:support@growlia.es">support@growlia.es</a>
        </span>
      </footer>
    </>
  )
}
