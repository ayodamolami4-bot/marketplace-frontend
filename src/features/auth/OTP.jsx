import "./auth.css";
function OTP() {
  return (
    <div className="auth-page">

      <div className="auth-box">

        <h1>OTP Verification</h1>

        <p>
          Enter the OTP sent to your phone.
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
        />

        <button>
          Verify OTP
        </button>

      </div>

    </div>
  );
}

export default OTP;