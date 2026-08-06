import { useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  SquareCode,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Unlink,
  Minus,
  Undo,
  Redo,
  RemoveFormatting,
  X,
  Check,
  MessageSquare,
  History,
  Table,
  Image as ImageIcon,
  CheckSquare,
  Highlighter,
  Sparkles,
} from "lucide-react";

export default function EditorToolbar({
  editor,
  isCommentsOpen,
  onToggleComments,
  unreadCommentsCount = 0,
  isHistoryOpen,
  onToggleHistory,
  isAiOpen,
  onToggleAi,
}) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  if (!editor) return null;

  const setLink = () => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }
    const url = linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
    setShowLinkInput(false);
    setLinkUrl("");
  };

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setShowLinkInput(true);
  };

  const unsetLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div
      onMouseDown={(e) => e.preventDefault()}
      className="relative z-10 w-full flex flex-wrap items-center gap-1 border-b border-slate-200/80 bg-white/95 p-2 backdrop-blur-md"
    >
      {/* Undo / Redo Group */}
      <div className="flex items-center gap-0.5 border-r border-slate-200/80 pr-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
          className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
          className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Heading Selector */}
      <div className="flex items-center gap-0.5 border-r border-slate-200/80 px-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1 (Ctrl+Alt+1)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("heading", { level: 1 })
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2 (Ctrl+Alt+2)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Heading2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3 (Ctrl+Alt+3)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Heading3 className="h-4 w-4" />
        </button>
      </div>

      {/* Inline Formatting Group */}
      <div className="flex items-center gap-0.5 border-r border-slate-200/80 px-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("bold")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("italic")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("underline")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="Strikethrough (Ctrl+Shift+X)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("strike")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="Inline Code (Ctrl+E)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("code")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Code className="h-4 w-4" />
        </button>
      </div>

      {/* Alignment Group */}
      <div className="flex items-center gap-0.5 border-r border-slate-200/80 px-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          title="Align Left (Ctrl+Shift+L)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive({ textAlign: "left" })
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          title="Align Center (Ctrl+Shift+E)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive({ textAlign: "center" })
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          title="Align Right (Ctrl+Shift+R)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive({ textAlign: "right" })
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlignRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          title="Justify (Ctrl+Shift+J)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive({ textAlign: "justify" })
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <AlignJustify className="h-4 w-4" />
        </button>
      </div>

      {/* Lists & Blocks Group */}
      <div className="flex items-center gap-0.5 border-r border-slate-200/80 px-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List (Ctrl+Shift+8)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("bulletList")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered List (Ctrl+Shift+7)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("orderedList")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          title="Blockquote (Ctrl+Shift+B)"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("blockquote")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("codeBlock")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <SquareCode className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Line"
          className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="Task List"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("taskList")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <CheckSquare className="h-4 w-4" />
        </button>
      </div>

      {/* Advanced Group (Table, Image, Highlight) */}
      <div className="flex items-center gap-0.5 border-r border-slate-200/80 px-1.5">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
          }
          title="Insert Table"
          className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <Table className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            const url = window.prompt("Enter image URL:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          title="Insert Image"
          className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("highlight")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Highlighter className="h-4 w-4" />
        </button>
      </div>

      {/* Link & Clear Formatting Group */}
      <div className="flex items-center gap-0.5 pl-1.5">
        <button
          type="button"
          onClick={openLinkModal}
          title="Add Link"
          className={`rounded-lg p-1.5 transition-colors ${
            editor.isActive("link")
              ? "bg-indigo-100 text-indigo-700 font-bold"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <LinkIcon className="h-4 w-4" />
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={unsetLink}
            title="Remove Link"
            className="rounded-lg p-1.5 text-rose-600 transition-colors hover:bg-rose-50"
          >
            <Unlink className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          title="Clear Formatting"
          className="rounded-lg p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-rose-600"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>
      </div>

      {/* Review & Comments Group */}
      <div className="flex items-center gap-1 border-l border-slate-200/80 pl-1.5 ml-auto">
        {onToggleHistory && (
          <button
            type="button"
            onClick={onToggleHistory}
            title="Toggle Version History Timeline"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
              isHistoryOpen
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History</span>
          </button>
        )}

        {onToggleComments && (
          <button
            type="button"
            onClick={onToggleComments}
            title="Toggle Comments Panel"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
              isCommentsOpen
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Comments</span>
            {unreadCommentsCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-200 text-[10px] font-bold text-indigo-900">
                {unreadCommentsCount}
              </span>
            )}
          </button>
        )}

        {onToggleAi && (
          <button
            type="button"
            onClick={onToggleAi}
            title="Ask AI Assistant"
            className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
              isAiOpen
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask AI</span>
          </button>
        )}
      </div>

      {/* Link Modal Popover */}
      {showLinkInput && (
        <div className="absolute left-4 top-14 z-30 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl animate-fade-in">
          <input
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-64 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") setLink();
              if (e.key === "Escape") setShowLinkInput(false);
            }}
          />
          <button
            type="button"
            onClick={setLink}
            className="rounded-xl bg-indigo-600 p-1.5 text-white hover:bg-indigo-700"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
