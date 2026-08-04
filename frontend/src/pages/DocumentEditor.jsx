import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";
import { getDocumentById, updateDocument } from "../services/documentService";
import { useDocumentCollaboration } from "../hooks/useDocumentCollaboration";
import { usePresence } from "../hooks/usePresence";
import { useComments } from "../hooks/useComments";
import { useAutosave } from "../hooks/useAutosave";
import * as revisionService from "../services/revisionService";
import RichTextEditor from "../components/editor/RichTextEditor";
import CollaboratorAvatars from "../components/presence/CollaboratorAvatars";
import PresencePanel from "../components/presence/PresencePanel";
import TypingIndicator from "../components/presence/TypingIndicator";
import LiveCursorsOverlay from "../components/presence/LiveCursorsOverlay";
import ShareModal from "../components/share/ShareModal";
import CommentSidebar from "../components/comments/CommentSidebar";
import SaveStatusIndicator from "../components/editor/SaveStatusIndicator";
import RevisionHistoryPanel from "../components/revisions/RevisionHistoryPanel";
import ExportModal from "../components/exportImport/ExportModal";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  FileText,
  Clock,
  User,
  Users,
  AlertCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  Share2,
  Crown,
  Shield,
  Eye,
  MessageSquare,
  History,
  Download,
  Sun,
  Moon,
} from "lucide-react";

