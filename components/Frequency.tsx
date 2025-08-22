import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';

const days = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];

type FrequencyProps = {
  value?: boolean[];
  onChange?: (val: boolean[]) => void;
};

const Frequency = ({
  value = [false, false, false, false, false, false, false],
  onChange,
}: FrequencyProps) => {
  const [selected, setSelected] = useState<boolean[]>(value);
  // Update selected state when value prop changes (for edit mode)
  useEffect(() => {
    setSelected(value);
  }, [value]);

  const toggleDay = (idx: number) => {
    const updated = [...selected];
    updated[idx] = !updated[idx];
    setSelected(updated);
    onChange?.(updated);
  };

  return (
    <View className="mb-4 w-full">
      <View className="flex-row justify-between">
        {days.map((day, idx) => (
          <TouchableOpacity
            key={day}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${selected[idx] ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}
            onPress={() => toggleDay(idx)}
            activeOpacity={0.7}>
            <Text className={selected[idx] ? 'font-bold text-white' : 'text-gray-700'}>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Frequency;
