import { useMemo } from 'react';
import { useQuery } from '@realm/react';
import { isTodayInRange, stringToDuration } from '../utils/time';
import { TodaysPlan, PlanStatusType } from '../types';

export function useTodayPlan(today: Date) {
  const planResults = useQuery('Plan');
  const planStatusResults = useQuery('PlanStatus');

  const todaysPlans: TodaysPlan[] = useMemo(() => {
    return planResults
      .filter((plan: any) => {
        if (!plan.startDate) return false;
        const start = plan.startDate instanceof Date ? plan.startDate : new Date(plan.startDate);
        if (!plan.endDate) {
          return isTodayInRange(start, undefined, today);
        }
        const end = plan.endDate instanceof Date ? plan.endDate : new Date(plan.endDate);
        return isTodayInRange(start, end, today);
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
  }, [planResults, planStatusResults, today.getDate()]);

  return { todaysPlans };
}
