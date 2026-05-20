'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const C = {
  white: '#FFFFFF',
  bg: '#F8F9FC',
  border: '#E5E9F0',
  blue: '#2563EB',
  blueDark: '#1D4ED8',
  blueLight: '#EFF6FF',
  ink: '#0F172A',
  inkMid: '#64748B',
  inkLight: '#94A3B8',
  green: '#10B981',
  red: '#EF4444',
  shadow: '0 1px 4px rgba(15,23,42,0.08)',
  shadowMd: '0 4px 20px rgba(15,23,42,0.10)',
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [user, setUser] = useState<any>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'connections' | 'campaigns' | 'settings'>('connections')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth')
        return
      }

      setUser(session.user)
      loadConnections(session.user.id)
    }

    checkAuth()
  }, [])

  const loadConnections = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      setConnections(data || [])
    } catch (err) {
      console.error('Error loading connections:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleConnectGoogle = () => {
    const clientId = '708427883725-33ql01ep5aa8e6od515er94j7rm7i81m.apps.googleusercontent.com'
    const redirectUri = encodeURIComponent('https://api.growlia.es/api/auth/google/callback')
    const scopes = encodeURIComponent('https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile')
    const state = user.id
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}&access_type=offline&prompt=consent&state=${state}`
  }

  const handleConnectMeta = () => {
    const appId = '859352396692840'
    const redirectUri = encodeURIComponent('https://api.growlia.es/api/auth/meta/callback')
    const scopes = encodeURIComponent('ads_read,ads_management,business_management')
    const state = user.id
    window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&state=${state}`
  }

  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.bg,
      }}>
        <div style={{ fontSize: 16, color: C.inkMid }}>Cargando...</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Nav */}
      <nav style={{
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        padding: '16px 5vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: C.shadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: C.blue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>
            Grow<span style={{ color: C.blue }}>lia</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>
              {user.user_metadata?.full_name || user.email}
            </div>
            <div style={{ fontSize: 11, color: C.inkLight }}>
              {user.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: C.red,
              border: 'none',
              borderRadius: 8,
              color: C.white,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Salir
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '32px 5vw', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: C.ink, margin: 0, marginBottom: 8 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 15, color: C.inkMid, margin: 0 }}>
            Gestiona tus conexiones y campañas de marketing
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: 0,
          borderBottom: `1px solid ${C.border}`,
          marginBottom: 32,
        }}>
          {(['connections', 'campaigns', 'settings'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'transparent',
                borderBottom: tab === t ? `2px solid ${C.blue}` : 'none',
                color: tab === t ? C.blue : C.inkMid,
                fontWeight: tab === t ? 700 : 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t === 'connections' && '🔗 Conexiones'}
              {t === 'campaigns' && '📊 Campañas'}
              {t === 'settings' && '⚙️ Configuración'}
            </button>
          ))}
        </div>

        {/* Connections Tab */}
        {tab === 'connections' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 16px' }}>
                Conecta tus plataformas
              </h2>
              <p style={{ fontSize: 14, color: C.inkMid, margin: 0, marginBottom: 20 }}>
                Añade tus cuentas de Google Ads, Meta y otras plataformas para empezar.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
              }}>
                {/* Google Ads */}
                <div style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 20 }}>📱</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>
                        Google Ads
                      </h3>
                      <p style={{ fontSize: 12, color: C.inkLight, margin: '4px 0 0' }}>
                        Gestiona tus campañas
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleConnectGoogle}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: C.blue,
                      border: 'none',
                      borderRadius: 8,
                      color: C.white,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Conectar
                  </button>
                </div>

                {/* Meta Ads */}
                <div style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 20,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      background: '#FDF4FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 20 }}>📘</span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>
                        Meta Ads
                      </h3>
                      <p style={{ fontSize: 12, color: C.inkLight, margin: '4px 0 0' }}>
                        Facebook e Instagram
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleConnectMeta}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: C.blue,
                      border: 'none',
                      borderRadius: 8,
                      color: C.white,
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    Conectar
                  </button>
                </div>
              </div>
            </div>

            {/* Connected Accounts */}
            {connections.length > 0 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: '32px 0 16px' }}>
                  Cuentas conectadas ({connections.length})
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}>
                  {connections.map(conn => (
                    <div
                      key={conn.id}
                      style={{
                        background: C.white,
                        border: `1px solid ${C.green}`,
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        marginBottom: 12,
                      }}>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>
                            {conn.account_name || conn.platform}
                          </h3>
                          <p style={{ fontSize: 12, color: C.inkLight, margin: '4px 0 0' }}>
                            ID: {conn.account_id}
                          </p>
                        </div>
                        <span style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: C.white,
                          background: C.green,
                          borderRadius: 6,
                          padding: '4px 8px',
                        }}>
                          ✓ Conectado
                        </span>
                      </div>
                      <p style={{
                        fontSize: 12,
                        color: C.inkMid,
                        margin: '0 0 12px',
                      }}>
                        Plataforma: <strong>{conn.platform}</strong>
                      </p>
                      <button
                        style={{
                          width: '100%',
                          padding: '8px',
                          background: '#FEE2E2',
                          border: `1px solid ${C.red}`,
                          borderRadius: 6,
                          color: C.red,
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        Desconectar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campaigns Tab */}
        {tab === 'campaigns' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: 0, marginBottom: 16 }}>
              Mis campañas
            </h2>
            {connections.length === 0 ? (
              <div style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 32,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 15, color: C.inkMid, margin: 0, marginBottom: 16 }}>
                  Conecta una plataforma para ver tus campañas aquí
                </p>
                <button
                  onClick={() => setTab('connections')}
                  style={{
                    padding: '10px 20px',
                    background: C.blue,
                    border: 'none',
                    borderRadius: 8,
                    color: C.white,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Ir a Conexiones
                </button>
              </div>
            ) : (
              <div style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: 20,
              }}>
                <p style={{ color: C.inkMid }}>
                  Cargando campañas... (próximamente)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {tab === 'settings' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: 0, marginBottom: 16 }}>
              Configuración
            </h2>
            <div style={{
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: 24,
            }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: '0 0 8px' }}>
                  Email
                </h3>
                <p style={{ fontSize: 13, color: C.inkMid, margin: 0 }}>
                  {user.email}
                </p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: '0 0 8px' }}>
                  Nombre
                </h3>
                <p style={{ fontSize: 13, color: C.inkMid, margin: 0 }}>
                  {user.user_metadata?.full_name || 'Sin configurar'}
                </p>
              </div>

              <div style={{ paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '10px 20px',
                    background: C.red,
                    border: 'none',
                    borderRadius: 8,
                    color: C.white,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
