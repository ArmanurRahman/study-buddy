import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Easing } from 'react-native';
import { Svg, Circle } from 'react-native-svg';

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

const RADIUS = 60;
const STROKE = 8;
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
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 20000,
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
    if (running && currentSeconds <= 60 && currentSeconds > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(warningAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(warningAnim, {
            toValue: -1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(warningAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      warningAnim.setValue(0);
    }
  }, [running, currentSeconds]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <Animated.View
          style={{
            width: 320,
            alignItems: 'center',
            borderRadius: 18,
            backgroundColor: '#fff',
            padding: 24,
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
            shadowColor: '#2563eb',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.18,
            shadowRadius: 24,
            elevation: 12,
          }}>
          <Text className="mb-4 text-2xl font-bold text-blue-700">Study Timer</Text>
          {/* Clock-like timer with pulse and warning shake */}
          <Animated.View
            style={{
              marginBottom: 24,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [
                { scale: pulseAnim },
                currentSeconds <= 60 && running
                  ? {
                      translateX: warningAnim.interpolate({
                        inputRange: [-1, 1],
                        outputRange: [-8, 8],
                      }),
                    }
                  : { translateX: 0 },
              ],
            }}>
            <Svg width={2 * (RADIUS + STROKE)} height={2 * (RADIUS + STROKE)}>
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
                stroke={currentSeconds <= 60 && running ? '#f59e42' : '#2563eb'}
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
                left: RADIUS + STROKE - 48,
                top: RADIUS + STROKE - 12,
                width: 96,
                textAlign: 'center',
                fontSize: 28,
                fontFamily: 'monospace',
                color: currentSeconds <= 60 && running ? '#f59e42' : running ? '#2563eb' : '#111',
                fontWeight: 'bold',
                letterSpacing: 2,
              }}>
              {`${hours ? hours.toString().padStart(2, '0') + ':' : ''}${minutes
                .toString()
                .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            </Text>
          </Animated.View>
          <View className="mb-4 flex-row">
            {!running ? (
              <TouchableOpacity
                className="mr-2 rounded bg-blue-600 px-5 py-2"
                onPress={resumeTimer}
                activeOpacity={0.85}>
                <Text className="text-lg font-bold text-white">
                  {currentSeconds === totalSeconds ? 'Start' : 'Resume'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="mr-2 rounded bg-yellow-500 px-5 py-2"
                onPress={pauseTimer}
                activeOpacity={0.85}>
                <Text className="text-lg font-bold text-white">Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              className="rounded bg-gray-400 px-5 py-2"
              onPress={resetTimer}
              activeOpacity={0.85}>
              <Text className="text-lg font-bold text-white">Reset</Text>
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
