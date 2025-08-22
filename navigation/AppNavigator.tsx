import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TodayPlanScreen from '../screens/TodayPlanScreen';
import AllPlansScreen from '../screens/AllPlansScreen';
import ProgressScreen from '../screens/ProgressScreen';
import StudyNowScreen from '../screens/StudyNowScreen';
import TitleScreen from 'screens/StudyPlan/TitleScreen';
import DescriptionScreen from 'screens/StudyPlan/DescriptionScreen';
import CategoryScreen from 'screens/StudyPlan/CategoryScreen';
import StartDateScreen from 'screens/StudyPlan/StartDateScreen';
import EndDateScreen from 'screens/StudyPlan/EndDateScreen';
import FrequencyScreen from 'screens/StudyPlan/FrequencyScreen';
import PlanDetails from 'screens/StudyPlan/PlanDetailsScreen';
import StudyCompleteScreen from 'screens/StudyCompleteScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const STUDY_PLAN_TITLE = 'Create Study Plan';
const UPDATE_STUDY_PLAN_TITLE = 'Update Study Plan';

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{ title: 'Home', headerLeft: () => null, gestureEnabled: false }}
    />
    <Stack.Screen name="StudyNow" component={StudyNowScreen} options={{ title: 'Study Now' }} />
  </Stack.Navigator>
);
const TodayStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="TodayMain"
      component={TodayPlanScreen}
      options={{ title: 'Today', headerLeft: () => null, gestureEnabled: false }}
    />
    <Stack.Screen name="StudyNow" component={StudyNowScreen} options={{ title: 'Study Now' }} />
    <Stack.Screen
      name="StudyComplete"
      component={StudyCompleteScreen}
      options={{ title: 'Study Complete' }}
    />
  </Stack.Navigator>
);

const CreatePlanStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AllPlans"
      component={AllPlansScreen}
      options={{ title: 'All Plans', headerLeft: () => null, gestureEnabled: false }}
    />
    <Stack.Screen
      name="PlanTitle"
      component={TitleScreen}
      options={({ route }: { route: { params?: { edit?: boolean } } }) => ({
        title: route.params?.edit ? UPDATE_STUDY_PLAN_TITLE : STUDY_PLAN_TITLE,
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen
      name="PlanDescription"
      component={DescriptionScreen}
      options={({ route }: { route: { params?: { edit?: boolean } } }) => ({
        title: route.params?.edit ? UPDATE_STUDY_PLAN_TITLE : STUDY_PLAN_TITLE,
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen
      name="PlanCategory"
      component={CategoryScreen}
      options={({ route }: { route: { params?: { edit?: boolean } } }) => ({
        title: route.params?.edit ? UPDATE_STUDY_PLAN_TITLE : STUDY_PLAN_TITLE,
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen
      name="PlanStartDate"
      component={StartDateScreen}
      options={({ route }: { route: { params?: { edit?: boolean } } }) => ({
        title: route.params?.edit ? UPDATE_STUDY_PLAN_TITLE : STUDY_PLAN_TITLE,
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen
      name="PlanEndDate"
      component={EndDateScreen}
      options={({ route }: { route: { params?: { edit?: boolean } } }) => ({
        title: route.params?.edit ? UPDATE_STUDY_PLAN_TITLE : STUDY_PLAN_TITLE,
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen
      name="PlanFrequency"
      component={FrequencyScreen}
      options={({ route }: { route: { params?: { edit?: boolean } } }) => ({
        title: route.params?.edit ? UPDATE_STUDY_PLAN_TITLE : STUDY_PLAN_TITLE,
        headerBackTitle: 'Back',
      })}
    />
    <Stack.Screen
      name="PlanDetails"
      component={PlanDetails}
      options={({ navigation, route }) => ({
        title: 'Study Plan Details',
        headerBackTitle: 'Back',
        headerLeft: () => null,
        headerRight: () => (
          <Ionicons
            name="create-outline"
            size={24}
            color="#2563eb"
            style={{ marginRight: 16 }}
            onPress={() => {
              navigation.navigate('PlanTitle', { ...route.params, edit: true });
            }}
          />
        ),
      })}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Home') {
              iconName = 'home-outline';
            } else if (route.name === 'Today') {
              iconName = 'calendar-outline';
            } else if (route.name === 'Tasks') {
              iconName = 'list-outline';
            } else if (route.name === 'Progress') {
              iconName = 'bar-chart-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: 'gray',
          tabBarHideOnKeyboard: true,
        })}>
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ headerShown: false }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Home', { screen: 'HomeMain' });
            },
          })}
        />
        <Tab.Screen
          name="Today"
          component={TodayStack}
          options={{ headerShown: false }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('Today', { screen: 'TodayMain' });
            },
          })}
        />
        <Tab.Screen name="Tasks" component={CreatePlanStack} options={{ headerShown: false }} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
