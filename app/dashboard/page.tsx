'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const API_URL = 'https://api.growlia.es'

const C = {
  white: '#FFFFFF',
  bg: '#F8F9FC',
  border: '#E5E9F0',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  ink: '#0F172A',
  inkMid: '#64748B',
  inkLight: '#94A3B8',
  green: '#10B981',
  red: '#EF4444',
}

const SEVERITY: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Urgente', color: '#991B1B', bg: '#FEF2F2', border: '#FCA5A5' },
  warning: { label: 'Atención', color: '#92400E', bg: '#FFFBEB', border: '#FCD34D' },
  opportunity: { label: 'Oportunidad', color: '#065F46', bg: '#ECFDF5', border: '#6EE7B7' },
  info: { label: 'Info', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' },
}

const PLATFORM_NAME: Record<string, string> = { google: 'Google Ads', meta: 'Meta Ads', linkedin: 'LinkedIn Ads', tiktok: 'TikTok Ads' }

// Mensajes tras volver de Google/Meta
const FLASH: Record<string, { type: 'ok' | 'warn' | 'error'; text: string }> = {
  'connected=google': { type: 'ok', text: 'Google Ads conectado correctamente.' },
  'connected=meta': { type: 'ok', text: 'Meta Ads conectado correctamente.' },
  'warning=google_developer_token_not_approved': { type: 'warn', text: 'Google Ads se ha conectado, pero Google todavía no ha aprobado a Growlia para leer cuentas reales. En cuanto lo apruebe, verás tus campañas sin tener que hacer nada.' },
  'warning=google_no_accounts': { type: 'warn', text: 'Google Ads se ha conectado, pero ese usuario de Google no tiene ninguna cuenta publicitaria. Prueba con el email que usas en ads.google.com.' },
  'warning=google_permission_denied': { type: 'warn', text: 'Google Ads se ha conectado, pero tu usuario no tiene permisos suficientes en la cuenta publicitaria.' },
  'error=google_auth_cancelled': { type: 'error', text: 'Has cancelado la conexión con Google.' },
  'error=meta_auth_cancelled': { type: 'error', text: 'Has cancelado la conexión con Meta.' },
  'error=meta_no_accounts': { type: 'error', text: 'Tu usuario de Facebook no tiene ninguna cuenta publicitaria a la que Growlia pueda acceder.' },
  'error=invalid_state': { type: 'error', text: 'La conexión ha caducado por seguridad. Vuelve a intentarlo.' },
  'error=google_no_refresh_token': { type: 'error', text: 'Google no ha devuelto los permisos completos. Vuelve a conectar y acepta todos los permisos.' },
}

const fmtMoney = (n: number | null | undefined, cur = 'EUR') =>
  n === null || n === undefined ? '—' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: cur, maximumFractionDigits: n >= 1000 ? 0 : 2 }).format(n)
const fmtNum = (n: number | null | undefined, dec = 0) =>
  n === null || n === undefined ? '—' : new Intl.NumberFormat('es-ES', { maximumFractionDigits: dec }).format(n)
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

function Change({ value, inverse = false }: { value: number | null | undefined; inverse?: boolean }) {
  if (value === null || value === undefined || !isFinite(value)) return <span style={{ fontSize: 12, color: C.inkLight }}>sin comparativa</span>
  const good = inverse ? value < 0 : value > 0
  const neutral = Math.abs(value) < 0.02
  const color = neutral ? C.inkMid : good ? C.green : C.red
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color }}>
      {value > 0 ? '▲' : value < 0 ? '▼' : '•'} {Math.abs(Math.round(value * 100))}% vs semana anterior
    </span>
  )
}

function Kpi({ label, value, change, inverse }: { label: string; value: string; change?: number | null; inverse?: boolean }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, color: C.inkMid, fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, marginBottom: 4, letterSpacing: '-0.02em' }}>{value}</div>
      <Change value={change} inverse={inverse} />
    </div>
  )
}

