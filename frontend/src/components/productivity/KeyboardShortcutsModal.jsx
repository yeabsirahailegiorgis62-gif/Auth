import { X, Keyboard, Command } from "lucide-react";

const shortcuts = [
  { key: "Ctrl + K / Cmd + K", description: "Open Command Palette / Global Search" },
  { key: "Ctrl + S / Cmd + S", description: "Force Save Document" },
  { key: "Ctrl + / / Cmd + /", description: "Show Keyboard Shortcuts" },
  { key: "Ctrl + B", description: "Toggle Bold" },
  { key: "Ctrl + I", description: "Toggle Italic" },
  { key: "Ctrl + U", description: "Toggle Underline" },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Keyboard Shortcuts
              </h3>
              <p className="text-xs text-slate-500">Boost your editing speed</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className="flex items-center justify-between rounded-2xl bg-slate-50 p-3 text-xs"
            >
              <span className="font-semibold text-slate-700">{sc.description}</span>
              <kbd className="rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-sm border border-slate-200">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
