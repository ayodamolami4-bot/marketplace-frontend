import { Link } from "react-router";
import "./auth.css";


function Login() {
  return (
    <div className="auth-page">

      <div className="auth-box">

        <h1>Login</h1>

        <input
          type="email"
          placeholder="Email"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button>
          Login
        </button>

        <Link to="/forgot-password">
          Forgot password?
        </Link>

        <p>
          Don't have an account?
        </p>

        <Link to="/signup">
          Create account
        </Link>

      </div>

    </div>
  );
}

export default Login;