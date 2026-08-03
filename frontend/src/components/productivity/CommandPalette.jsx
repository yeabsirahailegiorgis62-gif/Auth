import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchDocuments } from "../../services/searchService";
import { Search, FileText, Plus, Home, Trash2, X, Command, Sparkles } from "lucide-react";

export default function CommandPalette({ isOpen, onClose, onCreateDocument }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await searchDocuments(query);
        setResults(data.results || []);
      } catch (err) {
        console.error("Command palette search error", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectDoc = (docId) => {
    navigate(`/documents/${docId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 bg-white">
          <Search className="h-5 w-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search documents (Ctrl + K)..."
            className="w-full bg-transparent text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200">
            <Command className="h-3 w-3" /> K
          </span>
        </div>

        {/* Results List & Quick Actions */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {query.trim() === "" ? (
            <div className="p-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  onCreateDocument();
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                  <Plus className="h-4 w-4" />
                </div>
                <span>Create New Document</span>
              </button>

              <button
                onClick={() => {
                  navigate("/dashboard");
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Home className="h-4 w-4" />
                </div>
                <span>Go to Dashboard</span>
              </button>
            </div>
          ) : loading ? (
            <div className="py-8 text-center text-xs font-semibold text-slate-400">
              Searching documents...
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center text-xs font-medium text-slate-400">
              No matching documents found
            </div>
          ) : (
            results.map((doc) => (
              <button
                key={doc.id}
                onClick={() => handleSelectDoc(doc.id)}
                className="flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition-all hover:bg-indigo-50/70"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shrink-0 border border-indigo-100">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-xs font-bold text-slate-900">
                      {doc.title}
                    </h4>
                    <p className="truncate text-[10px] text-slate-500">
                      Owner: {doc.owner?.name || "Collaborator"}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100/60 px-2.5 py-1 rounded-lg shrink-0">
                  Open
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
