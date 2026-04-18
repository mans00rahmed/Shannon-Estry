/**
 * ClimateInsights - Component for rendering climate insights data
 * Separates data rendering logic from UI and API concerns
 */

function ClimateInsights({ data }) {
  if (!data) return null

  const { summary, insights } = data

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#dc3545'
      case 'moderate': return '#ffc107'
      case 'low': return '#28a745'
      default: return '#6c757d'
    }
  }

  const getSeverityLabel = (severity) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1)
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      background: 'white',
      padding: '15px',
      borderRadius: '5px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      maxWidth: '350px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '600' }}>
        Climate Impact Summary
      </h3>

      {/* Summary Statistics */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '3px' 
      }}>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>
          <strong>Total Monitoring Points:</strong> {summary.total_points}
        </div>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>
          <strong>Points in Impact Area:</strong> {summary.points_inside_radius}
        </div>
        <div style={{ marginBottom: '8px', fontSize: '14px' }}>
          <strong>Avg. Temperature Anomaly:</strong> +{summary.average_temperature_anomaly}°C
        </div>
        <div style={{ fontSize: '14px' }}>
          <strong>Risk Level:</strong>{' '}
          <span style={{ 
            color: getSeverityColor(summary.risk_level),
            fontWeight: '600'
          }}>
            {getSeverityLabel(summary.risk_level)}
          </span>
        </div>
      </div>

      {/* Insights */}
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: '600' }}>
          Key Insights:
        </h4>
        {insights.map((insight, index) => (
          <div
            key={index}
            style={{
              marginBottom: '15px',
              padding: '10px',
              borderLeft: `4px solid ${getSeverityColor(insight.severity)}`,
              backgroundColor: '#f8f9fa',
              borderRadius: '3px'
            }}
          >
            <div style={{ 
              marginBottom: '5px', 
              fontSize: '13px',
              fontWeight: '600',
              color: getSeverityColor(insight.severity)
            }}>
              {getSeverityLabel(insight.severity)} - {insight.type}
            </div>
            <div style={{ marginBottom: '8px', fontSize: '13px', lineHeight: '1.5' }}>
              {insight.message}
            </div>
            <div style={{ 
              fontSize: '12px', 
              fontStyle: 'italic', 
              color: '#6c757d',
              paddingTop: '5px',
              borderTop: '1px solid #dee2e6'
            }}>
              <strong>Recommendation:</strong> {insight.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClimateInsights
