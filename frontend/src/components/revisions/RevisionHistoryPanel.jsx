import { useState } from "react";
import RestoreConfirmationModal from "./RestoreConfirmationModal";
import { History, X, Plus, RotateCcw, Clock, ShieldAlert } from "lucide-react";

function formatDistanceToNow(date) {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RevisionHistoryPanel({
  isOpen,
  onClose,
  revisions = [],
  loading = false,
  userRole,
  onCreateCheckpoint,
  onRestoreRevision,
}) {
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const canEdit = userRole === "OWNER" || userRole === "EDITOR";
  const maxVersion = revisions.length > 0 ? Math.max(...revisions.map((r) => r.version)) : 0;
  const nextVersionNumber = maxVersion + 1;

  const handleRestoreClick = (revision) => {
    setSelectedRevision(revision);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!selectedRevision || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onRestoreRevision(selectedRevision.id);
      setIsConfirmModalOpen(false);
      setSelectedRevision(null);
    } catch (err) {
      console.error("Failed to restore revision", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="w-80 sm:w-96 border-l border-slate-200 bg-slate-50/50 flex flex-col h-full z-20 shrink-0 shadow-xl transition-all">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Version History
            </h3>
            <p className="text-[10px] text-slate-500">
              {revisions.length} total snapshots
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Manual Snapshot Checkpoint CTA */}
      {canEdit && (
        <div className="p-3 border-b border-slate-200 bg-white">
          <button
            onClick={onCreateCheckpoint}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2 px-4 text-xs font-semibold text-white shadow-md transition-all hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create Manual Snapshot
          </button>
        </div>
      )}

      {/* Revisions Timeline List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-slate-200/60 animate-pulse"
              />
            ))}
          </div>
        ) : revisions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <History className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-700">No revisions found</h4>
            <p className="mt-1 text-[11px] text-slate-400 max-w-[200px]">
              Revisions are created automatically as you edit or when manual checkpoints are saved.
            </p>
          </div>
        ) : (
          revisions.map((rev) => (
            <div
              key={rev.id}
              className="group relative rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                    Version {rev.version}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatDistanceToNow(rev.createdAt)}
                  </span>
                </div>

                {canEdit && (
                  <button
                    onClick={() => handleRestoreClick(rev)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors"
                    title="Restore this version"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </button>
                )}
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 uppercase">
                  {rev.author?.name?.[0] || "U"}
                </div>
                <span className="font-semibold text-slate-900">
                  {rev.author?.name || "Collaborator"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Restore Confirmation Modal */}
      <RestoreConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmRestore}
        revision={selectedRevision}
        nextVersionNumber={nextVersionNumber}
        isSubmitting={isSubmitting}
      />
    </aside>
  );
}
