import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { apiRequest } from "../../../services/api";
import "./delivery.css";

function friendlyStatus(status = "") {
  return String(status)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Tracking() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const orderId =
    searchParams.get("orderId") ||
    localStorage.getItem("marketplace_last_order_id") ||
    "";

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiRequest(`/orders/${orderId}`);

        if (!active) return;

        setOrder(response);
        setError("");
      } catch (requestError) {
        if (!active) return;

        setError(requestError.message || "Could not load order tracking.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrder();

    return () => {
      active = false;
    };
  }, [orderId]);

  const progressIndex = useMemo(() => {
    const status = String(order?.status || "").toLowerCase();

    const steps = ["confirmed", "processing", "shipped", "delivered"];

    if (status === "pending_payment") return -1;

    return steps.indexOf(status);
  }, [order]);

  if (loading) {
    return <div className="delivery-state">Loading tracking...</div>;
  }

  if (!orderId) {
    return (
      <main className="delivery-page">
        <div className="delivery-empty">
          <h1>No order selected</h1>
          <p>
            Open an order from your account to view its fulfillment status.
          </p>
          <Link to="/orders">View My Orders</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="delivery-page">
      <div className="delivery-heading">
        <div>
          <p className="eyebrow">ORDER TRACKING</p>
          <h1>Track Your Order</h1>
          <p>
            Follow the latest status for order{" "}
            <strong>#{orderId.slice(0, 8).toUpperCase()}</strong>.
          </p>
        </div>

        <Link to={`/orders?orderId=${orderId}`}>Order Details</Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      {order && (
        <>
          <section className="delivery-progress-card">
            <div className="delivery-progress-head">
              <span>Current status</span>
              <strong>{friendlyStatus(order.status)}</strong>
            </div>

            <div className="delivery-progress">
              {["confirmed", "processing", "shipped", "delivered"].map(
                (step, index) => {
                  const complete =
                    progressIndex >= index ||
                    String(order.status).toLowerCase() === "delivered";

                  return (
                    <div
                      key={step}
                      className={
                        complete
                          ? "delivery-progress-step complete"
                          : "delivery-progress-step"
                      }
                    >
                      <span>{complete ? "✓" : index + 1}</span>
                      <strong>{friendlyStatus(step)}</strong>
                    </div>
                  );
                }
              )}
            </div>
          </section>

          <section className="delivery-seller-list">
            {order.subOrders?.map((subOrder) => (
              <article
                className="delivery-seller-card"
                key={subOrder.vendorId}
              >
                <div className="delivery-seller-head">
                  <div>
                    <small>SELLER</small>
                    <h2>{subOrder.vendorName}</h2>
                  </div>

                  <span>{friendlyStatus(subOrder.status)}</span>
                </div>

                <p className="delivery-tracking-note">
                  {subOrder.trackingNote ||
                    "No additional tracking note has been posted yet."}
                </p>

                <div className="delivery-item-list">
                  {subOrder.items?.map((item) => (
                    <div key={item.productId}>
                      <span>
                        <strong>{item.productName}</strong>
                        <small>Quantity {item.quantity}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default Tracking;
