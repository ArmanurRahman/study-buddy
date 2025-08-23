import { useCallback } from 'react';
import { useRealm } from '@realm/react';

export function useDeletePlan() {
  const realm = useRealm();

  const deletePlan = useCallback(
    (planId: string) => {
      realm.write(() => {
        const plan = realm.objectForPrimaryKey('Plan', new Realm.BSON.ObjectId(planId));
        if (plan) {
          realm.delete(plan);
        }
      });
    },
    [realm]
  );

  return deletePlan;
}
