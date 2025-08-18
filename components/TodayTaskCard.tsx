import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, AppState, AppStateStatus } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Realm from 'realm';
import { realmSchemas } from '../schema';

import TimerModal from './Timer';

type TodayTaskCardProps = {
  id: string;
  title: string;
  description: string;
  duration: string;
  streak?: string;
  runningTaskId?: string | null;
  status: 'idle' | 'running' | 'paused' | 'completed';
  setStatus: (id: string, status: 'idle' | 'running' | 'paused' | 'completed') => void;
  isNoTaskRunning: boolean;
};

// Helper to parse duration string like "1h 30m 20s"
function parseDuration(duration: string) {
  let hours = 0,
    minutes = 0,
    seconds = 0;
  const hMatch = duration.match(/(\d+)\s*h/);
  const mMatch = duration.match(/(\d+)\s*m/);
  const sMatch = duration.match(/(\d+)\s*s/);
  if (hMatch) hours = parseInt(hMatch[1]);
  if (mMatch) minutes = parseInt(mMatch[1]);
  if (sMatch) seconds = parseInt(sMatch[1]);
  return { hours, minutes, seconds };
}

const TodayTaskCard = ({
  id,
  title,
  description,
  duration,
  streak,
  status,
  setStatus,
  isNoTaskRunning,
}: TodayTaskCardProps) => {
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
  // Convert timer state to total seconds
  const getTotalSeconds = (t: typeof timer) => t.hours * 3600 + t.minutes * 60 + t.seconds;

  // Convert seconds to {hours, minutes, seconds}
  const secondsToTimer = (total: number) => ({
    hours: Math.floor(total / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  });
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
          .objects('TaskStatus')
          .filtered('taskId == $0 && date == $1', new Realm.BSON.ObjectId(id), todayDate)[0];
        if (statusObj) {
          statusObj.status = 'completed';
          statusObj.updatedAt = new Date();
        } else {
          realm.create('TaskStatus', {
            _id: new Realm.BSON.ObjectId(),
            taskId: new Realm.BSON.ObjectId(id),
            date: todayDate,
            status: 'completed',
            updatedAt: new Date(),
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
              .objects('TaskStatus')
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
        className="mb-4 w-full rounded-lg bg-white p-4 shadow"
        style={{ borderWidth: 1, borderColor: '#e5e7eb' }}>
        <Text className="mb-2 text-xl font-bold">{title}</Text>
        <Text className="mb-2 text-gray-600">{description}</Text>
        <Text className="mb-4 font-semibold text-blue-600">Duration: {duration}</Text>
        <Text className="mb-4 font-semibold text-blue-600">
          Streak: {streak || 'No streak available'}
        </Text>
        <TouchableOpacity
          className={`rounded py-2 ${
            status === 'paused' && isNoTaskRunning
              ? 'bg-yellow-600'
              : isNoTaskRunning || status === 'running'
                ? 'bg-blue-600'
                : 'bg-gray-400'
          }`}
          onPress={() => {
            setTimerVisible(true);
            if (status === 'idle') startTimer();
            else if (status === 'paused') resumeTimer();
          }}
          disabled={!(status === 'running' || isNoTaskRunning)}
          activeOpacity={0.8}>
          <View className="flex-row items-center justify-center">
            <Text className="text-center font-bold text-white">
              {status === 'running' || status === 'paused'
                ? `${timer.hours ? timer.hours.toString().padStart(2, '0') + ':' : ''}${timer.minutes
                    .toString()
                    .padStart(2, '0')}:${timer.seconds.toString().padStart(2, '0')}`
                : 'Start'}
            </Text>
            {status === 'paused' ? (
              <Ionicons
                name="pause"
                size={20}
                color="#fff"
                style={{ marginLeft: 8, alignSelf: 'flex-end' }}
              />
            ) : status === 'running' ? (
              <Ionicons
                name="play"
                size={20}
                color="#fff"
                style={{ marginLeft: 8, alignSelf: 'flex-end' }}
              />
            ) : (
              <></>
            )}
          </View>
        </TouchableOpacity>
        {/* Complete Task Button */}
        {status !== 'completed' && (
          <TouchableOpacity
            className="mt-3 rounded bg-green-600 py-2"
            onPress={completeTask}
            activeOpacity={0.8}>
            <Text className="text-center font-bold text-white">Complete Task</Text>
          </TouchableOpacity>
        )}
        {status === 'completed' && (
          <Text className="mt-3 text-center font-bold text-green-600">Task Completed!</Text>
        )}
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

export default TodayTaskCard;
