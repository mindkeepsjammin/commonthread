import { useQuery } from '@tanstack/react-query';
import { getSql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';
import type { Reflection, ReflectionContent } from '@/types';

export interface ReceivedReflection extends Reflection {
  authorName: string;
}

export function useReflectionsSharedWithMe() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['reflections-shared-with-me', user?.id],
    queryFn: async (): Promise<ReceivedReflection[]> => {
      if (!user?.id) return [];

      const result = await getSql()`
        SELECT r.*, p.display_name AS author_name
        FROM reflections r
        INNER JOIN profiles p ON p.id = r.user_id
        WHERE ${user.id} = ANY(r.shared_with)
          AND r.is_shareable = true
          AND r.user_id != ${user.id}
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
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}
