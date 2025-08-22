import createDataContext from './createDataContext';

const defaultValue = {
  id: '',
  title: '',
  description: '',
  category: '',
  startDate: null,
  endDate: null,
  duration: { hours: '', minutes: '' },
  frequency: [false, false, false, false, false, false, false],
  totalHours: null,
};
interface PlanState {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date | null;
  endDate: Date | null;
  duration: { hours: string; minutes: string };
  frequency: boolean[];
  totalHours: number | null;
}

interface ChangeIdAction {
  type: 'change_id';
  payload: string;
}

interface ChangeTitleAction {
  type: 'change_title';
  payload: string;
}

interface ChangeDescriptionAction {
  type: 'change_description';
  payload: string;
}

interface ChangeCategoryAction {
  type: 'change_category';
  payload: string;
}

interface ChangeStartDateAction {
  type: 'change_start_date';
  payload: Date | null;
}

interface ChangeEndDateAction {
  type: 'change_end_date';
  payload: Date | null;
}

interface ChangeDurationAction {
  type: 'change_duration';
  payload: { hours: string; minutes: string };
}

interface ChangeFrequencyAction {
  type: 'change_frequency';
  payload: boolean[];
}

interface ChangeTotalHoursAction {
  type: 'change_total_hours';
  payload: number | null;
}

type PlanAction =
  | ChangeIdAction
  | ChangeTitleAction
  | ChangeDescriptionAction
  | ChangeCategoryAction
  | ChangeStartDateAction
  | ChangeEndDateAction
  | ChangeDurationAction
  | ChangeFrequencyAction
  | ChangeTotalHoursAction;

const planReducer = (state: PlanState, action: PlanAction): PlanState => {
  switch (action.type) {
    case 'change_id':
      return { ...state, id: action.payload };
    case 'change_title':
      return { ...state, title: action.payload };
    case 'change_description':
      return { ...state, description: action.payload };
    case 'change_category':
      return { ...state, category: action.payload };
    case 'change_start_date':
      return { ...state, startDate: action.payload };
    case 'change_end_date':
      return { ...state, endDate: action.payload };
    case 'change_duration':
      return { ...state, duration: action.payload };
    case 'change_frequency':
      return { ...state, frequency: action.payload };
    case 'change_total_hours':
      return { ...state, totalHours: action.payload };
    default:
      return state;
  }
};

interface ChangeId {
  (dispatch: React.Dispatch<PlanAction>): (id: string) => void;
}

const changeId: ChangeId = (dispatch) => (id: string) => {
  dispatch({ type: 'change_id', payload: id });
};

interface ChangeTitle {
  (dispatch: React.Dispatch<PlanAction>): (title: string) => void;
}

const changeTitle: ChangeTitle = (dispatch) => (title: string) => {
  dispatch({ type: 'change_title', payload: title });
};

interface ChangeDescription {
  (dispatch: React.Dispatch<PlanAction>): (description: string) => void;
}

const changeDescription: ChangeDescription = (dispatch) => (description: string) => {
  dispatch({ type: 'change_description', payload: description });
};

interface ChangeCategory {
  (dispatch: React.Dispatch<PlanAction>): (category: string) => void;
}

const changeCategory: ChangeCategory = (dispatch) => (category: string) => {
  dispatch({ type: 'change_category', payload: category });
};

interface ChangeStartDate {
  (dispatch: React.Dispatch<PlanAction>): (startDate: Date | null) => void;
}

const changeStartDate: ChangeStartDate = (dispatch) => (startDate: Date | null) => {
  dispatch({ type: 'change_start_date', payload: startDate });
};

interface ChangeEndDate {
  (dispatch: React.Dispatch<PlanAction>): (endDate: Date | null) => void;
}

const changeEndDate: ChangeEndDate = (dispatch) => (endDate: Date | null) => {
  dispatch({ type: 'change_end_date', payload: endDate });
};

interface ChangeDuration {
  (dispatch: React.Dispatch<PlanAction>): (duration: { hours: string; minutes: string }) => void;
}

const changeDuration: ChangeDuration =
  (dispatch) => (duration: { hours: string; minutes: string }) => {
    dispatch({
      type: 'change_duration',
      payload: duration,
    });
  };

interface ChangeFrequency {
  (dispatch: React.Dispatch<PlanAction>): (frequency: boolean[]) => void;
}

const changeFrequency: ChangeFrequency = (dispatch) => (frequency: boolean[]) => {
  dispatch({ type: 'change_frequency', payload: frequency });
};

interface ChangePlanTotalStudyTime {
  (dispatch: React.Dispatch<PlanAction>): (planTotalStudyTime: number | null) => void;
}

const changeTotalHours: ChangePlanTotalStudyTime = (dispatch) => (totalHours: number | null) => {
  dispatch({ type: 'change_total_hours', payload: totalHours });
};

export const { Provider, Context } = createDataContext(
  planReducer,
  {
    changeId,
    changeTitle,
    changeDescription,
    changeCategory,
    changeStartDate,
    changeEndDate,
    changeDuration,
    changeFrequency,
    changeTotalHours,
  },
  defaultValue
);
