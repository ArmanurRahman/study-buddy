import { TouchableWithoutFeedback, Text, View, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DateTime = ({
  date,
  setDate,
  showPicker,
  setShowPicker,
}: {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  showPicker: boolean;
  setShowPicker: (show: boolean) => void;
}) => {
  return (
    <>
      <View style={{ position: 'relative', marginBottom: 24 }}>
        <TouchableWithoutFeedback onPress={() => setShowPicker(true)}>
          <Text
            className={date ? 'text-black' : 'text-gray-400'}
            style={{
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 8,
              padding: 12,
              fontSize: 18,
              backgroundColor: '#fff',
              paddingRight: date ? 36 : 12,
            }}>
            {date ? date.toDateString() : 'Select Date'}
          </Text>
        </TouchableWithoutFeedback>
        {date && (
          <TouchableOpacity
            onPress={() => setDate(undefined)}
            style={{
              position: 'absolute',
              right: 8,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
            }}>
            <Text style={{ fontSize: 20, color: '#888' }}>×</Text>
          </TouchableOpacity>
        )}
      </View>
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
