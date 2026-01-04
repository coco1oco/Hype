import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById } from "../data/events";
import { formatDate, formatTime, getTimeUntilEvent } from "../utils";
import { useButtonAnimation } from "../hooks/useButtonAnimation";
import { useToast } from "../components/ToastProvider";
import {
  saveVenue,
  removeVenue,
  isVenueSaved as checkVenueSaved,
} from "../services/venueService";
import { recordInteraction } from "../services/personalizationService";
import { FaCalendarAlt, FaWallet } from "react-icons/fa";
import CountdownTimer from "../components/CountdownTimer";
import EventMap from "../components/EventMap";
import TicketTierList from "../components/TicketTierList";
import HypeMeter from "../components/HypeMeter";
import { getResaleListingsForEvent } from "../services/marketplaceService";
import "./EventDetail.css";

function EventDetail({ favorites, toggleFavorite }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [resaleTiers, setResaleTiers] = useState([]);
  const [timeUntil, setTimeUntil] = useState(null);
  const [isVenueSaved, setIsVenueSaved] = useState(false);
  const handleButtonClick = useButtonAnimation();
  const { addToast } = useToast();

  useEffect(() => {
    const eventData = getEventById(id);
    if (eventData) {
      setEvent(eventData);
      // Record personalization view interaction
      recordInteraction(eventData.id, eventData, "view");
      // Simulate view tracking
      eventData.metrics.views++;
    }
  }, [id]);

  useEffect(() => {
    if (event) {
      setIsVenueSaved(checkVenueSaved(event.id));
      // Build resale/auction listings (frontend-only)
      const listings = getResaleListingsForEvent(event.id, event.tiers || []);
      setResaleTiers(listings);
    }
  }, [event]);

  useEffect(() => {
    if (!event) return;

    const updateTimer = () => {
      setTimeUntil(getTimeUntilEvent(event.startTime));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [event]);

  if (!event) {
    return <div className="error">Event not found</div>;
  }

  const handleVenueSaveToggle = () => {
    if (!event) return;
    if (isVenueSaved) {
      removeVenue(event.id);
      setIsVenueSaved(false);
      addToast({ type: "info", message: "Venue removed from saved list." });
    } else {
      saveVenue({
        eventId: event.id,
        venue: event.venue,
        address: event.address,
        city: event.city,
        coordinates: event.coordinates,
      });
      setIsVenueSaved(true);
      addToast({ type: "success", message: "Venue saved." });
    }
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    try {
      const formatICSDate = (date) =>
        date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      const start = new Date(event.startTime);
      const end = event.endTime
        ? new Date(event.endTime)
        : new Date(start.getTime() + 2 * 60 * 60 * 1000);

      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//EventCatalogue//EN",
        "BEGIN:VEVENT",
        `UID:${event.id}@eventcatalogue`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(start)}`,
        `DTEND:${formatICSDate(end)}`,
        `SUMMARY:${event.title}`,
        `LOCATION:${event.venue}, ${event.address}`,
        `DESCRIPTION:${event.description}`,
        "END:VEVENT",
        "END:VCALENDAR",
      ].join("\r\n");

      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${event.title.replace(/\s+/g, "_")}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({ type: "success", message: "Calendar reminder downloaded." });
    } catch (err) {
      console.error(err);
      addToast({ type: "error", message: "Unable to create calendar event." });
    }
  };

  const handleWalletPass = () => {
    addToast({ type: "info", message: "Apple Wallet support coming soon." });
  };

  const expectationItems = [
    {
      title: "Doors open",
      detail:
        "Arena doors open 90 minutes before showtime. Have your QR pass ready.",
    },
    {
      title: "Bag policy",
      detail:
        "Clear bags only. No professional cameras, tripods, or large power banks.",
    },
    {
      title: "Travel tips",
      detail: `${event.city} • ${event.venue}. Expect heavy traffic; plan extra travel time.`,
    },
  ];

  const handlePurchase = (tierId) => {
    navigate(`/purchase/${id}?tier=${tierId}`);
  };

  return (
    <div className="event-detail">
      <div
        className="event-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${event.cover})`,
          "--hero-color": event.heroColor,
          "--hero-accent": event.heroAccent,
        }}
      >
        <div className="container">
          <button
            onClick={(e) => {
              handleButtonClick(e, () => navigate(-1));
            }}
            className="back-button"
          >
            ← Back
          </button>

          <div className="event-hero-content">
            <div className="event-header">
              <div>
                <span className="event-tagline">{event.tagline}</span>
                <h1 className="event-title">{event.title}</h1>
                <div className="event-meta">
                  <span>{formatDate(event.startTime)}</span>
                  <span className="dot">•</span>
                  <span>{formatTime(event.startTime)}</span>
                  <span className="dot">•</span>
                  <span>
                    {event.venue}, {event.city}
                  </span>
                </div>
                <div className="resale-badge-row">
                  <span className="resale-badge">
                    Second-hand tickets only · Powered by fan-to-fan resale
                    (prototype)
                  </span>
                </div>
              </div>
              <button
                className={`favorite-button ${
                  favorites.includes(event.id) ? "active" : ""
                }`}
                onClick={(e) => {
                  handleButtonClick(e, () => toggleFavorite(event.id));
                }}
              >
                {favorites.includes(event.id) ? "★" : "☆"}
              </button>
            </div>

            {timeUntil && !timeUntil.isPast && (
              <CountdownTimer timeUntil={timeUntil} />
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="event-content">
          <div className="event-main">
            <section className="event-section">
              <h2>About This Event</h2>
              <p className="event-description">{event.description}</p>
            </section>

            <section className="event-section">
              <h2>Event Details</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Date & Time</span>
                  <span className="detail-value">
                    {formatDate(event.startTime)} at{" "}
                    {formatTime(event.startTime)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Venue</span>
                  <span className="detail-value">{event.venue}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{event.city}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Venue Type</span>
                  <span className="detail-value">{event.venueType}</span>
                </div>
                {event.accessibility && (
                  <div className="detail-item">
                    <span className="detail-label">Accessibility</span>
                    <span className="detail-value">
                      ✓ Wheelchair accessible
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Organizer</span>
                  <span className="detail-value">{event.organizer.name}</span>
                </div>
                <div className="detail-item span-full">
                  <button
                    className={`save-venue-btn ${isVenueSaved ? "saved" : ""}`}
                    onClick={(e) => handleButtonClick(e, handleVenueSaveToggle)}
                  >
                    {isVenueSaved ? "Saved to My Venues" : "Save this Venue"}
                  </button>
                </div>
              </div>
            </section>

            <section className="event-section">
              <h2>Location</h2>
              <EventMap
                address={event.address}
                venue={event.venue}
                coordinates={event.coordinates}
              />
            </section>

            <section className="event-section plan-section">
              <h2>Plan & Essentials</h2>
              <div className="plan-actions">
                <button
                  className="plan-btn"
                  onClick={(e) => handleButtonClick(e, handleAddToCalendar)}
                >
                  <FaCalendarAlt /> Add to Calendar
                </button>
                <button
                  className="plan-btn outline"
                  onClick={(e) => handleButtonClick(e, handleWalletPass)}
                >
                  <FaWallet /> Apple Wallet
                </button>
              </div>
              <ul className="expect-list">
                {expectationItems.map((item) => (
                  <li key={item.title}>
                    <span className="expect-title">{item.title}</span>
                    <p>{item.detail}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="event-section">
              <h2>Tags</h2>
              <div className="tags-list">
                {event.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
                <span className="tag resale-tag">Second-hand</span>
              </div>
            </section>
          </div>

          <div className="event-sidebar">
            <HypeMeter event={event} />

            <section className="ticket-section">
              <h2>Second-hand Ticket Options</h2>
              <TicketTierList tiers={resaleTiers} onPurchase={handlePurchase} />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetail;
