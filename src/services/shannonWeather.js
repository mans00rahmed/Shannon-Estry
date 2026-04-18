const MONITORING_POINTS = [
  { id: 'limerick',  name: 'Limerick City',   lat: 52.6638, lon: -8.6267, type: 'city' },
  { id: 'shannon',   name: 'Shannon Town',    lat: 52.7027, lon: -8.8696, type: 'town' },
  { id: 'foynes',    name: 'Foynes',          lat: 52.6124, lon: -9.1036, type: 'port' },
  { id: 'tarbert',   name: 'Tarbert',         lat: 52.5728, lon: -9.3769, type: 'town' },
  { id: 'kilrush',   name: 'Kilrush',         lat: 52.6367, lon: -9.4884, type: 'town' },
  { id: 'carrigaholt',  name: 'Carrigaholt',    lat: 52.5999, lon: -9.7034, type: 'coastal' },
  { id: 'ennis',        name: 'Ennis',          lat: 52.8440, lon: -8.9856, type: 'town' },
  { id: 'listowel',     name: 'Listowel',       lat: 52.4459, lon: -9.4833, type: 'town' },
  { id: 'newcastlewest',name: 'Newcastle West', lat: 52.4489, lon: -9.0556, type: 'town' },
]

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

async function fetchPointData(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'cloud_cover',
    ].join(','),
    hourly: [
      'soil_temperature_0cm',
      'soil_temperature_6cm',
      'soil_temperature_18cm',
      'soil_moisture_0_to_1cm',
      'soil_moisture_1_to_3cm',
      'soil_moisture_3_to_9cm',
    ].join(','),
    timezone: 'Europe/Dublin',
    forecast_days: 1,
  })

  const res = await fetch(`${BASE_URL}?${params}`)
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`)
  return res.json()
}

function parseWeatherCode(code) {
  if (code === 0) return 'Clear sky'
  if (code <= 3) return 'Partly cloudy'
  if (code <= 49) return 'Fog / Mist'
  if (code <= 59) return 'Drizzle'
  if (code <= 69) return 'Rain'
  if (code <= 79) return 'Snow / Sleet'
  if (code <= 84) return 'Rain showers'
  if (code <= 94) return 'Thunderstorm'
  return 'Thunderstorm w/ hail'
}

function parseHourlyNow(hourlyData, variableKey) {
  if (!hourlyData || !hourlyData.time) return null
  const now = new Date()
  const hourStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:00`
  const idx = hourlyData.time.findIndex(t => t === hourStr)
  if (idx === -1) return hourlyData[variableKey]?.[0] ?? null
  return hourlyData[variableKey]?.[idx] ?? null
}

export async function fetchAllPointsData() {
  const results = await Promise.all(
    MONITORING_POINTS.map(async (point) => {
      try {
        const data = await fetchPointData(point.lat, point.lon)
        const c = data.current
        const h = data.hourly
        return {
          ...point,
          weather: {
            temperature: c.temperature_2m,
            humidity: c.relative_humidity_2m,
            windSpeed: c.wind_speed_10m,
            windDirection: c.wind_direction_10m,
            windGusts: c.wind_gusts_10m,
            precipitation: c.precipitation,
            weatherCode: c.weather_code,
            condition: parseWeatherCode(c.weather_code),
            pressure: c.surface_pressure,
            cloudCover: c.cloud_cover,
          },
          soil: {
            temp0cm:   parseHourlyNow(h, 'soil_temperature_0cm'),
            temp6cm:   parseHourlyNow(h, 'soil_temperature_6cm'),
            temp18cm:  parseHourlyNow(h, 'soil_temperature_18cm'),
            moisture0: parseHourlyNow(h, 'soil_moisture_0_to_1cm'),
            moisture1: parseHourlyNow(h, 'soil_moisture_1_to_3cm'),
            moisture3: parseHourlyNow(h, 'soil_moisture_3_to_9cm'),
          },
          error: null,
        }
      } catch (err) {
        return { ...point, error: err.message, weather: null, soil: null }
      }
    })
  )
  return results
}

export { MONITORING_POINTS }
