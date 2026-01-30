import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useProfile } from '@/hooks/use-profile';

export default function OnboardingLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (isLoading || profileLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Not authenticated - go to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // No profile yet - stay in onboarding (will create profile)
  // Profile exists and onboarding completed - go to main app
  if (profile?.onboardingStep === 'completed') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="self-portrait" />
      <Stack.Screen name="family-preview" />
      <Stack.Screen name="relational-foundation" />
    </Stack>
  );
}
