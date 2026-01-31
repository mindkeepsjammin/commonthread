import { useState } from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useAuthStore } from '@/hooks/use-auth-store';
import { resendVerification, signOut } from '@/lib/neon/auth';
import { queryClient } from '@/lib/utils/query-client';

export default function VerifyEmailScreen() {
  const theme = useTheme();
  const { user, reset } = useAuthStore();
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!user?.email) return;
    setIsResending(true);
    setError(null);

    const result = await resendVerification(user.email);

    if (result.error) {
      setError(result.error.message);
    } else {
      setResent(true);
    }
    setIsResending(false);
  };

  const handleSignOut = async () => {
    await signOut();
    queryClient.clear();
    reset();
  };

  return (
    <View className="flex-1 justify-center p-6">
      <View className="items-center mb-6">
        <MaterialCommunityIcons
          name="email-outline"
          size={64}
          color={theme.colors.primary}
        />
      </View>

      <Text variant="headlineLarge" className="mb-2 text-center">
        Verify Your Email
      </Text>
      <Text variant="bodyLarge" className="mb-2 text-center text-neutral-500">
        We've sent a verification link to:
      </Text>
      {user?.email && (
        <Text variant="bodyLarge" className="mb-8 text-center font-bold">
          {user.email}
        </Text>
      )}

      {error && (
        <View className="mb-4 rounded-lg bg-red-100 p-3">
          <Text className="text-red-700">{error}</Text>
        </View>
      )}

      {resent && (
        <View className="mb-4 rounded-lg bg-green-100 p-3">
          <Text className="text-green-700">Verification email resent.</Text>
        </View>
      )}

      <Button
        mode="contained"
        onPress={handleResend}
        loading={isResending}
        disabled={isResending}
        className="mb-4"
      >
        Resend Verification Email
      </Button>

      <Button mode="text" onPress={handleSignOut}>
        Sign out and use a different email
      </Button>
    </View>
  );
}
