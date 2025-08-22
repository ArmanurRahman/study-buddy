import { useContext } from 'react';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Context as PlanContext } from 'context/PlanContext';

type RootStackParamList = {
  AllPlans: undefined;
  PlanTitle?: { edit?: boolean };
  PlanDescription?: { edit?: boolean };
};
type TasksScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PlanTitle'>;
  route: RouteProp<RootStackParamList, 'PlanTitle'>;
};

const TitleScreen = ({ navigation, route }: TasksScreenProps) => {
  const {
    state: { title },
    changeTitle,
  } = useContext(PlanContext) as { state: { title: string }; changeTitle: (title: string) => void };

  const handleNext = () => {
    if (title.trim().length === 0) {
      return;
    }
    // Pass the title to the next screen or handle as needed
    navigation.navigate('PlanDescription', {
      ...route.params,
      edit: route.params?.edit ?? false,
    });
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
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'left' }}>
          Give a Title
        </Text>
        <TextInput
          placeholder="Enter your study plan title"
          value={title}
          onChangeText={changeTitle}
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
            backgroundColor: title.trim().length > 0 ? '#2563eb' : '#a5b4fc',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
          }}
          disabled={title.trim().length === 0}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Next</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TitleScreen;
