import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';
import { getSupabase } from '@/lib/neon/client';
import type { Family, PendingInviteInfo } from '@/types';

const FAMILIES_QUERY_KEY = ['families'];
const FAMILY_MEMBERS_QUERY_KEY = ['family-members'];
const FAMILY_INVITES_QUERY_KEY = ['family-invites'];
const PENDING_INVITES_QUERY_KEY = ['pending-invites'];
const RELATIONSHIPS_QUERY_KEY = ['relationships'];

async function createRelationshipsForNewMember(
  familyId: string,
  newUserId: string,
) {
  const members = await getSql()`
    SELECT user_id FROM family_memberships
    WHERE family_id = ${familyId} AND user_id != ${newUserId}
  `;

  for (const member of members ?? []) {
    const otherId = (member as any).user_id;
    const relResult = await getSql()`
      INSERT INTO relationships (family_id, user_a, user_b)
      VALUES (${familyId}, ${newUserId}, ${otherId})
      ON CONFLICT (user_a, user_b) DO NOTHING
      RETURNING id
    `;

    if (relResult && relResult.length > 0) {
      await getSql()`
        INSERT INTO relational_hearts (relationship_id)
        VALUES (${(relResult[0] as any).id})
      `;
    }
  }
}

export interface FamilyWithMeta extends Family {
  memberCount: number;
  userRole: string;
}

export interface FamilyMemberInfo {
  id: string;
  userId: string;
  displayName: string;
  role: string;
  joinedAt: string;
}

interface FamilyRow {
  id: string;
  name: string;
  created_by: string;
  invite_code: string;
  created_at: string;
  member_count: number;
  user_role: string;
}

function mapRowToFamily(row: FamilyRow): FamilyWithMeta {
  return {
    id: row.id,
    name: row.name,
    createdBy: row.created_by,
    inviteCode: row.invite_code,
    createdAt: row.created_at,
    memberCount: Number(row.member_count),
    userRole: row.user_role,
  };
}

export function useFamilies() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...FAMILIES_QUERY_KEY, user?.id],
    queryFn: async (): Promise<FamilyWithMeta[]> => {
      if (!user?.id) return [];

      const result = await getSql()`
        SELECT
          f.*,
          fm.role AS user_role,
          (SELECT COUNT(*)::int FROM family_memberships WHERE family_id = f.id) AS member_count
        FROM families f
        INNER JOIN family_memberships fm ON fm.family_id = f.id
        WHERE fm.user_id = ${user.id}
        ORDER BY f.created_at DESC
      `;

      return (result ?? []).map(row => mapRowToFamily(row as FamilyRow));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useFamilyMembers(familyId: string | null) {
  return useQuery({
    queryKey: [...FAMILY_MEMBERS_QUERY_KEY, familyId],
    queryFn: async (): Promise<FamilyMemberInfo[]> => {
      if (!familyId) return [];

      const result = await getSql()`
        SELECT
          fm.id,
          fm.user_id,
          p.display_name,
          fm.role,
          fm.joined_at
        FROM family_memberships fm
        INNER JOIN profiles p ON p.id = fm.user_id
        WHERE fm.family_id = ${familyId}
        ORDER BY fm.joined_at ASC
      `;

      return (result ?? []).map(row => ({
        id: (row as any).id,
        userId: (row as any).user_id,
        displayName: (row as any).display_name,
        role: (row as any).role,
        joinedAt: (row as any).joined_at,
      }));
    },
    enabled: !!familyId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateFamily() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ name }: { name: string }): Promise<FamilyWithMeta> => {
      if (!user?.id) throw new Error('Not authenticated');

      // Create the family
      const familyResult = await getSql()`
        INSERT INTO families (name, created_by)
        VALUES (${name}, ${user.id})
        RETURNING *
      `;

      if (!familyResult || familyResult.length === 0) {
        throw new Error('Failed to create family');
      }

      const family = familyResult[0] as any;

      // Add creator as admin member
      await getSql()`
        INSERT INTO family_memberships (family_id, user_id, role)
        VALUES (${family.id}, ${user.id}, 'admin')
      `;

      await createRelationshipsForNewMember(family.id, user.id);

      return {
        id: family.id,
        name: family.name,
        createdBy: family.created_by,
        inviteCode: family.invite_code,
        createdAt: family.created_at,
        memberCount: 1,
        userRole: 'admin',
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RELATIONSHIPS_QUERY_KEY });
    },
  });
}

