import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import "./products.css";


const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 45000,
    category: "Electronics",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 35000,
    category: "Electronics",
    rating: 4.6,
  },
  {
    id: 3,
    name: "Premium Sneakers",
    price: 55000,
    category: "Fashion",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Travel Backpack",
    price: 30000,
    category: "Fashion",
    rating: 4.7,
  },
];

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchText, setSearchText] = useState(
    searchParams.get("search") || ""
  );

  useEffect(() => {
    setSearchText(searchParams.get("search") || "");
  }, [searchParams]);

  function handleSearch(event) {
    const value = event.target.value;

    setSearchText(value);

    if (value.trim() === "") {
      setSearchParams({});
    } else {
      setSearchParams({
        search: value,
      });
    }
  }

  function clearSearch() {
    setSearchText("");
    setSearchParams({});
  }

  const filteredProducts = products.filter((product) => {
    const search = searchText.toLowerCase();

    return (
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search)
    );
  });

  return (
    <div className="products-page">

      <section className="hero-section">

        <div className="hero-content">

          <p className="hero-small">
            WELCOME TO MARKETPLACE
          </p>

          <h1>
            Shop smarter.
            <br />
            Live better.
          </h1>

          <p>
            Find quality products at great prices and enjoy a simple
            shopping experience.
          </p>

          <Link to="/products" className="hero-button">
            Shop Now
          </Link>

        </div>

        <div className="hero-design">

          <div className="hero-circle"></div>

          <div className="hero-box">
            🛍️
          </div>

        </div>

      </section>

      <section className="search-section">

        <div className="search-container">

          <input
            type="text"
            placeholder="Search products..."
            value={searchText}
            onChange={handleSearch}
          />

          <button type="button">
            Search
          </button>

        </div>

      </section>

      <section className="category-section">

        <h2>Shop by Category</h2>

        <p>Find what you need quickly.</p>

        <div className="category-list">

          <button onClick={clearSearch}>
            All
          </button>

          <button
            onClick={() =>
              setSearchParams({ search: "Electronics" })
            }
          >
            Electronics
          </button>

          <button
            onClick={() =>
              setSearchParams({ search: "Fashion" })
            }
          >
            Fashion
          </button>

          <button
            onClick={() =>
              setSearchParams({ search: "Beauty" })
            }
          >
            Beauty
          </button>

          <button
            onClick={() =>
              setSearchParams({ search: "Home" })
            }
          >
            Home
          </button>

        </div>

      </section>

      <section className="products-section">

        <div className="section-heading">

          <div>

            <h2>
              {searchText
                ? `Search results for "${searchText}"`
                : "Popular Products"}
            </h2>

            <p>
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
            </p>

          </div>

        </div>

        {filteredProducts.length > 0 ? (

          <div className="product-grid">

            {filteredProducts.map((product) => (

              <div
                className="product-card"
                key={product.id}
              >

                <div className="product-image">

                  <span className="product-placeholder">
                    🛍️
                  </span>

                  <span className="product-badge">
                    Popular
                  </span>

                  <button className="wishlist-button">
                    ♡
                  </button>

                </div>

                <div className="product-content">

                  <p className="product-category">
                    {product.category}
                  </p>

                  <h2>
                    {product.name}
                  </h2>

                  <div className="rating">
                    ★ {product.rating}
                  </div>

                  <div className="product-bottom">

                    <p className="product-price">
                      ₦{product.price.toLocaleString()}
                    </p>

                    <Link
                      to={`/products/${product.id}`}
                      className="product-button"
                    >
                      View
                    </Link>

                  </div>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="no-products">

            <h2>
              No products found
            </h2>

            <p>
              Try searching for another product.
            </p>

            <button onClick={clearSearch}>
              Show All Products
            </button>

          </div>

        )}

      </section>

    </div>
  );
}

export default Products;