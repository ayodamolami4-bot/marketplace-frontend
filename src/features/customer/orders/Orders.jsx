import { Link } from "react-router";
import "./orders.css";

function Orders() {
  return (
    <div className="orders-page">

      <div className="orders-header">
        <p>ACCOUNT</p>
        <h1>My Orders</h1>
      </div>

      <div className="order-card">

        <div className="order-top">

          <div>
            <p>ORDER NUMBER</p>
            <h2>#10001</h2>
          </div>

          <span className="order-status">
            Processing
          </span>

        </div>

        <div className="order-product">

          <div className="order-image">
            🛍️
          </div>

          <div>
            <h3>Wireless Headphones</h3>
            <p>Quantity: 1</p>
            <strong>₦45,000</strong>
          </div>

        </div>

        <div className="order-bottom">

          <p>
            Your order is currently being processed.
          </p>

          <Link to="/tracking">
            Track Order →
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Orders;