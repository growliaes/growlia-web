'use client'

import { useState, useRef, useEffect } from 'react'

const API_URL = 'https://api.growlia.es'

interface Msg { role: 'user' | 'ai'; text: string }

export default function ChatBox() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMsgs([{ role: 'ai', text: '¡Hola! Soy Growlia, tu agente de marketing con IA. ¿En qué campaña trabajamos hoy?' }])
  }, [])

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
      setMsgs(m => [...m, { role: 'ai', text: 'No puedo conectar con el servidor.' }])
    }
    setLoading(false)
  }

  const blue = '#2563EB'
  const border = '#E5E7EB'
  const bg = '#F9FAFB'
  const ink = '#111827'
  const inkLight = '#9CA3AF'

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', maxWidth: 580, width: '100%' }}>
      <div style={{ background: blue, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80' }} />
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>Growlia — Agente IA</span>
      </div>
      <div style={{ height: 260, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '10px 14px',
              borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              background: m.role === 'user' ? blue : bg,
              color: m.role === 'user' ? '#fff' : ink,
              fontSize: 13, lineHeight: 1.6,
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 4, padding: '10px 14px' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: inkLight }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ borderTop: `1px solid ${border}`, display: 'flex', padding: 12, gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="¿En qué campaña trabajamos hoy?"
          style={{ flex: 1, border: `1px solid ${border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}
        />
        <button onClick={send} disabled={loading}
          style={{ background: blue, border: 'none', borderRadius: 8, padding: '10px 16px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          →
        </button>
      </div>
    </div>
  )
}
