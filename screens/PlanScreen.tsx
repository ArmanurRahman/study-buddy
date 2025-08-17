import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PlanScreen = () => {
  const navigation = useNavigation();
  const title = 'Study Plan';
  const description = 'This is a plan for studying.';
  const handleEdit = () => {
    // Logic to edit the study plan
  };

  const handleDelete = () => {
    // Logic to delete the study plan
  };

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold">{title}</Text>
      <Text className="mt-2 text-lg">{description}</Text>
      <View className="mt-4 flex-row">
        <Button title="Edit" onPress={handleEdit} />
        <Button title="Delete" onPress={handleDelete} />
      </View>
    </View>
  );
};

export default PlanScreen;
