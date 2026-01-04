import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { formatEventDate } from '../utils'
import { animateFadeIn, animateBadgePop } from '../utils/animations'
import './EventCard.css'

function EventCard({ event, isFavorite, onToggleFavorite }) {
  const badgeRef = useRef(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    // Cards will animate via stagger in Home component
  }, [])

  const handleFavoriteClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Animate badge pop
    if (badgeRef.current) {
      animateBadgePop(badgeRef.current)
    }
    
    onToggleFavorite(event.id)
  }

  const getCategoryColor = (category) => {
    const colors = {
      'Trending': '#FF3B30', // system-red
      'Fan Favorite': '#34C759', // system-green
      'Chill': '#5AC8FA', // system-teal
      'Niche': '#AF52DE' // system-purple
    }
    return colors[category] || '#8E8E93' // gray-1
  }

  const isColdStartHackathon = event.id === 'c-old-start-2025-hackathon'

  return (
    <Link to={`/event/${event.id}`} className="event-card">
      <div className="event-card-image">
        {!imageLoaded && !imageError && (
          <div className="image-placeholder">
            <div className="image-placeholder-shimmer" />
          </div>
        )}
        <img 
          src={event.cover} 
          alt={`${event.title} poster`} 
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={imageLoaded ? 'loaded' : ''}
          style={{ display: imageError ? 'none' : 'block' }}
        />
        {imageError && (
          <div className="image-error">
            <span>Image unavailable</span>
          </div>
        )}
        <div className="event-card-overlay" />
        <div className="event-card-header">
          <div className="event-card-info">
            <h3 className="event-title">{event.title}</h3>
          </div>
          <button 
            ref={badgeRef}
            className={`hype-badge ${isFavorite ? 'favorite' : ''}`}
            style={{ '--category-color': getCategoryColor(event.category) }}
            onClick={handleFavoriteClick}
          >
            <span className="hype-label">{event.category}</span>
            <span className="hype-score">{isFavorite ? '★' : event.hypeScore}</span>
          </button>
        </div>
        <div className="event-card-footer">
          <div className="event-meta">
            <span>{event.city}</span>
            <span className="dot">•</span>
            <span>{formatEventDate(event.startTime)}</span>
          </div>
        </div>
      </div>
      <div className="event-card-details">
        <div className="venue-info">
          <span className="venue-name">{event.venue}</span>
          <span className="venue-tags">{event.tags.slice(0, 2).join(' · ')}</span>
        </div>
        {isColdStartHackathon ? (
          <div className="event-price event-price-free">
            Register
          </div>
        ) : (
          <div className="event-price">
            From {event.tiers[0]?.currency} {event.tiers[0]?.price.toLocaleString()}
          </div>
        )}
      </div>
    </Link>
  )
}

export default EventCard
