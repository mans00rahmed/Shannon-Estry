/**
 * CollapsiblePanel - Wrapper component for making panels collapsible
 */

import { useState, useEffect } from 'react'
import './CollapsiblePanel.css'

function CollapsiblePanel({ title, children, defaultCollapsed = false, icon = null, onToggle }) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  useEffect(() => {
    setIsCollapsed(defaultCollapsed)
  }, [defaultCollapsed])

  const handleToggle = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    if (onToggle) {
      onToggle(newState)
    }
  }

  return (
    <div className={`collapsible-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div 
        className="panel-header-toggle"
        onClick={handleToggle}
      >
        <div className="panel-header-left">
          {icon && <span className="panel-icon">{icon}</span>}
          <h3 className="panel-title-text">{title}</h3>
        </div>
        <button 
          className="collapse-toggle-btn"
          aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          onClick={(e) => {
            e.stopPropagation()
            handleToggle()
          }}
        >
          <span className={`toggle-icon ${isCollapsed ? 'collapsed' : ''}`}>
            ▼
          </span>
        </button>
      </div>
      <div className={`panel-content ${isCollapsed ? 'hidden' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export default CollapsiblePanel
