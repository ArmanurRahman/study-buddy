import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  Platform,
  Vibration,
} from 'react-native';
import { Svg, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

type TimerModalProps = {
  visible: boolean;
  onClose: () => void;
  initialHours: number;
  initialMinutes: number;
  initialSeconds: number;
  running: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  resumeTimer: () => void;
  resetTimer: () => void;
  pauseTimer: () => void;
  intervalRef: React.RefObject<NodeJS.Timeout | null>;
};

const RADIUS = 120;
const STROKE = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const TimerModal = ({
  visible,
  onClose,
  initialHours,
  initialMinutes,
  initialSeconds,
  running,
  hours,
  minutes,
  seconds,
  resetTimer,
  resumeTimer,
  pauseTimer,
  intervalRef,
}: TimerModalProps) => {
  const totalSeconds = initialHours * 3600 + initialMinutes * 60 + initialSeconds;
  const currentSeconds = hours * 3600 + minutes * 60 + seconds;
  const progress = totalSeconds === 0 ? 0 : currentSeconds / totalSeconds;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  // Animation for the modal pop-in
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animation for the timer pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animation for "1 minute left" warning (e.g., shake)
  const warningAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    let pulse: Animated.CompositeAnimation | null = null;
    if (running) {
      pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (pulse) pulse.stop();
    };
  }, [running]);

  // "1 minute left" warning animation (shake)
  useEffect(() => {
    if (running && currentSeconds === 0 && totalSeconds > 0) {
      // Vibrate when study finishes (timer reaches zero)
      Vibration.vibrate([0, 400, 200, 400]);
    }
    if (running && currentSeconds === 60) {
      // Vibrate when 1 minute left
      Vibration.vibrate(500);
    }
    if (running && currentSeconds <= 60 && currentSeconds > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(warningAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(warningAnim, {
            toValue: -1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(warningAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      warningAnim.setValue(0);
    }
  }, [running, currentSeconds]);
  // Vibrate when study finishes (timer reaches zero)
  useEffect(() => {
    if (running && currentSeconds === 0 && totalSeconds > 0) {
      Vibration.vibrate([0, 400, 200, 400]);
    }
  }, [running, currentSeconds, totalSeconds]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(16,23,42,0.65)',
        }}>
        <Animated.View
          style={{
            width: 340,
            alignItems: 'center',
            borderRadius: 22,
            backgroundColor: '#fff',
            padding: 28,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 12,
          }}>
          <Text
            style={{
              marginBottom: 18,
              fontSize: 28,
              fontWeight: 'bold',
              color: '#2563eb',
              letterSpacing: 0.5,
              textShadowColor: '#c7d2fe',
              textShadowOffset: { width: 0, height: 2 },
              textShadowRadius: 8,
            }}>
            Study Timer
          </Text>
          {/* Clock-like timer with pulse and warning shake */}
          <Animated.View
            style={{
              marginBottom: 28,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [
                { scale: pulseAnim },
                currentSeconds <= 60 && running
                  ? {
                      translateX: warningAnim.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-10, 10],
                      }),
                    }
                  : { translateX: 0 },
              ],
            }}>
            <Svg width={2 * (RADIUS + STROKE)} height={2 * (RADIUS + STROKE)}>
              <Defs>
                <LinearGradient id="timerGradient" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#2563eb" />
                  <Stop offset="100%" stopColor="#10b981" />
                </LinearGradient>
              </Defs>
              <Circle
                cx={RADIUS + STROKE}
                cy={RADIUS + STROKE}
                r={RADIUS}
                stroke="#e5e7eb"
                strokeWidth={STROKE}
                fill="none"
              />
              <Circle
                cx={RADIUS + STROKE}
                cy={RADIUS + STROKE}
                r={RADIUS}
                stroke={currentSeconds <= 60 && running ? '#f59e42' : 'url(#timerGradient)'}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RADIUS + STROKE}, ${RADIUS + STROKE}`}
              />
            </Svg>
            <Text
              style={{
                position: 'absolute',
                left: RADIUS + STROKE - 100,
                top: RADIUS + STROKE - 18,
                width: 200,
                textAlign: 'center',
                fontSize: 34,
                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                color: currentSeconds <= 60 && running ? '#f59e42' : running ? '#2563eb' : '#111',
                fontWeight: 'bold',
                letterSpacing: 2,
                textShadowColor: '#c7d2fe',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 8,
              }}>
              {`${hours ? hours.toString().padStart(2, '0') + ':' : ''}${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            </Text>
          </Animated.View>
          <View style={{ marginBottom: 18, flexDirection: 'row', gap: 10 }}>
            {!running ? (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#2563eb',
                  borderRadius: 10,
                  paddingVertical: 13,
                  alignItems: 'center',
                  shadowColor: '#2563eb',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={resumeTimer}
                activeOpacity={0.85}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>
                  {currentSeconds === totalSeconds ? 'Start' : 'Resume'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#f59e42',
                  borderRadius: 10,
                  paddingVertical: 13,
                  alignItems: 'center',
                  shadowColor: '#f59e42',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                }}
                onPress={pauseTimer}
                activeOpacity={0.85}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#64748b',
                borderRadius: 10,
                paddingVertical: 13,
                alignItems: 'center',
                shadowColor: '#64748b',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={resetTimer}
              activeOpacity={0.85}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>Reset</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 18,
              top: 18,
              backgroundColor: '#f1f5f9',
              borderRadius: 16,
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 4,
            }}
            onPress={onClose}
            activeOpacity={0.7}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#64748b' }}>×</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default TimerModal;
