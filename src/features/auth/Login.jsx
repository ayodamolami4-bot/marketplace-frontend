import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, loginUser } from "./authSlice";
import "./auth.css";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { status, error, token, user } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const expired = useMemo(
    () => searchParams.get("expired") === "1",
    [searchParams]
  );

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (!token || !user) return;

    const requested = location.state?.from;

    if (requested) {
      navigate(requested, { replace: true });
      return;
    }

    const roles = (user.roles || []).map((role) =>
      String(role).trim().toLowerCase()
    );

    if (roles.includes("admin")) {
      navigate("/admin", { replace: true });
      return;
    }

    if (roles.includes("vendor")) {
      navigate("/vendor", { replace: true });
      return;
    }

    navigate("/", { replace: true });
  }, [token, user, navigate, location.state]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(loginUser(form));
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <Link to="/" className="auth-brand">
          MARKET<span>PLACE</span>
        </Link>

        <div className="auth-copy">
          <p className="eyebrow">WELCOME BACK</p>
          <h1>Sign in to continue shopping.</h1>
          <p>
            Access your cart, orders, wishlist and marketplace account.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">ACCOUNT ACCESS</p>
            <h2>Login</h2>
          </div>

          {expired && (
            <div className="form-error">
              Your session expired. Sign in again to continue.
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="Enter your password"
              required
            />
          </label>

          <button className="primary-button" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Login"}
          </button>

          <p className="auth-switch">
            New to Marketplace? <Link to="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
