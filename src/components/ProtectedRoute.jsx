import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";

function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (roles?.length) {
    const userRoles = (user.roles || []).map((role) =>
      String(role).trim().toLowerCase()
    );

    const allowed = roles.some((role) =>
      userRoles.includes(String(role).trim().toLowerCase())
    );

    if (!allowed) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