export default function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const { theme, toggleTheme } = useTheme();

  const [document, setDocument] = useState(null);
  const [userRole, setUserRole] = useState("VIEWER");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals & Panels
  const [isPresencePanelOpen, setIsPresencePanelOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  const [selectionInfo, setSelectionInfo] = useState({
    selectedText: "",
    fromPos: null,
    toPos: null,
  });

  const editorContainerRef = useRef(null);

  const isOwner = userRole === "OWNER";
  const canEdit = userRole === "OWNER" || userRole === "EDITOR";

  // Autosave Hook
  const {
    saveStatus,
    lastSavedAt,
    scheduleSave,
    forceSaveNow,
  } = useAutosave(id, canEdit);

  // Comments Hook
  const comments = useComments(id, socket);

  // Socket.IO Collaboration Hook
  const handleRemoteUpdate = useCallback((newRemoteContent, updatedBy) => {
    setContent(newRemoteContent);
  }, []);

  const handleStateSync = useCallback((syncData) => {
    if (syncData.content) {
      setContent(syncData.content);
    }
  }, []);

  const { emitUpdate, connectionStatus } = useDocumentCollaboration({
    documentId: id,
    onRemoteUpdate: handleRemoteUpdate,
    onStateSync: handleStateSync,
  });

  // Socket.IO Presence Hook
  const {
    collaborators,
    remoteCursors,
    typingUsers,
    updateCursor,
    notifyTyping,
  } = usePresence(id);

  // Fetch Revisions timeline
  const fetchRevisions = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingRevisions(true);
      const data = await revisionService.getRevisions(id);
      setRevisions(data.revisions || []);
    } catch (err) {
      console.error("Failed to fetch revision timeline", err);
    } finally {
      setLoadingRevisions(false);
    }
  }, [id]);

  useEffect(() => {
    async function fetchDoc() {
      try {
        setLoading(true);
        const res = await getDocumentById(id);
        const docData = res.document || res;

        setDocument(docData);
        setTitle(docData.title || "");
        setContent(docData.content || null);

        const isDocOwner =
          user &&
          docData.ownerId !== undefined &&
          String(docData.ownerId) === String(user.id);

        const derivedRole = docData.userRole || (isDocOwner ? "OWNER" : "VIEWER");

        setUserRole(derivedRole);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load document");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchDoc();
      fetchRevisions();
    }
  }, [id, user, fetchRevisions]);

  // Real-time Socket Event Listeners for Permissions & Revision Restores
  useEffect(() => {
    if (!socket || !id) return;

    const handlePermissionChanged = (data) => {
      if (data.documentId === id && data.userId === user?.id) {
        setUserRole(data.role);
      }
    };

    const handleAccessRevoked = (data) => {
      if (data.documentId === id && data.userId === user?.id) {
        alert("Your access to this document has been revoked by the owner.");
        navigate("/dashboard");
      }
    };

    const handleRevisionRestored = (data) => {
      if (data.documentId === id) {
        setContent(data.document.content);
        fetchRevisions();
      }
    };

    socket.on("permission:changed", handlePermissionChanged);
    socket.on("access:revoked", handleAccessRevoked);
    socket.on("revision:restored", handleRevisionRestored);

    return () => {
      socket.off("permission:changed", handlePermissionChanged);
      socket.off("access:revoked", handleAccessRevoked);
      socket.off("revision:restored", handleRevisionRestored);
    };
  }, [socket, id, user, navigate, fetchRevisions]);

  const handleContentChange = (newJsonContent) => {
    if (!canEdit) return;
    setContent(newJsonContent);

    // Schedule debounced background autosave
    scheduleSave(newJsonContent, title);

    // Broadcast content edit & typing indicator to live room
    emitUpdate(newJsonContent);
    notifyTyping();
  };

  const handleTitleChange = (e) => {
    if (!isOwner) return;
    const newTitle = e.target.value;
    setTitle(newTitle);
    scheduleSave(content, newTitle);
    notifyTyping();
  };

  const handleManualSave = async () => {
    if (!canEdit) return;
    await forceSaveNow(content, title);
    await fetchRevisions();
  };

  const handleCreateCheckpoint = async () => {
    if (!canEdit) return;
    try {
      await revisionService.createCheckpoint(id);
      fetchRevisions();
    } catch (err) {
      console.error("Failed to create snapshot", err);
    }
  };

  const handleRestoreRevision = async (revisionId) => {
    if (!canEdit) return;
    try {
      const res = await revisionService.restoreRevision(id, revisionId);
      setContent(res.document.content);
      fetchRevisions();
    } catch (err) {
      console.error("Failed to restore revision", err);
    }
  };

  // Keyboard Ctrl+S listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [title, content, canEdit]);

  // Track cursor position for live remote cursor sharing
  const handleMouseMove = (e) => {
    if (!editorContainerRef.current) return;
    const rect = editorContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left);
    const y = Math.max(0, e.clientY - rect.top);
    updateCursor(x, y);
  };

  const handleSelectionChange = ({ selectedText, fromPos, toPos }) => {
    setSelectionInfo({ selectedText, fromPos, toPos });
    if (selectedText && selectedText.trim() && !isCommentsSidebarOpen) {
      setIsCommentsSidebarOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-600">
            Loading document & collaboration session...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Error Loading Document</h2>
          <p className="mt-2 text-xs text-slate-500">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 rounded-2xl bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow-lg transition-all hover:bg-slate-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const roleBadgeConfig = {
    OWNER: { label: "Owner", icon: Crown, color: "bg-amber-50 text-amber-700 border-amber-200" },
    EDITOR: { label: "Editor", icon: Shield, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    COMMENTER: { label: "Commenter", icon: MessageSquare, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    VIEWER: { label: "Viewer", icon: Eye, color: "bg-slate-100 text-slate-600 border-slate-200" },
  };

  const RoleBadgeIcon = roleBadgeConfig[userRole]?.icon || Eye;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Left Navigation & Title */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 shrink-0"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Untitled Document"
                    className="truncate bg-transparent text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 rounded-lg px-1.5 py-0.5 border border-transparent hover:border-slate-200 transition-all"
                  />
                ) : (
                  <h1 className="truncate text-base font-bold text-slate-900 px-1.5">
                    {title}
                  </h1>
                )}

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border shrink-0 ${
                    roleBadgeConfig[userRole]?.color || roleBadgeConfig.VIEWER.color
                  }`}
                >
                  <RoleBadgeIcon className="h-3 w-3" />
                  {roleBadgeConfig[userRole]?.label || "Viewer"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Actions & Presence Controls */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Dynamic Autosave Status Indicator */}
            <SaveStatusIndicator status={saveStatus} lastSavedAt={lastSavedAt} />

            {/* Live Connection Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                connectionStatus === "connected"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                  : "bg-amber-50 text-amber-700 border-amber-200/80"
              }`}
            >
              {connectionStatus === "connected" ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Live Sync</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-600" />
                  <span>Connecting...</span>
                </>
              )}
            </div>

            {/* Active Collaborators Avatars Stack */}
            <CollaboratorAvatars
              collaborators={collaborators}
              currentUser={user}
              onOpenPresence={() => setIsPresencePanelOpen(true)}
            />

            {/* Export Document Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50"
              title="Export Document"
            >
              <Download className="h-3.5 w-3.5 text-indigo-600" />
              <span>Export</span>
            </button>

            {/* Share Document Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition-all hover:bg-indigo-100"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Share</span>
            </button>

            {canEdit ? (
              <button
                onClick={handleManualSave}
                disabled={saveStatus === "saving"}
                title="Save (Ctrl+S)"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saveStatus === "saving" ? "Saving..." : "Save (Ctrl+S)"}
              </button>
            ) : (
              <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                Read Only
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Layout with Flex Sidebar Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Center Section */}
        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6">
          <div className="mx-auto max-w-5xl">
            {/* Animated Typing Indicator */}
            <div className="mb-3 flex justify-end h-7">
              <TypingIndicator typingUsers={typingUsers} />
            </div>

            {/* Editor Container Wrapper for Live Cursor Tracking */}
            <div
              ref={editorContainerRef}
              onMouseMove={handleMouseMove}
              className="relative rounded-3xl"
            >
              <LiveCursorsOverlay
                remoteCursors={remoteCursors}
                editorContainerRef={editorContainerRef}
              />

              <RichTextEditor
                content={content}
                onChange={handleContentChange}
                isEditable={canEdit}
                isCommentsOpen={isCommentsSidebarOpen}
                onToggleComments={() => {
                  setIsCommentsSidebarOpen(!isCommentsSidebarOpen);
                  if (isHistoryPanelOpen) setIsHistoryPanelOpen(false);
                }}
                unreadCommentsCount={comments.threads.filter((t) => !t.resolved).length}
                isHistoryOpen={isHistoryPanelOpen}
                onToggleHistory={() => {
                  setIsHistoryPanelOpen(!isHistoryPanelOpen);
                  if (isCommentsSidebarOpen) setIsCommentsSidebarOpen(false);
                }}
                onSelectionChange={handleSelectionChange}
              />
            </div>
          </div>
        </main>

        {/* Comment & Discussion Review Panel Sidebar */}
        <CommentSidebar
          isOpen={isCommentsSidebarOpen}
          onClose={() => setIsCommentsSidebarOpen(false)}
          threads={comments.threads}
          loading={comments.loading}
          currentUserId={user?.id}
          userRole={userRole}
          activeThreadId={comments.activeThreadId}
          onSelectThread={(tId) => comments.setActiveThreadId(tId)}
          onCreateThread={comments.createThread}
          onAddReply={comments.addReply}
          onUpdateComment={comments.updateComment}
          onDeleteComment={comments.deleteComment}
          onResolveThread={comments.resolveThread}
          onReopenThread={comments.reopenThread}
          selectedText={selectionInfo.selectedText}
          selectionPositions={selectionInfo}
        />

        {/* Version History Revision Panel Sidebar */}
        <RevisionHistoryPanel
          isOpen={isHistoryPanelOpen}
          onClose={() => setIsHistoryPanelOpen(false)}
          revisions={revisions}
          loading={loadingRevisions}
          userRole={userRole}
          onCreateCheckpoint={handleCreateCheckpoint}
          onRestoreRevision={handleRestoreRevision}
        />
      </div>

      {/* Presence Slide-Over Drawer */}
      <PresencePanel
        isOpen={isPresencePanelOpen}
        onClose={() => setIsPresencePanelOpen(false)}
        collaborators={collaborators}
        currentUser={user}
      />

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentId={id}
        isOwner={isOwner}
      />

      {/* Export Modal Dialog */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        documentId={id}
        documentTitle={title}
      />
    </div>
  );
}
