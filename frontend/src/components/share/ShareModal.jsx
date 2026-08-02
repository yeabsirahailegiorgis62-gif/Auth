import { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Crown,
  Shield,
  Eye,
  MessageSquare,
  Search,
  Trash2,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  shareDocument,
  getCollaborators,
  updateCollaboratorRole,
  removeCollaborator,
  searchUsers,
} from "../../services/documentService";

export default function ShareModal({ isOpen, onClose, documentId, isOwner }) {
  const [collaborators, setCollaborators] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("VIEWER");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadCollaborators();
    }
  }, [isOpen, documentId]);

  async function loadCollaborators() {
    try {
      setLoading(true);
      const res = await getCollaborators(documentId);
      setCollaborators(res.collaborators || []);
    } catch (err) {
      console.error("Failed to load collaborators", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchUsers = async (val) => {
    setEmailInput(val);
    if (val.trim().length >= 2) {
      try {
        const res = await searchUsers(val);
        setSearchResults(res.users || []);
      } catch (err) {
        console.error("Search failed", err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectUser = (user) => {
    setEmailInput(user.email);
    setSearchResults([]);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    try {
      setInviting(true);
      setError(null);
      await shareDocument(documentId, emailInput.trim(), selectedRole);
      setSuccessMsg(`Shared with ${emailInput} successfully`);
      setEmailInput("");
      setSearchResults([]);
      setTimeout(() => setSuccessMsg(null), 3000);
      await loadCollaborators();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share document");
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setError(null);
      await updateCollaboratorRole(documentId, userId, newRole);
      await loadCollaborators();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleRemove = async (userId) => {
    try {
      setError(null);
      await removeCollaborator(documentId, userId);
      await loadCollaborators();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove collaborator");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Share Document</h3>
              <p className="text-xs text-slate-500">Manage collaborators and roles</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 border border-rose-200/60">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700 border border-emerald-200/60">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Share Form (Only Owner can invite) */}
        {isOwner && (
          <form onSubmit={handleInvite} className="relative mt-5 space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Invite by Email
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                {/* Autocomplete Dropdown */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 z-20 max-h-48 overflow-y-auto rounded-2xl bg-white p-2 shadow-xl border border-slate-100">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer"
                      >
                        <span className="font-medium text-slate-900">{user.name}</span>
                        <span className="text-slate-400">{user.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Role Selector */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="VIEWER">Viewer</option>
                <option value="COMMENTER">Commenter</option>
                <option value="EDITOR">Editor</option>
              </select>

              <button
                type="submit"
                disabled={inviting || !emailInput.trim()}
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {inviting ? "Inviting..." : "Invite"}
              </button>
            </div>
          </form>
        )}

        {/* Collaborators List */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            People with access ({collaborators.length})
          </h4>

          {loading ? (
            <div className="py-6 text-center text-xs text-slate-400">Loading collaborators...</div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
              {collaborators.map((c) => {
                const isItemOwner = c.role === "OWNER";

                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
                        style={{
                          backgroundColor: isItemOwner ? "#4F46E5" : "#10B981",
                        }}
                      >
                        {(c.user?.name || c.user?.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900">
                          {c.user?.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">{c.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isItemOwner ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200/60">
                          <Crown className="h-3.5 w-3.5" />
                          Owner
                        </span>
                      ) : isOwner ? (
                        <>
                          <select
                            value={c.role}
                            onChange={(e) => handleRoleChange(c.userId, e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none"
                          >
                            <option value="VIEWER">Viewer</option>
                            <option value="COMMENTER">Commenter</option>
                            <option value="EDITOR">Editor</option>
                          </select>

                          <button
                            onClick={() => handleRemove(c.userId)}
                            title="Remove collaborator"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200/60">
                          {c.role === "EDITOR" && <Shield className="h-3.5 w-3.5" />}
                          {c.role === "COMMENTER" && <MessageSquare className="h-3.5 w-3.5" />}
                          {c.role === "VIEWER" && <Eye className="h-3.5 w-3.5" />}
                          {c.role}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
