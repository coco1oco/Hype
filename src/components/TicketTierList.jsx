import { useButtonAnimation } from '../hooks/useButtonAnimation'
import './TicketTierList.css'

function TicketTierList({ tiers, onPurchase }) {
  const handleButtonClick = useButtonAnimation()
  const formatPriceLabel = (tier) => {
    // Special case: C(old) (St)art 2025 Hackathon tiers are free registration
    if (tier.id && tier.id.startsWith('coldstart-')) {
      return 'Free registration'
    }
    if (tier.listingType === 'auction') {
      const current = tier.currentBid || tier.startingBid || tier.price
      return `Current bid · ${tier.currency} ${current.toLocaleString()}`
    }
    return `${tier.currency} ${tier.price.toLocaleString()}`
  }
  const getAvailabilityColor = (availability) => {
    const colors = {
      'Available': 'var(--success)',
      'Limited': 'var(--warning)',
      'Sold Out': 'var(--danger)'
    }
    return colors[availability] || 'var(--text-light)'
  }

  return (
    <div className="ticket-tier-list">
      {tiers.map(tier => (
        <div key={tier.id} className="ticket-tier">
          <div className="tier-header">
            <div>
              <h3 className="tier-name">{tier.name}</h3>
              {tier.isResale && (
                <span className="tier-chip tier-chip-resale">Resale</span>
              )}
              {tier.listingType === 'auction' && (
                <span className="tier-chip tier-chip-auction">Auction</span>
              )}
              <span 
                className="tier-availability"
                style={{ color: getAvailabilityColor(tier.availability) }}
              >
                {tier.availability}
              </span>
            </div>
            <div className="tier-price">
              <span className="tier-amount">{formatPriceLabel(tier)}</span>
            </div>
          </div>
          
          {tier.perks && tier.perks.length > 0 && (
            <ul className="tier-perks">
              {tier.perks.map((perk, index) => (
                <li key={index}>✓ {perk}</li>
              ))}
            </ul>
          )}
          
          <button
            className="btn btn-primary tier-purchase-btn"
            onClick={(e) => {
              handleButtonClick(e, () => onPurchase(tier.listingId || tier.id))
            }}
            disabled={tier.availability === 'Sold Out'}
          >
            {tier.availability === 'Sold Out'
              ? 'Sold Out'
              : (tier.id && tier.id.startsWith('coldstart-'))
                ? 'Register'
                : tier.listingType === 'auction'
                  ? 'View auction'
                  : 'Select tickets'}
          </button>
        </div>
      ))}
    </div>
  )
}

export default TicketTierList

