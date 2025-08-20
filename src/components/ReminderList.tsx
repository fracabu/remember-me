
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
      <div className="text-center mt-12 p-8 bg-white rounded-2xl shadow-lg">
        <CalendarIcon className="h-16 w-16 mx-auto text-slate-300" />
        <h3 className="mt-4 text-xl font-semibold text-slate-600">Nessun Promemoria</h3>
        <p className="mt-1 text-slate-400">I tuoi pensieri organizzati appariranno qui.</p>
      </div>
    );
  }

  const categoryOrder = ['Scaduto', 'Oggi', 'Domani', 'Questa settimana', 'Prossimi', 'Senza data'];

  return (
    <div className="mt-8 space-y-8">
      {categoryOrder.map(category => {
        const categoryReminders = groupedReminders[category];
        if (!categoryReminders || categoryReminders.length === 0) return null;

        const firstReminder = categoryReminders[0];
        const { timeCategory } = firstReminder;

        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${timeCategory.bgColor} ${timeCategory.color} ${timeCategory.borderColor} border`}>
                {category}
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent"></div>
              <span className="text-sm text-slate-500 font-medium">
                {categoryReminders.length} promemoria{categoryReminders.length > 1 ? '' : ''}
              </span>
            </div>
            
            <div className="space-y-4">
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
