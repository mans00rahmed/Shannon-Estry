/**
 * API service for fetching climate impact data
 * 
 * This service handles all API communication. Currently uses mock data.
 * 
 * EXAMPLE JSON RESPONSE STRUCTURE:
 * {
 *   "location": {
 *     "lat": 53.3498,
 *     "lon": -6.2603,
 *     "name": "Dublin, Ireland"
 *   },
 *   "radius_km": 10,
 *   "summary": {
 *     "total_points": 12,
 *     "points_inside_radius": 7,
 *     "average_temperature_anomaly": 1.2,
 *     "risk_level": "moderate"
 *   },
 *   "insights": [
 *     {
 *       "type": "temperature",
 *       "severity": "moderate",
 *       "message": "Temperature anomaly of +1.2°C detected in the area",
 *       "recommendation": "Monitor heat stress indicators for vulnerable populations"
 *     },
 *     {
 *       "type": "precipitation",
 *       "severity": "low",
 *       "message": "Precipitation patterns show 15% deviation from historical average",
 *       "recommendation": "Review water management strategies"
 *     }
 *   ],
 *   "points": [
 *     {
 *       "lat": 53.3498,
 *       "lon": -6.2603,
 *       "value": 85,
 *       "label": "City Center",
 *       "temperature_anomaly": 1.3,
 *       "air_quality_index": 65,
 *       "precipitation_deviation": 12
 *     }
 *   ]
 * }
 */

/**
 * Generates mock climate data based on location
 * In production, this would be replaced with actual API call
 */
function generateMockClimateData(lat, lon, radiusKm) {
  // Generate points around the location
  const points = []
  const basePoints = [
    { offsetLat: 0, offsetLon: 0, label: "City Center", baseValue: 85 },
    { offsetLat: 0.01, offsetLon: 0.01, label: "North District", baseValue: 72 },
    { offsetLat: -0.01, offsetLon: -0.01, label: "South Quarter", baseValue: 91 },
    { offsetLat: 0.005, offsetLon: -0.01, label: "West Area", baseValue: 68 },
    { offsetLat: -0.005, offsetLon: 0.01, label: "East Zone", baseValue: 79 },
    { offsetLat: 0.002, offsetLon: -0.005, label: "Central Hub", baseValue: 83 },
    { offsetLat: -0.012, offsetLon: -0.002, label: "Lower District", baseValue: 65 },
    { offsetLat: 0.1, offsetLon: 0.06, label: "Far North", baseValue: 45 },
    { offsetLat: -0.1, offsetLon: -0.04, label: "Far South", baseValue: 38 },
    { offsetLat: 0.05, offsetLon: -0.14, label: "Far West", baseValue: 42 },
    { offsetLat: -0.05, offsetLon: 0.16, label: "Far East", baseValue: 51 },
    { offsetLat: 0.15, offsetLon: -0.09, label: "Remote North", baseValue: 33 },
  ]

  points.push(...basePoints.map(p => ({
    lat: lat + p.offsetLat,
    lon: lon + p.offsetLon,
    value: p.baseValue,
    label: p.label,
    temperature_anomaly: (Math.random() * 2.5 - 0.5).toFixed(1),
    air_quality_index: Math.floor(Math.random() * 50 + 30),
    precipitation_deviation: Math.floor(Math.random() * 30 - 10)
  })))

  const pointsInside = points.filter(p => {
    const distance = calculateDistance(lat, lon, p.lat, p.lon)
    return distance <= radiusKm
  })

  const avgTempAnomaly = pointsInside.reduce((sum, p) => sum + parseFloat(p.temperature_anomaly), 0) / pointsInside.length

  return {
    location: {
      lat,
      lon,
      name: `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`
    },
    radius_km: radiusKm,
    summary: {
      total_points: points.length,
      points_inside_radius: pointsInside.length,
      average_temperature_anomaly: avgTempAnomaly.toFixed(1),
      risk_level: avgTempAnomaly > 1.5 ? 'high' : avgTempAnomaly > 0.8 ? 'moderate' : 'low'
    },
    insights: generateInsights(avgTempAnomaly, pointsInside.length),
    points
  }
}

/**
 * Generates climate insights based on data
 */
function generateInsights(avgTempAnomaly, pointsInside) {
  const insights = []

  if (avgTempAnomaly > 1.5) {
    insights.push({
      type: "temperature",
      severity: "high",
      message: `Significant temperature anomaly of +${avgTempAnomaly.toFixed(1)}°C detected in the impact area`,
      recommendation: "Immediate monitoring recommended. Consider heat stress mitigation measures for vulnerable populations."
    })
  } else if (avgTempAnomaly > 0.8) {
    insights.push({
      type: "temperature",
      severity: "moderate",
      message: `Temperature anomaly of +${avgTempAnomaly.toFixed(1)}°C detected in the area`,
      recommendation: "Monitor heat stress indicators and adjust urban planning strategies accordingly."
    })
  } else {
    insights.push({
      type: "temperature",
      severity: "low",
      message: `Temperature anomaly of +${avgTempAnomaly.toFixed(1)}°C is within acceptable range`,
      recommendation: "Continue regular monitoring of temperature trends."
    })
  }

  insights.push({
    type: "coverage",
    severity: "info",
    message: `${pointsInside} monitoring points are within the ${10} km radius`,
    recommendation: "Data coverage is adequate for impact assessment in this area."
  })

  insights.push({
    type: "precipitation",
    severity: "moderate",
    message: "Precipitation patterns show deviation from historical averages in several monitoring points",
    recommendation: "Review water management and drainage infrastructure capacity."
  })

  return insights
}

/**
 * Helper function to calculate distance between two points in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
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
 * Fetches climate impact data for a given location and radius
 * 
 * @param {number} lat - Latitude of the center point
 * @param {number} lon - Longitude of the center point
 * @param {number} radiusKm - Radius in kilometers
 * @returns {Promise<Object>} Promise resolving to climate impact data
 * 
 * TO INTEGRATE WITH REAL BACKEND:
 * Replace the mock data generation with:
 * 
 * const response = await fetch(
 *   `/api/impact?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`
 * )
 * if (!response.ok) {
 *   throw new Error(`API error: ${response.status} ${response.statusText}`)
 * }
 * return await response.json()
 */
export async function fetchClimateImpactData(lat, lon, radiusKm) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // TODO: Replace with actual API call when backend is ready
  // const response = await fetch(`/api/impact?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`)
  // if (!response.ok) throw new Error('Failed to fetch climate impact data')
  // return await response.json()
  
  return generateMockClimateData(lat, lon, radiusKm)
}
