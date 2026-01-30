import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingStep, SelfPortrait, RelationalFoundation } from '@/types';

interface OnboardingState {
  // Current step tracking
  currentStep: OnboardingStep;

  // Draft data (before saving to server)
  selfPortraitDraft: Partial<SelfPortrait>;
  relationalFoundationDraft: Partial<RelationalFoundation>;

  // Actions
  setCurrentStep: (step: OnboardingStep) => void;
  updateSelfPortrait: (data: Partial<SelfPortrait>) => void;
  updateRelationalFoundation: (data: Partial<RelationalFoundation>) => void;
  clearDraft: () => void;
  reset: () => void;
}

const initialState = {
  currentStep: 'not_started' as OnboardingStep,
  selfPortraitDraft: {},
  relationalFoundationDraft: {},
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    set => ({
      ...initialState,

      setCurrentStep: step => set({ currentStep: step }),

      updateSelfPortrait: data =>
        set(state => ({
          selfPortraitDraft: {
            ...state.selfPortraitDraft,
            ...data,
            lastUpdated: new Date().toISOString(),
          },
        })),

      updateRelationalFoundation: data =>
        set(state => ({
          relationalFoundationDraft: {
            ...state.relationalFoundationDraft,
            ...data,
            lastUpdated: new Date().toISOString(),
          },
        })),

      clearDraft: () =>
        set({
          selfPortraitDraft: {},
          relationalFoundationDraft: {},
        }),

      reset: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
