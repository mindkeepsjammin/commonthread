import { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, useTheme, Chip } from 'react-native-paper';
import { router, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUpdateOnboarding } from '@/hooks/use-onboarding';
import { useOnboardingStore } from '@/hooks/use-onboarding-store';
import {
  OnboardingProgress,
  PhilosophyBanner,
  JournalPrompt,
  ValueChip,
  SkipLink,
} from '@/components/onboarding';
import type { SelfPortrait } from '@/types';

const SEASONS = [
  { value: 'growth', label: 'Growth' },
  { value: 'rest', label: 'Rest' },
  { value: 'transition', label: 'Transition' },
  { value: 'healing', label: 'Healing' },
  { value: 'exploration', label: 'Exploration' },
];

const COMMON_VALUES = [
  'Family',
  'Honesty',
  'Creativity',
  'Adventure',
  'Security',
  'Freedom',
  'Connection',
  'Growth',
  'Peace',
  'Service',
  'Joy',
  'Learning',
];

const CONNECTION_STYLES = [
  'Quality time',
  'Deep conversations',
  'Shared activities',
  'Acts of service',
  'Physical presence',
  'Written communication',
  'Regular check-ins',
  'Spontaneous moments',
];

export default function SelfPortraitScreen() {
  const theme = useTheme();
  const updateOnboarding = useUpdateOnboarding();
  const { selfPortraitDraft, updateSelfPortrait } = useOnboardingStore();

  const [portrait, setPortrait] = useState<Partial<SelfPortrait>>({
    howIDescribeMyself: '',
    currentSeason: '',
    whatFeelsImportantNow: '',
    valuesIHoldClose: [],
    whatGivesMeEnergy: '',
    howILikeToConnect: [],
    ...selfPortraitDraft,
  });

  // Save draft on changes
  useEffect(() => {
    updateSelfPortrait(portrait);
  }, [portrait]);

  const handleChange = (field: keyof SelfPortrait, value: string | string[]) => {
    setPortrait(prev => ({ ...prev, [field]: value }));
  };

  const toggleValue = (value: string) => {
    const current = portrait.valuesIHoldClose || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleChange('valuesIHoldClose', updated);
  };

  const toggleConnectionStyle = (value: string) => {
    const current = portrait.howILikeToConnect || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleChange('howILikeToConnect', updated);
  };

  const handleContinue = async () => {
    await updateOnboarding.mutateAsync({
      step: 'family_preview',
      selfPortrait: portrait,
    });
    router.push('/(onboarding)/family-preview' as Href);
  };

  const handleSkip = async () => {
    await updateOnboarding.mutateAsync({ step: 'family_preview' });
    router.push('/(onboarding)/family-preview' as Href);
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <OnboardingProgress currentStep="self_portrait" />

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <PhilosophyBanner
          title="A Living Self-Portrait — Not a Diagnosis"
          messages={[
            'This profile is a snapshot in time.',
            'You are allowed to change, contradict, or leave sections blank.',
            'You are the primary authority on your lived experience.',
          ]}
        />

        <JournalPrompt
          label="How would you describe yourself right now?"
          hint="There's no right answer — just what feels true today."
          value={portrait.howIDescribeMyself || ''}
          onChangeText={(text) => handleChange('howIDescribeMyself', text)}
          placeholder="I am someone who..."
        />

        <View className="mb-6">
          <Text variant="titleSmall" className="mb-2" style={{ color: theme.colors.onBackground }}>
            What season of life are you in?
          </Text>
          <View className="flex-row flex-wrap">
            {SEASONS.map((season) => (
              <Chip
                key={season.value}
                mode={portrait.currentSeason === season.value ? 'flat' : 'outlined'}
                selected={portrait.currentSeason === season.value}
                onPress={() => handleChange('currentSeason', season.value)}
                className="m-1"
                style={{
                  backgroundColor:
                    portrait.currentSeason === season.value
                      ? theme.colors.primaryContainer
                      : 'transparent',
                }}
              >
                {season.label}
              </Chip>
            ))}
          </View>
        </View>

        <JournalPrompt
          label="What feels important to you right now?"
          hint="What's on your heart? What matters most in this moment?"
          value={portrait.whatFeelsImportantNow || ''}
          onChangeText={(text) => handleChange('whatFeelsImportantNow', text)}
          placeholder="Right now, what matters most is..."
        />

        <View className="mb-6">
          <Text variant="titleSmall" className="mb-2" style={{ color: theme.colors.onBackground }}>
            Values you hold close
          </Text>
          <Text
            variant="bodySmall"
            className="mb-2"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Select any that resonate with you
          </Text>
          <View className="flex-row flex-wrap">
            {COMMON_VALUES.map((value) => (
              <ValueChip
                key={value}
                label={value}
                selected={(portrait.valuesIHoldClose || []).includes(value)}
                onPress={() => toggleValue(value)}
              />
            ))}
          </View>
        </View>

        <JournalPrompt
          label="What gives you energy?"
          hint="Activities, people, places, or moments that light you up"
          value={portrait.whatGivesMeEnergy || ''}
          onChangeText={(text) => handleChange('whatGivesMeEnergy', text)}
          placeholder="I feel most energized when..."
          numberOfLines={3}
        />

        <View className="mb-6">
          <Text variant="titleSmall" className="mb-2" style={{ color: theme.colors.onBackground }}>
            How do you like to connect?
          </Text>
          <Text
            variant="bodySmall"
            className="mb-2"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            How do you prefer to show up in relationships?
          </Text>
          <View className="flex-row flex-wrap">
            {CONNECTION_STYLES.map((style) => (
              <ValueChip
                key={style}
                label={style}
                selected={(portrait.howILikeToConnect || []).includes(style)}
                onPress={() => toggleConnectionStyle(style)}
              />
            ))}
          </View>
        </View>

        <View className="items-center mt-4">
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
