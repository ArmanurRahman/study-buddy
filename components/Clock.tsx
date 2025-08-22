import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type ClockProps = {
  value?: { hours: string; minutes: string };
  onChange?: (val: { hours: string; minutes: string }) => void;
};

const Clock = ({ value = { hours: '', minutes: '' }, onChange }: ClockProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const [time, setTime] = useState(() => {
    const h = parseInt(value.hours || '0', 10);
    const m = parseInt(value.minutes || '0', 10);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m);
    return date;
  });

  const getDateFromValue = (val: { hours: string; minutes: string }) => {
    const h = parseInt(val.hours || '0', 10);
    const m = parseInt(val.minutes || '0', 10);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  // Update time state when value prop changes (for edit mode)
  useEffect(() => {
    setTime(getDateFromValue(value));
  }, [value.hours, value.minutes]);

  const handleChange = (_: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTime(selectedDate);
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      onChange?.({ hours, minutes });
    }
  };

  return (
    <View className="w-full">
      <TouchableOpacity
        className="rounded border border-gray-300 p-2"
        onPress={() => setShowPicker(true)}>
        <Text className="text-lg">
          {time.getHours().toString().padStart(2, '0')}:
          {time.getMinutes().toString().padStart(2, '0')}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
};

export default Clock;
