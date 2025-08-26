import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useRealm } from '@realm/react';

import TimerModal from './Timer';
import { PlanStatusType } from '../types';
import {
  formatDuration,
  getTotalSeconds,
  parseDuration,
  secondsToTimer,
  timeStringToMinutes,
} from '../utils/time';
import CategoryIcon from './CategoryIcon';
import Streak from './Streak';

type TodayPlanCardProps = {
  id: string;
  title: string;
  description?: string;
  duration: string;
  streak?: number;
  runningTaskId?: string | null;
  status: PlanStatusType;
  setStatus: (id: string, status: PlanStatusType) => void;
  isNoTaskRunning: boolean;
  category: string;
};

const TodayPlanCard = ({
  id,
  title,
  description,
  duration,
  streak,
  status,
  setStatus,
  isNoTaskRunning,
  category,
}: TodayPlanCardProps) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const realm = useRealm();
  const {
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  } = parseDuration(duration);
  const [timerVisible, setTimerVisible] = useState(false);
  const [timer, setTimer] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });
  const [timerRunning, setTimerRunning] = useState(false);
  const [startTimestamp, setStartTimestamp] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialHours * 3600 + initialMinutes * 60 + initialSeconds
  );
  const appState = useRef(AppState.currentState);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update timer state if duration prop changes
  useEffect(() => {
    const { hours, minutes, seconds } = parseDuration(duration);
    setTimer({ hours, minutes, seconds });
    setRemainingSeconds(hours * 3600 + minutes * 60 + seconds);
  }, [duration]);

  // Start timer
  const startTimer = () => {
    if (status === 'running') return;
    setStatus(id, 'running');
    setTimerRunning(true);
    setStartTimestamp(Date.now());
    setRemainingSeconds(getTotalSeconds(timer));
  };

  // Pause timer
  const pauseTimer = () => {
    setStatus(id, 'paused');
    setTimerRunning(false);
    if (startTimestamp) {
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
      setRemainingSeconds((prev) => Math.max(prev - elapsed, 0));
      setTimer(secondsToTimer(Math.max(remainingSeconds - elapsed, 0)));
    }
  };

  // Resume timer
  const resumeTimer = () => {
    setStatus(id, 'running');
    setTimerRunning(true);
    setStartTimestamp(Date.now());
  };

  // Effect to handle ticking
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      if (startTimestamp) {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        const left = Math.max(remainingSeconds - elapsed, 0);
        setTimer(secondsToTimer(left));
        if (left <= 0) {
          clearInterval(interval);
          setTimerRunning(false);
          completeTask();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning, startTimestamp, remainingSeconds]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        timerRunning
      ) {
        // App has come to foreground, update timer
        if (startTimestamp) {
          const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
          const left = Math.max(remainingSeconds - elapsed, 0);
          setTimer(secondsToTimer(left));
          if (left <= 0) {
            setTimerRunning(false);
            completeTask();
          }
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerRunning, startTimestamp, remainingSeconds]);

  // Complete the task
  const completeTask = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    try {
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      realm.write(() => {
        // Try to find an existing status for this task and date
        let statusObj = realm
          .objects('PlanStatus')
          .filtered('planId == $0 && date == $1', new Realm.BSON.ObjectId(id), todayDate)[0];
        if (statusObj) {
          statusObj.status = 'completed';
          statusObj.updatedAt = new Date();
        } else {
          realm.create('PlanStatus', {
            _id: new Realm.BSON.ObjectId(),
            planId: new Realm.BSON.ObjectId(id),
            date: todayDate,
            status: 'completed',
            updatedAt: new Date(),
            passedTime: timeStringToMinutes(duration),
            //   Math.round(
            //     (initialHours * 3600 +
            //       initialMinutes * 60 +
            //       initialSeconds -
            //       (timer.hours * 3600 + timer.minutes * 60 + timer.seconds)) /
            //       60
            //   ),
          });
        }
        // --- Streak Logic (considering frequency) ---
        // Get the Plan object
        const planObj = realm.objectForPrimaryKey('Plan', new Realm.BSON.ObjectId(id));
        if (planObj) {
          // Find the last time this plan was completed before today
          const lastStatus = realm
            .objects('PlanStatus')
            .filtered(
              'planId == $0 && status == "completed" && date < $1',
              new Realm.BSON.ObjectId(id),
              todayDate
            )
            .sorted('date', true)[0];

          if (lastStatus) {
            if (lastStatus.date !== todayDate) {
              planObj.streak = (Number(planObj.streak) || 0) + 1;
            }
          } else {
            planObj.streak = 1;
          }
        }
      });
      setStatus(id, 'completed');
      setTimerVisible(false);
      navigation.navigate('StudyComplete');
    } catch (e) {
      console.error('Error saving task status:', e);
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setStatus(id, 'idle');
    setTimer({ hours: initialHours, minutes: initialMinutes, seconds: initialSeconds });
  };

  return (
    <>
      <View
        style={{
          width: '100%',
          marginBottom: 22,
          borderRadius: 22,
          overflow: 'hidden',
          backgroundColor: '#fff',
          borderWidth: 0,
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.13,
          shadowRadius: 24,
          elevation: 8,
        }}>
        {/* Gradient Accent Bar */}
        <View
          style={{
            height: 6,
            width: '100%',
            backgroundColor: 'transparent',
            opacity: 1,
          }}>
          <View
            style={{
              height: '100%',
              width: '100%',
              borderTopLeftRadius: 22,
              borderTopRightRadius: 22,
              backgroundColor:
                status === 'completed'
                  ? '#10b981'
                  : status === 'running'
                    ? '#2563eb'
                    : status === 'paused'
                      ? '#f59e42'
                      : '#e5e7eb',
              opacity: 0.95,
            }}
          />
        </View>
        <View style={{ padding: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View
              style={{
                backgroundColor: '#f1f5f9',
                borderRadius: 12,
                padding: 8,
                marginRight: 10,
              }}>
              <CategoryIcon category={category} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b', flex: 1 }}>
              {title}
            </Text>
            {status === 'completed' && (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#10b981"
                style={{ marginLeft: 8 }}
              />
            )}
            {status === 'running' && (
              <Ionicons name="play-circle" size={24} color="#2563eb" style={{ marginLeft: 8 }} />
            )}
            {status === 'paused' && (
              <Ionicons name="pause-circle" size={24} color="#f59e42" style={{ marginLeft: 8 }} />
            )}
          </View>
          {description ? (
            <Text style={{ color: '#64748b', fontSize: 16, marginBottom: 12, marginLeft: 2 }}>
              {description}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 14,
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                marginRight: 10,
              }}>
              <Ionicons name="time-outline" size={18} color="#2563eb" style={{ marginRight: 4 }} />
              <Text style={{ fontWeight: '600', color: '#2563eb', fontSize: 15 }}>
                {formatDuration(duration)}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f9fafb',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 4,
              }}>
              <Streak streak={streak || 0} />
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Start/Resume/Pause Button */}
            {status !== 'completed' && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor:
                    status === 'paused' && isNoTaskRunning
                      ? '#f59e42'
                      : isNoTaskRunning || status === 'running'
                        ? '#2563eb'
                        : '#cbd5e1',
                  borderRadius: 10,
                  paddingVertical: 13,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginRight: 6,
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={() => {
                  setTimerVisible(true);
                  if (status === 'idle') startTimer();
                  else if (status === 'paused') resumeTimer();
                }}
                disabled={!(status === 'running' || isNoTaskRunning)}
                activeOpacity={0.85}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                  {status === 'running' || status === 'paused'
                    ? `${timer.hours ? timer.hours.toString().padStart(2, '0') + ':' : ''}${timer.minutes
                        .toString()
                        .padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`
                    : 'Start'}
                </Text>
              </TouchableOpacity>
            )}
            {/* Complete Plan Button */}
            {status !== 'completed' && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#10b981',
                  borderRadius: 10,
                  paddingVertical: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 6,
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={completeTask}
                activeOpacity={0.85}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Complete</Text>
              </TouchableOpacity>
            )}
          </View>
          {status === 'completed' && (
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
      </View>
      <TimerModal
        initialMinutes={initialMinutes}
        initialSeconds={initialSeconds}
        initialHours={initialHours}
        running={status === 'running'}
        hours={timer.hours}
        minutes={timer.minutes}
        seconds={timer.seconds}
        visible={timerVisible}
        onClose={() => setTimerVisible(false)}
        resetTimer={resetTimer}
        resumeTimer={resumeTimer}
        pauseTimer={pauseTimer}
        intervalRef={intervalRef}
      />
    </>
  );
};

export default TodayPlanCard;
