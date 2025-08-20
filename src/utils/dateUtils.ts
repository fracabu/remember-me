/**
 * Utility functions for date and time parsing and comparison
 */

export interface ParsedDateTime {
  date: Date | null;
  isValid: boolean;
}

/**
 * Parses a date string in format "Day, Month DD, YYYY" and time in "HH:MM AM/PM"
 * Returns a Date object for comparison purposes
 */
export const parseDateTime = (dateStr: string, timeStr: string): ParsedDateTime => {
  try {
    // Handle N/A cases
    if (dateStr === 'N/A' && timeStr === 'N/A') {
      return { date: null, isValid: false };
    }
    
    // If only date is missing, use a far future date for sorting
    if (dateStr === 'N/A') {
      return { date: new Date('2099-12-31'), isValid: false };
    }
    
    // If only time is missing, use end of day for sorting
    if (timeStr === 'N/A') {
      const parsedDate = parseDate(dateStr);
      if (parsedDate) {
        parsedDate.setHours(23, 59, 59, 999);
        return { date: parsedDate, isValid: true };
      }
    }
    
    // Parse both date and time
    const parsedDate = parseDate(dateStr);
    if (!parsedDate) {
      return { date: null, isValid: false };
    }
    
    const parsedTime = parseTime(timeStr);
    if (parsedTime) {
      parsedDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
    }
    
    return { date: parsedDate, isValid: true };
  } catch (error) {
    console.error('Error parsing date/time:', { dateStr, timeStr, error });
    return { date: null, isValid: false };
  }
};

/**
 * Parses date string in format "Day, Month DD, YYYY" (e.g., "Tuesday, July 16, 2024")
 */
const parseDate = (dateStr: string): Date | null => {
  try {
    // Remove day of week and parse the rest
    const parts = dateStr.split(', ');
    if (parts.length < 2) return null;
    
    const dateOnly = parts.slice(1).join(', '); // "July 16, 2024"
    const parsed = new Date(dateOnly);
    
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
};

/**
 * Parses time string in format "HH:MM AM/PM"
 */
const parseTime = (timeStr: string): { hours: number; minutes: number } | null => {
  try {
    const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
    const match = timeStr.match(timeRegex);
    
    if (!match) return null;
    
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    
    // Convert to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return { hours, minutes };
  } catch {
    return null;
  }
};

/**
 * Compares two reminders for chronological sorting
 * Returns negative if a comes before b, positive if a comes after b, 0 if equal
 */
export const compareReminders = (a: { date: string; time: string }, b: { date: string; time: string }): number => {
  const dateTimeA = parseDateTime(a.date, a.time);
  const dateTimeB = parseDateTime(b.date, b.time);
  
  // Handle invalid dates - put them at the end
  if (!dateTimeA.date && !dateTimeB.date) return 0;
  if (!dateTimeA.date) return 1;
  if (!dateTimeB.date) return -1;
  
  return dateTimeA.date.getTime() - dateTimeB.date.getTime();
};

/**
 * Creates a calendar event URL for the given reminder
 */
export const createCalendarEvent = (reminder: { title: string; description: string; date: string; time: string }): string => {
  const { date: parsedDate } = parseDateTime(reminder.date, reminder.time);
  
  if (!parsedDate) {
    throw new Error('Cannot create calendar event for invalid date/time');
  }
  
  // Format for Google Calendar
  const startDate = parsedDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  // Default to 1 hour duration
  const endDate = new Date(parsedDate.getTime() + 60 * 60 * 1000)
    .toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: reminder.title,
    details: reminder.description,
    dates: `${startDate}/${endDate}`,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};