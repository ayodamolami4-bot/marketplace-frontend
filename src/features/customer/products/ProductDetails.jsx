import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { apiRequest } from "../../../services/api";
import { productImage } from "../../../utils/productImage";
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
  const [saved, setSaved] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProduct() {
      setLoading(true);

      const [productResult, reviewResult] = await Promise.allSettled([
        apiRequest(`/products/${id}`),
        apiRequest(`/products/${id}/reviews`),
      ]);

      if (!active) return;

      if (productResult.status === "fulfilled") {
        const nextProduct = productResult.value;
        setProduct(nextProduct);
        setSelectedImage(
          nextProduct?.images?.[0] || productImage(nextProduct)
        );
        setError("");
      } else {
        setError(
          productResult.reason?.message || "Could not load this product."
        );
      }

      if (reviewResult.status === "fulfilled") {
        setReviews(reviewResult.value?.data || []);
      }

      setLoading(false);
    }

    async function loadWishlistState() {
      if (!localStorage.getItem("marketplace_token")) return;

      try {
        const response = await apiRequest("/wishlist");

        if (!active) return;

        setSaved(
          (response?.data || []).some((item) => item.productId === id)
        );
      } catch {
        // Authentication handling is centralized in apiRequest.
      }
    }

    loadProduct();
    loadWishlistState();

    return () => {
      active = false;
    };
  }, [id]);

  const ratingLabel = useMemo(() => {
    if (!product?.reviews?.count) return "No reviews yet";

    const average = Number(product.reviews.avgRating || 0).toFixed(1);
    return `${average} (${product.reviews.count})`;
  }, [product]);

  function requireLogin() {
    if (localStorage.getItem("marketplace_token")) {
      return true;
    }

    navigate("/login", { state: { from: `/products/${id}` } });
    return false;
  }

  async function addToCart() {
    if (!requireLogin()) return;

    try {
      await apiRequest("/cart/items", {
        method: "POST",
        body: JSON.stringify({
          productId: id,
          quantity,
        }),
      });

      setActionMessage("Added to cart.");
      window.dispatchEvent(new Event("marketplace:cart-updated"));
    } catch (requestError) {
      setActionMessage(requestError.message || "Could not add to cart.");
    }
  }

  async function toggleWishlist() {
    if (!requireLogin()) return;

    try {
      if (saved) {
        await apiRequest(`/wishlist/${id}`, {
          method: "DELETE",
        });
      } else {
        await apiRequest("/wishlist", {
          method: "POST",
          body: JSON.stringify({ productId: id }),
        });
      }

      setSaved((value) => !value);
      setActionMessage(
        saved ? "Removed from wishlist." : "Saved to wishlist."
      );
      window.dispatchEvent(new Event("marketplace:wishlist-updated"));
    } catch (requestError) {
      setActionMessage(
        requestError.message || "Could not update wishlist."
      );
    }
  }

  async function submitReview(event) {
    event.preventDefault();

    if (!requireLogin()) return;

    if (!rating) {
      setReviewError("Choose a rating from 1 to 5 stars.");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");
      setReviewMessage("");

      await apiRequest(`/products/${id}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating,
          comment: reviewComment.trim() || null,
        }),
      });

      setRating(0);
      setReviewComment("");
      setReviewMessage(
        "Review submitted. It will appear publicly after moderation."
      );
    } catch (requestError) {
      setReviewError(
        requestError.message || "Could not submit your review."
      );
    } finally {
      setReviewSubmitting(false);
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

  const images = product.images?.length
    ? product.images
    : [productImage(product)];

  return (
    <div className="product-detail-page">
      <div className="product-breadcrumbs">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/products">Products</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-detail-main">
        <div className="product-gallery">
          <div className="product-thumbnails">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={
                  selectedImage === image
                    ? "thumbnail-button active"
                    : "thumbnail-button"
                }
                onClick={() => setSelectedImage(image)}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>

          <div className="product-main-image">
            <img
              src={selectedImage || productImage(product)}
              alt={product.name}
            />
          </div>
        </div>

        <div className="product-detail-info">
          <p className="product-brand-line">
            {product.category || "Marketplace product"} -{" "}
            <span>
              Sold by {product.vendor?.name || "Marketplace vendor"}
            </span>
          </p>

          <h1>{product.name}</h1>

          <div className="product-rating-line">
            <span className="stars">★</span>
            <strong>{ratingLabel}</strong>
            <span className="verified-copy">
              Moderated customer reviews
            </span>
          </div>

          <div className="product-detail-price">
            {money(product.price)}
          </div>

          <p className="product-stock">
            {product.stock > 0 ? (
              <>
                <span className="stock-dot" /> In stock - {product.stock} available
              </>
            ) : (
              <span className="out-stock">Out of stock</span>
            )}
          </p>

          <p className="product-description">
            {product.description ||
              "No description has been added for this product yet."}
          </p>

          <div className="quantity-row">
            <span>Quantity</span>

            <div className="quantity-control">
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) => Math.max(1, value - 1))
                }
              >
                -
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
              onClick={toggleWishlist}
            >
              {saved ? "\u2665 Saved" : "\u2661 Add to Wishlist"}
            </button>
          </div>

          {actionMessage && (
            <div className="product-action-message">
              {actionMessage}
            </div>
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
                <small>
                  {product.vendor?.name || "Marketplace vendor"}
                </small>
              </p>
            </div>

            <div>
              <span>→</span>
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
              ? `★ ${Number(product.vendor.rating).toFixed(1)} seller rating`
              : "Verified marketplace seller"}
          </p>
        </div>
      </section>

      <section className="product-review-section" id="reviews">
        <div className="review-summary">
          <p className="eyebrow">CUSTOMER REVIEWS</p>

          <div className="review-score">
            <strong>
              {product.reviews?.avgRating
                ? Number(product.reviews.avgRating).toFixed(1)
                : "-"}
            </strong>

            <div>
              <span>★★★★★</span>
              <small>{product.reviews?.count || 0} reviews</small>
            </div>
          </div>

          <form className="review-composer" onSubmit={submitReview}>
            <h3>Write a Review</h3>
            <p>
              Rate this product and share your experience. Reviews are
              moderated before publication.
            </p>

            <div className="review-star-picker" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={value <= rating ? "selected" : ""}
                  aria-label={`${value} star rating`}
                  onClick={() => setRating(value)}
                >
                  {value <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(event) =>
                setReviewComment(event.target.value)
              }
              maxLength="2000"
              placeholder="Share a helpful comment about this product..."
            />

            {reviewError && (
              <div className="review-form-error">{reviewError}</div>
            )}

            {reviewMessage && (
              <div className="review-form-success">
                {reviewMessage}
              </div>
            )}

            <button
              type="submit"
              className="review-submit-button"
              disabled={reviewSubmitting}
            >
              {reviewSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>

        <div className="review-list">
          {reviews.length ? (
            reviews.slice(0, 8).map((review) => (
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
              No approved customer reviews have been published for this
              product yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductDetails;
