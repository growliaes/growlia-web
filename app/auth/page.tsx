'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const C = {
  white: '#FFFFFF',
  bg: '#F8F9FC',
  border: '#E5E9F0',
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#EFF6FF',
  blueGlow: 'rgba(37,99,235,0.18)',
  ink: '#0F172A',
  inkMid: '#64748B',
  inkLight: '#94A3B8',
  red: '#EF4444',
  green: '#10B981',
  shadowLg: '0 16px 48px rgba(37,99,235,0.14)',
}

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
        setError(signInError.message)
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
        setError(signUpError.message)
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
        {/* Header */}
        <div style={{
          padding: '32px 24px',
          textAlign: 'center',
          borderBottom: `1px solid ${C.border}`,
        }}>
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
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="white"/>
            </svg>
          </div>
          <h1 style={{
            fontSize: 24,
            fontWeight: 800,
            color: C.ink,
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Grow<span style={{ color: C.blue }}>lia</span>
          </h1>
          <p style={{
            fontSize: 13,
            color: C.inkMid,
            margin: '8px 0 0',
          }}>
            Tu agente de marketing con IA
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${C.border}`,
        }}>
          {(['login', 'signup'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                background: tab === t ? C.blueLight : 'transparent',
                borderBottom: tab === t ? `2px solid ${C.blue}` : 'none',
                color: tab === t ? C.blue : C.inkMid,
                fontWeight: tab === t ? 700 : 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={tab === 'login' ? handleLogin : handleSignup} style={{ padding: '24px' }}>
          {error && (
            <div style={{
              padding: '12px',
              background: '#FEE2E2',
              border: `1px solid #FCA5A5`,
              borderRadius: 8,
              fontSize: 13,
              color: C.red,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '12px',
              background: '#ECFDF5',
              border: `1px solid #A7F3D0`,
              borderRadius: 8,
              fontSize: 13,
              color: C.green,
              marginBottom: 16,
            }}>
              {success}
            </div>
          )}

          {tab === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 700,
                color: C.inkMid,
                marginBottom: 6,
              }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Tu nombre"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: C.bg,
                }}
                disabled={loading}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 700,
              color: C.inkMid,
              marginBottom: 6,
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                background: C.bg,
              }}
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 700,
              color: C.inkMid,
              marginBottom: 6,
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                background: C.bg,
              }}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '12px',
              background: loading || !email || !password ? C.inkLight : C.blue,
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Cargando...' : tab === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          textAlign: 'center',
          borderTop: `1px solid ${C.border}`,
          fontSize: 12,
          color: C.inkLight,
        }}>
          Al continuar, aceptas nuestros{' '}
          <a href="/terminos" style={{ color: C.blue, textDecoration: 'none' }}>
            términos
          </a>
          {' '}y{' '}
          <a href="/privacidad" style={{ color: C.blue, textDecoration: 'none' }}>
            privacidad
          </a>
        </div>
      </div>
    </div>
  )
}
