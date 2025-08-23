import { useQuery } from '@realm/react';

// Returns an array of 7 numbers (hours per day, Mon–Sun)
export function useWeeklyStudyData(): number[] {
  const planStatusResults = useQuery('PlanStatus');

  // Get start and end of current week (Monday to Sunday)
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // 0=Monday, 6=Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Prepare a map: { [weekday: number]: totalHours }
  const dailyTotals: number[] = [0, 0, 0, 0, 0, 0, 0]; // Mon–Sun

  planStatusResults
    .filtered('status == "completed" AND date >= $0 AND date <= $1', monday, sunday)
    .forEach((status: any) => {
      const date = new Date(status.date);
      const weekday = (date.getDay() + 6) % 7; // 0=Monday, 6=Sunday

      // Use passedTime from PlanStatus
      if (status.passedTime) {
        const mins = status.passedTime || 0;
        dailyTotals[weekday] += mins;
      }
    });

  return dailyTotals;
}
