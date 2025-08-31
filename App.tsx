import AppNavigator from 'navigation/AppNavigator';
import { RealmProvider } from '@realm/react';
import { SafeAreaView } from 'react-native';
import { realmSchemas } from './schema';
import { Provider as PlanProvider } from './context/PlanContext';
import { Provider as StudyNowProvider } from './context/StudyNowContext';
import './global.css';
import { DayProvider } from 'context/DayContext';
import { NotificationsProvider } from 'hooks/useNotifications';

export default function App() {
  return (
    <RealmProvider
      schema={realmSchemas}
      schemaVersion={2}
      migration={(oldRealm: any, newRealm: any) => {
        if (oldRealm.schemaVersion < 2) {
          const oldObjects = oldRealm.objects('Plan');
          const newObjects = newRealm.objects('Plan');
          for (let i = 0; i < oldObjects.length; i++) {
            if (newObjects[i].lastStreakUpdate === undefined) {
              newObjects[i].lastStreakUpdate = '';
            }
            if (newObjects[i].isEnd === undefined) {
              newObjects[i].isEnd = false;
            }
          }
        }
      }}>
      <DayProvider>
        <PlanProvider>
          <StudyNowProvider>
            <NotificationsProvider>
              <SafeAreaView style={{ flex: 1 }}>
                <AppNavigator />
              </SafeAreaView>
            </NotificationsProvider>
          </StudyNowProvider>
        </PlanProvider>
      </DayProvider>
    </RealmProvider>
  );
}
