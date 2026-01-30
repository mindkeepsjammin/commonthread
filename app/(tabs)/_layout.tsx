import { Redirect, Tabs, Href } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/hooks/use-auth-store';
import { useProfile } from '@/hooks/use-profile';
import { getOnboardingRoute } from '@/hooks/use-onboarding';

export default function TabsLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const theme = useTheme();

  if (isLoading || profileLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // If no profile exists, redirect to onboarding
  if (!profile) {
    return <Redirect href={'/(onboarding)/welcome' as Href} />;
  }

  // If onboarding not completed, redirect to current step
  if (profile.onboardingStep !== 'completed') {
    const route = getOnboardingRoute(profile.onboardingStep);
    return <Redirect href={route as Href} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: 'Reflect',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="notebook-edit" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alder-wyn"
        options={{
          title: 'Alder Wyn',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat-processing" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="family"
        options={{
          title: 'Family',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
