import { useState, useEffect } from 'react';
import { realmSchemas } from 'schema';

import { isTodayInRange, stringToDuration } from '../utils/time';
import { TodaysPlan } from '../types';

// Custom hook to fetch today's tasks
export function useTodayPlan(today: Date, refreshKey?: number) {
  const [todayPlans, setTodayPlans] = useState<TodaysPlan[]>([]);

  useEffect(() => {
    let realm: Realm;
    (async () => {
      realm = await Realm.open({ schema: realmSchemas });

      // Get all plans and filter by date range
      const plans = realm
        .objects('Plan')
        .filter((plan: any) => {
          if (!plan.startDate || !plan.endDate) return false;
          const start = plan.startDate instanceof Date ? plan.startDate : new Date(plan.startDate);
          const end = plan.endDate instanceof Date ? plan.endDate : new Date(plan.endDate);
          return isTodayInRange(start, end, today);
        })
        .map((plan: any) => {
          // Find today's PlanStatus for this plan
          const startOfDay = new Date(today);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(today);
          endOfDay.setHours(23, 59, 59, 999);

          const statusObj = realm
            .objects('PlanStatus')
            .filtered(
              'planId == $0 AND date >= $1 AND date <= $2',
              plan._id,
              startOfDay,
              endOfDay
            )[0];

          return {
            id: plan._id.toHexString ? plan._id.toHexString() : String(plan._id),
            title: plan.title,
            description: plan.description,
            duration: stringToDuration(plan.duration),
            startDate: plan.startDate,
            endDate: plan.endDate,
            streak: plan.streak,
            startTime: plan.startTime,
            frequency: plan.frequency ? JSON.parse(plan.frequency) : [],
            category: plan.category,
            status: statusObj ? statusObj.status : 'idle',
          };
        });
      setTodayPlans(plans as TodaysPlan[]);
    })();
    return () => {
      if (realm && !realm.isClosed) realm.close();
    };
  }, [today.getDate(), refreshKey]);

  return todayPlans;
}
