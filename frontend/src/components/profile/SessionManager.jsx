import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Laptop, Smartphone, Monitor, ShieldAlert, LogOut, RefreshCw, CheckCircle2 } from "lucide-react";

export default function SessionManager() {
  const { getSessions, revokeSession, logoutAll } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);

  const fetchUserSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data || []);
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSessions();
  }, []);

  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession(sessionId);
      setActionMessage("Session revoked successfully.");
      fetchUserSessions();
    } catch (err) {
      setActionMessage("Failed to revoke session.");
    }
  };

  const handleLogoutAll = async () => {
    if (!window.confirm("Are you sure you want to log out from all active devices?")) return;
    try {
      await logoutAll();
    } catch (err) {
      setActionMessage("Failed to log out all devices.");
    }
  };

  const getDeviceIcon = (deviceStr) => {
    if (!deviceStr) return <Monitor className="w-4 h-4 text-indigo-400" />;
    const lower = deviceStr.toLowerCase();
    if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
      return <Smartphone className="w-4 h-4 text-indigo-400" />;
    }
    return <Laptop className="w-4 h-4 text-indigo-400" />;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            Active Device Sessions
          </h3>
          <p className="text-xs text-slate-400">
            Manage logged-in devices and revoke sessions remotely
          </p>
        </div>

        <button
          onClick={handleLogoutAll}
          className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout All Devices
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
          Loading active sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="py-6 text-center text-slate-500 text-xs">
          No active sessions found.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  {getDeviceIcon(session.device)}
                </div>
                <div>
                  <div className="font-semibold text-white flex items-center gap-2">
                    {session.device?.slice(0, 45) || "Web Browser"}
                    {session.isCurrentSession && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Current Device
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    IP: {session.ipAddress} • Logged in: {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {!session.isCurrentSession && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
