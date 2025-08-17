import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
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

  useEffect(() => {
    return () => {
      if (intervalRef && intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="w-80 items-center rounded-lg bg-white p-6">
          <Text className="mb-4 text-2xl font-bold">Study Timer</Text>
          {/* Clock-like timer */}
          <View className="mb-6 items-center justify-center">
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
                stroke="#2563eb"
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${RADIUS + STROKE}, ${RADIUS + STROKE}`}
              />
              <Text
                style={{
                  position: 'absolute',
                  left: RADIUS + STROKE - 48,
                  top: RADIUS + STROKE - 12,
                  width: 96,
                  textAlign: 'center',
                  fontSize: 20,
                  fontFamily: 'monospace',
                  color: '#111',
                }}>
                {`${hours ? hours.toString().padStart(2, '0') + ':' : ''}${minutes
                  .toString()
                  .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
              </Text>
            </Svg>
          </View>
          <View className="mb-4 flex-row">
            {!running ? (
              <TouchableOpacity
                className="mr-2 rounded bg-blue-600 px-4 py-2"
                onPress={resumeTimer}>
                <Text className="font-bold text-white">
                  {currentSeconds === totalSeconds ? 'Start' : 'Resume'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="mr-2 rounded bg-yellow-500 px-4 py-2"
                onPress={pauseTimer}>
                <Text className="font-bold text-white">Pause</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity className="rounded bg-gray-400 px-4 py-2" onPress={resetTimer}>
              <Text className="font-bold text-white">Reset</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={onClose}
            activeOpacity={0.7}>
            <Text className="text-2xl font-bold text-gray-600">X</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TimerModal;
