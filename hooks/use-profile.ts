import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';
import type { Profile, SelfPortrait, RelationalFoundation } from '@/types';
import type { Database } from '@/types/database';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const PROFILE_QUERY_KEY = ['profile'];

function mapRowToProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    dateOfBirth: row.date_of_birth,
    role: row.role,
    onboardingStep: row.onboarding_step,
    onboardingCompletedAt: row.onboarding_completed_at,
    selfPortrait: row.self_portrait as SelfPortrait | null,
    relationalFoundation: row.relational_foundation as RelationalFoundation | null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useProfile() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...PROFILE_QUERY_KEY, user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user?.id) return null;

      const result = await sql`
        SELECT * FROM profiles WHERE id = ${user.id} LIMIT 1
      `;

      if (!result || result.length === 0) {
        // No profile found - this is expected for new users
        return null;
      }

      return mapRowToProfile(result[0] as ProfileRow);
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, setProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      if (!user?.id) throw new Error('Not authenticated');

      const now = new Date().toISOString();

      const result = await sql`
        UPDATE profiles SET
          updated_at = ${now},
          display_name = COALESCE(${updates.displayName ?? null}, display_name),
          avatar_url = COALESCE(${updates.avatarUrl ?? null}, avatar_url),
          date_of_birth = COALESCE(${updates.dateOfBirth ?? null}, date_of_birth),
          role = COALESCE(${updates.role ?? null}, role)
        WHERE id = ${user.id}
        RETURNING *
      `;

      if (!result || result.length === 0) {
        throw new Error('Failed to update profile');
      }

      return mapRowToProfile(result[0] as ProfileRow);
    },
    onSuccess: profile => {
      setProfile(profile);
      queryClient.setQueryData([...PROFILE_QUERY_KEY, user?.id], profile);
    },
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  const { user, setProfile } = useAuthStore();

  return useMutation({
    mutationFn: async (profileData: { displayName: string; role?: Profile['role'] }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const result = await sql`
        INSERT INTO profiles (id, display_name, role)
        VALUES (${user.id}, ${profileData.displayName}, ${profileData.role || null})
        ON CONFLICT (id) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          role = EXCLUDED.role,
          updated_at = NOW()
        RETURNING *
      `;

      if (!result || result.length === 0) {
        throw new Error('Failed to create profile');
      }

      return mapRowToProfile(result[0] as ProfileRow);
    },
    onSuccess: profile => {
      setProfile(profile);
      queryClient.setQueryData([...PROFILE_QUERY_KEY, user?.id], profile);
    },
  });
}
