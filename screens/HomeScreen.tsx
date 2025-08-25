import {
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Image,
  StyleSheet,
  Animated,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTodayPlan } from 'hooks/useTodayPlan';
import type { StackNavigationProp } from '@react-navigation/stack';
import Streak from '../components/Streak';
import { WEEK_DAYS } from '../utils/enum';
import { durationToString, formatDuration } from '../utils/time';
import { TodaysPlan } from 'types';
import { useWeeklyStudyData } from 'hooks/useWeeklyStudyData';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

type RootStackParamList = {
  Home: undefined;
  StudyNow: { plan: TodaysPlan };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = ({ navigation }: { navigation: HomeScreenNavigationProp }) => {
  const { todaysPlans } = useTodayPlan(new Date());
  const data = useWeeklyStudyData();
  const studyData = {
    labels: WEEK_DAYS,
    datasets: [{ data }],
  };

  // Animated value for scroll
  const scrollY = useRef(new Animated.Value(0)).current;

  // Interpolate header translateY
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -130],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f3f4f6' }}>
      {/* Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }],
            zIndex: 10,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          },
        ]}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.greeting}>👋 Welcome back!</Text>
            <Text style={styles.subtitle}>Ready to achieve your study goals today?</Text>
          </View>
          <View style={styles.headerImageWrapper}>
            <Image
              source={require('../assets/images/study_illustration.png')}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{ paddingBottom: 16, paddingTop: 160 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
        showsVerticalScrollIndicator={false}>
        {/* Today's Study Plans */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={22} color="#2563eb" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>{"Today's Study Plans"}</Text>
          </View>
          {todaysPlans.length === 0 ? (
            <Text style={styles.emptyText}>No plans for today. Add a new plan to get started!</Text>
          ) : (
            <View style={{ gap: 10 }}>
              {todaysPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate('StudyNow', { plan })}>
                  <View
                    style={[
                      styles.planCard,
                      plan.status === 'completed' && {
                        backgroundColor: '#e0e7ef',
                        borderColor: '#3b82f6',
                      },
                    ]}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Ionicons
                        name={
                          plan.status === 'completed'
                            ? 'checkmark-circle'
                            : plan.status === 'running'
                              ? 'play-circle'
                              : 'ellipse-outline'
                        }
                        size={20}
                        color={
                          plan.status === 'completed'
                            ? '#10b981'
                            : plan.status === 'running'
                              ? '#2563eb'
                              : '#94a3b8'
                        }
                      />
                      <Text
                        style={[
                          styles.planTitle,
                          plan.status === 'completed' && styles.completedText,
                        ]}
                        numberOfLines={1}>
                        {plan.title}
                      </Text>
                      <Text style={styles.planDuration}>
                        {formatDuration(durationToString(plan.duration))}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Time studied this week (Bar Chart) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="bar-chart-outline"
              size={22}
              color="#2563eb"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.sectionTitle}>Time Studied This Week</Text>
          </View>
          <View style={{ overflow: 'hidden' }}>
            <BarChart
              data={studyData}
              width={screenWidth - 46}
              height={screenHeight * 0.25}
              yAxisSuffix="m"
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
                propsForDots: { r: '6', strokeWidth: '2', stroke: '#2563eb' },
              }}
              style={{
                marginRight: -50,
                marginTop: 8,
                transform: [{ translateX: -30 }],
              }}
              fromZero
              showValuesOnTopOfBars
            />
          </View>
        </View>

        {/* Current streak */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flame-outline" size={22} color="#2563eb" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Current Streak</Text>
          </View>
          {todaysPlans.length === 0 ? (
            <Text style={styles.emptyText}>
              No streaks yet. Start studying to build your streak!
            </Text>
          ) : (
            <View>
              {todaysPlans.map((plan) => (
                <View key={plan.id} style={styles.streakRow}>
                  <Text style={styles.streakPlanTitle}>{plan.title}</Text>
                  <Streak streak={plan.streak || 0} />
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    justifyContent: 'space-between',
  },
  greeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#e0e7ef',
    fontSize: 15,
    fontWeight: '500',
  },
  headerImage: {
    width: 80,
    height: 80,
  },
  headerImageWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 50,
    backgroundColor: '#2563eb',
    marginLeft: 10,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
  planCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 2,
    width: '100%',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  completedText: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  planDuration: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
    // marginLeft: 8,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  streakPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
});

export default HomeScreen;
