import { View, ScrollView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { router, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpdateOnboarding } from '@/hooks/use-onboarding';
import {
  OnboardingProgress,
  FeaturePreviewCard,
  SkipLink,
} from '@/components/onboarding';

export default function FamilyPreviewScreen() {
  const theme = useTheme();
  const updateOnboarding = useUpdateOnboarding();

  const handleContinue = async () => {
    await updateOnboarding.mutateAsync({ step: 'relational_foundation' });
    router.push('/(onboarding)/relational-foundation' as Href);
  };

  const handleSkip = async () => {
    await updateOnboarding.mutateAsync({ step: 'relational_foundation' });
    router.push('/(onboarding)/relational-foundation' as Href);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <OnboardingProgress currentStep="family_preview" />

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-6">
          <Text variant="headlineMedium" className="text-center mb-2" style={{ color: theme.colors.onBackground }}>
            Your Family Map Awaits
          </Text>
          <Text
            variant="bodyLarge"
            className="text-center"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Discover what becomes possible when you map your connections
          </Text>
        </View>

        <FeaturePreviewCard
          icon="heart-multiple"
          title="Track Relationship Health"
          description="See the vitality of each connection at a glance. Know when relationships need attention before they drift."
        />

        <FeaturePreviewCard
          icon="connection"
          title="Discover Common Threads"
          description="Uncover shared values, experiences, and patterns that weave your family together."
        />

        <FeaturePreviewCard
          icon="notebook-edit"
          title="Share Reflections"
          description="Choose what to share with whom. Some thoughts are personal, others bring you closer together."
        />

        <FeaturePreviewCard
          icon="chat-processing"
          title="Guided by Alder Wyn"
          description="Your AI companion helps you reflect, communicate, and grow — both individually and as a family."
        />

        <FeaturePreviewCard
          icon="account-group"
          title="Invite Your Family"
          description="When you're ready, bring in the people who matter. Each person brings their own perspective to the map."
        />

        <View
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        >
          <Text
            variant="bodyMedium"
            className="text-center italic"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            "The family invite will come later — after you've had a chance to explore and feel supported by the app."
          </Text>
        </View>

        <View className="items-center mt-2">
          <Button
            mode="contained"
            onPress={handleContinue}
            loading={updateOnboarding.isPending}
            disabled={updateOnboarding.isPending}
            className="w-full mb-3"
            contentStyle={{ paddingVertical: 8 }}
          >
            Continue
          </Button>

          <SkipLink onSkip={handleSkip} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
