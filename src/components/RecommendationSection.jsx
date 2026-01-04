import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdOutlineStarPurple500 } from "react-icons/md";
import {
  getPersonalizedRecommendations,
  getPersonalizationInsights,
} from "../services/personalizationService";
import "./RecommendationSection.css";

function RecommendationSection({
  allEvents = [],
  favorites = [],
  onToggleFavorite = () => {},
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [hasPersonalizationData, setHasPersonalizationData] = useState(false);

  useEffect(() => {
    // Check if user has any personalization data
    const insights = getPersonalizationInsights();
    const hasData = insights.totalInteractions > 0;
    setHasPersonalizationData(hasData);

    // Only show recommendations if user has interaction history
    if (hasData) {
      const recs = getPersonalizedRecommendations(allEvents, 3);
      setRecommendations(recs);
    } else {
      setRecommendations([]);
    }
  }, [allEvents]);

  if (!hasPersonalizationData || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendation-section">
      <div className="recommendation-header">
        <div className="recommendation-title-group">
          <MdOutlineStarPurple500 className="recommendation-spark-icon" />
          <h2 className="recommendation-title">Just For You</h2>
        </div>
        <p className="recommendation-subtitle">
          Personalized based on your interests
        </p>
      </div>

      <div className="recommendation-grid">
        {recommendations.map((event) => {
          const isFavorite = favorites.includes(event.id);

          return (
            <Link
              to={`/event/${event.id}`}
              key={event.id}
              className="recommendation-card"
            >
              <div className="recommendation-card-image">
                <img
                  src={event.cover}
                  alt={event.title}
                  className="recommendation-image"
                />
                <div className="recommendation-overlay">
                  <button
                    className={`recommendation-favorite-btn ${
                      isFavorite ? "active" : ""
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite(event.id);
                    }}
                  >
                    {isFavorite ? "♥" : "♡"}
                  </button>
                  <div className="recommendation-hype-badge">
                    <span className="hype-value">{event.hypeScore}</span>
                    <span className="hype-label">hype</span>
                  </div>
                </div>
              </div>

              <div className="recommendation-content">
                <h3 className="recommendation-event-title">{event.title}</h3>
                <p className="recommendation-category">{event.category}</p>
                <div className="recommendation-tags">
                  {event.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="recommendation-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RecommendationSection;
