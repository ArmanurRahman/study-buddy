import { PlanStatusType, TodaysPlan } from 'types';
import createDataContext from './createDataContext';

const defaultState = {
  studyStatus: {},
  planStudy: {},
};

interface PlanStudyState {
  timer: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  startTimestamp: number | null;
  remainingSeconds: number | null;
  timerRunning: boolean;
}

export interface StudyNowContextType {
  studyStatus: Record<string, PlanStatusType>;
  planStudy: Record<string, PlanStudyState>;
}

interface ChangeStudyStatusAction {
  type: 'CHANGE_STUDY_STATUS';
  payload: {
    planId: string;
    status: PlanStatusType;
  };
}

interface InitiateStudyNowStatusAction {
  type: 'INITIATE_STUDY_NOW_STATUS';
  payload: {
    todaysPlans: TodaysPlan[];
  };
}

interface ChangeTimerAction {
  type: 'CHANGE_TIMER';
  payload: {
    planId: string;
    timer: {
      hours: number;
      minutes: number;
      seconds: number;
    };
  };
}

interface ChangeStartTimestampAction {
  type: 'CHANGE_START_TIMESTAMP';
  payload: {
    planId: string;
    startTimestamp: number | null;
  };
}

interface ChangeRemainingSecondsAction {
  type: 'CHANGE_REMAINING_SECONDS';
  payload: {
    planId: string;
    remainingSeconds: number | null;
  };
}

interface ChangeTimerRunningAction {
  type: 'CHANGE_TIMER_RUNNING';
  payload: {
    planId: string;
    timerRunning: boolean;
  };
}

type Action =
  | ChangeStudyStatusAction
  | InitiateStudyNowStatusAction
  | ChangeTimerAction
  | ChangeStartTimestampAction
  | ChangeRemainingSecondsAction
  | ChangeTimerRunningAction;

const studyNowReducer = (state: StudyNowContextType, action: Action): StudyNowContextType => {
  switch (action.type) {
    case 'CHANGE_STUDY_STATUS':
      return {
        ...state,
        studyStatus: {
          ...state.studyStatus,
          [action.payload.planId]: action.payload.status,
        },
      };
    case 'INITIATE_STUDY_NOW_STATUS':
      const todaysPlans = action.payload.todaysPlans;
      const newStudyStatus = todaysPlans.reduce(
        (acc, task) => {
          acc[task.id] = task.status === 'completed' ? 'completed' : 'idle';
          return acc;
        },
        {} as Record<string, PlanStatusType>
      );
      // Also initialize planStudy for each plan
      const newPlanStudy = { ...state.planStudy };
      todaysPlans.forEach((plan) => {
        if (!newPlanStudy[plan.id]) {
          newPlanStudy[plan.id] = {
            timer: { hours: 0, minutes: 0, seconds: 0 },
            startTimestamp: null,
            remainingSeconds:
              parseInt(plan.duration.hours) * 3600 + parseInt(plan.duration.minutes) * 60 + 0,
            timerRunning: false,
          };
        }
      });
      return {
        ...state,
        studyStatus: newStudyStatus,
        planStudy: newPlanStudy,
      };
    case 'CHANGE_TIMER':
      return {
        ...state,
        planStudy: {
          ...state.planStudy,
          [action.payload.planId]: {
            ...state.planStudy[action.payload.planId],
            timer: action.payload.timer,
          },
        },
      };
    case 'CHANGE_START_TIMESTAMP':
      return {
        ...state,
        planStudy: {
          ...state.planStudy,
          [action.payload.planId]: {
            ...state.planStudy[action.payload.planId],
            startTimestamp: action.payload.startTimestamp,
          },
        },
      };
    case 'CHANGE_REMAINING_SECONDS':
      return {
        ...state,
        planStudy: {
          ...state.planStudy,
          [action.payload.planId]: {
            ...state.planStudy[action.payload.planId],
            remainingSeconds: action.payload.remainingSeconds,
          },
        },
      };
    case 'CHANGE_TIMER_RUNNING':
      return {
        ...state,
        planStudy: {
          ...state.planStudy,
          [action.payload.planId]: {
            ...state.planStudy[action.payload.planId],
            timerRunning: action.payload.timerRunning,
          },
        },
      };
    default:
      return state;
  }
};

const changeStudyNowStatus =
  (dispatch: React.Dispatch<Action>) =>
  (planId: string, status: PlanStatusType): void => {
    dispatch({
      type: 'CHANGE_STUDY_STATUS',
      payload: {
        planId,
        status,
      },
    });
  };

const initiateStudyNowStatus =
  (dispatch: React.Dispatch<Action>) =>
  (todaysPlans: TodaysPlan[]): void => {
    dispatch({
      type: 'INITIATE_STUDY_NOW_STATUS',
      payload: {
        todaysPlans,
      },
    });
  };

const changeTimer =
  (dispatch: React.Dispatch<Action>) =>
  (planId: string, timer: { hours: number; minutes: number; seconds: number }) => {
    dispatch({ type: 'CHANGE_TIMER', payload: { planId, timer } });
  };

const changeStartTimestamp =
  (dispatch: React.Dispatch<Action>) => (planId: string, startTimestamp: number | null) => {
    dispatch({ type: 'CHANGE_START_TIMESTAMP', payload: { planId, startTimestamp } });
  };

const changeRemainingSeconds =
  (dispatch: React.Dispatch<Action>) => (planId: string, remainingSeconds: number | null) => {
    dispatch({ type: 'CHANGE_REMAINING_SECONDS', payload: { planId, remainingSeconds } });
  };

const changeTimerRunning =
  (dispatch: React.Dispatch<Action>) => (planId: string, timerRunning: boolean) => {
    dispatch({ type: 'CHANGE_TIMER_RUNNING', payload: { planId, timerRunning } });
  };

export const { Provider, Context } = createDataContext(
  studyNowReducer,
  {
    changeStudyNowStatus,
    initiateStudyNowStatus,
    changeTimer,
    changeStartTimestamp,
    changeRemainingSeconds,
    changeTimerRunning,
  },
  defaultState
);
