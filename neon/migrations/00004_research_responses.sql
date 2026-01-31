-- Migration: Create research_responses table
-- Purpose: Store anonymous research form submissions from market research surveys

CREATE TABLE public.research_responses (
  id SERIAL PRIMARY KEY,
  form_type TEXT NOT NULL CHECK (form_type IN ('parent', 'teen', 'grandparent', 'adult_no_children')),
  consent_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_name TEXT,
  responses JSONB NOT NULL DEFAULT '{}',
  user_agent TEXT,
  ip_hash TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by form type
CREATE INDEX idx_research_responses_form_type ON public.research_responses(form_type);

-- Index for time-based queries
CREATE INDEX idx_research_responses_submitted_at ON public.research_responses(submitted_at);
