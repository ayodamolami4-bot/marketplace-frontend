import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../../services/api";
import "./admin.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        const [reportData, usersData, vendorsData, reviewsData, categoriesData] =
          await Promise.all([
            apiRequest("/admin/reports"),
            apiRequest("/admin/users"),
            apiRequest("/admin/vendors/pending"),
            apiRequest("/admin/reviews"),
            apiRequest("/categories"),
          ]);

        if (!active) return;

        setReport(reportData);
        setUsers(usersData?.data || []);
        setVendors(vendorsData || []);
        setReviews(reviewsData?.data || []);
        setCategories(categoriesData?.data || []);
        setError("");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || "Could not load admin dashboard.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const maxCategoryRevenue = useMemo(
    () =>
      Math.max(
        ...(report?.categoryBreakdown || []).map((item) => item.revenue),
        1
      ),
    [report]
  );

  if (loading) {
    return <div className="admin-state">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">ADMIN CONSOLE</p>
          <h1>Marketplace Overview</h1>
          <p>Monitor platform activity, sellers, users and marketplace performance.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <section className="admin-stat-grid">
        <article>
          <small>Total Sales</small>
          <strong>{money(report?.totalSales)}</strong>
          <span>Marketplace revenue volume</span>
        </article>

        <article>
          <small>Total Orders</small>
          <strong>{report?.totalOrders || 0}</strong>
          <span>Orders across all sellers</span>
        </article>

        <article>
          <small>Users</small>
          <strong>{users.length}</strong>
          <span>Registered accounts</span>
        </article>

        <article>
          <small>Pending Vendors</small>
          <strong>{vendors.length}</strong>
          <span>Applications awaiting review</span>
        </article>
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Vendor Performance</h2>
              <p>Top sellers by marketplace revenue</p>
            </div>
            <Link to="/admin/vendors">Manage vendors</Link>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(report?.vendorPerformance || []).slice(0, 7).map((vendor) => (
                  <tr key={vendor.vendorId}>
                    <td><strong>{vendor.vendorName}</strong></td>
                    <td>{vendor.orders}</td>
                    <td>{money(vendor.revenue)}</td>
                  </tr>
                ))}

                {!report?.vendorPerformance?.length && (
                  <tr>
                    <td colSpan="3" className="admin-empty-cell">
                      No vendor sales data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Category Sales</h2>
              <p>Revenue mix by category</p>
            </div>
            <Link to="/admin/categories">Categories</Link>
          </div>

          <div className="admin-category-chart">
            {(report?.categoryBreakdown || []).slice(0, 7).map((item) => (
              <div key={item.categoryId}>
                <span>{item.categoryName}</span>
                <div>
                  <i
                    style={{
                      width: `${Math.max(
                        4,
                        (item.revenue / maxCategoryRevenue) * 100
                      )}%`,
                    }}
                  />
                </div>
                <strong>{money(item.revenue)}</strong>
              </div>
            ))}

            {!report?.categoryBreakdown?.length && (
              <div className="admin-mini-empty">No category sales yet.</div>
            )}
          </div>
        </section>
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Pending Vendor Applications</h2>
              <p>Sellers waiting for administrative review</p>
            </div>
            <Link to="/admin/vendors">Review all</Link>
          </div>

          <div className="admin-list">
            {vendors.slice(0, 5).map((vendor) => (
              <div key={vendor.id}>
                <span>
                  <strong>{vendor.businessName}</strong>
                  <small>{vendor.userEmail}</small>
                </span>
                <b>Pending</b>
              </div>
            ))}

            {!vendors.length && (
              <div className="admin-mini-empty">No pending applications.</div>
            )}
          </div>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>Review Moderation</h2>
              <p>Latest customer product reviews</p>
            </div>
            <Link to="/admin/reviews">Moderate</Link>
          </div>

          <div className="admin-list">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id}>
                <span>
                  <strong>{review.productName}</strong>
                  <small>{review.userName} · {review.rating}/5</small>
                </span>
                <b>{String(review.status).replaceAll("_", " ")}</b>
              </div>
            ))}

            {!reviews.length && (
              <div className="admin-mini-empty">No reviews yet.</div>
            )}
          </div>
        </section>
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Platform Snapshot</h2>
            <p>Current marketplace configuration</p>
          </div>
        </div>

        <div className="admin-snapshot">
          <div><strong>{users.length}</strong><span>Accounts</span></div>
          <div><strong>{categories.length}</strong><span>Active Categories</span></div>
          <div><strong>{reviews.length}</strong><span>Reviews</span></div>
          <div><strong>{vendors.length}</strong><span>Vendor Applications</span></div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
