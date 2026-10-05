import { useState } from "react";
import { Link, useNavigate } from "react-router";
import "./Navbar.css";

function Navbar() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  function handleSearch(event) {
    event.preventDefault();

    if (searchText.trim() === "") {
      navigate("/products");
      return;
    }

    navigate(`/products?search=${encodeURIComponent(searchText)}`);
  }

  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        Market<span>Place</span>
      </Link>

      <form className="search-box" onSubmit={handleSearch}>

        <input
          type="text"
          placeholder="Search products..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <button type="submit">
          Search
        </button>

      </form>

      <div className="nav-links">

        <Link to="/products">
          Shop
        </Link>

        <Link to="/wishlist">
          ♡
        </Link>

        <Link to="/cart">
          🛒
        </Link>

        <Link to="/orders">
          Orders
        </Link>

        <Link to="/login" className="login-link">
          Login
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;