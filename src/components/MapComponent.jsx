import { useEffect, useRef } from 'react'
import Globe from 'react-globe.gl'

/**
 * Helper function to calculate distance between two points in kilometers
 * Uses Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Generate arc data for circle outline around a center point
 */
function generateCircleArcs(centerLat, centerLon, radiusKm, numPoints = 64) {
  const arcs = []
  for (let i = 0; i < numPoints; i++) {
    const angle1 = (i / numPoints) * 2 * Math.PI
    const angle2 = ((i + 1) / numPoints) * 2 * Math.PI
    
    // Approximate conversion: 1 degree latitude ≈ 111.32 km
    const lat1 = centerLat + (radiusKm / 111.32) * Math.cos(angle1)
    const lon1 = centerLon + (radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle1)
    const lat2 = centerLat + (radiusKm / 111.32) * Math.cos(angle2)
    const lon2 = centerLon + (radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle2)
    
    arcs.push({
      startLat: lat1,
      startLng: lon1,
      endLat: lat2,
      endLng: lon2,
      color: ['#3388ff', '#3388ff']
    })
  }
  return arcs
}

/**
 * Generate polygon points for a circle around a center point (for filled area)
 */
function generateCirclePolygon(centerLat, centerLon, radiusKm, numPoints = 64) {
  const points = []
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI
    // Approximate conversion: 1 degree latitude ≈ 111.32 km
    const lat = centerLat + (radiusKm / 111.32) * Math.cos(angle)
    const lon = centerLon + (radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle)
    points.push([lon, lat]) // Note: [lng, lat] format for GeoJSON
  }
  return {
    type: 'Polygon',
    coordinates: [points]
  }
}

/**
 * MapComponent - 3D Globe visualization of climate impact area
 * 
 * @param {number} centerLat - Latitude of the center point
 * @param {number} centerLon - Longitude of the center point
 * @param {number} radiusKm - Radius in kilometers for the impact circle
 * @param {Array} dataPoints - Array of data points with {lat, lon, value, label}
 */
function MapComponent({ centerLat, centerLon, radiusKm, dataPoints = [] }) {
  const globeRef = useRef()

  // Convert data points to globe format
  const points = dataPoints.map((point, index) => {
    const distance = calculateDistance(centerLat, centerLon, point.lat, point.lon)
    const isInside = distance <= radiusKm
    
    return {
      ...point,
      index,
      distance,
      isInside,
      color: isInside ? '#28a745' : '#dc3545' // Green for inside, red for outside
    }
  })

  // Generate impact area polygon and circle arcs
  const impactAreaPolygon = {
    type: 'Feature',
    geometry: generateCirclePolygon(centerLat, centerLon, radiusKm),
    properties: {
      name: 'Impact Area',
      radius: radiusKm
    }
  }
  
  const circleArcs = generateCircleArcs(centerLat, centerLon, radiusKm)

  // Center the globe on the location
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({
        lat: centerLat,
        lng: centerLon,
        altitude: 2.5
      }, 1000) // Smooth transition
    }
  }, [centerLat, centerLon])

  // Safety check
  if (!centerLat || !centerLon) {
    return <div style={{ padding: '20px' }}>Loading map...</div>
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Globe
        ref={globeRef}
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="https://unpkg.com/three-globe/example/img/night-sky.png"
        
        // Impact area circle polygon (filled area)
        polygonsData={[impactAreaPolygon]}
        polygonAltitude={0.005}
        polygonCapColor={() => 'rgba(51, 136, 255, 0.2)'}
        polygonSideColor={() => 'rgba(51, 136, 255, 0.05)'}
        polygonStrokeColor={() => 'rgba(51, 136, 255, 0)'}
        polygonLabel={({ properties: d }) => `
          <div style="padding: 8px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
            <strong>Impact Area</strong><br/>
            Radius: ${radiusKm} km<br/>
            Center: ${centerLat.toFixed(4)}, ${centerLon.toFixed(4)}
          </div>
        `}
        
        // Circle outline using arcs
        arcsData={circleArcs}
        arcColor="color"
        arcStroke={2}
        arcDashLength={0.4}
        arcDashGap={0}
        
        // Data points
        pointsData={points}
        pointColor="color"
        pointRadius={0.6}
        pointResolution={10}
        pointLabel={({ label, distance, isInside, temperature_anomaly, air_quality_index, precipitation_deviation }) => `
          <div style="padding: 8px; min-width: 200px; background: white; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
            <strong style="font-size: 14px;">${label}</strong>
            <hr style="margin: 5px 0; border: none; border-top: 1px solid #ddd;" />
            <div style="font-size: 12px; line-height: 1.6;">
              <div><strong>Distance:</strong> ${distance.toFixed(2)} km</div>
              <div><strong>Status:</strong> ${isInside ? 'Inside radius' : 'Outside radius'}</div>
              ${temperature_anomaly ? `<div><strong>Temp. Anomaly:</strong> +${temperature_anomaly}°C</div>` : ''}
              ${air_quality_index ? `<div><strong>Air Quality Index:</strong> ${air_quality_index}</div>` : ''}
              ${precipitation_deviation !== undefined ? `<div><strong>Precipitation:</strong> ${precipitation_deviation > 0 ? '+' : ''}${precipitation_deviation}%</div>` : ''}
            </div>
          </div>
        `}
        
        // Center point marker with pulsing ring
        ringsData={[{
          lat: centerLat,
          lng: centerLon,
          maxRadius: radiusKm * 100, // Adjusted scale for globe visualization
          propagationSpeed: 0.5,
          repeatPeriod: 3000
        }]}
        ringColor={() => '#007bff'}
        ringMaxRadius="maxRadius"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        
        // Globe settings
        showAtmosphere={true}
        atmosphereColor="#87CEEB"
        atmosphereAltitude={0.15}
        enablePointerInteraction={true}
        
        // Animation
        animateIn={true}
      />
    </div>
  )
}

export default MapComponent
