# Anti-Scalping Prevention System

## Overview

A comprehensive ticket protection system preventing scalping and fraud through multiple enforcement mechanisms.

## Key Features

### 1. **Purchase Limits**

- **Per-transaction cap**: Maximum 4 tickets per purchase
- **Enforced at checkout**: Blocks transactions exceeding limit
- **User notification**: Clear messaging about limits

### 2. **Buyer Verification (KYC-Lite)**

- Email-based identity verification
- Unique verification IDs for tracking
- Purchase history linked to verified email

### 3. **Resale Restrictions**

- **24-hour holdback**: Tickets cannot be resold for 24 hours after purchase
- **Price cap**: Maximum 50% markup on resales
  - Original: $100 → Max resale: $150
  - Prevents extreme price gouging

### 4. **Suspicious Activity Detection**

Automated monitoring for scalping patterns:

- **Bulk purchases**: Flags accounts with 4+ bulk purchases
- **Rapid resales**: Detects purchases within 10 minutes (bot activity)
- **Pattern scoring**: Severity classification (low/medium/high)

### 5. **Visual Protections**

- **AntiScalpingNotice component** displays:
  - Real-time purchase limit indicator
  - Color-coded warnings (info/warning/error)
  - Expandable details about all protections
  - Interactive "Learn more" button

## Implementation Details

### Service: `antiScalpingService.js`

```javascript
- verifyBuyerIdentity(email) → verification data
- checkPurchaseLimit(email, quantity) → allowed/reason
- recordPurchase(email, eventId, tierId, quantity, ticketIds)
- checkResaleEligibility(ticketId) → eligible/hoursRemaining
- validateResalePrice(originalPrice, resalePrice) → valid/maxPrice
- detectScalpingActivity(email) → patterns detected
- createResaleListing(ticketId, resalePrice, originalPrice)
- getAntiScalpingSummary(email) → complete buyer profile
```

### Component: `AntiScalpingNotice.jsx`

```jsx
<AntiScalpingNotice quantity={quantity} maxQuantity={4} />
```

Displays:

- ✅ Compliance status (green/yellow/red)
- 📋 Purchase limit progress
- ℹ️ Expandable information panel
- 🛡️ All anti-scalping protections explained

### Integration Points

1. **TicketPurchase.jsx**

   - Validates purchase limits before checkout
   - Displays AntiScalpingNotice component
   - Records purchases for history

2. **App.jsx** (potential future)
   - Can track purchases across sessions
   - Monitor for bot-like patterns

## Storage

Uses localStorage with 4 dedicated keys:

- `hype_buyer_verification` - Verified buyers & profiles
- `hype_purchase_history` - Purchase records
- `hype_resale_restrictions` - Resale listings & pricing
- Combined data enables pattern detection

## Detection Examples

### ✓ Legitimate: Realistic User

```
Purchase 1: 2 tickets - Day 1 10:00 AM
Purchase 2: 1 ticket  - Day 3 02:00 PM
Status: ✅ Compliant
```

### ✗ Flagged: Potential Scalper

```
Purchase 1: 4 tickets - Today 10:00 AM
Purchase 2: 4 tickets - Today 10:05 AM
Purchase 3: 4 tickets - Today 10:10 AM
Status: ⚠️ High severity suspicious patterns
```

### ✗ Blocked: Price Gouging

```
Original Price: $100
Attempted Resale: $200 (100% markup)
Status: ❌ Exceeds 50% cap - Maximum allowed: $150
```

## User Experience Flow

1. **Browse events** → No restrictions
2. **Select tickets** → See purchase limit (max 4)
3. **Try to buy 5+** →
   - Error: "Purchase limit exceeded. Maximum 4 tickets per transaction."
   - Button disabled
4. **Successful purchase (4 tickets)** →
   - Email verified
   - Purchase recorded with 24-hour holdback
   - Can resale after 24 hours at max 50% markup

## Future Enhancements

- SMS verification for additional security
- Dynamic limits based on event/scarcity
- Secondary market with built-in protection layer
- API integration for fraud detection services
- Machine learning for pattern recognition
