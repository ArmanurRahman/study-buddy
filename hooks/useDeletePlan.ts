import { useCallback, useContext } from 'react';
import Realm from 'realm';
import { realmSchemas } from '../schema';
import { Context as planCollectionContext } from 'context/planCollectionContext';
import { Plan } from 'types';

export function useDeletePlan() {
  const { fetchAllPlans } = useContext(planCollectionContext) as {
    state: { allPlans: Plan[] };
    fetchAllPlans: () => Promise<void>;
  };
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
    await fetchAllPlans();
  }, []);

  return deletePlan;
}
