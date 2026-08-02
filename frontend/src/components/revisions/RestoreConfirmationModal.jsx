import { X, History, AlertTriangle } from "lucide-react";

export default function RestoreConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  revision,
  nextVersionNumber,
  isSubmitting,
}) {
  if (!isOpen || !revision) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Restore Version {revision.version}?
              </h3>
              <p className="text-xs text-slate-500">
                Created by {revision.author?.name || "Collaborator"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Details & Warning Callout */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Non-destructive restoration</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Restoring <strong className="font-bold">Version {revision.version}</strong> will create a new <strong className="font-bold">Version {nextVersionNumber}</strong> containing its contents. Your current version will remain in the revision history.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-amber-600/30 transition-all hover:bg-amber-700 disabled:opacity-50"
          >
            {isSubmitting ? "Restoring..." : `Restore to Version ${nextVersionNumber}`}
          </button>
        </div>
      </div>
    </div>
  );
}
