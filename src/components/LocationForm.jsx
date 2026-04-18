/**
 * LocationForm - UI component for location input and selection
 * Handles user interaction for setting location coordinates
 */

import { useState } from 'react'

function LocationForm({ onLocationSubmit, onUseCurrentLocation, isLoading, currentLocation }) {
  const [lat, setLat] = useState(currentLocation?.lat?.toString() || '')
  const [lon, setLon] = useState(currentLocation?.lon?.toString() || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      alert('Please enter valid latitude and longitude values')
      return
    }
    
    if (latNum < -90 || latNum > 90) {
      alert('Latitude must be between -90 and 90')
      return
    }
    
    if (lonNum < -180 || lonNum > 180) {
      alert('Longitude must be between -180 and 180')
      return
    }
    
    onLocationSubmit(latNum, lonNum)
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      zIndex: 1000,
      background: 'white',
      padding: '15px',
      borderRadius: '5px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      minWidth: '280px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>
        Location-Based Climate Insights
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Latitude:
          </label>
          <input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="e.g., 53.3498"
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              fontSize: '14px'
            }}
            disabled={isLoading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Longitude:
          </label>
          <input
            type="number"
            step="any"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="e.g., -6.2603"
            style={{
              width: '100%',
              padding: '6px',
              border: '1px solid #ccc',
              borderRadius: '3px',
              fontSize: '14px'
            }}
            disabled={isLoading}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Loading...' : 'Analyze Location'}
          </button>
          
          <button
            type="button"
            onClick={onUseCurrentLocation}
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            Use My Location
          </button>
        </div>
      </form>
    </div>
  )
}

export default LocationForm
