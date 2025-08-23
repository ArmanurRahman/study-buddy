import { useCallback, useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
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
  TodayMain?: {};
  StudyNow?: { planId: string };
};

type TodayPlanScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'TodayMain'>;
  route: RouteProp<RootStackParamList, 'TodayMain'>;
};

const TodayPlanScreen = ({ navigation }: TodayPlanScreenProps) => {
  const today = new Date();
  const { todayPlans, setRefreshKey } = useTodayPlan(today);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (refreshing) setRefreshing(false);
  }, [todayPlans]);

  // Update taskStates whenever todayPlans changes
  const [taskStates, setTaskStates] = useState<Record<string, PlanStatusType>>({});
  useEffect(() => {
    setTaskStates(
      todayPlans.reduce(
        (acc, task) => {
          acc[task.id] = 'idle';
          return acc;
        },
        {} as Record<string, PlanStatusType>
      )
    );
  }, [todayPlans]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey((f) => f + 1);
  }, [setRefreshKey]);

  const setStatus = (id: string, status: PlanStatusType) => {
    setTaskStates((prev) => ({ ...prev, [id]: status }));
  };

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
            refresh={onRefresh}
            streak={plan.streak}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default TodayPlanScreen;
