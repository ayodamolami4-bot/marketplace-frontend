import { NavLink, Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import "./VendorLayout.css";

function VendorLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  return (
    <div className="vendor-app">
      <aside className="vendor-sidebar">
        <div className="vendor-brand">
          MARKET<span>PLACE</span>
          <small>Seller Center</small>
        </div>

        <nav className="vendor-nav">
          <NavLink to="/vendor" end>
            Dashboard
          </NavLink>
          <NavLink to="/vendor/products">Products</NavLink>
          <NavLink to="/vendor/orders">Orders</NavLink>
          <NavLink to="/vendor/finance">Finance & Reports</NavLink>
          <NavLink to="/">View Storefront</NavLink>
        </nav>

        <div className="vendor-sidebar-user">
          <div>{(user?.name || "V").charAt(0).toUpperCase()}</div>
          <span>
            <strong>{user?.name || "Vendor"}</strong>
            <small>{user?.email || ""}</small>
          </span>
        </div>

        <button
          type="button"
          className="vendor-sidebar-logout"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </aside>

      <main className="vendor-main">
        <Outlet />
      </main>
    </div>
  );
}

export default VendorLayout;
