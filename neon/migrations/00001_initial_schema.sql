-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users profiles (id matches Supabase auth user id)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  date_of_birth DATE,
  role TEXT CHECK (role IN ('child', 'teen', 'adult', 'elder')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Families (household groupings)
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  invite_code TEXT UNIQUE NOT NULL DEFAULT SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family Memberships
CREATE TABLE public.family_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'member', 'child')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Personal Reflections
CREATE TABLE public.reflections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  family_id UUID REFERENCES public.families(id),
  type TEXT CHECK (type IN ('journal', 'check_in', 'exercise', 'prompt_response')),
  content JSONB NOT NULL,
  mood_score INTEGER CHECK (mood_score BETWEEN 1 AND 10),
  is_shareable BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dyadic Relationships
CREATE TABLE public.relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  user_a UUID REFERENCES public.profiles(id),
  user_b UUID REFERENCES public.profiles(id),
  relationship_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_a, user_b)
);

-- Relational Hearts
CREATE TABLE public.relational_hearts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE,
  last_check_in TIMESTAMPTZ,
  health_score INTEGER CHECK (health_score BETWEEN 1 AND 100) DEFAULT 50,
  shared_reflections UUID[] DEFAULT '{}',
  common_threads JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alder Wyn Conversations
CREATE TABLE public.alder_wyn_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_type TEXT CHECK (context_type IN ('personal', 'relational', 'collective')),
  context_id UUID,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sharing Settings
CREATE TABLE public.sharing_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id),
  target_family_id UUID REFERENCES public.families(id),
  shareable_fields TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, target_user_id)
);

-- Create indexes
CREATE INDEX idx_profiles_id ON public.profiles(id);
CREATE INDEX idx_reflections_user_id ON public.reflections(user_id);
CREATE INDEX idx_reflections_family_id ON public.reflections(family_id);
CREATE INDEX idx_family_memberships_user_id ON public.family_memberships(user_id);
CREATE INDEX idx_family_memberships_family_id ON public.family_memberships(family_id);
CREATE INDEX idx_relationships_users ON public.relationships(user_a, user_b);

-- Note: RLS is NOT enabled on Neon standalone.
-- Access control is handled at the application layer.
-- Supabase auth trigger is not needed here; profiles are created by the app
-- when a user signs up via Supabase Auth.

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_relational_hearts_updated_at
  BEFORE UPDATE ON public.relational_hearts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alder_wyn_conversations_updated_at
  BEFORE UPDATE ON public.alder_wyn_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
