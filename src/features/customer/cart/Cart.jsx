import { Link } from "react-router";
import "./cart.css";

function Cart() {
  return (
    <div className="cart-page">

      <div className="cart-header">
        <p>SHOPPING CART</p>
        <h1>Your Cart</h1>
      </div>

      <div className="cart-layout">

        <div className="cart-items">

          <div className="cart-item">

            <div className="cart-image">
              🛍️
            </div>

            <div className="cart-info">
              <p>Electronics</p>

              <h2>Wireless Headphones</h2>

              <span>₦45,000</span>

              <div className="quantity">
                <button>-</button>
                <span>1</span>
                <button>+</button>
              </div>
            </div>

            <button className="remove-button">
              Remove
            </button>

          </div>

        </div>

        <div className="cart-summary">

          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₦45,000</span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span>₦2,000</span>
          </div>

          <div className="summary-line"></div>

          <div className="summary-total">
            <span>Total</span>
            <strong>₦47,000</strong>
          </div>

          <Link
            to="/payment"
            className="checkout-button"
          >
            Continue to Payment
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Cart;    