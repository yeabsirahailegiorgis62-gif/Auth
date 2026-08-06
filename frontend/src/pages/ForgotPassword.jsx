import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { KeyRound, Mail, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to process password reset request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-32 relative">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
            <p className="text-xs text-slate-400">
              Enter your account email to receive reset instructions
            </p>
          </div>

          {message ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{message}</span>
              </div>
              <Link
                to="/login"
                className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                Send Reset Link
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
