import React, { useState } from 'react';
import { Sparkles, Loader2, Wand2, Languages, Type, BookOpen, Presentation, Check, X } from 'lucide-react';
import api from '../../../services/api';

const AiAssistantMenu = ({ editor, workspaceId, documentId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState(null); // The selected action to perform
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState('');
  
  const selectedText = editor ? editor.state.doc.textBetween(
    editor.state.selection.from,
    editor.state.selection.to,
    ' '
  ) : '';

  const handleAction = async (actionType, payload = {}) => {
    if (!selectedText && actionType !== 'title' && actionType !== 'continue') {
      setError('Please select some text first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/workspaces/${workspaceId}/ai/${documentId}/action`, {
        action: actionType,
        payload: {
          text: selectedText || editor.getText(), // If no text selected, pass whole doc for title/continue
          ...payload
        }
      });

      if (response.data.success) {
        const generatedText = response.data.result;
        
        // Replace selection or append
        if (selectedText) {
          editor.chain().focus().insertContent(generatedText).run();
        } else {
          // If no selection, just append it at the end
          editor.chain().focus().insertContent(`\n${generatedText}`).run();
        }
        
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to generate AI response. Have you configured your API keys?');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPrompt = (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    handleAction('custom', { customPrompt });
  };

  return (
    <div className="absolute top-16 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
      <div className="bg-indigo-50 border-b border-indigo-100 p-3 flex justify-between items-center">
        <div className="flex items-center text-indigo-700 font-medium">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Assistant
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3">
        {error && (
          <div className="mb-3 p-2 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-600" />
            <p className="text-sm">Thinking...</p>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Edit Selection</div>
            
            <button onClick={() => handleAction('rewrite')} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex items-center text-gray-700 transition">
              <Wand2 className="w-4 h-4 mr-3 text-gray-400" /> Rewrite
            </button>
            <button onClick={() => handleAction('grammar')} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex items-center text-gray-700 transition">
              <Check className="w-4 h-4 mr-3 text-gray-400" /> Fix Grammar
            </button>
            <button onClick={() => handleAction('summarize')} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex items-center text-gray-700 transition">
              <BookOpen className="w-4 h-4 mr-3 text-gray-400" /> Summarize
            </button>
            <button onClick={() => handleAction('explain')} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex items-center text-gray-700 transition">
              <Presentation className="w-4 h-4 mr-3 text-gray-400" /> Explain
            </button>
            
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4 mb-2 px-2">Generate</div>
            
            <button onClick={() => handleAction('continue')} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm flex items-center text-gray-700 transition">
              <Type className="w-4 h-4 mr-3 text-gray-400" /> Continue Writing
            </button>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <form onSubmit={handleCustomPrompt} className="relative">
                <input 
                  type="text" 
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ask AI to..." 
                  className="w-full text-sm py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" className="absolute right-2 top-2 text-indigo-600 hover:text-indigo-800">
                  <Sparkles className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAssistantMenu;
