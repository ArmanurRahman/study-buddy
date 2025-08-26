import { format } from 'date-fns';

export function formatDuration(duration: string) {
  if (!duration) return ''; // Handle empty or undefined duration
  // Supports formats like "1h 30m", "45m", "0h 20m", etc.
  const hMatch = duration.match(/(\d+)\s*h/);
  const mMatch = duration.match(/(\d+)\s*m/);
  const sMatch = duration.match(/(\d+)\s*s/);
  const hours = hMatch ? parseInt(hMatch[1]) : 0;
  const minutes = mMatch ? parseInt(mMatch[1]) : 0;
  const seconds = sMatch ? parseInt(sMatch[1]) : 0;

  let parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);
  return parts.join(' ') || '0m';
}

// Helper to check if today is between startDate and endDate (inclusive)
export function isTodayInRange(startDate: Date, endDate: Date | undefined, today: Date) {
  const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!endDate) {
    // If no endDate, just check startDate
    return t >= s;
  }
  const e = new Date(endDate?.getFullYear(), endDate?.getMonth(), endDate?.getDate());
  return t >= s && t <= e;
}

// Convert timer state to total seconds
export const getTotalSeconds = <T extends { hours: number; minutes: number; seconds: number }>(
  t: T
) => t.hours * 3600 + t.minutes * 60 + t.seconds;

// Helper to parse duration string like "1h 30m 20s"
export function parseDuration(duration: string) {
  let hours = 0,
    minutes = 0,
    seconds = 0;
  const hMatch = duration.match(/(\d+)\s*h/);
  const mMatch = duration.match(/(\d+)\s*m/);
  const sMatch = duration.match(/(\d+)\s*s/);
  if (hMatch) hours = parseInt(hMatch[1]);
  if (mMatch) minutes = parseInt(mMatch[1]);
  if (sMatch) seconds = parseInt(sMatch[1]);
  return { hours, minutes, seconds };
}

// Convert seconds to {hours, minutes, seconds}
export const secondsToTimer = (total: number) => ({
  hours: Math.floor(total / 3600),
  minutes: Math.floor((total % 3600) / 60),
  seconds: total % 60,
});

// Convert { hours, minutes, seconds } to total hours as a float
export function timeObjectToHours(time: {
  hours: number;
  minutes: number;
  seconds: number;
}): number {
  return time.hours + time.minutes / 60 + time.seconds / 3600;
}

// Convert { hours, minutes, seconds } to total minutes
export function timeObjectToMinutes(time: {
  hours: number;
  minutes: number;
  seconds: number;
}): number {
  return time.hours * 60 + time.minutes;
}

// Convert a string like "1h 30m" or "45m" to total hours as a float
export function timeStringToHours(duration: string): number {
  const { hours, minutes, seconds } = parseDuration(duration);
  return hours + minutes / 60 + seconds / 3600;
}

// Convert a string like "1h 30m" or "45m" to total minutes
export function timeStringToMinutes(duration: string): number {
  const { hours, minutes, seconds } = parseDuration(duration);
  return hours * 60 + minutes + seconds;
}

export const humanReadableDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return format(date, 'PPP'); // e.g., Jan 1, 2025
};

export const durationToString = (duration: { hours: string; minutes: string }) => {
  const { hours, minutes } = duration;
  return `${hours || '0'}h ${minutes || '0'}m`;
};

export const stringToDuration = (duration: string) => {
  const [hours, minutes] = duration.split(' ').map((part) => parseInt(part).toString() || '');
  return { hours, minutes };
};

// Calculate duration based on totalHours, frequency, and endDate
export const getAutoDuration = ({
  totalHours,
  frequency,
  startDate,
  endDate,
}: {
  totalHours: number | null;
  frequency: boolean[];
  startDate?: Date;
  endDate?: Date;
}) => {
  if (!totalHours || !frequency || frequency.filter(Boolean).length === 0)
    return { hours: '', minutes: '' };

  // If endDate and startDate are provided, count the number of scheduled study days between them
  let daysCount = frequency.filter(Boolean).length;
  if (startDate && endDate) {
    let count = 0;
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      const weekday = (current.getDay() + 6) % 7; // 0=Monday, 6=Sunday
      if (frequency[weekday]) count++;
      current.setDate(current.getDate() + 1);
    }
    daysCount = count;
  }

  if (daysCount === 0) return { hours: '', minutes: '' };

  const hoursPerDay = totalHours / daysCount;
  if (hoursPerDay > 24) {
    return { hours: '', minutes: '' };
  }
  const wholeHours = Math.floor(hoursPerDay);
  const minutes = Math.round((hoursPerDay - wholeHours) * 60);

  return {
    hours: wholeHours.toString(),
    minutes: minutes.toString().padStart(2, '0'),
  };
};
