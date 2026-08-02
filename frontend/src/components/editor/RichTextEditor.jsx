import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import { defaultExtensions } from "./extensions";
import EditorToolbar from "./EditorToolbar";

export default function RichTextEditor({
  content,
  onChange,
  isEditable = true,
  isCommentsOpen,
  onToggleComments,
  unreadCommentsCount = 0,
  isHistoryOpen,
  onToggleHistory,
  onSelectionChange,
}) {
  const parseInitialContent = (rawContent) => {
    if (!rawContent) return "";
    if (typeof rawContent === "object") return rawContent;
    try {
      const parsed = JSON.parse(rawContent);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Fallback to HTML / plain string
    }
    return rawContent;
  };

  const editor = useEditor({
    extensions: defaultExtensions,
    content: parseInitialContent(content),
    editable: isEditable,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[500px] p-8 font-sans text-slate-800 text-base leading-relaxed select-text",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.(json);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      onSelectionChange?.({
        selectedText: text,
        fromPos: from,
        toPos: to,
      });
    },
  });

  // Sync content when document changes from external props
  useEffect(() => {
    if (editor && content) {
      const parsed = parseInitialContent(content);
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = typeof parsed === "object" ? JSON.stringify(parsed) : null;

      if (newJSON && currentJSON !== newJSON) {
        editor.commands.setContent(parsed, false);
      }
    }
  }, [content, editor]);

  return (
    <div className="flex flex-col rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
      <EditorToolbar
        editor={editor}
        isCommentsOpen={isCommentsOpen}
        onToggleComments={onToggleComments}
        unreadCommentsCount={unreadCommentsCount}
        isHistoryOpen={isHistoryOpen}
        onToggleHistory={onToggleHistory}
      />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
