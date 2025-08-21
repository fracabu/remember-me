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
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-md p-4 sm:p-6 md:p-8 transition-colors max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3 sm:mb-4">API Key Settings</h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-4 sm:mb-6">
          Please enter your Google Gemini API key to use this application. The key is only stored for your current session.
        </p>
        
        <form id="apiKeyForm" onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-2">
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter your API key"
              className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              autoComplete="off"
            />
        </form>
        
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Don't have a key? Get one from {' '}
            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-500 hover:underline"
            >
                Google AI Studio
            </a>.
        </p>

        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-600 border border-transparent rounded-md hover:bg-slate-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="apiKeyForm"
            disabled={!apiKeyInput}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed order-1 sm:order-2"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};
