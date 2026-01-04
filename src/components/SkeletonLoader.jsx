import './SkeletonLoader.css'

function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = Array(count).fill(0)

  if (type === 'card') {
    return (
      <>
        {skeletons.map((_, i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-image" />
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title" />
              <div className="skeleton-line skeleton-subtitle" />
              <div className="skeleton-line skeleton-text" />
            </div>
          </div>
        ))}
      </>
    )
  }

  if (type === 'event-card') {
    return (
      <>
        {skeletons.map((_, i) => (
          <div key={i} className="skeleton-event-card">
            <div className="skeleton-event-image" />
            <div className="skeleton-event-details">
              <div className="skeleton-line skeleton-venue" />
              <div className="skeleton-line skeleton-tags" />
              <div className="skeleton-line skeleton-price" />
            </div>
          </div>
        ))}
      </>
    )
  }

  if (type === 'ticket-card') {
    return (
      <>
        {skeletons.map((_, i) => (
          <div key={i} className="skeleton-ticket-card">
            <div className="skeleton-ticket-header">
              <div className="skeleton-line skeleton-ticket-title" />
              <div className="skeleton-line skeleton-ticket-date" />
            </div>
            <div className="skeleton-ticket-body">
              <div className="skeleton-line skeleton-ticket-info" />
              <div className="skeleton-line skeleton-ticket-info" />
            </div>
          </div>
        ))}
      </>
    )
  }

  if (type === 'detail') {
    return (
      <div className="skeleton-detail">
        <div className="skeleton-detail-hero" />
        <div className="skeleton-detail-content">
          <div className="skeleton-line skeleton-detail-title" />
          <div className="skeleton-line skeleton-detail-subtitle" />
          <div className="skeleton-line skeleton-detail-text" />
          <div className="skeleton-line skeleton-detail-text" />
          <div className="skeleton-line skeleton-detail-text-short" />
        </div>
      </div>
    )
  }

  return (
    <div className="skeleton-line" />
  )
}

export default SkeletonLoader

