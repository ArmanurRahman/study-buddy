import { useCallback, useState, useEffect } from 'react';
import { Text, TouchableOpacity, View, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTodayPlan } from 'hooks/useTodayPlan';
import type { StackNavigationProp } from '@react-navigation/stack';
import Streak from '../components/Streak';
import { getWeeklyStudyData } from '../utils/db';
import { WEEK_DAYS } from '../utils/enum';
import { durationToString, formatDuration } from '../utils/time';
import { TodaysPlan } from 'types';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

type RootStackParamList = {
  Home: undefined;
  StudyNow: { task: TodaysPlan };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const today = new Date();
  const { todayPlans, setRefreshKey: setPlanRefreshKey } = useTodayPlan(today);
  const [studyData, setStudyData] = useState({
    labels: WEEK_DAYS,
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
  });

  useEffect(() => {
    (async () => {
      const data = await getWeeklyStudyData();
      setStudyData((prev) => ({
        ...prev,
        datasets: [{ data }],
      }));
    })();
  }, [refreshKey]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setPlanRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <>
      <View className="flex-1 bg-white p-4" style={{ height: screenHeight }}>
        {/* Todays Study Plans */}
        <View
          className="mb-4 flex items-center rounded-lg bg-white p-6 py-2 shadow-lg"
          style={{ height: screenHeight * 0.25 }}>
          <Text className="mb-4 text-xl font-bold">Today Study Plans</Text>
          <ScrollView
            className="max-h-96 w-full"
            style={{ flex: 1, backgroundColor: 'white' }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            <View className="flex gap-2">
              {todayPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('StudyNow', { task: plan })}>
                  <View
                    className="p-2"
                    style={{
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: plan.status === 'completed' ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: '#fff',
                    }}>
                    <Text
                      className={`text-lg font-semibold ${plan.status === 'completed' ? 'text-gray-400 line-through' : ''}`}
                      style={{
                        textDecorationLine: plan.status === 'completed' ? 'line-through' : 'none',
                      }}>
                      {plan.title}
                    </Text>
                    <Text className="text-gray-600">
                      {formatDuration(durationToString(plan.duration))}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Time studied today (Bar Chart) */}
        <View
          className="mb-4 flex w-full items-center rounded-lg bg-white p-6 py-2 shadow-lg"
          style={{ height: screenHeight * 0.3 }}>
          <Text className="mb-4 text-xl font-bold">Time Studied This Week</Text>
          <BarChart
            data={studyData}
            width={screenWidth - 46}
            height={screenHeight * 0.3 - 70}
            yAxisSuffix="Min"
            yAxisLabel=""
            yLabelsOffset={0}
            segments={
              Math.max(...(studyData.datasets[0]?.data || [0])) <= 0
                ? 1
                : Math.min(
                    4,
                    Math.max(2, Math.ceil(Math.max(...(studyData.datasets[0]?.data || [0])) / 2))
                  )
            }
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: '#2563eb' },
            }}
            style={{
              // borderRadius: 16,
              marginRight: 16,
            }}
            fromZero
            showValuesOnTopOfBars
          />
        </View>

        {/* Current streak */}
        <View
          className="mb-2 flex w-full items-center rounded-lg bg-white p-6 py-2 shadow-lg"
          style={{ height: screenHeight * 0.18 }}>
          <Text className="mb-4 text-xl font-bold">Current Streak</Text>
          <ScrollView
            className="w-full"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
            {todayPlans.map((plan) => (
              <View key={plan.id} className="mb-2 flex-row items-center justify-between">
                <Text className="text-lg font-semibold">{plan.title}</Text>
                <Streak streak={plan.streak || 0} />
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* <StatusBar style="auto" /> */}
    </>
  );
};

export default HomeScreen;
