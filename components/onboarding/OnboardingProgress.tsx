import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { OnboardingStep } from '@/types';

const STEPS: OnboardingStep[] = [
  'welcome',
  'self_portrait',
  'family_preview',
  'relational_foundation',
];

interface OnboardingProgressProps {
  currentStep: OnboardingStep;
}

export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const theme = useTheme();
  const currentIndex = STEPS.indexOf(currentStep);

  return (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <View
            key={step}
            className="h-2 rounded-full"
            style={{
              width: isCurrent ? 24 : 8,
              backgroundColor:
                isCompleted || isCurrent
                  ? theme.colors.primary
                  : theme.colors.surfaceVariant,
            }}
          />
        );
      })}
    </View>
  );
}
