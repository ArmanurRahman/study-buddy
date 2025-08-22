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
export function isTodayInRange(startDate: Date, endDate: Date, today: Date) {
  const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
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
