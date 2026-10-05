function Notifications() {
  return (
    <div className="products-page">

      <h1>Notifications</h1>

      <div className="product-card">

        <div className="product-content">

          <h3>
            Your order has been shipped.
          </h3>

          <p>
            Order #10001 is on its way.
          </p>

        </div>

      </div>

      <div className="product-card">

        <div className="product-content">

          <h3>
            Payment successful.
          </h3>

          <p>
            Your payment for order #10001
            was successful.
          </p>

        </div>

      </div>

    </div>
  );
}

export default Notifications;