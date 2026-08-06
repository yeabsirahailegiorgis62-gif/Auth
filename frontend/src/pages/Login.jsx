import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import useForm from "../hooks/useForm";
import { ShieldAlert, Mail, Lock, Sparkles, RefreshCw, ArrowRight } from "lucide-react";

export default function Login() {
  const { user, login, resendVerification, error, setError } = useAuth();
  const navigate = useNavigate();
  const { values, handleChange } = useForm({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Countdown timer effect for lockout
  useEffect(() => {
    if (remainingSeconds > 0) {
      const timer = setTimeout(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (remainingSeconds === 0 && lockedUntil) {
      setLockedUntil(null);
    }
  }, [remainingSeconds, lockedUntil]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${minutes}m ${remainingSecs}s`;
  };

  useEffect(() => {
    setError(null);
  }, [setError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setLockedUntil(null);
    setRemainingSeconds(0);
    setRequiresVerification(false);
    setResendStatus(null);

    try {
      await login({ email: values.email, password: values.password });
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 429) {
        setLockedUntil(
          new Date(Date.now() + err.response.data.remainingSeconds * 1000)
        );
        setRemainingSeconds(err.response.data.remainingSeconds);
        setError(err.response.data.message);
      } else if (err.response?.status === 403 && err.response.data?.requiresVerification) {
        setRequiresVerification(true);
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message ?? "Unable to login.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!values.email) return;
    setResendLoading(true);
    setResendStatus(null);
    try {
      const data = await resendVerification(values.email);
      setResendStatus({ type: "success", text: data.message });
    } catch (err) {
      setResendStatus({
        type: "error",
        text: err.response?.data?.message || "Failed to resend verification link.",
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`;
  };

  useEffect(() => {
    setError(null);
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "google_auth_failed") {
      setError("Google sign in failed. Please try again.");
    }
  }, [setError]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-32 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>

        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              NexusDocs Studio
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              Welcome Back
            </h1>
            <p className="text-xs text-slate-400">
              Sign in to access your collaborative document workstation
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p>{error}</p>
                  {remainingSeconds > 0 && (
                    <p className="font-semibold text-amber-400 mt-1">
                      Account locked. Try again in {formatTime(remainingSeconds)}.
                    </p>
                  )}
                </div>
              </div>

              {requiresVerification && (
                <div className="pt-2 border-t border-red-500/20 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="w-full py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {resendLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Resend Verification Link
                  </button>
                  {resendStatus && (
                    <p className={`text-[11px] font-semibold ${resendStatus.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                      {resendStatus.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-3 shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px bg-slate-800 flex-1"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                or sign in with email
              </span>
              <div className="h-px bg-slate-800 flex-1"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={values.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={values.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
            </form>
          </div>

          <div className="text-center pt-2 border-t border-slate-800/60">
            <p className="text-xs text-slate-400">
              Don't have an enterprise account?{" "}
              <Link
                to="/register"
                className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
