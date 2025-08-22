import AppNavigator from 'navigation/AppNavigator';
import { Provider as PlanProvider } from './context/PlanContext';
import './global.css';
import { SafeAreaView } from 'react-native';

export default function App() {
  return (
    <PlanProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <AppNavigator />
      </SafeAreaView>
    </PlanProvider>
  );
}
