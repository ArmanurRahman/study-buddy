import { useMemo, useRef, useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, Animated } from 'react-native';
import { BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useQuery } from '@realm/react';

import StudyCalendar from 'components/studyHoursByDate';
import { timeStringToHours } from '../utils/time';
import { PIE_COLORS } from '../utils/enum';

const screenWidth = Dimensions.get('window').width;

const ProgressScreen = () => {
  const planStatusResults = useQuery('PlanStatus');
  const planResults = useQuery('Plan');

  // Compute bar, pie, and progress data using useMemo for performance
  const { barData, pieData, progressData } = useMemo(() => {
    const statuses = planStatusResults.filtered('status == "completed"');
    const categoryTotals: Record<string, { completed: number; total: number; totalPlans: number }> =
      {};

    planResults.forEach((plan: any) => {
      if (plan.category) {
        if (!categoryTotals[plan.category]) {
          categoryTotals[plan.category] = { completed: 0, total: 0, totalPlans: 0 };
        }
        categoryTotals[plan.category].totalPlans += 1;
        if (plan.duration) {
          categoryTotals[plan.category].total += timeStringToHours(plan.duration as string);
        }
      }
    });

    statuses.forEach((status: any) => {
      const plan = planResults.find((p: any) =>
        p._id?.toHexString
          ? p._id.toHexString() === status.planId.toHexString?.()
          : String(p._id) === String(status.planId)
      );
      if (plan && plan.category) {
        let hours = 0;
        if (typeof status.passedTime === 'number') {
          hours = status.passedTime;
        } else if (plan.duration) {
          hours = timeStringToHours(plan.duration as string);
        }
        categoryTotals[plan.category].completed += hours;
      }
    });

    const labels = Object.keys(categoryTotals);
    const barData = {
      labels,
      datasets: [
        {
          data: labels.map((cat) => categoryTotals[cat].completed),
        },
      ],
    };

    const pieDataArr = labels.map((cat, idx) => ({
      name: cat,
      population: categoryTotals[cat].completed,
      color: PIE_COLORS[idx % PIE_COLORS.length],
      legendFontColor: '#222',
      legendFontSize: 14,
    }));

    const progressData = {
      labels,
      data: labels.map((cat) =>
        categoryTotals[cat].total > 0
          ? Math.min(categoryTotals[cat].completed / categoryTotals[cat].total, 1)
          : 0
      ),
    };

    return { barData, pieData: pieDataArr, progressData };
  }, [planStatusResults, planResults]);

  // --- Animation for ProgressChart ---
  const [animatedProgress, setAnimatedProgress] = useState(progressData.data.map(() => 0));
  const animatedValues = useRef(progressData.data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    animatedValues.forEach((anim, idx) => {
      Animated.timing(anim, {
        toValue: progressData.data[idx],
        duration: 1200,
        useNativeDriver: false,
      }).start();
    });
    // Listen to value changes and update state for ProgressChart
    const listeners = animatedValues.map((anim, idx) =>
      anim.addListener(({ value }) => {
        setAnimatedProgress((prev) => {
          const next = [...prev];
          next[idx] = value;
          return next;
        });
      })
    );
    // Cleanup listeners on unmount
    return () => {
      listeners.forEach((listener, idx) => animatedValues[idx].removeListener(listener));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressData.data.join(',')]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold">Progress Overview</Text>

      <Text className="mb-2 text-lg font-semibold">Hours Studied</Text>
      <BarChart
        data={barData}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix="h"
        yAxisLabel=""
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
          style: { borderRadius: 16 },
        }}
        style={{ borderRadius: 16, marginBottom: 24 }}
        fromZero
        showValuesOnTopOfBars
      />

      <Text className="mb-2 text-lg font-semibold">Study Distribution</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 32}
        height={200}
        chartConfig={{
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="#fff"
        paddingLeft="15"
        absolute
        style={{ borderRadius: 16 }}
      />

      <Text className="mb-2 text-lg font-semibold">Completion Progress</Text>
      <ProgressChart
        data={{
          labels: progressData.labels,
          data: animatedProgress,
        }}
        width={screenWidth - 32}
        height={200}
        strokeWidth={16}
        radius={32}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
        }}
        hideLegend={false}
        absolute
      />
      <StudyCalendar />
    </ScrollView>
  );
};

export default ProgressScreen;
