import { Link } from "react-router";
import "./auth.css";


function Signup() {
  return (
    <div className="auth-page">

      <div className="auth-box">

        <h1>Create Account</h1>

        <input
          type="text"
          placeholder="Full name"
        />

        <input
          type="email"
          placeholder="Email"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button>
          Sign Up
        </button>

        <p>
          Already have an account?
        </p>

        <Link to="/login">
          Login
        </Link>

      </div>

    </div>
  );
}

export default Signup;