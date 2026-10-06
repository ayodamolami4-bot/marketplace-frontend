import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { apiRequest } from "../../../services/api";
import { productImage } from "../../../utils/productImage";
import "./home.css";

const categoryVisuals = [
  {
    name: "Electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Fashion",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Home & Living",
    image:
      "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Beauty",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Groceries",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Sports",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=80",
  },
];

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function Home() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHome() {
      setLoading(true);

      const [productResult, categoryResult] = await Promise.allSettled([
        apiRequest("/products?page=1&pageSize=6&sort=newest"),
        apiRequest("/categories"),
      ]);

      if (!active) return;

      if (productResult.status === "fulfilled") {
        setProducts(productResult.value?.data || []);
        setError("");
      } else {
        setError(productResult.reason?.message || "Could not load products.");
      }

      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value?.data || []);
      }

      setLoading(false);
    }

    async function loadWishlist() {
      if (!localStorage.getItem("marketplace_token")) return;

      try {
        const response = await apiRequest("/wishlist");
        if (!active) return;

        setSavedIds(
          new Set((response?.data || []).map((item) => item.productId))
        );
      } catch {
        // Authentication handling is centralized in apiRequest.
      }
    }

    loadHome();
    loadWishlist();

    return () => {
      active = false;
    };
  }, []);

  const visibleCategories = useMemo(() => {
    if (!categories.length) return categoryVisuals;

    return categoryVisuals.filter((visual) =>
      categories.some(
        (category) =>
          String(category.name).toLowerCase() === visual.name.toLowerCase()
      )
    );
  }, [categories]);

  function requireLogin(from = "/") {
    if (localStorage.getItem("marketplace_token")) {
      return true;
    }

    navigate("/login", { state: { from } });
    return false;
  }

  async function toggleWishlist(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    if (!requireLogin("/")) return;

    try {
      setBusyId(productId);
      setNotice("");

      const saved = savedIds.has(productId);

      if (saved) {
        await apiRequest(`/wishlist/${productId}`, { method: "DELETE" });
      } else {
        await apiRequest("/wishlist", {
          method: "POST",
          body: JSON.stringify({ productId }),
        });
      }

      setSavedIds((current) => {
        const next = new Set(current);

        if (saved) next.delete(productId);
        else next.add(productId);

        return next;
      });

      setNotice(saved ? "Removed from wishlist." : "Saved to wishlist.");
      window.dispatchEvent(new Event("marketplace:wishlist-updated"));
    } catch (requestError) {
      setNotice(requestError.message || "Could not update wishlist.");
    } finally {
      setBusyId("");
    }
  }

  async function addToCart(productId) {
    if (!requireLogin("/")) return;

    try {
      setBusyId(productId);
      setNotice("");

      await apiRequest("/cart/items", {
        method: "POST",
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      setNotice("Product added to cart.");
      window.dispatchEvent(new Event("marketplace:cart-updated"));
    } catch (requestError) {
      setNotice(requestError.message || "Could not add product to cart.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="market-home">
      <section className="market-hero">
        <div className="market-hero-media" aria-hidden="true" />

        <div className="market-hero-copy">
          <p className="market-hero-kicker">
            QUALITY PRODUCTS, FROM VERIFIED SELLERS
          </p>

          <h1>
            Everything You Need
            <br />
            All in One Place
          </h1>

          <p className="market-hero-description">
            Shop from multiple vendors, compare products and get the best deals
            across Nigeria.
          </p>

          <Link to="/products" className="market-hero-button">
            Shop Now <span>→</span>
          </Link>
        </div>
      </section>

      <section className="trust-strip" aria-label="Marketplace benefits">
        <div className="trust-item">
          <span className="trust-icon">✓</span>
          <div>
            <strong>Secure Payments</strong>
            <small>Protected checkout</small>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">✓</span>
          <div>
            <strong>Verified Vendors</strong>
            <small>Approved sellers</small>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">→</span>
          <div>
            <strong>Order Tracking</strong>
            <small>Follow fulfillment</small>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">✓</span>
          <div>
            <strong>Multiple Sellers</strong>
            <small>One marketplace account</small>
          </div>
        </div>
      </section>

      <section className="market-section">
        <div className="market-section-heading">
          <h2>Shop by Category</h2>
          <Link to="/products">View All →</Link>
        </div>

        <div className="category-showcase">
          {visibleCategories.map((category) => (
            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(category.name)}`}
              className="category-tile"
            >
              <div className="category-image-wrap">
                <img src={category.image} alt="" />
              </div>
              <span>{category.name}</span>
            </Link>
          ))}

          <Link to="/products" className="category-tile category-more">
            <div className="category-image-wrap category-more-circle">
              <span>...</span>
            </div>
            <span>More</span>
          </Link>
        </div>
      </section>

      <section className="market-section market-featured">
        <div className="market-section-heading">
          <h2>Featured Products</h2>
          <Link to="/products">View All →</Link>
        </div>

        {notice && <div className="market-action-notice">{notice}</div>}

        {loading ? (
          <div className="home-product-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <div className="product-skeleton" key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="empty-state">{error}</div>
        ) : products.length ? (
          <div className="home-product-grid">
            {products.map((product) => {
              const saved = savedIds.has(product.id);

              return (
                <article className="home-product-card" key={product.id}>
                  <Link
                    to={`/products/${product.id}`}
                    className="home-product-image"
                  >
                    <img src={productImage(product)} alt={product.name} />

                    <button
                      type="button"
                      className={saved ? "heart-button saved" : "heart-button"}
                      aria-label={
                        saved
                          ? `Remove ${product.name} from wishlist`
                          : `Save ${product.name} to wishlist`
                      }
                      disabled={busyId === product.id}
                      onClick={(event) =>
                        toggleWishlist(event, product.id)
                      }
                    >
                      {saved ? "\u2665" : "\u2661"}
                    </button>
                  </Link>

                  <div className="home-product-body">
                    <Link
                      to={`/products/${product.id}`}
                      className="home-product-name"
                    >
                      {product.name}
                    </Link>

                    <strong className="home-product-price">
                      {money(product.price)}
                    </strong>

                    <div className="home-product-meta">
                      <span>
                        ★{" "}
                        {product.avgRating
                          ? Number(product.avgRating).toFixed(1)
                          : "New"}
                      </span>
                      <small>
                        {product.vendor?.name || "Marketplace vendor"}
                      </small>
                    </div>

                    <button
                      type="button"
                      className="add-cart-link"
                      disabled={busyId === product.id}
                      onClick={() => addToCart(product.id)}
                    >
                      {busyId === product.id ? "Working..." : "Add to Cart"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            No products have been published yet.
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
