export type PlanStatusType = 'idle' | 'running' | 'paused' | 'completed';

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

export interface Plan {
  id: string;
  title: string;
  description?: string;
  duration: { hours: string; minutes: string };
  startDate: Date | null;
  endDate: Date | null;
  frequency?: boolean[];
  createdAt?: Date;
  streak?: number;
  sendNotification?: boolean;
  startTime?: Date;
  category: string;
  totalHours: number | null;
  isEnd?: boolean;
}

export interface PlanStatus {
  id: string;
  taskId: string; // Reference to Task._id
  date: Date;
  updatedAt: Date;
  passedTime: number;
}

export interface TodaysPlan extends Plan {
  status: PlanStatusType;
}
