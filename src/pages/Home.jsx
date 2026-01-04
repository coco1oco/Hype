import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { events, filterEvents } from "../data/events";
import EventCard from "../components/EventCard";
import SearchFilters from "../components/SearchFilters";
import SkeletonLoader from "../components/SkeletonLoader";
import RecommendationSection from "../components/RecommendationSection";
import { animateStagger, animateFadeIn } from "../utils/animations";
import { recordInteraction } from "../services/personalizationService";
import "./Home.css";

function Home({ favorites, toggleFavorite }) {
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [isLoading, setIsLoading] = useState(true);
  const eventsGridRef = useRef(null);
  const heroRef = useRef(null);
  const [user, setUser] = useState(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    date: "",
    location: "",
  });

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Animate hero on mount
    if (heroRef.current) {
      setTimeout(() => animateFadeIn(heroRef.current, 0), 100);
    }

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const filtered = filterEvents(filters);
    setFilteredEvents(filtered);

    // Animate cards with stagger
    if (eventsGridRef.current) {
      setTimeout(() => {
        const cards = eventsGridRef.current.querySelectorAll(".event-card");
        if (cards.length > 0) {
          animateStagger(cards, 0.05);
        }
      }, 200);
    }

    // Track views for hype score (simulate)
    filtered.forEach((event) => {
      // In a real app, this would be an API call
      // For prototype, we'll just update locally
    });
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="home">
      <div className="hero-section" ref={heroRef}>
        <Link to="/" className="hero-logo">
          <img src="/hype1.png" alt="Hype" className="hero-logo-icon" />
        </Link>
        {user ? (
          <button
            type="button"
            className="hero-account-pill"
            onClick={() => setShowAccountMenu((prev) => !prev)}
          >
            <div className="hero-account-avatar">
              {user.email?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="hero-account-text">
              <span className="hero-account-label">Signed in</span>
              <span className="hero-account-email">{user.email}</span>
            </div>
          </button>
        ) : (
          <button
            className="hero-signin-btn"
            onClick={() => {
              setAuthMode("signin");
              setShowAuthModal(true);
            }}
          >
            Sign in
          </button>
        )}
        <div className="container">
          <h1 className="hero-logo-text">hype</h1>
          <p className="hero-subtitle">
            Second-hand tickets, zero second thoughts.
          </p>
        </div>
      </div>

      <div className="container">
        <SearchFilters filters={filters} onFilterChange={handleFilterChange} />

        {isLoading ? (
          <div className="events-grid" ref={eventsGridRef}>
            <SkeletonLoader type="event-card" count={3} />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3 className="empty-state-title">No events found</h3>
            <p className="empty-state-message">
              Try adjusting your search filters or check back later for new
              events.
            </p>
          </div>
        ) : (
          <>
            <RecommendationSection
              allEvents={events}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
            <div className="events-grid" ref={eventsGridRef}>
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isFavorite={favorites.includes(event.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {user && showAccountMenu && (
        <div className="hero-account-menu">
          <button
            type="button"
            className="hero-account-menu-item"
            onClick={() => {
              setShowAccountMenu(false);
              setAuthMode("signin");
              setShowAuthModal(true);
            }}
          >
            Account
          </button>
          <button
            type="button"
            className="hero-account-menu-item"
            onClick={() => {
              setShowAccountMenu(false);
              setUser(null);
              setAuthEmail("");
              setAuthPassword("");
              setAuthMode("signin");
              setShowAuthModal(true);
            }}
          >
            Switch account
          </button>
          <button
            type="button"
            className="hero-account-menu-item"
            onClick={() => {
              setShowAccountMenu(false);
              setUser(null);
              setAuthEmail("");
              setAuthPassword("");
              // Simple prototype alert
              window.alert("You have been logged out successfully.");
            }}
          >
            Log out
          </button>
        </div>
      )}

      {showAuthModal && (
        <div className="auth-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auth-header">
              <button
                type="button"
                className="auth-back-btn"
                onClick={() => setShowAuthModal(false)}
                aria-label="Close"
              >
                ←
              </button>
              <h2>{authMode === "signin" ? "Sign in" : "Create account"}</h2>
            </div>
            <p className="auth-subtitle">
              Use your email or continue with a connected account.
            </p>

            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (!authEmail) return;
                setUser({ email: authEmail });
                setShowAuthModal(false);
              }}
            >
              <label>
                Email
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                />
              </label>

              <button
                type="submit"
                className="btn btn-primary auth-primary-btn"
              >
                {authMode === "signin" ? "Sign in" : "Register"}
              </button>
            </form>

            <div className="auth-divider">
              <span></span>
              <span>or continue with</span>
              <span></span>
            </div>

            <div className="auth-social-row">
              <button type="button" className="auth-social-btn google">
                <FcGoogle /> Continue with Google
              </button>
              <button type="button" className="auth-social-btn facebook">
                <FaFacebook /> Continue with Facebook
              </button>
            </div>

            <div className="auth-footer">
              <span>
                {authMode === "signin"
                  ? "Don't have an account?"
                  : "Already have an account?"}
              </span>
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() =>
                  setAuthMode((mode) =>
                    mode === "signin" ? "register" : "signin"
                  )
                }
              >
                {authMode === "signin" ? "Register now" : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
