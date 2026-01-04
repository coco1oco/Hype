const STORAGE_KEY = 'event_catalogue_saved_venues'

const readSavedVenues = () => {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch (error) {
    console.error('Failed to read saved venues', error)
    return []
  }
}

const writeSavedVenues = (venues) => {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(venues))
  window.dispatchEvent(new Event('saved-venues-updated'))
}

export const getSavedVenues = () => {
  return readSavedVenues()
}

export const isVenueSaved = (eventId) => {
  const venues = readSavedVenues()
  return venues.some((venue) => venue.eventId === eventId)
}

export const saveVenue = ({ eventId, venue, address, city, coordinates }) => {
  if (!eventId) return
  const venues = readSavedVenues()
  if (venues.some((item) => item.eventId === eventId)) return
  const payload = {
    eventId,
    venue,
    address,
    city,
    coordinates,
    savedAt: Date.now(),
  }
  writeSavedVenues([payload, ...venues])
}

export const removeVenue = (eventId) => {
  const venues = readSavedVenues()
  const filtered = venues.filter((venue) => venue.eventId !== eventId)
  writeSavedVenues(filtered)
}

