import { Pressable, Text, ActivityIndicator } from 'react-native';

interface SubmitButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export const SubmitButton = ({
  onPress,
  loading = false,
  disabled = false,
  label = 'Submit Form',
}: SubmitButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`py-4 px-6 rounded-lg items-center justify-center flex-row ${
        isDisabled ? 'bg-neutral-300' : 'bg-primary-600 active:bg-primary-700'
      }`}
    >
      {loading && <ActivityIndicator color="white" className="mr-2" />}
      <Text
        className={`text-lg font-semibold ${
          isDisabled ? 'text-neutral-500' : 'text-white'
        }`}
      >
        {loading ? 'Submitting...' : label}
      </Text>
    </Pressable>
  );
};
