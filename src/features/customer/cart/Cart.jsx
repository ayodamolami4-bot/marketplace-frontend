import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiRequest } from "../../../services/api";
import "./cart.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  async function loadCart() {
    try {
      setLoading(true);
      const response = await apiRequest("/cart");
      const items = response?.items || [];

      const details = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await apiRequest(`/products/${item.productId}`);
            return [item.productId, product];
          } catch {
            return [item.productId, null];
          }
        })
      );

      setCart(response || { items: [], subtotal: 0 });
      setProducts(Object.fromEntries(details));
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load your cart.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function changeQuantity(productId, quantity) {
    if (quantity < 1) return;

    try {
      setUpdatingId(productId);
      const response = await apiRequest(`/cart/items/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });

      setCart(response);
    } catch (requestError) {
      setError(requestError.message || "Could not update quantity.");
    } finally {
      setUpdatingId("");
    }
  }

  async function removeItem(productId) {
    try {
      setUpdatingId(productId);
      await apiRequest(`/cart/items/${productId}`, {
        method: "DELETE",
      });
      await loadCart();
    } catch (requestError) {
      setError(requestError.message || "Could not remove item.");
    } finally {
      setUpdatingId("");
    }
  }

  if (loading) {
    return <div className="cart-state">Loading your cart...</div>;
  }

  return (
    <div className="checkout-page-shell">
      <div className="checkout-progress">
        <div className="checkout-step active">
          <span>1</span>
          <div>
            <strong>Cart</strong>
            <small>Review items</small>
          </div>
        </div>

        <div className="checkout-line" />

        <div className="checkout-step">
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

      <div className="checkout-heading">
        <div>
          <p className="eyebrow">SHOPPING CART</p>
          <h1>Review Your Order</h1>
        </div>
        <Link to="/products">Continue Shopping</Link>
      </div>

      {error && <div className="form-error cart-error">{error}</div>}

      {!cart.items?.length ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add products from the marketplace before checking out.</p>
          <Link to="/products" className="primary-button">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-panel">
            <div className="cart-panel-title">
              <strong>{cart.items.length} item{cart.items.length === 1 ? "" : "s"}</strong>
              <span>Seller items may ship separately</span>
            </div>

            <div className="cart-list">
              {cart.items.map((item) => {
                const product = products[item.productId];

                return (
                  <article className="cart-row" key={item.productId}>
                    <Link
                      to={`/products/${item.productId}`}
                      className="cart-product-image"
                    >
                      {product?.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div>No image</div>
                      )}
                    </Link>

                    <div className="cart-product-info">
                      <small>{product?.category || "Marketplace"}</small>
                      <Link to={`/products/${item.productId}`}>
                        <h3>{product?.name || "Product"}</h3>
                      </Link>
                      <p>
                        Sold by{" "}
                        <strong>
                          {product?.vendor?.name || "Marketplace vendor"}
                        </strong>
                      </p>
                      <strong className="cart-price">{money(item.price)}</strong>
                    </div>

                    <div className="cart-row-actions">
                      <div className="cart-quantity">
                        <button
                          type="button"
                          disabled={updatingId === item.productId || item.quantity <= 1}
                          onClick={() =>
                            changeQuantity(item.productId, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          disabled={updatingId === item.productId}
                          onClick={() =>
                            changeQuantity(item.productId, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>

                      <strong className="cart-line-total">
                        {money(item.price * item.quantity)}
                      </strong>

                      <button
                        type="button"
                        className="remove-cart-item"
                        disabled={updatingId === item.productId}
                        onClick={() => removeItem(item.productId)}
                      >
                        Remove
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="order-summary-card">
            <h2>Order Summary</h2>

            <div className="summary-line-item">
              <span>Subtotal</span>
              <strong>{money(cart.subtotal)}</strong>
            </div>

            <div className="summary-line-item">
              <span>Delivery</span>
              <strong>Calculated next</strong>
            </div>

            <div className="summary-line-item">
              <span>Discount</span>
              <strong>—</strong>
            </div>

            <div className="summary-divider" />

            <div className="summary-total-row">
              <span>Total</span>
              <strong>{money(cart.subtotal)}</strong>
            </div>

            <p className="summary-note">
              Final delivery charges depend on your selected method.
            </p>

            <button
              type="button"
              className="checkout-continue"
              onClick={() => navigate("/payment")}
            >
              Continue to Checkout →
            </button>

            <div className="summary-trust">
              <span>✓ Secure checkout</span>
              <span>✓ Protected payment flow</span>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Cart;
