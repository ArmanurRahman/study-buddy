import { useRealm } from '@realm/react';
import { Plan } from 'types';
import { durationToString } from 'utils/time';

export const useSaveUpdatePlan = () => {
  const realm = useRealm();
  return (plan: Plan) => {
    realm.write(() => {
      if (plan.id) {
        // Update existing
        const obj = realm.objectForPrimaryKey('Plan', new Realm.BSON.ObjectId(plan.id));
        if (obj) {
          obj.title = plan.title;
          obj.description = plan.description;
          obj.category = plan.category;
          obj.startDate = plan.startDate;
          obj.endDate = plan.endDate;
          obj.duration = durationToString(plan.duration);
          obj.frequency = JSON.stringify(plan.frequency);
          obj.totalHours = plan.totalHours ?? null;
        }
      } else {
        // Create new
        realm.create('Plan', {
          _id: new Realm.BSON.ObjectId(),
          title: plan.title,
          description: plan.description,
          category: plan.category,
          startDate: plan.startDate,
          endDate: plan.endDate,
          duration: durationToString(plan.duration),
          frequency: JSON.stringify(plan.frequency),
          totalHours: plan.totalHours ?? null,
          createdAt: new Date(),
          streak: 0,
        });
      }
    });
  };
};
