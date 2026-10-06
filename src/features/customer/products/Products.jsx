import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: "1",
          pageSize: "60",
          sort,
        });

        if (q) params.set("q", q);
        if (category) params.set("category", category);

        const [productResponse, categoryResponse] = await Promise.all([
          apiRequest(`/products?${params.toString()}`),
          apiRequest("/categories"),
        ]);

        if (!active) return;

        setProducts(productResponse?.data || []);
        setCategories(categoryResponse?.data || []);
        setError("");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || "Could not load products.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, [q, category, sort]);

  const title = useMemo(() => {
    if (q) return `Results for “${q}”`;
    if (category) return category;
    return "All Products";
  }, [q, category]);

  function setParam(name, value) {
    const next = new URLSearchParams(searchParams);

    if (value) next.set(name, value);
    else next.delete(name);

    setSearchParams(next);
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
              {products.map((product) => (
                <article className="catalog-card" key={product.id}>
                  <Link
                    to={`/products/${product.id}`}
                    className="catalog-image"
                  >
                    <img src={productImage(product)} alt={product.name} />
                    <span className="catalog-category">{product.category}</span>
                    <button
                      type="button"
                      className="catalog-heart"
                      aria-label={`Save ${product.name}`}
                      onClick={(event) => event.preventDefault()}
                    >
                      ♡
                    </button>
                  </Link>

                  <div className="catalog-card-body">
                    <small>{product.vendor?.name || "Marketplace vendor"}</small>

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
              ))}
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
