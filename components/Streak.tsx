import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Streak = ({ streak }: { streak: number }) => {
  return (
    <View className="flex-row items-center">
      <MaterialCommunityIcons
        name={streak >= 10 ? 'fire' : streak >= 5 ? 'fire-alert' : 'fire-off'}
        size={22}
        color={streak >= 10 ? '#ff9800' : streak >= 5 ? '#ffb300' : '#bdbdbd'}
      />
      <Text className="ml-1 text-base font-semibold text-orange-500">
        {streak} day{streak !== 1 ? 's' : ''}
      </Text>
    </View>
  );
};
export default Streak;
