import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import TodayTaskCard from '../components/TodayTaskCard';
import { realmSchemas } from '../schema';

function isNoTaskRunning(taskStates: Record<string, 'idle' | 'running' | 'paused' | 'completed'>) {
  return !Object.entries(taskStates).some(([id, status]) => status === 'running');
}

// Helper to check if today is between startDate and endDate (inclusive)
function isTodayInRange(startDate: Date, endDate: Date, today: Date) {
  // Remove time part for comparison
  const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const e = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return t >= s && t <= e;
}

const TodayTaskScreen = () => {
  const today = new Date();
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  useEffect(() => {
    let realm: Realm;
    (async () => {
      realm = await Realm.open({ schema: realmSchemas });
      // Get all tasks and filter by date range
      const tasks = realm
        .objects('Task')
        .filter((task: any) => {
          if (!task.startDate || !task.endDate) return false;
          const start = task.startDate instanceof Date ? task.startDate : new Date(task.startDate);
          const end = task.endDate instanceof Date ? task.endDate : new Date(task.endDate);
          return isTodayInRange(start, end, today);
        })
        .map((task: any) => ({
          id: task._id.toHexString ? task._id.toHexString() : String(task._id),
          title: task.title,
          description: task.description,
          duration: task.duration,
          startDate: task.startDate,
          endDate: task.endDate,
        }));
      setTodayTasks(tasks);
    })();
    return () => {
      if (realm && !realm.isClosed) realm.close();
    };
  }, []);

  console.log('Today Tasks:', todayTasks);
  // Use an object for taskStates: { [id]: status }
  const [taskStates, setTaskStates] = useState<
    Record<string, 'idle' | 'running' | 'paused' | 'completed'>
  >(
    todayTasks.reduce(
      (acc, task) => {
        acc[task.id] = 'idle';
        return acc;
      },
      {} as Record<string, 'idle' | 'running' | 'paused' | 'completed'>
    )
  );

  const setStatus = (id: string, status: 'idle' | 'running' | 'paused' | 'completed') => {
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
