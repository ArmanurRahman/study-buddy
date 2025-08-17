import { TouchableOpacity, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateTime = ({
  date,
  setDate,
  showPicker,
  setShowPicker,
}: {
  date: Date | undefined;
  setDate: (date: Date) => void;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
}) => {
  return (
    <>
      <TouchableOpacity
        className="mb-2 w-full rounded border border-gray-300 p-2"
        onPress={() => setShowPicker(true)}>
        <Text className={date ? 'text-black' : 'text-gray-400'} style={{ padding: 8 }}>
          {date ? date.toDateString() : 'Select Date'}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={(_, date) => {
            setShowPicker(false);
            if (date) setDate(date);
          }}
        />
      )}
    </>
  );
};

export default DateTime;
