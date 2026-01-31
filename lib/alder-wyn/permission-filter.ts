import { getSql } from '@/lib/neon/client';

/**
 * Permission filter for Alder Wyn context assembly.
 *
 * CRITICAL: This runs BEFORE context assembly to ensure Alder Wyn
 * only sees data the user has explicitly shared.
 *
 * Privacy rules:
 * - Personal: User's own reflections only
 * - Relational: Only reflections shared between the two users in that relationship
 * - Collective: Only reflections marked is_shareable from family members
 */

export interface PermissionContext {
  userId: string;
  contextType: 'personal' | 'relational' | 'collective';
  contextId?: string;
}

export interface PermittedReflections {
  reflectionIds: string[];
  otherUserId?: string;
}

export async function getPermittedReflections(
  context: PermissionContext
): Promise<PermittedReflections> {
  const sql = getSql();

  switch (context.contextType) {
    case 'personal': {
      const result = await sql`
        SELECT id FROM reflections
        WHERE user_id = ${context.userId}
        ORDER BY created_at DESC
        LIMIT 50
      `;
      return { reflectionIds: result.map((r: Record<string, unknown>) => r.id as string) };
    }

    case 'relational': {
      if (!context.contextId) {
        throw new Error('contextId (relationshipId) required for relational context');
      }

      // Get the other user in this relationship
      const relResult = await sql`
        SELECT user_a, user_b FROM relationships
        WHERE id = ${context.contextId}
          AND (user_a = ${context.userId} OR user_b = ${context.userId})
      `;

      if (relResult.length === 0) {
        return { reflectionIds: [] };
      }

      const rel = relResult[0] as Record<string, unknown>;
      const otherUserId = rel.user_a === context.userId
        ? (rel.user_b as string)
        : (rel.user_a as string);

      // Get reflections shared between these two users
      const heartResult = await sql`
        SELECT shared_reflections
        FROM relational_hearts
        WHERE relationship_id = ${context.contextId}
        LIMIT 1
      `;

      if (heartResult.length === 0) {
        return { reflectionIds: [], otherUserId };
      }

      const sharedIds = (heartResult[0] as Record<string, unknown>).shared_reflections as string[] ?? [];

      return { reflectionIds: sharedIds, otherUserId };
    }

    case 'collective': {
      if (!context.contextId) {
        throw new Error('contextId (familyId) required for collective context');
      }

      // Verify user is member of this family
      const memberResult = await sql`
        SELECT id FROM family_memberships
        WHERE family_id = ${context.contextId} AND user_id = ${context.userId}
      `;

      if (memberResult.length === 0) {
        throw new Error('User is not a member of this family');
      }

      // Get shareable reflections from all family members
      const result = await sql`
        SELECT r.id FROM reflections r
        INNER JOIN family_memberships fm ON fm.user_id = r.user_id
        WHERE fm.family_id = ${context.contextId}
          AND r.is_shareable = true
        ORDER BY r.created_at DESC
        LIMIT 100
      `;

      return { reflectionIds: result.map((r: Record<string, unknown>) => r.id as string) };
    }

    default:
      throw new Error(`Unknown context type: ${context.contextType}`);
  }
}

/**
 * Verifies user has permission to access a specific context.
 */
export async function verifyContextPermission(
  context: PermissionContext
): Promise<boolean> {
  const sql = getSql();

  try {
    switch (context.contextType) {
      case 'personal':
        return true;

      case 'relational': {
        if (!context.contextId) return false;
        const result = await sql`
          SELECT id FROM relationships
          WHERE id = ${context.contextId}
            AND (user_a = ${context.userId} OR user_b = ${context.userId})
        `;
        return result.length > 0;
      }

      case 'collective': {
        if (!context.contextId) return false;
        const result = await sql`
          SELECT id FROM family_memberships
          WHERE family_id = ${context.contextId}
            AND user_id = ${context.userId}
        `;
        return result.length > 0;
      }

      default:
        return false;
    }
  } catch {
    return false;
  }
}
