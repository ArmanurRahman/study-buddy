import { useState, useRef, useEffect } from 'react';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions, PanResponder, Text, View, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WEEK_DAYS } from 'utils/enum';
import { useWeeklyStudyData } from 'hooks/useWeeklyStudyData';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const WeeklyStudyBar = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const data = useWeeklyStudyData(weekOffset);

  // Animation value for horizontal slide
  const slideAnim = useRef(new Animated.Value(0)).current;
  const directionRef = useRef<'left' | 'right'>('left');

  // Animate the transition
  const animateSlide = (dir: 'left' | 'right', cb: () => void) => {
    directionRef.current = dir;
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: dir === 'left' ? -screenWidth : screenWidth,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: dir === 'left' ? screenWidth : -screenWidth,
        duration: 0,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(cb, 180); // Change weekOffset at the midpoint of the animation
  };
  const weekOffsetRef = useRef(weekOffset);
  useEffect(() => {
    weekOffsetRef.current = weekOffset;
  }, [weekOffset]);
  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 20,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -30) {
          // Swiped left: show previous week
          animateSlide('left', () => setWeekOffset((prev) => prev - 1));
        } else if (gestureState.dx > 30) {
          // Swiped right: show next week (but not beyond current week)
          if (weekOffsetRef.current < 0) {
            animateSlide('right', () => setWeekOffset((prev) => Math.min(prev + 1, 0)));
          }
          // else: do nothing, no animation for future week
        }
      },
    })
  ).current;

  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name="bar-chart-outline" size={22} color="#2563eb" style={{ marginRight: 8 }} />
        <Text style={styles.sectionTitle}>
          {weekOffset === 0
            ? 'Time Studied This Week'
            : `Time Studied (${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago)`}
        </Text>
      </View>
      <Animated.View
        style={{ overflow: 'hidden', transform: [{ translateX: slideAnim }] }}
        {...panResponder.panHandlers}>
        <BarChart
          data={{
            labels: WEEK_DAYS,
            datasets: [{ data }],
          }}
          width={screenWidth - 46}
          height={screenHeight * 0.25}
          yAxisSuffix="m"
          yAxisLabel=""
          yLabelsOffset={0}
          segments={
            Math.max(...data) <= 0 ? 1 : Math.min(4, Math.max(2, Math.ceil(Math.max(...data) / 2)))
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
      </Animated.View>
      <Text style={{ textAlign: 'center', color: '#64748b', marginTop: 8, fontSize: 13 }}>
        Swipe left/right to see previous/next week
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default WeeklyStudyBar;
