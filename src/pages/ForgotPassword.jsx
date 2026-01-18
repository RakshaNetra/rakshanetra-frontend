import { useState } from "react";
import { forgotPassword } from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage("OTP sent to your email.");
      setTimeout(() => navigate("/reset-password", { state: { email } }), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f0f] via-black to-[#1a1a1a] text-white font-sans p-4">
      <div className="w-full max-w-md px-8 py-10 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-4">
          Forgot Password
        </h2>
        <p className="text-center text-gray-400 mb-8 text-sm">
          Enter your email to receive a password reset OTP.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 text-white rounded-lg border border-white/10 focus:outline-none focus:border-cyan-500 transition-colors"
            required
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
              {message}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-white transition"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
