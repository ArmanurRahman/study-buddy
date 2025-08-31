import { useQuery } from '@realm/react';
import { BSON } from 'realm';

export function usePlanStatusById(planId?: string) {
  const objectId = planId ? new BSON.ObjectId(planId) : undefined;
  const planStatus = useQuery('PlanStatus').filtered('planId == $0', objectId);
  return planStatus;
}
