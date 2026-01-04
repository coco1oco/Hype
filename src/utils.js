export function formatEventDate(isoDate) {
  const date = new Date(isoDate)
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function formatDate(isoDate) {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatTime(isoDate) {
  const date = new Date(isoDate)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getTimeUntilEvent(startTime) {
  const now = new Date()
  const event = new Date(startTime)
  const diff = event - now

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, isPast: false }
}

export function calculateHypeScore(metrics) {
  const { views, buyers, recency } = metrics
  return Math.min(100, Math.round(
    (views / 100) * 0.3 +
    (buyers / 10) * 0.5 +
    (recency * 100) * 0.2
  ))
}

