import { useCallback } from 'react';
import { useQuery, useRealm } from '@realm/react';
import { BSON } from 'realm';
import { Plan } from 'types';

export function usePlanEndById(planId?: string) {
  const realm = useRealm();
  const objectId = planId ? new BSON.ObjectId(planId) : undefined;
  const plan = useQuery<Plan>('Plan').filtered('_id == $0', objectId)[0];
  const endPlan = useCallback(() => {
    try {
      if (!plan) {
        console.warn('No plan found to end.');
        return;
      }
      if (plan.isEnd) {
        console.warn('Plan is already ended.');
        return;
      }
      realm.write(() => {
        plan.isEnd = true;
      });
      console.log('Plan ended:', plan);
    } catch (error) {
      console.error('Error ending plan:', error);
    }
  }, [plan, realm]);

  return { plan, endPlan };
}
