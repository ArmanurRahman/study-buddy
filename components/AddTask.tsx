import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import Realm from 'realm';

import Input from 'components/Input';
import DateTime from 'components/DateTime';
import Clock from './Clock';
import Frequency from './Frequency';
import TaskSchema from '../schema/Task';
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

  console.log('Editing task:', editTask);
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
    if (!title) {
      Alert.alert('Validation', 'Title is required');
      return;
    }
    const realm = await Realm.open({ schema: realmSchemas });
    try {
      realm.write(() => {
        if (editTask && editTask.id) {
          // Update existing task
          const task = realm.objectForPrimaryKey('Task', new Realm.BSON.ObjectId(editTask.id));
          if (task) {
            task.title = title;
            task.description = description;
            task.startDate = startDate;
            task.endDate = endDate;
            task.duration = `${duration.hours || '0'}h ${duration.minutes || '0'}m`;
            task.frequency = JSON.stringify(frequency);
          }
          Alert.alert('Success', 'Task updated!');
        } else {
          // Create new task
          realm.create('Task', {
            _id: new Realm.BSON.ObjectId(),
            title,
            description,
            startDate,
            endDate,
            duration: `${duration.hours || '0'}h ${duration.minutes || '0'}m`,
            frequency: JSON.stringify(frequency),
            streak: 0,
            createdAt: new Date(),
          });
          Alert.alert('Success', 'Task added!');
        }
      });
      onClose();
    } catch (e) {
      console.error('Error saving task:', e);
      Alert.alert('Error', 'Could not save task.');
    } finally {
      realm.close();
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-black/50"
      style={{ width: '100%', height: '100%' }}>
      <View className="max-w-4/5 flex w-4/5 items-center gap-4 rounded-lg bg-white p-6 shadow-lg">
        <TouchableOpacity
          className="absolute right-4 top-4"
          onPress={() => onClose(true)}
          activeOpacity={0.7}>
          <Text className="text-2xl font-bold text-gray-600">X</Text>
        </TouchableOpacity>
        <Text className="mb-4 text-lg font-bold">{editTask ? 'Edit Task' : 'Add New Task'}</Text>
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

        {/* Clock Component for Duration */}
        <Clock value={duration} onChange={setDuration} />

        {/* Frequency Input */}
        <Frequency value={frequency} onChange={setFrequency} />

        <TouchableOpacity className="mt-2 w-full rounded bg-blue-600 p-2" onPress={handleAddTask}>
          <Text className="text-center text-white">{editTask ? 'Update Task' : 'Add Task'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddTask;
