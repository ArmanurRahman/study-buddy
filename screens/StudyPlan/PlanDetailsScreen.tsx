import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';

import { Context as PlanContext } from 'context/PlanContext';
import { durationToString, formatDuration, humanReadableDate } from 'utils/time';
import { frequencyToSentence } from 'utils/frequency';

type RootStackParamList = {
  AllPlans: undefined;
  PlanDetails: undefined;
};

type PlanDetailsProps = {
  navigation: StackNavigationProp<RootStackParamList, 'PlanDetails'>;
};

const PlanDetails: React.FC<PlanDetailsProps> = ({ navigation }) => {
  const {
    state: { title, description, category, startDate, endDate, totalHours, frequency, duration },
  } = useContext(PlanContext) as {
    state: {
      title: string;
      description?: string;
      category?: string;
      startDate?: string;
      endDate?: string;
      duration?: { hours: string; minutes: string };
      totalHours?: number;
      frequency?: boolean[];
    };
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.detailBox}>
        <Text style={styles.label}>Title:</Text>
        <Text style={styles.value}>{title}</Text>
      </View>
      {description ? (
        <View style={styles.detailBox}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{description}</Text>
        </View>
      ) : null}
      {category ? (
        <View style={styles.detailBox}>
          <Text style={styles.label}>Category:</Text>
          <Text style={styles.value}>{category}</Text>
        </View>
      ) : null}
      {startDate ? (
        <View style={styles.detailBox}>
          <Text style={styles.label}>Start Date:</Text>
          <Text style={styles.value}>{humanReadableDate(startDate)}</Text>
        </View>
      ) : null}
      {endDate ? (
        <View style={styles.detailBox}>
          <Text style={styles.label}>End Date:</Text>
          <Text style={styles.value}>{humanReadableDate(endDate)}</Text>
        </View>
      ) : null}
      {totalHours ? (
        <View style={styles.detailBox}>
          <Text style={styles.label}>Total Study Hours:</Text>
          <Text style={styles.value}>{totalHours}</Text>
        </View>
      ) : null}
      {duration ? (
        <View style={styles.detailBox}>
          <Text style={styles.label}>Duration:</Text>
          <Text style={styles.value}>{formatDuration(durationToString(duration))}</Text>
        </View>
      ) : null}
      {frequency && frequency.length > 0 ? (
        <View style={styles.detailBox}>
          <Text style={styles.label}>Frequency:</Text>
          <Text style={styles.value}>{frequencyToSentence(frequency)}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailBox: {
    marginBottom: 18,
  },
  label: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '500',
  },
});

export default PlanDetails;
