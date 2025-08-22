import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Realm from 'realm';
import { realmSchemas } from '../schema';

import TimerModal from './Timer';
import { PlanStatusType } from '../types';
import { getTotalSeconds, parseDuration, secondsToTimer, timeObjectToMinutes } from '../utils/time';
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
  const completeTask = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Insert/update status in the database
    try {
      const realm = await Realm.open({ schema: realmSchemas });
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      realm.write(() => {
        // Try to find an existing status for this task and date
        let statusObj = realm
          .objects('PlanStatus')
          .filtered('taskId == $0 && date == $1', new Realm.BSON.ObjectId(id), todayDate)[0];
        if (statusObj) {
          statusObj.status = 'completed';
          statusObj.updatedAt = new Date();
        } else {
          realm.create('PlanStatus', {
            _id: new Realm.BSON.ObjectId(),
            taskId: new Realm.BSON.ObjectId(id),
            date: todayDate,
            status: 'completed',
            updatedAt: new Date(),
            passedTime: timeObjectToMinutes(timer),
          });
        }
        // / --- Streak Logic (considering frequency) ---
        // Get the Task object
        const taskObj = realm.objectForPrimaryKey('Task', new Realm.BSON.ObjectId(id));
        if (taskObj) {
          // Parse frequency (should be an array of booleans for days of week)
          let frequency: boolean[] = [];
          try {
            frequency = Array.isArray(taskObj.frequency)
              ? taskObj.frequency
              : JSON.parse(taskObj.frequency as string);
          } catch {
            frequency = [false, false, false, false, false, false, false];
          }

          // Get the weekday for today (0=Monday, 6=Sunday)
          // JS: getDay() is 0=Sunday, 6=Saturday. Convert to 0=Monday, 6=Sunday:
          let jsDay = todayDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
          let todayWeekday = (jsDay + 6) % 7; // 0=Monday, 6=Sunday

          // If today is not a scheduled day, streak does not increment
          if (!frequency[todayWeekday]) {
            taskObj.streak = 0;
          } else {
            // Find the last time this task was completed on any of the scheduled days (excluding today)
            const lastStatus = realm
              .objects('PlanStatus')
              .filtered(
                'taskId == $0 && status == "completed" && date < $1',
                new Realm.BSON.ObjectId(id),
                todayDate
              )
              .sorted('date', true)
              .find((status: any) => {
                const d = status.date;
                // Only consider scheduled days
                return frequency[d.getDay()];
              });

            if (lastStatus) {
              // Calculate how many weeks since last completion on a scheduled day
              const diffDays = Math.floor(
                (todayDate.getTime() - lastStatus.date.getTime()) / (1000 * 60 * 60 * 24)
              );
              // Find the previous scheduled day before today
              let prevScheduledDay = todayWeekday;
              for (let i = 1; i <= 7; i++) {
                const checkDay = (todayWeekday - i + 7) % 7;
                if (frequency[checkDay]) {
                  prevScheduledDay = checkDay;
                  break;
                }
              }
              // Calculate how many days ago was the previous scheduled day
              let daysSincePrev = (todayWeekday - prevScheduledDay + 7) % 7 || 7;
              // If lastStatus was exactly daysSincePrev days ago, continue streak
              if (diffDays === daysSincePrev) {
                taskObj.streak = (Number(taskObj.streak) || 0) + 1;
              } else {
                taskObj.streak = 1;
              }
            } else {
              // First time completing on a scheduled day
              taskObj.streak = 1;
            }
          }
        }
      });
      setStatus(id, 'completed');
      realm.close();
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
          marginBottom: 18,
          borderRadius: 18,
          overflow: 'hidden',
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 6,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
        {/* Accent bar */}
        <View
          style={{
            height: 5,
            width: '100%',
            backgroundColor:
              status === 'completed'
                ? '#10b981'
                : status === 'running'
                  ? '#2563eb'
                  : status === 'paused'
                    ? '#f59e42'
                    : '#e5e7eb',
            opacity: 0.9,
          }}
        />
        <View style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <CategoryIcon category={category} />
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b', flex: 1 }}>
              {title}
            </Text>
            {status === 'completed' && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#10b981"
                style={{ marginLeft: 8 }}
              />
            )}
            {status === 'running' && (
              <Ionicons name="play-circle" size={22} color="#2563eb" style={{ marginLeft: 8 }} />
            )}
            {status === 'paused' && (
              <Ionicons name="pause-circle" size={22} color="#f59e42" style={{ marginLeft: 8 }} />
            )}
          </View>
          {description ? (
            <Text style={{ color: '#64748b', fontSize: 16, marginBottom: 10, marginLeft: 2 }}>
              {description}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 10,
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Ionicons name="time-outline" size={18} color="#2563eb" style={{ marginRight: 4 }} />
              <Text style={{ fontWeight: '600', color: '#2563eb', fontSize: 15 }}>{duration}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: 16,
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 2,
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
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginRight: 6,
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
            {/* Complete Task Button */}
            {status !== 'completed' && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#10b981',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: 6,
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
                marginTop: 14,
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#10b981',
                fontSize: 16,
              }}>
              Task Completed!
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
