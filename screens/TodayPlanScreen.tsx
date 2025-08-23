import { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { type RouteProp } from '@react-navigation/native';

import TodayTaskCard from '../components/TodayPlanCard';
import { useTodayPlan } from 'hooks/useTodayPlan';

import { PlanStatusType } from 'types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { durationToString } from 'utils/time';

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

export default StudyPlanScreen;
