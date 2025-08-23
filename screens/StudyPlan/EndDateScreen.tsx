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
  TextInput,
} from 'react-native';

import DateTime from 'components/DateTime';
import { Context as PlanContext } from 'context/PlanContext';

type RootStackParamList = {
  AllPlans: undefined;
  PlanEndDate?: { edit?: boolean };
  PlanFrequency?: { edit?: boolean };
};

type TasksScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PlanEndDate'>;
  route: RouteProp<RootStackParamList, 'PlanEndDate'>;
};

const EndDateScreen = ({ navigation, route }: TasksScreenProps) => {
  const [showEndPicker, setShowEndPicker] = useState(false);

  const {
    state: { endDate, totalHours },
    changeEndDate,
    changeTotalHours,
  } = useContext(PlanContext) as {
    state: { endDate: Date | undefined; totalHours: number | null };
    changeEndDate: (endDate: Date | undefined) => void;
    changeTotalHours: (totalHours: number | null) => void;
  };

  const handleNext = () => {
    navigation.navigate('PlanFrequency', {
      ...route.params,
      edit: route.params?.edit ?? false,
    });
  };

  const handleSkip = () => {
    changeEndDate(undefined);
    handleNext();
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        setShowEndPicker(false);
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
            Do you have an end date or total study hours in mind?
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 12, textAlign: 'left', color: '#6b7280' }}>
            End Date and Total Study Hours will help you to stay on track.
          </Text>
          <View className="relative w-full" style={{ marginBottom: 0 }}>
            <DateTime
              date={endDate}
              setDate={(date) => {
                changeEndDate(date);
              }}
              showPicker={showEndPicker}
              setShowPicker={setShowEndPicker}
            />
          </View>
          <TextInput
            placeholder="Enter total study hours"
            value={totalHours?.toString()}
            onChangeText={(text) => {
              const hours = text ? parseInt(text, 10) : null;
              changeTotalHours(hours);
            }}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 18,
              marginBottom: 24,
              backgroundColor: '#fff',
            }}
          />
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

export default EndDateScreen;
