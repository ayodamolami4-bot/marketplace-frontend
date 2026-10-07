import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./vendor.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      const response = await apiRequest("/vendor/orders");
      setOrders(response?.data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function advanceOrder(order) {
    const nextStatus =
      order.status === "pending_fulfillment"
        ? "processing"
        : order.status === "processing"
          ? "shipped"
          : null;

    if (!nextStatus) return;

    try {
      setUpdatingId(order.id);

      const updated = await apiRequest(
        `/vendor/orders/${order.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      setOrders((current) =>
        current.map((item) => (item.id === order.id ? updated : item))
      );
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not update order.");
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="vendor-page">
      <div className="vendor-page-heading">
        <div>
          <p className="eyebrow">FULFILLMENT</p>
          <h1>Orders</h1>
          <p>Process customer orders and update fulfillment status.</p>
        </div>
      </div>

      {error && <div className="form-error vendor-feedback">{error}</div>}

      <section className="vendor-panel">
        {loading ? (
          <div className="vendor-state">Loading orders...</div>
        ) : (
          <div className="vendor-order-cards">
            {orders.map((order) => {
              const total = order.totalAmount ?? 0;

              const canAdvance =
                order.status === "pending_fulfillment" ||
                order.status === "processing";

              const actionLabel =
                order.status === "pending_fulfillment"
                  ? "Start Processing"
                  : order.status === "processing"
                    ? "Mark Shipped"
                    : "No Action";

              return (
                <article className="vendor-order-card" key={order.id}>
                  <div className="vendor-order-top">
                    <div>
                      <small>ORDER</small>
                      <h3>#{order.orderId.slice(0, 8).toUpperCase()}</h3>
                    </div>

                    <span className={`vendor-status vendor-status-${order.status}`}>
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <div className="vendor-order-items">
                    {order.items.map((item) => (
                      <div key={item.productId}>
                        <span>
                          <strong>{item.productName}</strong>
                          <small>Qty {item.quantity}</small>
                        </span>
                        <strong>{money(item.subtotal)}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="vendor-order-bottom">
                    <span>
                      Discount <strong>{money(order.discountAmount)}</strong> · Total <strong>{money(total)}</strong>
                    </span>

                    <button
                      type="button"
                      disabled={!canAdvance || updatingId === order.id}
                      onClick={() => advanceOrder(order)}
                    >
                      {updatingId === order.id ? "Updating..." : actionLabel}
                    </button>
                  </div>
                </article>
              );
            })}

            {!orders.length && (
              <div className="vendor-mini-empty">No customer orders yet.</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default VendorOrders;
