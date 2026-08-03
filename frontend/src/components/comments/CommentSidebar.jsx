import { useState } from "react";
import CommentThreadCard from "./CommentThreadCard";
import {
  MessageSquare,
  X,
  CheckCircle2,
  ListFilter,
  Search,
  Plus,
  Quote,
  Send,
} from "lucide-react";

export default function CommentSidebar({
  isOpen,
  onClose,
  threads = [],
  loading = false,
  currentUserId,
  userRole,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  onResolveThread,
  onReopenThread,
  selectedText = "",
  selectionPositions = null,
}) {
  const [tab, setTab] = useState("open"); // 'open' | 'resolved'
  const [search, setSearch] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isOwnerOrEditorOrCommenter =
    userRole === "OWNER" || userRole === "EDITOR" || userRole === "COMMENTER";

  // Filter threads by status & search query
  const filteredThreads = threads.filter((t) => {
    const matchesTab = tab === "open" ? !t.resolved : t.resolved;
    if (!matchesTab) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();

    const inQuote = t.selectedText?.toLowerCase().includes(q);
    const inComments = t.comments?.some((c) =>
      c.content?.toLowerCase().includes(q)
    );
    const inAuthor =
      t.creator?.name?.toLowerCase().includes(q) ||
      t.comments?.some((c) => c.author?.name?.toLowerCase().includes(q));

    return inQuote || inComments || inAuthor;
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateThread({
        selectedText: selectedText || "",
        fromPos: selectionPositions?.fromPos || null,
        toPos: selectionPositions?.toPos || null,
        content: newCommentContent.trim(),
      });
      setNewCommentContent("");
    } catch (err) {
      console.error("Failed to create thread", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="w-80 sm:w-96 border-l border-slate-200 bg-slate-50/50 flex flex-col h-full z-20 shrink-0 shadow-xl transition-all">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Review & Comments
            </h3>
            <p className="text-[10px] text-slate-500">
              {threads.filter((t) => !t.resolved).length} open discussions
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

      {/* Tabs & Search */}
      <div className="p-3 border-b border-slate-200 bg-white space-y-2.5">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setTab("open")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === "open"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Open ({threads.filter((t) => !t.resolved).length})
          </button>
          <button
            onClick={() => setTab("resolved")}
            className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all ${
              tab === "resolved"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Resolved ({threads.filter((t) => t.resolved).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search comments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Selected Text Comment Creation Prompt */}
      {isOwnerOrEditorOrCommenter && selectedText && (
        <div className="m-3 p-3 rounded-2xl border border-indigo-200 bg-indigo-50/60 shadow-sm space-y-2">
          <div className="flex items-start gap-1.5 text-xs font-semibold text-indigo-900">
            <Quote className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5" />
            <p className="line-clamp-2 italic font-serif">"{selectedText}"</p>
          </div>

          <form onSubmit={handleCreateSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Add comment on selected text..."
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              autoFocus
              className="flex-1 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-indigo-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newCommentContent.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Threads List Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-slate-200/60 animate-pulse"
              />
            ))}
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-700">
              {tab === "open" ? "No open comments" : "No resolved comments"}
            </h4>
            <p className="mt-1 text-[11px] text-slate-400 max-w-[200px]">
              {tab === "open"
                ? "Select text in the editor to start a discussion thread."
                : "Resolved comment threads will appear here."}
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <CommentThreadCard
              key={thread.id}
              thread={thread}
              currentUserId={currentUserId}
              userRole={userRole}
              isActive={activeThreadId === thread.id}
              onSelect={() => onSelectThread(thread.id)}
              onAddReply={onAddReply}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              onResolve={onResolveThread}
              onReopen={onReopenThread}
            />
          ))
        )}
      </div>
    </aside>
  );
}
