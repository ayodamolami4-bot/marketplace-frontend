import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { apiRequest } from "../services/api";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [searchText, setSearchText] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);

  const roles = useMemo(
    () =>
      (user?.roles || []).map((role) =>
        String(role).trim().toLowerCase()
      ),
    [user]
  );

  const isVendor = roles.includes("vendor");
  const isAdmin = roles.includes("admin");

  useEffect(() => {
    let active = true;

    async function loadCounters() {
      if (!user) {
        if (active) {
          setCartCount(0);
          setWishlistCount(0);
          setNotificationCount(0);
        }
        return;
      }

      const [cartResult, wishlistResult, notificationResult] =
        await Promise.allSettled([
          apiRequest("/cart"),
          apiRequest("/wishlist"),
          apiRequest("/notifications/unread"),
        ]);

      if (!active) return;

      if (cartResult.status === "fulfilled") {
        const count = (cartResult.value?.items || []).reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        );
        setCartCount(count);
      }

      if (wishlistResult.status === "fulfilled") {
        setWishlistCount(wishlistResult.value?.data?.length || 0);
      }

      if (notificationResult.status === "fulfilled") {
        setNotificationCount(notificationResult.value?.data?.length || 0);
      }
    }

    loadCounters();

    function refreshCounters() {
      loadCounters();
    }

    window.addEventListener("marketplace:cart-updated", refreshCounters);
    window.addEventListener("marketplace:wishlist-updated", refreshCounters);
    window.addEventListener(
      "marketplace:notifications-updated",
      refreshCounters
    );

    return () => {
      active = false;
      window.removeEventListener(
        "marketplace:cart-updated",
        refreshCounters
      );
      window.removeEventListener(
        "marketplace:wishlist-updated",
        refreshCounters
      );
      window.removeEventListener(
        "marketplace:notifications-updated",
        refreshCounters
      );
    };
  }, [user, location.pathname]);

  function handleSearch(event) {
    event.preventDefault();
    const value = searchText.trim();

    navigate(
      value ? `/products?q=${encodeURIComponent(value)}` : "/products"
    );
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
            aria-label="Search marketplace"
          />
          <button type="submit">Search</button>
        </form>

        <nav className="header-actions" aria-label="Account navigation">
          {user ? (
            <>
              {isAdmin && <Link to="/admin">Admin</Link>}
              {isVendor && <Link to="/vendor">Seller Center</Link>}
              {!isVendor && !isAdmin && <Link to="/sell">Sell</Link>}

              <Link to="/orders">Orders</Link>

              <Link to="/notifications" className="header-action-link">
                Notifications
                {notificationCount > 0 && (
                  <span className="nav-counter">
                    {notificationCount}
                  </span>
                )}
              </Link>

              <Link to="/wishlist" className="header-action-link">
                Wishlist
                {wishlistCount > 0 && (
                  <span className="nav-counter">{wishlistCount}</span>
                )}
              </Link>

              <Link to="/cart" className="header-action-link">
                Cart
                {cartCount > 0 && (
                  <span className="nav-counter">{cartCount}</span>
                )}
              </Link>

              <button
                type="button"
                className="header-link-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="join-link">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="category-nav">
        <Link to="/products">All Products</Link>
        <Link to="/products?category=Electronics">Electronics</Link>
        <Link to="/products?category=Fashion">Fashion</Link>
        <Link to="/products?category=Home%20%26%20Living">
          Home & Living
        </Link>
        <Link to="/products?category=Beauty">Beauty</Link>
        <Link to="/products?category=Groceries">Groceries</Link>
        <Link to="/products?category=Sports">Sports</Link>
      </div>
    </header>
  );
}

export default Navbar;
