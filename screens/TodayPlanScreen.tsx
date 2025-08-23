import { useState, useEffect, useContext } from 'react';
import { View, ScrollView } from 'react-native';
import { type RouteProp } from '@react-navigation/native';

import TodayTaskCard from '../components/TodayPlanCard';
import { Context as planCollectionContext } from 'context/planCollectionContext';

import { PlanStatusType, TodaysPlan } from 'types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { durationToString } from 'utils/time';

function isNoTaskRunning(taskStates: Record<string, PlanStatusType>) {
  return !Object.entries(taskStates).some(([id, status]) => status === 'running');
}

type RootStackParamList = {
  TodayMain?: {};
  StudyNow?: { planId: string };
};

type TodayPlanScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'TodayMain'>;
  route: RouteProp<RootStackParamList, 'TodayMain'>;
};

const TodayPlanScreen = ({ navigation }: TodayPlanScreenProps) => {
  const {
    state: { todaysPlans },
    fetchTodaysPlans,
  } = useContext(planCollectionContext) as {
    state: { todaysPlans: TodaysPlan[] };
    fetchTodaysPlans: () => Promise<void>;
  };
  useEffect(() => {
    const fetchData = async () => {
      await fetchTodaysPlans();
    };
    fetchData();
  }, []);

  // Update taskStates whenever todayPlans changes
  const [taskStates, setTaskStates] = useState<Record<string, PlanStatusType>>({});
  useEffect(() => {
    setTaskStates(
      todaysPlans.reduce(
        (acc, task) => {
          task.status === 'completed' ? (acc[task.id] = 'completed') : (acc[task.id] = 'idle');
          return acc;
        },
        {} as Record<string, PlanStatusType>
      )
    );
  }, [todaysPlans]);

  const setStatus = (id: string, status: PlanStatusType) => {
    setTaskStates((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <ScrollView>
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        {todaysPlans.map((plan) => (
          <TodayTaskCard
            status={taskStates[plan.id]}
            setStatus={setStatus}
            key={plan.id}
            id={plan.id}
            title={plan.title}
            description={plan.description}
            duration={durationToString(plan.duration)}
            isNoTaskRunning={isNoTaskRunning(taskStates)}
            category={plan.category}
            streak={plan.streak}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default TodayPlanScreen;
