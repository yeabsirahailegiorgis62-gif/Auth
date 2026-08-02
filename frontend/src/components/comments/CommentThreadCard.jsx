import { useState } from "react";
import {
  MessageSquare,
  CheckCircle2,
  RotateCcw,
  CornerDownRight,
  MoreVertical,
  Edit2,
  Trash2,
  Send,
  Quote,
} from "lucide-react";

function formatDistanceToNow(date) {
  if (!date) return "";
  const diffInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (diffInSeconds < 60) return "just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default function CommentThreadCard({
  thread,
  currentUserId,
  userRole,
  isActive,
  onSelect,
  onAddReply,
  onUpdateComment,
  onDeleteComment,
  onResolve,
  onReopen,
}) {
  const [replyText, setReplyText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openMenuCommentId, setOpenMenuCommentId] = useState(null);

  const isOwnerOrEditorOrCommenter =
    userRole === "OWNER" || userRole === "EDITOR" || userRole === "COMMENTER";

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onAddReply(thread.id, replyText.trim());
      setReplyText("");
    } catch (err) {
      console.error("Failed to add reply", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (commentId) => {
    if (!editText.trim() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      await onUpdateComment(commentId, editText.trim());
      setEditingCommentId(null);
      setEditText("");
    } catch (err) {
      console.error("Failed to update comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await onDeleteComment(commentId);
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer ${
        isActive
          ? "border-indigo-500 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20"
          : thread.resolved
          ? "border-slate-200 bg-slate-50/60 opacity-80"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Selected Text Context Header */}
      {thread.selectedText && (
        <div className="flex items-start gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 rounded-t-2xl text-xs text-slate-600">
          <Quote className="h-3.5 w-3.5 shrink-0 text-indigo-500 mt-0.5" />
          <p className="line-clamp-2 italic font-serif text-slate-700">
            "{thread.selectedText}"
          </p>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Header & Resolve Action */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">
              {thread.creator?.name || "Author"}
            </span>
            <span>•</span>
            <span>{formatDistanceToNow(thread.createdAt)}</span>
          </div>

          {isOwnerOrEditorOrCommenter && (
            <div className="flex items-center gap-1">
              {thread.resolved ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReopen(thread.id);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg transition-colors"
                  title="Reopen discussion thread"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reopen
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResolve(thread.id);
                  }}
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg transition-colors"
                  title="Mark thread as resolved"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Resolve
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="space-y-3">
          {thread.comments?.map((comment, index) => {
            const isEditing = editingCommentId === comment.id;
            const canEdit = comment.authorId === currentUserId;
            const canDelete =
              comment.authorId === currentUserId || userRole === "OWNER";

            return (
              <div
                key={comment.id}
                className={`relative group/comment flex items-start gap-2.5 ${
                  index > 0 ? "pl-4 border-l-2 border-slate-100" : ""
                }`}
              >
                {/* Author Avatar */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-[11px] font-bold text-white uppercase shadow-sm">
                  {comment.author?.name?.[0] || "U"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900">
                        {comment.author?.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDistanceToNow(comment.createdAt)}
                      </span>
                      {comment.edited && (
                        <span className="text-[10px] italic text-slate-400">
                          (edited)
                        </span>
                      )}
                    </div>

                    {/* Actions dropdown/menu */}
                    {(canEdit || canDelete) && !isEditing && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuCommentId(
                              openMenuCommentId === comment.id
                                ? null
                                : comment.id
                            );
                          }}
                          className="opacity-0 group-hover/comment:opacity-100 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-all"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>

                        {openMenuCommentId === comment.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-6 z-20 w-28 rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
                          >
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditText(comment.content);
                                  setOpenMenuCommentId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                              >
                                <Edit2 className="h-3 w-3 text-slate-500" />
                                Edit
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => {
                                  handleDelete(comment.id);
                                  setOpenMenuCommentId(null);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-3 w-3 text-rose-500" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment Body / Edit Form */}
                  {isEditing ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 space-y-2"
                    >
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                        className="w-full rounded-xl border border-indigo-300 p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditSubmit(comment.id)}
                          disabled={isSubmitting || !editText.trim()}
                          className="px-3 py-1 text-[11px] font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reply Form */}
        {isOwnerOrEditorOrCommenter && !thread.resolved && (
          <form
            onSubmit={handleReplySubmit}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 pt-2 border-t border-slate-100"
          >
            <input
              type="text"
              placeholder="Reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={isSubmitting || !replyText.trim()}
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
