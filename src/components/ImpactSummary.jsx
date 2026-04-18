/**
 * ImpactSummary - Right panel component for 3P (People, Place, Planet) summary
 * 
 * This component displays the aggregated impact across the three pillars:
 * - People: Impacts on workers, local food supply, farmer income
 * - Place: Impacts on water resources, local environment
 * - Planet: Impacts on soil, emissions, long-term sustainability
 * 
 * Uses directional indicators (↑ ↓ →) to show impact direction:
 * - ↑ = Positive trend
 * - ↓ = Negative trend
 * - → = Neutral/No change
 * 
 * Assumption: Impacts are aggregated from all active rules affecting
 * nodes categorized under each pillar.
 */

import './ImpactSummary.css'

function ImpactSummary({ impacts }) {
  const pillars = ['People', 'Place', 'Planet']
  
  // Get indicator symbol based on impact
  const getIndicator = (impact) => {
    switch (impact) {
      case 'POSITIVE':
        return '↑'
      case 'NEGATIVE':
        return '↓'
      case 'NEUTRAL':
      default:
        return '→'
    }
  }

  // Get indicator color
  const getIndicatorColor = (impact) => {
    switch (impact) {
      case 'POSITIVE':
        return '#4caf50' // Green
      case 'NEGATIVE':
        return '#f44336' // Red
      case 'NEUTRAL':
      default:
        return '#999999' // Grey
    }
  }

  // Get description text
  const getDescription = (pillar, impact) => {
    if (impact === 'NEUTRAL') {
      return `No significant ${pillar.toLowerCase()} impact detected`
    }
    const direction = impact === 'POSITIVE' ? 'positive' : 'negative'
    return `${pillar} impact is ${direction}`
  }

  return (
    <div className="impact-summary">
      
      <div className="summary-intro">
        <p>
          This summary aggregates impacts across the three pillars based on
          current farm input selections and active rules.
        </p>
      </div>

      <div className="pillars-list">
        {pillars.map(pillar => {
          const impact = impacts[pillar] || 'NEUTRAL'
          return (
            <div key={pillar} className="pillar-card">
              <div className="pillar-header">
                <h3 className="pillar-name">{pillar}</h3>
                <div
                  className="pillar-indicator"
                  style={{ color: getIndicatorColor(impact) }}
                >
                  {getIndicator(impact)}
                </div>
              </div>
              <p className="pillar-description">
                {getDescription(pillar, impact)}
              </p>
            </div>
          )
        })}
      </div>

      <div className="summary-note">
        <p>
          <strong>Note:</strong> Indicators show directional trends only.
          Actual magnitude depends on multiple interacting factors.
        </p>
      </div>
    </div>
  )
}

export default ImpactSummary
