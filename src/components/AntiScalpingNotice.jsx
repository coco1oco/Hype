import { useState } from "react";
import { FaShieldAlt, FaInfo, FaCheck } from "react-icons/fa";
import "./AntiScalpingNotice.css";

function AntiScalpingNotice({ quantity, maxQuantity = 4 }) {
  const [showDetails, setShowDetails] = useState(false);

  const isNearLimit = quantity >= maxQuantity - 1;
  const limitExceeded = quantity > maxQuantity;

  return (
    <div
      className={`anti-scalping-notice ${
        limitExceeded ? "error" : isNearLimit ? "warning" : "info"
      }`}
    >
      <div className="anti-scalping-header">
        <FaShieldAlt className="anti-scalping-icon" />
        <h3>Anti-Scalping Protection</h3>
      </div>

      <div className="anti-scalping-content">
        <p className="anti-scalping-text">
          {limitExceeded ? (
            <>
              <strong>Purchase limit exceeded.</strong> Maximum {maxQuantity}{" "}
              tickets per transaction.
            </>
          ) : isNearLimit ? (
            <>
              <strong>Approaching purchase limit.</strong> You can buy up to{" "}
              {maxQuantity} tickets per transaction.
            </>
          ) : (
            <>
              <FaCheck className="check-icon" /> Fair ticket pricing enforced.
              Maximum 50% markup on resales.
            </>
          )}
        </p>

        <button
          type="button"
          className="anti-scalping-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          <FaInfo className="toggle-icon" />
          {showDetails ? "Hide" : "Learn more"}
        </button>
      </div>

      {showDetails && (
        <div className="anti-scalping-details">
          <div className="detail-item">
            <h4>Purchase Limits</h4>
            <p>
              Maximum {maxQuantity} tickets per person per transaction to ensure
              fair access for all fans.
            </p>
          </div>

          <div className="detail-item">
            <h4>Resale Restrictions</h4>
            <p>
              Tickets can only be resold after 24 hours of purchase, with a
              maximum 50% price markup allowed.
            </p>
          </div>

          <div className="detail-item">
            <h4>Buyer Verification</h4>
            <p>
              All buyers are verified via email to prevent fraud and maintain
              ticket authenticity.
            </p>
          </div>

          <div className="detail-item">
            <h4>Suspicious Activity Detection</h4>
            <p>
              Our system monitors for scalping patterns like bulk purchases and
              rapid resales.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AntiScalpingNotice;
