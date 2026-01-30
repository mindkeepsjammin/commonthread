import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';
import type { Family } from '@/types';

const FAMILIES_QUERY_KEY = ['families'];
const FAMILY_MEMBERS_QUERY_KEY = ['family-members'];

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

      const result = await sql`
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

      const result = await sql`
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
      const familyResult = await sql`
        INSERT INTO families (name, created_by)
        VALUES (${name}, ${user.id})
        RETURNING *
      `;

      if (!familyResult || familyResult.length === 0) {
        throw new Error('Failed to create family');
      }

      const family = familyResult[0] as any;

      // Add creator as admin member
      await sql`
        INSERT INTO family_memberships (family_id, user_id, role)
        VALUES (${family.id}, ${user.id}, 'admin')
      `;

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
      const familyResult = await sql`
        SELECT * FROM families WHERE LOWER(invite_code) = LOWER(${inviteCode})
      `;

      if (!familyResult || familyResult.length === 0) {
        throw new Error('Invalid invite code. Please check and try again.');
      }

      const family = familyResult[0] as any;

      // Check if already a member
      const existingMembership = await sql`
        SELECT id FROM family_memberships
        WHERE family_id = ${family.id} AND user_id = ${user.id}
      `;

      if (existingMembership && existingMembership.length > 0) {
        throw new Error('You are already a member of this family.');
      }

      // Join as member
      await sql`
        INSERT INTO family_memberships (family_id, user_id, role)
        VALUES (${family.id}, ${user.id}, 'member')
      `;

      return {
        familyName: family.name as string,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILIES_QUERY_KEY });
    },
  });
}
