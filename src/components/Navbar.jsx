import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [searchText, setSearchText] = useState("");

  function handleSearch(event) {
    event.preventDefault();
    const value = searchText.trim();

    navigate(value ? `/products?q=${encodeURIComponent(value)}` : "/products");
  }

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  return (
    <header className="site-header">
      <div className="header-top">
        <Link to="/" className="brand">
          MARKET<span>PLACE</span>
        </Link>

        <form className="header-search" onSubmit={handleSearch}>
          <input
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search products, brands and categories"
          />
          <button type="submit">Search</button>
        </form>

        <nav className="header-actions">
          {user ? (
            <>
              {user.roles?.includes("VENDOR") && (
                <Link to="/vendor">Vendor</Link>
              )}
              {user.roles?.includes("ADMIN") && (
                <Link to="/admin">Admin</Link>
              )}
              <Link to="/orders">Orders</Link>
              <Link to="/wishlist" aria-label="Wishlist">♡</Link>
              <Link to="/cart" aria-label="Cart">Cart</Link>
              <button className="header-link-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="join-link">Create account</Link>
            </>
          )}
        </nav>
      </div>

      <div className="category-nav">
        <Link to="/products">All Products</Link>
        <Link to="/products?category=Electronics">Electronics</Link>
        <Link to="/products?category=Fashion">Fashion</Link>
        <Link to="/products?category=Home">Home & Living</Link>
        <Link to="/products?category=Beauty">Beauty</Link>
        <Link to="/products?category=Sports">Sports</Link>
      </div>
    </header>
  );
}

export default Navbar;
