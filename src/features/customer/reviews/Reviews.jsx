import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../../../services/api";
import { productImage } from "../../../utils/productImage";
import "./reviews.css";

function Reviews() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);

        const response = await apiRequest(
          "/products?page=1&pageSize=12&sort=newest"
        );

        if (!active) return;

        setProducts(response?.data || []);
        setError("");
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError.message || "Could not load products to review."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="reviews-page">
      <div className="reviews-heading">
        <div>
          <p className="eyebrow">YOUR FEEDBACK</p>
          <h1>Review Products</h1>
          <p>
            Open a product to leave a 1 to 5 star rating and optional
            comment. Submitted reviews are moderated before publication.
          </p>
        </div>

        <Link to="/orders">View Orders</Link>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div className="reviews-state">Loading products...</div>
      ) : products.length ? (
        <section className="review-product-grid">
          {products.map((product) => (
            <article className="review-product-card" key={product.id}>
              <Link
                to={`/products/${product.id}#reviews`}
                className="review-product-image"
              >
                <img src={productImage(product)} alt={product.name} />
              </Link>

              <div>
                <small>
                  {product.vendor?.name || "Marketplace vendor"}
                </small>
                <h2>{product.name}</h2>
                <span>
                  {product.avgRating
                    ? `★ ${Number(product.avgRating).toFixed(1)}`
                    : "No ratings yet"}
                </span>
                <Link to={`/products/${product.id}#reviews`}>
                  Write a Review
                </Link>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <div className="reviews-empty">
          <h2>No products available</h2>
          <p>Products will appear here when they are published.</p>
          <Link to="/products">Browse Marketplace</Link>
        </div>
      )}
    </main>
  );
}

export default Reviews;
