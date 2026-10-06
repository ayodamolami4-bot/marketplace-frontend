import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";
import "./vendor.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function VendorFinance() {
  const [finance, setFinance] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFinance() {
      try {
        setLoading(true);

        const [financeData, reportData] = await Promise.all([
          apiRequest("/vendor/finance"),
          apiRequest("/vendor/reports"),
        ]);

        if (!active) return;

        setFinance(financeData);
        setReport(reportData);
        setError("");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || "Could not load finance data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFinance();

    return () => {
      active = false;
    };
  }, []);

  const maxRevenue = useMemo(
    () =>
      Math.max(
        ...(report?.revenueOverTime || []).map((point) => point.revenue),
        1
      ),
    [report]
  );

  if (loading) {
    return <div className="vendor-state">Loading finance...</div>;
  }

  return (
    <div className="vendor-page">
      <div className="vendor-page-heading">
        <div>
          <p className="eyebrow">FINANCE</p>
          <h1>Earnings & Reports</h1>
          <p>Review your sales, commission, payout balance and performance.</p>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <section className="vendor-stat-grid finance-stats">
        <article>
          <small>Gross Sales</small>
          <strong>{money(finance?.grossSales)}</strong>
          <span>Before commission</span>
        </article>

        <article>
          <small>Net Earnings</small>
          <strong>{money(finance?.netEarnings)}</strong>
          <span>After marketplace fees</span>
        </article>

        <article>
          <small>Available</small>
          <strong>{money(finance?.availableForPayout)}</strong>
          <span>Available for payout</span>
        </article>

        <article>
          <small>Commission</small>
          <strong>{finance?.commissionPercent || 0}%</strong>
          <span>{money(finance?.commissionAmount)} total</span>
        </article>
      </section>

      <div className="vendor-dashboard-grid">
        <section className="vendor-panel vendor-chart-panel">
          <div className="vendor-panel-heading">
            <div>
              <h2>Revenue Trend</h2>
              <p>Sales performance over time</p>
            </div>
          </div>

          <div className="simple-bar-chart finance-chart">
            {(report?.revenueOverTime || []).slice(-12).map((point) => (
              <div className="chart-column" key={point.date}>
                <div className="chart-bar-wrap">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${Math.max(
                        5,
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
          </div>
        </section>

        <section className="vendor-panel">
          <div className="vendor-panel-heading">
            <div>
              <h2>Best Sellers</h2>
              <p>Your highest-performing products</p>
            </div>
          </div>

          <div className="best-seller-list">
            {(report?.bestSellers || []).slice(0, 6).map((item, index) => (
              <div key={item.productId}>
                <b>{index + 1}</b>
                <span>
                  <strong>{item.productName}</strong>
                  <small>{item.quantitySold} sold</small>
                </span>
                <strong>{money(item.revenue)}</strong>
              </div>
            ))}

            {!report?.bestSellers?.length && (
              <div className="vendor-mini-empty">No sales data yet.</div>
            )}
          </div>
        </section>
      </div>

      <section className="vendor-panel">
        <div className="vendor-panel-heading">
          <div>
            <h2>Payout History</h2>
            <p>
              Schedule:{" "}
              {String(finance?.payoutSchedule || "not configured").replaceAll(
                "_",
                " "
              )}
            </p>
          </div>
          <strong className="paid-total">
            Paid: {money(finance?.totalPaidOut)}
          </strong>
        </div>

        <div className="vendor-table-wrap">
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {(finance?.payouts || []).map((payout) => (
                <tr key={payout.id}>
                  <td>{payout.reference || "—"}</td>
                  <td>{money(payout.amount)}</td>
                  <td>
                    <span className="vendor-status">
                      {String(payout.status).replaceAll("_", " ")}
                    </span>
                  </td>
                  <td>
                    {new Date(payout.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}

              {!finance?.payouts?.length && (
                <tr>
                  <td colSpan="4" className="vendor-empty-cell">
                    No payouts recorded yet.
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

export default VendorFinance;
