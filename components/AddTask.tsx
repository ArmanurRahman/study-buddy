import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Realm from 'realm';
import DateTimePicker from '@react-native-community/datetimepicker';

import Input from 'components/Input';
import DateTime from 'components/DateTime';
import Clock from './Clock';
import Frequency from './Frequency';
import { realmSchemas } from '../schema';

type AddTaskProps = {
  onClose: (isCloseOnly?: boolean) => void;
  editTask?: any | null;
};

const AddTask = ({ onClose, editTask }: AddTaskProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [frequency, setFrequency] = useState([false, false, false, false, false, false, false]);
  const [duration, setDuration] = useState({ hours: '', minutes: '' });
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [sendNotification, setSendNotification] = useState(false);

  // Prefill state if editing
  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title || '');
      setDescription(editTask.description || '');
      setStartDate(editTask.startDate ? new Date(editTask.startDate) : undefined);
      setEndDate(editTask.endDate ? new Date(editTask.endDate) : undefined);
      // Parse duration string like "1h 30m"
      if (editTask.duration) {
        const hMatch = editTask.duration.match(/(\d+)\s*h/);
        const mMatch = editTask.duration.match(/(\d+)\s*m/);
        setDuration({
          hours: hMatch ? hMatch[1] : '',
          minutes: mMatch ? mMatch[1] : '',
        });
      }
      if (editTask.startTime) {
        setStartTime(new Date(editTask.startTime));
      }
      setSendNotification(!!editTask.sendNotification);
      // Parse frequency (should be an array)
      if (editTask.frequency) {
        try {
          setFrequency(
            Array.isArray(editTask.frequency) ? editTask.frequency : JSON.parse(editTask.frequency)
          );
        } catch {
          setFrequency([false, false, false, false, false, false, false]);
        }
      }
    }
  }, [editTask]);

  // Save or update task in Realm database
  const handleAddTask = async () => {
    if (!title || (duration.hours === '' && duration.minutes === '')) {
      Alert.alert('Validation', 'Title and duration are required');
      return;
    }
    let realm: Realm | undefined;
    try {
      realm = await Realm.open({ schema: realmSchemas });
      realm.write(() => {
        if (editTask && editTask.id) {
          // Update existing task
          const task = realm?.objectForPrimaryKey('Task', new Realm.BSON.ObjectId(editTask.id));
          if (task) {
            task.title = title;
            task.description = description;
            task.startDate = startDate;
            task.endDate = endDate;
            task.duration = `${duration.hours || '0'}h ${duration.minutes || '0'}m`;
            task.frequency = JSON.stringify(frequency);
            task.startTime = startTime;
            task.sendNotification = sendNotification;
          }
          Alert.alert('Success', 'Task updated!');
        } else {
          // Create new task
          realm?.create('Task', {
            _id: new Realm.BSON.ObjectId(),
            title,
            description,
            startDate,
            endDate,
            startTime,
            duration: `${duration.hours || '0'}h ${duration.minutes || '0'}m`,
            frequency: JSON.stringify(frequency),
            streak: 0,
            createdAt: new Date(),
            sendNotification,
          });
          Alert.alert('Success', 'Task added!');
        }
      });

      onClose();
    } catch (e) {
      console.error('Error saving task:', e);
      Alert.alert('Error', 'Could not save task.');
    } finally {
      realm?.close();
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-black/50"
      style={{ width: '100%', height: '100%' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
        keyboardVerticalOffset={60}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}
          keyboardShouldPersistTaps="handled">
          <View
            className=" flex items-center gap-4 rounded-lg bg-white p-6 shadow-lg"
            style={{ width: '95%' }}>
            <TouchableOpacity
              className="absolute right-4 top-4"
              onPress={() => onClose(true)}
              activeOpacity={0.7}>
              <Text className="text-2xl font-bold text-gray-600">X</Text>
            </TouchableOpacity>
            <Text className="mb-4 text-lg font-bold">
              {editTask ? 'Edit Task' : 'Add New Task'}
            </Text>
            <Input label="Title" value={title} onChange={setTitle} />
            <View className="w-full">
              <Text className="mb-2">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                className="rounded-lg border border-gray-300 p-4 shadow-sm"
                multiline={true}
                style={{ minHeight: 80 }}
              />
            </View>

            {/* Start Date Picker */}
            <View className="w-full flex-row justify-between gap-2">
              <View className="min-w-36">
                <Text className="mb-2">Start Date</Text>
                <DateTime
                  date={startDate}
                  setDate={setStartDate}
                  showPicker={showStartPicker}
                  setShowPicker={setShowStartPicker}
                />
              </View>
              {/* End Date Picker */}
              <View className="min-w-36">
                <Text className="mb-2">End Date</Text>
                <DateTime
                  date={endDate}
                  setDate={setEndDate}
                  showPicker={showEndPicker}
                  setShowPicker={setShowEndPicker}
                />
              </View>
            </View>
            {/* --- Start Time Picker --- */}
            <View className="w-full flex-row justify-between gap-2">
              <View className="min-w-36">
                <Text className="mb-2">Start Time</Text>
                <TouchableOpacity
                  className="rounded-lg border border-gray-300 p-4 shadow-sm"
                  onPress={() => setShowStartTimePicker(true)}>
                  <Text>
                    {startTime
                      ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Select Start Time'}
                  </Text>
                </TouchableOpacity>
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startTime || new Date()}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(_, selectedTime) => {
                      setShowStartTimePicker(false);
                      if (selectedTime) setStartTime(selectedTime);
                    }}
                  />
                )}
              </View>
              <View className="min-w-36">
                {/* Clock Component for Duration */}
                <Clock value={duration} onChange={setDuration} />
              </View>
            </View>

            {/* Frequency Input */}
            <Frequency value={frequency} onChange={setFrequency} />
            {/* Notification Checkbox */}

            <TouchableOpacity
              className="mt-2 w-full rounded bg-blue-600 p-2"
              onPress={handleAddTask}>
              <Text className="text-center text-white">
                {editTask ? 'Update Task' : 'Add Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AddTask;
