import React, { useCallback } from 'react';
import type { Reminder } from '../types';
import { ShareIcon, TrashIcon, ClockIcon, CalendarDaysIcon, LightBulbIcon, MicIcon2 } from './icons';
import { createCalendarEvent } from '../utils/dateUtils';

interface ReminderCardProps {
  reminder: Reminder;
  onDelete: (id: number) => void;
  onGetSuggestions: (reminder: Reminder) => void;
  onStartReRecording: (reminder: Reminder) => void;
  onStartChat: (reminder: Reminder) => void;
  hasApiKey: boolean;
  isBeingReRecorded: boolean;
  timeInfo?: {
    category: {
      label: string;
      priority: 'urgent' | 'soon' | 'upcoming' | 'past';
      color: string;
      bgColor: string;
      borderColor: string;
    };
    timeUntil: string;
    isOverdue: boolean;
  };
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onDelete, timeInfo, onGetSuggestions, onStartReRecording, onStartChat, hasApiKey, isBeingReRecorded }) => {
  
  const handleShare = useCallback(async () => {
    const shareText = `Promemoria: ${reminder.title}\nData: ${reminder.date}\nOra: ${reminder.time}\nDettagli: ${reminder.description}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: reminder.title,
          text: shareText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    }
  }, [reminder]);

  const handleAddToCalendar = useCallback(() => {
    try {
      const calendarUrl = createCalendarEvent(reminder);
      window.open(calendarUrl, '_blank');
    } catch (error) {
      console.error('Error creating calendar event:', error);
      alert('Impossibile creare l\'evento calendario. Controlla che data e ora siano valide.');
    }
  }, [reminder]);

  // Check if calendar event can be created
  const canAddToCalendar = reminder.date !== 'N/A' && reminder.time !== 'N/A';
  
  // Check if suggestions can be generated
  const canGetSuggestions = hasApiKey;

  const cardBorderClass = isBeingReRecorded
    ? 'border-2 border-blue-500 ring-2 ring-blue-200'
    : timeInfo?.isOverdue 
    ? 'border-l-4 border-red-500' 
    : timeInfo?.category.priority === 'urgent' 
    ? 'border-l-4 border-red-400'
    : timeInfo?.category.priority === 'soon'
    ? 'border-l-4 border-orange-400'
    : '';

  const urgencyBadge = isBeingReRecorded
    ? 'RI-REGISTRANDO'
    : timeInfo?.category.priority === 'urgent' && !timeInfo.isOverdue
    ? 'OGGI!'
    : timeInfo?.isOverdue
    ? 'SCADUTO'
    : null;

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl ${cardBorderClass} ${timeInfo?.category.bgColor || ''}`}>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-xl font-bold text-brand-primary">{reminder.title || "Promemoria"}</h3>
              {urgencyBadge && (
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  urgencyBadge === 'RI-REGISTRANDO'
                    ? 'bg-blue-500 text-white animate-pulse'
                    : urgencyBadge === 'SCADUTO' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-red-400 text-white animate-pulse'
                }`}>
                  {urgencyBadge}
                </span>
              )}
            </div>
            {timeInfo?.timeUntil && (
              <p className={`text-sm font-medium ${timeInfo.isOverdue ? 'text-red-500' : timeInfo.category.color}`}>
                {timeInfo.timeUntil}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {hasApiKey && (
              <button
                onClick={() => onStartReRecording(reminder)}
                className={`p-2 rounded-full transition-colors ${
                  isBeingReRecorded 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-blue-500'
                }`}
                aria-label="Ri-registra promemoria"
                title="Ri-registra questo promemoria"
              >
                <MicIcon2 className="h-5 w-5" />
              </button>
            )}
            {canGetSuggestions && (
              <>
                <button
                  onClick={() => onStartChat(reminder)}
                  className="p-2 text-slate-500 hover:bg-slate-100 hover:text-green-500 rounded-full transition-colors"
                  aria-label="Avvia chat"
                  title="Chatta con l'assistente AI"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                <button
                  onClick={() => onGetSuggestions(reminder)}
                  className="p-2 text-slate-500 hover:bg-slate-100 hover:text-yellow-500 rounded-full transition-colors"
                  aria-label="Ottieni suggerimenti"
                  title="Ottieni suggerimenti AI"
                >
                  <LightBulbIcon className="h-5 w-5" />
                </button>
              </>
            )}
            {canAddToCalendar && (
              <button
                onClick={handleAddToCalendar}
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-primary rounded-full transition-colors"
                aria-label="Aggiungi al calendario"
                title="Aggiungi al calendario"
              >
                <CalendarDaysIcon className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={handleShare}
              className="p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-secondary rounded-full transition-colors"
              aria-label="Condividi promemoria"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(reminder.id)}
              className="p-2 text-slate-500 hover:bg-slate-100 hover:text-red-500 rounded-full transition-colors"
              aria-label="Elimina promemoria"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {reminder.description && (
          <p className="mt-3 text-slate-600 leading-relaxed">{reminder.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {reminder.date && reminder.date !== "N/A" && (
            <div className="flex items-center space-x-1.5 text-slate-600">
              <CalendarDaysIcon className="h-4 w-4 text-brand-accent" />
              <span>{reminder.date}</span>
            </div>
          )}
          {reminder.time && reminder.time !== "N/A" && (
            <div className="flex items-center space-x-1.5 text-slate-600">
              <ClockIcon className="h-4 w-4 text-brand-accent" />
              <span>{reminder.time}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
