import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { apiRequest } from "../../../services/api";
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
    query: "Home",
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
    name: "Health",
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=500&q=80",
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
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadHome() {
      try {
        setLoading(true);
        const [productResponse, categoryResponse] = await Promise.all([
          apiRequest("/products?page=1&pageSize=6&sort=newest"),
          apiRequest("/categories"),
        ]);

        if (!active) return;

        setProducts(productResponse?.data || []);
        setCategories(categoryResponse?.data || []);
        setError("");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || "Could not load marketplace");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHome();

    return () => {
      active = false;
    };
  }, []);

  const visibleCategories = useMemo(() => {
    if (!categories.length) return categoryVisuals;

    return categoryVisuals.map((visual) => {
      const match = categories.find(
        (category) =>
          category.name?.toLowerCase() ===
          (visual.query || visual.name).toLowerCase()
      );

      return {
        ...visual,
        query: match?.name || visual.query || visual.name,
      };
    });
  }, [categories]);

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
            <small>Safe transactions</small>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">✓</span>
          <div>
            <strong>Verified Vendors</strong>
            <small>Trusted sellers</small>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">⌁</span>
          <div>
            <strong>Fast Delivery</strong>
            <small>Across Nigeria</small>
          </div>
        </div>

        <div className="trust-item">
          <span className="trust-icon">↻</span>
          <div>
            <strong>Easy Returns</strong>
            <small>Hassle-free support</small>
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
              to={`/products?category=${encodeURIComponent(
                category.query || category.name
              )}`}
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
              <span>•••</span>
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
            {products.map((product) => (
              <article className="home-product-card" key={product.id}>
                <Link
                  to={`/products/${product.id}`}
                  className="home-product-image"
                >
                  {product.thumbnail ? (
                    <img src={product.thumbnail} alt={product.name} />
                  ) : (
                    <div className="image-fallback">No image</div>
                  )}

                  <button
                    type="button"
                    className="heart-button"
                    aria-label={`Save ${product.name}`}
                    onClick={(event) => event.preventDefault()}
                  >
                    ♡
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
                    <span>★ {product.avgRating?.toFixed?.(1) || "New"}</span>
                    <small>{product.vendor?.name || "Marketplace vendor"}</small>
                  </div>

                  <Link
                    to={`/products/${product.id}`}
                    className="add-cart-link"
                  >
                    Add to Cart
                  </Link>
                </div>
              </article>
            ))}
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