function PerformanceTab({ getToken, hasConnections, goToConnections }: {
  getToken: () => Promise<string | null>
  hasConnections: boolean
  goToConnections: () => void
}) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (refresh = false) => {
    if (!hasConnections) { setLoading(false); return }
    if (refresh) setRefreshing(true)
    else setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/campaigns${refresh ? '?refresh=1' : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(String(res.status))
      setData(await res.json())
    } catch {
      setError('No hemos podido cargar tus datos. Inténtalo de nuevo en unos segundos.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [getToken, hasConnections])

  useEffect(() => { load() }, [load])

  if (!hasConnections) return (
    <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 32, textAlign: 'center' }}>
      <h3 style={{ fontSize: 17, color: C.ink, margin: '0 0 8px' }}>Conecta tu primera plataforma</h3>
      <p style={{ fontSize: 14, color: C.inkMid, margin: '0 0 20px' }}>Growlia analizará tus campañas y te dirá qué mejorar cada día.</p>
      <button onClick={goToConnections} style={{ padding: '10px 20px', background: C.blue, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Conectar Google o Meta</button>
    </div>
  )

  if (loading) return <p style={{ color: C.inkMid }}>Analizando tus campañas...</p>
  if (error) return (
    <div style={{ padding: 16, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 10, color: '#991B1B', fontSize: 14 }}>
      {error} <button onClick={() => load(true)} style={{ marginLeft: 8, background: 'none', border: 'none', color: C.blue, fontWeight: 700, cursor: 'pointer' }}>Reintentar</button>
    </div>
  )

  const { summary, insights = [], campaigns = [], errors = [], period, fetchedAt } = data || {}
  const currency = campaigns[0]?.currency || 'EUR'
  const sorted = [...campaigns].sort((a: any, b: any) => b.current.spend - a.current.spend)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: C.ink, margin: 0 }}>Rendimiento</h2>
          {period && (
            <p style={{ fontSize: 13, color: C.inkMid, margin: '4px 0 0' }}>
              Últimos 7 días ({fmtDate(period.current.since)} – {fmtDate(period.current.until)}) frente a los 7 anteriores
            </p>
          )}
        </div>
        <button onClick={() => load(true)} disabled={refreshing} style={{ padding: '8px 14px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, color: C.ink, fontWeight: 600, fontSize: 13, cursor: refreshing ? 'wait' : 'pointer' }}>
          {refreshing ? 'Actualizando...' : '↻ Actualizar datos'}
        </button>
      </div>

      {errors.map((e: any) => (
        <div key={e.platform} style={{ padding: 14, background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10, color: '#92400E', fontSize: 13, marginBottom: 12, lineHeight: 1.5 }}>
          <strong>{PLATFORM_NAME[e.platform] || e.platform}:</strong> {e.message}
        </div>
      ))}

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          <Kpi label="Inversión" value={fmtMoney(summary.spend, currency)} change={summary.changes.spend} />
          <Kpi label="Conversiones" value={fmtNum(summary.conversions, 1)} change={summary.changes.conversions} />
          <Kpi label="Coste por conversión" value={fmtMoney(summary.cpa, currency)} change={summary.changes.cpa} inverse />
          <Kpi label="ROAS" value={summary.roas ? `${summary.roas.toFixed(2)}x` : '—'} change={summary.changes.roas} />
        </div>
      )}

      <h3 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '0 0 12px' }}>
        Qué hacer ahora {insights.length > 0 && <span style={{ color: C.inkLight, fontWeight: 600 }}>({insights.length})</span>}
      </h3>
      {insights.length === 0 ? (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, fontSize: 14, color: C.inkMid, marginBottom: 24 }}>
          {campaigns.length === 0 ? 'Cuando haya datos de campañas, aquí verás alertas y recomendaciones.' : 'Todo en orden: no hemos detectado problemas ni oportunidades claras esta semana.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {insights.map((i: any, idx: number) => {
            const s = SEVERITY[i.severity] || SEVERITY.info
            return (
              <div key={idx} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: s.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
                  <span style={{ fontSize: 12, color: C.inkMid }}>{PLATFORM_NAME[i.platform] || i.platform}{i.campaignName ? ` · ${i.campaignName}` : ''}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{i.title}</div>
                <div style={{ fontSize: 13, color: C.inkMid, marginBottom: 10, lineHeight: 1.5 }}>{i.message}</div>
                <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '10px 12px' }}>
                  <strong>Siguiente paso:</strong> {i.action}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <h3 style={{ fontSize: 16, fontWeight: 800, color: C.ink, margin: '0 0 12px' }}>Campañas ({campaigns.length})</h3>
      {sorted.length === 0 ? (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, fontSize: 14, color: C.inkMid }}>
          No hay campañas con actividad en las últimas dos semanas.
        </div>
      ) : (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 680 }}>
            <thead>
              <tr style={{ background: C.bg, color: C.inkMid, textAlign: 'left' }}>
                {['Campaña', 'Estado', 'Inversión', 'Conv.', 'CPA', 'ROAS', 'CTR'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((c: any) => (
                <tr key={`${c.platform}-${c.id}`} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 12px', maxWidth: 260 }}>
                    <div style={{ fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.inkLight }}>{PLATFORM_NAME[c.platform]} · {c.conversionLabel}</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: c.status === 'active' ? '#D1FAE5' : '#F1F5F9', color: c.status === 'active' ? '#065F46' : C.inkMid }}>
                      {c.status === 'active' ? 'Activa' : c.status === 'paused' ? 'Pausada' : 'Otra'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{fmtMoney(c.current.spend, c.currency)}</td>
                  <td style={{ padding: '10px 12px' }}>{fmtNum(c.current.conversions, 1)}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{fmtMoney(c.metrics.cpa, c.currency)}</td>
                  <td style={{ padding: '10px 12px' }}>{c.metrics.roas ? `${c.metrics.roas.toFixed(2)}x` : '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{(c.metrics.ctr * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fetchedAt && (
        <p style={{ fontSize: 12, color: C.inkLight, marginTop: 12 }}>
          Datos actualizados el {new Date(fetchedAt).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user, setUser] = useState<any>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [loadingConnections, setLoadingConnections] = useState(true)
  const [tab, setTab] = useState<'performance' | 'connections' | 'settings'>('performance')
  const [flash, setFlash] = useState<{ type: 'ok' | 'warn' | 'error'; text: string } | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)

  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }, [supabase])

  const loadConnections = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('connections')
      .select('id, platform, account_name, ad_account_id, last_synced_at, sync_error, created_at')
      .eq('user_id', userId)
    setConnections(data || [])
    setLoadingConnections(false)
    return data || []
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth'); return }
      setUser(session.user)
      const conns = await loadConnections(session.user.id)
      if (conns.length === 0) setTab('connections')

      // Mensaje al volver de Google/Meta
      const params = new URLSearchParams(window.location.search)
      const key = ['warning', 'error', 'connected']
        .map(k => (params.get(k) ? `${k}=${params.get(k)}` : null))
        .find(k => k && FLASH[k])
      if (key) {
        setFlash(FLASH[key])
        if (params.get('connected')) setTab('performance')
      } else if (params.get('error')) {
        setFlash({ type: 'error', text: 'No hemos podido completar la conexión. Inténtalo de nuevo y, si se repite, escríbenos a support@growlia.es.' })
      }
      if (params.toString()) window.history.replaceState({}, '', '/dashboard')
    }
    init()
  }, [supabase, router, loadConnections])

  const handleConnect = async (platform: 'google' | 'meta') => {
    setConnecting(platform)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/auth/oauth-url?platform=${platform}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!data.url) throw new Error()
      window.location.href = data.url
    } catch {
      setFlash({ type: 'error', text: 'No hemos podido iniciar la conexión. Recarga la página e inténtalo de nuevo.' })
      setConnecting(null)
    }
  }

  const handleDisconnect = async (conn: any) => {
    if (!confirm(`¿Desconectar ${PLATFORM_NAME[conn.platform] || conn.platform}? Growlia dejará de leer sus datos.`)) return
    await supabase.from('connections').delete().eq('id', conn.id)
    await supabase.from('campaigns_cache').delete().eq('user_id', user.id).eq('platform', conn.platform)
    if (user) loadConnections(user.id)
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ fontSize: 16, color: C.inkMid }}>Cargando...</div>
    </div>
  )

  const connected = (p: string) => connections.find(c => c.platform === p)
  const flashStyle = flash && {
    ok: { bg: '#ECFDF5', border: '#6EE7B7', color: '#065F46' },
    warn: { bg: '#FFFBEB', border: '#FCD34D', color: '#92400E' },
    error: { bg: '#FEF2F2', border: '#FCA5A5', color: '#991B1B' },
  }[flash.type]

  const platformCard = (p: 'google' | 'meta', subtitle: string, icon: JSX.Element) => {
    const conn = connected(p)
    return (
      <div style={{ background: C.white, border: `1px solid ${conn ? C.green : C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: C.blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>{PLATFORM_NAME[p]}</h3>
            <p style={{ fontSize: 12, color: C.inkLight, margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {conn ? (conn.account_name || 'Cuenta conectada') : subtitle}
            </p>
          </div>
          {conn && <span style={{ fontSize: 11, fontWeight: 700, color: '#065F46', background: '#D1FAE5', borderRadius: 6, padding: '4px 8px' }}>Conectado</span>}
        </div>
        {conn?.sync_error && (
          <p style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', borderRadius: 8, padding: '8px 10px', margin: '0 0 12px', lineHeight: 1.4 }}>{conn.sync_error}</p>
        )}
        {conn ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => handleConnect(p)} disabled={!!connecting} style={{ flex: 1, padding: 9, background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, color: C.ink, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Reconectar</button>
            <button onClick={() => handleDisconnect(conn)} style={{ flex: 1, padding: 9, background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 8, color: C.red, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>Desconectar</button>
          </div>
        ) : (
          <button onClick={() => handleConnect(p)} disabled={!!connecting} style={{ width: '100%', padding: 10, background: C.blue, border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 13, cursor: connecting ? 'wait' : 'pointer', opacity: connecting && connecting !== p ? 0.6 : 1 }}>
            {connecting === p ? 'Abriendo...' : 'Conectar'}
          </button>
        )}
      </div>
    )
  }

  const comingSoon = (name: string) => (
    <div key={name} style={{ background: C.white, border: `1px dashed ${C.border}`, borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: C.inkMid }}>{name}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.inkLight, background: C.bg, borderRadius: 6, padding: '4px 8px' }}>Próximamente</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{ background: C.white, borderBottom: `1px solid ${C.border}`, padding: '14px 5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>Grow<span style={{ color: C.blue }}>lia</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <div style={{ textAlign: 'right', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.ink }}>{user.user_metadata?.full_name || 'Mi cuenta'}</div>
            <div style={{ fontSize: 11, color: C.inkLight, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{user.email}</div>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 14px', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, color: C.ink, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Salir</button>
        </div>
      </nav>

      <div style={{ padding: '28px 5vw', maxWidth: 1200, margin: '0 auto' }}>
        {flash && flashStyle && (
          <div style={{ padding: '12px 14px', background: flashStyle.bg, border: `1px solid ${flashStyle.border}`, borderRadius: 10, color: flashStyle.color, fontSize: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', gap: 12, lineHeight: 1.5 }}>
            <span>{flash.text}</span>
            <button onClick={() => setFlash(null)} style={{ background: 'none', border: 'none', color: flashStyle.color, fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
        )}

        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, marginBottom: 28, overflowX: 'auto' }}>
          {([['performance', 'Rendimiento'], ['connections', 'Conexiones'], ['settings', 'Configuración']] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '12px 18px', border: 'none', background: 'transparent', borderBottom: tab === t ? `2px solid ${C.blue}` : '2px solid transparent', color: tab === t ? C.blue : C.inkMid, fontWeight: tab === t ? 800 : 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'performance' && !loadingConnections && (
          <PerformanceTab getToken={getToken} hasConnections={connections.length > 0} goToConnections={() => setTab('connections')} />
        )}

        {tab === 'connections' && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.ink, margin: '0 0 6px' }}>Tus plataformas</h2>
            <p style={{ fontSize: 14, color: C.inkMid, margin: '0 0 20px', lineHeight: 1.5 }}>
              Growlia se conecta con los permisos oficiales de cada plataforma. Tus credenciales se guardan cifradas y puedes desconectar en cualquier momento.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, marginBottom: 14 }}>
              {platformCard('google', 'Search, Performance Max, Display y YouTube', (
                <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              ))}
              {platformCard('meta', 'Facebook e Instagram', (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0866FF"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" /></svg>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {['LinkedIn Ads', 'TikTok Ads'].map(comingSoon)}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.ink, margin: '0 0 20px' }}>Configuración</h2>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.inkMid, marginBottom: 4 }}>Email</div>
              <div style={{ fontSize: 14, color: C.ink }}>{user.email}</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.inkMid, marginBottom: 4 }}>Nombre</div>
              <div style={{ fontSize: 14, color: C.ink }}>{user.user_metadata?.full_name || 'Sin configurar'}</div>
            </div>
            <div style={{ paddingTop: 20, borderTop: `1px solid ${C.border}`, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/privacidad" style={{ fontSize: 13, color: C.blue, textDecoration: 'none' }}>Política de privacidad</a>
              <span style={{ color: C.inkLight }}>·</span>
              <a href="/terminos" style={{ fontSize: 13, color: C.blue, textDecoration: 'none' }}>Términos</a>
              <span style={{ color: C.inkLight }}>·</span>
              <a href="mailto:support@growlia.es" style={{ fontSize: 13, color: C.blue, textDecoration: 'none' }}>Soporte</a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
