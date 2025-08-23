import { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
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
import { useDeletePlan } from 'hooks/useDeletePlan';

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
  const [refreshing, setRefreshing] = useState(false);

  const { changePlan, resetPlan } = useContext(PlanContext) as {
    state: { title: string };
    changePlan: (plan: Plan) => void;
    resetPlan: () => void;
  };

  const { plans, setRefreshFlag } = useAllPlans();
  const deletePlan = useDeletePlan();

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshFlag((f) => f + 1);
    setTimeout(() => setRefreshing(false), 600);
  }, [setRefreshFlag]);

  // Handler for delete
  const handleDelete = (planId: string) => {
    Alert.alert(
      'Delete Plan',
      'Are you sure you want to delete this plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePlan(planId);
            setRefreshFlag((f) => f + 1);
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="relative flex-1 bg-gray-50">
      <SwipeListView
        data={plans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item: plan }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            delayLongPress={300}
            onLongPress={() => {
              changePlan(plan);
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
        )}
        renderHiddenItem={({ item }) => (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
              marginBottom: 18,
              borderRadius: 18,
              overflow: 'hidden',
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#ef4444',
                justifyContent: 'center',
                alignItems: 'center',
                width: 80,
                height: '100%',
                borderRadius: 18,
              }}
              onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-80}
        disableRightSwipe
        showsVerticalScrollIndicator={false}
      />
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
