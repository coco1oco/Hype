import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEventById } from '../data/events'
import { purchaseTickets } from '../services/ticketService'
import { formatDate, formatTime } from '../utils'
import { useButtonAnimation } from '../hooks/useButtonAnimation'
import { FaCheckCircle, FaCreditCard, FaLock, FaSpinner } from 'react-icons/fa'
import './TicketPurchase.css'

function SellerCheckout() {
  const { eventId, sellerId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [listing, setListing] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [purchaseComplete, setPurchaseComplete] = useState(false)
  const [purchasedTickets, setPurchasedTickets] = useState(null)

  // Auction state (for auction-style listings)
  const [auctionEndsAt, setAuctionEndsAt] = useState(null)
  const [auctionTimeLeft, setAuctionTimeLeft] = useState(null)
  const [bids, setBids] = useState([])
  const [bidAmount, setBidAmount] = useState('')
  const [bidError, setBidError] = useState(null)
  const [currentWinner, setCurrentWinner] = useState(null)
  const [backupWinner, setBackupWinner] = useState(null)
  const [paymentEndsAt, setPaymentEndsAt] = useState(null)
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(null)
  const handleButtonClick = useButtonAnimation()

  useEffect(() => {
    const eventData = getEventById(eventId)
    if (!eventData) {
      navigate('/')
      return
    }
    setEvent(eventData)

    // Rebuild the same mock seller listings used on the main purchase page
    const mockSellerNames = [
      'Howard Azarcon',
      'Godwin Lliabres',
      'Lourielene Baldomero',
      'Julie Lontoc',
      'Charls Sotto',
      'Vic Sotto',
      'Jann Dale Andes',
      'Krystine Kaye Nequiota',
      'Louise Ann Nagal'
    ]
    const sellerMocks = []
    ;(eventData.tiers || []).forEach((tier) => {
      for (let i = 0; i < 20; i++) {
        const basePrice = tier.price
        const delta = (i % 5 - 2) * 100
        const price = Math.max(500, basePrice + delta)
        const sellerName = mockSellerNames[i % mockSellerNames.length]
        const rating = 4 + ((i * 7) % 10) / 10
        const sales = 20 + (i * 13) % 80
        const quantityMock = 1 + (i % 4)

        // Turn some listings into auction-style (every 4th listing)
        const isAuction = i % 4 === 0
        const now = Date.now()
        const endOffsetMinutes = 2 + (i % 4) // 2–5 minutes from now
        const auctionEndTime = new Date(now + endOffsetMinutes * 60 * 1000).toISOString()
        const startingBid = Math.max(300, Math.round(price * 0.9))
        const currentBid = Math.max(startingBid, Math.round(price * 0.95))

        sellerMocks.push({
          id: `MOCK-${tier.id}-${i}`,
          baseTierId: tier.id,
          name: tier.name,
          description: tier.perks?.[0] || `${tier.name} seats`,
          currency: tier.currency,
          price,
          sellerName,
          sellerRating: rating,
          sellerSales: sales,
          quantity: quantityMock,
          listingType: isAuction ? 'auction' : 'fixed',
          startingBid: isAuction ? startingBid : undefined,
          currentBid: isAuction ? currentBid : undefined,
          auctionEndTime: isAuction ? auctionEndTime : undefined,
        })
      }
    })

    const selected = sellerMocks.find(l => l.id === sellerId)
    if (!selected) {
      navigate(`/purchase/${eventId}`)
      return
    }
    setListing(selected)

    if (selected.listingType === 'auction' && selected.auctionEndTime) {
      const end = new Date(selected.auctionEndTime)
      setAuctionEndsAt(end)
      setAuctionTimeLeft('') // will be populated by effect
      // Seed with a couple of mock competitor bids
      const seedBids = [
        { id: 'seed-1', bidderName: 'Bidder A', amount: selected.startingBid, timestamp: new Date().toISOString() },
        { id: 'seed-2', bidderName: 'Bidder B', amount: selected.currentBid, timestamp: new Date().toISOString() },
      ]
      setBids(seedBids)
    }
  }, [eventId, sellerId, navigate])

  // Auction countdown
  useEffect(() => {
    if (!auctionEndsAt) return
    const interval = setInterval(() => {
      const diff = auctionEndsAt.getTime() - Date.now()
      if (diff <= 0) {
        setAuctionTimeLeft('Ended')
        clearInterval(interval)

        // Determine highest and second-highest bidders when auction ends
        if (bids.length > 0) {
          const sorted = [...bids].sort((a, b) => b.amount - a.amount)
          setCurrentWinner(sorted[0])
          setBackupWinner(sorted[1] || null)
          const end = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes to confirm
          setPaymentEndsAt(end)
        }
      } else {
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setAuctionTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [auctionEndsAt, bids])

  // Payment confirmation countdown for winner
  useEffect(() => {
    if (!paymentEndsAt) return
    const interval = setInterval(() => {
      const diff = paymentEndsAt.getTime() - Date.now()
      if (diff <= 0) {
        setPaymentTimeLeft('Expired')
        clearInterval(interval)
        if (backupWinner) {
          setCurrentWinner(backupWinner)
          setBackupWinner(null)
          const end = new Date(Date.now() + 30 * 60 * 1000)
          setPaymentEndsAt(end)
        }
      } else {
        const minutes = Math.floor(diff / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        setPaymentTimeLeft(`${minutes}m ${seconds.toString().padStart(2, '0')}s`)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [paymentEndsAt, backupWinner])

  if (!event || !listing) {
    if (!event) {
      return <div className="loading">Loading...</div>
    }
  }

  const isAuction = listing.listingType === 'auction'
  const unitPrice = isAuction
    ? (listing.currentBid || listing.startingBid || listing.price)
    : listing.price
  const totalPrice = unitPrice * quantity

  const handlePlaceBid = () => {
    if (!isAuction) return
    const minBidBase = listing.currentBid || listing.startingBid || listing.price
    const minBid = minBidBase + 100
    const amount = Number(bidAmount || '0')
    if (!amount || amount < minBid) {
      setBidError(`Bid must be at least ₱${minBid.toLocaleString()}`)
      return
    }
    setBidError(null)
    const newBid = {
      id: `local-${Date.now()}`,
      bidderName: 'You',
      amount,
      timestamp: new Date().toISOString(),
    }
    setBids(prev => [...prev, newBid])
    listing.currentBid = amount
    setBidAmount('')
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
  }

  const handleConfirmPurchase = async () => {
    try {
      setShowConfirmation(false)
      setProcessing(true)
      setProcessingStep(1)
      setError(null)

      // Simulate payment processing with steps
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessingStep(2)
      await new Promise(resolve => setTimeout(resolve, 800))
      setProcessingStep(3)
      await new Promise(resolve => setTimeout(resolve, 600))

      const tickets = await purchaseTickets(eventId, listing.baseTierId, quantity)
      setPurchasedTickets(tickets)
      setProcessing(false)
      setProcessingStep(0)
      setPurchaseComplete(true)

      setTimeout(() => {
        if (tickets.length > 0) {
          navigate(`/ticket/${tickets[0].id}`)
        }
      }, 3500)
    } catch (err) {
      setError(err.message || 'Failed to purchase tickets')
      setProcessing(false)
      setProcessingStep(0)
      setShowConfirmation(false)
    }
  }

  if (processing) {
    return (
      <div className="ticket-purchase">
        <div className="processing-overlay">
          <div className="processing-content">
            <div className="processing-icon">
              <FaSpinner className="spinning" />
            </div>
            <h2>Processing Your Order</h2>
            <p>Please wait while we secure your tickets...</p>
            <div className="processing-steps">
              <div className={`processing-step ${processingStep >= 1 ? 'active' : ''}`}>
                <span className="step-icon">1</span>
                <span>Validating payment</span>
              </div>
              <div className={`processing-step ${processingStep >= 2 ? 'active' : ''}`}>
                <span className="step-icon">2</span>
                <span>Generating tickets</span>
              </div>
              <div className={`processing-step ${processingStep >= 3 ? 'active' : ''}`}>
                <span className="step-icon">3</span>
                <span>Finalizing order</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (purchaseComplete && purchasedTickets) {
    return (
      <div className="ticket-purchase">
        <div className="purchase-success">
          <div className="success-content">
            <div className="success-icon">
              <FaCheckCircle />
            </div>
            <h1>Purchase Confirmed!</h1>
            <p className="success-subtitle">Your tickets have been secured</p>

            <div className="receipt-card">
              <div className="receipt-header">
                <h3>Order Confirmation</h3>
                <span className="receipt-number">#{purchasedTickets[0].id.slice(-8)}</span>
              </div>

              <div className="receipt-details">
                <div className="receipt-row">
                  <span>Event</span>
                  <span>{event.title}</span>
                </div>
                <div className="receipt-row">
                  <span>Date & Time</span>
                  <span>{formatDate(event.startTime)} at {formatTime(event.startTime)}</span>
                </div>
                <div className="receipt-row">
                  <span>Venue</span>
                  <span>{event.venue}</span>
                </div>
                <div className="receipt-row">
                  <span>Ticket Type</span>
                  <span>{listing.name}</span>
                </div>
                <div className="receipt-row">
                  <span>Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-row receipt-total">
                  <span>Total Paid</span>
                  <span>{listing.currency} {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <p className="receipt-note">
                  <FaLock /> Your tickets are secure and ready to use
                </p>
                <p className="receipt-date">
                  Purchased on {new Date().toLocaleString()}
                </p>
              </div>
            </div>

            <div className="success-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (purchasedTickets.length > 0) {
                    navigate(`/ticket/${purchasedTickets[0].id}`)
                  }
                }}
              >
                View My Tickets
              </button>
              <p className="redirect-note">Redirecting to your tickets...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ticket-purchase">
      <div className="container">
        <div className="purchase-content">
          <div className="purchase-main">
            <div className="purchase-header">
              <button
                onClick={(e) => {
                  handleButtonClick(e, () => navigate(-1))
                }}
                className="back-button"
              >
                ← Back
              </button>
              <h1>{isAuction ? 'Auction Checkout' : 'Checkout'}</h1>
            </div>

            <div className="event-summary">
              <div className="event-summary-header">
                {event.cover && (
                  <div className="event-summary-image-wrap">
                    <img
                      src={event.cover}
                      alt={event.title}
                      className="event-summary-image"
                    />
                  </div>
                )}
                <div className="event-summary-text">
                  <h2>{event.title}</h2>
                  <p>{formatDate(event.startTime)} at {formatTime(event.startTime)}</p>
                  <p>{event.venue}, {event.city}</p>
                </div>
              </div>
            </div>

            <div className="quantity-selection">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button
                  onClick={(e) => {
                    handleButtonClick(e, () => setQuantity(Math.max(1, quantity - 1)))
                  }}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={(e) => {
                    handleButtonClick(e, () => setQuantity(Math.min(listing.quantity, quantity + 1)))
                  }}
                  disabled={quantity >= listing.quantity}
                >
                  +
                </button>
              </div>
            </div>

            {isAuction && (
              <div className="auction-notice">
                {auctionTimeLeft && auctionTimeLeft !== 'Ended' && (
                  <p>
                    Auction ends in <strong>{auctionTimeLeft}</strong>. Place your highest bid below.
                  </p>
                )}
                {auctionTimeLeft === 'Ended' && (
                  <p>
                    Auction finished. {currentWinner ? `Highest bidder: ${currentWinner.bidderName}.` : 'No bids placed.'}
                  </p>
                )}
                {currentWinner && paymentTimeLeft && paymentTimeLeft !== 'Expired' && (
                  <p>
                    Winner must confirm purchase within <strong>{paymentTimeLeft}</strong>.
                  </p>
                )}
                {paymentTimeLeft === 'Expired' && backupWinner && (
                  <p>
                    First winner expired. Offer moved to next highest bidder: <strong>{backupWinner.bidderName}</strong>.
                  </p>
                )}
              </div>
            )}

            {isAuction && (
              <div className="auction-bid-input">
                <label>Your bid (PHP)</label>
                <input
                  type="number"
                  min="0"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  disabled={auctionTimeLeft === 'Ended'}
                />
                {bidError && <div className="error-message">{bidError}</div>}
                <button
                  className="btn btn-primary purchase-button"
                  onClick={(e) => {
                    handleButtonClick(e, handlePlaceBid)
                  }}
                  disabled={auctionTimeLeft === 'Ended'}
                >
                  Place bid
                </button>
              </div>
            )}
          </div>

          <div className="purchase-sidebar">
            <div className="order-summary">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>{listing.name}</span>
                <span>{listing.currency} {unitPrice.toLocaleString()}</span>
              </div>

              <div className="summary-total">
                <span>Total</span>
                <span>{listing.currency} {totalPrice.toLocaleString()}</span>
              </div>
              {error && <div className="error-message">{error}</div>}
              <button
                className="btn btn-primary purchase-button"
                onClick={(e) => {
                  handleButtonClick(e, () => setShowConfirmation(true))
                }}
                disabled={loading || (isAuction && (!currentWinner || currentWinner.bidderName !== 'You' || paymentTimeLeft === 'Expired'))}
              >
                <FaCreditCard /> {isAuction ? 'Confirm Auction Purchase' : 'Complete Purchase'}
              </button>
              <p className="payment-note">
                <FaLock /> Secure checkout • No payment required (prototype)
              </p>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="confirmation-overlay" onClick={handleCancelConfirmation}>
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-header">
              <h2>Confirm Purchase</h2>
              <button className="close-button" onClick={handleCancelConfirmation}>×</button>
            </div>

            <div className="confirmation-content">
              <div className="confirmation-summary">
                <div className="confirmation-event">
                  <h3>{event.title}</h3>
                  <p>{formatDate(event.startTime)} at {formatTime(event.startTime)}</p>
                  <p>{event.venue}, {event.city}</p>
                </div>

                <div className="confirmation-tickets">
                  <div className="confirmation-ticket-item">
                    <div>
                      <strong>{listing.name}</strong>
                      <span className="ticket-quantity">× {quantity}</span>
                    </div>
                    <span className="ticket-price">{listing.currency} {(unitPrice * quantity).toLocaleString()}</span>
                  </div>
                </div>

                <div className="confirmation-total">
                  <span>Total</span>
                  <span>{listing.currency} {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="confirmation-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelConfirmation}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={(e) => {
                    handleButtonClick(e, handleConfirmPurchase)
                  }}
                >
                  <FaLock /> Confirm & Purchase
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerCheckout


