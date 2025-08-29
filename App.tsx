import AppNavigator from 'navigation/AppNavigator';
import { RealmProvider } from '@realm/react';
import { Alert, SafeAreaView } from 'react-native';
import * as Notifications from 'expo-notifications';
import { realmSchemas } from './schema';
import { Provider as PlanProvider } from './context/PlanContext';
import { Provider as StudyNowProvider } from './context/StudyNowContext';
import './global.css';
import { DayProvider } from 'context/DayContext';
import { useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function App() {
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Study Planner needs notification permission to remind you about your study sessions.',
          [{ text: 'OK' }]
        );
      }
    })();
  }, []);

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
            <SafeAreaView style={{ flex: 1 }}>
              <AppNavigator />
            </SafeAreaView>
          </StudyNowProvider>
        </PlanProvider>
      </DayProvider>
    </RealmProvider>
  );
}
