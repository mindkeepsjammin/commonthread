import { View, Text, Pressable } from 'react-native';

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  error?: string;
}

export const ConsentCheckbox = ({
  checked,
  onChange,
  label,
  error,
}: ConsentCheckboxProps) => {
  return (
    <View className="mb-6">
      <Pressable
        onPress={() => onChange(!checked)}
        className="flex-row items-start"
      >
        <View
          className={`w-6 h-6 rounded border-2 mr-3 items-center justify-center mt-0.5 ${
            checked ? 'border-primary-500 bg-primary-500' : 'border-neutral-300 bg-white'
          }`}
        >
          {checked && <Text className="text-white text-sm font-bold">✓</Text>}
        </View>
        <Text className="flex-1 text-base text-neutral-700">{label}</Text>
      </Pressable>
      {error && <Text className="text-red-500 text-sm mt-2 ml-9">{error}</Text>}
    </View>
  );
};
