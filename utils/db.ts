import Realm from 'realm';
import { realmSchemas } from '../schema';

// Returns an array of 7 numbers (hours per day, Mon–Sun)
export async function getWeeklyStudyData(): Promise<number[]> {
  const realm = await Realm.open({ schema: realmSchemas });

  // Get start and end of current week (Monday to Sunday)
  const now = new Date();
  const day = (now.getDay() + 6) % 7; // 0=Monday, 6=Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - day);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Fetch all completed PlanStatus for this week
  const statuses = realm
    .objects('PlanStatus')
    .filtered('status == "completed" AND date >= $0 AND date <= $1', monday, sunday);

  // Prepare a map: { [weekday: number]: totalHours }
  const dailyTotals: number[] = [0, 0, 0, 0, 0, 0, 0]; // Mon–Sun

  statuses.forEach((status: any) => {
    const date = new Date(status.date);
    const weekday = (date.getDay() + 6) % 7; // 0=Monday, 6=Sunday

    // Use passedTime from PlanStatus
    if (status.passedTime) {
      const mins = status.passedTime || 0;
      dailyTotals[weekday] += mins;
    }
  });

  realm.close();
  return dailyTotals;
}
