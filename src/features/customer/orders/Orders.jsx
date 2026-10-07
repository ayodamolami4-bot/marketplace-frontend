import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import { apiRequest } from "../../../services/api";
import "./orders.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function friendlyStatus(status = "") {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Orders() {
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);

  const userRoles = (user?.roles || []).map((role) =>
    String(role).trim().toLowerCase()
  );
  const isVendor = userRoles.includes("vendor");
  const isAdmin = userRoles.includes("admin");

  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        setLoading(true);

        const queryOrderId = searchParams.get("orderId");
        const response = await apiRequest("/orders");
        if (!active) return;
        const validOrders = response?.data || [];

        setOrders(validOrders);
        setSelectedOrderId(
          queryOrderId &&
            validOrders.some((order) => order.id === queryOrderId)
            ? queryOrderId
            : validOrders[0]?.id || ""
        );
        setError("");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || "Could not load your orders.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOrders();

    return () => {
      active = false;
    };
  }, [searchParams]);

  const selectedOrder = useMemo(
    () =>
      orders.find((order) => order.id === selectedOrderId) || orders[0],
    [orders, selectedOrderId]
  );

  const orderTotal = useMemo(() => {
    if (!selectedOrder) return 0;

    return selectedOrder.subOrders?.reduce(
      (sum, subOrder) =>
        sum +
        subOrder.items.reduce(
          (itemSum, item) => itemSum + item.subtotal,
          0
        ),
      0
    );
  }, [selectedOrder]);

  if (loading) {
    return <div className="orders-state">Loading your account...</div>;
  }

  return (
    <div className="account-page">
      <aside className="account-sidebar">
        <div className="account-profile">
          <div className="account-avatar">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <strong>{user?.name || "Customer"}</strong>
            <small>{user?.email || ""}</small>
          </div>
        </div>

        <nav className="account-nav">
          <Link to="/orders" className="active">My Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/reviews">Reviews</Link>
          {!isVendor && !isAdmin && (
            <Link to="/sell">Become a Seller</Link>
          )}
          {isVendor && <Link to="/vendor">Seller Center</Link>}
          <Link to="/cart">Cart</Link>
          <Link to="/products">Continue Shopping</Link>
        </nav>
      </aside>

      <main className="account-main">
        <div className="account-heading">
          <div>
            <p className="eyebrow">MY ACCOUNT</p>
            <h1>Orders</h1>
            <p>Track purchases and review your order details.</p>
          </div>

          <Link to="/products" className="secondary-button">
            Shop More
          </Link>
        </div>

        {error && <div className="form-error">{error}</div>}

        {!orders.length && !error ? (
          <div className="account-empty">
            <div className="account-empty-icon">Orders</div>
            <h2>No orders yet</h2>
            <p>Your completed checkout orders will appear here.</p>
            <Link to="/products" className="primary-button">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-account-layout">
            <section className="orders-list-panel">
              <div className="orders-list-title">
                <strong>Order History</strong>
                <span>
                  {orders.length} order{orders.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="orders-list">
                {orders.map((order) => {
                  const total = order.subOrders?.reduce(
                    (sum, subOrder) =>
                      sum +
                      subOrder.items.reduce(
                        (itemSum, item) => itemSum + item.subtotal,
                        0
                      ),
                    0
                  );

                  return (
                    <button
                      type="button"
                      key={order.id}
                      className={
                        selectedOrder?.id === order.id
                          ? "order-list-card active"
                          : "order-list-card"
                      }
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <div>
                        <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
                        <small>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </small>
                      </div>

                      <div className="order-list-right">
                        <span
                          className={`status-pill status-${order.status}`}
                        >
                          {friendlyStatus(order.status)}
                        </span>
                        <strong>{money(total)}</strong>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedOrder && (
              <section className="order-detail-panel">
                <div className="order-detail-head">
                  <div>
                    <small>ORDER</small>
                    <h2>
                      #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </h2>
                    <p>
                      Placed{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="order-detail-actions">
                    <Link
                      to={`/tracking?orderId=${selectedOrder.id}`}
                      className="secondary-button"
                    >
                      Track Order
                    </Link>

                    <span
                      className={`status-pill status-${selectedOrder.status}`}
                    >
                      {friendlyStatus(selectedOrder.status)}
                    </span>
                  </div>
                </div>

                <div className="tracking-strip">
                  {["confirmed", "processing", "shipped", "delivered"].map(
                    (step, index) => {
                      const statusOrder = [
                        "confirmed",
                        "processing",
                        "shipped",
                        "delivered",
                      ];

                      const currentIndex = statusOrder.indexOf(
                        selectedOrder.status
                      );

                      const complete =
                        currentIndex >= index ||
                        selectedOrder.status === "delivered";

                      return (
                        <div
                          key={step}
                          className={
                            complete
                              ? "tracking-step complete"
                              : "tracking-step"
                          }
                        >
                          <span>{complete ? "✓" : index + 1}</span>
                          <small>{friendlyStatus(step)}</small>
                        </div>
                      );
                    }
                  )}
                </div>

                <div className="order-vendor-groups">
                  {selectedOrder.subOrders?.map((subOrder) => (
                    <div
                      className="order-vendor-group"
                      key={`${selectedOrder.id}-${subOrder.vendorId}`}
                    >
                      <div className="vendor-order-head">
                        <div>
                          <small>SELLER</small>
                          <strong>{subOrder.vendorName}</strong>
                        </div>

                        <span
                          className={`status-pill status-${subOrder.status}`}
                        >
                          {friendlyStatus(subOrder.status)}
                        </span>
                      </div>

                      <div className="account-order-items">
                        {subOrder.items.map((item) => (
                          <div
                            className="account-order-item"
                            key={item.productId}
                          >
                            <div className="account-order-thumb">
                              <span>
                                {item.productName.charAt(0)}
                              </span>
                            </div>

                            <div>
                              <Link to={`/products/${item.productId}`}>
                                <strong>{item.productName}</strong>
                              </Link>
                              <small>Qty {item.quantity}</small>
                            </div>

                            <strong>{money(item.subtotal)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-total-row">
                  <span>Order Total</span>
                  <strong>{money(orderTotal)}</strong>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
