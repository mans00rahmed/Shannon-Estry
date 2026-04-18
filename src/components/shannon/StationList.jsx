function windLabel(speed) {
  if (speed < 10) return { label: 'Calm',     color: '#00e676' }
  if (speed < 20) return { label: 'Light',    color: '#86efac' }
  if (speed < 40) return { label: 'Moderate', color: '#ffaa00' }
  if (speed < 60) return { label: 'Strong',   color: '#f97316' }
  return               { label: 'Gale',      color: '#ff4d4d' }
}

export default function StationList({ points, selectedId, onSelect }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {points.map(pt => {
        const isSelected = selectedId === pt.id
        const w = pt.weather
        const wind = w ? windLabel(w.windSpeed) : null

        return (
          <button
            key={pt.id}
            onClick={() => onSelect(pt)}
            style={{
              background: isSelected ? 'var(--accent-dim)' : 'var(--bg-surface)',
              border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 6,
              padding: '7px 10px',
              cursor: 'pointer',
              textAlign: 'left',
              color: 'var(--text-primary)',
              transition: 'all 0.15s',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: isSelected ? 'var(--glow)' : 'none',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.02em' }}>{pt.name}</div>
              {pt.error ? (
                <div style={{ fontSize: 10, color: '#ff4d4d' }}>Data unavailable</div>
              ) : w ? (
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{w.condition}</div>
              ) : null}
            </div>
            {w && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{w.temperature}°C</div>
                <div style={{ fontSize: 10, color: wind.color, fontFamily: 'monospace' }}>{wind.label}</div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
