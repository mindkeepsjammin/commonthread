import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';
import { calculateHealthScore } from '@/lib/health-score';
import type { CommonThread, Relationship, RelationalHeart } from '@/types';

const RELATIONSHIPS_QUERY_KEY = ['relationships'];

export interface RelationshipDetail {
  relationship: Relationship;
  heart: RelationalHeart | null;
  otherUserName: string;
  otherUserId: string;
}

export function useRelationshipsForUser() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...RELATIONSHIPS_QUERY_KEY, user?.id],
    queryFn: async (): Promise<RelationshipDetail[]> => {
      if (!user?.id) return [];

      const result = await getSql()`
        SELECT
          r.*,
          rh.id AS heart_id,
          rh.last_check_in,
          rh.health_score,
          rh.shared_reflections,
          rh.common_threads,
          rh.updated_at AS heart_updated_at,
          p.display_name AS other_user_name,
          CASE WHEN r.user_a = ${user.id} THEN r.user_b ELSE r.user_a END AS other_user_id
        FROM relationships r
        LEFT JOIN relational_hearts rh ON rh.relationship_id = r.id
        LEFT JOIN profiles p ON p.id = CASE WHEN r.user_a = ${user.id} THEN r.user_b ELSE r.user_a END
        WHERE r.user_a = ${user.id} OR r.user_b = ${user.id}
        ORDER BY r.created_at DESC
      `;

      return (result ?? []).map((row: any) => ({
        relationship: {
          id: row.id,
          familyId: row.family_id,
          userA: row.user_a,
          userB: row.user_b,
          relationshipType: row.relationship_type,
          createdAt: row.created_at,
        },
        heart: row.heart_id
          ? {
              id: row.heart_id,
              relationshipId: row.id,
              lastCheckIn: row.last_check_in,
              healthScore: row.health_score,
              sharedReflections: row.shared_reflections ?? [],
              commonThreads: (row.common_threads ?? []) as CommonThread[],
              updatedAt: row.heart_updated_at,
            }
          : null,
        otherUserName: row.other_user_name ?? 'Unknown',
        otherUserId: row.other_user_id,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useRelationship(id: string | undefined) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...RELATIONSHIPS_QUERY_KEY, id],
    queryFn: async (): Promise<RelationshipDetail | null> => {
      if (!user?.id || !id) return null;

      const result = await getSql()`
        SELECT
          r.*,
          rh.id AS heart_id,
          rh.last_check_in,
          rh.health_score,
          rh.shared_reflections,
          rh.common_threads,
          rh.updated_at AS heart_updated_at,
          p.display_name AS other_user_name,
          CASE WHEN r.user_a = ${user.id} THEN r.user_b ELSE r.user_a END AS other_user_id
        FROM relationships r
        LEFT JOIN relational_hearts rh ON rh.relationship_id = r.id
        LEFT JOIN profiles p ON p.id = CASE WHEN r.user_a = ${user.id} THEN r.user_b ELSE r.user_a END
        WHERE r.id = ${id}
      `;

      if (!result || result.length === 0) return null;

      const row = result[0] as any;
      return {
        relationship: {
          id: row.id,
          familyId: row.family_id,
          userA: row.user_a,
          userB: row.user_b,
          relationshipType: row.relationship_type,
          createdAt: row.created_at,
        },
        heart: row.heart_id
          ? {
              id: row.heart_id,
              relationshipId: row.id,
              lastCheckIn: row.last_check_in,
              healthScore: row.health_score,
              sharedReflections: row.shared_reflections ?? [],
              commonThreads: (row.common_threads ?? []) as CommonThread[],
              updatedAt: row.heart_updated_at,
            }
          : null,
        otherUserName: row.other_user_name ?? 'Unknown',
        otherUserId: row.other_user_id,
      };
    },
    enabled: !!user?.id && !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relationshipId: string) => {
      const now = new Date().toISOString();

      // Get current heart data
      const heartResult = await getSql()`
        SELECT id, shared_reflections, common_threads
        FROM relational_hearts
        WHERE relationship_id = ${relationshipId}
        LIMIT 1
      `;

      if (!heartResult || heartResult.length === 0) {
        throw new Error('No relational heart found for this relationship');
      }

      const heart = heartResult[0] as any;
      const sharedRefs: string[] = heart.shared_reflections ?? [];
      const commonThreads = heart.common_threads ?? [];

      const newScore = calculateHealthScore({
        sharedReflectionCount: sharedRefs.length,
        lastCheckIn: now,
        commonThreadCount: Array.isArray(commonThreads) ? commonThreads.length : 0,
      });

      await getSql()`
        UPDATE relational_hearts SET
          last_check_in = ${now},
          health_score = ${newScore}
        WHERE id = ${heart.id}
      `;

      return { healthScore: newScore };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELATIONSHIPS_QUERY_KEY });
    },
  });
}

export function useDiscoverThreads() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (relationshipId: string): Promise<CommonThread[]> => {
      if (!user?.id) throw new Error('Not authenticated');

      const response = await fetch('/api/common-threads/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relationshipId, userId: user.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Discovery failed');
      }

      const { threads } = await response.json();
      return threads as CommonThread[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELATIONSHIPS_QUERY_KEY });
    },
  });
}
