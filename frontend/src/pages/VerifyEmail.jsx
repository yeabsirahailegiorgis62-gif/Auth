import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck, Mail } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing from URL.");
      return;
    }

    const runVerification = async () => {
      try {
        const data = await verifyEmail(token);
        setStatus("success");
        setMessage(data.message || "Your email address has been verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Invalid or expired verification link. Please request a new verification email."
        );
      }
    };

    runVerification();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    setResendMessage(null);
    try {
      const data = await resendVerification(resendEmail);
      setResendMessage({ type: "success", text: data.message });
    } catch (err) {
      setResendMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to resend verification email.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-32 relative">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>

        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-white">Email Verification</h2>

          {status === "verifying" && (
            <div className="py-6 space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm text-slate-300">Verifying your account token with NexusDocs Studio...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm flex items-center gap-3 text-left">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                <span>{message}</span>
              </div>
              <Link
                to="/login"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                Proceed to Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>

              {/* Resend Verification Form */}
              <form onSubmit={handleResend} className="space-y-3 text-left">
                <label className="block text-xs font-semibold text-slate-300">
                  Resend Verification Link
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resendLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resendLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Resend Verification Email
                </button>
              </form>

              {resendMessage && (
                <div
                  className={`p-3 rounded-xl text-xs text-left ${
                    resendMessage.type === "success"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-300 border border-red-500/20"
                  }`}
                >
                  {resendMessage.text}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
