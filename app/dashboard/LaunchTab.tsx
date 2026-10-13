'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const API_URL = 'https://api.growlia.es'

type Goal = 'leads' | 'calls' | 'sales' | 'visits'
type Keyword = { text: string; match: 'EXACT' | 'PHRASE' }
type AdGroup = { name: string; finalUrl: string; keywords: Keyword[]; headlines: string[]; descriptions: string[]; path1: string; path2: string }
type Plan = {
  campaignName: string; dailyBudget: number; bidding: 'MAXIMIZE_CONVERSIONS' | 'MAXIMIZE_CLICKS'; maxCpc: number | null
  languages: string[]; locations: { query: string; id?: string; name?: string }[]; adGroups: AdGroup[]
  negatives: string[]; rationale: string[]; warnings: string[]
}
type Launch = {
  id: string; status: 'draft' | 'creating' | 'created' | 'active' | 'failed'; brief: any; plan: Plan
  account_id: string | null; campaign_id: string | null; campaign_name: string | null; error: string | null
  created_at: string; launched_at: string | null; activated_at?: string | null
  watch?: { checked_at?: string; terms?: number; proposed?: number; insights?: { severity: string; title: string }[] }
}

const GOALS: { id: Goal; label: string }[] = [
  { id: 'leads', label: 'Formularios' },
  { id: 'calls', label: 'Llamadas' },
  { id: 'sales', label: 'Ventas online' },
  { id: 'visits', label: 'Visitas al local' },
]
const LANG: Record<string, string> = { es: 'Español', ca: 'Catalán', en: 'Inglés', eu: 'Euskera', gl: 'Gallego', fr: 'Francés', de: 'Alemán', it: 'Italiano', pt: 'Portugués' }
const STATUS: Record<Launch['status'], { label: string; cls: string }> = {
  draft: { label: 'Borrador', cls: 'g-tag' },
  creating: { label: 'Creando…', cls: 'g-tag g-tag-warn' },
  created: { label: 'Creada en pausa', cls: 'g-tag g-tag-warn' },
  active: { label: 'Activa', cls: 'g-tag g-tag-pos' },
  failed: { label: 'No se pudo crear', cls: 'g-tag g-tag-neg' },
}
const LOADING_STEPS = ['Leyendo tu web…', 'Analizando cómo te buscan tus clientes…', 'Eligiendo palabras clave…', 'Redactando los anuncios…', 'Revisando límites y políticas de Google…']

const money = (n: number, cur = 'EUR') => new Intl.NumberFormat('es-ES', { style: 'currency', currency: cur, maximumFractionDigits: 2 }).format(n)
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, '') } catch { return u } }
const kwLabel = (k: Keyword) => (k.match === 'EXACT' ? `[${k.text}]` : `"${k.text}"`)
const parseKeywords = (s: string): Keyword[] => s.split('\n').map(l => l.trim()).filter(Boolean).map(l =>
  /^\[.*\]$/.test(l) ? { text: l.slice(1, -1).trim(), match: 'EXACT' } : { text: l.replace(/^"|"$/g, '').trim(), match: 'PHRASE' })
const lines = (s: string) => s.split('\n').map(l => l.trim()).filter(Boolean)

function Note({ type, children }: { type: 'ok' | 'warn' | 'error'; children: React.ReactNode }) {
  const cls = type === 'ok' ? 'g-note g-note-pos' : type === 'warn' ? 'g-note g-note-warn' : 'g-note g-note-neg'
  return <div className={cls} role={type === 'error' ? 'alert' : 'status'}><div>{children}</div></div>
}

function Counter({ value, max }: { value: string; max: number }) {
  return <span className="num" style={{ fontSize: 12, color: value.length > max ? 'var(--neg)' : 'var(--ink-3)', flexShrink: 0 }}>{value.length}/{max}</span>
}

