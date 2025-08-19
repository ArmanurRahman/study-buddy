import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import TodayTaskCard from '../components/TodayTaskCard';
import { useTodayTasks } from 'hooks/useTodayTasks';

import { TaskStatusType } from 'types';

function isNoTaskRunning(taskStates: Record<string, TaskStatusType>) {
  return !Object.entries(taskStates).some(([id, status]) => status === 'running');
}

const TodayTaskScreen = () => {
  const today = new Date();
  const todayTasks = useTodayTasks(today);

  console.log('Today Tasks:', todayTasks);
  // Use an object for taskStates: { [id]: status }
  const [taskStates, setTaskStates] = useState<Record<string, TaskStatusType>>(
    todayTasks.reduce(
      (acc, task) => {
        acc[task.id] = 'idle';
        return acc;
      },
      {} as Record<string, TaskStatusType>
    )
  );

  const setStatus = (id: string, status: TaskStatusType) => {
    setTaskStates((prev) => ({ ...prev, [id]: status }));
  };
  return (
    <ScrollView>
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        {todayTasks.map((task) => (
          <TodayTaskCard
            status={taskStates[task.id]}
            setStatus={setStatus}
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
            duration={task.duration}
            isNoTaskRunning={isNoTaskRunning(taskStates)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default TodayTaskScreen;
