'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.growlia.es'

const PLATFORMS = [
  {
    id: 'google',
    name: 'Google Ads',
    desc: 'Gestiona campañas de Google Ads',
    color: '#4285F4',
    oauthUrl: `${API_URL}/api/auth/google`,
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    id: 'meta',
    name: 'Meta Ads',
    desc: 'Anuncios en Facebook e Instagram',
    color: '#0866FF',
    oauthUrl: `${API_URL}/api/auth/meta`,
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#0866FF">
        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
      </svg>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok Ads',
    desc: 'Gestiona campañas en TikTok',
    color: '#000000',
    oauthUrl: null,
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="black">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.27 8.27 0 004.84 1.56V6.79a4.85 4.85 0 01-1.07-.1z"/>
      </svg>
    ),
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Ads',
    desc: 'Anuncios B2B en LinkedIn',
    color: '#0A66C2',
    oauthUrl: null,
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    id: 'microsoft',
    name: 'Microsoft Ads',
    desc: 'Campañas en Bing y Microsoft',
    color: '#00A4EF',
    oauthUrl: null,
    logo: (
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="#F25022" d="M1 1h10v10H1z"/>
        <path fill="#00A4EF" d="M13 1h10v10H13z"/>
        <path fill="#7FBA00" d="M1 13h10v10H1z"/>
        <path fill="#FFB900" d="M13 13h10v10H13z"/>
      </svg>
    ),
  },
]

interface Connection {
  id: string
  platform: string
  account_name: string
  ad_account_id: string
  created_at: string
}

export default function ConnectionsPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    fetchConnections()
    checkUrlParams()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
    }
  }

  async function fetchConnections() {
    const { data, error } = await supabase
      .from('connections')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setConnections(data)
    setLoading(false)
  }

  function checkUrlParams() {
    const params = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const error = params.get('error')
    if (connected) {
      fetchConnections()
      window.history.replaceState({}, '', '/connections')
    }
    if (error) {
      console.error('OAuth error:', error)
    }
  }

  async function handleConnect(platform: typeof PLATFORMS[0]) {
    if (!platform.oauthUrl) {
      alert(`${platform.name} estará disponible próximamente.`)
      return
    }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/auth')
      return
    }
    window.location.href = platform.oauthUrl
  }

  async function handleDisconnect(connectionId: string, platformId: string) {
    if (!confirm('¿Desconectar esta cuenta?')) return
    setDisconnecting(platformId)
    await supabase.from('connections').delete().eq('id', connectionId)
    await fetchConnections()
    setDisconnecting(null)
  }

  const isConnected = (platformId: string) =>
    connections.find(c => c.platform === platformId)

  return (
    <div style={{ minHeight: '100vh', background: '#F8F9FC', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E8EAF0', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: '#2563EB', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/>
              <circle cx="8" cy="8" r="2" fill="white"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: '#111827' }}>Growlia</span>
        </div>
        <nav style={{ display: 'flex', gap: 32 }}>
          {['Agente', 'Conexiones', 'Templates', 'Precios'].map(item => (
            <a key={item} href={item === 'Conexiones' ? '/connections' : `/${item.toLowerCase()}`}
              style={{ fontSize: 14, color: item === 'Conexiones' ? '#2563EB' : '#6B7280', textDecoration: 'none', fontWeight: item === 'Conexiones' ? 600 : 400 }}>
              {item}
            </a>
          ))}
        </nav>
        <button onClick={() => router.push('/auth')}
          style={{ padding: '8px 20px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Dashboard
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#2563EB', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 12 }}>CONEXIONES</p>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#111827', textAlign: 'center', marginBottom: 16, letterSpacing: '-0.02em' }}>
          Conecta tu stack de marketing
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 48, lineHeight: 1.7 }}>
          Una plataforma para todas tus cuentas. Conexión en segundos con OAuth — sin contraseñas, sin complicaciones.
        </p>

        {/* Platforms list */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8EAF0', overflow: 'hidden' }}>
          <div style={{ padding: '12px 24px', background: '#F8F9FC', borderBottom: '1px solid #E8EAF0' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.1em' }}>ANUNCIOS</span>
          </div>

          {PLATFORMS.map((platform, i) => {
            const conn = isConnected(platform.id)
            return (
              <div key={platform.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: i < PLATFORMS.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid #E8EAF0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                    {platform.logo}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontWeight: 600, fontSize: 15, color: '#111827', margin: 0 }}>{platform.name}</p>
                      {conn && (
                        <span style={{ fontSize: 11, background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                          ✓ Conectado
                        </span>
                      )}
                      {!platform.oauthUrl && !conn && (
                        <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                          Próximamente
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#9CA3AF', margin: '2px 0 0' }}>
                      {conn ? conn.account_name || conn.ad_account_id : platform.desc}
                    </p>
                  </div>
                </div>

                {conn ? (
                  <button
                    onClick={() => handleDisconnect(conn.id, platform.id)}
                    disabled={disconnecting === platform.id}
                    style={{ padding: '8px 16px', background: '#fff', color: '#EF4444', border: '1px solid #FCA5A5', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {disconnecting === platform.id ? 'Desconectando...' : 'Desconectar'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform)}
                    style={{
                      padding: '8px 20px',
                      background: platform.oauthUrl ? '#fff' : '#F9FAFB',
                      color: platform.oauthUrl ? '#111827' : '#9CA3AF',
                      border: `1px solid ${platform.oauthUrl ? '#E8EAF0' : '#E8EAF0'}`,
                      borderRadius: 8, fontSize: 13, fontWeight: 600,
                      cursor: platform.oauthUrl ? 'pointer' : 'not-allowed',
                    }}>
                    {platform.oauthUrl ? '+ Conectar' : 'Próximamente'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Status */}
        {!loading && connections.length > 0 && (
          <div style={{ marginTop: 24, padding: 20, background: '#EFF6FF', borderRadius: 12, border: '1px solid #BFDBFE' }}>
            <p style={{ margin: 0, fontSize: 14, color: '#1D4ED8', fontWeight: 600 }}>
              ✓ {connections.length} cuenta{connections.length > 1 ? 's' : ''} conectada{connections.length > 1 ? 's' : ''}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#3B82F6' }}>
              Ve al <a href="/dashboard" style={{ color: '#2563EB', fontWeight: 600 }}>dashboard</a> para ver tus campañas.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
