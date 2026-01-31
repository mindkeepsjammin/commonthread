import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSql } from '@/lib/neon/client';
import { useAuthStore } from './use-auth-store';

const RELATIONSHIPS_QUERY_KEY = ['relationships'];

export function useFindRelationship(otherUserId: string | null) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['find-relationship', user?.id, otherUserId],
    queryFn: async (): Promise<string | null> => {
      if (!user?.id || !otherUserId) return null;

      const result = await getSql()`
        SELECT id FROM relationships
        WHERE (user_a = ${user.id} AND user_b = ${otherUserId})
           OR (user_a = ${otherUserId} AND user_b = ${user.id})
        LIMIT 1
      `;

      if (!result || result.length === 0) return null;
      return (result[0] as any).id;
    },
    enabled: !!user?.id && !!otherUserId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateRelationship() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({ otherUserId, familyId }: { otherUserId: string; familyId: string }): Promise<string> => {
      if (!user?.id) throw new Error('Not authenticated');

      const result = await getSql()`
        INSERT INTO relationships (family_id, user_a, user_b)
        VALUES (${familyId}, ${user.id}, ${otherUserId})
        ON CONFLICT (user_a, user_b) DO UPDATE SET family_id = relationships.family_id
        RETURNING id
      `;

      if (!result || result.length === 0) {
        throw new Error('Failed to create relationship');
      }

      const relationshipId = (result[0] as any).id;

      // Ensure a relational heart exists
      await getSql()`
        INSERT INTO relational_hearts (relationship_id)
        VALUES (${relationshipId})
        ON CONFLICT (relationship_id) DO NOTHING
      `;

      return relationshipId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RELATIONSHIPS_QUERY_KEY });
    },
  });
}
