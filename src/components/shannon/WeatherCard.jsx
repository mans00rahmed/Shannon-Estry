function Stat({ label, value, unit, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'monospace' }}>{label}</span>
      <span style={{ fontSize: 20, fontWeight: 700, color: color || 'var(--text-primary)', fontFamily: 'monospace' }}>{value}</span>
      {unit && <span style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{unit}</span>}
    </div>
  )
}

function WindCompass({ direction }) {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const idx = Math.round(direction / 45) % 8
  return <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{dirs[idx]}</span>
}

function WindArrow({ direction, speed }) {
  const color = speed < 20 ? '#00e676' : speed < 40 ? '#ffaa00' : '#ff4d4d'
  return (
    <svg width="36" height="36" viewBox="0 0 32 32"
      style={{ transform: `rotate(${direction}deg)`, display: 'inline-block', flexShrink: 0 }}>
      <polygon points="16,2 22,26 16,21 10,26" fill={color} opacity="0.9" />
    </svg>
  )
}

function Block({ children }) {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
    }}>{children}</div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase',
      letterSpacing: '0.1em', fontFamily: 'monospace', fontWeight: 700, marginBottom: 8,
    }}>{children}</div>
  )
}

export default function WeatherCard({ point }) {
  if (!point) return (
    <div style={{
      color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: 12,
      fontFamily: 'monospace', border: '1px dashed var(--border)', borderRadius: 8,
    }}>
      Select a station to view conditions
    </div>
  )

  const w = point.weather
  const s = point.soil

  const windColor = w.windSpeed < 20 ? '#00e676' : w.windSpeed < 40 ? '#ffaa00' : '#ff4d4d'
  const tempColor = w.temperature < 5 ? '#93c5fd' : w.temperature < 15 ? '#67e8f9'
    : w.temperature < 25 ? '#00e676' : '#ff4d4d'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-primary)' }}>
      {/* Name + temp */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, fontFamily: 'monospace', letterSpacing: '0.04em' }}>{point.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{w.condition}</div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: tempColor, fontFamily: 'monospace' }}>{w.temperature}°C</div>
      </div>

      {/* Wind */}
      <Block>
        <SectionLabel>Wind</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <WindArrow direction={w.windDirection} speed={w.windSpeed} />
          <div style={{ display: 'flex', gap: 16, flex: 1, justifyContent: 'space-around' }}>
            <Stat label="Speed" value={Math.round(w.windSpeed)} unit="km/h" color={windColor} />
            <Stat label="Gusts" value={Math.round(w.windGusts)} unit="km/h" color={w.windGusts > 50 ? '#ff4d4d' : '#ffaa00'} />
            <Stat label="Dir" value={<><WindCompass direction={w.windDirection} /> {w.windDirection}°</>} />
          </div>
        </div>
      </Block>

      {/* Atmosphere grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
        {[
          { label: 'Humidity', value: `${w.humidity}%`,            color: 'var(--accent)' },
          { label: 'Pressure', value: `${Math.round(w.pressure)}`, unit: 'hPa' },
          { label: 'Rain',     value: `${w.precipitation}`,        unit: 'mm' },
          { label: 'Cloud',    value: `${w.cloudCover}%`,          color: 'var(--text-secondary)' },
        ].map(item => (
          <div key={item.label} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '6px 4px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 3, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: item.color || 'var(--text-primary)', fontFamily: 'monospace' }}>{item.value}</div>
            {item.unit && <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{item.unit}</div>}
          </div>
        ))}
      </div>

      {/* Soil */}
      {s && (
        <Block>
          <SectionLabel>Soil Conditions</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
            {[
              { label: '0 cm',  val: s.temp0cm },
              { label: '6 cm',  val: s.temp6cm },
              { label: '18 cm', val: s.temp18cm },
            ].map(({ label, val }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#00e676', fontFamily: 'monospace' }}>{val?.toFixed(1) ?? '--'}°C</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8 }}>
            <SectionLabel>Moisture (m³/m³)</SectionLabel>
            {[
              { label: '0–1 cm', val: s.moisture0 },
              { label: '1–3 cm', val: s.moisture1 },
              { label: '3–9 cm', val: s.moisture3 },
            ].map(({ label, val }) => {
              const pct = val != null ? Math.min(val / 0.5 * 100, 100) : 0
              const barColor = !val || val < 0.1 ? '#ff4d4d' : val < 0.25 ? '#ffaa00' : val < 0.4 ? '#00e676' : '#00c8e8'
              return (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', width: 44, fontFamily: 'monospace' }}>{label}</span>
                  <div style={{ flex: 1, height: 4, background: 'var(--bg-deep)', borderRadius: 2 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: 9, color: barColor, width: 38, textAlign: 'right', fontFamily: 'monospace' }}>{val?.toFixed(3) ?? '--'}</span>
                </div>
              )
            })}
          </div>
        </Block>
      )}
    </div>
  )
}
