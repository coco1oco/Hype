import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getEventById } from "../data/events";
import { purchaseTickets } from "../services/ticketService";
import { getResaleListingsForEvent } from "../services/marketplaceService";
import {
  verifyBuyerIdentity,
  checkPurchaseLimit,
  recordPurchase,
} from "../services/antiScalpingService";
import AntiScalpingNotice from "../components/AntiScalpingNotice";
import { formatDate, formatTime } from "../utils";
import { useButtonAnimation } from "../hooks/useButtonAnimation";
import { animateButtonPop } from "../utils/animations";
import { FaCheckCircle, FaCreditCard, FaLock, FaSpinner } from "react-icons/fa";
import "./TicketPurchase.css";

function TicketPurchase() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [resaleListings, setResaleListings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [buyerEmail, setBuyerEmail] = useState("");
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState(null);
  const [highestBid, setHighestBid] = useState(null);
  const [userBid, setUserBid] = useState("");
  const [bidError, setBidError] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [auctionEndsAt, setAuctionEndsAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [sellerListingsData, setSellerListingsData] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [sellerPage, setSellerPage] = useState(1);
  const handleButtonClick = useButtonAnimation();

  useEffect(() => {
    const eventData = getEventById(eventId);
    if (!eventData) {
      navigate("/");
      return;
    }
    setEvent(eventData);

    const tierId = searchParams.get("tier");
    const listings = getResaleListingsForEvent(
      eventData.id,
      eventData.tiers || []
    );
    setResaleListings(listings);

    // Build mock seller listings per tier (frontend-only)
    const mockSellerNames = [
      "Howard Azarcon",
      "Godwin Lliabres",
      "Lourielene Baldomero",
      "Julie Lontoc",
      "Charls Sotto",
      "Vic Sotto",
      "Jann Dale Andes",
      "Krystine Kaye Nequiota",
      "Louise Ann Nagal",
    ];
    const sellerMocks = [];
    (eventData.tiers || []).forEach((tier) => {
      for (let i = 0; i < 20; i++) {
        const basePrice = tier.price;
        const delta = ((i % 5) - 2) * 100;
        const price = Math.max(500, basePrice + delta);
        const sellerName = mockSellerNames[i % mockSellerNames.length];
        const rating = 4 + ((i * 7) % 10) / 10; // 4.0–4.9
        const sales = 20 + ((i * 13) % 80);
        const quantityMock = 1 + (i % 4);

        // Match SellerCheckout: every 4th listing is an auction
        const isAuction = i % 4 === 0;
        const now = Date.now();
        const endOffsetMinutes = 2 + (i % 4); // 2–5 minutes from now
        const auctionEndTime = new Date(
          now + endOffsetMinutes * 60 * 1000
        ).toISOString();
        const startingBid = Math.max(300, Math.round(price * 0.9));
        const currentBid = Math.max(startingBid, Math.round(price * 0.95));

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
          listingType: isAuction ? "auction" : "fixed",
          startingBid: isAuction ? startingBid : undefined,
          currentBid: isAuction ? currentBid : undefined,
          auctionEndTime: isAuction ? auctionEndTime : undefined,
        });
      }
    });
    setSellerListingsData(sellerMocks);

    if (tierId) {
      const tier = (eventData.tiers || []).find((t) => t.id === tierId);
      if (tier) {
        setSelectedTier(tier);
      }
    } else if (eventData.tiers && eventData.tiers.length > 0) {
      setSelectedTier(eventData.tiers[0]);
    }
  }, [eventId, searchParams, navigate]);

  useEffect(() => {
    if (!auctionEndsAt) return;
    const interval = setInterval(() => {
      const diff = auctionEndsAt.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Ended");
        clearInterval(interval);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, "0")}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [auctionEndsAt]);

  const handlePurchaseClick = () => {
    if (!selectedTier) {
      setError("Please select a ticket tier");
      return;
    }

    if (selectedTier.availability === "Sold Out") {
      setError("This ticket tier is sold out");
      return;
    }

    // Anti-scalping check: verify purchase limit
    const limitCheck = checkPurchaseLimit(
      buyerEmail || "guest@example.com",
      quantity
    );
    if (!limitCheck.allowed) {
      setError(limitCheck.reason);
      return;
    }

    setError(null);
    setShowConfirmation(true);
  };

  const handleConfirmPurchase = async () => {
    try {
      setShowConfirmation(false);
      setProcessing(true);
      setProcessingStep(1);
      setError(null);

      // Simulate payment processing with steps
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStep(2);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStep(3);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const tickets = await purchaseTickets(eventId, selectedTier.id, quantity);
      setPurchasedTickets(tickets);
      setProcessing(false);
      setProcessingStep(0);
      setPurchaseComplete(true);

      // Auto-redirect after showing success
      setTimeout(() => {
        if (tickets.length > 0) {
          navigate(`/ticket/${tickets[0].id}`);
        }
      }, 3500);
    } catch (err) {
      setError(err.message || "Failed to purchase tickets");
      setProcessing(false);
      setProcessingStep(0);
      setShowConfirmation(false);
    }
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  if (!event) {
    return <div className="loading">Loading...</div>;
  }

  const activeListing = selectedSellerId
    ? sellerListingsData.find((l) => l.id === selectedSellerId)
    : null;
  const unitPrice =
    activeListing?.price || (selectedTier ? selectedTier.price : 0);
  const totalPrice = selectedTier ? unitPrice * quantity : 0;
  const isAuction = selectedTier?.listingType === "auction";
  const sellerListings = selectedTier
    ? sellerListingsData.filter((l) => l.baseTierId === selectedTier.id)
    : [];

  const pageSize = 5;
  const totalSellerPages = Math.max(
    1,
    Math.ceil(sellerListings.length / pageSize)
  );
  const currentSellerPage = Math.min(sellerPage, totalSellerPages);
  const pagedSellerListings = sellerListings.slice(
    (currentSellerPage - 1) * pageSize,
    currentSellerPage * pageSize
  );

  const handlePlaceBid = () => {
    if (!selectedTier) return;
    const amount = Number(userBid || "0");
    const current =
      highestBid ||
      selectedTier.currentBid ||
      selectedTier.startingBid ||
      selectedTier.price;
    const minIncrement = selectedTier.bidIncrement || 100;
    const minAllowed = current + minIncrement;
    if (!amount || amount < minAllowed) {
      setBidError(
        `Bid must be at least ${minAllowed.toLocaleString()} ${
          selectedTier.currency
        }`
      );
      return;
    }
    setBidError(null);
    setHighestBid(amount);
    setBidHistory((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        amount,
        bidder: "You",
        createdAt: new Date().toISOString(),
      },
    ]);
    setUserBid("");
  };

  // Processing overlay
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
              <div
                className={`processing-step ${
                  processingStep >= 1 ? "active" : ""
                }`}
              >
                <span className="step-icon">1</span>
                <span>Validating payment</span>
              </div>
              <div
                className={`processing-step ${
                  processingStep >= 2 ? "active" : ""
                }`}
              >
                <span className="step-icon">2</span>
                <span>Generating tickets</span>
              </div>
              <div
                className={`processing-step ${
                  processingStep >= 3 ? "active" : ""
                }`}
              >
                <span className="step-icon">3</span>
                <span>Finalizing order</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
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
                <span className="receipt-number">
                  #{purchasedTickets[0].id.slice(-8)}
                </span>
              </div>

              <div className="receipt-details">
                <div className="receipt-row">
                  <span>Event</span>
                  <span>{event.title}</span>
                </div>
                <div className="receipt-row">
                  <span>Date & Time</span>
                  <span>
                    {formatDate(event.startTime)} at{" "}
                    {formatTime(event.startTime)}
                  </span>
                </div>
                <div className="receipt-row">
                  <span>Venue</span>
                  <span>{event.venue}</span>
                </div>
                <div className="receipt-row">
                  <span>Ticket Type</span>
                  <span>{selectedTier.name}</span>
                </div>
                <div className="receipt-row">
                  <span>Quantity</span>
                  <span>{quantity}</span>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-row receipt-total">
                  <span>Total Paid</span>
                  <span>
                    {selectedTier.currency} {totalPrice.toLocaleString()}
                  </span>
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
                    navigate(`/ticket/${purchasedTickets[0].id}`);
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
    );
  }

  return (
    <div className="ticket-purchase">
      <div className="container">
        <div className="purchase-content">
          <div className="purchase-main">
            <div className="purchase-header">
              <button
                onClick={(e) => {
                  handleButtonClick(e, () => navigate(-1));
                }}
                className="back-button"
              >
                ← Back
              </button>
              <h1>{isAuction ? "Auction Details" : "Purchase Tickets"}</h1>
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
                  <p>
                    {formatDate(event.startTime)} at{" "}
                    {formatTime(event.startTime)}
                  </p>
                  <p>
                    {event.venue}, {event.city}
                  </p>
                </div>
              </div>
            </div>

            {isAuction && selectedTier && (
              <div className="auction-notice">
                <p>
                  You&apos;re viewing a <strong>second-hand auction</strong>.
                  Place a bid now – this is a prototype, no real payment will
                  occur.
                </p>
              </div>
            )}

            {!isAuction &&
              selectedTier &&
              selectedTier.availability !== "Sold Out" && (
                <>
                  {sellerListings.length > 0 && (
                    <section className="seller-listings">
                      <h3>Listings from sellers</h3>
                      <p className="seller-listings-subtitle">
                        Choose a listing below to see pricing from different
                        sellers for this tier.
                      </p>
                      <ul>
                        {pagedSellerListings.map((listing) => {
                          const isActive = selectedSellerId === listing.id;
                          const sellerName =
                            listing.sellerName || "Resale seller";
                          const rating = listing.sellerRating || 4.7;
                          const sales = listing.sellerSales || 32;
                          const quantityValue = listing.quantity || 1;
                          const quantityLabel = `${quantityValue} ticket${
                            quantityValue > 1 ? "s" : ""
                          }`;
                          const unitPrice =
                            listing.price ||
                            listing.currentBid ||
                            listing.startingBid ||
                            0;
                          const displayPrice = unitPrice * quantityValue;

                          return (
                            <li
                              key={listing.id}
                              className={`seller-list-item ${
                                isActive ? "active" : ""
                              }`}
                              onClick={(e) => {
                                animateButtonPop(e.currentTarget);
                                setSelectedSellerId(listing.id);
                                navigate(
                                  `/purchase/${event.id}/seller/${listing.id}`
                                );
                              }}
                            >
                              <div className="seller-list-header">
                                <div>
                                  <span className="seller-list-tier">
                                    {listing.name}
                                  </span>
                                  <span className="seller-list-description">
                                    {listing.description ||
                                      listing.perks?.[0] ||
                                      "Resale seats"}
                                  </span>
                                </div>
                                <div className="seller-list-price">
                                  <span className="seller-list-price-main">
                                    {listing.currency}{" "}
                                    {displayPrice.toLocaleString()}
                                  </span>
                                  <span
                                    className={`seller-type-chip ${
                                      listing.listingType === "auction"
                                        ? "auction"
                                        : "fixed"
                                    }`}
                                  >
                                    {listing.listingType === "auction"
                                      ? "Auction"
                                      : "Fixed price"}
                                  </span>
                                </div>
                              </div>

                              <div className="seller-list-details">
                                <div className="seller-list-column">
                                  <span className="seller-label">Seller</span>
                                  <span className="seller-name-row">
                                    {sellerName}
                                  </span>
                                  <span className="seller-rating-row">
                                    ★ {rating.toFixed(1)} ({sales} sales)
                                  </span>
                                </div>
                                <div className="seller-list-column">
                                  <span className="seller-label">Quantity</span>
                                  <span className="seller-value">
                                    {quantityLabel}
                                  </span>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="seller-pagination">
                        <button
                          type="button"
                          className="seller-page-button"
                          disabled={currentSellerPage === 1}
                          onClick={() =>
                            setSellerPage((p) => Math.max(1, p - 1))
                          }
                        >
                          Prev
                        </button>
                        <span className="seller-page-info">
                          Page {currentSellerPage} of {totalSellerPages}
                        </span>
                        <button
                          type="button"
                          className="seller-page-button"
                          disabled={currentSellerPage === totalSellerPages}
                          onClick={() =>
                            setSellerPage((p) =>
                              Math.min(totalSellerPages, p + 1)
                            )
                          }
                        >
                          Next
                        </button>
                      </div>
                    </section>
                  )}
                </>
              )}
          </div>

          <div className="purchase-sidebar">
            {!isAuction && (
              <div className="tier-selection">
                <h3>Select Ticket Tier</h3>
                {(event.tiers || []).map((tier) => (
                  <div
                    key={tier.id}
                    className={`tier-option ${
                      selectedTier?.id === tier.id ? "selected" : ""
                    } ${tier.availability === "Sold Out" ? "sold-out" : ""}`}
                    onClick={(e) => {
                      if (tier.availability !== "Sold Out") {
                        animateButtonPop(e.currentTarget);
                        setSelectedTier(tier);
                        setSelectedSellerId(null);
                        setSellerPage(1);
                      }
                    }}
                  >
                    <div className="tier-option-header">
                      <div>
                        <h4>{tier.name}</h4>
                        <span
                          className={`availability-badge ${tier.availability
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {tier.availability}
                        </span>
                      </div>
                    </div>
                    {tier.perks && tier.perks.length > 0 && (
                      <ul className="tier-perks">
                        {tier.perks.map((perk, idx) => (
                          <li key={idx}>✓ {perk}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {selectedTier && selectedTier.availability !== "Sold Out" && (
              <AntiScalpingNotice quantity={quantity} maxQuantity={4} />
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div
          className="confirmation-overlay"
          onClick={handleCancelConfirmation}
        >
          <div
            className="confirmation-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirmation-header">
              <h2>Confirm Purchase</h2>
              <button
                className="close-button"
                onClick={handleCancelConfirmation}
              >
                ×
              </button>
            </div>

            <div className="confirmation-content">
              <div className="confirmation-summary">
                <div className="confirmation-event">
                  <h3>{event.title}</h3>
                  <p>
                    {formatDate(event.startTime)} at{" "}
                    {formatTime(event.startTime)}
                  </p>
                  <p>
                    {event.venue}, {event.city}
                  </p>
                </div>

                <div className="confirmation-tickets">
                  <div className="confirmation-ticket-item">
                    <div>
                      <strong>{selectedTier.name}</strong>
                      <span className="ticket-quantity">× {quantity}</span>
                    </div>
                    <span className="ticket-price">
                      {selectedTier.currency}{" "}
                      {(selectedTier.price * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="confirmation-total">
                  <span>Total</span>
                  <span>
                    {selectedTier.currency} {totalPrice.toLocaleString()}
                  </span>
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
                    handleButtonClick(e, handleConfirmPurchase);
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
  );
}

export default TicketPurchase;
