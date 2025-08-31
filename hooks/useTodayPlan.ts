import { useContext, useMemo } from 'react';
import { useQuery } from '@realm/react';
import { isTodayInRange, stringToDuration } from '../utils/time';
import { TodaysPlan, PlanStatusType } from '../types';
import { DayContext } from 'context/DayContext';

export function useTodayPlan(today: Date) {
  const planResults = useQuery('Plan');
  const planStatusResults = useQuery('PlanStatus');
  const { currentDay } = useContext(DayContext);

  const todaysPlans: TodaysPlan[] = useMemo(() => {
    // Get today's day index (0=Monday, ..., 6=Sunday)
    let todayIdx = today.getDay();
    todayIdx = todayIdx === 0 ? 6 : todayIdx - 1;

    return planResults
      .filter((plan: any) => {
        if (plan.isEnd) return false;
        if (!plan.startDate) return false;
        const start = plan.startDate instanceof Date ? plan.startDate : new Date(plan.startDate);
        if (!plan.endDate) {
          if (!isTodayInRange(start, undefined, today)) return false;
        } else {
          const end = plan.endDate instanceof Date ? plan.endDate : new Date(plan.endDate);
          if (!isTodayInRange(start, end, today)) return false;
        }

        // Frequency check
        let frequency: boolean[] = [];
        try {
          frequency = Array.isArray(plan.frequency)
            ? plan.frequency
            : JSON.parse(plan.frequency as string);
        } catch {
          frequency = [false, false, false, false, false, false, false];
        }
        // If frequency is set and today is not included, skip this plan
        if (frequency.length > 0 && !frequency[todayIdx]) {
          return false;
        }
        return true;
      })
      .map((plan: any) => {
        const planId = plan._id?.toHexString ? plan._id.toHexString() : String(plan._id);

        // Find today's PlanStatus for this plan
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const statusObj = planStatusResults.filtered(
          'planId == $0 AND date >= $1 AND date <= $2',
          plan._id,
          startOfDay,
          endOfDay
        )[0] as { status?: PlanStatusType } | undefined;

        return {
          id: planId,
          title: plan.title,
          description: plan.description,
          duration: stringToDuration(plan.duration),
          startDate: plan.startDate,
          endDate: plan.endDate,
          streak: plan.streak,
          startTime: plan.startTime,
          frequency: plan.frequency ? JSON.parse(plan.frequency) : [],
          category: plan.category,
          totalHours: plan.totalHours ?? null,
          status: (statusObj && statusObj.status ? statusObj.status : 'idle') as PlanStatusType,
        };
      });
  }, [planResults, planStatusResults, currentDay]);
  return { todaysPlans };
}
