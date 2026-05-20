'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const C = {
  white: '#FFFFFF',
  bg: '#F8F9FC',
  border: '#E5E9F0',
  blue: '#2563EB',
  ink: '#0F172A',
  inkMid: '#64748B',
  inkLight: '#94A3B8',
  green: '#10B981',
  red: '#EF4444',
}

function CampaignsTab({ userId, connections }: { userId: string; connections: any[] }) {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (connections.length === 0) { setLoading(false); return }
    fetch(`https://api.growlia.es/api/campaigns?user_id=${userId}`)
      .then(r => r.json())
      .then(data => { setCampaigns(data.campaigns || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [userId, connections])

  if (connections.length === 0) return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
      <p style={{ fontSize: 15, color: C.inkMid, marginBottom: 16 }}>Conecta una plataforma para ver tus campañas</p>
    </div>
  )

  if (loading) return <p style={{ color: C.inkMid }}>Cargando campañas...</p>

  if (campaigns.length === 0) return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
      <p style={{ fontSize: 15, color: C.inkMid }}>No se encontraron campañas activas. Las campañas de Google Ads estarán disponibles próximamente.</p>
    </div>
  )

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 16px' }}>Mis campañas ({campaigns.length})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {campaigns.map((c: any) => (
          <div key={c.id} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: 0 }}>{c.name}</h3>
                <span style={{ fontSize: 12, color: C.inkLight }}>{c.platform} · {c.objective}</span>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: c.status === 'active' ? '#D1FAE5' : '#FEE2E2', color: c.status === 'active' ? '#065F46' : '#991B1B' }}>
                {c.status === 'active' ? '● Activa' : '● Pausada'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
              {[['Gasto', `€${c.spend?.toFixed(2)}`], ['Impresiones', c.impressions?.toLocaleString()], ['Clicks', c.clicks?.toLocaleString()], ['CTR', `${(c.ctr * 100)?.toFixed(2)}%`], ['CPC', `€${c.cpc?.toFixed(2)}`]].map(([label, val]) => (
                <div key={label} style={{ background: C.bg, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: C.inkLight, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
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
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      loadConnections(session.user.id)
    }
    checkAuth()
  }, [])

  const loadConnections = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('connections').select('*').eq('user_id', userId)
      if (!error) setConnections(data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

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

  const handleDisconnect = async (connId: string) => {
    await supabase.from('connections').delete().eq('id', connId)
    if (user) loadConnections(user.id)
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ fontSize: 16, color: C.inkMid }}>Cargando...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '16px 5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>Grow<span style={{ color: C.blue }}>lia</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{user.user_metadata?.full_name || user.email}</div>
            <div style={{ fontSize: 11, color: C.inkLight }}>{user.email}</div>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: C.red, border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Salir</button>
        </div>
      </nav>

      <div style={{ padding: '32px 5vw', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: C.ink, marginBottom: 8 }}>Dashboard</h1>
        <p style={{ fontSize: 15, color: C.inkMid, marginBottom: 28 }}>Gestiona tus conexiones y campañas de marketing</p>

        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 32 }}>
          {(['connections', 'campaigns', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 20px', border: 'none', background: 'transparent', borderBottom: tab === t ? `2px solid ${C.blue}` : 'none', color: tab === t ? C.blue : C.inkMid, fontWeight: tab === t ? 700 : 600, fontSize: 14, cursor: 'pointer' }}>
              {t === 'connections' && '🔗 Conexiones'}
              {t === 'campaigns' && '📊 Campañas'}
              {t === 'settings' && '⚙️ Configuración'}
            </button>
          ))}
        </div>

        {tab === 'connections' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 16px' }}>Conecta tus plataformas</h2>
            <p style={{ fontSize: 14, color: C.inkMid, marginBottom: 20 }}>Añade tus cuentas de Google Ads, Meta y otras plataformas para empezar.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>Google Ads</h3>
                    <p style={{ fontSize: 12, color: C.inkLight, margin: '4px 0 0' }}>Gestiona tus campañas</p>
                  </div>
                </div>
                <button onClick={handleConnectGoogle} style={{ width: '100%', padding: '10px', background: C.blue, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Conectar</button>
              </div>
              <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0866FF"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>Meta Ads</h3>
                    <p style={{ fontSize: 12, color: C.inkLight, margin: '4px 0 0' }}>Facebook e Instagram</p>
                  </div>
                </div>
                <button onClick={handleConnectMeta} style={{ width: '100%', padding: '10px', background: C.blue, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Conectar</button>
              </div>
            </div>
            {connections.length > 0 && (
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 16px' }}>Cuentas conectadas ({connections.length})</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {connections.map(conn => (
                    <div key={conn.id} style={{ background: '#fff', border: `1px solid ${C.green}`, borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                        <div>
                          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>{conn.account_name || conn.platform}</h3>
                          <p style={{ fontSize: 12, color: C.inkLight, margin: '4px 0 0' }}>ID: {conn.ad_account_id}</p>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: C.green, borderRadius: 6, padding: '4px 8px' }}>✓ Conectado</span>
                      </div>
                      <p style={{ fontSize: 12, color: C.inkMid, margin: '0 0 12px' }}>Plataforma: <strong>{conn.platform}</strong></p>
                      <button onClick={() => handleDisconnect(conn.id)} style={{ width: '100%', padding: '8px', background: '#FEE2E2', border: `1px solid ${C.red}`, borderRadius: 6, color: C.red, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Desconectar</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'campaigns' && (
          <CampaignsTab userId={user.id} connections={connections} />
        )}

        {tab === 'settings' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: C.ink, margin: '0 0 16px' }}>Configuración</h2>
            <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: '0 0 8px' }}>Email</h3>
                <p style={{ fontSize: 13, color: C.inkMid, margin: 0 }}>{user.email}</p>
              </div>
              <div style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: '0 0 8px' }}>Nombre</h3>
                <p style={{ fontSize: 13, color: C.inkMid, margin: 0 }}>{user.user_metadata?.full_name || 'Sin configurar'}</p>
              </div>
              <div style={{ paddingTop: 24, borderTop: `1px solid ${C.border}` }}>
                <button onClick={handleLogout} style={{ padding: '10px 20px', background: C.red, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cerrar sesión</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
