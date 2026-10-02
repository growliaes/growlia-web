'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const API_URL = 'https://api.growlia.es'

type Tab = 'home' | 'performance' | 'chat' | 'connections' | 'settings'

const PLATFORM_NAME: Record<string, string> = { google: 'Google Ads', meta: 'Meta Ads', linkedin: 'LinkedIn Ads', tiktok: 'TikTok Ads', all: 'Toda la cuenta' }

const SEVERITY: Record<string, { label: string; color: string }> = {
  critical: { label: 'Urgente', color: 'var(--neg)' },
  warning: { label: 'A vigilar', color: 'var(--warn)' },
  opportunity: { label: 'Oportunidad', color: 'var(--pos)' },
  info: { label: 'Informativo', color: 'var(--ink-3)' },
}

// Mensajes tras volver de Google/Meta
const FLASH: Record<string, { type: 'ok' | 'warn' | 'error'; text: string }> = {
  'connected=google': { type: 'ok', text: 'Google Ads conectado.' },
  'connected=meta': { type: 'ok', text: 'Meta Ads conectado.' },
  'warning=google_developer_token_not_approved': { type: 'warn', text: 'Google Ads se ha conectado, pero Google todavía no ha aprobado a Growlia para leer cuentas reales. Cuando lo apruebe verás tus campañas sin hacer nada más.' },
  'warning=google_no_accounts': { type: 'warn', text: 'Google Ads se ha conectado, pero ese usuario de Google no tiene cuentas publicitarias. Prueba con el email que usas en ads.google.com.' },
  'warning=google_permission_denied': { type: 'warn', text: 'Google Ads se ha conectado, pero tu usuario no tiene permisos suficientes en la cuenta publicitaria.' },
  'error=google_auth_cancelled': { type: 'error', text: 'Has cancelado la conexión con Google.' },
  'error=meta_auth_cancelled': { type: 'error', text: 'Has cancelado la conexión con Meta.' },
  'error=meta_no_accounts': { type: 'error', text: 'Tu usuario de Facebook no tiene cuentas publicitarias a las que Growlia pueda acceder.' },
  'error=invalid_state': { type: 'error', text: 'La conexión ha caducado por seguridad. Vuelve a intentarlo.' },
  'error=google_no_refresh_token': { type: 'error', text: 'Google no ha devuelto todos los permisos. Vuelve a conectar y acepta todos los permisos.' },
}

const fmtMoney = (n: number | null | undefined, cur = 'EUR') =>
  n === null || n === undefined ? '—' : new Intl.NumberFormat('es-ES', { style: 'currency', currency: cur, maximumFractionDigits: n >= 1000 ? 0 : 2 }).format(n)
const fmtNum = (n: number | null | undefined, dec = 0) =>
  n === null || n === undefined ? '—' : new Intl.NumberFormat('es-ES', { maximumFractionDigits: dec }).format(n)
const fmtDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
const fmtDateTime = (d: string) => new Date(d).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

function formatAccountId(platform: string, id: string) {
  if (platform === 'google' && /^\d{10}$/.test(id)) return `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6)}`
  return id.replace(/^act_/, '')
}

function Mark() {
  return (
    <span className="g-mark" aria-hidden>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
    </span>
  )
}

function Note({ type, children, onClose }: { type: 'ok' | 'warn' | 'error'; children: React.ReactNode; onClose?: () => void }) {
  const cls = type === 'ok' ? 'g-note-pos' : type === 'warn' ? 'g-note-warn' : 'g-note-neg'
  return (
    <div className={`g-note ${cls}`} role="status">
      <span>{children}</span>
      {onClose && <button onClick={onClose} aria-label="Cerrar" style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>}
    </div>
  )
}

