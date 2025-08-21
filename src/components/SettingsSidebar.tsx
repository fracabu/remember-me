import React, { useState } from 'react';

interface SettingsSidebarProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onSave }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  const handleSave = () => {
    if (apiKeyInput.trim()) {
      onSave(apiKeyInput.trim());
      setApiKeyInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-full lg:w-80 bg-white dark:bg-slate-800 border-b lg:border-r lg:border-b-0 border-slate-200 dark:border-slate-700 shadow-lg p-4 sm:p-6 flex flex-col transition-colors">
      <div className="flex-1">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400 mb-2">Configurazione</h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            Per utilizzare l'app, inserisci la tua chiave API di Google Gemini. 
            La chiave verrà mantenuta solo per questa sessione.
          </p>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 sm:mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Inserisci la tua chiave API"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-xs sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>
          
          <button
            onClick={handleSave}
            disabled={!apiKeyInput.trim()}
            className="w-full py-2 px-4 text-xs sm:text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            Conferma
          </button>
        </div>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Come ottenere la chiave API</h3>
          <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li>1. Vai su <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">Google AI Studio</a></li>
            <li>2. Accedi con il tuo account Google</li>
            <li>3. Clicca su "Create API Key"</li>
            <li>4. Copia la chiave e incollala qui sopra</li>
          </ol>
        </div>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <h3 className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Per sviluppatori</h3>
          <p className="text-xs text-blue-700 dark:text-blue-300 leading-tight">
            Aggiungi <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">VITE_GEMINI_API_KEY=la_tua_chiave</code> 
            nel file <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded text-xs">.env.local</code> per evitare di inserirla ogni volta.
          </p>
        </div>
      </div>
    </div>
  );
};