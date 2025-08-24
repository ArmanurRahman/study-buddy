import { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useQuery } from '@realm/react';
import { timeStringToHours } from 'utils/time';

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

const getMarkedDates = (studyMinutesByDate: Record<string, number>) => {
  const marked: Record<string, any> = {};
  Object.entries(studyMinutesByDate).forEach(([date, minutes]) => {
    marked[date] = {
      customStyles: {
        container: {
          backgroundColor: minutes > 0 ? '#2563eb' : '#e5e7eb',
        },
        text: {
          color: minutes > 0 ? '#fff' : '#9ca3af',
          fontWeight: 'bold',
        },
      },
    };
  });
  return marked;
};

const StudyCalendar = () => {
  const planStatusResults = useQuery('PlanStatus');

  // Compute study minutes by date using useMemo for performance
  const studyMinutesByDate = useMemo(() => {
    const minutesByDate: Record<string, number> = {};
    planStatusResults.filtered('status == "completed"').forEach((status: any) => {
      const dateObj = new Date(status.date);
      const dateStr = dateObj.toISOString().slice(0, 10); // 'YYYY-MM-DD'
      let minutes = 0;
      if (typeof status.passedTime === 'number') {
        minutes = status.passedTime;
      } else if (typeof status.passedTime === 'string') {
        minutes = timeStringToHours(status.passedTime) * 60;
      }
      minutesByDate[dateStr] = (minutesByDate[dateStr] || 0) + minutes;
    });
    return minutesByDate;
  }, [planStatusResults]);

  return (
    <View className="mb-6">
      <Calendar
        markingType={'custom'}
        markedDates={getMarkedDates(studyMinutesByDate)}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
        }}
        dayComponent={({ date }) => {
          if (!date) return null;
          const minutes = studyMinutesByDate[date.dateString];
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: minutes > 0 ? '#2563eb' : '#9ca3af', fontWeight: 'bold' }}>
                {date.day}
              </Text>
              {minutes > 0 && (
                <Text style={{ fontSize: 10, color: '#2563eb' }}>
                  {minutes < 60 ? `${minutes}m` : `${(minutes / 60).toFixed(2)}h`}
                </Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default StudyCalendar;
