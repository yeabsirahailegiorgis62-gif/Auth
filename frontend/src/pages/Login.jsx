import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BACKEND_URL } from "../services/api";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import useForm from "../hooks/useForm";

export default function Login() {
  const { user, login, error, setError } = useAuth();
  const navigate = useNavigate();
  const { values, handleChange } = useForm({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Countdown timer effect
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
    return `${minutes} minutes ${remainingSecs} seconds`;
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

    try {
      await login({ email: values.email, password: values.password });
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 429) {
        // Account is locked
        setLockedUntil(
          new Date(Date.now() + err.response.data.remainingSeconds * 1000),
        );
        setRemainingSeconds(err.response.data.remainingSeconds);
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message ?? "Unable to login.");
      }
    } finally {
      setSubmitting(false);
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
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-12 flex items-center justify-start">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
        <div className="mb-6 flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
          <Link
            to="/login"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            Sign Up
          </Link>
        </div>
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">
            Welcome back
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Log in to your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Access your secure dashboard and manage sessions with confidence.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
            {remainingSeconds > 0 && (
              <div className="mt-2">
                Account locked. Try again in {formatTime(remainingSeconds)}.
              </div>
            )}
          </div>
        )}

        <div className="space-y-5 mt-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-slate-50"
          >
            Sign in with Google
          </button>

          <div className="mx-auto flex h-px w-full max-w-xs items-center bg-slate-200">
            <span className="mx-auto bg-white px-2 text-xs uppercase tracking-[0.3em] text-slate-400">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormInput
              label="Email address"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="jane@example.com"
            />
            <FormInput
              label="Password"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Not registered yet?
              </span>
              <PrimaryButton loading={submitting} type="submit">
                Login
              </PrimaryButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
