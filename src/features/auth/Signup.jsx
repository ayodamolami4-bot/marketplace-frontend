import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthError, signupUser } from "./authSlice";
import "./auth.css";

function Signup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(signupUser(form));
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <Link to="/" className="auth-brand">
          MARKET<span>PLACE</span>
        </Link>

        <div className="auth-copy">
          <p className="eyebrow">CREATE YOUR ACCOUNT</p>
          <h1>One account for shopping and selling.</h1>
          <p>
            Every account starts as a customer. Approved sellers unlock the
            vendor workspace on the same login.
          </p>
        </div>

        <form className="auth-card" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">GET STARTED</p>
            <h2>Create account</h2>
          </div>

          {error && <div className="form-error">{error}</div>}

          <label>
            Full name
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              placeholder="Your full name"
              required
            />
          </label>

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
              minLength="8"
              value={form.password}
              onChange={updateField}
              placeholder="At least 8 characters"
              required
            />
          </label>

          <button className="primary-button" disabled={status === "loading"}>
            {status === "loading" ? "Creating account..." : "Create account"}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
