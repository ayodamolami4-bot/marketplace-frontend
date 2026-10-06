import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { apiRequest } from "../../../services/api";
import { productImage } from "../../../utils/productImage";
import "./products.css";

function money(value = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value / 100);
}

function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);

      const params = new URLSearchParams({
        page: "1",
        pageSize: "60",
        sort,
      });

      if (q) params.set("q", q);
      if (category) params.set("category", category);

      const [productResult, categoryResult] = await Promise.allSettled([
        apiRequest(`/products?${params.toString()}`),
        apiRequest("/categories"),
      ]);

      if (!active) return;

      if (productResult.status === "fulfilled") {
        setProducts(productResult.value?.data || []);
        setError("");
      } else {
        setProducts([]);
        setError(
          productResult.reason?.message || "Could not load products."
        );
      }

      if (categoryResult.status === "fulfilled") {
        setCategories(categoryResult.value?.data || []);
      }

      setLoading(false);
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [q, category, sort]);

  useEffect(() => {
    let active = true;

    async function loadWishlist() {
      if (!localStorage.getItem("marketplace_token")) {
        setSavedIds(new Set());
        return;
      }

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

    loadWishlist();

    return () => {
      active = false;
    };
  }, []);

  const title = useMemo(() => {
    if (q) return `Results for "${q}"`;
    if (category) return category;
    return "All Products";
  }, [q, category]);

  function setParam(name, value) {
    const next = new URLSearchParams(searchParams);

    if (value) next.set(name, value);
    else next.delete(name);

    setSearchParams(next);
  }

  async function toggleWishlist(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    if (!localStorage.getItem("marketplace_token")) {
      navigate("/login", {
        state: { from: `/products?${searchParams.toString()}` },
      });
      return;
    }

    try {
      setBusyId(productId);

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

      window.dispatchEvent(new Event("marketplace:wishlist-updated"));
    } catch (requestError) {
      setError(requestError.message || "Could not update wishlist.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="catalog-page">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">MARKETPLACE</p>
          <h1>{title}</h1>
          <p>{loading ? "Loading..." : `${products.length} products found`}</p>
        </div>

        <select
          value={sort}
          onChange={(event) => setParam("sort", event.target.value)}
          className="catalog-sort"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      <div className="catalog-layout">
        <aside className="catalog-filters">
          <div className="filter-block">
            <div className="filter-title">
              <strong>Categories</strong>
              {(category || q) && (
                <button
                  type="button"
                  onClick={() => setSearchParams({ sort })}
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="button"
              className={!category ? "filter-option active" : "filter-option"}
              onClick={() => setParam("category", "")}
            >
              All Products
            </button>

            {categories.map((item) => (
              <button
                type="button"
                key={item.id}
                className={
                  category === item.name
                    ? "filter-option active"
                    : "filter-option"
                }
                onClick={() => setParam("category", item.name)}
              >
                {item.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="catalog-results">
          {error && <div className="form-error">{error}</div>}

          {loading ? (
            <div className="catalog-grid">
              {Array.from({ length: 12 }).map((_, index) => (
                <div className="catalog-skeleton" key={index} />
              ))}
            </div>
          ) : products.length ? (
            <div className="catalog-grid">
              {products.map((product) => {
                const saved = savedIds.has(product.id);

                return (
                  <article className="catalog-card" key={product.id}>
                    <Link
                      to={`/products/${product.id}`}
                      className="catalog-image"
                    >
                      <img src={productImage(product)} alt={product.name} />
                      <span className="catalog-category">
                        {product.category}
                      </span>

                      <button
                        type="button"
                        className={
                          saved
                            ? "catalog-heart saved"
                            : "catalog-heart"
                        }
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

                    <div className="catalog-card-body">
                      <small>
                        {product.vendor?.name || "Marketplace vendor"}
                      </small>

                      <Link to={`/products/${product.id}`}>
                        <h2>{product.name}</h2>
                      </Link>

                      <div className="catalog-rating">
                        <span>★</span>
                        {product.avgRating
                          ? Number(product.avgRating).toFixed(1)
                          : "New"}
                      </div>

                      <div className="catalog-card-bottom">
                        <strong>{money(product.price)}</strong>
                        <Link to={`/products/${product.id}`}>View</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              No products match this search yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Products;
