import { useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import type { RouteProp } from '@react-navigation/native';

import TodayTaskCard from '../components/TodayTaskCard';
import { useTodayPlan } from 'hooks/useTodayPlan';

import { PlanStatusType } from 'types';
import { StackNavigationProp } from 'node_modules/@react-navigation/stack/lib/typescript/src/types';
import { durationToString } from 'utils/time';

function isNoTaskRunning(taskStates: Record<string, PlanStatusType>) {
  return !Object.entries(taskStates).some(([id, status]) => status === 'running');
}

type RootStackParamList = {
  TodayTaskScreen: undefined;
  StudyNow: undefined;
};

type TasksScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'TodayTaskScreen'>;
  route: RouteProp<RootStackParamList, 'TodayTaskScreen'>;
};
const TodayTaskScreen = ({ navigation }: TasksScreenProps) => {
  const today = new Date();
  const todayTasks = useTodayPlan(today);

  console.log('Today Tasks:', todayTasks);
  // Use an object for taskStates: { [id]: status }
  const [taskStates, setTaskStates] = useState<Record<string, PlanStatusType>>(
    todayTasks.reduce(
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
          {todayTasks.map((task) => (
            <TodayTaskCard
              status={taskStates[task.id]}
              setStatus={setStatus}
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              duration={durationToString(task.duration)}
              isNoTaskRunning={isNoTaskRunning(taskStates)}
            />
          ))}
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default TodayTaskScreen;
