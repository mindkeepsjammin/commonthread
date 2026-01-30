import { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { router, Href } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompleteOnboarding, useUpdateOnboarding } from '@/hooks/use-onboarding';
import { useOnboardingStore } from '@/hooks/use-onboarding-store';
import {
  OnboardingProgress,
  PhilosophyBanner,
  JournalPrompt,
  ValueChip,
  ImportantPersonCard,
  SkipLink,
} from '@/components/onboarding';
import type { RelationalFoundation, ImportantPerson } from '@/types';

const RELATIONSHIP_STRENGTHS = [
  'Good listener',
  'Emotionally available',
  'Reliable',
  'Playful',
  'Supportive',
  'Honest',
  'Patient',
  'Encouraging',
  'Present',
  'Forgiving',
  'Flexible',
  'Thoughtful',
];

export default function RelationalFoundationScreen() {
  const theme = useTheme();
  const updateOnboarding = useUpdateOnboarding();
  const completeOnboarding = useCompleteOnboarding();
  const { relationalFoundationDraft, updateRelationalFoundation, clearDraft } = useOnboardingStore();

  const [foundation, setFoundation] = useState<Partial<RelationalFoundation>>({
    importantPeople: [],
    howIShowCare: '',
    whatConnectionMeansToMe: '',
    relationshipStrengths: [],
    areasOfGrowth: [],
    ...relationalFoundationDraft,
  });

  // Save draft on changes
  useEffect(() => {
    updateRelationalFoundation(foundation);
  }, [foundation]);

  const handleChange = (field: keyof RelationalFoundation, value: string | string[] | ImportantPerson[]) => {
    setFoundation(prev => ({ ...prev, [field]: value }));
  };

  const toggleStrength = (value: string) => {
    const current = foundation.relationshipStrengths || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    handleChange('relationshipStrengths', updated);
  };

  const addPerson = () => {
    const current = foundation.importantPeople || [];
    handleChange('importantPeople', [...current, { name: '', relationship: '', whatTheyMean: '' }]);
  };

  const updatePerson = (index: number, person: ImportantPerson) => {
    const current = [...(foundation.importantPeople || [])];
    current[index] = person;
    handleChange('importantPeople', current);
  };

  const removePerson = (index: number) => {
    const current = [...(foundation.importantPeople || [])];
    current.splice(index, 1);
    handleChange('importantPeople', current);
  };

  const handleComplete = async () => {
    // Save the relational foundation data
    await updateOnboarding.mutateAsync({
      relationalFoundation: foundation,
    });
    // Mark onboarding as complete
    await completeOnboarding.mutateAsync();
    clearDraft();
    router.replace('/(tabs)' as Href);
  };

  const handleSkip = async () => {
    await completeOnboarding.mutateAsync();
    clearDraft();
    router.replace('/(tabs)' as Href);
  };

  const isPending = updateOnboarding.isPending || completeOnboarding.isPending;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <OnboardingProgress currentStep="relational_foundation" />

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <PhilosophyBanner
          title="Relational Foundation"
          messages={[
            'Who matters to you, and how do you show up for them?',
            'There are no right answers — only your truth.',
          ]}
        />

        <View className="mb-6">
          <Text variant="titleSmall" className="mb-2">
            Important people in your life
          </Text>
          <Text
            variant="bodySmall"
            className="mb-3"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            Add anyone who comes to mind — family, friends, mentors, or anyone meaningful to you
          </Text>

          {(foundation.importantPeople || []).map((person, index) => (
            <ImportantPersonCard
              key={index}
              person={person}
              index={index}
              onUpdate={updatePerson}
              onRemove={removePerson}
            />
          ))}

          <Button
            mode="outlined"
            onPress={addPerson}
            icon="plus"
            className="mb-4"
          >
            Add a person
          </Button>
        </View>

        <JournalPrompt
          label="How do you typically show care?"
          hint="What does it look like when you're being there for someone?"
          value={foundation.howIShowCare || ''}
          onChangeText={(text) => handleChange('howIShowCare', text)}
          placeholder="When I care about someone, I..."
        />

        <JournalPrompt
          label="What does meaningful connection look like for you?"
          hint="What makes a relationship feel real and valuable?"
          value={foundation.whatConnectionMeansToMe || ''}
          onChangeText={(text) => handleChange('whatConnectionMeansToMe', text)}
          placeholder="I feel truly connected when..."
        />

        <View className="mb-6">
          <Text variant="titleSmall" className="mb-2">
            Relationship strengths you're proud of
          </Text>
          <Text
            variant="bodySmall"
            className="mb-2"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            What do you bring to your relationships?
          </Text>
          <View className="flex-row flex-wrap">
            {RELATIONSHIP_STRENGTHS.map((strength) => (
              <ValueChip
                key={strength}
                label={strength}
                selected={(foundation.relationshipStrengths || []).includes(strength)}
                onPress={() => toggleStrength(strength)}
              />
            ))}
          </View>
        </View>

        <View
          className="p-4 rounded-xl mb-6"
          style={{ backgroundColor: theme.colors.primaryContainer }}
        >
          <Text
            variant="bodyMedium"
            className="text-center"
            style={{ color: theme.colors.onPrimaryContainer }}
          >
            You're ready to explore Common Thread. Your family map and Alder Wyn await!
          </Text>
        </View>

        <View className="items-center mt-2">
          <Button
            mode="contained"
            onPress={handleComplete}
            loading={isPending}
            disabled={isPending}
            className="w-full mb-3"
            contentStyle={{ paddingVertical: 8 }}
          >
            Start Exploring
          </Button>

          <SkipLink onSkip={handleSkip} label="Skip and explore" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
