import '../global.css';
import { useEffect } from 'react';
import { Stack, router, Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { queryClient } from '@/lib/utils/query-client';
import { getSupabase } from '@/lib/neon/client';
import { useAuthStore } from '@/hooks/use-auth-store';
import { GlobalSnackbar } from '@/components/ui';
import { lightTheme } from '@/lib/theme';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setSession, setUser, setLoading, setSessionExpired, isAuthenticated } = useAuthStore();

  const [fontsLoaded] = useFonts({
    'Merriweather-Regular': require('../assets/fonts/Merriweather-Regular.ttf'),
    'Merriweather-Bold': require('../assets/fonts/Merriweather-Bold.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
  });

  useEffect(() => {
    // Check initial session
    getSupabase()
      .auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        if (fontsLoaded) SplashScreen.hideAsync();
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

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  // Force light theme — our warm design system is optimized for light mode
  const theme = lightTheme;

  if (!fontsLoaded) return null;

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
        <StatusBar style="dark" />
        <GlobalSnackbar />
      </PaperProvider>
    </QueryClientProvider>
  );
}
