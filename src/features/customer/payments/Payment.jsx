import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { apiRequest } from "../../../services/api";
import "./payment.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

const emptyAddress = {
  recipientName: "",
  phoneNumber: "",
  addressLine: "",
  city: "",
  state: "",
  country: "Nigeria",
  postalCode: "",
  defaultAddress: true,
};

function Payment() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadCheckout() {
    try {
      setLoading(true);

      const [cartResponse, addressResponse] = await Promise.all([
        apiRequest("/cart"),
        apiRequest("/addresses"),
      ]);

      setCart(cartResponse || { items: [], subtotal: 0 });

      const list = addressResponse?.data || [];
      setAddresses(list);

      const preferred =
        list.find((address) => address.defaultAddress) || list[0] || null;

      if (preferred) {
        setSelectedAddressId(preferred.id);
      } else {
        setShowAddressForm(true);
      }

      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load checkout.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCheckout();
  }, []);

  const itemCount = useMemo(
    () => cart.items.reduce((total, item) => total + item.quantity, 0),
    [cart.items]
  );

  function updateAddress(event) {
    const { name, value } = event.target;

    setAddressForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function saveAddress() {
    try {
      setSubmitting(true);

      const created = await apiRequest("/addresses", {
        method: "POST",
        body: JSON.stringify(addressForm),
      });

      setAddresses((current) => [...current, created]);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
      setAddressForm(emptyAddress);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not save address.");
    } finally {
      setSubmitting(false);
    }
  }

  async function placeOrder() {
    if (!selectedAddressId) {
      setError("Choose or add a delivery address.");
      return;
    }

    if (!cart.items.length) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const idempotencyKey =
        crypto.randomUUID?.() ||
        `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const response = await apiRequest("/checkout", {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          deliveryMethod,
          paymentMethod,
        }),
      });

      localStorage.setItem("marketplace_last_order_id", response.orderId);

      const savedOrderIds = JSON.parse(
        localStorage.getItem("marketplace_order_ids") || "[]"
      );

      const nextOrderIds = Array.from(
        new Set([response.orderId, ...savedOrderIds])
      );

      localStorage.setItem(
        "marketplace_order_ids",
        JSON.stringify(nextOrderIds)
      );

      if (paymentMethod === "paystack" && response.paystack?.authorizationUrl) {
        window.location.assign(response.paystack.authorizationUrl);
        return;
      }

      navigate(`/orders?orderId=${response.orderId}`);
    } catch (requestError) {
      setError(requestError.message || "Could not place order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="payment-state">Loading checkout...</div>;
  }

  return (
    <div className="payment-page">
      <div className="checkout-progress">
        <div className="checkout-step completed">
          <span>✓</span>
          <div>
            <strong>Cart</strong>
            <small>Reviewed</small>
          </div>
        </div>

        <div className="checkout-line active-line" />

        <div className="checkout-step active">
          <span>2</span>
          <div>
            <strong>Delivery</strong>
            <small>Address & method</small>
          </div>
        </div>

        <div className="checkout-line" />

        <div className="checkout-step">
          <span>3</span>
          <div>
            <strong>Payment</strong>
            <small>Complete order</small>
          </div>
        </div>
      </div>

      <div className="payment-heading">
        <p className="eyebrow">CHECKOUT</p>
        <h1>Delivery & Payment</h1>
      </div>

      {error && <div className="form-error payment-error">{error}</div>}

      <div className="payment-layout">
        <div className="payment-main">
          <section className="checkout-section-card">
            <div className="checkout-section-title">
              <div>
                <span>1</span>
                <div>
                  <h2>Delivery Address</h2>
                  <p>Where should we send your order?</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddressForm((value) => !value)}
              >
                {showAddressForm ? "Cancel" : "+ Add Address"}
              </button>
            </div>

            {addresses.length > 0 && (
              <div className="address-grid">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={
                      selectedAddressId === address.id
                        ? "address-card selected"
                        : "address-card"
                    }
                  >
                    <input
                      type="radio"
                      name="address"
                      value={address.id}
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                    />

                    <div>
                      <strong>{address.recipientName}</strong>
                      <p>{address.phoneNumber}</p>
                      <p>{address.addressLine}</p>
                      <p>
                        {address.city}, {address.state}, {address.country}
                      </p>
                    </div>

                    {address.defaultAddress && <small>Default</small>}
                  </label>
                ))}
              </div>
            )}

            {showAddressForm && (
              <div className="address-form">
                <div className="form-grid-two">
                  <label>
                    Recipient name
                    <input
                      name="recipientName"
                      value={addressForm.recipientName}
                      onChange={updateAddress}
                    />
                  </label>

                  <label>
                    Phone number
                    <input
                      name="phoneNumber"
                      value={addressForm.phoneNumber}
                      onChange={updateAddress}
                    />
                  </label>
                </div>

                <label>
                  Address
                  <input
                    name="addressLine"
                    value={addressForm.addressLine}
                    onChange={updateAddress}
                  />
                </label>

                <div className="form-grid-two">
                  <label>
                    City
                    <input
                      name="city"
                      value={addressForm.city}
                      onChange={updateAddress}
                    />
                  </label>

                  <label>
                    State
                    <input
                      name="state"
                      value={addressForm.state}
                      onChange={updateAddress}
                    />
                  </label>
                </div>

                <div className="form-grid-two">
                  <label>
                    Country
                    <input
                      name="country"
                      value={addressForm.country}
                      onChange={updateAddress}
                    />
                  </label>

                  <label>
                    Postal code
                    <input
                      name="postalCode"
                      value={addressForm.postalCode}
                      onChange={updateAddress}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="save-address-button"
                  onClick={saveAddress}
                  disabled={submitting}
                >
                  Save Address
                </button>
              </div>
            )}
          </section>

          <section className="checkout-section-card">
            <div className="checkout-section-title">
              <div>
                <span>2</span>
                <div>
                  <h2>Delivery Method</h2>
                  <p>Choose how you want to receive your order.</p>
                </div>
              </div>
            </div>

            <div className="choice-grid">
              <label
                className={
                  deliveryMethod === "delivery"
                    ? "choice-card selected"
                    : "choice-card"
                }
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="delivery"
                  checked={deliveryMethod === "delivery"}
                  onChange={(event) => setDeliveryMethod(event.target.value)}
                />
                <div>
                  <strong>Home Delivery</strong>
                  <p>Delivered to your selected address.</p>
                </div>
              </label>

              <label
                className={
                  deliveryMethod === "pickup"
                    ? "choice-card selected"
                    : "choice-card"
                }
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={deliveryMethod === "pickup"}
                  onChange={(event) => setDeliveryMethod(event.target.value)}
                />
                <div>
                  <strong>Pickup</strong>
                  <p>Collect from an available pickup location.</p>
                </div>
              </label>
            </div>
          </section>

          <section className="checkout-section-card">
            <div className="checkout-section-title">
              <div>
                <span>3</span>
                <div>
                  <h2>Payment Method</h2>
                  <p>Select how you want to pay.</p>
                </div>
              </div>
            </div>

            <div className="choice-grid">
              <label
                className={
                  paymentMethod === "paystack"
                    ? "choice-card selected"
                    : "choice-card"
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="paystack"
                  checked={paymentMethod === "paystack"}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <div>
                  <strong>Paystack</strong>
                  <p>Card, bank or transfer through secure checkout.</p>
                </div>
              </label>

              <label
                className={
                  paymentMethod === "cod"
                    ? "choice-card selected"
                    : "choice-card"
                }
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                />
                <div>
                  <strong>Pay on Delivery</strong>
                  <p>Pay when your order arrives.</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        <aside className="payment-summary-card">
          <div className="payment-summary-head">
            <h2>Order Summary</h2>
            <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
          </div>

          <div className="payment-summary-items">
            {cart.items.slice(0, 4).map((item) => (
              <div key={item.productId}>
                <span>{item.quantity} × item</span>
                <strong>{money(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>

          <div className="summary-divider" />

          <div className="summary-line-item">
            <span>Subtotal</span>
            <strong>{money(cart.subtotal)}</strong>
          </div>

          <div className="summary-line-item">
            <span>Delivery</span>
            <strong>Calculated by order</strong>
          </div>

          <div className="summary-divider" />

          <div className="summary-total-row">
            <span>Total</span>
            <strong>{money(cart.subtotal)}</strong>
          </div>

          <button
            type="button"
            className="place-order-button"
            onClick={placeOrder}
            disabled={submitting || !cart.items.length}
          >
            {submitting ? "Processing..." : "Place Order →"}
          </button>

          <p className="payment-secure-note">
            🔒 Your checkout is protected. Payment confirmation is verified by
            the backend.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default Payment;
