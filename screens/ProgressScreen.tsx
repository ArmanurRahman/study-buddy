import { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useQuery } from '@realm/react';

import StudyCalendar from 'components/studyHoursByDate';
import { timeStringToHours } from '../utils/time';
import { PIE_COLORS } from '../utils/enum';

const screenWidth = Dimensions.get('window').width;

const progressData = {
  labels: ['Math', 'Science', 'History'],
  data: [0.8, 0.6, 0.4], // percent complete
};

const ProgressScreen = () => {
  const planStatusResults = useQuery('PlanStatus');
  const planResults = useQuery('Plan');

  // Compute bar and pie data using useMemo for performance
  const { barData, pieData } = useMemo(() => {
    // Get all completed PlanStatus
    const statuses = planStatusResults.filtered('status == "completed"');
    // Map: { category: totalHours }
    const categoryTotals: Record<string, number> = {};
    statuses.forEach((status: any) => {
      const plan = planResults.find((p: any) =>
        p._id?.toHexString
          ? p._id.toHexString() === status.planId.toHexString?.()
          : String(p._id) === String(status.planId)
      );
      if (plan && plan.category) {
        // Use passedTime if available, else fallback to duration
        let hours = 0;
        if (typeof status.passedTime === 'number') {
          hours = status.passedTime;
        } else if (plan.duration) {
          hours = timeStringToHours(plan.duration as string);
        }
        categoryTotals[plan.category as string] =
          (categoryTotals[plan.category as string] || 0) + hours;
      }
    });
    const labels = Object.keys(categoryTotals);
    const data = labels.map((cat) => categoryTotals[cat]);
    const barData = {
      labels,
      datasets: [{ data }],
    };
    // Generate pieData from categoryTotals
    const pieDataArr = labels.map((cat, idx) => ({
      name: cat,
      population: categoryTotals[cat],
      color: PIE_COLORS[idx % PIE_COLORS.length],
      legendFontColor: '#222',
      legendFontSize: 14,
    }));
    return { barData, pieData: pieDataArr };
  }, [planStatusResults, planResults]);

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
        height={180}
        chartConfig={{
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
        style={{ marginBottom: 24 }}
      />

      <Text className="mb-2 text-lg font-semibold">Completion Progress</Text>
      <ProgressChart
        data={progressData}
        width={screenWidth - 32}
        height={180}
        strokeWidth={16}
        radius={32}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
        }}
        hideLegend={false}
      />
      <StudyCalendar />
    </ScrollView>
  );
};

export default ProgressScreen;
