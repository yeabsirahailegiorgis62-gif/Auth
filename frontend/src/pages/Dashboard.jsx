import { useAuth } from "../context/AuthContext";
import PrimaryButton from "../components/PrimaryButton";

export default function Dashboard() {
  const { user, logout, logoutAll } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">
                Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-900">
                Welcome back, {user?.name || "user"}.
              </h1>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <PrimaryButton onClick={logout}>Logout</PrimaryButton>
              <PrimaryButton onClick={logoutAll}>
                Logout all devices
              </PrimaryButton>
            </div>
          </div>
        </header>

        <main className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Account information</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  Personal details
                </h2>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Name</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {user?.name || "—"}
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {user?.email || "—"}
                </p>
              </div>
            </div>
          </section>
          <aside className="rounded-3xl bg-white p-6 shadow-xl shadow-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Session security
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Use the buttons above to end your current session or sign out from
              all devices.
            </p>
          </aside>
        </main>
      </div>
    </div>
  );
}
