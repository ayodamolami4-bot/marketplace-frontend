import { Link } from "react-router";
import "./delivery.css";

function PickupLocations() {
  return (
    <main className="delivery-page">
      <div className="delivery-heading">
        <div>
          <p className="eyebrow">DELIVERY OPTIONS</p>
          <h1>Pickup</h1>
          <p>
            Pickup can be selected during checkout when it is available for
            your order.
          </p>
        </div>
      </div>

      <section className="pickup-info-card">
        <div>
          <span>1</span>
          <div>
            <h2>Add products to your cart</h2>
            <p>Choose the products you want from marketplace sellers.</p>
          </div>
        </div>

        <div>
          <span>2</span>
          <div>
            <h2>Continue to checkout</h2>
            <p>Select Pickup as your delivery method when available.</p>
          </div>
        </div>

        <div>
          <span>3</span>
          <div>
            <h2>Complete your order</h2>
            <p>
              Your order details will contain the fulfillment information
              provided for that purchase.
            </p>
          </div>
        </div>

        <Link to="/products">Browse Products</Link>
      </section>
    </main>
  );
}

export default PickupLocations;
