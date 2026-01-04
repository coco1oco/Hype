import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EventCard from '../components/EventCard'
import { events } from '../data/events'
import { getSavedVenues, removeVenue } from '../services/venueService'
import { useToast } from '../components/ToastProvider'
import './Favorites.css'

function Favorites({ favorites, toggleFavorite }) {
  const { addToast } = useToast()
  const [savedVenues, setSavedVenues] = useState(() => getSavedVenues())

  const favoriteEvents = useMemo(() => {
    if (!favorites?.length) return []
    return events.filter((event) => favorites.includes(event.id))
  }, [favorites])

  const savedVenueEntries = useMemo(() => {
    if (!savedVenues?.length) return []
    return savedVenues.map((venue) => {
      const relatedEvent = events.find((event) => event.id === venue.eventId)
      return {
        ...venue,
        eventTitle: relatedEvent?.title,
        eventDate: relatedEvent?.startTime,
        cover: relatedEvent?.cover,
        city: relatedEvent?.city,
      }
    })
  }, [savedVenues])

  useEffect(() => {
    const handleSavedUpdate = () => {
      setSavedVenues(getSavedVenues())
    }

    window.addEventListener('saved-venues-updated', handleSavedUpdate)
    return () => window.removeEventListener('saved-venues-updated', handleSavedUpdate)
  }, [])

  const handleRemoveVenue = (eventId) => {
    removeVenue(eventId)
    setSavedVenues(getSavedVenues())
    addToast({ message: 'Removed from Saved Venues', type: 'success' })
  }

  return (
    <div className="favorites-page">
      <section className="favorites-hero container">
        <div className="favorites-logo">
          <img src="/hype1.png" alt="Hype" className="hype-icon" />
        </div>
        <p className="eyebrow">Collections</p>
        <h1>Favorites & Saved Venues</h1>
        <p className="subtitle">
          Quick access to artists you love and locations you plan to revisit.
        </p>
      </section>

      <section className="favorites-section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Events</p>
            <h2>Favorite lineups</h2>
          </div>
          {favoriteEvents.length > 0 && (
            <span className="count-pill">{favoriteEvents.length}</span>
          )}
        </div>

        {favoriteEvents.length === 0 ? (
          <div className="empty-state card">
            <div>
              <h3>No favorites yet</h3>
              <p>
                Tap the category badge on any event to save it here instantly.
              </p>
            </div>
            <Link to="/" className="btn btn-primary">
              Browse events
            </Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isFavorite={favorites.includes(event.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        )}
      </section>

      <section className="venues-section container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Venues</p>
            <h2>Saved locations</h2>
          </div>
          {savedVenueEntries.length > 0 && (
            <span className="count-pill">{savedVenueEntries.length}</span>
          )}
        </div>

        {savedVenueEntries.length === 0 ? (
          <div className="empty-state card">
            <div>
              <h3>No venues saved</h3>
              <p>
                Use “Save this Venue” on an event page to build your go-to list.
              </p>
            </div>
            <Link to="/" className="btn btn-secondary">
              Discover venues
            </Link>
          </div>
        ) : (
          <div className="saved-venues-list">
            {savedVenueEntries.map((venue) => (
              <div key={venue.eventId} className="saved-venue-card">
                <div className="saved-venue-meta">
                  <div className="saved-venue-cover">
                    {venue.cover ? (
                      <img src={venue.cover} alt={`${venue.eventTitle} poster`} loading="lazy" />
                    ) : (
                      <div className="cover-placeholder" aria-hidden="true">
                        {venue.venue?.[0] || '•'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="venue-title">{venue.eventTitle || venue.venue}</p>
                    <p className="venue-address">{venue.venue}</p>
                    <p className="venue-city">{venue.city}</p>
                  </div>
                </div>
                <div className="saved-venue-actions">
                  <Link
                    to={`/event/${venue.eventId}`}
                    className="btn btn-secondary"
                    aria-label={`View details for ${venue.eventTitle || 'this event'}`}
                  >
                    View event
                  </Link>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleRemoveVenue(venue.eventId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Favorites


