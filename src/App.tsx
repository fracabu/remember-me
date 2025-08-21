import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Recorder } from './components/Recorder';
import { ReminderList } from './components/ReminderList';
import { SettingsModal } from './components/SettingsModal';
import { SettingsSidebar } from './components/SettingsSidebar';
import { SuggestionsModal } from './components/SuggestionsModal';
import { ChatModal } from './components/ChatModal';
import { processVoiceInput, generateTaskSuggestions, sendChatMessage } from './services/geminiService';
import type { ChatMessage } from './services/geminiService';
import type { Reminder } from './types';

const APP_STORAGE_KEY = 'remember-me-reminders';

const App: React.FC = () => {
  // Check for API key from environment first - ensure it's not just defined but actually has a value
  const rawEnvApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const envApiKey = rawEnvApiKey && rawEnvApiKey.trim() !== '' ? rawEnvApiKey : null;
  
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const storedReminders = localStorage.getItem(APP_STORAGE_KEY);
      return storedReminders ? JSON.parse(storedReminders) : [];
    } catch (error) {
      console.error("Failed to load reminders from localStorage:", error);
      return [];
    }
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(envApiKey);
  // Only show settings if no environment API key is available
  const [isSettingsOpen, setIsSettingsOpen] = useState(!envApiKey);
  
  // Suggestions modal state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentSuggestionReminder, setCurrentSuggestionReminder] = useState<Reminder | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  // Chat modal state
  const [showChat, setShowChat] = useState(false);
  const [currentChatReminder, setCurrentChatReminder] = useState<Reminder | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Re-recording state
  const [reRecordingId, setReRecordingId] = useState<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(reminders));
    } catch (error) {
      console.error("Failed to save reminders to localStorage:", error);
    }
  }, [reminders]);
  
  const handleSaveApiKey = useCallback((newApiKey: string) => {
    if (newApiKey) {
      setApiKey(newApiKey);
      setIsSettingsOpen(false);
      setError(null);
    }
  }, []);

  const handleSaveApiKeyFromSidebar = useCallback((newApiKey: string) => {
    if (newApiKey) {
      setApiKey(newApiKey);
      setError(null);
    }
  }, []);

  const handleNewTranscript = useCallback(async (transcript: string) => {
    if (!transcript) return;
    if (!apiKey) {
      setError("Per favore imposta la tua chiave API nelle impostazioni prima di creare un promemoria.");
      setIsSettingsOpen(true);
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      let newReminder;
      
      if (reRecordingId) {
        // Find existing reminder to update
        const existingReminder = reminders.find(r => r.id === reRecordingId);
        if (existingReminder) {
          // Pass existing reminder for integration
          newReminder = await processVoiceInput(transcript, apiKey, {
            title: existingReminder.title,
            description: existingReminder.description,
            date: existingReminder.date,
            time: existingReminder.time
          });
        } else {
          // Fallback to new reminder if existing not found
          newReminder = await processVoiceInput(transcript, apiKey);
        }
        
        // Update existing reminder
        setReminders(prev => prev.map(reminder => 
          reminder.id === reRecordingId 
            ? { ...newReminder, id: reRecordingId }
            : reminder
        ));
        setReRecordingId(null);
      } else {
        // Create new reminder
        newReminder = await processVoiceInput(transcript, apiKey);
        setReminders(prev => [{ ...newReminder, id: Date.now() }, ...prev]);
      }
    } catch (err) {
      console.error(err);
      setError('Mi dispiace, non sono riuscito a capire. Riprova.');
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, reRecordingId, reminders]);

  const handleDeleteReminder = useCallback((id: number) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleGetSuggestions = useCallback(async (reminder: Reminder) => {
    if (!apiKey) {
      alert('Chiave API mancante. Configura la tua chiave API per usare i suggerimenti.');
      return;
    }

    setCurrentSuggestionReminder(reminder);
    setIsLoadingSuggestions(true);
    setShowSuggestions(true);
    setSuggestions(null);
    
    try {
      const taskSuggestions = await generateTaskSuggestions(reminder, apiKey);
      setSuggestions(taskSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions(null);
      alert('Errore nel generare i suggerimenti. Riprova più tardi.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [apiKey]);

  const handleCloseSuggestions = useCallback(() => {
    setShowSuggestions(false);
    setCurrentSuggestionReminder(null);
    // Keep suggestions in state for potential re-opening
  }, []);

  const handleStartChat = useCallback((reminder: Reminder) => {
    if (!apiKey) {
      alert('Chiave API mancante. Configura la tua chiave API per usare la chat.');
      return;
    }
    setCurrentChatReminder(reminder);
    setShowChat(true);
  }, [apiKey]);

  const handleCloseChat = useCallback(() => {
    setShowChat(false);
    setCurrentChatReminder(null);
  }, []);

  const handleSendChatMessage = useCallback(async (message: string, chatHistory: ChatMessage[]): Promise<string> => {
    if (!apiKey || !currentChatReminder) {
      throw new Error('API key or reminder not available');
    }
    
    setIsChatLoading(true);
    try {
      const response = await sendChatMessage(message, apiKey, currentChatReminder, chatHistory);
      return response;
    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    } finally {
      setIsChatLoading(false);
    }
  }, [apiKey, currentChatReminder]);

  const handleStartReRecording = useCallback((reminder: Reminder) => {
    setReRecordingId(reminder.id);
    setError(null);
    // The user will now need to click the record button to start re-recording
  }, []);

  const handleCancelReRecording = useCallback(() => {
    setReRecordingId(null);
  }, []);
  
  // Show sidebar if no API key is available (both from env and user input)
  const showSidebar = !apiKey && !envApiKey;

  return (
    <div className="min-h-screen bg-gray-200 dark:bg-slate-900 font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <div className="flex flex-col lg:flex-row">
        {/* Settings Sidebar - only show if no API key */}
        <SettingsSidebar 
          isOpen={showSidebar}
          onSave={handleSaveApiKeyFromSidebar}
        />
        
        {/* Main Content */}
        <div className={`flex-1 ${showSidebar ? 'lg:ml-0' : ''}`}>
          <main className={`mx-auto p-4 sm:p-6 lg:p-8 ${showSidebar ? 'max-w-4xl' : 'max-w-2xl'}`}>
            <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 transition-colors">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {reRecordingId ? 'Ri-registra il promemoria' : 'Cosa hai in mente?'}
                </h2>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
                  {reRecordingId 
                    ? 'Parla di nuovo per sostituire il contenuto del promemoria selezionato.'
                    : 'Premi il pulsante e inizia a parlare. Penso io al resto.'
                  }
                </p>
                {reRecordingId && (
                  <button
                    onClick={handleCancelReRecording}
                    className="mt-2 text-sm text-red-500 hover:text-red-700 underline"
                  >
                    Annulla ri-registrazione
                  </button>
                )}
              </div>
              
              {!apiKey && !envApiKey && !showSidebar && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
                  <p className="font-bold">Chiave API Richiesta</p>
                  <p>Per favore <button onClick={() => setIsSettingsOpen(true)} className="underline font-medium">imposta la tua chiave API Gemini</button> per iniziare a creare promemoria.</p>
                </div>
              )}

              <Recorder onTranscript={handleNewTranscript} isProcessing={isProcessing} />

              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                  <p className="font-bold">Errore</p>
                  <p>{error}</p>
                </div>
              )}
            </div>

            <ReminderList 
              reminders={reminders} 
              onDelete={handleDeleteReminder} 
              onGetSuggestions={handleGetSuggestions}
              onStartReRecording={handleStartReRecording}
              onStartChat={handleStartChat}
              hasApiKey={!!apiKey}
              reRecordingId={reRecordingId}
            />
          </main>
        </div>
      </div>
      
      <footer className="text-center p-4 text-slate-500 dark:text-slate-400 text-sm">
        <p>Remember Me &copy; {new Date().getFullYear()}</p>
      </footer>
      
      {/* Keep original modal for manual settings access - only when sidebar is not shown */}
      <SettingsModal 
        isOpen={isSettingsOpen && !showSidebar && !!envApiKey} 
        onClose={() => setIsSettingsOpen(false)} 
        onSave={handleSaveApiKey}
      />
      
      {/* Centralized Suggestions Modal */}
      <SuggestionsModal
        isOpen={showSuggestions}
        onClose={handleCloseSuggestions}
        suggestions={suggestions}
        isLoading={isLoadingSuggestions}
        taskTitle={currentSuggestionReminder?.title || ''}
      />
      
      {/* Chat Modal */}
      <ChatModal
        isOpen={showChat}
        onClose={handleCloseChat}
        onSendMessage={handleSendChatMessage}
        taskTitle={currentChatReminder?.title || ''}
        isLoading={isChatLoading}
      />
    </div>
  );
};

export default App;