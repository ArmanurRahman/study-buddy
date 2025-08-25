import { useContext, useMemo } from 'react';
import { useQuery } from '@realm/react';
import { Plan } from 'types';
import { stringToDuration } from '../utils/time';
import { DayContext } from 'context/DayContext';

export const useAllPlans = () => {
  // Get live Realm objects using @realm/react
  const planResults = useQuery('Plan');
  const { currentDay } = useContext(DayContext);
  // Convert Realm objects to plain JS objects
  const plans: Plan[] = useMemo(
    () =>
      planResults.map((plan: any) => ({
        id: plan._id.toHexString ? plan._id.toHexString() : String(plan._id),
        title: plan.title,
        category: plan.category,
        description: plan.description,
        duration: stringToDuration(plan.duration),
        streak: plan.streak ?? 0,
        startTime: plan.startTime ? new Date(plan.startTime) : undefined,
        endDate: plan.endDate ? new Date(plan.endDate) : null,
        frequency: plan.frequency ? JSON.parse(plan.frequency) : [],
        startDate: plan.startDate ? new Date(plan.startDate) : null,
        totalHours: plan.totalHours ?? null,
      })),
    [planResults, currentDay]
  );

  return { plans };
};
