'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [forgot, setForgot] = useState(false)

  const translateError = (msg: string) => {
    const m = msg.toLowerCase()
    if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.'
    if (m.includes('email not confirmed')) return 'Tienes que confirmar tu email antes de entrar. Revisa tu bandeja de entrada.'
    if (m.includes('user already registered')) return 'Ya existe una cuenta con este email. Inicia sesión o recupera tu contraseña.'
    if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
    if (m.includes('rate limit') || m.includes('security purposes')) return 'Demasiados intentos. Espera un minuto y vuelve a probar.'
    if (m.includes('invalid email') || m.includes('unable to validate email')) return 'El email no es válido.'
    return 'Ha ocurrido un error. Inténtalo de nuevo.'
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    setLoading(false)
    if (resetError && !resetError.message.toLowerCase().includes('not found')) {
      setError(translateError(resetError.message))
      return
    }
    // Mensaje genérico: no revelamos si el email existe o no
    setSuccess('Si existe una cuenta con ese email, recibirás un enlace para crear una nueva contraseña en unos minutos. Revisa también la carpeta de spam.')
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(translateError(signInError.message))
        setLoading(false)
        return
      }

      setSuccess('¡Bienvenido! Redirigiendo...')
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch (err) {
      setError('Error al iniciar sesión')
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Por favor, ingresa tu nombre')
      setLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        setError(translateError(signUpError.message))
        setLoading(false)
        return
      }

      setSuccess('¡Registro exitoso! Revisa tu email para confirmar.')
      setEmail('')
      setPassword('')
      setFullName('')
      setTimeout(() => setTab('login'), 2000)
    } catch (err) {
      setError('Error al registrarse')
      setLoading(false)
    }
  }

  return (
    <div className="g-auth">
      <div className="g-auth-card">
        <a href="/" className="g-brand" style={{ padding: '0 0 28px', textDecoration: 'none', color: 'var(--ink)', justifyContent: 'center' }}>
          <span className="g-mark" aria-hidden><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg></span>
          Growlia
        </a>

        <div className="g-panel" style={{ padding: 28 }}>
          <h1 className="g-h1" style={{ fontSize: 22 }}>
            {forgot ? 'Recupera tu contraseña' : tab === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
          </h1>
          <p className="g-sub" style={{ marginBottom: 22 }}>
            {forgot
              ? 'Escribe el email de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.'
              : tab === 'login' ? 'Accede a tus campañas y a las recomendaciones del día.' : 'Conecta tus cuentas publicitarias en un par de minutos.'}
          </p>

          {!forgot && (
            <div className="g-seg" role="group" aria-label="Acceso">
              {(['login', 'signup'] as const).map(t => (
                <button key={t} type="button" aria-pressed={tab === t} onClick={() => { setTab(t); setForgot(false); setError(''); setSuccess('') }}>
                  {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={forgot ? handleForgot : tab === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <div className="g-note g-note-neg" role="alert">{error}</div>}
            {success && <div className="g-note g-note-pos" role="status">{success}</div>}

            {tab === 'signup' && !forgot && (
              <div>
                <label className="g-label" htmlFor="name">Nombre</label>
                <input id="name" className="g-input" type="text" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} disabled={loading} />
              </div>
            )}

            <div>
              <label className="g-label" htmlFor="email">Email</label>
              <input id="email" className="g-input" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@empresa.com" disabled={loading} />
            </div>

            {!forgot && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <label className="g-label" htmlFor="password">Contraseña</label>
                  {tab === 'login' && (
                    <button type="button" className="g-link" onClick={() => { setForgot(true); setError(''); setSuccess('') }}>¿La has olvidado?</button>
                  )}
                </div>
                <input id="password" className="g-input" type="password" autoComplete={tab === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={tab === 'signup' ? 'Mínimo 6 caracteres' : ''} disabled={loading} />
              </div>
            )}

            <button type="submit" className="g-btn g-btn-dark g-btn-block" style={{ height: 42, marginTop: 4 }} disabled={loading || !email || (!forgot && !password)}>
              {loading ? 'Un momento…' : forgot ? 'Enviar enlace' : tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>

            {forgot && (
              <button type="button" className="g-link" style={{ color: 'var(--ink-2)', alignSelf: 'center' }} onClick={() => { setForgot(false); setError(''); setSuccess('') }}>
                Volver a iniciar sesión
              </button>
            )}
          </form>
        </div>

        <p className="g-muted" style={{ textAlign: 'center', marginTop: 20 }}>
          Al continuar aceptas los <a href="/terminos" style={{ color: 'var(--ink-2)' }}>términos</a> y la <a href="/privacidad" style={{ color: 'var(--ink-2)' }}>política de privacidad</a>.
        </p>
      </div>
    </div>
  )
}
