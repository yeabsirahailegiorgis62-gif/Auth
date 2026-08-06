import { useState, useEffect } from "react";
import { Folder, FolderPlus, FolderOpen, MoreVertical, Edit2, Trash2, Tag, Plus } from "lucide-react";
import api from "../../services/api";

export default function FolderSidebar({ selectedFolderId, onSelectFolder, selectedTagId, onSelectTag }) {
  const [workspaceId, setWorkspaceId] = useState(null);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchDefaultWorkspace();
  }, []);

  useEffect(() => {
    if (workspaceId) {
      fetchFolders();
      fetchTags();
    }
  }, [workspaceId]);

  const fetchDefaultWorkspace = async () => {
    try {
      const res = await api.get('/workspaces');
      if (res.data.workspaces && res.data.workspaces.length > 0) {
        setWorkspaceId(res.data.workspaces[0].workspace.id);
      }
    } catch (err) {
      console.error("Failed to fetch workspaces", err);
    }
  };

  const fetchFolders = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${workspaceId}/folders`);
      setFolders(res.data.folders || []);
    } catch (err) {
      console.error("Failed to fetch folders", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/tags`);
      setTags(res.data.tags || []);
    } catch (err) {
      console.error("Failed to fetch tags", err);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await api.post(`/workspaces/${workspaceId}/folders`, { name: newFolderName });
      setNewFolderName("");
      setIsCreating(false);
      fetchFolders();
    } catch (err) {
      alert("Failed to create folder");
    }
  };

  const handleDeleteFolder = async (folderId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this folder?")) return;
    try {
      await api.delete(`/workspaces/${workspaceId}/folders/${folderId}`);
      if (selectedFolderId === folderId) {
        onSelectFolder(null);
      }
      fetchFolders();
    } catch (err) {
      alert("Failed to delete folder");
    }
  };

  return (
    <div className="w-64 flex-shrink-0 bg-white border-r border-slate-200 h-full flex flex-col hidden md:flex">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Folder className="h-4 w-4 text-indigo-500" />
          Folders
        </h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors"
          title="New Folder"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      <div className="p-3 overflow-y-auto flex-1">
        {isCreating && (
          <form onSubmit={handleCreateFolder} className="mb-3 px-2">
            <input
              type="text"
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => setIsCreating(false)}
              placeholder="Folder name..."
              className="w-full px-3 py-1.5 text-sm border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </form>
        )}

        <div className="space-y-1">
          <button
            onClick={() => {
              onSelectFolder(null);
              if (onSelectTag) onSelectTag(null);
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left ${
              !selectedFolderId && !selectedTagId ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FolderOpen className={`h-4 w-4 ${!selectedFolderId && !selectedTagId ? "text-indigo-600" : "text-slate-400"}`} />
            All Documents
          </button>

          {loading ? (
            <div className="px-3 py-2 text-xs text-slate-400">Loading folders...</div>
          ) : folders.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400">No folders yet.</div>
          ) : (
            folders.map(folder => (
              <div 
                key={folder.id}
                onClick={() => onSelectFolder(folder.id)}
                className={`group w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                  selectedFolderId === folder.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Folder className={`h-4 w-4 flex-shrink-0 ${selectedFolderId === folder.id ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="truncate">{folder.name}</span>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                  <button 
                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                    className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tags Section */}
        <div className="mt-6">
          <div className="p-2 border-b border-slate-100 flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" />
              Tags
            </h2>
          </div>
          
          <div className="space-y-1">
            {tags.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400">No tags yet.</div>
            ) : (
              tags.map(tag => (
                <div 
                  key={tag.id}
                  onClick={() => onSelectTag && onSelectTag(tag.id)}
                  className={`group w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-all cursor-pointer ${
                    selectedTagId === tag.id ? "bg-indigo-50 text-indigo-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div 
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: tag.color || "#6366f1" }} 
                    />
                    <span className="truncate">{tag.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
