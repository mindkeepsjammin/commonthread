import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';
import { calculateHealthScore } from '@/lib/health-score';
import type { Reflection, ReflectionContent } from '@/types';
import type { ReflectionCreateInput, ReflectionUpdateInput } from '@/lib/validations';

const REFLECTIONS_QUERY_KEY = ['reflections'];
const RELATIONSHIPS_QUERY_KEY = ['relationships'];

async function updateHealthScoresForSharing(
  currentUserId: string,
  reflectionId: string,
  sharedWith: string[],
): Promise<string[]> {
  const relationshipIdsForDiscovery: string[] = [];
  if (sharedWith.length === 0) return relationshipIdsForDiscovery;

  for (const otherUserId of sharedWith) {
    // Find the relationship between these two users
    const relResult = await getSql()`
      SELECT r.id AS relationship_id, rh.id AS heart_id,
             rh.shared_reflections, rh.common_threads, rh.last_check_in
      FROM relationships r
      LEFT JOIN relational_hearts rh ON rh.relationship_id = r.id
      WHERE (r.user_a = ${currentUserId} AND r.user_b = ${otherUserId})
         OR (r.user_a = ${otherUserId} AND r.user_b = ${currentUserId})
      LIMIT 1
    `;

    if (!relResult || relResult.length === 0) continue;

    const row = relResult[0] as any;
    if (!row.heart_id) continue;

    const existingRefs: string[] = row.shared_reflections ?? [];
    const updatedRefs = existingRefs.includes(reflectionId)
      ? existingRefs
      : [...existingRefs, reflectionId];

    const commonThreads = row.common_threads ?? [];
    const now = new Date().toISOString();

    const newScore = calculateHealthScore({
      sharedReflectionCount: updatedRefs.length,
      lastCheckIn: now,
      commonThreadCount: Array.isArray(commonThreads) ? commonThreads.length : 0,
    });

    await getSql()`
      UPDATE relational_hearts SET
        shared_reflections = ${updatedRefs},
        health_score = ${newScore},
        last_check_in = ${now}
      WHERE id = ${row.heart_id}
    `;

    if (updatedRefs.length >= 3) {
      relationshipIdsForDiscovery.push(row.relationship_id);
    }
  }

  return relationshipIdsForDiscovery;
}

function triggerCommonThreadsDiscovery(relationshipIds: string[], userId: string) {
  for (const relationshipId of relationshipIds) {
    fetch('/api/common-threads/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ relationshipId, userId }),
    }).catch(() => {
      // Fire-and-forget: discovery failure is non-critical
    });
  }
}

interface ReflectionRow {
  id: string;
  user_id: string;
  family_id: string | null;
  type: string;
  content: ReflectionContent;
  mood_score: number | null;
  is_shareable: boolean;
  shared_with: string[];
  created_at: string;
}

function mapRowToReflection(row: ReflectionRow): Reflection {
  return {
    id: row.id,
    userId: row.user_id,
    familyId: row.family_id,
    type: row.type as Reflection['type'],
    content: row.content,
    moodScore: row.mood_score,
    isShareable: row.is_shareable,
    sharedWith: row.shared_with ?? [],
    createdAt: row.created_at,
  };
}

export function useReflections(filter?: Reflection['type']) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: [...REFLECTIONS_QUERY_KEY, user?.id, filter],
    queryFn: async (): Promise<Reflection[]> => {
      if (!user?.id) return [];

      let result;
      if (filter) {
        result = await getSql()`
          SELECT * FROM reflections
          WHERE user_id = ${user.id} AND type = ${filter}
          ORDER BY created_at DESC
        `;
      } else {
        result = await getSql()`
          SELECT * FROM reflections
          WHERE user_id = ${user.id}
          ORDER BY created_at DESC
        `;
      }

      return (result ?? []).map(row => mapRowToReflection(row as ReflectionRow));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateReflection() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (input: ReflectionCreateInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const contentJson = JSON.stringify({ text: input.content });

      const result = await getSql()`
        INSERT INTO reflections (user_id, type, content, mood_score, is_shareable, shared_with)
        VALUES (
          ${user.id},
          ${input.type},
          ${contentJson}::jsonb,
          ${input.moodScore ?? null},
          ${input.isShareableWithFamily ?? false},
          ${input.sharedWith ?? []}
        )
        RETURNING *
      `;

      if (!result || result.length === 0) {
        throw new Error('Failed to create reflection');
      }

      const reflection = mapRowToReflection(result[0] as ReflectionRow);

      if (input.sharedWith && input.sharedWith.length > 0) {
        const discoveryIds = await updateHealthScoresForSharing(user.id, reflection.id, input.sharedWith);
        triggerCommonThreadsDiscovery(discoveryIds, user.id);
      }

      return reflection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RELATIONSHIPS_QUERY_KEY });
    },
  });
}

export function useUpdateReflection() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & ReflectionUpdateInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const contentJson = updates.content
        ? JSON.stringify({ text: updates.content })
        : null;

      const result = await getSql()`
        UPDATE reflections SET
          type = COALESCE(${updates.type ?? null}, type),
          content = COALESCE(${contentJson}::jsonb, content),
          mood_score = COALESCE(${updates.moodScore ?? null}, mood_score),
          is_shareable = COALESCE(${updates.isShareableWithFamily ?? null}, is_shareable)
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING *
      `;

      if (!result || result.length === 0) {
        throw new Error('Failed to update reflection');
      }

      const reflection = mapRowToReflection(result[0] as ReflectionRow);

      if (updates.sharedWith && updates.sharedWith.length > 0) {
        const discoveryIds = await updateHealthScoresForSharing(user.id, reflection.id, updates.sharedWith);
        triggerCommonThreadsDiscovery(discoveryIds, user.id);
      }

      return reflection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: RELATIONSHIPS_QUERY_KEY });
    },
  });
}

export function useDeleteReflection() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      await getSql()`
        DELETE FROM reflections WHERE id = ${id} AND user_id = ${user.id}
      `;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFLECTIONS_QUERY_KEY });
    },
  });
}
