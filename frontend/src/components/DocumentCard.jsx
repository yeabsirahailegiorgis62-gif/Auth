import { useState, useRef, useEffect } from "react";
import {
  FileText,
  MoreVertical,
  Edit3,
  Copy,
  Trash2,
  ExternalLink,
  Clock,
  UserCheck,
} from "lucide-react";

export default function DocumentCard({
  document,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
  currentUserId,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isOwner = document.ownerId === currentUserId;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div
            onClick={() => onOpen(document.id)}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-600/30"
          >
            <FileText className="h-6 w-6" />
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl transition-all">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpen(document.id);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Document
                </button>

                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onRename(document);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-600"
                    >
                      <Edit3 className="h-4 w-4" />
                      Rename
                    </button>

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDuplicate(document.id);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(document);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 cursor-pointer" onClick={() => onOpen(document.id)}>
          <h4 className="text-base font-semibold text-slate-900 line-clamp-1 transition-colors group-hover:text-indigo-600">
            {document.title || "Untitled Document"}
          </h4>
          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {document.content || "Empty document"}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>{formatDate(document.updatedAt || document.createdAt)}</span>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ${
            isOwner
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
              : "bg-purple-50 text-purple-700 border border-purple-200/50"
          }`}
        >
          <UserCheck className="h-3 w-3" />
          {isOwner ? "Owner" : "Shared"}
        </span>
      </div>
    </div>
  );
}
