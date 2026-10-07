import { NavLink, Outlet, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import "./AdminLayout.css";

function AdminLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  function handleLogout() {
    dispatch(logout());
    navigate("/");
  }

  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          MARKET<span>PLACE</span>
          <small>Admin Console</small>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end>
            Overview
          </NavLink>
          <NavLink to="/admin/users">Users</NavLink>
          <NavLink to="/admin/vendors">Vendors</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/reviews">Reviews</NavLink>
          <NavLink to="/admin/notifications">Notifications</NavLink>
          <NavLink to="/">Marketplace</NavLink>
        </nav>

        <div className="admin-sidebar-user">
          <div>{(user?.name || "A").charAt(0).toUpperCase()}</div>
          <span>
            <strong>{user?.name || "Administrator"}</strong>
            <small>{user?.email || ""}</small>
          </span>
        </div>

        <button
          type="button"
          className="admin-sidebar-logout"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
