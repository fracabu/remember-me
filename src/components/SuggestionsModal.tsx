import React from 'react';
import { LightBulbIcon, LoaderIcon } from './icons';

interface SuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestions: string | null;
  isLoading: boolean;
  taskTitle: string;
}

export const SuggestionsModal: React.FC<SuggestionsModalProps> = ({ 
  isOpen, 
  onClose, 
  suggestions, 
  isLoading, 
  taskTitle 
}) => {
  if (!isOpen) return null;

  const formatSuggestions = (text: string) => {
    // Clean up the text and handle markdown-style formatting
    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove ** markdown
      .replace(/\*/g, '') // Remove single asterisks
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers
      .trim();

    // Split by numbered sections (1., 2., etc.)
    const sections = cleanText.split(/(?=\d+\.\s+)/).filter(section => section.trim());
    
    return sections.map((section, index) => {
      const lines = section.split('\n').filter(line => line.trim());
      if (lines.length === 0) return null;
      
      // First line is the title
      const titleMatch = lines[0].match(/^\d+\.\s+(.+)$/);
      if (!titleMatch) return null;
      
      const title = titleMatch[1].trim();
      const contentLines = lines.slice(1);
      
      return (
        <div key={index} className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold text-primary-600 dark:text-primary-400 mb-2 sm:mb-3 flex items-center">
            <span className="bg-primary-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm mr-2 flex-shrink-0">
              {index + 1}
            </span>
            {title}
          </h3>
          <div className="pl-6 sm:pl-8 space-y-1 sm:space-y-2">
            {contentLines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;
              
              // Handle bullet points
              if (trimmedLine.startsWith('- ')) {
                return (
                  <div key={lineIndex} className="flex items-start">
                    <span className="text-accent-500 mr-1 sm:mr-2 text-sm font-bold flex-shrink-0">•</span>
                    <span className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">{trimmedLine.substring(2).trim()}</span>
                  </div>
                );
              }
              
              // Regular paragraph
              return (
                <p key={lineIndex} className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {trimmedLine}
                </p>
              );
            })}
          </div>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm sm:max-w-4xl max-h-[90vh] overflow-hidden transition-colors">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <LightBulbIcon className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold">Suggerimenti per l'Attività</h2>
                <p className="text-primary-100 text-xs sm:text-sm mt-1 truncate">{taskTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-white/10 flex-shrink-0"
              aria-label="Chiudi"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading && (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <LoaderIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 animate-spin mr-2 sm:mr-3" />
              <span className="text-sm sm:text-base text-slate-600 dark:text-slate-400">Generando suggerimenti intelligenti...</span>
            </div>
          )}
          
          {!isLoading && suggestions && (
            <div className="space-y-6">
              {formatSuggestions(suggestions)}
            </div>
          )}
          
          {!isLoading && !suggestions && (
            <div className="text-center py-8 sm:py-12">
              <LightBulbIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-300 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">Nessun Suggerimento Disponibile</h3>
              <p className="text-sm sm:text-base text-slate-400 dark:text-slate-500 px-4">Non sono riuscito a generare suggerimenti per questa attività.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-700 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200 dark:border-slate-600">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              💡 Suggerimenti generati da Gemini AI per ottimizzare le tue attività
            </p>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};