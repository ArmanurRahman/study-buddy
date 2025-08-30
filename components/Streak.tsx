import { View, Text } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const getStreakLevel = (streak: number) => {
  if (streak >= 30) {
    return { iconLib: 'FontAwesome5', icon: 'crown', color: '#ff5722', label: 'Legend' };
  } else if (streak >= 15) {
    return { iconLib: 'MaterialCommunityIcons', icon: 'trophy', color: '#ff9800', label: 'Master' };
  } else if (streak >= 10) {
    return { iconLib: 'Ionicons', icon: 'flame', color: '#ffc107', label: 'Pro' };
  } else if (streak >= 5) {
    return { iconLib: 'MaterialCommunityIcons', icon: 'rocket', color: '#ffb300', label: 'Rising' };
  } else if (streak >= 1) {
    return { iconLib: 'MaterialCommunityIcons', icon: 'fire', color: '#bdbdbd', label: 'Starter' };
  } else {
    return {
      iconLib: 'MaterialCommunityIcons',
      icon: 'fire-off',
      color: '#e0e0e0',
      label: 'No Streak',
    };
  }
};

const Streak = ({ streak }: { streak: number }) => {
  const { iconLib, icon, color, label } = getStreakLevel(streak);

  let IconComponent;
  if (iconLib === 'FontAwesome5') IconComponent = FontAwesome5;
  else if (iconLib === 'Ionicons') IconComponent = Ionicons;
  else IconComponent = MaterialCommunityIcons;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <IconComponent name={icon as any} size={22} color={color} />
      <Text style={{ marginLeft: 6, fontWeight: 'bold', color }}>
        {streak} day{streak !== 1 ? 's' : ''} {label !== 'No Streak' ? `· ${label}` : ''}
      </Text>
    </View>
  );
};

export default Streak;
