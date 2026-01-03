/**
 * Anti-Scalping Service
 * Implements mechanisms to prevent ticket scalping and fraud
 */

const BUYER_VERIFICATION_KEY = "hype_buyer_verification";
const PURCHASE_HISTORY_KEY = "hype_purchase_history";
const RESALE_RESTRICTIONS_KEY = "hype_resale_restrictions";
const MAX_TICKETS_PER_PURCHASE = 4;
const MIN_HOURS_BEFORE_RESALE = 24;

/**
 * Verify buyer identity (KYC-lite: email verification)
 */
export const verifyBuyerIdentity = (email) => {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      verified: false,
      reason: "Invalid email format",
    };
  }

  const verifications = getBuyerVerifications();
  const existing = verifications.find((v) => v.email === email);

  if (existing) {
    return {
      verified: true,
      email,
      verifiedAt: existing.verifiedAt,
      verificationId: existing.id,
    };
  }

  // Create new verification record
  const verification = {
    id: `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    verifiedAt: new Date().toISOString(),
    purchaseCount: 0,
    restrictions: [],
  };

  verifications.push(verification);
  localStorage.setItem(BUYER_VERIFICATION_KEY, JSON.stringify(verifications));

  return {
    verified: true,
    email,
    verificationId: verification.id,
    verifiedAt: verification.verifiedAt,
  };
};

/**
 * Get all buyer verifications
 */
export const getBuyerVerifications = () => {
  const stored = localStorage.getItem(BUYER_VERIFICATION_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Check purchase limits for a buyer
 */
export const checkPurchaseLimit = (email, quantity) => {
  const verifications = getBuyerVerifications();
  const buyer = verifications.find((v) => v.email === email);

  if (!buyer) {
    return {
      allowed: true,
      reason: "New buyer",
      maxQuantity: MAX_TICKETS_PER_PURCHASE,
    };
  }

  // Enforce per-purchase limit
  if (quantity > MAX_TICKETS_PER_PURCHASE) {
    return {
      allowed: false,
      reason: `Purchase limit exceeded. Maximum ${MAX_TICKETS_PER_PURCHASE} tickets per transaction.`,
      maxQuantity: MAX_TICKETS_PER_PURCHASE,
      requested: quantity,
    };
  }

  return {
    allowed: true,
    reason: "Purchase limit check passed",
    maxQuantity: MAX_TICKETS_PER_PURCHASE,
  };
};

/**
 * Record a purchase for a buyer
 */
export const recordPurchase = (email, eventId, tierId, quantity, ticketIds) => {
  const verifications = getBuyerVerifications();
  const buyer = verifications.find((v) => v.email === email);

  if (!buyer) {
    return false;
  }

  const purchase = {
    id: `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email,
    eventId,
    tierId,
    quantity,
    ticketIds,
    purchasedAt: new Date().toISOString(),
    resaleEligibleAt: new Date(
      Date.now() + MIN_HOURS_BEFORE_RESALE * 60 * 60 * 1000
    ).toISOString(),
  };

  const history = getPurchaseHistory();
  history.push(purchase);
  localStorage.setItem(PURCHASE_HISTORY_KEY, JSON.stringify(history));

  // Update buyer purchase count
  buyer.purchaseCount = (buyer.purchaseCount || 0) + quantity;
  localStorage.setItem(BUYER_VERIFICATION_KEY, JSON.stringify(verifications));

  return purchase;
};

/**
 * Get purchase history
 */
