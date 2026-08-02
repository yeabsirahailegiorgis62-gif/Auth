import { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

function formatRelativeTime(date) {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function SaveStatusIndicator({ status, lastSavedAt }) {
  const [timeAgo, setTimeAgo] = useState(formatRelativeTime(lastSavedAt));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeAgo(formatRelativeTime(lastSavedAt));
    }, 5000);
    return () => clearInterval(timer);
  }, [lastSavedAt]);

  if (status === "saving") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/80">
        <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
        <span>Saving...</span>
      </span>
    );
  }

  if (status === "retrying") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200/80 animate-pulse">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
        <span>Retrying save...</span>
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-200/80">
        <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
        <span>Save failed</span>
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
      <span>Saved {timeAgo}</span>
    </span>
  );
}
