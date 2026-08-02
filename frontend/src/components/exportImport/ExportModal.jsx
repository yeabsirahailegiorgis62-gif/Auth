import { X, Download, FileText, Code, FileCode } from "lucide-react";

export default function ExportModal({ isOpen, onClose, documentId, documentTitle }) {
  if (!isOpen) return null;

  const handleExport = (format) => {
    const token = localStorage.getItem("accessToken");
    const downloadUrl = `/api/documents/${documentId}/export?format=${format}`;
    
    // Create anchor element to trigger file download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${documentTitle || "document"}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Export Document
              </h3>
              <p className="text-xs text-slate-500">Choose export format</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handleExport("html")}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3.5 text-xs font-semibold text-slate-800 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <FileCode className="h-4 w-4 text-indigo-600" />
              <span>HTML Document (.html)</span>
            </div>
            <Download className="h-4 w-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleExport("md")}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3.5 text-xs font-semibold text-slate-800 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <Code className="h-4 w-4 text-indigo-600" />
              <span>Markdown File (.md)</span>
            </div>
            <Download className="h-4 w-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleExport("txt")}
            className="flex w-full items-center justify-between rounded-2xl border border-slate-200 p-3.5 text-xs font-semibold text-slate-800 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-indigo-600" />
              <span>Plain Text File (.txt)</span>
            </div>
            <Download className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
