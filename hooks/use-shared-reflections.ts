import { useQuery } from '@tanstack/react-query';
import { getSql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';
import type { Reflection, ReflectionContent } from '@/types';

export interface SharedReflection extends Reflection {
  authorName: string;
  isOwn: boolean;
}

export function useSharedReflections(otherUserId: string | null) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['shared-reflections', user?.id, otherUserId],
    queryFn: async (): Promise<SharedReflection[]> => {
      if (!user?.id || !otherUserId) return [];

      const result = await getSql()`
        SELECT r.*, p.display_name AS author_name
        FROM reflections r
        INNER JOIN profiles p ON p.id = r.user_id
        WHERE r.is_shareable = true
          AND (
            (r.user_id = ${user.id} AND ${otherUserId} = ANY(r.shared_with))
            OR
            (r.user_id = ${otherUserId} AND ${user.id} = ANY(r.shared_with))
          )
        ORDER BY r.created_at DESC
      `;

      return (result ?? []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        familyId: row.family_id,
        type: row.type,
        content: row.content as ReflectionContent,
        moodScore: row.mood_score,
        isShareable: row.is_shareable,
        sharedWith: row.shared_with ?? [],
        createdAt: row.created_at,
        authorName: row.author_name ?? 'Unknown',
        isOwn: row.user_id === user.id,
      }));
    },
    enabled: !!user?.id && !!otherUserId,
    staleTime: 1000 * 60 * 2,
  });
}
