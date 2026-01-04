import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getTicketById } from '../services/ticketService'
import { formatDate, formatTime } from '../utils'
import { useButtonAnimation } from '../hooks/useButtonAnimation'
import { FaCalendarAlt, FaDownload } from 'react-icons/fa'
import './DigitalPass.css'

function DigitalPass() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const [ticket, setTicket] = useState(null)
  const handleButtonClick = useButtonAnimation()

  useEffect(() => {
    const ticketData = getTicketById(ticketId)
    if (!ticketData) {
      navigate('/my-tickets')
      return
    }
    setTicket(ticketData)
  }, [ticketId, navigate])

  const handleAddToCalendar = () => {
    if (!ticket) return
    
    const startDate = new Date(ticket.startTime).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endDate = new Date(new Date(ticket.startTime).getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ticket.eventTitle)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(`Event: ${ticket.eventTitle}\nVenue: ${ticket.venue}, ${ticket.city}`)}&location=${encodeURIComponent(ticket.address || ticket.venue)}`
    
    window.open(calendarUrl, '_blank')
  }

  if (!ticket) {
    return <div className="loading">Loading ticket...</div>
  }

  return (
    <div className="digital-pass">
      <div className="container">
        <button onClick={(e) => {
          handleButtonClick(e, () => navigate(-1))
        }} className="back-button">
          ← Back
        </button>

        <div className="pass-container">
          <div className="pass-header">
            <h1>Digital Pass</h1>
            <div className={`pass-status ${ticket.checkedIn ? 'checked-in' : 'active'}`}>
              {ticket.checkedIn ? '✓ Checked In' : 'Active'}
            </div>
          </div>

          <div className="pass-card">
            <div className="pass-qr">
              <img src={ticket.qrCode} alt="QR Code" />
              <p className="ticket-id">Ticket ID: {ticket.id}</p>
            </div>

            <div className="pass-details">
              <h2>{ticket.eventTitle}</h2>
              
              <div className="pass-info">
                <div className="info-row">
                  <span className="info-label">Ticket Type</span>
                  <span className="info-value">{ticket.tierName}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Date & Time</span>
                  <span className="info-value">
                    {formatDate(ticket.startTime)} at {formatTime(ticket.startTime)}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Venue</span>
                  <span className="info-value">{ticket.venue}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pass-actions">
            <button className="btn btn-secondary" onClick={(e) => {
              handleButtonClick(e, handleAddToCalendar)
            }}>
              <FaCalendarAlt /> Add to Calendar
            </button>
            <button 
              className="btn btn-primary"
              onClick={(e) => {
                handleButtonClick(e, () => {
                  const link = document.createElement('a')
                  link.href = ticket.qrCode
                  link.download = `ticket-${ticket.id}.png`
                  link.click()
                })
              }}
            >
              <FaDownload /> Download Pass
            </button>
          </div>

          <div className="pass-instructions">
            <h3>Instructions</h3>
            <ul>
              <li>Present this QR code at the event entrance</li>
              <li>Keep your phone charged and ready</li>
              <li>Arrive at least 30 minutes before the event starts</li>
              <li>This pass is non-transferable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DigitalPass

