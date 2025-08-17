import React, { useState } from 'react';
import { Text, TouchableOpacity, View, ScrollView, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BarChart } from 'react-native-chart-kit';

const studyPlans = [
  {
    id: '1',
    title: 'Math Study Plan',
    description: 'A comprehensive plan to master math concepts.',
    streak: 5,
  },
  {
    id: '2',
    title: 'Science Study Plan',
    description: 'Focused study on biology and chemistry.',
    streak: 2,
  },
  {
    id: '3',
    title: 'History Study Plan',
    description: 'In-depth study of world history.',
    streak: 3,
  },
];

// Example data for the bar chart
const studyData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [2, 1.5, 3, 2.5, 1, 0, 2], // hours studied each day
    },
  ],
};

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const HomeScreen = () => {
  const [checked, setChecked] = useState<{ [id: string]: boolean }>({});

  const toggleCheck = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  return (
    <>
      <View className="flex-1 bg-white p-4" style={{ height: screenHeight }}>
        {/* Todays Study Plans */}
        <View
          className="mb-4 flex items-center rounded-lg bg-white p-6 py-2 shadow-sm"
          style={{ height: screenHeight * 0.25 }}>
          <Text className="mb-4 text-xl font-bold">Today Study Plans</Text>
          <ScrollView className="max-h-96 w-full">
            <View className="flex gap-2">
              {studyPlans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  activeOpacity={0.7}
                  onPress={() => toggleCheck(plan.id)}>
                  <View
                    className="p-2"
                    style={{
                      borderRadius: 8,
                      borderWidth: 2,
                      borderColor: checked[plan.id] ? '#3b82f6' : '#e5e7eb',
                      backgroundColor: '#fff',
                    }}>
                    <Text
                      className={`text-lg font-semibold ${checked[plan.id] ? 'text-gray-400 line-through' : ''}`}
                      style={{ textDecorationLine: checked[plan.id] ? 'line-through' : 'none' }}>
                      {plan.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Time studied today (Bar Chart) */}
        <View
          className="mb-4 flex w-full items-center rounded-lg bg-white p-6 py-2 shadow-sm"
          style={{ height: screenHeight * 0.3 }}>
          <Text className="mb-4 text-xl font-bold">Time Studied This Week</Text>
          <BarChart
            data={studyData}
            width={screenWidth - 48}
            height={screenHeight * 0.3 - 70}
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
              propsForDots: { r: '6', strokeWidth: '2', stroke: '#2563eb' },
            }}
            style={{
              borderRadius: 16,
            }}
            fromZero
            showValuesOnTopOfBars
          />
        </View>

        {/* Current streak */}
        <View
          className="mb-2 flex w-full items-center rounded-lg bg-white p-6 py-2 shadow-sm"
          style={{ height: screenHeight * 0.18 }}>
          <Text className="mb-4 text-xl font-bold">Current Streak</Text>
          <ScrollView className="w-full">
            {studyPlans.map((plan) => (
              <View key={plan.id} className="mb-2 flex-row items-center justify-between">
                <Text className="text-lg font-semibold">{plan.title}</Text>
                <Text className="text-base font-semibold text-orange-500">
                  🔥 {plan.streak} day{plan.streak !== 1 ? 's' : ''}
                </Text>
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
