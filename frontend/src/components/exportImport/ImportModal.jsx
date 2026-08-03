import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Upload, X, FileText, Check } from "lucide-react";

export default function ImportModal({ isOpen, onClose }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setLoading(true);
      const text = await file.text();
      const title = file.name.replace(/\.[^/.]+$/, "");

      const res = await api.post("/documents/import", {
        title,
        content: text,
      });

      onClose();
      navigate(`/documents/${res.data.document.id}`);
    } catch (err) {
      alert("Failed to import file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Import Document
              </h3>
              <p className="text-xs text-slate-500">Upload Markdown or Text file</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleImport} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center hover:border-indigo-400 transition-all cursor-pointer relative bg-slate-50/50">
            <input
              type="file"
              accept=".md,.txt,.html"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <FileText className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">
              {file ? file.name : "Click or drag file to import (.md, .txt)"}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Maximum file size 5MB</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Importing..." : "Import Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
