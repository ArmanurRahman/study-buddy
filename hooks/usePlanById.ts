import { useQuery } from '@realm/react';
import { BSON } from 'realm';
import { Plan } from 'types';
import { stringToDuration } from 'utils/time';

export function usePlanById(planId?: string): Plan | undefined {
  const objectId = planId ? new BSON.ObjectId(planId) : undefined;
  const plan = useQuery<Plan>('Plan').filtered('_id == $0', objectId)[0];
  if (!plan) return undefined;
  return {
    ...plan,
    duration: stringToDuration(plan.duration as unknown as string),
    startDate: plan.startDate ? new Date(plan.startDate) : null,
    endDate: plan.endDate ? new Date(plan.endDate) : null,
  };
}
