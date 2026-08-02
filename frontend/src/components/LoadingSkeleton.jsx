export default function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="h-6 w-16 rounded-lg bg-slate-100" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-5 w-3/4 rounded-md bg-slate-200" />
            <div className="h-4 w-1/2 rounded-md bg-slate-100" />
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-7 w-20 rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
