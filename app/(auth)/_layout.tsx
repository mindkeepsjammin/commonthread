import { Redirect, Stack, Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useProfile } from '@/hooks/use-profile';
import { getOnboardingRoute } from '@/hooks/use-onboarding';

export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();

  if (isLoading || (isAuthenticated && profileLoading)) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // If authenticated, check email verification, profile, and onboarding status
  if (isAuthenticated) {
    // Email not verified - stay on verify-email screen
    if (user && !user.email_confirmed_at) {
      return (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="verify-email" />
        </Stack>
      );
    }

    // No profile yet - go to onboarding (will create profile there)
    if (!profile) {
      return <Redirect href={'/(onboarding)/welcome' as Href} />;
    }

    // Profile exists but onboarding not completed - go to current step
    if (profile.onboardingStep !== 'completed') {
      const route = getOnboardingRoute(profile.onboardingStep);
      return <Redirect href={route as Href} />;
    }

    // Onboarding completed - go to main app
    return <Redirect href={'/(tabs)' as Href} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password-sent" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
