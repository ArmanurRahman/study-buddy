import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Example: configure locale if needed
LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  dayNamesShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
LocaleConfig.defaultLocale = 'en';

// Example study hours data for calendar
const studyHoursByDate: Record<string, number> = {
  '2025-08-01': 2,
  '2025-08-02': 1.5,
  '2025-08-03': 3,
  '2025-08-04': 0,
  '2025-08-05': 2.5,
  '2025-08-06': 1,
  '2025-08-07': 2,
};

const getMarkedDates = () => {
  const marked: Record<string, any> = {};
  Object.entries(studyHoursByDate).forEach(([date, hours]) => {
    marked[date] = {
      customStyles: {
        container: {
          backgroundColor: hours > 0 ? '#2563eb' : '#e5e7eb',
        },
        text: {
          color: hours > 0 ? '#fff' : '#9ca3af',
          fontWeight: 'bold',
        },
      },
    };
  });
  return marked;
};

const StudyCalendar = () => {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-lg font-semibold">Study Calendar</Text>
      <Calendar
        markingType={'custom'}
        markedDates={getMarkedDates()}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
        }}
        dayComponent={({ date }) => {
          const hours = studyHoursByDate[date.dateString];
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: hours > 0 ? '#2563eb' : '#9ca3af', fontWeight: 'bold' }}>
                {date?.day}
              </Text>
              {hours > 0 && <Text style={{ fontSize: 10, color: '#2563eb' }}>{hours}h</Text>}
            </View>
          );
        }}
      />
    </View>
  );
};

export default StudyCalendar;