// ── Brief ────────────────────────────────────────────────────
function BriefForm({ onSubmit, busy, initial }: { onSubmit: (b: any) => void; busy: boolean; initial?: any }) {
  const [b, setB] = useState({ business: '', website: '', services: '', area: '', monthlyBudget: '', goal: 'leads' as Goal, extra: '', ...(initial || {}) })
  const set = (k: string) => (e: any) => setB((x: any) => ({ ...x, [k]: e.target.value }))
  const budget = Number(b.monthlyBudget)
  const ready = b.business.trim().length >= 10 && b.website.trim() && b.services.trim() && b.area.trim() && budget >= 50

  return (
    <form className="g-panel g-list" onSubmit={e => { e.preventDefault(); if (ready && !busy) onSubmit({ ...b, monthlyBudget: budget }) }}>
      <div className="g-row">
        <label className="g-label" htmlFor="l-business">Tu negocio</label>
        <textarea id="l-business" className="g-input g-textarea" rows={3} value={b.business} onChange={set('business')} placeholder="Clínica de fisioterapia en Sant Cugat con 12 años de experiencia. Atendemos lesiones deportivas, dolor de espalda y rehabilitación." />
      </div>
      <div className="g-row lc-grid2">
        <div>
          <label className="g-label" htmlFor="l-web">Web</label>
          <input id="l-web" className="g-input" value={b.website} onChange={set('website')} placeholder="tuweb.es" inputMode="url" autoComplete="url" />
        </div>
        <div>
          <label className="g-label" htmlFor="l-area">Dónde están tus clientes</label>
          <input id="l-area" className="g-input" value={b.area} onChange={set('area')} placeholder="Sant Cugat y alrededores" />
        </div>
      </div>
      <div className="g-row">
        <label className="g-label" htmlFor="l-services">Qué quieres anunciar</label>
        <textarea id="l-services" className="g-input g-textarea" rows={2} value={b.services} onChange={set('services')} placeholder="Fisioterapia deportiva y tratamiento de dolor de espalda" />
      </div>
      <div className="g-row lc-grid2">
        <div>
          <label className="g-label" htmlFor="l-budget">Presupuesto mensual (€)</label>
          <input id="l-budget" className="g-input num" type="number" min={50} step={10} inputMode="decimal" value={b.monthlyBudget} onChange={set('monthlyBudget')} placeholder="600" />
          <p className="g-muted" style={{ fontSize: 13, marginTop: 6 }}>{budget >= 50 ? `Unos ${money(budget / 30.4)} al día. Google puede gastar algo más un día y menos otro, sin pasarse del total del mes.` : 'Mínimo 50 €. Para un negocio local, entre 300 y 1.000 € suele ser un buen punto de partida.'}</p>
        </div>
        <div>
          <p className="g-label">Qué quieres conseguir</p>
          <div className="g-seg" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 0 }}>
            {GOALS.map(g => <button type="button" key={g.id} aria-pressed={b.goal === g.id} onClick={() => setB((x: any) => ({ ...x, goal: g.id }))}>{g.label}</button>)}
          </div>
        </div>
      </div>
      <div className="g-row">
        <label className="g-label" htmlFor="l-extra">Algo más que deba saber <span className="g-muted" style={{ fontWeight: 400 }}>(opcional)</span></label>
        <textarea id="l-extra" className="g-input g-textarea" rows={2} value={b.extra} onChange={set('extra')} placeholder="Primera visita con valoración incluida, abrimos sábados, más de 300 reseñas de 5 estrellas…" />
        <p className="g-muted" style={{ fontSize: 13, marginTop: 6 }}>Growlia solo usa en los anuncios los datos que le des: no se inventa precios, descuentos ni reseñas.</p>
      </div>
      <div className="g-row" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button className="g-btn g-btn-primary" type="submit" disabled={!ready || busy}>{busy ? 'Preparando…' : 'Preparar campaña'}</button>
        <span className="g-muted" style={{ fontSize: 13 }}>No se crea nada en Google hasta que lo apruebes.</span>
      </div>
    </form>
  )
}

