import { useState, useEffect } from "react";
import { getUserActivities } from "../../services/activityService";
import { Activity, X, FileText, Share2, MessageSquare, History, Trash2, RotateCcw } from "lucide-react";

const actionIcons = {
  DOCUMENT_CREATED: { icon: FileText, color: "bg-emerald-50 text-emerald-600" },
  DOCUMENT_EDITED: { icon: FileText, color: "bg-indigo-50 text-indigo-600" },
  DOCUMENT_SHARED: { icon: Share2, color: "bg-amber-50 text-amber-600" },
  COMMENT_CREATED: { icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
  VERSION_RESTORED: { icon: History, color: "bg-blue-50 text-blue-600" },
  DOCUMENT_TRASHED: { icon: Trash2, color: "bg-rose-50 text-rose-600" },
  DOCUMENT_RESTORED: { icon: RotateCcw, color: "bg-teal-50 text-teal-600" },
};

export default function ActivityFeedDrawer({ isOpen, onClose }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getUserActivities()
        .then((data) => setActivities(data.activities || []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <aside className="w-80 sm:w-96 border-l border-slate-200 bg-slate-50/50 flex flex-col h-full z-30 shrink-0 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Recent Activity Feed
            </h3>
            <p className="text-[10px] text-slate-500">Live platform timeline</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            No activity recorded yet
          </div>
        ) : (
          activities.map((act) => {
            const config = actionIcons[act.action] || actionIcons.DOCUMENT_EDITED;
            const Icon = config.icon;

            return (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm"
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 mt-0.5 ${config.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {act.action.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(act.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {act.document && (
                    <p className="text-[11px] text-slate-600 truncate mt-0.5">
                      {act.document.title}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
