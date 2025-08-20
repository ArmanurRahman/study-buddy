import { useState, useEffect } from 'react';
import { realmSchemas } from 'schema';

import { isTodayInRange } from '../utils/time';
import { TodaysTask } from '../types';

// Custom hook to fetch today's tasks
export function useTodayTasks(today: Date, refreshKey?: number) {
  const [todayTasks, setTodayTasks] = useState<TodaysTask[]>([]);

  useEffect(() => {
    let realm: Realm;
    (async () => {
      realm = await Realm.open({ schema: realmSchemas });

      // Get all tasks and filter by date range
      const tasks = realm
        .objects('Task')
        .filter((task: any) => {
          if (!task.startDate || !task.endDate) return false;
          const start = task.startDate instanceof Date ? task.startDate : new Date(task.startDate);
          const end = task.endDate instanceof Date ? task.endDate : new Date(task.endDate);
          return isTodayInRange(start, end, today);
        })
        .map((task: any) => {
          // Find today's TaskStatus for this task
          const startOfDay = new Date(today);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);

          const statusObj = realm
            .objects('TaskStatus')
            .filtered(
              'taskId == $0 AND date >= $1 AND date <= $2',
              task._id,
              startOfDay,
              endOfDay
            )[0];

          return {
            id: task._id.toHexString ? task._id.toHexString() : String(task._id),
            title: task.title,
            description: task.description,
            duration: task.duration,
            startDate: task.startDate,
            endDate: task.endDate,
            streak: task.streak,
            startTime: task.startTime,
            frequency: task.frequency ? JSON.parse(task.frequency) : [],
            category: task.category,
            status: statusObj ? statusObj.status : 'idle', // <-- add status
          };
        });
      setTodayTasks(tasks as TodaysTask[]);
    })();
    return () => {
      if (realm && !realm.isClosed) realm.close();
    };
  }, [today.getDate(), refreshKey]);

  return todayTasks;
}