function Preparing() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(() => setI(x => Math.min(x + 1, LOADING_STEPS.length - 1)), 9000); return () => clearInterval(t) }, [])
  return (
    <div className="g-panel g-pad" aria-live="polite">
      <p style={{ fontWeight: 600 }}>{LOADING_STEPS[i]}</p>
      <p className="g-muted" style={{ marginTop: 4 }}>Suele tardar entre 30 segundos y un minuto. No cierres esta página.</p>
      <div className="lc-progress" style={{ marginTop: 14 }}><span style={{ width: `${((i + 1) / LOADING_STEPS.length) * 100}%` }} /></div>
    </div>
  )
}

// ── Vista previa del anuncio ─────────────────────────────────
function AdPreview({ g }: { g: AdGroup }) {
  const path = [g.path1, g.path1 && g.path2].filter(Boolean).join('/')
  return (
    <div className="lc-ad">
      <p style={{ fontSize: 12, color: 'var(--ink-2)' }}><strong style={{ color: 'var(--ink)' }}>Patrocinado</strong> · {host(g.finalUrl)}{path ? `/${path}` : ''}</p>
      <p className="lc-ad-title">{g.headlines.slice(0, 3).join(' | ')}</p>
      <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{g.descriptions.slice(0, 2).join(' ')}</p>
    </div>
  )
}

