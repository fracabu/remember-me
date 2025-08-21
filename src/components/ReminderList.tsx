
import React, { useMemo } from 'react';
import type { Reminder } from '../types';
import { ReminderCard } from './ReminderCard';
import { CalendarIcon } from './icons';
import { compareReminders } from '../utils/dateUtils';
import { groupRemindersByTime } from '../utils/timeUtils';

interface ReminderListProps {
  reminders: Reminder[];
  onDelete: (id: number) => void;
  onGetSuggestions: (reminder: Reminder) => void;
  onStartReRecording: (reminder: Reminder) => void;
  onStartChat: (reminder: Reminder) => void;
  hasApiKey: boolean;
  reRecordingId: number | null;
}

export const ReminderList: React.FC<ReminderListProps> = ({ reminders, onDelete, onGetSuggestions, onStartReRecording, onStartChat, hasApiKey, reRecordingId }) => {
  // Group reminders by time category
  const groupedReminders = useMemo(() => {
    const sorted = [...reminders].sort(compareReminders);
    return groupRemindersByTime(sorted);
  }, [reminders]);

  if (reminders.length === 0) {
    return (
      <div className="text-center mt-8 sm:mt-12 p-4 sm:p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg transition-colors">
        <CalendarIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-slate-300 dark:text-slate-500" />
        <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl font-semibold text-slate-600 dark:text-slate-300">Nessun Promemoria</h3>
        <p className="mt-1 text-sm sm:text-base text-slate-400 dark:text-slate-500">I tuoi pensieri organizzati appariranno qui.</p>
      </div>
    );
  }

  const categoryOrder = ['Scaduto', 'Oggi', 'Domani', 'Questa settimana', 'Prossimi', 'Senza data'];

  return (
    <div className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
      {categoryOrder.map(category => {
        const categoryReminders = groupedReminders[category];
        if (!categoryReminders || categoryReminders.length === 0) return null;

        const firstReminder = categoryReminders[0];
        const { timeCategory } = firstReminder;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${timeCategory.bgColor} ${timeCategory.color} ${timeCategory.borderColor} border`}>
                {category}
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
              <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                {categoryReminders.length} <span className="hidden sm:inline">promemoria</span><span className="sm:hidden">rem.</span>
              </span>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {categoryReminders.map((reminder) => (
                <ReminderCard 
                  key={reminder.id} 
                  reminder={reminder} 
                  onDelete={onDelete}
                  onGetSuggestions={onGetSuggestions}
                  onStartReRecording={onStartReRecording}
                  onStartChat={onStartChat}
                  hasApiKey={hasApiKey}
                  isBeingReRecorded={reRecordingId === reminder.id}
                  timeInfo={{
                    category: reminder.timeCategory,
                    timeUntil: reminder.timeUntil,
                    isOverdue: reminder.isOverdue
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
