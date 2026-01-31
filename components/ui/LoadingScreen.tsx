import { View, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50">
      <ActivityIndicator size="large" />
      {message && (
        <Text variant="bodyMedium" className="mt-4 text-neutral-500">
          {message}
        </Text>
      )}
    </View>
  );
}
