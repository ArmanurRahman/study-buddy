import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { durationToString, formatDuration } from 'utils/time';
import type { StackScreenProps } from '@react-navigation/stack';

import { TodaysPlan } from 'types';

const screenWidth = Dimensions.get('window').width;

type RootStackParamList = {
  StudyNow: { plan: TodaysPlan };
};

type Props = StackScreenProps<RootStackParamList, 'StudyNow'>;

const StudyNowScreen: React.FC<Props> = ({ route, navigation }) => {
  const plan = route?.params?.plan;

  return (
    <View style={styles.container}>
      {/* Illustration */}
      <View
        style={{
          borderColor: '#fff',
          width: 150,
          height: 150,
          borderWidth: 2,
          borderRadius: 100,
          alignItems: 'center',
          marginBottom: 12,
          overflow: 'hidden',
        }}>
        <Image
          source={require('../assets/images/study_illustration.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
      </View>

      {/* Plan Info */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="book-outline" size={22} color="#2563eb" style={{ marginRight: 8 }} />
          <Text style={styles.planTitle}>{plan?.title || 'Your Study Plan'}</Text>
        </View>
        {plan?.description ? <Text style={styles.planDescription}>{plan.description}</Text> : null}
        <View style={styles.infoRow}>
          <View style={styles.infoBadge}>
            <Ionicons name="time-outline" size={18} color="#2563eb" style={{ marginRight: 4 }} />
            <Text style={styles.infoText}>
              {plan?.duration
                ? `${formatDuration(durationToString(plan.duration))} `
                : 'Set duration'}
            </Text>
          </View>
          <View style={styles.infoBadge}>
            <Ionicons name="flame-outline" size={18} color="#f59e42" style={{ marginRight: 4 }} />
            <Text style={[styles.infoText, { color: '#f59e42' }]}>
              {plan?.streak || 0} day streak
            </Text>
          </View>
        </View>
        {plan.status === 'completed' && (
          <Text
            style={{
              marginTop: 18,
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#10b981',
              fontSize: 17,
              letterSpacing: 0.5,
            }}>
            🎉 Study Completed!
          </Text>
        )}
      </View>

      {/* Start Button */}
      {plan.status !== 'completed' && (
        <TouchableOpacity style={styles.startBtn}>
          <Ionicons name="play" size={22} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.startBtnText}>Start Studying</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: screenWidth,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#e0e7ef',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    letterSpacing: 0.5,
  },
  illustration: {
    width: 160,
    height: 160,
    backgroundColor: '#2563eb',
    transform: [{ translateY: -6 }],
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    width: screenWidth - 40,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.09,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  planDescription: {
    color: '#64748b',
    fontSize: 16,
    marginBottom: 10,
    marginLeft: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
  },
  infoText: {
    fontWeight: '600',
    color: '#2563eb',
    fontSize: 15,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 38,
    marginTop: 18,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});

export default StudyNowScreen;
