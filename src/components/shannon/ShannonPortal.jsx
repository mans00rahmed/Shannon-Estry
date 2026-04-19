import { useState, useEffect, useCallback } from 'react'
import ShannonMap from './ShannonMap'
import WeatherCard from './WeatherCard'
import StationList from './StationList'
import { fetchAllPointsData } from '../../services/shannonWeather'

export default function ShannonPortal() {
  const [points, setPoints]         = useState([])
  const [selected, setSelected]     = useState(null)
  const [loading, setLoading]       = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [mobileTab, setMobileTab]   = useState('map')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAllPointsData()
      setPoints(data)
      setLastUpdated(new Date())
      setSelected(s => s || data.find(p => !p.error) || null)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    loadData()
    const t = setInterval(loadData, 10 * 60 * 1000)
    return () => clearInterval(t)
  }, [loadData])

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minWidth: 0, flexDirection: 'column' }}>

      {/* ── Mobile tab bar ── */}
      <div className="shannon-tabs">
        {[
          { id: 'stations', label: 'Stations' },
          { id: 'map',      label: 'Map' },
          { id: 'details',  label: 'Details' },
        ].map(t => (
          <button
            key={t.id}
            className={`shannon-tab ${mobileTab === t.id ? 'active' : ''}`}
            onClick={() => setMobileTab(t.id)}
          >{t.label}</button>
        ))}
      </div>

      {/* ── Main panels row ── */}
      <div className="shannon-panels">

      {/* ── LEFT: Station list ── */}
      <aside className={`sidebar sidebar-left${mobileTab !== 'stations' ? ' mobile-hidden' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="section-head" style={{ justifyContent: 'space-between' }}>
          <span className="section-head-label">Stations</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lastUpdated && (
              <span style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                {lastUpdated.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button
              onClick={loadData}
              disabled={loading}
              style={{
                background: 'var(--accent-dim)', border: '1px solid var(--accent)', color: 'var(--accent)',
                borderRadius: 3, padding: '2px 8px', fontSize: 9, fontFamily: 'var(--mono)',
                fontWeight: 700, letterSpacing: '0.06em', cursor: 'pointer', textTransform: 'uppercase',
                opacity: loading ? 0.4 : 1,
              }}
            >↻</button>
          </div>
        </div>

        {loading && points.length === 0 ? (
          <div className="loading-center" style={{ flex: 1 }}>
            <div className="spin-ring" />
            <span className="loading-text">Fetching data…</span>
          </div>
        ) : (
          <div className="section-body" style={{ overflowY: 'auto', flex: 1 }}>
            <StationList
              points={points}
              selectedId={selected?.id}
              onSelect={pt => { setSelected(pt); setMobileTab('details') }}
            />
          </div>
        )}
      </aside>

      {/* ── CENTER: Map ── */}
      <div className={mobileTab !== 'map' ? 'mobile-hidden' : ''} style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
        <ShannonMap
          points={points}
          selectedPoint={selected}
          onSelectPoint={pt => setSelected(pt)}
        />
        {/* Legend overlay */}
        <div className="map-legend">
          <div className="map-legend-title">Soil Moisture</div>
          {[
            { color: '#ff4455', label: 'Dry' },
            { color: '#ffb300', label: 'Low' },
            { color: '#00ff88', label: 'Optimal' },
            { color: '#00d4ff', label: 'Wet' },
          ].map(({ color, label }) => (
            <div className="map-legend-row" key={label}>
              <div className="legend-dot" style={{ background: color }} />
              <span className="legend-text">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Weather detail ── */}
      <aside className={`sidebar sidebar-right${mobileTab !== 'details' ? ' mobile-hidden' : ''}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="section-head">
          <span className="section-head-label">Conditions</span>
          {selected && <span className="section-head-tag">{selected.name}</span>}
        </div>
        <div className="section-body" style={{ overflowY: 'auto', flex: 1 }}>
          <WeatherCard point={selected} />
        </div>
      </aside>

      </div>{/* /.shannon-panels */}
    </div>
  )
}
