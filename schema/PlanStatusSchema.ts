import Realm from 'realm';

const PlanStatusSchema: Realm.ObjectSchema = {
  name: 'PlanStatus',
  properties: {
    _id: 'objectId',
    planId: 'objectId', // Reference to Plan._id
    date: 'date', // The date this status applies to
    status: 'string', // 'idle' | 'running' | 'paused' | 'completed'
    updatedAt: 'date',
    passedTime: 'int',
  },
  primaryKey: '_id',
};

export default PlanStatusSchema;
