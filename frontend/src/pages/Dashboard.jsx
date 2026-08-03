import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  getDocuments,
  createDocument,
  deleteDocument,
  duplicateDocument,
} from "../services/documentService";
import * as favoriteService from "../services/favoriteService";
import * as documentService from "../services/documentService";
import CommandPalette from "../components/productivity/CommandPalette";
import NotificationDropdown from "../components/productivity/NotificationDropdown";
import ActivityFeedDrawer from "../components/productivity/ActivityFeedDrawer";
import KeyboardShortcutsModal from "../components/productivity/KeyboardShortcutsModal";
import ProfileModal from "../components/profile/ProfileModal";
import ImportModal from "../components/exportImport/ImportModal";
import {
  Plus,
  Search,
  FileText,
  Clock,
  User,
  Users,
  LogOut,
  Sparkles,
  Trash2,
  Copy,
  FolderPlus,
  Grid,
  List,
  Star,
  Activity,
  RotateCcw,
  AlertCircle,
  Command,
  Keyboard,
  Upload,
  Sun,
  Moon,
} from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'recent' | 'shared' | 'favorites' | 'trash'
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // Drawers & Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const fetchFavoriteIds = useCallback(async () => {
    try {
      const data = await favoriteService.getFavorites();
      const favSet = new Set((data.favorites || []).map((d) => d.id));
      setFavoriteIds(favSet);
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    }
  }, []);

  const fetchDocs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === "favorites") {
        const data = await favoriteService.getFavorites();
        setDocuments(data.favorites || []);
      } else if (activeTab === "trash") {
        const res = await apiGetTrash();
        setDocuments(res.documents || []);
      } else {
        const data = await getDocuments({
          filter: activeTab === "recent" ? "recent" : activeTab === "shared" ? "shared" : "all",
          search: searchQuery,
        });
        setDocuments(data.documents || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchDocs();
    fetchFavoriteIds();
  }, [fetchDocs, fetchFavoriteIds]);

  // Keyboard shortcut listeners (Ctrl+K and Ctrl+/)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateDoc = async () => {
    try {
      setCreating(true);
      const data = await createDocument({ title: "Untitled Document", content: "" });
      navigate(`/documents/${data.document.id}`);
    } catch (err) {
      alert("Failed to create document");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleFavorite = async (e, docId) => {
    e.stopPropagation();
    try {
      if (favoriteIds.has(docId)) {
        await favoriteService.removeFavorite(docId);
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          next.delete(docId);
          return next;
        });
      } else {
        await favoriteService.addFavorite(docId);
        setFavoriteIds((prev) => new Set([...prev, docId]));
      }
      if (activeTab === "favorites") fetchDocs();
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const handleMoveToTrash = async (e, docId) => {
    e.stopPropagation();
    if (!window.confirm("Move this document to trash?")) return;
    try {
      await deleteDocument(docId); // Calls /api/documents/:id (trash)
      fetchDocs();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to move to trash");
    }
  };

  const handleRestoreDoc = async (e, docId) => {
    e.stopPropagation();
    try {
      await documentService.restoreDocument(docId);
      fetchDocs();
    } catch (err) {
      alert("Failed to restore document");
    }
  };

  const handlePermanentDelete = async (e, docId) => {
    e.stopPropagation();
    if (!window.confirm("Permanently delete this document? This cannot be undone.")) return;
    try {
      await documentService.permanentDeleteDocument(docId);
      fetchDocs();
    } catch (err) {
      alert("Failed to delete document permanently");
    }
  };

  const handleDuplicate = async (e, docId) => {
    e.stopPropagation();
    try {
      await duplicateDocument(docId);
      fetchDocs();
    } catch (err) {
      alert("Failed to duplicate document");
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-4 py-3 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  CollabWrite Studio
                </h1>
                <p className="text-xs text-slate-500">Welcome, {user?.name}</p>
              </div>
            </div>

            {/* Middle Quick Search Bar */}
            <div
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2 text-xs font-medium text-slate-400 cursor-pointer hover:bg-slate-100 transition-all w-80 shadow-sm"
            >
              <Search className="h-4 w-4 text-indigo-500" />
              <span>Search documents... (Ctrl + K)</span>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Notification Dropdown Menu */}
              <NotificationDropdown />

              {/* Activity Feed Toggle */}
              <button
                onClick={() => setIsActivityOpen(!isActivityOpen)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 ${
                  isActivityOpen ? "border-indigo-600 text-indigo-600 bg-indigo-50" : ""
                }`}
                title="Activity Feed"
              >
                <Activity className="h-4 w-4" />
              </button>

              {/* Keyboard Shortcuts Toggle */}
              <button
                onClick={() => setIsShortcutsOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                title="Keyboard Shortcuts (Ctrl + /)"
              >
                <Keyboard className="h-4 w-4" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-600" />}
              </button>

              {/* User Profile Button */}
              <button
                onClick={() => setIsProfileOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50"
                title="User Profile & Settings"
              >
                <User className="h-4 w-4" />
              </button>

              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-600"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Header Title & Create Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Document Workspace</h2>
                <p className="text-xs text-slate-500">
                  Manage, organize, and collaborate on real-time documents.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  <Upload className="h-4 w-4 text-indigo-600" />
                  <span>Import</span>
                </button>

                <button
                  onClick={handleCreateDoc}
                  disabled={creating}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {creating ? "Creating..." : "New Document"}
                </button>
              </div>
            </div>

            {/* Navigation Tabs & Controls Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "All Documents", icon: FileText },
                  { id: "recent", label: "Recently Opened", icon: Clock },
                  { id: "shared", label: "Shared With Me", icon: Users },
                  { id: "favorites", label: "Favorites ⭐", icon: Star },
                  { id: "trash", label: "Trash 🗑️", icon: Trash2 },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? "bg-slate-900 text-white shadow-md"
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <TabIcon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg border transition-all ${
                    viewMode === "grid"
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg border transition-all ${
                    viewMode === "list"
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Documents List / Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-40 rounded-3xl bg-slate-200/60 animate-pulse" />
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">No documents found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  {activeTab === "trash"
                    ? "Your trash is empty."
                    : activeTab === "favorites"
                    ? "No favorited documents yet. Star a document to bookmark it."
                    : "Create a new document to start collaborating."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => {
                  const isFav = favoriteIds.has(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => activeTab !== "trash" && navigate(`/documents/${doc.id}`)}
                      className="group relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-xl cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="truncate text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {doc.title}
                          </h3>

                          {activeTab !== "trash" && (
                            <button
                              onClick={(e) => handleToggleFavorite(e, doc.id)}
                              className={`p-1 rounded-lg transition-all ${
                                isFav ? "text-amber-500 fill-amber-500" : "text-slate-300 hover:text-amber-400"
                              }`}
                              title={isFav ? "Unstar document" : "Star document"}
                            >
                              <Star className={`h-4 w-4 ${isFav ? "fill-amber-500 text-amber-500" : ""}`} />
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                          {typeof doc.content === "string" ? doc.content.slice(0, 100) : "Rich text content..."}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                        <span>Owner: {doc.owner?.name || "Collaborator"}</span>

                        <div className="flex items-center gap-1">
                          {activeTab === "trash" ? (
                            <>
                              <button
                                onClick={(e) => handleRestoreDoc(e, doc.id)}
                                className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg font-semibold"
                                title="Restore document"
                              >
                                <RotateCcw className="h-3 w-3" />
                                Restore
                              </button>

                              <button
                                onClick={(e) => handlePermanentDelete(e, doc.id)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                                title="Delete permanently"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => handleDuplicate(e, doc.id)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                                title="Duplicate document"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>

                              <button
                                onClick={(e) => handleMoveToTrash(e, doc.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Move to trash"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm divide-y divide-slate-100">
                {documents.map((doc) => {
                  const isFav = favoriteIds.has(doc.id);
                  return (
                    <div
                      key={doc.id}
                      onClick={() => activeTab !== "trash" && navigate(`/documents/${doc.id}`)}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-bold text-slate-900">{doc.title}</h4>
                          <span className="text-[11px] text-slate-500">
                            Owner: {doc.owner?.name || "Collaborator"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeTab !== "trash" && (
                          <button
                            onClick={(e) => handleToggleFavorite(e, doc.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-500"
                          >
                            <Star className={`h-4 w-4 ${isFav ? "fill-amber-500 text-amber-500" : ""}`} />
                          </button>
                        )}

                        {activeTab === "trash" ? (
                          <button
                            onClick={(e) => handleRestoreDoc(e, doc.id)}
                            className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={(e) => handleMoveToTrash(e, doc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Slide-over Activity Feed Drawer */}
      <ActivityFeedDrawer isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} />

      {/* Global Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onCreateDocument={handleCreateDoc}
      />

      {/* Keyboard Shortcuts Modal (Ctrl + /) */}
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onProfileUpdated={(updated) => fetchDocs()}
      />

      {/* Import Modal */}
      <ImportModal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />
    </div>
  );
}

// Helper to fetch trash items
async function apiGetTrash() {
  const api = require("../services/api").default;
  const res = await api.get("/documents/trash");
  return res.data;
}
