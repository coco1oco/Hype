import QRCode from 'qrcode'
import { getEventById } from '../data/events'

const STORAGE_KEY = 'event_catalogue_tickets'

export const generateTicketId = () => {
  return 'TKT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase()
}

export const purchaseTickets = async (eventId, tierId, quantity = 1) => {
  // In a real app, this would call an API
  // For prototype, we'll generate tickets locally
  
  const event = getEventById(eventId)
  if (!event) throw new Error('Event not found')
  
  const tier = event.tiers.find(t => t.id === tierId)
  if (!tier) throw new Error('Ticket tier not found')
  
  if (tier.availability === 'Sold Out') {
    throw new Error('Tickets are sold out')
  }

  const tickets = []
  
  for (let i = 0; i < quantity; i++) {
    const ticketId = generateTicketId()
    const ticketData = {
      ticketId,
      eventId,
      tierId,
      timestamp: new Date().toISOString()
    }

    try {
      const qrCode = await QRCode.toDataURL(JSON.stringify(ticketData))
      
      const ticket = {
        id: ticketId,
        eventId,
        eventTitle: event.title,
        tierName: tier.name,
        price: tier.price,
        currency: tier.currency,
        startTime: event.startTime,
        venue: event.venue,
        city: event.city,
        address: event.address,
        qrCode,
        qrData: ticketData,
        purchaseDate: new Date().toISOString(),
        checkedIn: false
      }

      tickets.push(ticket)
    } catch (error) {
      throw new Error('Failed to generate QR code')
    }
  }

  // Save to localStorage
  const existingTickets = getTickets()
  const allTickets = [...existingTickets, ...tickets]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allTickets))

  return tickets
}

export const getTickets = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export const getTicketById = (ticketId) => {
  const tickets = getTickets()
  return tickets.find(t => t.id === ticketId)
}

export const checkInTicket = (ticketId) => {
  const tickets = getTickets()
  const ticket = tickets.find(t => t.id === ticketId)
  
  if (!ticket) {
    throw new Error('Ticket not found')
  }
  
  if (ticket.checkedIn) {
    throw new Error('Ticket already checked in')
  }
  
  ticket.checkedIn = true
  ticket.checkInTime = new Date().toISOString()
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets))
  
  return ticket
}

