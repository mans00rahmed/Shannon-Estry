import { Fragment, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const ESTUARY_CENTER = [52.60, -9.2]
const ESTUARY_ZOOM = 8

// Flies to the selected station whenever it changes
function FlyToStation({ point }) {
  const map = useMap()
  useEffect(() => {
    if (point) map.flyTo([point.lat, point.lon], 12, { duration: 1.2 })
    else map.flyTo(ESTUARY_CENTER, ESTUARY_ZOOM, { duration: 1 })
  }, [point])
  return null
}

function makeWindIcon(direction, speed) {
  const color = speed < 20 ? '#00ff88' : speed < 40 ? '#ffb300' : '#ff4455'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32" style="transform:rotate(${direction}deg)">
    <polygon points="16,2 22,26 16,21 10,26" fill="${color}" opacity="0.95"/>
  </svg>`
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      ${svg}
      <span style="font-size:9px;font-weight:700;color:#fff;background:rgba(3,8,15,0.75);padding:1px 4px;border-radius:3px;letter-spacing:0.04em">${Math.round(speed)}</span>
    </div>`,
    className: '',
    iconSize: [36, 46],
    iconAnchor: [18, 23],
  })
}

function makeStationIcon(type, isSelected) {
  const colors = { city: '#00d4ff', town: '#a78bfa', port: '#ffb300', coastal: '#34d399' }
  const color = colors[type] || '#6b7280'
  const size = isSelected ? 16 : 12
  const ring = isSelected ? `box-shadow:0 0 0 3px ${color}55,0 0 12px ${color}88;` : ''
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid rgba(255,255,255,0.9);border-radius:50%;${ring}transition:all 0.3s"></div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function soilColor(moisture) {
  if (moisture == null) return '#6b7280'
  if (moisture < 0.1)  return '#ff4455'
  if (moisture < 0.25) return '#ffb300'
  if (moisture < 0.4)  return '#00ff88'
  return '#00d4ff'
}

export default function ShannonMap({ points, selectedPoint, onSelectPoint }) {
  return (
    <MapContainer
      center={ESTUARY_CENTER}
      zoom={ESTUARY_ZOOM}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
    >
      <FlyToStation point={selectedPoint} />

      <TileLayer
        attribution='Tiles &copy; Esri'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        opacity={0.75}
      />

      {points.map(pt => {
        if (pt.error || !pt.weather) return null
        const w = pt.weather
        const s = pt.soil
        const isSelected = selectedPoint?.id === pt.id
        const moistureRadius = s?.moisture0 != null ? Math.max(600, s.moisture0 * 7000) : 0

        return (
          <Fragment key={pt.id}>
            {moistureRadius > 0 && (
              <Circle
                center={[pt.lat, pt.lon]}
                radius={moistureRadius}
                pathOptions={{
                  color: soilColor(s?.moisture0),
                  fillColor: soilColor(s?.moisture0),
                  fillOpacity: isSelected ? 0.25 : 0.13,
                  weight: isSelected ? 1.5 : 1,
                }}
              />
            )}

            <Marker
              position={[pt.lat + 0.035, pt.lon]}
              icon={makeWindIcon(w.windDirection, w.windSpeed)}
              eventHandlers={{ click: () => onSelectPoint(pt) }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                {pt.name} · {Math.round(w.windSpeed)} km/h
              </Tooltip>
            </Marker>

            <Marker
              position={[pt.lat, pt.lon]}
              icon={makeStationIcon(pt.type, isSelected)}
              eventHandlers={{ click: () => onSelectPoint(pt) }}
            >
              <Popup>
                <div style={{ minWidth: 170, fontFamily: 'system-ui, sans-serif', fontSize: 13 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: '#0c2640' }}>{pt.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 10px', fontSize: 12 }}>
                    <span>🌡️ {w.temperature}°C</span>
                    <span>💧 {w.humidity}%</span>
                    <span>💨 {Math.round(w.windSpeed)} km/h</span>
                    <span>🌧️ {w.precipitation} mm</span>
                    <span>☁️ {w.cloudCover}%</span>
                    <span>🧭 {w.windDirection}°</span>
                  </div>
                  {s && (
                    <div style={{ marginTop: 6, paddingTop: 5, borderTop: '1px solid #e5e7eb', fontSize: 11, color: '#555' }}>
                      Soil: {s.temp0cm?.toFixed(1)}°C · Moisture: {s.moisture0?.toFixed(3)} m³/m³
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </Fragment>
        )
      })}
    </MapContainer>
  )
}
