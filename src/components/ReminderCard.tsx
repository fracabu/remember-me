import React, { useCallback } from 'react';
import type { Reminder } from '../types';
import { ShareIcon, TrashIcon, ClockIcon, CalendarDaysIcon } from './icons';

interface ReminderCardProps {
  reminder: Reminder;
  onDelete: (id: number) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onDelete }) => {
  
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

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-brand-primary flex-1 pr-4">{reminder.title || "Promemoria"}</h3>
          <div className="flex items-center space-x-2">
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
          <p className="mt-2 text-slate-600">{reminder.description}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
          {reminder.date && reminder.date !== "N/A" && (
            <div className="flex items-center space-x-1.5">
              <CalendarDaysIcon className="h-4 w-4 text-brand-accent" />
              <span>{reminder.date}</span>
            </div>
          )}
          {reminder.time && reminder.time !== "N/A" && (
            <div className="flex items-center space-x-1.5">
              <ClockIcon className="h-4 w-4 text-brand-accent" />
              <span>{reminder.time}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
