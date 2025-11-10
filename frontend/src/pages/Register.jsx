import { useState } from "react";
import { registerUser, verifyEmail } from "../api/api";
import { useNavigate } from "react-router-dom";

function Register() {
  const [step, setStep] = useState("register"); // "register" → "verify"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Step 1: Send OTP via /auth/register
  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await registerUser(username, email, password);
      alert("OTP sent to your email! Please verify.");
      setStep("verify");
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  // Step 2: Verify OTP via /auth/verify-email
  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyEmail(email, otp);
      alert("Email verified successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.detail || "OTP verification failed!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={step === "register" ? handleRegister : handleVerify}
        className="w-full max-w-sm mx-auto p-8 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {step === "register" ? "Register" : "Verify Email"}
        </h2>

        {step === "register" && (
          <>
            <input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 mb-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mb-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mb-6 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </>
        )}

        {step === "verify" && (
          <>
            <p className="text-center text-gray-600 mb-4">
              Enter the OTP sent to <strong>{email}</strong>
            </p>
            <input
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 mb-6 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          {loading
            ? "Processing..."
            : step === "register"
            ? "Send OTP"
            : "Verify Email"}
        </button>

        {step === "verify" && (
          <button
            type="button"
            disabled={loading}
            onClick={handleRegister}
            className="mt-4 w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Resend OTP
          </button>
        )}
      </form>
    </div>
  );
}

export default Register;
