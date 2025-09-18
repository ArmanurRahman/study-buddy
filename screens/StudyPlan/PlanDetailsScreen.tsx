import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from 'node_modules/@react-navigation/stack/lib/typescript/src/types';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { durationToString, formatDuration, humanReadableDate } from 'utils/time';
import { usePlanById } from 'hooks/usePlanById';
import { usePlanStatusById } from 'hooks/usePlanStatusById';
import { usePlanEndById } from 'hooks/usePlanEndById';
import { TodaysPlan } from 'types';

type RootStackParamList = {
  Home: undefined;
  StudyNow: { plan: TodaysPlan };
};

type StudyDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'StudyNow'>;

const PlanDetailsScreen = () => {
  const navigation = useNavigation<StudyDetailsScreenNavigationProp>();

  const route = useRoute();
  const { planId } = route.params as { planId: string };
  const plan = usePlanById(planId);

  const planStatus = usePlanStatusById(planId);
  const { endPlan } = usePlanEndById(planId);

  // Prepare marked dates for the calendar
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};
    planStatus.forEach((status: any) => {
      if (status.status === 'completed') {
        const dateStr = new Date(status.date).toISOString().split('T')[0];
        marks[dateStr] = {
          marked: true,
          dotColor: '#2563eb',
          customStyles: {
            container: { backgroundColor: '#dbeafe' },
            text: { color: '#2563eb', fontWeight: 'bold' },
          },
        };
      }
    });
    return marks;
  }, [planStatus]);

  // Calculate total minutes studied per day
  const studyMinutesByDate = useMemo(() => {
    const map: Record<string, number> = {};
    planStatus.forEach((status: any) => {
      if (status.status === 'completed') {
        const dateStr = new Date(status.date).toISOString().split('T')[0];
        map[dateStr] = (map[dateStr] || 0) + (status.passedTime || 0);
      }
    });
    return map;
  }, [planStatus]);

  // Handler for ending the plan
  const handleEndPlan = () => {
    Alert.alert(
      'End Plan',
      'Are you sure you want to end this plan? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Plan',
          style: 'destructive',
          onPress: () => endPlan(),
        },
      ]
    );
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Plan not found.</Text>
      </View>
    );
  }

  // Modern info cards
  const infoCards = [
    {
      icon: <Ionicons name="book-outline" size={22} color="#2563eb" />,
      label: 'Category',
      value: plan.category || 'N/A',
    },
    {
      icon: <MaterialCommunityIcons name="fire" size={22} color="#f59e42" />,
      label: 'Streak',
      value: plan.streak || 0,
    },
    {
      icon: <Ionicons name="calendar-outline" size={22} color="#2563eb" />,
      label: 'Sessions',
      value: planStatus.length,
    },
    {
      icon: <Ionicons name="time-outline" size={22} color="#2563eb" />,
      label: 'Minutes',
      value: planStatus.reduce((sum: number, s: any) => sum + (s.passedTime || 0), 0),
    },
  ];
  // Additional details card
  const detailsCard = [
    {
      icon: <Ionicons name="calendar-outline" size={20} color="#10b981" />,
      label: 'Start Date',
      value: plan.startDate ? humanReadableDate(plan.startDate.toISOString()) : 'N/A',
    },
    {
      icon: <Ionicons name="calendar-sharp" size={20} color="#ef4444" />,
      label: 'End Date',
      value: plan.endDate ? humanReadableDate(plan.endDate.toISOString()) : 'N/A',
    },
    {
      icon: <Ionicons name="timer-outline" size={20} color="#6366f1" />,
      label: 'Plan Duration',
      value: formatDuration(durationToString(plan.duration)),
    },
  ];
  return (
    <ScrollView style={{ backgroundColor: '#f3f4f6' }}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.desc}>{plan.description || 'No description provided.'}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
          {/* {!plan.isEnd && (
            <TouchableOpacity
              style={styles.studyNowBtn}
              onPress={() => navigation.navigate('StudyNow', { plan })}>
              <Ionicons
                name="play-circle-outline"
                size={20}
                color="#fff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.studyNowBtnText}>Study Now</Text>
            </TouchableOpacity>
          )} */}
          {/* End Plan Button */}
          {!plan.isEnd && (
            <TouchableOpacity style={styles.endPlanBtn} onPress={handleEndPlan}>
              <Ionicons
                name="close-circle-outline"
                size={20}
                color="#ef4444"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.endPlanBtnText}>End Plan</Text>
            </TouchableOpacity>
          )}
          {plan.isEnd && (
            <View style={styles.endedBadge}>
              <Ionicons name="checkmark-done-circle-outline" size={18} color="#10b981" />
              <Text style={styles.endedBadgeText}>Plan Ended</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.headerCard}>
        <Text style={styles.title}>{plan.title}</Text>
        <Text style={styles.desc}>{plan.description || 'No description provided.'}</Text>
      </View>
      <View style={styles.infoRow}>
        {infoCards.map((card, idx) => (
          <View key={idx} style={styles.infoCard}>
            {card.icon}
            <Text style={styles.infoValue}>{card.value}</Text>
            <Text style={styles.infoLabel}>{card.label}</Text>
          </View>
        ))}
      </View>
      {/* New details card */}
      <View style={styles.detailsCard}>
        {detailsCard.map((item, idx) => (
          <View key={idx} style={styles.detailsRow}>
            {item.icon}
            <Text style={styles.detailsLabel}>{item.label}:</Text>
            <Text style={styles.detailsValue}>{item.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.calendarSection}>
        <Calendar
          markingType={'custom'}
          markedDates={markedDates}
          theme={{
            todayTextColor: '#2563eb',
            arrowColor: '#2563eb',
            dotColor: '#2563eb',
            selectedDayBackgroundColor: '#2563eb',
            selectedDayTextColor: '#fff',
            textDayFontWeight: '600',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
          }}
          dayComponent={({ date, state }) => {
            if (!date) return null;
            const dateStr = date.dateString;
            const minutes = studyMinutesByDate[dateStr];
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text
                  style={{
                    color: state === 'disabled' ? '#d1d5db' : '#1e293b',
                    fontWeight: markedDates[dateStr] ? 'bold' : 'normal',
                  }}>
                  {date.day}
                </Text>
                {minutes ? (
                  <Text style={{ fontSize: 10, color: '#2563eb', fontWeight: 'bold' }}>
                    {minutes}m
                  </Text>
                ) : null}
              </View>
            );
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 16,
    marginBottom: 0,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 6,
  },
  desc: {
    color: '#64748b',
    fontSize: 15,
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minWidth: 70,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginTop: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
  calendarSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
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
    marginBottom: 10,
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailsLabel: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '600',
    marginRight: 4,
  },
  detailsValue: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  endPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#fee2e2',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  endPlanBtnText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 15,
  },
  endedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    backgroundColor: '#d1fae5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  endedBadgeText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  studyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  studyNowBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default PlanDetailsScreen;
