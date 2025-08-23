import { Plan, PlanStatusType, TodaysPlan } from 'types';
import createDataContext from './createDataContext';
import { realmSchemas } from 'schema';
import { isTodayInRange, stringToDuration } from 'utils/time';

const defaultValue = {
  allPlans: [],
  todaysPlans: [],
};
interface PlanState {
  allPlans: Plan[];
  todaysPlans: TodaysPlan[];
}

interface setAllPlanAction {
  type: 'set_all_plan';
  payload: Plan[];
}

interface setTodaysPlanAction {
  type: 'set_todays_plan';
  payload: TodaysPlan[];
}

type PlanCollectionAction = setAllPlanAction | setTodaysPlanAction;

const planReducer = (state: PlanState, action: PlanCollectionAction): PlanState => {
  switch (action.type) {
    case 'set_all_plan':
      return { ...state, allPlans: action.payload };
    case 'set_todays_plan':
      return { ...state, todaysPlans: action.payload };
    default:
      return state;
  }
};
// Fetch all plans from Realm and dispatch to context
const fetchAllPlans = (dispatch: React.Dispatch<PlanCollectionAction>) => async () => {
  console.log('Fetching all plans...');
  let realm: Realm | null = null;
  try {
    realm = await Realm.open({ schema: realmSchemas });
    const realmPlans = Array.from(realm.objects('Plan'));
    const plans = realmPlans.map((plan: any) => ({
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
    dispatch({ type: 'set_all_plan', payload: plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
  } finally {
    if (realm && !realm.isClosed) realm.close();
  }
};

// Fetch today's plans from Realm and dispatch to context
const fetchTodaysPlans = (dispatch: React.Dispatch<PlanCollectionAction>) => async () => {
  const today = new Date();
  let realm: Realm | null = null;
  try {
    realm = await Realm.open({ schema: realmSchemas });
    const realmPlans = Array.from(realm.objects('Plan'));
    // Get all plans and filter by date range
    const plans = realmPlans
      .filter((plan: any) => {
        if (!plan.startDate) return false;
        const start = plan.startDate instanceof Date ? plan.startDate : new Date(plan.startDate);
        // If endDate is not set, only check startDate
        if (!plan.endDate) {
          return isTodayInRange(start, undefined, today);
        }
        const end = plan.endDate instanceof Date ? plan.endDate : new Date(plan.endDate);
        return isTodayInRange(start, end, today);
      })
      .map((plan: any) => {
        const planId = plan._id?.toHexString ? plan._id.toHexString() : String(plan._id);
        // Find today's PlanStatus for this plan
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);

        const statusObj = realm
          ?.objects('PlanStatus')
          .filtered(
            'planId == $0 AND date >= $1 AND date <= $2',
            plan._id,
            startOfDay,
            endOfDay
          )[0];

        return {
          id: planId,
          title: plan.title,
          description: plan.description,
          duration: stringToDuration(plan.duration),
          startDate: plan.startDate,
          endDate: plan.endDate,
          streak: plan.streak,
          startTime: plan.startTime,
          frequency: plan.frequency ? JSON.parse(plan.frequency) : [],
          category: plan.category,
          status: (statusObj ? statusObj.status : 'idle') as PlanStatusType,
        };
      });
    dispatch({ type: 'set_todays_plan', payload: plans });
  } catch (error) {
    console.error("Error fetching today's plans:", error);
  } finally {
    if (realm && !realm.isClosed) realm.close();
  }
};

interface ChangeAllPlan {
  (dispatch: React.Dispatch<PlanCollectionAction>): (plan: PlanState) => void;
}

const changePlan: ChangeAllPlan = (dispatch) => (plan: PlanState) => {
  dispatch({ type: 'set_all_plan', payload: plan.allPlans });
};

interface ChangeTodaysPlan {
  (dispatch: React.Dispatch<PlanCollectionAction>): (plan: PlanState) => void;
}

const changeTodaysPlan: ChangeTodaysPlan = (dispatch) => (plan: PlanState) => {
  dispatch({ type: 'set_todays_plan', payload: plan.todaysPlans });
};

export const { Provider, Context } = createDataContext(
  planReducer,
  {
    changePlan,
    changeTodaysPlan,
    fetchAllPlans,
    fetchTodaysPlans,
  },
  defaultValue
);
