import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";

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
];
