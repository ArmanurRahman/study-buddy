export type TaskStatusType = 'idle' | 'running' | 'paused' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  duration: string;
  startDate?: Date;
  endDate?: Date;
  frequency?: string[];
  createdAt?: Date;
  streak?: number;
  sendNotification?: boolean;
  startTime?: Date;
  category: string;
}

export interface Plans {
  id: string;
  title: string;
  description?: string;
  duration: { hours: string; minutes: string };
  startDate?: Date;
  endDate?: Date;
  frequency?: boolean[];
  createdAt?: Date;
  streak?: number;
  sendNotification?: boolean;
  startTime?: Date;
  category: string;
  totalHours?: number;
}

export interface TaskStatus {
  id: string;
  taskId: string; // Reference to Task._id
  date: Date;
  updatedAt: Date;
  passedTime: number;
}

export interface TodaysTask extends Task {
  status: TaskStatusType;
}
