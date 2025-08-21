import React, { useState, useRef, useEffect } from 'react';
import { LoaderIcon } from './icons';
import type { ChatMessage } from '../services/geminiService';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string, chatHistory: ChatMessage[]) => Promise<string>;
  taskTitle: string;
  isLoading: boolean;
}

export const ChatModal: React.FC<ChatModalProps> = ({ 
  isOpen, 
  onClose, 
  onSendMessage,
  taskTitle,
  isLoading 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');

    try {
      const assistantResponse = await onSendMessage(userMessage.content, messages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: Date.now()
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.',
        timestamp: Date.now()
      };
      setMessages([...newMessages, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-2xl h-[70vh] sm:h-[600px] flex flex-col overflow-hidden transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 p-3 sm:p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold">Chat Assistente</h2>
                <p className="text-primary-100 text-xs sm:text-sm truncate">{taskTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-white/10 flex-shrink-0"
              aria-label="Chiudi chat"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-50 dark:bg-slate-900">
          {messages.length === 0 && (
            <div className="text-center py-6 sm:py-8">
              <svg className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-slate-300 mb-2 sm:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm px-4">
                Inizia una conversazione! Chiedimi qualsiasi cosa riguardo a questo task.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-2 sm:p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary-500 text-white ml-2 sm:ml-4'
                    : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 mr-2 sm:mr-4 border border-slate-200 dark:border-slate-600'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-primary-100' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('it-IT', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 mr-4 border border-slate-200 dark:border-slate-600 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <LoaderIcon className="h-4 w-4 text-primary-500 animate-spin" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">L'assistente sta scrivendo...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-600 p-3 sm:p-4 bg-white dark:bg-slate-800">
          <form onSubmit={handleSendMessage} className="flex space-x-2 sm:space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Scrivi un messaggio..."
              disabled={isLoading}
              className="flex-1 px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-500 dark:disabled:text-slate-400 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-3 sm:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 sm:mt-2 hidden sm:block">
            Premi Invio per inviare, Shift+Invio per andare a capo
          </p>
        </div>
      </div>
    </div>
  );
};