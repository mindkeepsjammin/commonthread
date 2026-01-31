import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';
import { useOnboardingStore } from './use-onboarding-store';
import type { OnboardingStep, SelfPortrait, RelationalFoundation } from '@/types';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const PROFILE_QUERY_KEY = ['profile'];

interface UpdateOnboardingParams {
  step?: OnboardingStep;
  selfPortrait?: Partial<SelfPortrait>;
  relationalFoundation?: Partial<RelationalFoundation>;
}

export function useUpdateOnboarding() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { setCurrentStep } = useOnboardingStore();

  return useMutation({
    mutationFn: async (params: UpdateOnboardingParams) => {
      if (!user?.id) throw new Error('Not authenticated');

      const now = new Date().toISOString();

      // Ensure profile exists (no DB trigger to auto-create on signup)
      await getSql()`
        INSERT INTO profiles (id, display_name)
        VALUES (${user.id}, 'New User')
        ON CONFLICT (id) DO NOTHING
      `;

      // Handle self portrait update with merge
      if (params.selfPortrait) {
        const currentResult = await getSql()`
          SELECT self_portrait FROM profiles WHERE id = ${user.id}
        `;
        const existingPortrait = (currentResult[0]?.self_portrait as Record<string, unknown>) || {};
        const mergedPortrait = {
          ...existingPortrait,
          ...params.selfPortrait,
          lastUpdated: now,
        };

        await getSql()`
          UPDATE profiles SET
            self_portrait = ${JSON.stringify(mergedPortrait)}::jsonb,
            updated_at = ${now}
          WHERE id = ${user.id}
        `;
      }

      // Handle relational foundation update with merge
      if (params.relationalFoundation) {
        const currentResult = await getSql()`
          SELECT relational_foundation FROM profiles WHERE id = ${user.id}
        `;
        const existingFoundation = (currentResult[0]?.relational_foundation as Record<string, unknown>) || {};
        const mergedFoundation = {
          ...existingFoundation,
          ...params.relationalFoundation,
          lastUpdated: now,
        };

        await getSql()`
          UPDATE profiles SET
            relational_foundation = ${JSON.stringify(mergedFoundation)}::jsonb,
            updated_at = ${now}
          WHERE id = ${user.id}
        `;
      }

      // Handle step update
      if (params.step) {
        await getSql()`
          UPDATE profiles SET
            onboarding_step = ${params.step},
            updated_at = ${now}
          WHERE id = ${user.id}
        `;
      }

      // Fetch and return updated profile
      const result = await getSql()`
        SELECT * FROM profiles WHERE id = ${user.id}
      `;

      if (!result || result.length === 0) {
        throw new Error('Failed to update onboarding');
      }

      return result[0] as ProfileRow;
    },
    onSuccess: (_data, params) => {
      // Update local store
      if (params.step) {
        setCurrentStep(params.step);
      }

      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: [...PROFILE_QUERY_KEY, user?.id] });
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { setCurrentStep, clearDraft } = useOnboardingStore();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');

      const now = new Date().toISOString();

      const result = await getSql()`
        UPDATE profiles SET
          onboarding_step = 'completed',
          onboarding_completed_at = ${now},
          updated_at = ${now}
        WHERE id = ${user.id}
        RETURNING *
      `;

      if (!result || result.length === 0) {
        throw new Error('Failed to complete onboarding');
      }

      return result[0] as ProfileRow;
    },
    onSuccess: () => {
      // Update local store
      setCurrentStep('completed');
      clearDraft();

      // Invalidate profile query to refetch
      queryClient.invalidateQueries({ queryKey: [...PROFILE_QUERY_KEY, user?.id] });
    },
  });
}

// Helper hook to get the next onboarding step
export function getNextOnboardingStep(currentStep: OnboardingStep): OnboardingStep {
  const stepOrder: OnboardingStep[] = [
    'not_started',
    'welcome',
    'self_portrait',
    'family_preview',
    'relational_foundation',
    'completed',
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return 'completed';
  }

  return stepOrder[currentIndex + 1];
}

// Helper to get the route for a given step
export function getOnboardingRoute(step: OnboardingStep): string {
  const stepRoutes: Record<OnboardingStep, string> = {
    not_started: '/(onboarding)/welcome',
    welcome: '/(onboarding)/welcome',
    self_portrait: '/(onboarding)/self-portrait',
    family_preview: '/(onboarding)/family-preview',
    relational_foundation: '/(onboarding)/relational-foundation',
    completed: '/(tabs)',
  };

  return stepRoutes[step];
}
