import { X, Users, Crown, Shield, Activity, Circle } from "lucide-react";

export default function PresencePanel({ isOpen, onClose, collaborators = [], currentUser }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-xs transition-opacity animate-fadeIn">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform border-l border-slate-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Active Collaborators</h3>
              <p className="text-xs text-slate-500">{collaborators.length} currently viewing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Collaborators List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {collaborators.length === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">No active collaborators</p>
          ) : (
            collaborators.map((collab) => {
              const isSelf = collab.userId === currentUser?.id;
              const initials = (collab.user.name || collab.user.email || "U")
                .charAt(0)
                .toUpperCase();

              return (
                <div
                  key={collab.socketId}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: collab.color }}
                      >
                        {initials}
                      </div>
                      <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-emerald-500 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-xs font-semibold text-slate-900">
                          {collab.user.name}
                        </span>
                        {isSelf && (
                          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                            You
                          </span>
                        )}
                      </div>
                      <p className="truncate text-[11px] text-slate-400">{collab.user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {collab.role === "Owner" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200/60">
                        <Crown className="h-3 w-3" />
                        Owner
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200/60">
                        <Shield className="h-3 w-3" />
                        Collaborator
                      </span>
                    )}

                    {collab.isTyping && (
                      <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-medium animate-pulse">
                        <Activity className="h-3 w-3" />
                        Typing...
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 text-center">
          <p className="text-[11px] text-slate-400">
            Real-time room sessions are encrypted and scoped to this document.
          </p>
        </div>
      </div>
    </div>
  );
}
