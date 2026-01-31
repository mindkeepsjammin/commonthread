import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';

export default function NotFoundScreen() {
  const theme = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center p-5">
        <Text variant="headlineMedium" className="mb-4" style={{ color: theme.colors.onBackground }}>
          This screen doesn't exist.
        </Text>
        <Link href="/" asChild>
          <Button mode="contained">Go to home screen</Button>
        </Link>
      </View>
    </>
  );
}
