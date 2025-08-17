import { View, Text, TextInput } from 'react-native';

const Input = ({
  value,
  onChange,
  label,
  secureTextEntry,
}: {
  value: string;
  onChange: (text: string) => void;
  label: string;
  secureTextEntry?: boolean;
}) => {
  return (
    <View className="w-full">
      <Text className="mb-2">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={secureTextEntry}
        className="rounded-lg border border-gray-300 p-4 shadow-sm"
      />
    </View>
  );
};

export default Input;
