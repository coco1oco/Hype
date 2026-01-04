import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTickets } from '../services/ticketService'
import { formatDate, formatTime } from '../utils'
import { useButtonAnimation } from '../hooks/useButtonAnimation'
import './MyTickets.css'

function MyTickets() {
  const [tickets, setTickets] = useState([])
  const handleButtonClick = useButtonAnimation()

  useEffect(() => {
    const userTickets = getTickets()
    setTickets(userTickets)
    
    // Update tickets when storage changes
    const handleStorageChange = () => {
      setTickets(getTickets())
    }
    
    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(handleStorageChange, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (tickets.length === 0) {
    return (
      <div className="my-tickets">
        <div className="container">
          <h1>My Tickets</h1>
          <div className="no-tickets">
            <p>You don't have any tickets yet.</p>
            <Link 
              to="/" 
              className="btn btn-primary"
              onClick={(e) => {
                handleButtonClick(e)
              }}
            >
              Browse Events
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-tickets">
      <div className="container">
        <h1>My Tickets</h1>
        <div className="tickets-grid">
          {tickets.map(ticket => (
            <Link key={ticket.id} to={`/ticket/${ticket.id}`} className="ticket-card">
              <div className="ticket-card-header">
                <h3>{ticket.eventTitle}</h3>
                <span className={`ticket-status ${ticket.checkedIn ? 'checked-in' : 'active'}`}>
                  {ticket.checkedIn ? '✓ Checked In' : 'Active'}
                </span>
              </div>
              <div className="ticket-card-body">
                <div className="ticket-info">
                  <div className="info-item">
                    <span className="info-label">Type</span>
                    <span className="info-value">{ticket.tierName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date</span>
                    <span className="info-value">{formatDate(ticket.startTime)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Time</span>
                    <span className="info-value">{formatTime(ticket.startTime)}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Venue</span>
                    <span className="info-value">{ticket.venue}</span>
                  </div>
                </div>
                <div className="ticket-qr-preview">
                  <img src={ticket.qrCode} alt="QR Code" />
                </div>
              </div>
              <div className="ticket-card-footer">
                <span className="ticket-id">ID: {ticket.id}</span>
                <span className="view-pass">View Pass →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default MyTickets

