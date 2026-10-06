import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";

function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (roles?.length) {
    const userRoles = user?.roles || [];
    const allowed = roles.some((role) => userRoles.includes(role));

    if (!allowed) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
