import { LEGAL } from './config'

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', minHeight: '100vh' }}>
      <header className="l-nav">
        <div className="l-wrap l-nav-row">
          <a href="/" className="g-brand" style={{ padding: 0, textDecoration: 'none', color: 'var(--ink)' }}>
            <span className="g-mark" aria-hidden><svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg></span>
            Growlia
          </a>
          <nav style={{ display: 'flex', gap: 20, fontSize: 14 }} aria-label="Documentos legales">
            <a href="/privacidad" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Privacidad</a>
            <a href="/terminos" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Términos</a>
            <a href="/aviso-legal" style={{ color: 'var(--ink-2)', textDecoration: 'none' }}>Aviso legal</a>
          </nav>
        </div>
      </header>
      <main className="l-wrap legal" style={{ paddingTop: 56, paddingBottom: 88, maxWidth: 760 }}>
        <h1 className="l-h2" style={{ maxWidth: 'none' }}>{title}</h1>
        <p className="g-muted" style={{ marginTop: 8 }}>Última actualización: {LEGAL.actualizado}</p>
        <div style={{ marginTop: 36 }}>{children}</div>
      </main>
    </div>
  )
}
