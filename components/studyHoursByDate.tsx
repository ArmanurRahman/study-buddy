import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { realmSchemas } from 'schema';
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
  const [studyMinutesByDate, setStudyMinutesByDate] = useState<Record<string, number>>({});
  useEffect(() => {
    (async () => {
      const realm = await Realm.open({ schema: realmSchemas });
      // Fetch all completed PlanStatus
      const statuses = realm.objects('PlanStatus').filtered('status == "completed"');
      const minutesByDate: Record<string, number> = {};

      statuses.forEach((status: any) => {
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

      setStudyMinutesByDate(minutesByDate);
      realm.close();
    })();
  }, []);

  return (
    <View className="mb-6">
      <Text className="mb-2 text-lg font-semibold">Study Calendar</Text>
      <Calendar
        markingType={'custom'}
        markedDates={getMarkedDates(studyMinutesByDate)}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
        }}
        dayComponent={({ date }) => {
          const minutes = studyMinutesByDate[date.dateString];
          return (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: minutes > 0 ? '#2563eb' : '#9ca3af', fontWeight: 'bold' }}>
                {date?.day}
              </Text>
              {minutes > 0 && (
                <Text style={{ fontSize: 10, color: '#2563eb' }}>{minutes / 60}h</Text>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default StudyCalendar;
