import { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Switch } from 'react-native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';

import AddTask from '../components/AddTask';
import { durationToString, formatDuration } from '../utils/time';
import { frequencyToSentence } from '../utils/frequency';
import { Plan } from 'types';
import Streak from 'components/Streak';
import CategoryIcon from 'components/CategoryIcon';
import { Context as PlanContext } from 'context/PlanContext';
import { useAllPlans } from 'hooks/useAllPlans';
import { RouteProp } from '@react-navigation/native';
import { useDeletePlan } from 'hooks/useDeletePlan';

type RootStackParamList = {
  AllPlans?: { needRefresh?: boolean };
  PlanTitle?: { edit: boolean };
};

type TasksScreenProps = {
  navigation: any;
  route: RouteProp<RootStackParamList, 'AllPlans'>;
};

const AllPlansScreen = ({ navigation, route }: TasksScreenProps) => {
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [showEndedPlans, setShowEndedPlans] = useState(false);

  const { changePlan, resetPlan } = useContext(PlanContext) as {
    state: { title: string };
    changePlan: (plan: Plan) => void;
    resetPlan: () => void;
  };
  const { plans } = useAllPlans(showEndedPlans);

  const deletePlan = useDeletePlan();

  // Handler to close AddTask and refresh list
  const handleCloseAdd = () => {
    setAddTaskModalVisible(false);
  };

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
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      <View style={styles.headerRow}>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Show Ended</Text>
          <Switch
            value={showEndedPlans}
            onValueChange={setShowEndedPlans}
            thumbColor={showEndedPlans ? '#2563eb' : '#f1f5f9'}
            trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
          />
        </View>
      </View>
      <SwipeListView
        data={plans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 80 }}
        renderItem={({ item: plan }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            delayLongPress={300}
            onLongPress={() => {
              changePlan(plan);
              navigation.navigate('PlanTitle', { edit: true });
            }}
            onPress={() => {
              changePlan(plan);
              navigation.navigate('PlanDetails', { planId: plan.id });
            }}
            style={styles.cardContainer}>
            {/* Gradient Accent Bar */}
            <LinearGradient
              colors={['#2563eb', '#10b981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accentBar}
            />
            <View style={styles.cardContent}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.categoryIconWrapper}>
                  <CategoryIcon category={plan.category} />
                </View>
                <Text style={styles.planTitle}>{plan.title}</Text>
                {plan.isEnd && (
                  <View style={styles.endedLabel}>
                    <Ionicons name="checkmark-done-circle-outline" size={16} color="#10b981" />
                    <Text style={styles.endedLabelText}>Ended</Text>
                  </View>
                )}
                <View style={styles.categoryLabel}>
                  <Text style={styles.categoryLabelText}>{plan.category || 'General'}</Text>
                </View>
              </View>
              {plan.description ? (
                <Text style={styles.planDescription}>{plan.description}</Text>
              ) : null}
              <View style={styles.cardInfoRow}>
                <View style={styles.durationWrapper}>
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color="#2563eb"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.durationText}>
                    {formatDuration(durationToString(plan.duration))}
                  </Text>
                </View>
                <Streak streak={plan.streak || 0} />
              </View>
              {plan.frequency && (
                <Text style={styles.frequencyText}>{frequencyToSentence(plan.frequency)}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
        renderHiddenItem={({ item }) => (
          <View style={styles.hiddenRow}>
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
              <Ionicons name="trash-outline" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        rightOpenValue={-80}
        disableRightSwipe
        showsVerticalScrollIndicator={false}
      />
      {/* Floating Add Button */}
      {!addTaskModalVisible && (
        <TouchableOpacity
          style={styles.fab}
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
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 24,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-end',
  },
  switchLabel: {
    color: '#64748b',
    fontSize: 15,
    marginRight: 4,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 24,
    letterSpacing: 0.5,
  },
  cardContainer: {
    marginBottom: 18,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 8,
    backgroundColor: '#fff',
  },
  accentBar: {
    height: 7,
    width: '100%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  cardContent: {
    padding: 22,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIconWrapper: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 8,
    marginRight: 10,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  categoryLabel: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  categoryLabelText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 13,
  },
  planDescription: {
    color: '#64748b',
    fontSize: 16,
    marginBottom: 12,
    marginLeft: 2,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  durationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
  },
  durationText: {
    fontWeight: '600',
    color: '#2563eb',
    fontSize: 15,
  },
  frequencyText: {
    marginTop: 2,
    color: '#94a3b8',
    fontSize: 13,
    fontStyle: 'italic',
    marginLeft: 2,
  },
  hiddenRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 18,
    borderRadius: 22,
    overflow: 'hidden',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: 22,
  },
  fab: {
    position: 'absolute',
    right: 32,
    bottom: 24,
    zIndex: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderRadius: 32,
    backgroundColor: '#2563eb',
    padding: 18,
  },
  endedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  endedLabelText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 4,
  },
});

export default AllPlansScreen;
