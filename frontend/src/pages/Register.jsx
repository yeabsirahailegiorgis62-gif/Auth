import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useForm from "../hooks/useForm";
import { ShieldCheck, Mail, Lock, User, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";

const passwordRules = [
  { label: "At least 8 characters", test: (value) => value.length >= 8 },
  { label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "One number", test: (value) => /[0-9]/.test(value) },
  {
    label: "One special character",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

export default function Register() {
  const { user, register, resendVerification, error, message, setError, setMessage } = useAuth();
  const navigate = useNavigate();
  const { values, handleChange } = useForm({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [verificationPending, setVerificationPending] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [resendStatus, setResendStatus] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    setError(null);
    setMessage(null);
  }, [setError, setMessage]);

  const passwordChecks = passwordRules.map((rule) => ({
    ...rule,
    passed: rule.test(values.password),
  }));

  const passwordStrength = passwordChecks.filter((rule) => rule.passed).length;
  const strengthLabel =
    passwordStrength <= 2
      ? "Weak"
      : passwordStrength <= 4
        ? "Medium"
        : "Strong";

  const validateForm = () => {
    const errors = {};
    if (!values.name.trim()) errors.name = "Your full name is required.";
    if (!values.email.trim()) errors.email = "A valid email address is required.";

    const isPasswordValid = passwordChecks.every((rule) => rule.passed);
    if (!values.password) {
      errors.password = "Password is required.";
    } else if (!isPasswordValid || /\s/.test(values.password)) {
      errors.password =
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.";
    }

    if (values.confirmPassword !== values.password)
      errors.confirmPassword = "Passwords must match.";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (response.data?.requiresVerification) {
        setVerificationPending(true);
        setPendingEmail(values.email);
      } else if (response.data?.accessToken) {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Unable to complete registration. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResendLoading(true);
    setResendStatus(null);
    try {
      const data = await resendVerification(pendingEmail);
      setResendStatus({ type: "success", text: data.message });
    } catch (err) {
      setResendStatus({
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
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none -z-10"></div>

        <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          {verificationPending ? (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/20">
                <Mail className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-white">
                  Check Your Email
                </h2>
                <p className="text-xs text-slate-300">
                  We've sent a verification link to{" "}
                  <span className="font-semibold text-indigo-400">{pendingEmail}</span>.
                </p>
                <p className="text-xs text-slate-400">
                  Please click the link in your email to activate your account before logging in.
                </p>
              </div>

              {resendStatus && (
                <div
                  className={`p-3 rounded-xl text-xs text-left ${
                    resendStatus.type === "success"
                      ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-300 border border-red-500/20"
                  }`}
                >
                  {resendStatus.text}
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50"
                >
                  {resendLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Resend Verification Link
                </button>
                <Link
                  to="/login"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  Proceed to Sign In
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  Get Started Free
                </span>
                <h1 className="text-2xl font-extrabold text-white">
                  Create Enterprise Account
                </h1>
                <p className="text-xs text-slate-400">
                  Join thousands of teams collaborating in real-time
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={values.name}
                      onChange={handleChange}
                      placeholder="Yeabsira Hailegiorgis"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {validationErrors.name && (
                    <p className="text-[11px] text-red-400">{validationErrors.name}</p>
                  )}
                </div>

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
                  {validationErrors.email && (
                    <p className="text-[11px] text-red-400">{validationErrors.email}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      value={values.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {validationErrors.password && (
                    <p className="text-[11px] text-red-400">{validationErrors.password}</p>
                  )}
                </div>

                {/* Password Strength Card */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">Password Strength:</span>
                    <span className={`font-bold ${passwordStrength >= 4 ? "text-emerald-400" : passwordStrength >= 3 ? "text-amber-400" : "text-red-400"}`}>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                    {passwordChecks.map((rule) => (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        <span className={rule.passed ? "text-emerald-400 font-bold" : "text-slate-600"}>
                          {rule.passed ? "✓" : "○"}
                        </span>
                        <span className={rule.passed ? "text-slate-200" : "text-slate-500"}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={values.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-[11px] text-red-400">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Create Free Account
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-800/60">
                <p className="text-xs text-slate-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
