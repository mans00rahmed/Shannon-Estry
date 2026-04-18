# Location-Based Climate Insights Visualizer

A minimal React + Vite frontend application for demonstrating location-based climate impact analysis. The app visualizes a 10 km radius impact area around a given location using Leaflet maps and displays informative climate insights.

## Features

- **Device Geolocation**: Get location coordinates from device GPS
- **Manual Location Input**: Enter custom latitude/longitude coordinates
- **Interactive Map**: 10 km radius circle visualization with Leaflet
- **Climate Insights**: Informative climate impact analysis and recommendations
- **Data Points**: Monitoring points with temperature anomalies, air quality, and precipitation data
- **Color-coded Markers**: Green for points inside radius, red for outside
- **Detailed Popups**: Climate metrics for each monitoring point
- **API-ready Structure**: Clean separation of UI, API, and rendering logic

## Architecture

The application follows a clean separation of concerns:

- **UI Layer**: `LocationForm.jsx` - User interface for location input
- **API Layer**: `services/api.js` - Data fetching logic (currently mocked)
- **Rendering Layer**: `MapComponent.jsx` and `ClimateInsights.jsx` - Data visualization

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Project Structure

```
src/
  ├── App.jsx                    # Main app component (orchestrates UI, API, rendering)
  ├── main.jsx                   # React entry point
  ├── index.css                  # Global styles
  ├── components/
  │   ├── LocationForm.jsx       # UI: Location input form
  │   ├── MapComponent.jsx       # Rendering: Map visualization
  │   └── ClimateInsights.jsx   # Rendering: Climate insights display
  └── services/
      ├── api.js                 # API: Climate data fetching (mocked)
      └── geolocation.js         # API: Device geolocation
```

## API Integration

The app uses mock data but is structured for easy backend integration.

### Example JSON Response Structure

The API should return data in the following format (see `src/services/api.js` for full example):

```json
{
  "location": {
    "lat": 53.3498,
    "lon": -6.2603,
    "name": "Dublin, Ireland"
  },
  "radius_km": 10,
  "summary": {
    "total_points": 12,
    "points_inside_radius": 7,
    "average_temperature_anomaly": 1.2,
    "risk_level": "moderate"
  },
  "insights": [
    {
      "type": "temperature",
      "severity": "moderate",
      "message": "Temperature anomaly of +1.2°C detected in the area",
      "recommendation": "Monitor heat stress indicators for vulnerable populations"
    }
  ],
  "points": [
    {
      "lat": 53.3498,
      "lon": -6.2603,
      "value": 85,
      "label": "City Center",
      "temperature_anomaly": 1.3,
      "air_quality_index": 65,
      "precipitation_deviation": 12
    }
  ]
}
```

### To Connect to Real Backend

1. Open `src/services/api.js`
2. Replace the `generateMockClimateData` call in `fetchClimateImpactData` with:

```javascript
export async function fetchClimateImpactData(lat, lon, radiusKm) {
  const response = await fetch(
    `/api/impact?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`
  )
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  return await response.json()
}
```

The API endpoint should be: `GET /api/impact?lat={lat}&lon={lon}&radius_km={radius}`

## Usage

1. **Use Device Location**: Click "Use My Location" to get coordinates from your device GPS
2. **Manual Input**: Enter latitude and longitude, then click "Analyze Location"
3. **View Insights**: Climate insights panel shows summary statistics and recommendations
4. **Explore Points**: Click on map markers to see detailed climate metrics

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Notes

- This is a temporary demonstration interface for academic/research purposes
- All data is currently mocked - replace API service when backend is ready
- The UI is kept minimal and professional for demo purposes
