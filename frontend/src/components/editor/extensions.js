import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import CharacterCount from "@tiptap/extension-character-count";
import { Markdown } from "tiptap-markdown";

export const defaultExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    codeBlock: {
      HTMLAttributes: {
        class: "rounded-xl bg-slate-900 p-4 font-mono text-sm text-slate-100 shadow-inner my-4",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "border-l-4 border-indigo-500 pl-4 italic text-slate-600 my-4",
      },
    },
    horizontalRule: {
      HTMLAttributes: {
        class: "border-t border-slate-200 my-6",
      },
    },
    // We disable history because Yjs handles undo/redo
    history: false,
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
    HTMLAttributes: {
      class: "text-indigo-600 underline font-medium hover:text-indigo-800 transition-colors",
    },
  }),
  TextAlign.configure({
    types: ["heading", "paragraph"],
    alignments: ["left", "center", "right", "justify"],
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: "not-prose pl-2",
    },
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: "flex items-start gap-2 my-1",
    },
  }),
  Table.configure({
    resizable: true,
    HTMLAttributes: {
      class: "border-collapse table-auto w-full border border-slate-300 my-4",
    },
  }),
  TableRow,
  TableHeader.configure({
    HTMLAttributes: {
      class: "border border-slate-300 bg-slate-100 p-2 font-bold",
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: "border border-slate-300 p-2",
    },
  }),
  Image.configure({
    HTMLAttributes: {
      class: "rounded-lg max-w-full shadow-md my-4",
    },
  }),
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  Typography,
  CharacterCount,
  Markdown,
];

