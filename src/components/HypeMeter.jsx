import './HypeMeter.css'

function HypeMeter({ event }) {
  const getCategoryColor = (category) => {
    const colors = {
      'Trending': '#FF3B30', // system-red
      'Fan Favorite': '#34C759', // system-green
      'Chill': '#5AC8FA', // system-teal
      'Niche': '#AF52DE' // system-purple
    }
    return colors[category] || '#8E8E93' // gray-1
  }

  const categoryColor = getCategoryColor(event.category)
  const hypePercentage = event.hypeScore

  return (
    <div className="hype-meter">
      <div className="hype-header">
        <h3>Hype Score</h3>
        <span className="hype-category" style={{ color: categoryColor }}>
          {event.category}
        </span>
      </div>
      
      <div className="hype-visualization">
        <div className="hype-bar-container">
          <div 
            className="hype-bar"
            style={{ 
              width: `${hypePercentage}%`,
              backgroundColor: categoryColor
            }}
          />
        </div>
        <div className="hype-score">{event.hypeScore}</div>
      </div>

      <div className="hype-metrics">
        <div className="metric">
          <span className="metric-value">{event.metrics.views.toLocaleString()}</span>
          <span className="metric-label">Views</span>
        </div>
        <div className="metric">
          <span className="metric-value">{event.metrics.buyers.toLocaleString()}</span>
          <span className="metric-label">Buyers</span>
        </div>
        <div className="metric">
          <span className="metric-value">{(event.metrics.recency * 100).toFixed(0)}%</span>
          <span className="metric-label">Recency</span>
        </div>
      </div>
    </div>
  )
}

export default HypeMeter

