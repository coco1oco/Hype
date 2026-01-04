const STORAGE_KEY = 'hype_resale_listings'

// Basic helper to load/save listings in localStorage (prototype only)
const loadListings = () => {
  if (typeof localStorage === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

const saveListings = (listings) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listings))
}

export const getResaleListingsForEvent = (eventId, baseTiers = []) => {
  const dynamicListings = loadListings().filter(l => l.eventId === eventId)

  // Map base tiers into "fixed-price resale" listings so the whole site is second-hand–only for users
  const baseListings = baseTiers.map((tier) => ({
    ...tier,
    eventId,
    // Mark everything as resale in the UI
    isResale: true,
    sellerName: tier.sellerName || 'Official Resale Pool',
    sellerRating: tier.sellerRating || 4.8,
    listingType: tier.listingType || 'fixed',
    listingId: tier.id,
  }))

  // Dynamic listings created from the seller flow
  const mappedDynamic = dynamicListings.map((listing) => ({
    ...listing,
    listingId: listing.id,
    isResale: true,
  }))

  return [...baseListings, ...mappedDynamic]
}

export const createResaleListing = (listing) => {
  const listings = loadListings()
  const id = `LIST-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const newListing = {
    id,
    createdAt: new Date().toISOString(),
    status: 'active',
    listingType: listing.listingType || 'fixed',
    ...listing,
  }
  const all = [...listings, newListing]
  saveListings(all)
  return newListing
}

export const getSellerListings = (sellerId) => {
  const listings = loadListings()
  // For prototype, we don’t have real auth; optionally filter by sellerId if provided
  if (!sellerId) return listings
  return listings.filter((l) => l.sellerId === sellerId)
}

export const placeBidOnListing = (listingId, amount, bidder = 'You') => {
  const listings = loadListings()
  const idx = listings.findIndex((l) => l.id === listingId)
  if (idx === -1) {
    throw new Error('Listing not found')
  }

  const listing = listings[idx]
  const currentBid = listing.currentBid || listing.startingBid || 0
  const minIncrement = listing.bidIncrement || 100
  if (amount < currentBid + minIncrement) {
    throw new Error(`Bid must be at least ${currentBid + minIncrement}`)
  }

  const bid = {
    id: `BID-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    amount,
    bidder,
    createdAt: new Date().toISOString(),
  }

  const updatedListing = {
    ...listing,
    currentBid: amount,
    bidCount: (listing.bidCount || 0) + 1,
    bids: [...(listing.bids || []), bid],
  }

  listings[idx] = updatedListing
  saveListings(listings)

  return { listing: updatedListing, bid }
}


