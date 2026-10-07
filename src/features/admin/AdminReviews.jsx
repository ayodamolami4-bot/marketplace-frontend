import { useEffect, useState } from "react";
import { apiRequest } from "../../services/api";
import "./admin.css";

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      setLoading(true);
      try {
        const query = filter ? `?status=${encodeURIComponent(filter)}` : "";
        const response = await apiRequest(`/admin/reviews${query}`);
        if (active) { setReviews(response?.data || []); setError(""); }
      } catch (requestError) {
        if (active) setError(requestError.message || "Could not load reviews.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadReviews();
    return () => { active = false; };
  }, [filter]);

  async function moderate(reviewId, action) {
    try {
      setBusyId(reviewId);

      const updated = await apiRequest(`/admin/reviews/${reviewId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });

      setReviews((current) =>
        current.map((review) => (review.id === reviewId ? updated : review))
          .filter((review) => !filter || review.status === filter)
      );
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not moderate review.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="eyebrow">TRUST & SAFETY</p>
          <h1>Reviews</h1>
          <p>Moderate customer reviews published across marketplace products.</p>
        </div>

        <select
          className="admin-filter" aria-label="Review status" disabled={Boolean(busyId)}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="">All Reviews</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="HIDDEN">Hidden</option>
        </select>
      </div>

      {error && <div className="form-error" role="alert">{error}</div>}

      <section className="admin-review-grid">
        {loading && <p role="status">Loading reviews…</p>}
        {!loading && reviews.map((review) => (
          <article className="admin-review-card" key={review.id}>
            <div className="admin-review-top">
              <div>
                <small>{review.productName}</small>
                <h3>{review.userName}</h3>
              </div>

              <span className="admin-status">
                {String(review.status).replaceAll("_", " ")}
              </span>
            </div>

            <div className="admin-review-rating">
              {"★".repeat(review.rating)}
              <span>{review.rating}/5</span>
            </div>

            <p>{review.comment || "No written review."}</p>

            <div className="admin-review-actions">
              <button
                type="button"
                className="admin-approve-button"
                disabled={busyId === review.id}
                onClick={() => moderate(review.id, "approve")}
              >
                Approve
              </button>

              <button
                type="button"
                className="admin-reject-button"
                disabled={busyId === review.id}
                onClick={() => moderate(review.id, "remove")}
              >
                Hide
              </button>
            </div>
          </article>
        ))}

        {!loading && !error && !reviews.length && (
          <div className="admin-mini-empty">No reviews match this filter.</div>
        )}
      </section>
    </div>
  );
}

export default AdminReviews;
