import { useMemo, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import { apiRequest } from "../../../services/api";
import "./seller.css";

function BecomeSeller() {
  const { user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    businessName: "",
    businessDescription: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const roles = useMemo(
    () =>
      (user?.roles || []).map((role) =>
        String(role).trim().toLowerCase()
      ),
    [user]
  );

  const isVendor = roles.includes("vendor");

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function submitApplication(event) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await apiRequest("/vendor-applications", {
        method: "POST",
        body: JSON.stringify({
          businessName: form.businessName,
          businessDescription: form.businessDescription,
        }),
      });

      setSubmitted(true);
    } catch (requestError) {
      if (requestError.status === 409) {
        setError(
          "A seller application already exists for this account. An administrator must review it before seller access is granted."
        );
      } else {
        setError(
          requestError.message || "Could not submit seller application."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (isVendor) {
    return (
      <main className="seller-page">
        <section className="seller-approved-card">
          <div className="seller-approved-mark">✓</div>
          <p className="eyebrow">SELLER ACCESS ACTIVE</p>
          <h1>Your account is approved to sell.</h1>
          <p>
            Use the same marketplace login to manage products, orders,
            inventory and finance from Seller Center.
          </p>
          <Link to="/vendor">Open Seller Center</Link>
        </section>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="seller-page">
        <section className="seller-approved-card pending">
          <div className="seller-approved-mark">1</div>
          <p className="eyebrow">APPLICATION SUBMITTED</p>
          <h1>Your seller application is pending review.</h1>
          <p>
            An administrator must approve the business before the Vendor role
            is added to this account. After approval, sign in again so your
            new role is included in a fresh session.
          </p>
          <Link to="/">Return to Marketplace</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="seller-page">
      <section className="seller-hero">
        <div>
          <p className="eyebrow">BECOME A SELLER</p>
          <h1>Grow from customer to marketplace vendor.</h1>
          <p>
            Your existing account remains your customer account. Once your
            business application is approved, the same login also unlocks
            Seller Center.
          </p>
        </div>
      </section>

      <div className="seller-layout">
        <section className="seller-steps">
          <h2>How seller access works</h2>

          <div>
            <span>1</span>
            <p>
              <strong>Submit your business</strong>
              <small>
                Tell the marketplace your business name and what you sell.
              </small>
            </p>
          </div>

          <div>
            <span>2</span>
            <p>
              <strong>Administrator review</strong>
              <small>
                The application is reviewed before seller access is granted.
              </small>
            </p>
          </div>

          <div>
            <span>3</span>
            <p>
              <strong>Seller Center unlocks</strong>
              <small>
                Approved accounts can manage products, orders and finance.
              </small>
            </p>
          </div>

          <div className="seller-note">
            Payment-provider seller configuration is completed as part of
            administrative approval.
          </div>
        </section>

        <form className="seller-form-card" onSubmit={submitApplication}>
          <div>
            <p className="eyebrow">BUSINESS APPLICATION</p>
            <h2>Apply to sell</h2>
          </div>

          {error && <div className="form-error">{error}</div>}

          <label>
            Business name
            <input
              name="businessName"
              value={form.businessName}
              onChange={updateField}
              maxLength="150"
              placeholder="Your store or business name"
              required
            />
          </label>

          <label>
            Business description
            <textarea
              name="businessDescription"
              value={form.businessDescription}
              onChange={updateField}
              maxLength="1000"
              placeholder="Describe the products you plan to sell."
              rows="6"
            />
          </label>

          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Seller Application"}
          </button>

          <p>
            Seller access is never selected at signup. It is granted only
            after administrative approval.
          </p>
        </form>
      </div>
    </main>
  );
}

export default BecomeSeller;
