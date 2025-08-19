import Realm from 'realm';

const TaskStatusSchema: Realm.ObjectSchema = {
  name: 'TaskStatus',
  properties: {
    _id: 'objectId',
    taskId: 'objectId', // Reference to Task._id
    date: 'date', // The date this status applies to
    status: 'string', // 'idle' | 'running' | 'paused' | 'completed'
    updatedAt: 'date',
    passedTime: 'int',
  },
  primaryKey: '_id',
};

export default TaskStatusSchema;
