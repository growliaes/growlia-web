'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

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
      const params = new URLSearchParams(window.location.search)

      // Enlace de la plantilla de email (?token_hash=...&type=recovery):
      // funciona aunque se abra en otro dispositivo o navegador
      const tokenHash = params.get('token_hash')
      if (tokenHash) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery',
        })
        if (cancelled) return
        if (otpError) {
          setStatus('invalid')
          return
        }
        window.history.replaceState({}, '', '/auth/reset')
        setStatus('ready')
        return
      }

      // Enlace con ?code=... (flujo PKCE): solo funciona en el mismo navegador
      const code = params.get('code')
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
    <div className="g-auth">
      <div className="g-auth-card">
        <a href="/" className="g-brand" style={{ padding: '0 0 28px', textDecoration: 'none', color: 'var(--ink)', justifyContent: 'center' }}>
          <span className="g-mark" aria-hidden><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg></span>
          Growlia
        </a>
        <div className="g-panel" style={{ padding: 28 }}>
          <h1 className="g-h1" style={{ fontSize: 22 }}>Nueva contraseña</h1>

          {status === 'checking' && <p className="g-sub">Comprobando el enlace…</p>}

          {status === 'invalid' && (
            <>
              <p className="g-sub">Este enlace ha caducado o ya se ha usado. Cada enlace sirve una sola vez y caduca al cabo de una hora.</p>
              <a href="/auth" className="g-btn g-btn-dark g-btn-block" style={{ height: 42, marginTop: 20, textDecoration: 'none' }}>Pedir un enlace nuevo</a>
            </>
          )}

          {status === 'done' && <div className="g-note g-note-pos" style={{ marginTop: 16 }}>Contraseña actualizada. Entrando en tu panel…</div>}

          {status === 'ready' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18 }}>
              {error && <div className="g-note g-note-neg" role="alert">{error}</div>}
              <div>
                <label className="g-label" htmlFor="pw">Nueva contraseña</label>
                <input id="pw" className="g-input" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" disabled={loading} />
              </div>
              <div>
                <label className="g-label" htmlFor="pw2">Repite la contraseña</label>
                <input id="pw2" className="g-input" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} disabled={loading} />
              </div>
              <button type="submit" className="g-btn g-btn-dark g-btn-block" style={{ height: 42, marginTop: 4 }} disabled={loading || !password || !confirm}>
                {loading ? 'Guardando…' : 'Guardar contraseña'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
