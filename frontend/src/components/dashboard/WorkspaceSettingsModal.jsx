import React, { useState, useEffect } from 'react';
import { Settings, X, Save, Key, Cpu, Loader2 } from 'lucide-react';
import api from '../../../services/api';

const WorkspaceSettingsModal = ({ isOpen, onClose, workspace }) => {
  const [provider, setProvider] = useState('OPENAI');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen && workspace) {
      fetchConfig();
    }
  }, [isOpen, workspace]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/workspaces/${workspace.id}/ai/config`);
      if (response.data.config) {
        setProvider(response.data.config.provider || 'OPENAI');
        // We do not fetch the actual API key for security, just let user overwrite it
        if (response.data.config.hasApiKey) {
          setApiKey('••••••••••••••••••••••••••••••••'); // Dummy mask
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!apiKey) {
      setMessage('API Key is required');
      return;
    }
    
    // Don't save if they haven't changed the masked dummy key
    if (apiKey === '••••••••••••••••••••••••••••••••') {
      onClose();
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await api.post(`/workspaces/${workspace.id}/ai/config`, { provider, apiKey });
      setMessage('Settings saved successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Workspace Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wider">AI Configuration</h3>
          
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Provider
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="OPENAI">OpenAI</option>
                  <option value="ANTHROPIC">Anthropic (Claude)</option>
                  {/* <option value="LOCAL">Local / Custom</option> */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4" /> API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <p className="mt-1 text-xs text-slate-500">Your API key is securely encrypted and used only for your workspace.</p>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {message}
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsModal;
