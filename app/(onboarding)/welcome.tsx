import { View, ScrollView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { router, Href } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpdateOnboarding } from '@/hooks/use-onboarding';
import { SkipLink } from '@/components/onboarding';

export default function WelcomeScreen() {
  const theme = useTheme();
  const updateOnboarding = useUpdateOnboarding();

  const handleBegin = async () => {
    await updateOnboarding.mutateAsync({ step: 'self_portrait' });
    router.push('/(onboarding)/self-portrait' as Href);
  };

  const handleSkipAll = async () => {
    await updateOnboarding.mutateAsync({ step: 'completed' });
    router.replace('/(tabs)' as Href);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
      >
        <View className="items-center mb-8">
          <View
            className="p-6 rounded-full mb-6"
            style={{ backgroundColor: theme.colors.primaryContainer }}
          >
            <MaterialCommunityIcons
              name="heart-multiple"
              size={64}
              color={theme.colors.primary}
            />
          </View>

          <Text variant="headlineLarge" className="text-center mb-4">
            Welcome to Common Thread
          </Text>

          <Text
            variant="bodyLarge"
            className="text-center mb-6"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            A space for you and the people who matter to you
          </Text>
        </View>

        <View className="mb-8">
          <View className="flex-row items-center mb-4 px-4">
            <MaterialCommunityIcons
              name="account-heart"
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" className="ml-3 flex-1">
              Create your living self-portrait — a snapshot of who you are right now
            </Text>
          </View>

          <View className="flex-row items-center mb-4 px-4">
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" className="ml-3 flex-1">
              Map your relationships and discover common threads
            </Text>
          </View>

          <View className="flex-row items-center mb-4 px-4">
            <MaterialCommunityIcons
              name="chat-processing"
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="bodyMedium" className="ml-3 flex-1">
              Meet Alder Wyn, your companion for reflection and growth
            </Text>
          </View>
        </View>

        <View className="items-center">
          <Button
            mode="contained"
            onPress={handleBegin}
            loading={updateOnboarding.isPending}
            disabled={updateOnboarding.isPending}
            className="w-full mb-4"
            contentStyle={{ paddingVertical: 8 }}
          >
            Begin Your Journey
          </Button>

          <SkipLink onSkip={handleSkipAll} label="Skip onboarding" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
