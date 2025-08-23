import AppNavigator from 'navigation/AppNavigator';
import { Provider as PlanProvider } from './context/PlanContext';
import { Provider as PlanCollectionProvider } from './context/planCollectionContext';
import './global.css';
import { SafeAreaView } from 'react-native';

export default function App() {
  return (
    <PlanCollectionProvider>
      <PlanProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <AppNavigator />
        </SafeAreaView>
      </PlanProvider>
    </PlanCollectionProvider>
  );
}
