import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { BarChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import Realm from 'realm';

import StudyCalendar from 'components/studyHoursByDate';
import { timeStringToHours } from '../utils/time';
import { PIE_COLORS } from '../utils/enum';
import { realmSchemas } from 'schema';

const screenWidth = Dimensions.get('window').width;

// const progressData = {
//   labels: ['Math', 'Science', 'History'],
//   data: [0.8, 0.6, 0.4], // percent complete
// };

const ProgressScreen = () => {
  const [barData, setBarData] = useState<{ labels: string[]; datasets: { data: number[] }[] }>({
    labels: [],
    datasets: [{ data: [] }],
  });
  const [pieData, setPieData] = useState<any[]>([]);
  // const [progressData, setProgressData] = useState<{ labels: string[]; data: number[] }>({
  //   labels: [],
  //   data: [],
  // });

  useEffect(() => {
    (async () => {
      const realm = await Realm.open({ schema: realmSchemas });
      // Get all completed TaskStatus
      const statuses = realm.objects('TaskStatus').filtered('status == "completed"');
      console.log('Fetched TaskStatus:', statuses);
      // Map: { category: totalHours }
      const categoryTotals: Record<string, number> = {};
      statuses.forEach((status: any) => {
        const task = realm.objectForPrimaryKey('Task', status.taskId);
        if (task && task.category) {
          // Use passedTime if available, else fallback to duration
          let hours = 0;
          if (typeof status.passedTime === 'number') {
            hours = status.passedTime;
          } else if (task.duration) {
            hours = timeStringToHours(task.duration as string);
          }
          categoryTotals[task.category as string] =
            (categoryTotals[task.category as string] || 0) + hours;
        }
      });
      const labels = Object.keys(categoryTotals);
      const data = labels.map((cat) => categoryTotals[cat]);
      setBarData({
        labels,
        datasets: [{ data }],
      });
      // Generate pieData from categoryTotals
      const pieDataArr = labels.map((cat, idx) => ({
        name: cat,
        population: categoryTotals[cat],
        color: PIE_COLORS[idx % PIE_COLORS.length],
        legendFontColor: '#222',
        legendFontSize: 14,
      }));
      setPieData(pieDataArr);
      // Progress data (percent complete per category)
      // Since categoryTotals[cat] is just the total hours studied, we can't compute percent complete without knowing the target/total hours.
      // For now, we'll just show the proportion of hours studied per category relative to the max studied category.
      // const maxHours = Math.max(...data, 1); // avoid division by zero
      // const progressArr = labels.map((cat) => categoryTotals[cat] / maxHours);
      // setProgressData({
      //   labels,
      //   data: progressArr,
      // });
      realm.close();
    })();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text className="mb-4 text-2xl font-bold">Progress Overview</Text>

      <Text className="mb-2 text-lg font-semibold">Hours Studied (Bar Chart)</Text>
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

      <Text className="mb-2 text-lg font-semibold">Study Distribution (Pie Chart)</Text>
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
      {/* <ProgressChart
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
      /> */}
      <StudyCalendar />
    </ScrollView>
  );
};

export default ProgressScreen;
