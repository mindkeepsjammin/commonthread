import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';
import type { Reflection, ReflectionContent } from '@/types';
import type { ReflectionCreateInput, ReflectionUpdateInput } from '@/lib/validations';

const REFLECTIONS_QUERY_KEY = ['reflections'];

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

      return mapRowToReflection(result[0] as ReflectionRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFLECTIONS_QUERY_KEY });
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

      return mapRowToReflection(result[0] as ReflectionRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REFLECTIONS_QUERY_KEY });
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
