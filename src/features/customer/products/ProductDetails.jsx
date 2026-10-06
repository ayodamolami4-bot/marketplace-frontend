import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { apiRequest } from "../../../services/api";
import "./productDetails.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      try {
        setLoading(true);

        const [productResponse, reviewResponse] = await Promise.all([
          apiRequest(`/products/${id}`),
          apiRequest(`/products/${id}/reviews`),
        ]);

        if (!active) return;

        setProduct(productResponse);
        setSelectedImage(productResponse?.images?.[0] || "");
        setReviews(reviewResponse?.data || []);
        setError("");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || "Could not load this product.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      active = false;
    };
  }, [id]);

  const ratingLabel = useMemo(() => {
    if (!product?.reviews?.count) return "No reviews yet";
    return `${product.reviews.avgRating?.toFixed?.(1) || "0.0"} (${product.reviews.count})`;
  }, [product]);

  async function addToCart() {
    if (!localStorage.getItem("marketplace_token")) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    try {
      await apiRequest("/cart/items", {
        method: "POST",
        body: JSON.stringify({
          productId: id,
          quantity,
        }),
      });

      setActionMessage("Added to cart");
      setTimeout(() => setActionMessage(""), 1800);
    } catch (requestError) {
      setActionMessage(requestError.message || "Could not add to cart");
    }
  }

  async function addToWishlist() {
    if (!localStorage.getItem("marketplace_token")) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    try {
      await apiRequest("/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId: id }),
      });

      setActionMessage("Saved to wishlist");
      setTimeout(() => setActionMessage(""), 1800);
    } catch (requestError) {
      setActionMessage(requestError.message || "Could not save product");
    }
  }

  if (loading) {
    return <div className="product-detail-state">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-detail-state">
        <h2>Product unavailable</h2>
        <p>{error}</p>
        <Link to="/products">Back to products</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [""];

  return (
    <div className="product-detail-page">
      <div className="product-breadcrumbs">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/products">Products</Link>
        <span>›</span>
        <span>{product.name}</span>
      </div>

      <section className="product-detail-main">
        <div className="product-gallery">
          <div className="product-thumbnails">
            {images.map((image, index) => (
              <button
                type="button"
                key={image || index}
                className={
                  selectedImage === image
                    ? "thumbnail-button active"
                    : "thumbnail-button"
                }
                onClick={() => setSelectedImage(image)}
              >
                {image ? (
                  <img src={image} alt="" />
                ) : (
                  <span>No image</span>
                )}
              </button>
            ))}
          </div>

          <div className="product-main-image">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} />
            ) : (
              <div className="detail-image-fallback">No image available</div>
            )}
          </div>
        </div>

        <div className="product-detail-info">
          <p className="product-brand-line">
            {product.category || "Marketplace product"} ·{" "}
            <span>Sold by {product.vendor?.name || "Marketplace vendor"}</span>
          </p>

          <h1>{product.name}</h1>

          <div className="product-rating-line">
            <span className="stars">★</span>
            <strong>{ratingLabel}</strong>
            <span className="verified-copy">Verified purchase reviews</span>
          </div>

          <div className="product-detail-price">{money(product.price)}</div>

          <p className="product-stock">
            {product.stock > 0 ? (
              <>
                <span className="stock-dot" /> In stock — {product.stock} available
              </>
            ) : (
              <span className="out-stock">Out of stock</span>
            )}
          </p>

          <p className="product-description">
            {product.description || "No description has been added for this product yet."}
          </p>

          <div className="quantity-row">
            <span>Quantity</span>

            <div className="quantity-control">
              <button
                type="button"
                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              >
                −
              </button>
              <strong>{quantity}</strong>
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.min(Math.max(product.stock, 1), value + 1)
                  )
                }
              >
                +
              </button>
            </div>
          </div>

          <div className="product-action-row">
            <button
              type="button"
              className="detail-cart-button"
              onClick={addToCart}
              disabled={product.stock <= 0}
            >
              Add to Cart
            </button>

            <button
              type="button"
              className="detail-wishlist-button"
              onClick={addToWishlist}
            >
              ♡ Add to Wishlist
            </button>
          </div>

          {actionMessage && (
            <div className="product-action-message">{actionMessage}</div>
          )}

          <div className="product-benefits">
            <div>
              <span>✓</span>
              <p>
                <strong>Secure checkout</strong>
                <small>Protected payment flow</small>
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>
                <strong>Verified seller</strong>
                <small>{product.vendor?.name || "Marketplace vendor"}</small>
              </p>
            </div>

            <div>
              <span>↻</span>
              <p>
                <strong>Order tracking</strong>
                <small>Follow fulfillment progress</small>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="seller-strip">
        <div className="seller-avatar">
          {(product.vendor?.name || "V").charAt(0).toUpperCase()}
        </div>

        <div>
          <small>Sold by</small>
          <h3>{product.vendor?.name || "Marketplace vendor"}</h3>
          <p>
            {product.vendor?.rating
              ? `★ ${product.vendor.rating.toFixed?.(1) || product.vendor.rating} seller rating`
              : "Verified marketplace seller"}
          </p>
        </div>
      </section>

      <section className="product-review-section">
        <div className="review-summary">
          <p className="eyebrow">CUSTOMER REVIEWS</p>
          <div className="review-score">
            <strong>{product.reviews?.avgRating?.toFixed?.(1) || "—"}</strong>
            <div>
              <span>★★★★★</span>
              <small>{product.reviews?.count || 0} reviews</small>
            </div>
          </div>
        </div>

        <div className="review-list">
          {reviews.length ? (
            reviews.slice(0, 5).map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-card-top">
                  <strong>{review.userName || "Customer"}</strong>
                  <span>{"★".repeat(review.rating)}</span>
                </div>

                <p>{review.comment || "No written comment."}</p>
              </article>
            ))
          ) : (
            <div className="empty-state">
              No customer reviews have been published for this product yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductDetails;
