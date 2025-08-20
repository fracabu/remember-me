/**
 * Utility functions for time calculations and formatting
 */

export interface TimeCategory {
  label: string;
  priority: 'urgent' | 'soon' | 'upcoming' | 'past';
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface ReminderWithTimeInfo {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  timeCategory: TimeCategory;
  timeUntil: string;
  isOverdue: boolean;
}

/**
 * Gets the time category for a reminder based on its date/time
 */
export const getTimeCategory = (dateStr: string, timeStr: string): TimeCategory => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Handle N/A cases
  if (dateStr === 'N/A' || timeStr === 'N/A') {
    return {
      label: 'Senza data',
      priority: 'upcoming',
      color: 'text-slate-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200'
    };
  }

  try {
    // Parse the date
    const parts = dateStr.split(', ');
    if (parts.length < 2) throw new Error('Invalid date format');
    
    const dateOnly = parts.slice(1).join(', ');
    const reminderDate = new Date(dateOnly);
    
    if (isNaN(reminderDate.getTime())) throw new Error('Invalid date');
    
    // Parse time
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const period = timeMatch[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      else if (period === 'AM' && hours === 12) hours = 0;
      
      reminderDate.setHours(hours, minutes, 0, 0);
    }

    const reminderDay = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Determine category
    if (reminderDate < now) {
      return {
        label: 'Scaduto',
        priority: 'past',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    } else if (reminderDay.getTime() === today.getTime()) {
      return {
        label: 'Oggi',
        priority: 'urgent',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300'
      };
    } else if (reminderDay.getTime() === tomorrow.getTime()) {
      return {
        label: 'Domani',
        priority: 'soon',
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300'
      };
    } else if (reminderDay <= weekFromNow) {
      return {
        label: 'Questa settimana',
        priority: 'soon',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300'
      };
    } else {
      return {
        label: 'Prossimi',
        priority: 'upcoming',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300'
      };
    }
  } catch {
    return {
      label: 'Data non valida',
      priority: 'upcoming',
      color: 'text-slate-500',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200'
    };
  }
};

/**
 * Calculates human-readable time until the reminder
 */
export const getTimeUntil = (dateStr: string, timeStr: string): string => {
  if (dateStr === 'N/A' || timeStr === 'N/A') {
    return '';
  }

  try {
    const parts = dateStr.split(', ');
    if (parts.length < 2) return '';
    
    const dateOnly = parts.slice(1).join(', ');
    const reminderDate = new Date(dateOnly);
    
    if (isNaN(reminderDate.getTime())) return '';
    
    // Parse time
    const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const period = timeMatch[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      else if (period === 'AM' && hours === 12) hours = 0;
      
      reminderDate.setHours(hours, minutes, 0, 0);
    }

    const now = new Date();
    const timeDiff = reminderDate.getTime() - now.getTime();

    if (timeDiff < 0) {
      const pastDiff = Math.abs(timeDiff);
      const pastHours = Math.floor(pastDiff / (1000 * 60 * 60));
      const pastDays = Math.floor(pastDiff / (1000 * 60 * 60 * 24));
      
      if (pastDays > 0) {
        return `${pastDays} giorno${pastDays > 1 ? 'i' : ''} fa`;
      } else if (pastHours > 0) {
        return `${pastHours} ora${pastHours > 1 ? 'e' : ''} fa`;
      } else {
        return 'Appena scaduto';
      }
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `Fra ${days} giorno${days > 1 ? 'i' : ''}`;
    } else if (hours > 0) {
      return `Fra ${hours} ora${hours > 1 ? 'e' : ''}`;
    } else if (minutes > 0) {
      return `Fra ${minutes} minuto${minutes > 1 ? 'i' : ''}`;
    } else {
      return 'Adesso!';
    }
  } catch {
    return '';
  }
};

/**
 * Groups reminders by time category
 */
export const groupRemindersByTime = (reminders: Array<{id: number, title: string, description: string, date: string, time: string}>): Record<string, ReminderWithTimeInfo[]> => {
  const groups: Record<string, ReminderWithTimeInfo[]> = {
    'Scaduto': [],
    'Oggi': [],
    'Domani': [],
    'Questa settimana': [],
    'Prossimi': [],
    'Senza data': []
  };

  reminders.forEach(reminder => {
    const timeCategory = getTimeCategory(reminder.date, reminder.time);
    const timeUntil = getTimeUntil(reminder.date, reminder.time);
    const isOverdue = timeCategory.priority === 'past';

    const enrichedReminder: ReminderWithTimeInfo = {
      ...reminder,
      timeCategory,
      timeUntil,
      isOverdue
    };

    groups[timeCategory.label].push(enrichedReminder);
  });

  return groups;
};