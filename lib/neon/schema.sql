-- Research Forms Database Schema for Neon PostgreSQL
-- Run this in the Neon SQL editor to create the table

-- Single table with form_type column for flexibility
CREATE TABLE IF NOT EXISTS research_responses (
  id SERIAL PRIMARY KEY,
  form_type TEXT NOT NULL CHECK (form_type IN ('parent', 'teen', 'grandparent', 'adult_no_children')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consent_confirmed BOOLEAN NOT NULL DEFAULT false,
  preferred_name TEXT,
  responses JSONB NOT NULL,

  -- Metadata
  user_agent TEXT,
  ip_hash TEXT  -- Hashed for privacy, useful for detecting duplicates
);

-- Index for querying by form type
CREATE INDEX IF NOT EXISTS idx_research_responses_form_type ON research_responses(form_type);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_research_responses_submitted_at ON research_responses(submitted_at);

-- Example queries for Claude Code to use:

-- Get all responses for a specific form type
-- SELECT * FROM research_responses WHERE form_type = 'parent' ORDER BY submitted_at DESC;

-- Count responses by form type
-- SELECT form_type, COUNT(*) as count FROM research_responses GROUP BY form_type;

-- Get responses from the last 7 days
-- SELECT * FROM research_responses WHERE submitted_at > NOW() - INTERVAL '7 days';

-- Extract specific answers from JSONB
-- SELECT
--   preferred_name,
--   responses->>'family_words' as family_words,
--   responses->>'tech_role' as tech_role
-- FROM research_responses
-- WHERE form_type = 'parent';
