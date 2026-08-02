import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import useForm from "../hooks/useForm";

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
  const { register, error, message, setError, setMessage } = useAuth();
  const navigate = useNavigate();
  const { values, handleChange, resetForm } = useForm({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    if (!values.email.trim())
      errors.email = "A valid email address is required.";

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
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      resetForm();
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setError(err.response?.data?.message ?? "Unable to register.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 lg:px-12 flex items-center justify-start">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
        <div className="mb-6 flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
          <Link
            to="/login"
            className="rounded-full px-5 py-2 text-sm font-semibold transition hover:bg-white hover:text-slate-900"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Sign Up
          </Link>
        </div>
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">
            Create account
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">
            Start building with your account
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Register now and take control of your secure dashboard experience.
          </p>
        </div>

        {message && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          <FormInput
            label="Full name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={validationErrors.name}
            placeholder="Jane Doe"
          />
          <FormInput
            label="Email address"
            name="email"
            value={values.email}
            onChange={handleChange}
            error={validationErrors.email}
            placeholder="jane@example.com"
          />
          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={handleChange}
            error={validationErrors.password}
            placeholder="Enter a strong password"
            rightContent={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-xs font-semibold text-slate-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold">Password strength</span>
              <span className="font-semibold text-indigo-600">
                {strengthLabel}
              </span>
            </div>
            <ul className="space-y-2">
              {passwordChecks.map((rule) => (
                <li key={rule.label} className="flex items-center gap-2">
                  <span
                    className={
                      rule.passed ? "text-emerald-600" : "text-rose-500"
                    }
                  >
                    {rule.passed ? "✓" : "✗"}
                  </span>
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <FormInput
            label="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleChange}
            error={validationErrors.confirmPassword}
            placeholder="Repeat your password"
            rightContent={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="text-xs font-semibold text-slate-600"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            }
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Already have an account?
            </span>
            <PrimaryButton loading={submitting} type="submit">
              Register
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
