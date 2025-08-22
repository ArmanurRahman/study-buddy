import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import type { RouteProp } from '@react-navigation/native';

import TodayTaskCard from '../components/TodayPlanCard';
import { useTodayPlan } from 'hooks/useTodayPlan';

import { PlanStatusType } from 'types';
import type { StackNavigationProp } from '@react-navigation/stack';
import { durationToString } from 'utils/time';

function isNoTaskRunning(taskStates: Record<string, PlanStatusType>) {
  return !Object.entries(taskStates).some(([id, status]) => status === 'running');
}

type RootStackParamList = {
  TodayMain?: {};
  StudyNow?: { taskId: string };
};

type TodayPlanScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'TodayMain'>;
  route: RouteProp<RootStackParamList, 'TodayMain'>;
};

const TodayPlanScreen = ({ navigation }: TodayPlanScreenProps) => {
  const today = new Date();
  const todayPlans = useTodayPlan(today);

  console.log('Today Tasks:', todayPlans);
  // Use an object for taskStates: { [id]: status }
  const [taskStates, setTaskStates] = useState<Record<string, PlanStatusType>>(
    todayPlans.reduce(
      (acc, task) => {
        acc[task.id] = 'idle';
        return acc;
      },
      {} as Record<string, PlanStatusType>
    )
  );

  const setStatus = (id: string, status: PlanStatusType) => {
    setTaskStates((prev) => ({ ...prev, [id]: status }));
  };
  return (
    <ScrollView>
      <TouchableOpacity onPress={() => navigation.navigate('StudyNow')}>
        <View className="flex-1 items-center justify-center bg-gray-50 p-4">
          {todayPlans.map((plan) => (
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
            />
          ))}
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TodayPlanScreen;
