import { useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';

import AddTask from '../components/AddTask';
import { durationToString, formatDuration } from '../utils/time';
import { frequencyToSentence } from '../utils/frequency';
import { Plan } from 'types';
import { useAllPlans } from 'hooks/useAllPlans';
import Streak from 'components/Streak';
import CategoryIcon from 'components/CategoryIcon';
import { Context as PlanContext } from 'context/PlanContext';
import { RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  AllPlans?: { needRefresh?: boolean };
  PlanTitle?: { edit: boolean };
};

type TasksScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'AllPlans'>;
  route: RouteProp<RootStackParamList, 'AllPlans'>;
};

const AllPlansScreen = ({ navigation, route }: TasksScreenProps) => {
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [editTask, setEditTask] = useState<Plan | null>(null);

  const { changePlan, resetPlan } = useContext(PlanContext) as {
    state: { title: string };
    changePlan: (plan: Plan) => void;
    resetPlan: () => void;
  };

  const { plans, setRefreshFlag } = useAllPlans();

  useEffect(() => {
    if (route.params?.needRefresh) {
      // Fetch plans again or perform any necessary updates
      setRefreshFlag((prev) => prev + 1);
    }
  }, []);

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
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.92}
            delayLongPress={300}
            onLongPress={() => {
              changePlan(plan);
              console.log('Editing plan:', plan);
              navigation.navigate('PlanTitle', { edit: true });
            }}
            style={{
              marginBottom: 18,
              borderRadius: 18,
              overflow: 'hidden',
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
              elevation: 6,
              backgroundColor: '#fff',
            }}>
            {/* Accent bar */}
            <LinearGradient
              colors={['#2563eb', '#f59e42']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: 6, width: '100%' }}
            />
            <View style={{ padding: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <CategoryIcon category={plan.category} />
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: 'bold',
                    color: '#1e293b',
                    flex: 1,
                    marginLeft: 8,
                  }}>
                  {plan.title}
                </Text>
                <View
                  style={{
                    backgroundColor: '#f1f5f9',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    marginLeft: 8,
                  }}>
                  <Text style={{ color: '#2563eb', fontWeight: '600', fontSize: 13 }}>
                    {plan.category || 'General'}
                  </Text>
                </View>
              </View>
              {plan.description ? (
                <Text
                  style={{
                    color: '#64748b',
                    fontSize: 16,
                    marginBottom: 12,
                    marginLeft: 2,
                  }}>
                  {plan.description}
                </Text>
              ) : null}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 6,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color="#2563eb"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={{ fontWeight: '600', color: '#2563eb', fontSize: 15 }}>
                    {formatDuration(durationToString(plan.duration))}
                  </Text>
                </View>
                <Streak streak={plan.streak || 0} />
              </View>
              {plan.frequency && (
                <Text
                  style={{
                    marginTop: 2,
                    color: '#94a3b8',
                    fontSize: 13,
                    fontStyle: 'italic',
                    marginLeft: 2,
                  }}>
                  {frequencyToSentence(plan.frequency)}
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
          onPress={() => {
            resetPlan();
            navigation.navigate('PlanTitle');
          }}
          activeOpacity={0.8}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      {/* Modal for Add Task */}
      {addTaskModalVisible && <AddTask onClose={handleCloseAdd} />}
      {/* Modal for Edit Task */}
      {/* {editTask && <AddTask onClose={handleCloseEdit} editTask={editTask} />} */}
    </View>
  );
};

export default AllPlansScreen;
