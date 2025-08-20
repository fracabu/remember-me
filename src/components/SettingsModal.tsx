import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(apiKeyInput);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 md:p-8">
        <h2 className="text-2xl font-bold text-brand-primary mb-4">API Key Settings</h2>
        <p className="text-slate-600 mb-6">
          Please enter your Google Gemini API key to use this application. The key is only stored for your current session.
        </p>
        
        <div className="space-y-2">
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700">
                Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter your API key"
              className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
            />
        </div>
        
        <p className="text-xs text-slate-500 mt-2">
            Don't have a key? Get one from {' '}
            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-brand-primary hover:underline"
            >
                Google AI Studio
            </a>.
        </p>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-transparent rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!apiKeyInput}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};
