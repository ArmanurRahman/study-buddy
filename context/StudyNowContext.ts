import { PlanStatusType } from 'types';
import createDataContext from './createDataContext';

const defaultState = {
  studyStatus: {},
};

interface StudyNowContextType {
  studyStatus: Record<string, PlanStatusType>;
}

interface ChangeStudyStatusAction {
  type: 'CHANGE_STUDY_STATUS';
  payload: {
    planId: string;
    status: PlanStatusType;
  };
}
type Action = ChangeStudyStatusAction;

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

export const { Provider, Context } = createDataContext(
  studyNowReducer,
  { changeStudyNowStatus },
  defaultState
);
