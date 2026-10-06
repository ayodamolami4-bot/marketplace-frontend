import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../../../services/api";
import { productImage } from "../../../utils/productImage";
import "./wishlist.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function Wishlist() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadWishlist() {
    try {
      setLoading(true);

      const response = await apiRequest("/wishlist");
      const wishlistItems = response?.data || [];

      const details = await Promise.all(
        wishlistItems.map(async (item) => {
          try {
            const product = await apiRequest(
              `/products/${item.productId}`
            );
            return [item.productId, product];
          } catch {
            return [item.productId, null];
          }
        })
      );

      setItems(wishlistItems);
      setProducts(Object.fromEntries(details));
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load your wishlist.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  async function addToCart(productId) {
    try {
      setWorkingId(productId);
      setMessage("");
      setError("");

      await apiRequest("/cart/items", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      setMessage("Product added to your cart.");
      window.dispatchEvent(new Event("marketplace:cart-updated"));
    } catch (requestError) {
      setError(requestError.message || "Could not add product to cart.");
    } finally {
      setWorkingId("");
    }
  }

  async function removeItem(productId) {
    try {
      setWorkingId(productId);
      setMessage("");
      setError("");

      await apiRequest(`/wishlist/${productId}`, {
        method: "DELETE",
      });

      setItems((current) =>
        current.filter((item) => item.productId !== productId)
      );

      setMessage("Product removed from your wishlist.");
      window.dispatchEvent(new Event("marketplace:wishlist-updated"));
    } catch (requestError) {
      setError(
        requestError.message || "Could not remove wishlist item."
      );
    } finally {
      setWorkingId("");
    }
  }

  if (loading) {
    return (
      <div className="wishlist-state">
        Loading your wishlist...
      </div>
    );
  }

  return (
    <main className="wishlist-page">
      <div className="wishlist-heading">
        <div>
          <p className="eyebrow">YOUR SAVED ITEMS</p>
          <h1>My Wishlist</h1>
          <p>
            {items.length} saved{" "}
            {items.length === 1 ? "product" : "products"}
          </p>
        </div>

        <Link to="/products">Continue Shopping</Link>
      </div>

      {error && (
        <div className="form-error wishlist-message">{error}</div>
      )}

      {message && (
        <div className="wishlist-success wishlist-message">
          {message}
        </div>
      )}

      {!items.length ? (
        <section className="wishlist-empty">
          <div className="wishlist-empty-icon">
            {"\u2661"}
          </div>

          <h2>Your wishlist is empty</h2>

          <p>
            Save products you are interested in and come back to them later.
          </p>

          <Link to="/products" className="wishlist-browse">
            Browse Products
          </Link>
        </section>
      ) : (
        <section className="wishlist-grid">
          {items.map((item) => {
            const product = products[item.productId];

            return (
              <article className="wishlist-card" key={item.id}>
                <Link
                  to={`/products/${item.productId}`}
                  className="wishlist-image"
                >
                  <img
                    src={productImage(product || item)}
                    alt={product?.name || item.productName}
                  />
                </Link>

                <div className="wishlist-card-body">
                  <small>
                    {product?.vendor?.name ||
                      item.vendorName ||
                      "Marketplace vendor"}
                  </small>

                  <Link to={`/products/${item.productId}`}>
                    <h2>
                      {product?.name ||
                        item.productName ||
                        "Product"}
                    </h2>
                  </Link>

                  <strong className="wishlist-price">
                    {money(product?.price ?? item.price)}
                  </strong>

                  <div className="wishlist-actions">
                    <button
                      type="button"
                      className="wishlist-cart-button"
                      disabled={workingId === item.productId}
                      onClick={() => addToCart(item.productId)}
                    >
                      {workingId === item.productId
                        ? "Working..."
                        : "Add to Cart"}
                    </button>

                    <button
                      type="button"
                      className="wishlist-remove-button"
                      disabled={workingId === item.productId}
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default Wishlist;
