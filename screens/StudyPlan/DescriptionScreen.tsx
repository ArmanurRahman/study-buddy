import { useContext } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Context as PlanContext } from 'context/PlanContext';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type RootStackParamList = {
  AllPlans: undefined;
  PlanTitle: undefined;
  PlanDescription?: { edit?: boolean };
  PlanCategory?: { edit?: boolean };
};

type TasksScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PlanDescription'>;
  route: RouteProp<RootStackParamList, 'PlanDescription'>;
};

const DescriptionScreen = ({ navigation, route }: TasksScreenProps) => {
  const {
    state: { description },
    changeDescription,
  } = useContext(PlanContext) as {
    state: { description: string };
    changeDescription: (description: string) => void;
  };

  const handleNext = () => {
    navigation.navigate('PlanCategory', {
      ...route.params,
      edit: route.params?.edit ?? false,
    });
  };

  const handleSkip = () => {
    changeDescription('');
    handleNext();
  };

  return (
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
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>
          Add Study Plan Description
        </Text>
        <TextInput
          placeholder="Enter your study plan description"
          value={description}
          onChangeText={changeDescription}
          multiline
          numberOfLines={4}
          style={{
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 8,
            padding: 12,
            fontSize: 18,
            marginBottom: 24,
            backgroundColor: '#fff',
            minHeight: 80,
            textAlignVertical: 'top',
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
  );
};

export default DescriptionScreen;
