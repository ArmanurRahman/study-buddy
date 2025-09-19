import { useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useQuery } from '@realm/react';
import { humanReadableDate, timeStringToHours } from 'utils/time';
import { PlanStatus } from 'types';

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
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
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
  const planStatusResults = useQuery<PlanStatus>('PlanStatus');
  const planResults = useQuery('Plan');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Compute study minutes by date
  const studyMinutesByDate = useMemo(() => {
    const minutesByDate: Record<string, number> = {};
    planStatusResults.filtered('status == "completed"').forEach((status: any) => {
      const dateObj = new Date(status.date);
      const dateStr =
        dateObj.getFullYear() +
        '-' +
        String(dateObj.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(dateObj.getDate()).padStart(2, '0');
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

  // Get plan study details for selected date
  const plansForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return planStatusResults
      .filtered('status == "completed"')
      .filter((status: any) => {
        const dateObj = new Date(status.date);
        const localDateStr =
          dateObj.getFullYear() +
          '-' +
          String(dateObj.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(dateObj.getDate()).padStart(2, '0');
        return localDateStr === selectedDate;
      })
      .map((status: any) => {
        const plan = planResults.filtered('_id == $0', status.planId)[0];
        let minutes = 0;
        if (typeof status.passedTime === 'number') {
          minutes = status.passedTime;
        } else if (typeof status.passedTime === 'string') {
          minutes = timeStringToHours(status.passedTime) * 60;
        }
        return {
          planTitle: plan?.title || 'Unknown Plan',
          minutes,
        };
      });
  }, [selectedDate, planStatusResults, planResults]);

  return (
    <View className="mb-6">
      <Calendar
        markingType={'custom'}
        markedDates={getMarkedDates(studyMinutesByDate)}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
        }}
        firstDay={1}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        dayComponent={({ date }) => {
          if (!date) return null;
          const minutes = studyMinutesByDate[date.dateString];
          return (
            <TouchableOpacity onPress={() => setSelectedDate(date.dateString)}>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: minutes > 0 ? '#2563eb' : '#9ca3af', fontWeight: 'bold' }}>
                  {date.day}
                </Text>
                {minutes > 0 && (
                  <Text style={{ fontSize: 10, color: '#2563eb' }}>
                    {minutes < 60
                      ? `${minutes} min`
                      : Number.isInteger(minutes / 60)
                        ? `${minutes / 60} h`
                        : `${(minutes / 60).toFixed(2).replace(/\.00$/, '')} h`}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
      {/* Modal for plan details on selected date */}
      <Modal
        visible={!!selectedDate}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDate(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDate && humanReadableDate(selectedDate)}</Text>
            {plansForSelectedDate.length === 0 ? (
              <Text style={styles.noDataText}>No study sessions for this date.</Text>
            ) : (
              <FlatList
                data={plansForSelectedDate}
                keyExtractor={(_, idx) => idx.toString()}
                renderItem={({ item }) => (
                  <View style={styles.planRow}>
                    <Text style={styles.planTitle}>{item.planTitle}</Text>
                    <Text style={styles.planMinutes}>
                      {item.minutes < 60
                        ? `${item.minutes} min`
                        : Number.isInteger(item.minutes / 60)
                          ? `${item.minutes / 60} h`
                          : `${(item.minutes / 60).toFixed(2).replace(/\.00$/, '')} h`}
                    </Text>
                  </View>
                )}
              />
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedDate(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    width: '85%',
    maxHeight: '70%',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 14,
    textAlign: 'center',
  },
  noDataText: {
    color: '#64748b',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 18,
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  planTitle: {
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '600',
  },
  planMinutes: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  closeBtn: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default StudyCalendar;