function EmptyConnect({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  return (
    <div className="g-panel" style={{ padding: '40px 24px', textAlign: 'center' }}>
      <h2 className="g-h2">{title}</h2>
      <p className="g-sub" style={{ margin: '6px auto 20px' }}>{text}</p>
      <button className="g-btn g-btn-primary" onClick={onClick}>Conectar Google o Meta</button>
    </div>
  )
}

// ── Métricas ──────────────────────────────────────────────────
function Change({ value, inverse = false }: { value: number | null | undefined; inverse?: boolean }) {
  if (value === null || value === undefined || !isFinite(value)) return <span className="g-muted">Sin comparativa</span>
  const neutral = Math.abs(value) < 0.02
  const good = inverse ? value < 0 : value > 0
  const color = neutral ? 'var(--ink-3)' : good ? 'var(--pos)' : 'var(--neg)'
  return (
    <span className="num" style={{ fontSize: 13, color, fontWeight: 550 }}>
      {value > 0 ? '+' : ''}{Math.round(value * 100)}% <span className="g-vs" style={{ color: 'var(--ink-3)', fontWeight: 400 }}>vs semana anterior</span>
    </span>
  )
}

function KpiStrip({ summary, currency }: { summary: any; currency: string }) {
  const items = [
    { label: 'Inversión', value: fmtMoney(summary.spend, currency), change: summary.changes.spend, inverse: false },
    { label: 'Conversiones', value: fmtNum(summary.conversions, 1), change: summary.changes.conversions, inverse: false },
    { label: 'Coste por conversión', value: fmtMoney(summary.cpa, currency), change: summary.changes.cpa, inverse: true },
    { label: 'ROAS', value: summary.roas ? `${summary.roas.toFixed(2)}x` : '—', change: summary.changes.roas, inverse: false },
  ]
  return (
    <div className="g-panel g-kpis">
      {items.map(k => (
        <div key={k.label} className="g-kpi">
          <div className="g-kpi-label">{k.label}</div>
          <div className="g-kpi-value">{k.value}</div>
          <Change value={k.change} inverse={k.inverse} />
        </div>
      ))}
    </div>
  )
}

function InsightList({ insights, emptyText }: { insights: any[]; emptyText: string }) {
  if (!insights.length) return <div className="g-panel g-empty">{emptyText}</div>
  return (
    <div className="g-panel g-list">
      {insights.map((i, idx) => {
        const s = SEVERITY[i.severity] || SEVERITY.info
        return (
          <div key={idx} className="g-row" style={{ display: 'grid', gridTemplateColumns: '8px 1fr', gap: 14 }}>
            <span className="g-dot" style={{ background: s.color, marginTop: 8 }} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 600 }}>{i.title}</span>
                <span className="g-muted">{s.label}, {PLATFORM_NAME[i.platform] || i.platform}{i.campaignName ? `, ${i.campaignName}` : ''}</span>
              </div>
              <p style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 4 }}>{i.message}</p>
              <p style={{ fontSize: 14, marginTop: 8 }}><span style={{ fontWeight: 600 }}>Siguiente paso: </span>{i.action}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Rendimiento ───────────────────────────────────────────────
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
      const res = await fetch(`${API_URL}/api/campaigns${refresh ? '?refresh=1' : ''}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(String(res.status))
      setData(await res.json())
    } catch {
      setError('No se han podido cargar los datos. Vuelve a intentarlo en unos segundos.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [getToken, hasConnections])

  useEffect(() => { load() }, [load])

  if (!hasConnections) return <EmptyConnect title="Aún no hay datos" text="Conecta una plataforma y aquí verás el rendimiento de todas tus campañas juntas." onClick={goToConnections} />
  if (loading) return <p className="g-muted">Cargando campañas…</p>

  const { summary, insights = [], campaigns = [], errors = [], period, fetchedAt } = data || {}
  const currency = campaigns[0]?.currency || 'EUR'
  const sorted = [...campaigns].sort((a: any, b: any) => b.current.spend - a.current.spend)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="g-h1">Rendimiento</h1>
          {period && <p className="g-sub">Últimos 7 días ({fmtDate(period.current.since)} a {fmtDate(period.current.until)}) comparados con los 7 anteriores.</p>}
        </div>
        <button className="g-btn" onClick={() => load(true)} disabled={refreshing}>{refreshing ? 'Actualizando…' : 'Actualizar datos'}</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
        {error && <Note type="error">{error}</Note>}
        {errors.map((e: any) => <Note key={e.platform} type="warn"><strong>{PLATFORM_NAME[e.platform] || e.platform}.</strong> {e.message}</Note>)}
      </div>

      {summary && <div style={{ marginTop: 20 }}><KpiStrip summary={summary} currency={currency} /></div>}

      <section className="g-section">
        <div className="g-section-head"><h2 className="g-h2">Qué hacer ahora</h2>{insights.length > 0 && <span className="g-muted">{insights.length} {insights.length === 1 ? 'punto' : 'puntos'}</span>}</div>
        <InsightList insights={insights} emptyText={campaigns.length ? 'No hay problemas ni oportunidades claras esta semana.' : 'Cuando tus campañas tengan actividad, aquí verás alertas y recomendaciones.'} />
      </section>

      <section className="g-section">
        <div className="g-section-head"><h2 className="g-h2">Campañas</h2><span className="g-muted">{campaigns.length}</span></div>
        {sorted.length === 0 ? (
          <div className="g-panel g-empty">No hay campañas con actividad en las últimas dos semanas.</div>
        ) : (
          <div className="g-panel g-table-wrap">
            <table className="g-table">
              <thead>
                <tr><th>Campaña</th><th>Estado</th><th className="num">Inversión</th><th className="num">Conv.</th><th className="num">CPA</th><th className="num">ROAS</th><th className="num">CTR</th></tr>
              </thead>
              <tbody>
                {sorted.map((c: any) => (
                  <tr key={`${c.platform}-${c.id}`}>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                      <div className="g-muted">{PLATFORM_NAME[c.platform]}, {c.conversionLabel.toLowerCase()}</div>
                    </td>
                    <td><span className={`g-tag ${c.status === 'active' ? 'g-tag-pos' : ''}`}>{c.status === 'active' ? 'Activa' : c.status === 'paused' ? 'Pausada' : 'Otra'}</span></td>
                    <td className="num">{fmtMoney(c.current.spend, c.currency)}</td>
                    <td className="num">{fmtNum(c.current.conversions, 1)}</td>
                    <td className="num">{fmtMoney(c.metrics.cpa, c.currency)}</td>
                    <td className="num">{c.metrics.roas ? `${c.metrics.roas.toFixed(2)}x` : '—'}</td>
                    <td className="num">{(c.metrics.ctr * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {fetchedAt && <p className="g-muted" style={{ marginTop: 10 }}>Datos actualizados el {fmtDateTime(fetchedAt)}</p>}
      </section>
    </div>
  )
}

// ── Inicio: briefing + acciones ───────────────────────────────
const ACTION_STATUS: Record<string, { label: string; cls: string }> = {
  executed: { label: 'Aplicada', cls: 'g-tag-pos' },
  rejected: { label: 'Descartada', cls: '' },
  failed: { label: 'No aplicada', cls: 'g-tag-neg' },
  undone: { label: 'Deshecha', cls: 'g-tag-warn' },
  executing: { label: 'Aplicando', cls: '' },
}

function describeAction(a: any) {
  const cur = a.params?.currency || 'EUR'
  if (a.type === 'pause_campaign') return 'Pausar la campaña'
  if (a.type === 'change_budget') {
    const up = a.params.to > a.params.from
    return `${up ? 'Subir' : 'Bajar'} el presupuesto diario de ${fmtMoney(a.params.from, cur)} a ${fmtMoney(a.params.to, cur)}`
  }
  return a.type
}

function PacingBar({ pacing, currency }: { pacing: any; currency: string }) {
  const pct = Math.min(100, (pacing.spent / pacing.monthlyBudget) * 100)
  const proj = Math.min(100, (pacing.projected / pacing.monthlyBudget) * 100)
  const color = pacing.status === 'over' ? 'var(--neg)' : pacing.status === 'under' ? 'var(--warn)' : 'var(--pos)'
  return (
    <div className="g-panel g-pad">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', fontSize: 14 }}>
        <span style={{ fontWeight: 600 }}>Presupuesto del mes</span>
        <span className="num" style={{ color: 'var(--ink-2)' }}>{fmtMoney(pacing.spent, currency)} de {fmtMoney(pacing.monthlyBudget, currency)}</span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--line-2)', borderRadius: 3, overflow: 'hidden', margin: '12px 0 10px' }}>
        <div style={{ position: 'absolute', inset: 0, width: `${proj}%`, background: color, opacity: 0.22 }} />
        <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: color }} />
      </div>
      <p className="g-muted num">
        Previsión de cierre <strong style={{ color }}>{fmtMoney(pacing.projected, currency)}</strong>. Ritmo recomendado {fmtMoney(pacing.recommendedDaily, currency)} al día durante {pacing.daysLeft} días.
      </p>
    </div>
  )
}

function HomeTab({ getToken, hasConnections, goToConnections, firstName }: {
  getToken: () => Promise<string | null>
  hasConnections: boolean
  goToConnections: () => void
  firstName: string
}) {
  const [data, setData] = useState<any>(null)
  const [actions, setActions] = useState<{ pending: any[]; history: any[] }>({ pending: [], history: [] })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null)

  const loadActions = useCallback(async () => {
    const token = await getToken()
    const res = await fetch(`${API_URL}/api/actions`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setActions(await res.json())
  }, [getToken])

  const load = useCallback(async () => {
    if (!hasConnections) { setLoading(false); return }
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/campaigns`, { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setData(await res.json())
      await loadActions()
    } finally {
      setLoading(false)
    }
  }, [getToken, hasConnections, loadActions])

  useEffect(() => { load() }, [load])

  const decide = async (id: string, op: 'approve' | 'reject' | 'undo') => {
    if (op === 'approve' && !confirm('Growlia aplicará este cambio ahora en la plataforma. ¿Continuar?')) return
    if (op === 'undo' && !confirm('¿Deshacer este cambio y volver a la situación anterior?')) return
    setBusy(id)
    setNotice(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/actions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, op }),
      })
      const body = await res.json()
      setNotice({ ok: res.ok, text: body.message || body.error || 'Hecho.' })
      await loadActions()
    } catch {
      setNotice({ ok: false, text: 'No se ha podido completar la acción. Vuelve a intentarlo.' })
    } finally {
      setBusy(null)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 14 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches'
  const todayRaw = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  const today = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1)

  if (!hasConnections) return (
    <div>
      <p className="g-muted">{today}</p>
      <h1 className="g-h1" style={{ marginTop: 4 }}>{greeting}{firstName ? `, ${firstName}` : ''}</h1>
      <div style={{ marginTop: 24 }}>
        <EmptyConnect title="Conecta tu primera cuenta" text="Cada mañana tendrás aquí el resumen de tus campañas y los cambios que recomendamos hacer." onClick={goToConnections} />
      </div>
    </div>
  )

  if (loading) return <p className="g-muted">Preparando tu resumen…</p>

  const b = data?.briefing
  const observe = data?.autopilotMode === 'observe'
  const currency = data?.campaigns?.[0]?.currency || 'EUR'

  return (
    <div>
      <p className="g-muted">{today}</p>
      <h1 className="g-h1" style={{ marginTop: 4, maxWidth: '22ch', fontSize: 'clamp(28px, 4vw, 38px)' }}>{b?.headline || `${greeting}${firstName ? `, ${firstName}` : ''}`}</h1>

      <div style={{ marginTop: 16, maxWidth: '68ch', fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)' }}>
        {b ? b.lines.map((l: string, i: number) => <p key={i} style={{ marginTop: i ? 4 : 0 }} className="num">{l}</p>)
          : <p>{data?.errors?.[0]?.message || 'En cuanto tus campañas tengan actividad, aquí verás el resumen del día.'}</p>}
      </div>

      {b?.focus && (
        <div className="g-panel g-pad" style={{ marginTop: 20, borderLeft: '3px solid var(--accent)', borderRadius: '4px var(--radius) var(--radius) 4px' }}>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Lo más importante hoy</p>
          <p style={{ color: 'var(--ink-2)', fontSize: 14 }}>{b.focus}</p>
        </div>
      )}

      {data?.summary && <div style={{ marginTop: 24 }}><KpiStrip summary={data.summary} currency={currency} /></div>}
      {data?.pacing && <div style={{ marginTop: 12 }}><PacingBar pacing={data.pacing} currency={currency} /></div>}

      <section className="g-section">
        <div className="g-section-head">
          <h2 className="g-h2">Cambios recomendados</h2>
          {actions.pending.length > 0 && <span className="g-muted">{actions.pending.length} pendientes</span>}
        </div>
        <p className="g-muted" style={{ marginTop: -6, marginBottom: 12, maxWidth: '70ch' }}>
          {observe
            ? 'Estás en modo Observar: Growlia solo avisa y no propone cambios. Puedes cambiarlo en Configuración.'
            : 'Nada se aplica sin tu aprobación. Antes de aplicar comprobamos que la campaña no ha cambiado, y puedes deshacer durante 7 días.'}
        </p>
        {notice && <div style={{ marginBottom: 12 }}><Note type={notice.ok ? 'ok' : 'error'} onClose={() => setNotice(null)}>{notice.text}</Note></div>}

        {actions.pending.length === 0 ? (
          <div className="g-panel g-empty">No hay cambios pendientes. Growlia revisa tus campañas cada mañana y propondrá cambios cuando tengan sentido.</div>
        ) : (
          <div className="g-panel g-list">
            {actions.pending.map(a => (
              <div key={a.id} className="g-row">
                <p className="g-muted">{PLATFORM_NAME[a.platform] || a.platform}, {a.campaign_name}</p>
                <p style={{ fontWeight: 600, fontSize: 16, marginTop: 2 }} className="num">{describeAction(a)}</p>
                <p style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 6 }}>{a.reason}</p>
                {a.expected_impact && <p style={{ color: 'var(--ink-2)', fontSize: 14, marginTop: 2 }}>{a.expected_impact}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <button className="g-btn g-btn-primary" onClick={() => decide(a.id, 'approve')} disabled={!!busy}>{busy === a.id ? 'Aplicando…' : 'Aprobar y aplicar'}</button>
                  <button className="g-btn" onClick={() => decide(a.id, 'reject')} disabled={!!busy}>Descartar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {actions.history.length > 0 && (
        <section className="g-section">
          <div className="g-section-head"><h2 className="g-h2">Historial de cambios</h2></div>
          <div className="g-panel g-list">
            {actions.history.map(a => {
              const st = ACTION_STATUS[a.status] || { label: a.status, cls: '' }
              const canUndo = a.status === 'executed' && a.executed_at && Date.now() - new Date(a.executed_at).getTime() < 7 * 86400_000
              return (
                <div key={a.id} className="g-row" style={{ display: 'flex', gap: '8px 16px', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0, flex: '1 1 240px' }}>
                    <p style={{ fontWeight: 550, fontSize: 14 }} className="num">{describeAction(a)}</p>
                    <p className="g-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.campaign_name}, {fmtDateTime(a.executed_at || a.decided_at || a.created_at)}</p>
                    {a.status === 'failed' && a.error && <p style={{ fontSize: 13, color: 'var(--neg)', marginTop: 2 }}>{a.error}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span className={`g-tag ${st.cls}`}>{st.label}</span>
                    {canUndo && <button className="g-btn g-btn-sm" onClick={() => decide(a.id, 'undo')} disabled={!!busy}>Deshacer</button>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

// ── Chat ──────────────────────────────────────────────────────
const SUGGESTIONS = [
  '¿Qué campaña me trae los clientes más baratos?',
  '¿Por qué ha cambiado mi coste por conversión esta semana?',
  '¿Dónde pondrías 500 € más de presupuesto?',
  '¿Qué campaña pausarías y por qué?',
]

function ChatTab({ getToken, hasConnections, goToConnections }: {
  getToken: () => Promise<string | null>
  hasConnections: boolean
  goToConnections: () => void
}) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, loading])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || loading) return
    const next = [...messages, { role: 'user' as const, content: q }]
    setMessages(next)
    setInput('')
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'error')
      setMessages([...next, { role: 'assistant', content: body.reply }])
    } catch (e: any) {
      setError(e?.message && e.message !== 'error' ? e.message : 'No se ha podido responder. Vuelve a intentarlo.')
      setMessages(messages)
      setInput(q)
    } finally {
      setLoading(false)
    }
  }

  if (!hasConnections) return <EmptyConnect title="Pregúntale a Growlia" text="Conecta una plataforma y pregunta lo que quieras sobre tus campañas, con tus datos reales." onClick={goToConnections} />

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 className="g-h1">Pregúntale a Growlia</h1>
      <p className="g-sub">Responde con los datos reales de tus cuentas de los últimos 14 días. Si algo no está en los datos, te lo dice.</p>

      {messages.length === 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
          {SUGGESTIONS.map(q => <button key={q} className="g-chip" onClick={() => send(q)} disabled={loading}>{q}</button>)}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
        {messages.map((m, i) => <div key={i} className={`g-msg ${m.role === 'user' ? 'g-msg-user' : 'g-msg-ai'}`}>{m.content}</div>)}
        {loading && <div className="g-msg g-msg-ai" style={{ color: 'var(--ink-3)' }}>Revisando tus campañas…</div>}
        <div ref={endRef} />
      </div>

      {error && <div style={{ marginTop: 12 }}><Note type="error">{error}</Note></div>}

      <form onSubmit={e => { e.preventDefault(); send(input) }} style={{ display: 'flex', gap: 8, position: 'sticky', bottom: 16, marginTop: 16, background: 'var(--canvas)', paddingTop: 8 }}>
        <input className="g-input" style={{ height: 44 }} value={input} onChange={e => setInput(e.target.value)} placeholder="Escribe tu pregunta" maxLength={2000} disabled={loading} aria-label="Pregunta" />
        <button type="submit" className="g-btn g-btn-dark" style={{ height: 44 }} disabled={loading || !input.trim()}>Enviar</button>
      </form>
      {messages.length > 0 && <button className="g-link" style={{ marginTop: 12, color: 'var(--ink-3)' }} onClick={() => { setMessages([]); setError('') }}>Empezar una conversación nueva</button>}
    </div>
  )
}

// ── Conexiones ────────────────────────────────────────────────
function AccountPicker({ conn, getToken, onDone, onCancel }: {
  conn: any
  getToken: () => Promise<string | null>
  onDone: (name: string) => void
  onCancel?: () => void
}) {
  const options: any[] = conn.available_accounts || []
  const [selected, setSelected] = useState<string>(conn.ad_account_id !== 'pending_selection' ? conn.ad_account_id : '')
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const filtered = options.filter(o => !query || `${o.name} ${o.id} ${o.via || ''}`.toLowerCase().includes(query.toLowerCase()))

  const confirmChoice = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/connections/select`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: conn.platform, accountId: selected }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error)
      onDone(body.account?.name || '')
    } catch (e: any) {
      setError(e?.message || 'No se ha podido guardar la selección.')
      setSaving(false)
    }
  }

  return (
    <div className="g-panel" style={{ marginBottom: 24, borderColor: 'var(--accent)', boxShadow: '0 0 0 3px var(--accent-soft)' }}>
      <div className="g-pad">
        <h2 className="g-h2">Elige la cuenta de {PLATFORM_NAME[conn.platform]}</h2>
        <p className="g-sub">Hemos encontrado {options.length} cuentas. Growlia solo leerá y propondrá cambios en la que elijas, y puedes cambiarla cuando quieras.</p>
        {options.length > 6 && <input className="g-input" style={{ marginTop: 14 }} value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por nombre o ID" aria-label="Buscar cuenta" />}
      </div>
      <div className="g-list" style={{ maxHeight: 340, overflowY: 'auto', borderTop: '1px solid var(--line-2)' }}>
        {filtered.map(o => (
          <label key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', background: selected === o.id ? 'var(--accent-soft)' : undefined }}>
            <input type="radio" name={`acc-${conn.platform}`} checked={selected === o.id} onChange={() => setSelected(o.id)} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 550, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.name}</div>
              <div className="g-muted num">{formatAccountId(conn.platform, o.id)}, {o.currency}{o.via ? `, a través de ${o.via}` : ''}{o.active === false ? ', inactiva' : ''}</div>
            </div>
          </label>
        ))}
        {filtered.length === 0 && <div className="g-empty">Ninguna cuenta coincide con la búsqueda.</div>}
      </div>
      <div className="g-pad" style={{ borderTop: '1px solid var(--line-2)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="g-btn g-btn-primary" onClick={confirmChoice} disabled={!selected || saving}>{saving ? 'Guardando…' : 'Usar esta cuenta'}</button>
        {onCancel && <button className="g-btn" onClick={onCancel}>Cancelar</button>}
        {error && <span style={{ color: 'var(--neg)', fontSize: 13 }}>{error}</span>}
      </div>
    </div>
  )
}

const HEALTH_DOT: Record<string, string> = { ok: 'var(--pos)', warning: 'var(--warn)', critical: 'var(--neg)' }

function HealthPanel({ conn, getToken, onUpdated }: { conn: any; getToken: () => Promise<string | null>; onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const checks: any[] = conn.health || []
  if (conn.ad_account_id === 'pending_selection') return null

  const issues = checks.filter(c => c.status !== 'ok')
  const critical = checks.some(c => c.status === 'critical')
  const summary = !checks.length ? 'Sin revisar' : issues.length ? `${issues.length} ${issues.length === 1 ? 'punto' : 'puntos'} a revisar` : 'Todo correcto'
  const summaryColor = !checks.length ? 'var(--ink-3)' : critical ? 'var(--neg)' : issues.length ? 'var(--warn)' : 'var(--pos)'

  const recheck = async () => {
    setChecking(true)
    try {
      const token = await getToken()
      await fetch(`${API_URL}/api/connections/health`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: conn.platform }),
      })
      onUpdated()
      setOpen(true)
    } finally {
      setChecking(false)
    }
  }

  const order: Record<string, number> = { critical: 0, warning: 1, ok: 2 }
  return (
    <div style={{ borderTop: '1px solid var(--line-2)', padding: '12px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <button onClick={() => checks.length && setOpen(!open)} aria-expanded={open} style={{ background: 'none', border: 0, padding: 0, cursor: checks.length ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          <span className="g-dot" style={{ background: summaryColor }} />
          <span>Salud de la cuenta: <span style={{ color: summaryColor, fontWeight: 550 }}>{summary}</span></span>
        </button>
        <button className="g-link" onClick={recheck} disabled={checking}>{checking ? 'Revisando…' : 'Revisar ahora'}</button>
      </div>
      {open && checks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
          {[...checks].sort((a, b) => order[a.status] - order[b.status]).map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '8px 1fr', gap: 12, fontSize: 14 }}>
              <span className="g-dot" style={{ background: HEALTH_DOT[c.status] || 'var(--ink-3)', marginTop: 7 }} />
              <div>
                <p style={{ fontWeight: 550 }}>{c.title}</p>
                <p style={{ color: 'var(--ink-2)' }}>{c.detail}</p>
                {c.fix && c.status !== 'ok' && <p style={{ marginTop: 4 }}><span style={{ fontWeight: 600 }}>Cómo arreglarlo: </span>{c.fix}</p>}
              </div>
            </div>
          ))}
          {conn.health_checked_at && <p className="g-muted">Última revisión el {fmtDateTime(conn.health_checked_at)}</p>}
        </div>
      )}
    </div>
  )
}

// ── Configuración ─────────────────────────────────────────────
function AutopilotSettings({ userId }: { userId: string }) {
  const supabase = createClientComponentClient()
  const [mode, setMode] = useState<string>('suggest')
  const [maxChange, setMaxChange] = useState<number>(0.2)
  const [monthly, setMonthly] = useState('')
  const [saved, setSaved] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('autopilot_mode, max_budget_change, monthly_budget').eq('id', userId).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setMode(data.autopilot_mode)
          setMaxChange(Number(data.max_budget_change))
          setMonthly(data.monthly_budget ? String(data.monthly_budget) : '')
        }
      })
  }, [supabase, userId])

  const save = async (patch: Record<string, any>) => {
    const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
    setSaved(error ? 'No se ha podido guardar.' : 'Guardado')
    setTimeout(() => setSaved(''), 2000)
  }

  const modes = [
    { id: 'observe', title: 'Observar', desc: 'Solo alertas y recomendaciones. No propone cambios.' },
    { id: 'suggest', title: 'Sugerir', desc: 'Propone cambios concretos y tú los apruebas.' },
    { id: 'auto', title: 'Automático', desc: 'Aplica los cambios dentro de tus límites y te avisa de todo. Disponible próximamente.', soon: true },
  ]

  return (
    <>
      <section className="g-section">
        <div className="g-section-head"><h2 className="g-h2">Piloto automático</h2>{saved && <span className="g-muted" style={{ color: saved === 'Guardado' ? 'var(--pos)' : 'var(--neg)' }}>{saved}</span>}</div>
        <div className="g-panel g-list" role="radiogroup" aria-label="Nivel de autonomía">
          {modes.map(m => (
            <label key={m.id} style={{ display: 'flex', gap: 12, padding: '14px 20px', cursor: m.soon ? 'not-allowed' : 'pointer', opacity: m.soon ? 0.55 : 1, background: mode === m.id ? 'var(--accent-soft)' : undefined }}>
              <input type="radio" name="autopilot" checked={mode === m.id} disabled={m.soon} onChange={() => { setMode(m.id); save({ autopilot_mode: m.id }) }} style={{ marginTop: 4 }} />
              <div>
                <p style={{ fontWeight: 550 }}>{m.title}</p>
                <p className="g-muted" style={{ fontSize: 14 }}>{m.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="g-section">
        <div className="g-section-head"><h2 className="g-h2">Límites</h2></div>
        <div className="g-panel g-list">
          <div className="g-row">
            <label className="g-label" htmlFor="monthly">Presupuesto mensual total</label>
            <div style={{ display: 'flex', gap: 8, maxWidth: 360 }}>
              <input id="monthly" className="g-input num" type="number" inputMode="decimal" min="0" value={monthly} onChange={e => setMonthly(e.target.value)} placeholder="3000" />
              <button className="g-btn" onClick={() => save({ monthly_budget: Number(monthly) > 0 ? Number(monthly) : null })}>Guardar</button>
            </div>
            <p className="g-muted" style={{ marginTop: 8 }}>Suma de todas las plataformas. Growlia vigila el ritmo de gasto y no propone subidas si vas por encima.</p>
          </div>
          <div className="g-row">
            <p className="g-label">Cambio máximo de presupuesto por acción</p>
            <div className="g-seg" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: 280, marginBottom: 8 }}>
              {[0.1, 0.2, 0.3].map(v => (
                <button key={v} aria-pressed={maxChange === v} onClick={() => { setMaxChange(v); save({ max_budget_change: v }) }}>{Math.round(v * 100)}%</button>
              ))}
            </div>
            <p className="g-muted">Recomendado 20%. Cambios mayores pueden reiniciar el aprendizaje de Google y Meta.</p>
          </div>
        </div>
      </section>
    </>
  )
}

// ── Página ────────────────────────────────────────────────────
const NAV: { id: Tab; label: string }[] = [
  { id: 'home', label: 'Inicio' },
  { id: 'performance', label: 'Rendimiento' },
  { id: 'chat', label: 'Pregúntale' },
  { id: 'connections', label: 'Conexiones' },
  { id: 'settings', label: 'Configuración' },
]

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [user, setUser] = useState<any>(null)
  const [connections, setConnections] = useState<any[]>([])
  const [loadingConnections, setLoadingConnections] = useState(true)
  const [tab, setTab] = useState<Tab>('home')
  const [flash, setFlash] = useState<{ type: 'ok' | 'warn' | 'error'; text: string } | null>(null)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [picking, setPicking] = useState<string | null>(null)

  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }, [supabase])

  const loadConnections = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('connections')
      .select('id, platform, account_name, ad_account_id, available_accounts, last_synced_at, sync_error, health, health_checked_at, created_at')
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

      const params = new URLSearchParams(window.location.search)
      const pending = conns.find((c: any) => c.ad_account_id === 'pending_selection')
      const selectParam = params.get('select')
      if (pending || selectParam) {
        setTab('connections')
        setPicking(selectParam || pending.platform)
      }

      const key = ['warning', 'error', 'connected']
        .map(k => (params.get(k) ? `${k}=${params.get(k)}` : null))
        .find(k => k && FLASH[k])
      if (key) {
        setFlash(FLASH[key])
        if (params.get('connected')) setTab('home')
      } else if (params.get('error')) {
        setFlash({ type: 'error', text: 'No se ha podido completar la conexión. Vuelve a intentarlo y, si se repite, escribe a support@growlia.es.' })
      }
      if (params.toString()) window.history.replaceState({}, '', '/dashboard')
    }
    init()
  }, [supabase, router, loadConnections])

  const handleConnect = async (platform: 'google' | 'meta') => {
    setConnecting(platform)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/auth/oauth-url?platform=${platform}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (!data.url) throw new Error()
      window.location.href = data.url
    } catch {
      setFlash({ type: 'error', text: 'No se ha podido iniciar la conexión. Recarga la página y vuelve a intentarlo.' })
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

  if (!user) return <div className="g-auth"><p className="g-muted">Cargando…</p></div>

  const connected = (p: string) => connections.find(c => c.platform === p)
  const firstName = (user.user_metadata?.full_name || '').split(' ')[0]
  const displayName = user.user_metadata?.full_name || 'Mi cuenta'

  const platformCard = (p: 'google' | 'meta', subtitle: string, icon: JSX.Element) => {
    const conn = connected(p)
    const pendingSel = conn?.ad_account_id === 'pending_selection'
    return (
      <div className="g-panel">
        <div className="g-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 9, border: '1px solid var(--line)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600 }}>{PLATFORM_NAME[p]}</span>
              {conn && !pendingSel && <span className="g-tag g-tag-pos">Conectado</span>}
              {pendingSel && <span className="g-tag g-tag-warn">Falta elegir cuenta</span>}
            </div>
            <p className="g-muted num" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {conn && !pendingSel ? `${conn.account_name || 'Cuenta conectada'}, ${formatAccountId(p, conn.ad_account_id || '')}` : subtitle}
            </p>
          </div>
        </div>
        {conn?.sync_error && <div style={{ padding: '0 20px 14px' }}><Note type="warn">{conn.sync_error}</Note></div>}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!conn && <button className="g-btn g-btn-primary g-btn-block" onClick={() => handleConnect(p)} disabled={!!connecting}>{connecting === p ? 'Abriendo…' : `Conectar ${PLATFORM_NAME[p]}`}</button>}
          {pendingSel && <button className="g-btn g-btn-primary" onClick={() => setPicking(p)}>Elegir cuenta</button>}
          {conn && !pendingSel && (conn.available_accounts || []).length > 1 && <button className="g-btn g-btn-sm" onClick={() => setPicking(p)}>Cambiar cuenta</button>}
          {conn && <button className="g-btn g-btn-sm" onClick={() => handleConnect(p)} disabled={!!connecting}>Reconectar</button>}
          {conn && <button className="g-btn g-btn-sm g-btn-danger" onClick={() => handleDisconnect(conn)}>Desconectar</button>}
        </div>
        {conn && <HealthPanel conn={conn} getToken={getToken} onUpdated={() => loadConnections(user.id)} />}
      </div>
    )
  }

  const navButtons = (cls?: string) => NAV.map(n => (
    <button key={n.id} className={cls} aria-current={tab === n.id ? 'page' : undefined} onClick={() => setTab(n.id)}>{n.label}</button>
  ))

  return (
    <div className="g-app">
      <aside className="g-side">
        <div className="g-brand"><Mark />Growlia</div>
        <nav className="g-nav" aria-label="Secciones">{navButtons()}</nav>
        <div className="g-user">
          <p style={{ fontWeight: 550 }}>{displayName}</p>
          <p className="email">{user.email}</p>
          <button className="g-link" style={{ marginTop: 10, color: 'var(--ink-2)' }} onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <div style={{ minWidth: 0 }}>
        <header className="g-topbar">
          <div className="g-topbar-row">
            <div className="g-brand" style={{ padding: 0 }}><Mark />Growlia</div>
            <button className="g-link" style={{ color: 'var(--ink-2)' }} onClick={handleLogout}>Salir</button>
          </div>
          <nav className="g-tabs" aria-label="Secciones">{navButtons()}</nav>
        </header>

        <main className="g-main">
          <div className="g-content">
            {flash && <div style={{ marginBottom: 20 }}><Note type={flash.type} onClose={() => setFlash(null)}>{flash.text}</Note></div>}

            {tab === 'home' && !loadingConnections && (
              <HomeTab getToken={getToken} hasConnections={connections.length > 0} goToConnections={() => setTab('connections')} firstName={firstName} />
            )}
            {tab === 'performance' && !loadingConnections && (
              <PerformanceTab getToken={getToken} hasConnections={connections.length > 0} goToConnections={() => setTab('connections')} />
            )}
            {tab === 'chat' && !loadingConnections && (
              <ChatTab getToken={getToken} hasConnections={connections.length > 0} goToConnections={() => setTab('connections')} />
            )}

            {tab === 'connections' && (
              <div>
                {picking && connected(picking) && (
                  <AccountPicker
                    key={picking}
                    conn={connected(picking)}
                    getToken={getToken}
                    onCancel={connected(picking)?.ad_account_id !== 'pending_selection' ? () => setPicking(null) : undefined}
                    onDone={async (name) => {
                      setPicking(null)
                      await loadConnections(user.id)
                      setFlash({ type: 'ok', text: `Growlia gestionará la cuenta "${name}".` })
                      setTab('home')
                    }}
                  />
                )}
                <h1 className="g-h1">Conexiones</h1>
                <p className="g-sub">Growlia se conecta con los permisos oficiales de cada plataforma. Las credenciales se guardan cifradas y puedes desconectar cuando quieras.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginTop: 24 }}>
                  {platformCard('google', 'Search, Performance Max, Display y YouTube', (
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                  ))}
                  {platformCard('meta', 'Facebook e Instagram', (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#0866FF" aria-hidden><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" /></svg>
                  ))}
                </div>
                <div className="g-panel g-list" style={{ marginTop: 16 }}>
                  {['LinkedIn Ads', 'TikTok Ads'].map(name => (
                    <div key={name} className="g-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
                      <span style={{ color: 'var(--ink-2)' }}>{name}</span>
                      <span className="g-muted">Próximamente</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div>
                <h1 className="g-h1">Configuración</h1>
                <AutopilotSettings userId={user.id} />
                <section className="g-section">
                  <div className="g-section-head"><h2 className="g-h2">Cuenta</h2></div>
                  <div className="g-panel g-list">
                    <div className="g-row" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span className="g-muted" style={{ fontSize: 14 }}>Nombre</span><span>{user.user_metadata?.full_name || 'Sin configurar'}</span></div>
                    <div className="g-row" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span className="g-muted" style={{ fontSize: 14 }}>Email</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</span></div>
                  </div>
                  <p className="g-muted" style={{ marginTop: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <a href="/privacidad" style={{ color: 'var(--ink-2)' }}>Política de privacidad</a>
                    <a href="/terminos" style={{ color: 'var(--ink-2)' }}>Términos</a>
                    <a href="mailto:support@growlia.es" style={{ color: 'var(--ink-2)' }}>support@growlia.es</a>
                  </p>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