export const getPurchaseHistory = () => {
  const stored = localStorage.getItem(PURCHASE_HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Check if ticket can be resold and when
 */
export const checkResaleEligibility = (ticketId) => {
  const history = getPurchaseHistory();
  const purchase = history.find((p) => p.ticketIds.includes(ticketId));

  if (!purchase) {
    return {
      eligible: false,
      reason: "Ticket purchase record not found",
    };
  }

  const resaleEligibleAt = new Date(purchase.resaleEligibleAt);
  const now = new Date();

  if (now < resaleEligibleAt) {
    const hoursRemaining = Math.ceil(
      (resaleEligibleAt - now) / (60 * 60 * 1000)
    );
    return {
      eligible: false,
      reason: `Ticket can be resold in ${hoursRemaining} hours`,
      resaleEligibleAt: purchase.resaleEligibleAt,
      hoursRemaining,
    };
  }

  return {
    eligible: true,
    reason: "Ticket is eligible for resale",
    resaleEligibleAt: purchase.resaleEligibleAt,
  };
};

/**
 * Enforce fair price cap (prevent extreme markups)
 */
export const validateResalePrice = (originalPrice, resalePrice) => {
  const maxMarkup = 1.5; // 50% max markup
  const maxResalePrice = originalPrice * maxMarkup;

  if (resalePrice > maxResalePrice) {
    return {
      valid: false,
      reason: `Resale price exceeds maximum markup of 50%`,
      maxPrice: Math.round(maxResalePrice),
      requested: resalePrice,
      originalPrice,
    };
  }

  return {
    valid: true,
    reason: "Resale price is within acceptable range",
    maxPrice: Math.round(maxResalePrice),
    originalPrice,
  };
};

/**
 * Detect suspicious resale patterns (bulk resale, rapid resale)
 */
export const detectScalpingActivity = (email) => {
  const history = getPurchaseHistory();
  const buyerPurchases = history.filter((p) => p.email === email);

  const suspiciousPatterns = [];

  // Pattern 1: Bulk purchases
  const bulkPurchases = buyerPurchases.filter((p) => p.quantity >= 4);
  if (bulkPurchases.length > 2) {
    suspiciousPatterns.push({
      type: "bulk_purchases",
      severity: "medium",
      description: "Multiple bulk purchases detected",
      count: bulkPurchases.length,
    });
  }

  // Pattern 2: Rapid consecutive purchases
  const purchases = buyerPurchases.sort(
    (a, b) => new Date(a.purchasedAt) - new Date(b.purchasedAt)
  );

  for (let i = 1; i < purchases.length; i++) {
    const timeDiff =
      new Date(purchases[i].purchasedAt) -
      new Date(purchases[i - 1].purchasedAt);
    const minutesDiff = timeDiff / (60 * 1000);

    if (minutesDiff < 10) {
      suspiciousPatterns.push({
        type: "rapid_purchases",
        severity: "high",
        description: "Purchases within 10 minutes detected",
        minutesDiff,
      });
    }
  }

  return {
    suspicious: suspiciousPatterns.length > 0,
    patterns: suspiciousPatterns,
    email,
    totalPurchases: buyerPurchases.length,
  };
};

/**
 * Create resale listing with anti-scalping restrictions
 */
export const createResaleListing = (ticketId, resalePrice, originalPrice) => {
  // Check eligibility
  const eligibility = checkResaleEligibility(ticketId);
  if (!eligibility.eligible) {
    return {
      success: false,
      reason: eligibility.reason,
      hoursRemaining: eligibility.hoursRemaining,
    };
  }

  // Check price
  const priceCheck = validateResalePrice(originalPrice, resalePrice);
  if (!priceCheck.valid) {
    return {
      success: false,
      reason: priceCheck.reason,
      maxPrice: priceCheck.maxPrice,
    };
  }

  // Create listing
  const listing = {
    id: `RSL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ticketId,
    originalPrice,
    resalePrice,
    maxMarkup:
      (((resalePrice - originalPrice) / originalPrice) * 100).toFixed(1) + "%",
    listedAt: new Date().toISOString(),
    verified: true,
    antiScalpingCompliant: true,
  };

  // Store restrictions
  const restrictions = getResaleRestrictions();
  restrictions.push(listing);
  localStorage.setItem(RESALE_RESTRICTIONS_KEY, JSON.stringify(restrictions));

  return {
    success: true,
    listing,
    message: "Resale listing created with anti-scalping protections",
  };
};

/**
 * Get resale restrictions/listings
 */
export const getResaleRestrictions = () => {
  const stored = localStorage.getItem(RESALE_RESTRICTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

/**
 * Get anti-scalping summary for buyer
 */
export const getAntiScalpingSummary = (email) => {
  const verifications = getBuyerVerifications();
  const buyer = verifications.find((v) => v.email === email);
  const purchases = getPurchaseHistory().filter((p) => p.email === email);
  const scalpingDetection = detectScalpingActivity(email);

  return {
    buyer: buyer || null,
    totalPurchases: purchases.length,
    totalTickets: purchases.reduce((sum, p) => sum + p.quantity, 0),
    scalpingDetection,
    isCompliant: !scalpingDetection.suspicious,
  };
};

/**
 * Reset anti-scalping data (for testing)
 */
export const resetAntiScalpingData = () => {
  localStorage.removeItem(BUYER_VERIFICATION_KEY);
  localStorage.removeItem(PURCHASE_HISTORY_KEY);
  localStorage.removeItem(RESALE_RESTRICTIONS_KEY);
};
