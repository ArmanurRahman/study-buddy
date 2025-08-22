import { useEffect, useState } from 'react';
import { realmSchemas } from 'schema';
import { Plans } from 'types';
import { stringToDuration } from '../utils/time';

export const useAllPlans = () => {
  const [plans, setPlans] = useState<Plans[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    let realm: Realm;
    try {
      (async () => {
        realm = await Realm.open({ schema: realmSchemas });
        const plans = realm.objects('Plan').map((plan: any) => ({
          id: plan._id.toHexString ? plan._id.toHexString() : String(plan._id),
          title: plan.title,
          category: plan.category,
          description: plan.description,
          duration: stringToDuration(plan.duration),
          streak: plan.streak ?? 0,
          startTime: plan.startTime ? new Date(plan.startTime) : undefined,
          endDate: plan.endDate ? new Date(plan.endDate) : undefined,
          frequency: plan.frequency ? JSON.parse(plan.frequency) : [],
          startDate: plan.startDate ? new Date(plan.startDate) : undefined,
          totalHours: plan.totalHours ?? null,
        }));
        setPlans(plans);
      })();
    } catch (error) {
      console.error('Error opening Realm:', error);
    }

    return () => {
      if (realm && !realm.isClosed) realm.close();
    };
  }, [refreshFlag]);
  return { plans, refreshFlag, setRefreshFlag };
};