// ── Grupo de anuncios ────────────────────────────────────────
function AdGroupCard({ g, editable, onSave }: { g: AdGroup; editable: boolean; onSave: (g: AdGroup) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false)
  const [kw, setKw] = useState('')
  const [hl, setHl] = useState('')
  const [ds, setDs] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const start = () => {
    setKw(g.keywords.map(kwLabel).map(s => s.replace(/^"|"$/g, '')).join('\n'))
    setHl(g.headlines.join('\n')); setDs(g.descriptions.join('\n')); setUrl(g.finalUrl); setEditing(true)
  }
  const save = async () => {
    setSaving(true)
    const ok = await onSave({ ...g, finalUrl: url.trim(), keywords: parseKeywords(kw), headlines: lines(hl), descriptions: lines(ds) })
    setSaving(false)
    if (ok) setEditing(false)
  }

  return (
    <div className="g-panel" style={{ marginTop: 16 }}>
      <div className="g-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, borderBottom: '1px solid var(--line-2)' }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontWeight: 600 }}>{g.name}</p>
          <p className="g-muted" style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.finalUrl}</p>
        </div>
        {editable && !editing && <button className="g-btn g-btn-sm" onClick={start}>Editar</button>}
      </div>

      {!editing ? (
        <div className="lc-group">
          <div>
            <p className="g-label">Palabras clave ({g.keywords.length})</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {g.keywords.map(k => <span key={k.match + k.text} className="lc-kw" title={k.match === 'EXACT' ? 'Concordancia exacta' : 'Concordancia de frase'}>{kwLabel(k)}</span>)}
            </div>
            <p className="g-label" style={{ marginTop: 18 }}>Titulares ({g.headlines.length})</p>
            <ul className="lc-texts">{g.headlines.map(h => <li key={h}><span>{h}</span><Counter value={h} max={30} /></li>)}</ul>
            <p className="g-label" style={{ marginTop: 18 }}>Descripciones ({g.descriptions.length})</p>
            <ul className="lc-texts">{g.descriptions.map(d => <li key={d}><span>{d}</span><Counter value={d} max={90} /></li>)}</ul>
          </div>
          <div>
            <p className="g-label">Así se verá en Google</p>
            <AdPreview g={g} />
            <p className="g-muted" style={{ fontSize: 13, marginTop: 8 }}>Google combina los titulares y descripciones y aprende qué combinación funciona mejor.</p>
          </div>
        </div>
      ) : (
        <div className="g-list">
          <div className="g-row">
            <label className="g-label">Página de destino</label>
            <input className="g-input" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div className="g-row">
            <label className="g-label">Palabras clave, una por línea. Entre [corchetes] para concordancia exacta.</label>
            <textarea className="g-input g-textarea" rows={8} value={kw} onChange={e => setKw(e.target.value)} />
          </div>
          <div className="g-row">
            <label className="g-label">Titulares, uno por línea (máximo 30 caracteres, entre 8 y 15)</label>
            <textarea className="g-input g-textarea" rows={10} value={hl} onChange={e => setHl(e.target.value)} />
            <p className="g-muted" style={{ fontSize: 13, marginTop: 6 }}>{lines(hl).filter(h => h.length > 30).length ? <span style={{ color: 'var(--neg)' }}>Hay {lines(hl).filter(h => h.length > 30).length} titulares demasiado largos.</span> : `${lines(hl).length} titulares.`}</p>
          </div>
          <div className="g-row">
            <label className="g-label">Descripciones, una por línea (máximo 90 caracteres, 4)</label>
            <textarea className="g-input g-textarea" rows={4} value={ds} onChange={e => setDs(e.target.value)} />
            <p className="g-muted" style={{ fontSize: 13, marginTop: 6 }}>{lines(ds).filter(d => d.length > 90).length ? <span style={{ color: 'var(--neg)' }}>Hay descripciones demasiado largas.</span> : `${lines(ds).length} descripciones.`}</p>
          </div>
          <div className="g-row" style={{ display: 'flex', gap: 8 }}>
            <button className="g-btn g-btn-primary" onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</button>
            <button className="g-btn" onClick={() => setEditing(false)} disabled={saving}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Vigilancia de arranque ───────────────────────────────────
function WatchPanel({ l }: { l: Launch }) {
  if (!l.activated_at) return null
  const day = Math.floor((Date.now() - new Date(l.activated_at).getTime()) / 86400_000) + 1
  if (day > 14) return null
  const w = l.watch || {}
  const issues = w.insights || []
  return (
    <div className="g-panel g-pad" style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ fontWeight: 600 }}>Arranque vigilado: día {day} de 14</p>
        {w.checked_at && <span className="g-muted" style={{ fontSize: 13 }}>Última revisión: {new Date(w.checked_at).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
      <div className="lc-progress" style={{ margin: '10px 0 12px' }}><span style={{ width: `${(day / 14) * 100}%` }} /></div>
      <p className="g-muted" style={{ fontSize: 14 }}>Cada mañana Growlia comprueba que la campaña sale, que los anuncios están aprobados, que gasta lo previsto, que se miden las conversiones y qué búsquedas se están pagando. Durante estos días no propone cambios de presupuesto: la campaña está aprendiendo.</p>
      {(typeof w.terms === 'number' || issues.length > 0) && (
        <ul className="lc-why" style={{ marginTop: 10 }}>
          {typeof w.terms === 'number' && <li>{w.terms} búsquedas revisadas{w.proposed ? `, ${w.proposed} propuestas para excluir (en Inicio)` : ', ninguna para excluir'}.</li>}
          {issues.map(i => <li key={i.title}>{i.title}</li>)}
        </ul>
      )}
    </div>
  )
}

// ── Pestaña ──────────────────────────────────────────────────
export default function LaunchTab({ getToken, userId, hasGoogle, goToConnections }: {
  getToken: () => Promise<string | null>; userId: string; hasGoogle: boolean; goToConnections: () => void
}) {
  const supabase = createClientComponentClient()
  const [launches, setLaunches] = useState<Launch[]>([])
  const [current, setCurrent] = useState<Launch | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [mode, setMode] = useState<'brief' | 'plan'>('brief')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<{ text: string; details?: string[] } | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [instruction, setInstruction] = useState('')
  const [editNeg, setEditNeg] = useState<string | null>(null)
  const [editLoc, setEditLoc] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('launches').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10)
    const list = (data || []) as Launch[]
    setLaunches(list)
    setLoaded(true)
    return list
  }, [supabase, userId])

  useEffect(() => {
    load().then(list => {
      const open = list.find(l => ['draft', 'failed', 'creating', 'created'].includes(l.status))
      if (open) { setCurrent(open); setMode('plan') }
    })
  }, [load])

  const call = async (path: string, body: any, label: string) => {
    setBusy(label); setError(null); setInfo(null)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError({ text: data.error || 'Algo ha fallado. Inténtalo de nuevo.', details: data.details })
        if (path.endsWith('/create')) { const list = await load(); setCurrent(list.find(l => l.id === current?.id) || current) }
        return null
      }
      if (data.launch) { setCurrent(data.launch); setMode('plan'); load() }
      return data
    } catch {
      setError({ text: 'No hemos podido conectar con Growlia. Revisa tu conexión e inténtalo de nuevo.' })
      return null
    } finally {
      setBusy(null)
    }
  }

  const savePlan = async (plan: Plan, msg = 'Cambios guardados.') => {
    if (!current) return false
    const r = await call(`/api/launch/${current.id}/revise`, { plan }, 'save')
    if (r) setInfo(msg)
    return !!r
  }

  const plan = current?.plan
  const editable = !!current && ['draft', 'failed'].includes(current.status)
  const currency = 'EUR'

  if (!loaded) return <p className="g-muted">Cargando…</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 className="g-h1">Nueva campaña</h1>
          <p className="g-sub">Cuéntanos tu negocio y Growlia prepara una campaña de búsqueda en Google lista para revisar, con el criterio de un especialista senior. No se crea nada hasta que lo apruebes.</p>
        </div>
        {mode === 'plan' && <button className="g-btn" onClick={() => { setMode('brief'); setError(null); setInfo(null) }} disabled={!!busy}>Empezar otra</button>}
      </div>

      {error && (
        <div style={{ marginTop: 20 }}>
          <Note type="error">
            {error.text}
            {error.details?.length ? <ul style={{ margin: '8px 0 0 18px' }}>{error.details.map(d => <li key={d}>{d}</li>)}</ul> : null}
          </Note>
        </div>
      )}
      {info && <div style={{ marginTop: 20 }}><Note type="ok">{info}</Note></div>}

      <div style={{ marginTop: 24 }}>
        {mode === 'brief' && (busy === 'plan' ? <Preparing /> : (
          <BriefForm busy={busy === 'plan'} initial={current?.brief ? { ...current.brief, monthlyBudget: String(current.brief.monthlyBudget) } : undefined} onSubmit={b => call('/api/launch/plan', b, 'plan')} />
        ))}

        {mode === 'plan' && plan && current && (
          <>
            {/* Estado */}
            {current.status === 'created' && (
              <div className="g-panel g-pad" style={{ marginBottom: 16, borderColor: 'var(--accent)' }}>
                <p style={{ fontWeight: 600 }}>Campaña creada en pausa en tu cuenta de Google Ads</p>
                <p className="g-muted" style={{ marginTop: 4 }}>"{current.campaign_name}". Puedes revisarla en <a href="https://ads.google.com/aw/campaigns" target="_blank" rel="noopener noreferrer">Google Ads</a>. Antes de activarla, comprueba que la cuenta tiene un método de pago y que mides las conversiones.</p>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  <button className="g-btn g-btn-primary" disabled={!!busy} onClick={async () => { const r = await call(`/api/launch/${current.id}/activate`, { active: true }, 'activate'); if (r) setInfo('Campaña activada. Growlia la vigilará de cerca estas dos primeras semanas.') }}>{busy === 'activate' ? 'Activando…' : 'Activar campaña'}</button>
                </div>
              </div>
            )}
            {current.status === 'active' && (
              <div style={{ marginBottom: 16 }}>
                <Note type="ok">"{current.campaign_name}" está activa. Verás sus resultados en Inicio y Rendimiento a partir de mañana.</Note>
                <WatchPanel l={current} />
              </div>
            )}
            {current.status === 'creating' && <div style={{ marginBottom: 16 }}><Note type="warn">La campaña se está creando. Recarga en un minuto.</Note></div>}
            {current.status === 'failed' && current.error && !error && <div style={{ marginBottom: 16 }}><Note type="error">El último intento no se pudo crear: {current.error}</Note></div>}

            {/* Resumen */}
            <div className="g-panel">
              <div className="g-pad" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <p style={{ fontWeight: 600 }}>{current.campaign_name || plan.campaignName}</p>
                <span className={STATUS[current.status].cls}>{STATUS[current.status].label}</span>
              </div>
              <div className="lc-facts">
                <div><p className="g-label">Presupuesto</p><p className="num">{money(plan.dailyBudget, currency)} al día</p><p className="g-muted num" style={{ fontSize: 13 }}>≈ {new Intl.NumberFormat('es-ES', { style: 'currency', currency, maximumFractionDigits: 0 }).format(plan.dailyBudget * 30.4)} al mes</p></div>
                <div><p className="g-label">Estrategia de puja</p><p>{plan.bidding === 'MAXIMIZE_CONVERSIONS' ? 'Maximizar conversiones' : 'Maximizar clics'}</p>{plan.maxCpc ? <p className="g-muted num" style={{ fontSize: 13 }}>CPC máximo {money(plan.maxCpc, currency)}</p> : null}</div>
                <div><p className="g-label">Red</p><p>Solo búsqueda de Google</p><p className="g-muted" style={{ fontSize: 13 }}>Sin Display ni socios</p></div>
                <div><p className="g-label">Idiomas</p><p>{plan.languages.map(l => LANG[l] || l).join(', ')}</p></div>
              </div>
              <div className="g-pad" style={{ borderTop: '1px solid var(--line-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <p className="g-label">Ubicaciones (personas que están en la zona)</p>
                  {editable && editLoc === null && <button className="g-link" onClick={() => setEditLoc(plan.locations.map(l => l.query).join('\n'))}>Editar</button>}
                </div>
                {editLoc === null ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{plan.locations.map(l => <span key={l.query} className="lc-kw">{l.name || l.query}</span>)}</div>
                ) : (
                  <div>
                    <textarea className="g-input g-textarea" rows={4} value={editLoc} onChange={e => setEditLoc(e.target.value)} aria-label="Ubicaciones, una por línea" />
                    <p className="g-muted" style={{ fontSize: 13, margin: '6px 0 10px' }}>Una por línea: municipio, provincia, comunidad o "España".</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="g-btn g-btn-sm g-btn-primary" disabled={!!busy} onClick={async () => { if (await savePlan({ ...plan, locations: lines(editLoc).map(q => ({ query: q })) })) setEditLoc(null) }}>Guardar</button>
                      <button className="g-btn g-btn-sm" onClick={() => setEditLoc(null)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Por qué */}
            {(plan.rationale.length > 0 || plan.warnings.length > 0) && (
              <section className="g-section" style={{ marginTop: 24 }}>
                <div className="g-section-head"><h2 className="g-h2">Por qué así</h2></div>
                {plan.rationale.length > 0 && <div className="g-panel g-pad"><ul className="lc-why">{plan.rationale.map(r => <li key={r}>{r}</li>)}</ul></div>}
                {plan.warnings.map(w => <div key={w} style={{ marginTop: 10 }}><Note type="warn">{w}</Note></div>)}
              </section>
            )}

            {/* Pedir cambios */}
            {editable && (
              <section className="g-section" style={{ marginTop: 24 }}>
                <div className="g-section-head"><h2 className="g-h2">Pide un cambio</h2></div>
                <form className="g-panel g-pad" onSubmit={async e => { e.preventDefault(); if (!instruction.trim()) return; const r = await call(`/api/launch/${current.id}/revise`, { instruction }, 'revise'); if (r) { setInstruction(''); setInfo('Plan actualizado.') } }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input className="g-input" style={{ flex: 1, minWidth: 220 }} value={instruction} onChange={e => setInstruction(e.target.value)} placeholder='Por ejemplo: "quita masajes", "añade Terrassa", "más enfoque en primera visita gratis"' disabled={!!busy} />
                    <button className="g-btn g-btn-primary" type="submit" disabled={!!busy || !instruction.trim()}>{busy === 'revise' ? 'Aplicando…' : 'Aplicar'}</button>
                  </div>
                  {busy === 'revise' && <p className="g-muted" style={{ fontSize: 13, marginTop: 8 }}>Rehaciendo el plan con tu cambio. Tarda unos segundos.</p>}
                </form>
              </section>
            )}

            {/* Grupos */}
            <section className="g-section" style={{ marginTop: 24 }}>
              <div className="g-section-head"><h2 className="g-h2">Grupos de anuncios</h2><span className="g-muted">{plan.adGroups.length}</span></div>
              {plan.adGroups.map((g, i) => (
                <AdGroupCard key={`${current.id}-${i}-${g.name}`} g={g} editable={editable}
                  onSave={ng => savePlan({ ...plan, adGroups: plan.adGroups.map((x, j) => (j === i ? ng : x)) })} />
              ))}
            </section>

            {/* Negativas */}
            <section className="g-section" style={{ marginTop: 24 }}>
              <div className="g-section-head">
                <h2 className="g-h2">Palabras clave negativas</h2>
                {editable && editNeg === null && <button className="g-link" onClick={() => setEditNeg(plan.negatives.join('\n'))}>Editar</button>}
              </div>
              <div className="g-panel g-pad">
                <p className="g-muted" style={{ fontSize: 13, marginBottom: 10 }}>Búsquedas en las que no aparecerán tus anuncios, para no pagar clics que no van a convertir.</p>
                {editNeg === null ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{plan.negatives.map(n => <span key={n} className="lc-kw lc-kw-neg">−{n}</span>)}</div>
                ) : (
                  <div>
                    <textarea className="g-input g-textarea" rows={8} value={editNeg} onChange={e => setEditNeg(e.target.value)} aria-label="Negativas, una por línea" />
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <button className="g-btn g-btn-sm g-btn-primary" disabled={!!busy} onClick={async () => { if (await savePlan({ ...plan, negatives: lines(editNeg) })) setEditNeg(null) }}>Guardar</button>
                      <button className="g-btn g-btn-sm" onClick={() => setEditNeg(null)}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Crear */}
            {editable && (
              <section className="g-section" style={{ marginTop: 24 }}>
                <div className="g-section-head"><h2 className="g-h2">Crear en Google Ads</h2></div>
                {hasGoogle ? (
                  <div className="g-panel g-pad">
                    <p>Growlia creará la campaña completa <strong>en pausa</strong> en tu cuenta. No gastará nada hasta que la actives.</p>
                    <button className="g-btn g-btn-primary" style={{ marginTop: 14 }} disabled={!!busy} onClick={async () => { const r = await call(`/api/launch/${current.id}/create`, {}, 'create'); if (r) setInfo('Campaña creada en pausa. Revísala y actívala cuando quieras.') }}>{busy === 'create' ? 'Creando…' : 'Crear campaña en pausa'}</button>
                  </div>
                ) : (
                  <div className="g-panel g-pad">
                    <p style={{ fontWeight: 600 }}>Primero necesitas una cuenta de Google Ads</p>
                    <ol className="lc-steps">
                      <li>Entra en <a href="https://ads.google.com/home/" target="_blank" rel="noopener noreferrer">ads.google.com</a> con tu cuenta de Google y pulsa Empezar.</li>
                      <li>Cuando te proponga crear una campaña, elige <strong>Cambiar al modo experto</strong> y después <strong>Crear una cuenta sin campaña</strong>. Así no se crea ninguna campaña automática.</li>
                      <li>Confirma país (España), zona horaria y moneda (euro), y añade un método de pago.</li>
                      <li>Vuelve aquí y conecta Google Ads. Tu plan te estará esperando.</li>
                    </ol>
                    <button className="g-btn g-btn-primary" style={{ marginTop: 14 }} onClick={goToConnections}>Conectar Google Ads</button>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        {/* Historial */}
        {launches.length > 1 && (
          <section className="g-section" style={{ marginTop: 32 }}>
            <div className="g-section-head"><h2 className="g-h2">Planes anteriores</h2></div>
            <div className="g-panel g-list">
              {launches.map(l => (
                <button key={l.id} className="g-row lc-hist" onClick={() => { setCurrent(l); setMode('plan'); setError(null); setInfo(null); setEditLoc(null); setEditNeg(null) }} aria-current={current?.id === l.id && mode === 'plan' ? 'true' : undefined}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.campaign_name || l.plan?.campaignName}</span>
                  <span style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                    <span className="g-muted" style={{ fontSize: 13 }}>{new Date(l.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                    <span className={STATUS[l.status].cls}>{STATUS[l.status].label}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
