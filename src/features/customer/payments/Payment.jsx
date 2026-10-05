import { useState } from "react";
import { useNavigate } from "react-router";
import "./payment.css";

function Payment() {
  const [paymentMethod, setPaymentMethod] = useState("");

  const navigate = useNavigate();

  function handlePayment() {
    if (paymentMethod === "") {
      alert("Please select a payment method");
      return;
    }

    navigate("/orders");
  }

  return (
    <div className="payment-page">

      <div className="payment-container">

        <div className="payment-header">
          <p>CHECKOUT</p>
          <h1>Choose Payment Method</h1>
          <span>
            Select how you would like to pay for your order.
          </span>
        </div>

        <div className="payment-summary">
          <div>
            <p>Order total</p>
            <h2>₦45,000</h2>
          </div>

          <span>1 item</span>
        </div>

        <div className="payment-options">

          <div
            className={
              paymentMethod === "paystack"
                ? "payment-card selected"
                : "payment-card"
            }
            onClick={() => setPaymentMethod("paystack")}
          >
            <div className="payment-icon">
              ₦
            </div>

            <div className="payment-info">
              <h2>Paystack</h2>
              <p>
                Pay securely with your card,
                bank or transfer.
              </p>
            </div>

            <div className="payment-radio">
              {paymentMethod === "paystack" ? "✓" : ""}
            </div>
          </div>

          <div
            className={
              paymentMethod === "delivery"
                ? "payment-card selected"
                : "payment-card"
            }
            onClick={() => setPaymentMethod("delivery")}
          >
            <div className="payment-icon">
              🚚
            </div>

            <div className="payment-info">
              <h2>Pay on Delivery</h2>
              <p>
                Pay when your order arrives.
              </p>
            </div>

            <div className="payment-radio">
              {paymentMethod === "delivery" ? "✓" : ""}
            </div>
          </div>

        </div>

        <button
          className="continue-button"
          onClick={handlePayment}
        >
          Continue
        </button>

        <p className="secure-text">
          🔒 Your payment information is secure
        </p>

      </div>
    </div>
  );
}

export default Payment;