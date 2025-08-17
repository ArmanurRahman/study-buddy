// Define your Realm schema
const TaskSchema = {
  name: 'Task',
  properties: {
    _id: 'objectId',
    title: 'string',
    description: 'string',
    startDate: 'date?',
    endDate: 'date?',
    duration: 'string?', // You can store as "1h 30m" or similar
    frequency: 'string?', // Store as JSON string or comma-separated
    createdAt: 'date',
    streak: 'int?',
  },
  primaryKey: '_id',
};

export default TaskSchema;
