import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Recorder } from './components/Recorder';
import { ReminderList } from './components/ReminderList';
import { SettingsModal } from './components/SettingsModal';
import { processVoiceInput } from './services/geminiService';
import type { Reminder } from './types';

const APP_STORAGE_KEY = 'remember-me-reminders';

const App: React.FC = () => {
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
  const [apiKey, setApiKey] = useState<string | null>(null);
  // Start with settings open since no API key is set for the session.
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

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

  const handleNewTranscript = useCallback(async (transcript: string) => {
    if (!transcript) return;
    if (!apiKey) {
      setError("Please set your API key in the settings before creating a reminder.");
      setIsSettingsOpen(true);
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const newReminder = await processVoiceInput(transcript, apiKey);
      setReminders(prev => [{ ...newReminder, id: Date.now() }, ...prev]);
    } catch (err) {
      console.error(err);
      setError('Sorry, I couldn\'t understand that. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey]);

  const handleDeleteReminder = useCallback((id: number) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);
  
  // Keep settings modal open if there's no API key
  useEffect(() => {
    if (!apiKey) {
      setIsSettingsOpen(true);
    }
  }, [apiKey]);


  return (
    <div className="min-h-screen bg-brand-light font-sans text-brand-dark">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="container mx-auto max-w-2xl p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-brand-primary">What's on your mind?</h2>
            <p className="text-slate-500 mt-1">Press the button and start talking. I'll sort it out.</p>
          </div>
          
          {!apiKey && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md" role="alert">
              <p className="font-bold">API Key Required</p>
              <p>Please <button onClick={() => setIsSettingsOpen(true)} className="underline font-medium">set your Gemini API key</button> to start creating reminders.</p>
            </div>
          )}

          <Recorder onTranscript={handleNewTranscript} isProcessing={isProcessing} />

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        <ReminderList reminders={reminders} onDelete={handleDeleteReminder} />
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Remember Me &copy; {new Date().getFullYear()}</p>
      </footer>
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => {
            // Only allow closing the modal if an API key has been set.
            if (apiKey) {
                setIsSettingsOpen(false)
            }
        }} 
        onSave={handleSaveApiKey}
      />
    </div>
  );
};

export default App;