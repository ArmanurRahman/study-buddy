import { useCallback } from 'react';
import Realm from 'realm';
import { realmSchemas } from '../schema';

export function useDeletePlan() {
  const deletePlan = useCallback(async (planId: string) => {
    let realm: Realm | null = null;
    try {
      realm = await Realm.open({ schema: realmSchemas });
      realm.write(() => {
        const plan = realm?.objectForPrimaryKey('Plan', new Realm.BSON.ObjectId(planId));
        if (plan) {
          realm?.delete(plan);
        }
      });
    } catch (e) {
      console.error('Failed to delete plan:', e);
    } finally {
      if (realm && !realm.isClosed) {
        realm.close();
      }
    }
  }, []);

  return deletePlan;
}
