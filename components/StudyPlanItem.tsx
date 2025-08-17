import React from 'react';
import { View, Text } from 'react-native';

interface StudyPlanItemProps {
  title: string;
  description: string;
}

const StudyPlanItem: React.FC<StudyPlanItemProps> = ({ title, description }) => {
  return (
    <View className="border-b border-gray-200 p-4">
      <Text className="text-lg font-bold">{title}</Text>
      <Text className="text-gray-600">{description}</Text>
    </View>
  );
};

export default StudyPlanItem;
