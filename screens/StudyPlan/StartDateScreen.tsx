import { useContext, useState } from 'react';
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
} from 'react-native';

import DateTime from 'components/DateTime';
import { Context as PlanContext } from 'context/PlanContext';

type RootStackParamList = {
  AllPlans: undefined;
  PlanStartDate?: { edit?: boolean };
  PlanEndDate?: { edit?: boolean };
};

type TasksScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PlanStartDate'>;
  route: RouteProp<RootStackParamList, 'PlanStartDate'>;
};

const StartDateScreen = ({ navigation, route }: TasksScreenProps) => {
  const [showStartPicker, setShowStartPicker] = useState(false);
  const {
    state: { startDate },
    changeStartDate,
  } = useContext(PlanContext) as {
    state: { startDate: Date | undefined };
    changeStartDate: (startDate: Date | undefined) => void;
  };

  const handleNext = () => {
    // Pass the start time to the next screen or handle as needed
    // navigation.navigate('NextScreen', { startTime }); // Replace 'NextScreen' with your actual next screen name
    navigation.navigate('PlanEndDate', {
      ...route.params,
      edit: route.params?.edit ?? false,
    });
  };

  const handleSkip = () => {
    changeStartDate(undefined);
    handleNext();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowStartPicker(false);
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
            Do you want to set a start date for your study plan?
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 12, textAlign: 'left', color: '#6b7280' }}>
            This helps you plan your study sessions more effectively.
          </Text>
          <View className="relative w-full" style={{ marginBottom: 24 }}>
            <DateTime
              date={startDate}
              setDate={changeStartDate}
              showPicker={showStartPicker}
              setShowPicker={setShowStartPicker}
            />
          </View>

          <TouchableOpacity
            onPress={handleNext}
            style={{
              backgroundColor: '#2563eb',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Next</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSkip}
            style={{
              backgroundColor: '#a5b4fc',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
            }}>
            <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 18 }}>Skip</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default StartDateScreen;
