import { useContext } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';

import Frequency from 'components/Frequency';
import Clock from 'components/Clock';
import { Context as PlanContext } from 'context/PlanContext';
import { realmSchemas } from 'schema';
import { durationToString } from 'utils/time';

type RootStackParamList = {
  AllPlans?: { needRefresh?: boolean };
  PlanFrequency?: { edit?: boolean; needRefresh?: boolean };
  PlanDetails?: { edit?: boolean; needRefresh?: boolean };
};

type TasksScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PlanFrequency'>;
  route: RouteProp<RootStackParamList, 'PlanFrequency'>;
};

const FrequencyScreen = ({ navigation, route }: TasksScreenProps) => {
  const {
    state: {
      id,
      title,
      description,
      category,
      startDate,
      endDate,
      totalHours,
      frequency,
      duration,
    },
    changeDuration,
    changeFrequency,
    changeId,
  } = useContext(PlanContext) as {
    state: {
      id: string;
      title: string;
      description?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      duration: { hours: string; minutes: string };
      totalHours?: string;
      frequency?: boolean[];
    };
    changeFrequency: (frequency: boolean[]) => void;
    changeDuration: (duration: { hours: string; minutes: string }) => void;
    changeId: (id: string) => void;
  };
  // Save or update plan in Realm database
  const handleAddUpdatePlan = async () => {
    if (!title) {
      Alert.alert('Validation', 'Title is required');
      return;
    }
    if (duration?.hours === '' && duration?.minutes === '') {
      Alert.alert('Validation', 'Duration is required');
      return;
    }
    if (!category) {
      Alert.alert('Validation', 'Please select or add a category');
      return;
    }
    let realm: Realm | undefined;
    try {
      realm = await Realm.open({ schema: realmSchemas });

      realm.write(() => {
        if (route && route.params?.edit && id) {
          // Update existing plan
          const plan = realm?.objectForPrimaryKey('Plan', new Realm.BSON.ObjectId(id));
          if (plan) {
            plan.title = title;
            plan.category = category;
            plan.description = description;
            plan.startDate = startDate;
            plan.endDate = endDate;
            plan.duration = durationToString(duration);
            plan.frequency = JSON.stringify(frequency);
            plan.totalHours = totalHours ? parseInt(totalHours) : null;
          }
          Alert.alert('Success', 'Plan updated!');
        } else {
          // Create new plan
          const newId = new Realm.BSON.ObjectId();
          realm?.create('Plan', {
            _id: newId,
            title,
            category,
            description,
            startDate,
            endDate,
            duration: durationToString(duration),
            frequency: JSON.stringify(frequency),
            streak: 0,
            totalHours: totalHours ? parseInt(totalHours) : null,
            createdAt: new Date(),
          });
          changeId(newId.toHexString());
          Alert.alert('Success', 'Plan added!');
        }
        navigation.navigate('AllPlans', {
          ...route.params,
          needRefresh: true,
        });
      });
    } catch (e) {
      console.error('Error saving plan:', e);
      Alert.alert('Error', 'Could not save plan.');
    } finally {
      realm?.close();
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={60}>
        <View
          style={{
            width: '90%',
            padding: 24,
            borderRadius: 12,
            backgroundColor: '#f9fafb',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'left' }}>
            How often do you plan to study?
          </Text>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, marginBottom: 12, textAlign: 'left', color: '#6b7280' }}>
              Select the days of the week.
            </Text>
            {/* Frequency Input */}
            <Frequency value={frequency} onChange={changeFrequency} />
          </View>
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, marginBottom: 12, textAlign: 'left', color: '#6b7280' }}>
              Set your study duration.
            </Text>
            {/* Clock Component for Duration */}
            <Clock value={duration} onChange={changeDuration} />
          </View>

          <TouchableOpacity
            onPress={handleAddUpdatePlan}
            style={{
              backgroundColor: '#2563eb',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
              {route.params?.edit ? 'Update' : 'Create'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default FrequencyScreen;
