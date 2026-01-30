-- Migration: Add onboarding fields to profiles table
-- Purpose: Support multi-step onboarding with Living Self-Portrait and Relational Foundation

-- Add onboarding step tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  onboarding_step TEXT DEFAULT 'not_started'
    CHECK (onboarding_step IN (
      'not_started',
      'welcome',
      'self_portrait',
      'family_preview',
      'relational_foundation',
      'completed'
    ));

-- Add completion timestamp
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  onboarding_completed_at TIMESTAMPTZ DEFAULT NULL;

-- Living Self-Portrait data (flexible JSONB structure)
-- Stores: pronouns, howIDescribeMyself, currentSeason, whatFeelsImportantNow,
-- valuesIHoldClose, whatGivesMeEnergy, needsInRelationships, howILikeToConnect
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  self_portrait JSONB DEFAULT NULL;

-- Relational Foundation data (flexible JSONB structure)
-- Stores: importantPeople, howIShowCare, whatConnectionMeansToMe,
-- relationshipStrengths, areasOfGrowth
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS
  relational_foundation JSONB DEFAULT NULL;

-- Set existing profiles to completed (backwards compatibility)
-- Users who already have profiles shouldn't see onboarding
UPDATE public.profiles
SET onboarding_step = 'completed',
    onboarding_completed_at = NOW()
WHERE onboarding_step IS NULL OR onboarding_step = 'not_started';

-- Create index for efficient onboarding status queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_step
ON public.profiles(onboarding_step);
