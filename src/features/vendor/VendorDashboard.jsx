import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../../services/api";
import "./vendor.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function VendorDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [report, setReport] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      setLoading(true);

      const results = await Promise.allSettled([
        apiRequest("/vendor/dashboard"),
        apiRequest("/vendor/orders"),
        apiRequest("/vendor/reports"),
        apiRequest("/vendor/inventory"),
      ]);

      if (!active) return;

      const [
        dashboardResult,
        ordersResult,
        reportResult,
        inventoryResult,
      ] = results;

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value);
      }

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value?.data || []);
      }

      if (reportResult.status === "fulfilled") {
        setReport(reportResult.value);
      }

      if (inventoryResult.status === "fulfilled") {
        setInventory(inventoryResult.value?.data || []);
      }

      const failure = results.find(
        (result) => result.status === "rejected"
      );

      setError(
        failure
          ? failure.reason?.message ||
              "Some seller dashboard data could not be loaded."
          : ""
      );

      setLoading(false);
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const maxRevenue = useMemo(() => {
    const points = report?.revenueOverTime || [];
    return Math.max(...points.map((point) => point.revenue), 1);
  }, [report]);

  if (loading) {
    return <div className="vendor-state">Loading seller dashboard...</div>;
  }

  return (
    <div className="vendor-page">
      <div className="vendor-page-heading">
        <div>
          <p className="eyebrow">SELLER CENTER</p>
          <h1>Good day, {dashboard?.businessName || "Seller"}</h1>
          <p>Here is what is happening with your store today.</p>
        </div>

        <Link to="/vendor/products" className="vendor-primary-button">
          + Add Product
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      <section className="vendor-stat-grid">
        <article>
          <small>Today Revenue</small>
          <strong>{money(dashboard?.todayRevenue)}</strong>
          <span>Sales received today</span>
        </article>

        <article>
          <small>Today Orders</small>
          <strong>{dashboard?.todayOrders || 0}</strong>
          <span>Orders requiring attention</span>
        </article>

        <article>
          <small>Products</small>
          <strong>{dashboard?.productCount || 0}</strong>
          <span>Active store inventory</span>
        </article>

        <article>
          <small>Low Stock</small>
          <strong>{dashboard?.lowStockCount || 0}</strong>
          <span>Products to restock</span>
        </article>
      </section>

      <div className="vendor-dashboard-grid">
        <section className="vendor-panel vendor-chart-panel">
          <div className="vendor-panel-heading">
            <div>
              <h2>Revenue Overview</h2>
              <p>Recent store revenue</p>
            </div>
            <Link to="/vendor/finance">View reports</Link>
          </div>

          <div className="simple-bar-chart">
            {(report?.revenueOverTime || []).slice(-10).map((point) => (
              <div className="chart-column" key={point.date}>
                <div className="chart-bar-wrap">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${Math.max(
                        6,
                        (point.revenue / maxRevenue) * 100
                      )}%`,
                    }}
                    title={money(point.revenue)}
                  />
                </div>
                <small>
                  {new Date(point.date).toLocaleDateString("en-NG", {
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              </div>
            ))}

            {!report?.revenueOverTime?.length && (
              <div className="vendor-chart-empty">No revenue data yet</div>
            )}
          </div>
        </section>

        <section className="vendor-panel">
          <div className="vendor-panel-heading">
            <div>
              <h2>Stock Watch</h2>
              <p>Items that need attention</p>
            </div>
            <Link to="/vendor/products">Inventory</Link>
          </div>

          <div className="stock-watch-list">
            {inventory.slice(0, 5).map((item) => (
              <div key={item.id}>
                <span>
                  <strong>{item.name}</strong>
                  <small>{item.status}</small>
                </span>
                <b className={item.stock <= 5 ? "stock-low" : ""}>
                  {item.stock}
                </b>
              </div>
            ))}

            {!inventory.length && (
              <div className="vendor-mini-empty">No products yet.</div>
            )}
          </div>
        </section>
      </div>

      <section className="vendor-panel vendor-recent-orders">
        <div className="vendor-panel-heading">
          <div>
            <h2>Recent Orders</h2>
            <p>Latest orders from your customers</p>
          </div>
          <Link to="/vendor/orders">View all</Link>
        </div>

        <div className="vendor-table-wrap">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((order) => {
                const total = order.items.reduce(
                  (sum, item) => sum + item.subtotal,
                  0
                );

                return (
                  <tr key={order.id}>
                    <td>#{order.orderId.slice(0, 8).toUpperCase()}</td>
                    <td>{order.items.length}</td>
                    <td>{money(total)}</td>
                    <td>
                      <span
                        className={`vendor-status vendor-status-${order.status}`}
                      >
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {!orders.length && (
                <tr>
                  <td colSpan="4" className="vendor-empty-cell">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default VendorDashboard;
