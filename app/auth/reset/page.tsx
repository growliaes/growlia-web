'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const C = {
  white: '#FFFFFF',
  bg: '#F8F9FC',
  border: '#E5E9F0',
  blue: '#2563EB',
  blueGlow: 'rgba(37,99,235,0.18)',
  ink: '#0F172A',
  inkMid: '#64748B',
  inkLight: '#94A3B8',
  red: '#EF4444',
  green: '#10B981',
  shadowLg: '0 16px 48px rgba(37,99,235,0.14)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  background: C.bg,
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: C.inkMid,
  marginBottom: 6,
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid' | 'done'>('checking')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const init = async () => {
      // El enlace del email llega con ?code=... (flujo PKCE): lo canjeamos por una sesión
      const code = new URLSearchParams(window.location.search).get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (exchangeError) {
          setStatus('invalid')
          return
        }
        window.history.replaceState({}, '', '/auth/reset')
        setStatus('ready')
        return
      }

      // Compatibilidad con enlaces antiguos (tokens en el hash) o sesión ya creada
      const { data: { session } } = await supabase.auth.getSession()
      if (cancelled) return
      setStatus(session ? 'ready' : 'invalid')
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready')
    })

    init()
    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      const m = updateError.message.toLowerCase()
      if (m.includes('different from the old')) {
        setError('La nueva contraseña debe ser distinta de la anterior.')
      } else if (m.includes('session')) {
        setStatus('invalid')
      } else {
        setError('No hemos podido guardar la contraseña. Inténtalo de nuevo.')
      }
      return
    }

    setStatus('done')
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: C.white,
        borderRadius: 20,
        boxShadow: C.shadowLg,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '32px 24px', textAlign: 'center', borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: C.blue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: `0 2px 8px ${C.blueGlow}`,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.ink, margin: 0, letterSpacing: '-0.02em' }}>
            Nueva contraseña
          </h1>
        </div>

        <div style={{ padding: 24 }}>
          {status === 'checking' && (
            <p style={{ fontSize: 14, color: C.inkMid, textAlign: 'center', margin: 0 }}>
              Verificando enlace...
            </p>
          )}

          {status === 'invalid' && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: C.ink, margin: '0 0 8px', fontWeight: 600 }}>
                Este enlace ha caducado o ya se ha usado.
              </p>
              <p style={{ fontSize: 13, color: C.inkMid, margin: '0 0 20px', lineHeight: 1.5 }}>
                Por seguridad, los enlaces solo sirven una vez y deben abrirse en el mismo navegador donde los pediste.
              </p>
              <a href="/auth" style={{
                display: 'inline-block',
                padding: '12px 20px',
                background: C.blue,
                borderRadius: 10,
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                textDecoration: 'none',
              }}>
                Pedir un enlace nuevo
              </a>
            </div>
          )}

          {status === 'done' && (
            <div style={{
              padding: 12,
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              borderRadius: 8,
              fontSize: 13,
              color: C.green,
              textAlign: 'center',
            }}>
              Contraseña actualizada. Entrando en tu dashboard...
            </div>
          )}

          {status === 'ready' && (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{
                  padding: 12,
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 8,
                  fontSize: 13,
                  color: C.red,
                  marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Nueva contraseña</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  style={inputStyle}
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Repite la contraseña</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  style={inputStyle}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                style={{
                  width: '100%',
                  padding: 12,
                  background: loading || !password || !confirm ? C.inkLight : C.blue,
                  border: 'none',
                  borderRadius: 10,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: loading ? 'wait' : 'pointer',
                }}
              >
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
