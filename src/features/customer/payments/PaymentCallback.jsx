import { Link, useSearchParams } from "react-router";
import "./payment.css";

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const reference =
    searchParams.get("reference") ||
    searchParams.get("trxref") ||
    "";

  const orderId = localStorage.getItem("marketplace_last_order_id");

  return (
    <main className="demo-payment-page">
      <section className="demo-payment-card">
        <div className="demo-payment-mark">✓</div>
        <p className="eyebrow">PAYMENT RETURN</p>
        <h1>Payment confirmation is being verified.</h1>
        <p>
          Returning to this page does not mark an order paid. The backend
          confirms payment independently through the verified provider flow.
        </p>

        {reference && (
          <div className="demo-payment-reference">
            <span>Transaction reference</span>
            <strong>{reference}</strong>
          </div>
        )}

        <Link
          className="payment-callback-primary"
          to={orderId ? `/orders?orderId=${orderId}` : "/orders"}
        >
          View Order Status
        </Link>

        <Link to="/products">Continue Shopping</Link>
      </section>
    </main>
  );
}

export default PaymentCallback;
