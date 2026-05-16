'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [msgs, setMsgs] = useState<{role:string,text:string}[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    setMsgs([{ role: 'ai', text: '¡Hola! Soy Growlia, tu agente de marketing con IA. ¿En qué campaña trabajamos hoy?' }])
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMsgs(m => [...m, { role: 'user', text }])
    setLoading(true)
    try {
      const res = await fetch('https://api.growlia.es/api/ai/chat-public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'ai', text: data.response || 'Error al procesar.' }])
    } catch {
      setMsgs(m => [...m, { role: 'ai', text: 'Error de conexión.' }])
    }
    setLoading(false)
  }

  if (!mounted) return null

  return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}`}</style>

      {/* Navbar */}
      <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(8px)',borderBottom:'1px solid #E5E7EB',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 5vw',height:64}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:32,height:32,background:'#2563EB',borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" fill="none"/><circle cx="8" cy="8" r="2" fill="white"/></svg>
          </div>
          <span style={{fontWeight:800,fontSize:20,color:'#111827',letterSpacing:'-0.02em'}}>Growlia</span>
        </div>
        <div style={{display:'flex',gap:32}}>
          {[['Agente','#agente'],['Conexiones','#connections'],['Precios','#precios']].map(([l,h])=>(
            <a key={l} href={h} style={{fontSize:14,color:'#6B7280',textDecoration:'none',fontWeight:500}}>{l}</a>
          ))}
        </div>
        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <a href="/auth" style={{fontSize:14,color:'#6B7280',textDecoration:'none',fontWeight:500}}>Iniciar sesión</a>
          <a href="/auth" style={{background:'#2563EB',borderRadius:8,padding:'8px 20px',color:'#fff',fontSize:14,fontWeight:600,textDecoration:'none'}}>Empezar gratis</a>
        </div>
      </nav>

      {/* Hero */}
      <section id="agente" style={{padding:'80px 5vw 60px',background:'#fff'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',gap:60,flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:300}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#EFF6FF',borderRadius:20,padding:'6px 14px',marginBottom:24}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:'#2563EB'}}/>
              <span style={{fontSize:12,fontWeight:700,color:'#2563EB',letterSpacing:'0.05em'}}>AGENTE IA PARA MARKETING</span>
            </div>
            <h1 style={{fontSize:'clamp(32px,4.5vw,56px)',fontWeight:800,color:'#111827',lineHeight:1.1,letterSpacing:'-0.03em',marginBottom:20}}>
              Tu copiloto de<br/><span style={{color:'#2563EB'}}>marketing digital</span>
            </h1>
            <p style={{fontSize:17,color:'#6B7280',lineHeight:1.7,marginBottom:32,maxWidth:460}}>
              Conecta Google Ads, Meta Ads y TikTok en un solo lugar. La IA optimiza tus campañas, detecta oportunidades y genera informes automáticamente.
            </p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
              <a href="/auth" style={{background:'#2563EB',borderRadius:10,padding:'14px 28px',color:'#fff',fontSize:15,fontWeight:700,textDecoration:'none'}}>Empezar gratis →</a>
              <a href="#connections" style={{background:'#F9FAFB',border:'1px solid #E5E7EB',borderRadius:10,padding:'14px 28px',color:'#111827',fontSize:15,fontWeight:600,textDecoration:'none'}}>Ver conexiones</a>
            </div>
            <p style={{fontSize:12,color:'#9CA3AF',marginTop:12}}>Sin tarjeta de crédito · Cancela cuando quieras</p>
          </div>

          {/* Chat */}
          <div style={{flex:1,minWidth:300,display:'flex',justifyContent:'center'}}>
            <div style={{background:'#fff',borderRadius:16,border:'1px solid #E5E7EB',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',overflow:'hidden',maxWidth:520,width:'100%'}}>
              <div style={{background:'#2563EB',padding:'14px 20px',display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:'#4ADE80'}}/>
                <span style={{color:'#fff',fontWeight:600,fontSize:14}}>Growlia — Agente IA</span>
              </div>
              <div style={{height:240,overflowY:'auto',padding:16,display:'flex',flexDirection:'column',gap:10}}>
                {msgs.map((m,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:m.role==='user'?'flex-end':'flex-start'}}>
                    <div style={{maxWidth:'80%',padding:'10px 14px',borderRadius:m.role==='user'?'12px 12px 2px 12px':'12px 12px 12px 2px',background:m.role==='user'?'#2563EB':'#F9FAFB',color:m.role==='user'?'#fff':'#111827',fontSize:13,lineHeight:1.6}}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {loading && <div style={{padding:'10px 14px',color:'#9CA3AF',fontSize:13}}>Escribiendo...</div>}
                <div ref={bottomRef}/>
              </div>
              <div style={{borderTop:'1px solid #E5E7EB',display:'flex',padding:12,gap:8}}>
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Escribe tu pregunta..." style={{flex:1,border:'1px solid #E5E7EB',borderRadius:8,padding:'10px 14px',fontSize:13,outline:'none',fontFamily:'inherit'}}/>
                <button onClick={send} disabled={loading} style={{background:'#2563EB',border:'none',borderRadius:8,padding:'10px 16px',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:13}}>→</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connections */}
      <section id="connections" style={{padding:'80px 5vw',background:'#F9FAFB'}}>
        <p style={{fontSize:12,fontWeight:700,color:'#2563EB',letterSpacing:'0.1em',textAlign:'center',marginBottom:12}}>CONEXIONES</p>
        <h2 style={{fontSize:'clamp(26px,3.5vw,44px)',fontWeight:800,color:'#111827',textAlign:'center',letterSpacing:'-0.03em',marginBottom:14}}>Conecta tu stack de marketing</h2>
        <p style={{fontSize:15,color:'#6B7280',textAlign:'center',maxWidth:520,margin:'0 auto 48px',lineHeight:1.7}}>Una plataforma para todas tus cuentas. Conexión en segundos con OAuth.</p>
        <div style={{maxWidth:720,margin:'0 auto',background:'#fff',borderRadius:16,border:'1px solid #E5E7EB',overflow:'hidden'}}>
          {[
            {name:'Google Ads',desc:'Gestiona campañas de Google Ads',soon:false},
            {name:'Meta Ads',desc:'Anuncios en Facebook e Instagram',soon:false},
            {name:'TikTok Ads',desc:'Gestiona campañas en TikTok',soon:true},
            {name:'LinkedIn Ads',desc:'Anuncios B2B en LinkedIn',soon:true},
            {name:'Microsoft Ads',desc:'Campañas en Bing y Microsoft',soon:true},
          ].map((p,i,arr)=>(
            <div key={p.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 24px',borderBottom:i<arr.length-1?'1px solid #F3F4F6':'none'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontWeight:600,fontSize:15,color:'#111827'}}>{p.name}</span>
                  {p.soon&&<span style={{fontSize:11,background:'#FEF3C7',color:'#92400E',padding:'2px 8px',borderRadius:20,fontWeight:600}}>Próximamente</span>}
                </div>
                <span style={{fontSize:13,color:'#9CA3AF'}}>{p.desc}</span>
              </div>
              <a href={p.soon?'#':'/auth'} style={{padding:'8px 18px',background:'#fff',color:p.soon?'#9CA3AF':'#111827',border:'1px solid #E5E7EB',borderRadius:8,fontSize:13,fontWeight:600,textDecoration:'none',cursor:p.soon?'default':'pointer'}}>
                {p.soon?'Próximamente':'+ Conectar'}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" style={{padding:'80px 5vw',background:'#fff'}}>
        <p style={{fontSize:12,fontWeight:700,color:'#2563EB',letterSpacing:'0.1em',textAlign:'center',marginBottom:12}}>PRECIOS</p>
        <h2 style={{fontSize:'clamp(26px,3.5vw,44px)',fontWeight:800,color:'#111827',textAlign:'center',letterSpacing:'-0.03em',marginBottom:48}}>Sencillo y transparente</h2>
        <div style={{maxWidth:960,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:24}}>
          {[
            {name:'Starter',price:49,desc:'Para freelancers',features:['2 cuentas de ads','Agente IA básico','Reportes mensuales'],h:false},
            {name:'Growth',price:99,desc:'Para agencias pequeñas',features:['10 cuentas de ads','Agente IA avanzado','Reportes semanales','Dashboard multi-cliente'],h:true},
            {name:'Agency',price:249,desc:'Para agencias grandes',features:['Cuentas ilimitadas','Agente IA premium','Reportes diarios','White-label'],h:false},
          ].map(p=>(
            <div key={p.name} style={{background:p.h?'#2563EB':'#fff',borderRadius:16,border:`1px solid ${p.h?'#2563EB':'#E5E7EB'}`,padding:28,display:'flex',flexDirection:'column',gap:16}}>
              <div>
                <h3 style={{fontWeight:700,fontSize:18,color:p.h?'#fff':'#111827'}}>{p.name}</h3>
                <p style={{fontSize:13,color:p.h?'rgba(255,255,255,0.7)':'#6B7280'}}>{p.desc}</p>
              </div>
              <div>
                <span style={{fontSize:40,fontWeight:800,color:p.h?'#fff':'#111827'}}>${p.price}</span>
                <span style={{fontSize:14,color:p.h?'rgba(255,255,255,0.7)':'#6B7280'}}>/mes</span>
              </div>
              <ul style={{listStyle:'none',padding:0,display:'flex',flexDirection:'column',gap:8}}>
                {p.features.map(f=>(
                  <li key={f} style={{fontSize:14,color:p.h?'rgba(255,255,255,0.9)':'#6B7280',display:'flex',gap:8}}>
                    <span style={{color:p.h?'#fff':'#2563EB'}}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <a href="/auth" style={{background:p.h?'#fff':'#2563EB',borderRadius:10,padding:'12px',color:p.h?'#2563EB':'#fff',fontWeight:700,fontSize:14,textAlign:'center',textDecoration:'none',marginTop:'auto'}}>Empezar gratis</a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{background:'#111827',padding:'40px 5vw',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
        <span style={{fontWeight:700,color:'#fff',fontSize:16}}>Growlia</span>
        <div style={{display:'flex',gap:24}}>
          <a href="/privacidad" style={{fontSize:13,color:'rgba(255,255,255,0.5)',textDecoration:'none'}}>Privacidad</a>
          <a href="/terminos" style={{fontSize:13,color:'rgba(255,255,255,0.5)',textDecoration:'none'}}>Términos</a>
        </div>
        <span style={{fontSize:13,color:'rgba(255,255,255,0.4)'}}>© 2025 Growlia</span>
      </footer>
    </>
  )
}
