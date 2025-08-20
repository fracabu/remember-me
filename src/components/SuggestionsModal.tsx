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
        <div key={index} className="mb-6">
          <h3 className="text-lg font-semibold text-brand-primary mb-3 flex items-center">
            <span className="bg-brand-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">
              {index + 1}
            </span>
            {title}
          </h3>
          <div className="pl-8 space-y-2">
            {contentLines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (!trimmedLine) return null;
              
              // Handle bullet points
              if (trimmedLine.startsWith('- ')) {
                return (
                  <div key={lineIndex} className="flex items-start">
                    <span className="text-brand-accent mr-2 text-sm font-bold">•</span>
                    <span className="text-slate-700 leading-relaxed">{trimmedLine.substring(2).trim()}</span>
                  </div>
                );
              }
              
              // Regular paragraph
              return (
                <p key={lineIndex} className="text-slate-700 leading-relaxed">
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-primary to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LightBulbIcon className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Suggerimenti per l'Attività</h2>
                <p className="text-blue-100 text-sm mt-1">{taskTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-white/10"
              aria-label="Chiudi"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <LoaderIcon className="h-8 w-8 text-brand-primary animate-spin mr-3" />
              <span className="text-slate-600">Generando suggerimenti intelligenti...</span>
            </div>
          )}
          
          {!isLoading && suggestions && (
            <div className="space-y-6">
              {formatSuggestions(suggestions)}
            </div>
          )}
          
          {!isLoading && !suggestions && (
            <div className="text-center py-12">
              <LightBulbIcon className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">Nessun Suggerimento Disponibile</h3>
              <p className="text-slate-400">Non sono riuscito a generare suggerimenti per questa attività.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              💡 Suggerimenti generati da Gemini AI per ottimizzare le tue attività
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary border border-transparent rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};