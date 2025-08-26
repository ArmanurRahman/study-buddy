import { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useQuery } from '@realm/react';

import StudyCalendar from 'components/studyHoursByDate';
import { timeStringToHours } from '../utils/time';
import { PIE_COLORS } from '../utils/enum';

const screenWidth = Dimensions.get('window').width;

const ProgressScreen = () => {
  const planStatusResults = useQuery('PlanStatus');
  const planResults = useQuery('Plan');

  // Compute bar and pie data using useMemo for performance
  const { barData, pieData } = useMemo(() => {
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
        let minutes = 0;
        if (typeof status.passedTime === 'number') {
          minutes = status.passedTime;
        } else if (plan.duration) {
          minutes = timeStringToHours(plan.duration as string);
        }
        categoryTotals[plan.category].completed += minutes / 60;
      }
    });

    const labels = Object.keys(categoryTotals);
    const barData = {
      labels,
      datasets: [
        {
          data: labels.map((cat) => Number(categoryTotals[cat].completed.toFixed(2))),
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

  return (
    <ScrollView
      contentContainerStyle={{ padding: 0, backgroundColor: '#f3f4f6' }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>📈 Progress Overview</Text>
        <Text style={styles.headerSubtitle}>
          Track your study journey and celebrate your achievements!
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Hours Studied</Text>
        <BarChart
          data={barData}
          width={screenWidth - 46}
          height={200}
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
          style={{
            borderRadius: 16,
            marginLeft: -18,
            marginBottom: 8,
            marginTop: 8,
          }}
          fromZero
          showValuesOnTopOfBars
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Completed Study Distribution</Text>
        <View style={{ overflow: 'hidden' }}>
          <PieChart
            data={pieData.map((item) => ({
              ...item,
              name: `${item.name} (${item.population > 0 ? Math.round((item.population / pieData.reduce((sum, d) => sum + d.population, 0)) * 100) : 0}%)`,
            }))}
            width={screenWidth - 46}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="#fff"
            paddingLeft="10"
            absolute
            style={{
              borderRadius: 16,
              marginTop: 8,
              marginBottom: 8,
              transform: [{ translateX: (screenWidth - 46) / 2 - 120 }],
            }}
            hasLegend={false}
          />
          {/* Custom legend at the bottom */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 12,
            }}>
            {pieData.map((item, idx) => {
              const total = pieData.reduce((sum, d) => sum + d.population, 0);
              const percent = total > 0 ? Math.round((item.population / total) * 100) : 0;
              return (
                <View
                  key={item.name}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 8,
                    marginBottom: 6,
                  }}>
                  <View
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: item.color,
                      marginRight: 6,
                    }}
                  />
                  <Text style={{ color: '#222', fontSize: 14 }}>
                    {item.name} ({percent}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Study Calendar</Text>
        <View style={{ marginTop: 8 }}>
          <StudyCalendar />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: '#2563eb',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 44,
    paddingBottom: 28,
    paddingHorizontal: 28,
    marginBottom: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#dbeafe',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
});

export default ProgressScreen;
