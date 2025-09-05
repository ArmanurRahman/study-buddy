import { useContext, useEffect, useRef } from 'react';
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
import Toast from 'react-native-toast-message';

import Frequency from 'components/Frequency';
import Clock from 'components/Clock';
import { Context as PlanContext } from 'context/PlanContext';
import { useSaveUpdatePlan } from 'hooks/useSaveUpdatePlan';
import { getAutoDuration } from 'utils/time';

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
  } = useContext(PlanContext) as {
    state: {
      id: string;
      title: string;
      description?: string;
      category: string;
      startDate: Date | null;
      endDate: Date | null;
      duration: { hours: string; minutes: string };
      frequency: boolean[];
      totalHours: number | null;
    };
    changeFrequency: (frequency: boolean[]) => void;
    changeDuration: (duration: { hours: string; minutes: string }) => void;
    changeId: (id: string) => void;
  };
  const saveUpdatePlan = useSaveUpdatePlan();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
    }
    if (isFirstLoad.current && route.params?.edit) {
      return;
    }
    if (totalHours && frequency && frequency.filter(Boolean).length > 0) {
      changeDuration(
        getAutoDuration({
          totalHours,
          frequency,
          startDate: startDate || new Date(),
          endDate: endDate || new Date(),
        })
      );
    }
  }, [frequency, totalHours]);

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
    try {
      saveUpdatePlan({
        id,
        title,
        description,
        category,
        startDate,
        endDate,
        duration,
        frequency,
        totalHours,
      });
      if (id) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Plan updated!',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Plan added!',
        });
      }
    } catch (e) {
      console.error('Error saving plan:', e);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not save plan.',
      });
    }
  };

  const updateAndFetch = async () => {
    await handleAddUpdatePlan();
    navigation.navigate('AllPlans');
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
            onPress={updateAndFetch}
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
