import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function DeleteDocumentModal({
  isOpen,
  onClose,
  onConfirm,
  documentTitle = "",
}) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Failed to delete document", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Delete Document
              </h3>
              <p className="text-xs text-rose-600 font-medium">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-600 leading-relaxed">
          Are you sure you want to permanently delete{" "}
          <span className="font-semibold text-slate-900">
            "{documentTitle}"
          </span>
          ? All content and history associated with this document will be lost.
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-rose-600/30 transition-all hover:bg-rose-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Yes, Delete Document"}
          </button>
        </div>
      </div>
    </div>
  );
}
