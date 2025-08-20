import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import TodayTask from '../screens/TodayTaskScreen';
import TasksScreen from '../screens/TasksScreen';
import ProgressScreen from '../screens/ProgressScreen';
import StudyNowScreen from '../screens/StudyNowScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
        <Tab.Screen name="Today" component={TodayTask} />
        <Tab.Screen name="Tasks" component={TasksScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
