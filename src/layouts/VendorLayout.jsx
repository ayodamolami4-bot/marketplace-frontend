import { NavLink, Outlet } from "react-router";
import { useSelector } from "react-redux";
import "./VendorLayout.css";

function VendorLayout() {
  const { user } = useSelector((state) => state.auth);

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
          <NavLink to="/vendor/products">
            Products
          </NavLink>
          <NavLink to="/vendor/orders">
            Orders
          </NavLink>
          <NavLink to="/vendor/finance">
            Finance & Reports
          </NavLink>
          <NavLink to="/">
            View Storefront
          </NavLink>
        </nav>

        <div className="vendor-sidebar-user">
          <div>{(user?.name || "V").charAt(0).toUpperCase()}</div>
          <span>
            <strong>{user?.name || "Vendor"}</strong>
            <small>{user?.email || ""}</small>
          </span>
        </div>
      </aside>

      <main className="vendor-main">
        <Outlet />
      </main>
    </div>
  );
}

export default VendorLayout;
