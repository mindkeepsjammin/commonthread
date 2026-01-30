import '../global.css';
import { useEffect } from 'react';
import { Stack, router, Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';
import { useColorScheme } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '@/lib/utils/query-client';
import { getSupabase } from '@/lib/neon/client';
import { useAuthStore } from '@/hooks/use-auth-store';
import { GlobalSnackbar } from '@/components/ui';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { setSession, setUser, setLoading, setSessionExpired, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Check initial session
    getSupabase().auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      SplashScreen.hideAsync();
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = getSupabase().auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (_event === 'PASSWORD_RECOVERY') {
        router.push('/(auth)/reset-password' as Href);
      }

      // Detect unexpected sign-out (session expiry)
      if (_event === 'SIGNED_OUT' && isAuthenticated) {
        setSessionExpired(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession, setUser, setLoading, setSessionExpired, isAuthenticated]);

  const theme = colorScheme === 'dark' ? MD3DarkTheme : MD3LightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="relationship/[id]"
            options={{
              headerShown: true,
              title: 'Relationship',
              presentation: 'card',
            }}
          />
          <Stack.Screen name="research" options={{ headerShown: false }} />
          <Stack.Screen
            name="settings/change-password"
            options={{ headerShown: true, title: 'Change Password', presentation: 'card' }}
          />
          <Stack.Screen
            name="settings/change-email"
            options={{ headerShown: true, title: 'Change Email', presentation: 'card' }}
          />
          <Stack.Screen
            name="settings/delete-account"
            options={{ headerShown: true, title: 'Delete Account', presentation: 'card' }}
          />
        </Stack>
        <StatusBar style="auto" />
        <GlobalSnackbar />
      </PaperProvider>
    </QueryClientProvider>
  );
}
