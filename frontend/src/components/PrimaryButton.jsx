export default function PrimaryButton({ children, loading, ...props }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      disabled={loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
