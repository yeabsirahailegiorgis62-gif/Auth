export default function FormInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
  rightContent,
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span className="mb-2 block">{label}</span>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${error ? "border-rose-400" : ""}`}
        />
        {rightContent && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {rightContent}
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
    </label>
  );
}
