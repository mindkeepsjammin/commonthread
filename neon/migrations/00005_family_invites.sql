-- Family invites: allow inviting members by email
CREATE TABLE public.family_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES public.profiles(id),
  invited_email TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  UNIQUE(family_id, invited_email)
);

CREATE INDEX idx_family_invites_email ON public.family_invites(invited_email);
CREATE INDEX idx_family_invites_family ON public.family_invites(family_id);