export function useJoinFamily() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ inviteCode }: { inviteCode: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Find family by invite code (case-insensitive)
      const familyResult = await getSql()`
        SELECT * FROM families WHERE LOWER(invite_code) = LOWER(${inviteCode})
      `;

      if (!familyResult || familyResult.length === 0) {
        throw new Error('Invalid invite code. Please check and try again.');
      }

      const family = familyResult[0] as any;

      // Check if already a member
      const existingMembership = await getSql()`
        SELECT id FROM family_memberships
        WHERE family_id = ${family.id} AND user_id = ${user.id}
      `;

      if (existingMembership && existingMembership.length > 0) {
        throw new Error('You are already a member of this family.');
      }

      // Join as member
      await getSql()`
        INSERT INTO family_memberships (family_id, user_id, role)
        VALUES (${family.id}, ${user.id}, 'member')
      `;

      await createRelationshipsForNewMember(family.id, user.id);

      return {
        familyName: family.name as string,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RELATIONSHIPS_QUERY_KEY });
    },
  });
}

export function useInviteFamilyMember() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      familyId,
      email,
      familyName,
    }: {
      familyId: string;
      email: string;
      familyName: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Check for existing pending invite
      const existingInvite = await getSql()`
        SELECT id FROM family_invites
        WHERE family_id = ${familyId}
        AND LOWER(invited_email) = LOWER(${email})
        AND status = 'pending'
        AND expires_at > NOW()
      `;

      if (existingInvite && existingInvite.length > 0) {
        throw new Error('An invite has already been sent to this email.');
      }

      // Upsert invite (handles expired/previously declined invites)
      await getSql()`
        INSERT INTO family_invites (family_id, invited_by, invited_email)
        VALUES (${familyId}, ${user.id}, ${email.toLowerCase()})
        ON CONFLICT (family_id, invited_email)
        DO UPDATE SET status = 'pending', invited_by = ${user.id},
          created_at = NOW(), expires_at = NOW() + INTERVAL '7 days'
      `;

      // Send email via Supabase Edge Function
      try {
        const inviterResult = await getSql()`
          SELECT display_name FROM profiles WHERE id = ${user.id}
        `;
        const inviterName = (inviterResult?.[0] as any)?.display_name ?? 'A family member';

        await getSupabase().functions.invoke('send-invite', {
          body: { to: email, familyName, inviterName },
        });
      } catch {
        // Email failure is non-fatal — invite record still created
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_INVITES_QUERY_KEY });
    },
  });
}

export function usePendingInvites() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...PENDING_INVITES_QUERY_KEY, user?.email],
    queryFn: async (): Promise<PendingInviteInfo[]> => {
      if (!user?.email) return [];

      const result = await getSql()`
        SELECT
          fi.*,
          f.name AS family_name,
          p.display_name AS inviter_name
        FROM family_invites fi
        INNER JOIN families f ON f.id = fi.family_id
        INNER JOIN profiles p ON p.id = fi.invited_by
        WHERE LOWER(fi.invited_email) = LOWER(${user.email})
        AND fi.status = 'pending'
        AND fi.expires_at > NOW()
        ORDER BY fi.created_at DESC
      `;

      return (result ?? []).map((row: any) => ({
        id: row.id,
        familyId: row.family_id,
        invitedBy: row.invited_by,
        invitedEmail: row.invited_email,
        status: row.status,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        familyName: row.family_name,
        inviterName: row.inviter_name,
      }));
    },
    enabled: !!user?.email,
    staleTime: 1000 * 60,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ inviteId, familyId }: { inviteId: string; familyId: string }) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Mark invite as accepted
      await getSql()`
        UPDATE family_invites SET status = 'accepted' WHERE id = ${inviteId}
      `;

      // Add as member
      await getSql()`
        INSERT INTO family_memberships (family_id, user_id, role)
        VALUES (${familyId}, ${user.id}, 'member')
        ON CONFLICT (family_id, user_id) DO NOTHING
      `;

      // Create relationships with existing members
      await createRelationshipsForNewMember(familyId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_INVITES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FAMILIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RELATIONSHIPS_QUERY_KEY });
    },
  });
}

export function useDeclineInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inviteId }: { inviteId: string }) => {
      await getSql()`
        UPDATE family_invites SET status = 'expired' WHERE id = ${inviteId}
      `;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_INVITES_QUERY_KEY });
    },
  });
}

export function useFamilyInvites(familyId: string | null) {
  return useQuery({
    queryKey: [...FAMILY_INVITES_QUERY_KEY, familyId],
    queryFn: async () => {
      if (!familyId) return [];

      const result = await getSql()`
        SELECT
          fi.*,
          p.display_name AS inviter_name
        FROM family_invites fi
        INNER JOIN profiles p ON p.id = fi.invited_by
        WHERE fi.family_id = ${familyId}
        AND fi.status = 'pending'
        AND fi.expires_at > NOW()
        ORDER BY fi.created_at DESC
      `;

      return (result ?? []).map((row: any) => ({
        id: row.id,
        email: row.invited_email,
        inviterName: row.inviter_name,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
      }));
    },
    enabled: !!familyId,
    staleTime: 1000 * 60,
  });
}
