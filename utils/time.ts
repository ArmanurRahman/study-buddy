export function formatDuration(duration: string) {
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
