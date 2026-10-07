import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { apiRequest } from "../../../services/api";
import "./payment.css";

function DemoPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  const reference = useMemo(
    () => searchParams.get("reference") || "",
    [searchParams]
  );

  async function completeDemoPayment() {
    if (!reference) {
      setError("Payment reference is missing.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await apiRequest(
        `/payments/demo/${encodeURIComponent(reference)}/success`,
        { method: "POST" }
      );

      setStatus("success");
      window.dispatchEvent(
        new Event("marketplace:notifications-updated")
      );
    } catch (requestError) {
      setError(
        requestError.message || "Could not complete demo payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function openOrder() {
    const orderId = localStorage.getItem("marketplace_last_order_id");

    if (orderId) {
      navigate(`/orders?orderId=${orderId}`);
      return;
    }

    navigate("/orders");
  }

  return (
    <main className="demo-payment-page">
      <section className="demo-payment-card">
        <p className="eyebrow">PRESENTATION PAYMENT</p>

        {status === "success" ? (
          <>
            <div className="demo-payment-mark">✓</div>
            <h1>Demo payment completed</h1>
            <p>
              The local payment-provider simulation marked this transaction
              successful through the same backend payment-state flow used by
              the marketplace.
            </p>

            <button type="button" onClick={openOrder}>
              View Order
            </button>
          </>
        ) : (
          <>
            <h1>Complete Demo Payment</h1>
            <p>
              This screen is a local presentation simulation. No real card,
              bank account or money is used.
            </p>

            <div className="demo-payment-reference">
              <span>Reference</span>
              <strong>{reference || "Missing reference"}</strong>
            </div>

            {error && <div className="form-error">{error}</div>}

            <button
              type="button"
              onClick={completeDemoPayment}
              disabled={submitting || !reference}
            >
              {submitting ? "Processing..." : "Simulate Successful Payment"}
            </button>

            <Link to="/cart">Return to cart</Link>
          </>
        )}
      </section>
    </main>
  );
}

export default DemoPayment;
