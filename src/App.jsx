import { useState, useEffect, useCallback, useRef } from 'react'
import { ReactFlowProvider } from 'reactflow'
import ImpactGraph from './components/ImpactGraph'
import ShannonPortal from './components/shannon/ShannonPortal'
import { evaluateRules, calculate3PImpacts } from './utils/ruleEngine'
import { getOpenAIResponse } from './services/openai'
import modelData from './data/model.json'
import rulesData from './data/rules.json'
import './App.css'

// ── Clock ─────────────────────────────────────────────────────────────────────
function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="topbar-time">
      {time.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

// ── Farm input config ─────────────────────────────────────────────────────────
const INPUT_META = {
  water_source:      { label: 'Water Source',   icon: '💧', opts: ['Rain', 'Groundwater'] },
  fertilizer_type:   { label: 'Fertilizer',     icon: '🌿', opts: ['Organic', 'Chemical'] },
  irrigation_method: { label: 'Irrigation',     icon: '🚿', opts: ['Drip', 'Flood'] },
  energy_use:        { label: 'Energy',         icon: '⚡', opts: ['Manual', 'Fuel', 'Electric'] },
}

function FarmInputsPanel({ inputs, onChange }) {
  return (
    <div className="section-body">
      {Object.entries(INPUT_META).map(([key, meta]) => (
        <div className="input-row" key={key}>
          <div className="input-row-label">
            <span>{meta.icon}</span>{meta.label}
          </div>
          <select value={inputs[key]} onChange={e => onChange(key, e.target.value)}>
            {meta.opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}
      <div style={{
        marginTop: 14, padding: '8px 10px', background: 'var(--bg-3)', borderRadius: 5,
        border: '1px solid rgba(255,179,0,0.18)', fontSize: 10, color: '#a07a00',
        fontFamily: 'var(--mono)', lineHeight: 1.6,
      }}>
        <span style={{ color: 'var(--accent-amber)', fontWeight: 700 }}>TIP</span> — Changes update the impact analysis in real-time.
      </div>
    </div>
  )
}

// ── Impact centre panel — layman-friendly ─────────────────────────────────────
const PILLAR_INFO = {
  People: { emoji: '👥', desc: 'Effect on workers, jobs and local food' },
  Place:  { emoji: '🌍', desc: 'Effect on local water and environment' },
  Planet: { emoji: '🌱', desc: 'Effect on soil, emissions and long-term land health' },
}

const STRENGTH_LABEL = { HIGH: 'Strong', MEDIUM: 'Moderate', LOW: 'Mild' }

function PillarScore({ label, value }) {
  const positive = value === 'POSITIVE'
  const negative = value === 'NEGATIVE'
  const color = positive ? '#00ff88' : negative ? '#ff4455' : 'var(--text-2)'
  const bg    = positive ? 'rgba(0,255,136,0.08)' : negative ? 'rgba(255,68,85,0.08)' : 'var(--bg-3)'
  const arrow = positive ? '↑' : negative ? '↓' : '→'
  const tag   = positive ? 'Positive' : negative ? 'Negative' : 'Neutral'
  const { emoji, desc } = PILLAR_INFO[label]

  return (
    <div style={{
      background: bg, border: `1px solid ${color}33`, borderRadius: 8,
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
      transition: 'all 0.3s',
    }}>
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-0)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-2)', fontFamily: 'var(--mono)' }}>{desc}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{arrow}</div>
        <div style={{ fontSize: 9, color, fontFamily: 'var(--mono)', fontWeight: 700, letterSpacing: '0.06em' }}>{tag}</div>
      </div>
    </div>
  )
}

function ActiveRuleCard({ rule, inputs }) {
  const matches = Object.entries(rule.condition).every(([k, v]) => inputs[k] === v)
  if (!matches) return null

  return (
    <>
      {rule.effects.map((eff, i) => {
        const isGood = eff.impact === 'POSITIVE'
        const color  = isGood ? '#00ff88' : '#ff4455'
        const icon   = isGood ? '✅' : '⚠️'
        const node   = modelData.nodes.find(n => n.id === eff.target)
        return (
          <div key={i} style={{
            background: 'var(--bg-3)', border: `1px solid ${color}22`,
            borderLeft: `3px solid ${color}`, borderRadius: 6,
            padding: '10px 12px', marginBottom: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span>{icon}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-0)' }}>
                {node?.label || eff.target}
              </span>
              <span style={{
                marginLeft: 'auto', fontSize: 9, fontFamily: 'var(--mono)',
                color, fontWeight: 700, letterSpacing: '0.06em',
              }}>
                {STRENGTH_LABEL[eff.strength] || eff.strength} · {eff.pillar}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-1)', lineHeight: 1.5 }}>
              {eff.reason}
            </div>
          </div>
        )
      })}
    </>
  )
}

function ImpactCentre({ inputs, nodeImpacts, edgeImpacts, threePImpacts }) {
  const activeCount = rulesData.filter(r =>
    Object.entries(r.condition).every(([k, v]) => inputs[k] === v)
  ).flatMap(r => r.effects).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── 3P score strip ── */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid var(--border-0)',
        background: 'var(--bg-1)', flexShrink: 0,
      }}>
        <div style={{
          fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text-2)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
        }}>
          People · Place · Planet — Current Assessment
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {['People', 'Place', 'Planet'].map(p => (
            <PillarScore key={p} label={p} value={threePImpacts[p]} />
          ))}
        </div>
      </div>

      {/* ── Body: active impacts left, graph right ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Active impact cards */}
        <div style={{
          width: 320, flexShrink: 0, borderRight: '1px solid var(--border-0)',
          overflowY: 'auto', padding: '14px 12px', background: 'var(--bg-1)',
        }}>
          <div style={{
            fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text-2)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>What's happening right now</span>
            <span style={{ color: activeCount > 0 ? 'var(--accent)' : 'var(--text-3)' }}>
              {activeCount} active effect{activeCount !== 1 ? 's' : ''}
            </span>
          </div>

          {activeCount === 0 ? (
            <div style={{
              textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-3)',
              fontFamily: 'var(--mono)', fontSize: 11, lineHeight: 1.7,
              border: '1px dashed var(--border-0)', borderRadius: 6,
            }}>
              Your current settings have no active<br />rule effects. All systems neutral.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.6 }}>
                Based on your choices, here's what's being affected and why:
              </div>
              {rulesData.map(rule => (
                <ActiveRuleCard key={rule.id} rule={rule} inputs={inputs} />
              ))}
            </>
          )}

          {/* Choice summary */}
          <div style={{
            marginTop: 14, padding: '10px 12px', background: 'var(--bg-3)',
            border: '1px solid var(--border-0)', borderRadius: 6,
          }}>
            <div style={{
              fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--accent)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7,
            }}>Your current choices</div>
            {Object.entries(inputs).map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontSize: 11, color: 'var(--text-1)', marginBottom: 4,
              }}>
                <span style={{ color: 'var(--text-2)' }}>{INPUT_META[k]?.label}</span>
                <span style={{
                  fontFamily: 'var(--mono)', fontWeight: 700,
                  color: 'var(--accent)', fontSize: 11,
                }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ReactFlow graph */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{
            padding: '6px 14px', borderBottom: '1px solid var(--border-0)',
            background: 'var(--bg-2)', flexShrink: 0,
            fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--text-2)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            Impact network — glowing nodes are affected by your choices
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ReactFlowProvider>
              <ImpactGraph
                nodes={modelData.nodes}
                edges={modelData.edges}
                nodeImpacts={nodeImpacts}
                edgeImpacts={edgeImpacts}
              />
            </ReactFlowProvider>
          </div>
          <div className="graph-legend-bar">
            <div className="gl-item"><div className="gl-dot" style={{ background:'#0a2e1a', borderColor:'#00ff88' }}/> Positive effect</div>
            <div className="gl-item"><div className="gl-dot" style={{ background:'#2e0a0a', borderColor:'#ff4455' }}/> Negative effect</div>
            <div className="gl-item"><div className="gl-dot" style={{ background:'var(--bg-3)', borderColor:'var(--border-1)' }}/> No change</div>
            <div className="gl-item"><div className="gl-line" style={{ background:'#00d4ff' }}/> Active link</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Chatbot — reads live state via ref ────────────────────────────────────────
function ChatPanel({ stateRef }) {
  const [msgs, setMsgs] = useState([{
    type: 'bot',
    text: "Hi! I can see your current farm settings and all active impacts. Ask me anything — e.g. \"Why is soil affected?\" or \"What's the best setting for the planet?\"",
  }])
  const [val, setVal] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = useCallback(async e => {
    e.preventDefault()
    if (!val.trim() || loading) return
    const text = val.trim()
    setVal('')
    setMsgs(prev => [...prev, { type: 'user', text }])
    setLoading(true)
    setMsgs(prev => [...prev, { type: 'bot', text: '', isLoading: true }])
    try {
      // Always reads the latest live state from the ref at call time
      const { inputs, nodeImpacts, threePImpacts } = stateRef.current
      const res = await getOpenAIResponse(text, { inputs, nodeImpacts, threePImpacts, modelData, rulesData })
      setMsgs(prev => { const m = [...prev]; m[m.length-1] = { type: 'bot', text: res }; return m })
    } catch (err) {
      setMsgs(prev => { const m = [...prev]; m[m.length-1] = { type: 'error', text: `Error: ${err.message}` }; return m })
    } finally { setLoading(false) }
  }, [val, loading, stateRef])

  return (
    <>
      <div className="chat-messages">
        {msgs.map((m, i) => (
          <div key={i} className={`chat-msg ${m.type}`}>
            <div className="chat-bubble">
              {m.isLoading
                ? <div className="chat-dots"><span/><span/><span/></div>
                : m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="chat-form" onSubmit={send}>
        <input
          className="chat-input"
          placeholder="Ask about impacts, causes, improvements…"
          value={val}
          onChange={e => setVal(e.target.value)}
          disabled={loading}
        />
        <button className="chat-send" type="submit" disabled={loading || !val.trim()}>
          {loading ? '…' : 'Send'}
        </button>
      </form>
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [view, setView] = useState('shannon')

  const [inputs, setInputs] = useState({
    water_source: 'Rain', fertilizer_type: 'Organic',
    irrigation_method: 'Drip', energy_use: 'Manual',
  })
  const [nodeImpacts, setNodeImpacts]   = useState({})
  const [edgeImpacts, setEdgeImpacts]   = useState({})
  const [threePImpacts, setThreePImpacts] = useState({ People: 'NEUTRAL', Place: 'NEUTRAL', Planet: 'NEUTRAL' })

  // Ref always holds latest state so ChatPanel never captures a stale closure
  const liveStateRef = useRef({ inputs, nodeImpacts, threePImpacts })
  useEffect(() => { liveStateRef.current = { inputs, nodeImpacts, threePImpacts } }, [inputs, nodeImpacts, threePImpacts])

  useEffect(() => {
    const impacts = evaluateRules(inputs, rulesData, modelData.edges)
    setNodeImpacts(impacts.nodes)
    setEdgeImpacts(impacts.edges)
    setThreePImpacts(calculate3PImpacts(impacts.nodes, modelData.nodes))
  }, [inputs])

  const handleInput = useCallback((k, v) => setInputs(p => ({ ...p, [k]: v })), [])

  const activeEffects = rulesData
    .filter(r => Object.entries(r.condition).every(([k, v]) => inputs[k] === v))
    .flatMap(r => r.effects).length

  return (
    <div className="app">

      {/* ── TOP BAR ── */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="topbar-logo">🛰️</span>
          <span className="topbar-name">Shannon Estry</span>
        </div>
        <div className="topbar-sep" />
        <nav className="topbar-nav">
          {[
            { id: 'shannon', label: 'Remote Sensing' },
            { id: 'impact',  label: '3P Impact Model' },
          ].map(({ id, label }) => (
            <button key={id} className={`nav-btn ${view === id ? 'active' : 'inactive'}`}
              onClick={() => setView(id)}>{label}
            </button>
          ))}
        </nav>
        <div className="topbar-right">
          <div className="live-badge"><div className="live-dot" />Live</div>
          <div className="topbar-sep" />
          <Clock />
        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <main className="workspace">

        {view === 'shannon' ? (

          <ShannonPortal />

        ) : (
          <>
            {/* LEFT — Farm Inputs */}
            <aside className="sidebar sidebar-left">
              <div className="section-head">
                <span className="section-head-label">Farm Inputs</span>
                <span className="section-head-tag">
                  {activeEffects > 0
                    ? <span style={{ color: 'var(--accent-amber)' }}>{activeEffects} effect{activeEffects > 1 ? 's' : ''} active</span>
                    : 'all neutral'}
                </span>
              </div>
              <FarmInputsPanel inputs={inputs} onChange={handleInput} />
            </aside>

            {/* CENTER — Layman impact dashboard */}
            <div className="main-panel">
              <ImpactCentre
                inputs={inputs}
                nodeImpacts={nodeImpacts}
                edgeImpacts={edgeImpacts}
                threePImpacts={threePImpacts}
              />
            </div>

            {/* RIGHT — AI Chatbot */}
            <aside className="sidebar sidebar-right" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="section-head">
                <span className="section-head-label">AI Assistant</span>
                <span className="section-head-tag" style={{ color: 'var(--accent-green)' }}>context-aware</span>
              </div>
              <ChatPanel stateRef={liveStateRef} />
            </aside>
          </>
        )}
      </main>

      {/* ── STATUS BAR ── */}
      <footer className="statusbar">
        {view === 'shannon' ? (
          <>
            <div className="status-item"><div className="dot"/>Open-Meteo API</div>
            <div className="status-item"><div className="dot"/>Esri Satellite Imagery</div>
            <div className="status-item"><div className="dot"/>9 monitoring stations</div>
            <div className="status-item"><div className="dot"/>Shannon Estuary · Co. Limerick / Clare / Kerry</div>
          </>
        ) : (
          <>
            <div className="status-item"><div className="dot"/>Rule engine active</div>
            <div className="status-item"><div className="dot"/>{activeEffects} active effect{activeEffects !== 1 ? 's' : ''}</div>
            <div className="status-item"><div className="dot"/>{modelData.anchor.business} · {modelData.anchor.location}</div>
          </>
        )}
        <div className="status-right">Shannon Estry Portal · v2.0</div>
      </footer>

    </div>
  )
}
