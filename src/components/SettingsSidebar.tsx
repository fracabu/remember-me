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
    <div className="w-80 bg-white border-r border-slate-200 shadow-lg p-6 flex flex-col">
      <div className="flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brand-primary mb-2">Configurazione</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Per utilizzare l'app, inserisci la tua chiave API di Google Gemini. 
            La chiave verrà mantenuta solo per questa sessione.
          </p>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700 mb-2">
              Gemini API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Inserisci la tua chiave API"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm"
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
            className="w-full py-2 px-4 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Conferma
          </button>
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Come ottenere la chiave API</h3>
          <ol className="text-xs text-slate-600 space-y-1">
            <li>1. Vai su <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">Google AI Studio</a></li>
            <li>2. Accedi con il tuo account Google</li>
            <li>3. Clicca su "Create API Key"</li>
            <li>4. Copia la chiave e incollala qui sopra</li>
          </ol>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Per sviluppatori</h3>
          <p className="text-xs text-blue-700">
            Aggiungi <code className="bg-blue-100 px-1 rounded">VITE_GEMINI_API_KEY=la_tua_chiave</code> 
            nel file <code className="bg-blue-100 px-1 rounded">.env.local</code> per evitare di inserirla ogni volta.
          </p>
        </div>
      </div>
    </div>
  );
};