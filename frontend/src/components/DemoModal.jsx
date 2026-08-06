import { useState } from "react";
import { X, Play, Sparkles, CheckCircle2, Users, History, Lock, MessageSquare } from "lucide-react";

export default function DemoModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("editor");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Play className="w-4 h-4 fill-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                NexusDocs Studio Interactive Tour
              </h3>
              <p className="text-xs text-slate-400">
                Explore real-time multi-user editing, comments, and version control
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/50 border-b border-slate-800 overflow-x-auto">
          {[
            { id: "editor", label: "Real-Time Editor", icon: Sparkles },
            { id: "presence", label: "Multi-User Presence", icon: Users },
            { id: "history", label: "Version History", icon: History },
            { id: "comments", label: "Inline Comments", icon: MessageSquare },
            { id: "security", label: "Permissions & Security", icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Demo Content Showcase */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === "editor" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm font-semibold text-white">
                      Q3 Enterprise Architecture Strategy.docx
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Live Syncing (sub-10ms)
                  </span>
                </div>
                <div className="font-mono text-xs text-slate-300 space-y-2 p-3 bg-slate-900/60 rounded-xl">
                  <p># Executive Summary</p>
                  <p className="text-indigo-300">
                    NexusDocs Studio utilizes a decoupled WebSocket event architecture with Optimistic UI updates.
                  </p>
                  <p className="text-slate-400">
                    Collaborator <span className="text-cyan-400 font-bold">@Yeabsira</span> is currently editing section 3.2...
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  TipTap Rich Text Engine
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  Auto-Save Debounce
                </div>
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  Conflict Resolution
                </div>
              </div>
            </div>
          )}

          {activeTab === "presence" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-sm font-semibold text-white">Active Collaborators in Room</h4>
                <div className="flex items-center gap-4 flex-wrap">
                  {[
                    { name: "Yeabsira Hailegiorgis", role: "Owner", color: "bg-indigo-500", text: "Editing Title" },
                    { name: "Sarah Connor", role: "Editor", color: "bg-emerald-500", text: "Viewing Paragraph 2" },
                    { name: "Alex Rivera", role: "Commenter", color: "bg-amber-500", text: "Adding Comment" },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <div className={`w-9 h-9 rounded-full ${user.color} flex items-center justify-center font-bold text-xs text-white`}>
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                          {user.name}
                          <span className="text-[10px] text-slate-400 font-normal">({user.role})</span>
                        </div>
                        <div className="text-[11px] text-indigo-400">{user.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-semibold text-white">Version Control Timeline</h4>
              <div className="space-y-2">
                {[
                  { v: "v4 (Current)", time: "Just now", author: "Yeabsira Hailegiorgis", note: "Added Security Specs" },
                  { v: "v3", time: "10 mins ago", author: "Sarah Connor", note: "Updated Intro Section" },
                  { v: "v2", time: "1 hour ago", author: "Alex Rivera", note: "Initial Document Creation" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold text-indigo-400">{item.v}</span>
                      <span className="text-white">{item.note}</span>
                    </div>
                    <div className="text-slate-400">{item.author} • {item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <h4 className="text-sm font-semibold text-white">Threaded Comments & Annotations</h4>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-300 font-mono bg-indigo-950/40 p-2 rounded border border-indigo-900/50">
                  "Selected text: High-concurrency WebSocket messaging architecture"
                </div>
                <div className="text-xs text-white font-medium">Alex Rivera: Should we add Redis adapter benchmark numbers here?</div>
                <div className="text-xs text-indigo-400 pl-4 border-l-2 border-indigo-600">
                  Yeabsira Hailegiorgis: Yes, updated with benchmark stats showing 100k msg/sec throughput.
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs text-slate-300">
              <h4 className="text-sm font-semibold text-white">Enterprise Role-Based Access Control</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-indigo-400 mb-1">OWNER / EDITOR</div>
                  <div>Full write access, version restoration, and collaborator management.</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-amber-400 mb-1">COMMENTER / VIEWER</div>
                  <div>Read-only access with inline commenting rights and live presence.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Ready to experience NexusDocs Studio live?
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-lg shadow-indigo-600/20"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
