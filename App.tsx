import AppNavigator from 'navigation/AppNavigator';
import { RealmProvider } from '@realm/react';
import { SafeAreaView } from 'react-native';

import { realmSchemas } from './schema';
import { Provider as PlanProvider } from './context/PlanContext';
import './global.css';

export default function App() {
  return (
    <RealmProvider schema={realmSchemas}>
      <PlanProvider>
        <SafeAreaView style={{ flex: 1 }}>
          <AppNavigator />
        </SafeAreaView>
      </PlanProvider>
    </RealmProvider>
  );
}
