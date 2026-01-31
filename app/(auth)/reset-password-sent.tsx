import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { Link, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

export default function ResetPasswordSentScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const theme = useTheme();

  return (
    <View className="flex-1 justify-center p-6">
      <View className="items-center mb-6">
        <MaterialCommunityIcons
          name="email-check-outline"
          size={64}
          color={theme.colors.primary}
        />
      </View>

      <Text variant="headlineLarge" className="mb-2 text-center">
        Check Your Email
      </Text>
      <Text variant="bodyLarge" className="mb-2 text-center text-neutral-500">
        We've sent a password reset link to:
      </Text>
      {email && (
        <Text variant="bodyLarge" className="mb-8 text-center font-bold">
          {email}
        </Text>
      )}
      <Text variant="bodyMedium" className="mb-8 text-center text-neutral-400">
        If you don't see the email, check your spam folder.
      </Text>

      <Link href="/(auth)/login" asChild>
        <Button mode="contained">Back to Sign In</Button>
      </Link>
    </View>
  );
}
