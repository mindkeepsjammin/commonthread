import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text variant="headlineMedium" className="mb-4">
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Button mode="contained">Go to home screen</Button>
        </Link>
      </View>
    </>
  );
}
