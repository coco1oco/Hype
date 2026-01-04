import './CountdownTimer.css'

function CountdownTimer({ timeUntil }) {
  if (timeUntil.isPast) {
    return (
      <div className="countdown-timer past">
        <span>Event has started!</span>
      </div>
    )
  }

  return (
    <div className="countdown-timer">
      <div className="countdown-label">Event starts in</div>
      <div className="countdown-grid">
        <div className="countdown-item">
          <span className="countdown-value">{String(timeUntil.days).padStart(2, '0')}</span>
          <span className="countdown-unit">Days</span>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-item">
          <span className="countdown-value">{String(timeUntil.hours).padStart(2, '0')}</span>
          <span className="countdown-unit">Hours</span>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-item">
          <span className="countdown-value">{String(timeUntil.minutes).padStart(2, '0')}</span>
          <span className="countdown-unit">Minutes</span>
        </div>
        <div className="countdown-separator">:</div>
        <div className="countdown-item">
          <span className="countdown-value">{String(timeUntil.seconds).padStart(2, '0')}</span>
          <span className="countdown-unit">Seconds</span>
        </div>
      </div>
    </div>
  )
}

export default CountdownTimer

