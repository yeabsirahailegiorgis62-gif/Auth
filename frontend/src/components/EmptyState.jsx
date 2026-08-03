import { FileText, Plus } from "lucide-react";

export default function EmptyState({ onCreate, search = "" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/70 p-12 text-center shadow-sm backdrop-blur-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
        <FileText className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-900">
        {search ? "No matching documents" : "No documents found"}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        {search
          ? `We couldn't find any documents matching "${search}". Try searching for something else.`
          : "Get started by creating your first document to begin writing and collaborating."}
      </p>
      {!search && onCreate && (
        <button
          onClick={onCreate}
          className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 hover:shadow-indigo-600/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Create New Document
        </button>
      )}
    </div>
  );
}
