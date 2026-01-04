import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { animateNavActive, animateFadeIn } from '../utils/animations'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const navRef = useRef(null)

  useEffect(() => {
    // Animate nav on mount
    if (navRef.current) {
      setTimeout(() => animateFadeIn(navRef.current, 0.2), 300)
    }
  }, [])

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleNavClick = (e) => {
    animateNavActive(e.currentTarget)
  }

  return (
    <>
      {/* Floating Bottom Navigation */}
      <nav className="bottom-nav" ref={navRef}>
        <div className="nav-pill">
          <Link
            to="/"
            className={`nav-item ${isActive('/') ? 'active' : ''}`}
            onClick={handleNavClick}
            aria-label="Go to Home"
          >
            <div className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="nav-label">Home</span>
          </Link>

          <Link
            to="/favorites"
            className={`nav-item ${isActive('/favorites') ? 'active' : ''}`}
            onClick={handleNavClick}
            aria-label="View Favorites and Saved Venues"
          >
            <div className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61C20.3292 4.09903 19.7228 3.69364 19.0554 3.41869C18.388 3.14373 17.673 3.00407 16.95 3.008C15.62 3.008 14.34 3.548 13.4 4.488L12 5.898L10.59 4.488C9.64721 3.54505 8.36344 3.00217 7.03 3.00217C5.69656 3.00217 4.41279 3.54505 3.47 4.488C2.51 5.448 2 6.728 2 8.058C2 9.388 2.51 10.668 3.47 11.628L4.88 13.038L12 20.168L19.12 13.048L20.53 11.638C21.0123 11.157 21.4028 10.594 21.682 9.978C21.9612 9.36201 22.1241 8.70388 22.162 8.033C22.1998 7.36212 22.112 6.69259 21.9031 6.05389C21.6942 5.41519 21.3678 4.8178 20.94 4.288" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="nav-label">Saved</span>
          </Link>

          <Link
            to="/my-tickets"
            className={`nav-item ${isActive('/my-tickets') || isActive('/ticket/') ? 'active' : ''}`}
            onClick={handleNavClick}
            aria-label="View My Tickets"
          >
            <div className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="nav-label">Tickets</span>
          </Link>
          
          <button
            onClick={(e) => {
              handleNavClick(e)
              navigate('/scanner')
            }}
            className={`nav-item ${isActive('/scanner') ? 'active' : ''}`}
            aria-label="Open Check-in Scanner"
            type="button"
          >
            <div className="nav-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="nav-label">Scan</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default Header
