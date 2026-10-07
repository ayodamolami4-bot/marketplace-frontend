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
  const [validationError, setValidationError] = useState('');

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
    if (!/^(?=.*\p{L})[\p{L}\p{M} .'-]+$/u.test(form.name.trim()) || form.name.trim().length > 150) {
      setValidationError('Enter a name using letters, spaces or name punctuation (up to 150 characters).'); return;
    }
    if (new TextEncoder().encode(form.password).length > 72) { setValidationError('Password must be at most 72 UTF-8 bytes.'); return; }
    setValidationError('');
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
          {validationError && <div className="form-error" role="alert">{validationError}</div>}

          <label>
            Full name
            <input
              name="name"
              maxLength={150}
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
              maxLength={320}
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
