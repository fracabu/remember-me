
import React from 'react';
import type { Reminder } from '../types';
import { ReminderCard } from './ReminderCard';
import { CalendarIcon } from './icons';

interface ReminderListProps {
  reminders: Reminder[];
  onDelete: (id: number) => void;
}

export const ReminderList: React.FC<ReminderListProps> = ({ reminders, onDelete }) => {
  if (reminders.length === 0) {
    return (
      <div className="text-center mt-12 p-8 bg-white rounded-2xl shadow-lg">
        <CalendarIcon className="h-16 w-16 mx-auto text-slate-300" />
        <h3 className="mt-4 text-xl font-semibold text-slate-600">No Reminders Yet</h3>
        <p className="mt-1 text-slate-400">Your organized thoughts will appear here.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {reminders.map((reminder) => (
        <ReminderCard key={reminder.id} reminder={reminder} onDelete={onDelete} />
      ))}
    </div>
  );
};
