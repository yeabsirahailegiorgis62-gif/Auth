import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect, useState, useMemo } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { defaultExtensions } from "./extensions";
import EditorToolbar from "./EditorToolbar";
import AiAssistantMenu from "./AiAssistantMenu";

export default function RichTextEditor({
  documentId,
  currentUser,
  content,
  onChange,
  isEditable = true,
  isCommentsOpen,
  onToggleComments,
  unreadCommentsCount = 0,
  isHistoryOpen,
  onToggleHistory,
  onSelectionChange,
  workspaceId,
}) {
  const [provider, setProvider] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Initialize Yjs Document and WebsocketProvider
  const ydoc = useMemo(() => new Y.Doc(), [documentId]);

  useEffect(() => {
    if (!documentId) return;

    // We assume backend runs on the same host but we can explicitly use window.location
    const wsUrl = process.env.NODE_ENV === "development" 
      ? `ws://localhost:5000/yjs/${documentId}`
      : `wss://${window.location.host}/yjs/${documentId}`;
      
    const wsProvider = new WebsocketProvider(wsUrl, documentId, ydoc, {
      connect: true,
    });

    if (currentUser) {
      wsProvider.awareness.setLocalStateField("user", {
        name: currentUser.name || "Anonymous",
        color: currentUser.color || "#" + Math.floor(Math.random()*16777215).toString(16),
      });
    }

    setProvider(wsProvider);

    return () => {
      wsProvider.destroy();
      ydoc.destroy();
    };
  }, [documentId, ydoc, currentUser]);

  const editor = useEditor({
    extensions: [
      ...defaultExtensions,
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider,
        user: {
          name: currentUser?.name || "Anonymous",
          color: currentUser?.color || "#3b82f6",
        },
      }),
    ],
    editable: isEditable,
    editorProps: {
      attributes: {
        class:
          "ProseMirror prose prose-slate max-w-none focus:outline-none min-h-[550px] p-8 font-sans text-slate-800 text-base leading-relaxed select-text whitespace-pre-wrap",
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
  }, [provider]); // Re-create editor when provider is ready

  // Dynamic Editable Sync: Update TipTap editable state whenever isEditable prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  return (
    <div className="relative flex flex-col rounded-3xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xl shadow-slate-200/60 overflow-hidden transition-all duration-300">
      <EditorToolbar
        editor={editor}
        isCommentsOpen={isCommentsOpen}
        onToggleComments={onToggleComments}
        unreadCommentsCount={unreadCommentsCount}
        isHistoryOpen={isHistoryOpen}
        onToggleHistory={onToggleHistory}
        isAiOpen={isAiOpen}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
      />
      
      {isAiOpen && workspaceId && (
        <AiAssistantMenu 
          editor={editor} 
          workspaceId={workspaceId} 
          documentId={documentId} 
          onClose={() => setIsAiOpen(false)} 
        />
      )}

      <div
        className="flex-1 overflow-y-auto bg-white/50 p-2 cursor-text"
        onClick={() => {
          if (isEditable && editor && !editor.isFocused) {
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
