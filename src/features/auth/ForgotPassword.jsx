import "./auth.css";
function ForgotPassword() {
  return (
    <div className="auth-page">

      <div className="auth-box">

        <h1>Forgot Password</h1>

        <p>
          Enter your email to reset your password.
        </p>

        <input
          type="email"
          placeholder="Email"
        />

        <button>
          Send Reset Link
        </button>

      </div>

    </div>
  );
}

export default ForgotPassword;