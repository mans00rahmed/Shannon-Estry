/**
 * FarmInputs - Left panel component for selecting farm configuration
 * 
 * Enhanced with better visual design and user experience
 */

import { useState } from 'react'
import './FarmInputs.css'

function FarmInputs({ inputs, onChange }) {
  const [focusedInput, setFocusedInput] = useState(null)

  const inputOptions = {
    water_source: ['Rain', 'Groundwater'],
    fertilizer_type: ['Organic', 'Chemical'],
    irrigation_method: ['Drip', 'Flood'],
    energy_use: ['Manual', 'Fuel', 'Electric']
  }

  const inputLabels = {
    water_source: 'Water Source',
    fertilizer_type: 'Fertilizer Type',
    irrigation_method: 'Irrigation Method',
    energy_use: 'Energy Use'
  }

  const inputIcons = {
    water_source: '💧',
    fertilizer_type: '🌿',
    irrigation_method: '🚿',
    energy_use: '⚡'
  }

  const inputDescriptions = {
    water_source: 'Select the primary water source for irrigation',
    fertilizer_type: 'Choose between organic or chemical fertilizers',
    irrigation_method: 'Select the irrigation technique used',
    energy_use: 'Choose the primary energy source for farm operations'
  }

  return (
    <div className="farm-inputs">
      <div className="inputs-header">
        <p className="inputs-subtitle">Configure your farm settings</p>
      </div>
      
      <div className="inputs-list">
        {Object.keys(inputs).map(key => (
          <div 
            key={key} 
            className={`input-group ${focusedInput === key ? 'input-group-focused' : ''}`}
          >
            <div className="input-label-container">
              <span className="input-icon">{inputIcons[key]}</span>
              <label className="input-label">{inputLabels[key]}</label>
            </div>
            
            <select
              className="input-select"
              value={inputs[key]}
              onChange={(e) => onChange(key, e.target.value)}
              onFocus={() => setFocusedInput(key)}
              onBlur={() => setFocusedInput(null)}
            >
              {inputOptions[key].map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            
            <p className="input-description">{inputDescriptions[key]}</p>
            
            {/* Current value indicator */}
            <div className="input-value-badge">
              <span className="badge-label">Current:</span>
              <span className="badge-value">{inputs[key]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="inputs-note">
        <div className="note-icon">ℹ️</div>
        <div className="note-content">
          <strong>Tip:</strong> Changes to inputs automatically trigger rule evaluation and update the impact graph in real-time.
        </div>
      </div>
    </div>
  )
}

export default FarmInputs
