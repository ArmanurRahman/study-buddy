import { useEffect, useContext } from 'react';
import { View, ScrollView } from 'react-native';
import { type RouteProp } from '@react-navigation/native';

import TodayTaskCard from '../components/TodayPlanCard';
import { useTodayPlan } from 'hooks/useTodayPlan';

import { PlanStatusType, TodaysPlan } from 'types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { durationToString } from 'utils/time';

import { Context as StudyNowContext } from 'context/StudyNowContext';

function isNoTaskRunning(taskStates: Record<string, PlanStatusType>) {
  return !Object.entries(taskStates).some(([id, status]) => status === 'running');
}

type RootStackParamList = {
  StudyMain?: {};
  StudyNow?: { planId: string };
};

type StudyPlanScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'StudyMain'>;
  route: RouteProp<RootStackParamList, 'StudyMain'>;
};

const StudyPlanScreen = ({ navigation }: StudyPlanScreenProps) => {
  const { todaysPlans } = useTodayPlan(new Date());

  // Update taskStates whenever todayPlans changes
  const {
    state: { studyStatus },
    changeStudyNowStatus,
    initiateStudyNowStatus,
  } = useContext(StudyNowContext) as {
    state: { studyStatus: Record<string, PlanStatusType> };
    changeStudyNowStatus: (planId: string, status: PlanStatusType) => void;
    initiateStudyNowStatus: (todaysPlans: TodaysPlan[]) => void;
  };

  useEffect(() => {
    initiateStudyNowStatus(todaysPlans);
  }, [todaysPlans]);

  const setStatus = (id: string, status: PlanStatusType) => {
    changeStudyNowStatus(id, status);
    // setTaskStates((prev) => ({ ...prev, [id]: status }));
  };
  return (
    <ScrollView>
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        {todaysPlans.map((plan) => (
          <TodayTaskCard
            status={studyStatus[plan.id]}
            setStatus={setStatus}
            key={plan.id}
            id={plan.id}
            title={plan.title}
            description={plan.description}
            duration={durationToString(plan.duration)}
            isNoTaskRunning={isNoTaskRunning(studyStatus)}
            category={plan.category}
            streak={plan.streak}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default StudyPlanScreen;
