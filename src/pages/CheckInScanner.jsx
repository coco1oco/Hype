import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTicketById, checkInTicket } from '../services/ticketService'
import { useButtonAnimation } from '../hooks/useButtonAnimation'
import { useToast } from '../components/ToastProvider'
import { FaCamera, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa'
import './CheckInScanner.css'

function CheckInScanner() {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [cameraError, setCameraError] = useState(null)
  const [cameraStream, setCameraStream] = useState(null)
  const [checkedInTickets, setCheckedInTickets] = useState([])
  const { addToast } = useToast()
  const videoRef = useRef(null)
  const handleButtonClick = useButtonAnimation()

  useEffect(() => {
    // Load previously checked in tickets
    const tickets = JSON.parse(localStorage.getItem('event_catalogue_tickets') || '[]')
    const checkedIn = tickets.filter(t => t.checkedIn)
    setCheckedInTickets(checkedIn)
  }, [])

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream
    }
  }, [cameraStream])

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
    setScanning(false)
  }

  const handleScan = async () => {
    if (cameraStream) {
      stopCamera()
      return
    }

    setScanning(true)
    setError(null)
    setResult(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access is not supported in this browser. Please use manual entry.')
      addToast({ type: 'error', message: 'Camera not supported in this browser.' })
      setScanning(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      })
      setCameraStream(stream)
      setCameraError(null)
    } catch (err) {
      console.error(err)
      setCameraError('Unable to access camera. Please allow permissions or use manual entry.')
      addToast({ type: 'error', message: 'Camera permission denied.' })
      setScanning(false)
    }
  }

  const simulateScan = () => {
    const ticketId = prompt('Enter Ticket ID (for prototype demo):')
    if (ticketId) {
      processTicket(ticketId)
    }
  }

  const handleManualEntry = () => {
    const ticketId = prompt('Enter Ticket ID:')
    if (ticketId) {
      processTicket(ticketId)
    }
  }

  const processTicket = (ticketId) => {
    try {
      const ticket = getTicketById(ticketId)
      
      if (!ticket) {
        setError('Ticket not found')
        stopCamera()
        addToast({ type: 'error', message: 'Ticket not found.' })
        return
      }

      if (ticket.checkedIn) {
        setError('Ticket already checked in')
        setResult({
          ticket,
          alreadyCheckedIn: true
        })
        stopCamera()
        addToast({ type: 'info', message: 'Ticket already checked in.' })
        return
      }

      const checkedInTicket = checkInTicket(ticketId)
      setResult({
        ticket: checkedInTicket,
        success: true
      })
      addToast({ type: 'success', message: 'Ticket checked in.' })
      
      // Update checked in list
      const tickets = JSON.parse(localStorage.getItem('event_catalogue_tickets') || '[]')
      const checkedIn = tickets.filter(t => t.checkedIn)
      setCheckedInTickets(checkedIn)
      
      stopCamera()
    } catch (err) {
      setError(err.message)
      addToast({ type: 'error', message: 'Unable to check in ticket.' })
      stopCamera()
    }
  }

  useEffect(() => {
    if (result?.success && result.ticket) {
      const timer = setTimeout(() => {
        navigate(`/ticket/${result.ticket.id}`)
      }, 1400)
      return () => clearTimeout(timer)
    }
  }, [result, navigate])

  const handleReset = () => {
    setResult(null)
    setError(null)
    setCameraError(null)
    stopCamera()
  }

  return (
    <div className="checkin-scanner">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="scanner-content">
          <div className="scanner-main">
            <h1>Check-In Scanner</h1>
            <p className="scanner-subtitle">Scan QR codes to check in attendees</p>

            <div className="scanner-interface">
              {!result && !error && (
                <div className="scanner-box">
                  {cameraStream ? (
                    <div className="camera-preview">
                      <video ref={videoRef} autoPlay playsInline muted />
                      <div className="camera-status">Camera active — point at QR code</div>
                    </div>
                  ) : (
                    <div className="scanner-placeholder">
                      <div className="scanner-icon">
                        <FaCamera />
                      </div>
                      <p>QR Code Scanner</p>
                      <p className="scanner-note">Tap "Start Camera" to scan or use manual entry.</p>
                    </div>
                  )}
                </div>
              )}

              {cameraError && (
                <div className="camera-error">
                  {cameraError}
                </div>
              )}

              {result && (
                <div className={`scan-result ${result.success ? 'success' : 'warning'}`}>
                  {result.success ? (
                    <>
                      <div className="result-icon">
                        <FaCheckCircle />
                      </div>
                      <h2>Check-In Successful!</h2>
                      <div className="result-details">
                        <p><strong>Event:</strong> {result.ticket.eventTitle}</p>
                        <p><strong>Ticket ID:</strong> {result.ticket.id}</p>
                        <p><strong>Ticket Type:</strong> {result.ticket.tierName}</p>
                        <p><strong>Checked In:</strong> {new Date(result.ticket.checkInTime).toLocaleString()}</p>
                      </div>
                      <p className="scanner-note opening-note">Opening digital pass…</p>
                    </>
                  ) : (
                    <>
                      <div className="result-icon">
                        <FaExclamationTriangle />
                      </div>
                      <h2>Already Checked In</h2>
                      <div className="result-details">
                        <p><strong>Event:</strong> {result.ticket.eventTitle}</p>
                        <p><strong>Ticket ID:</strong> {result.ticket.id}</p>
                        <p><strong>Previously checked in:</strong> {new Date(result.ticket.checkInTime).toLocaleString()}</p>
                      </div>
                    </>
                  )}
                  <button className="btn btn-primary" onClick={(e) => {
                    handleButtonClick(e, handleReset)
                  }}>
                    Scan Another
                  </button>
                </div>
              )}

              {error && (
                <div className="scan-error">
                  <div className="error-icon">
                    <FaTimesCircle />
                  </div>
                  <h2>Error</h2>
                  <p>{error}</p>
                  <button className="btn btn-secondary" onClick={(e) => {
                    handleButtonClick(e, handleReset)
                  }}>
                    Try Again
                  </button>
                </div>
              )}

              {!result && !error && (
                <div className="scanner-controls">
                  <button
                    className="btn btn-primary scan-button"
                    onClick={(e) => {
                      handleButtonClick(e, handleScan)
                    }}
                    disabled={scanning && !cameraStream}
                  >
                    {cameraStream ? (
                      <>Stop Camera</>
                    ) : (
                      <>
                        <FaCamera /> Start Camera
                      </>
                    )}
                  </button>
                  {cameraStream && (
                    <button
                      className="btn btn-secondary"
                      onClick={(e) => {
                        handleButtonClick(e, simulateScan)
                      }}
                    >
                      Simulate Scan
                    </button>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={(e) => {
                      handleButtonClick(e, handleManualEntry)
                    }}
                  >
                    Manual Entry
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="scanner-sidebar">
            <div className="stats-card">
              <h3>Today's Check-Ins</h3>
              <div className="stat-value">{checkedInTickets.length}</div>
              <p className="stat-label">Total checked in</p>
            </div>

            {checkedInTickets.length > 0 && (
              <div className="recent-checkins">
                <h3>Recent Check-Ins</h3>
                <div className="checkin-list">
                  {checkedInTickets.slice(-5).reverse().map(ticket => (
                    <div key={ticket.id} className="checkin-item">
                      <div className="checkin-info">
                        <strong>{ticket.eventTitle}</strong>
                        <span className="checkin-id">{ticket.id}</span>
                      </div>
                      <span className="checkin-time">
                        {new Date(ticket.checkInTime).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckInScanner

