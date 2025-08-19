import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import AddTask from '../components/AddTask';
import { formatDuration } from '../utils/time';
import { frequencyToSentence } from '../utils/frequency';
import { realmSchemas } from '../schema';
import { Task } from 'types';

const TasksScreen = () => {
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    let realm: Realm;
    (async () => {
      realm = await Realm.open({ schema: realmSchemas });
      const tasks = realm.objects('Task').map((task: any) => ({
        id: task._id.toHexString ? task._id.toHexString() : String(task._id),
        title: task.title,
        category: task.category,
        description: task.description,
        duration: task.duration,
        streak: task.streak ?? 0,
        startTime: task.startTime ? new Date(task.startTime) : undefined,
        frequency: task.frequency ? JSON.parse(task.frequency) : [],
        startDate: task.startDate ? new Date(task.startDate) : undefined,
        endDate: task.endDate ? new Date(task.endDate) : undefined,
      }));
      setAllTasks(tasks);
    })();

    return () => {
      if (realm && !realm.isClosed) realm.close();
    };
  }, [addTaskModalVisible, editTask, refreshFlag]);

  // Handler to close AddTask and refresh list
  const handleCloseAdd = (isCloseOnly = false) => {
    setAddTaskModalVisible(false);
    if (!isCloseOnly) {
      setRefreshFlag((f) => f + 1);
    }
  };

  // Handler to close EditTask and refresh list
  const handleCloseEdit = (isCloseOnly = false) => {
    setEditTask(null);
    if (!isCloseOnly) {
      setRefreshFlag((f) => f + 1);
    }
  };
  return (
    <View className="relative flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {allTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            activeOpacity={0.9}
            delayLongPress={300}
            onLongPress={() => setEditTask(task)}>
            <View
              className="flex w-full gap-2 bg-white shadow-lg"
              style={{
                borderWidth: 1,
                borderColor: '#e5e7eb',
                elevation: 4,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                padding: 16,
                borderRadius: 10,
              }}>
              <View className="mb-2 flex-row items-center">
                <Ionicons
                  name="book-outline"
                  size={22}
                  color="#2563eb"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-xl font-bold text-gray-900">{task.title}</Text>
              </View>
              <Text className="mb-3 text-gray-600">{task.description}</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color="#2563eb"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="font-semibold text-blue-600">
                    {formatDuration(task.duration)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons
                    name="flame-outline"
                    size={18}
                    color="#f59e42"
                    style={{ marginRight: 4 }}
                  />
                  <Text className="font-semibold text-orange-500">
                    {task.streak} day{task.streak !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              {task.frequency && (
                <Text className="mt-2 text-sm text-gray-500">
                  {frequencyToSentence(task.frequency)}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Floating Add Button */}
      {!addTaskModalVisible && !editTask && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 32,
            bottom: 16,
            zIndex: 10,
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
          className="rounded-full bg-blue-600 p-4"
          onPress={() => setAddTaskModalVisible(true)}
          activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      {/* Modal for Add Task */}
      {addTaskModalVisible && <AddTask onClose={handleCloseAdd} />}
      {/* Modal for Edit Task */}
      {editTask && <AddTask onClose={handleCloseEdit} editTask={editTask} />}
    </View>
  );
};

export default TasksScreen;
