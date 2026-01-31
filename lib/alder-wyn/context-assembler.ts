import { getSql } from '@/lib/neon/client';
import { getPermittedReflections, type PermissionContext } from './permission-filter';

/**
 * Context assembler for Alder Wyn conversations.
 *
 * Assembles relevant data based on context type (personal/relational/collective).
 * Permission filter runs FIRST — this only assembles data that has been cleared.
 */

export interface AssembledContext {
  recentReflections: {
    content: string;
    moodScore?: number;
    createdAt: string;
  }[];
  moodTrend?: {
    average: number;
    trend: 'up' | 'down' | 'stable';
  };
  relationshipInfo?: {
    otherUserName: string;
    healthScore: number;
    commonThreads: { theme: string }[];
    sharedReflectionCount: number;
  };
  familyInfo?: {
    memberCount: number;
    sharedThemes: { theme: string; count: number }[];
  };
}

export async function assembleContext(
  permissionContext: PermissionContext
): Promise<AssembledContext> {
  const permitted = await getPermittedReflections(permissionContext);

  if (permitted.reflectionIds.length === 0) {
    return { recentReflections: [] };
  }

  const sql = getSql();

  // Fetch permitted reflections
  const reflections = await sql`
    SELECT content, mood_score, created_at
    FROM reflections
    WHERE id = ANY(${permitted.reflectionIds})
    ORDER BY created_at DESC
    LIMIT 20
  `;

  const recentReflections = reflections.map((r: Record<string, unknown>) => {
    const raw = r.content;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      content: ((parsed as Record<string, unknown>)?.text as string) || '',
      moodScore: r.mood_score as number | undefined,
      createdAt: r.created_at as string,
    };
  });

  const moodTrend = calculateMoodTrend(recentReflections);
  const context: AssembledContext = { recentReflections, moodTrend };

  if (permissionContext.contextType === 'relational' && permissionContext.contextId) {
    context.relationshipInfo = await assembleRelationalContext(
      permissionContext.contextId,
      permitted.otherUserId!
    );
  }

  if (permissionContext.contextType === 'collective' && permissionContext.contextId) {
    context.familyInfo = await assembleCollectiveContext(permissionContext.contextId);
  }

  return context;
}

function calculateMoodTrend(reflections: { moodScore?: number }[]): AssembledContext['moodTrend'] {
  const withMood = reflections.filter(r => r.moodScore !== undefined && r.moodScore !== null);

  if (withMood.length < 2) return undefined;

  const scores = withMood.map(r => r.moodScore!);
  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  const midpoint = Math.floor(scores.length / 2);
  const olderAvg = scores.slice(0, midpoint).reduce((sum, s) => sum + s, 0) / midpoint;
  const newerAvg =
    scores.slice(midpoint).reduce((sum, s) => sum + s, 0) / (scores.length - midpoint);

  const diff = newerAvg - olderAvg;
  const trend: 'up' | 'down' | 'stable' = diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'stable';

  return { average, trend };
}

async function assembleRelationalContext(
  relationshipId: string,
  otherUserId: string
): Promise<AssembledContext['relationshipInfo']> {
  const sql = getSql();

  const result = await sql`
    SELECT
      rh.health_score,
      rh.shared_reflections,
      rh.common_threads,
      p.display_name AS other_user_name
    FROM relational_hearts rh
    INNER JOIN profiles p ON p.id = ${otherUserId}
    WHERE rh.relationship_id = ${relationshipId}
    LIMIT 1
  `;

  if (result.length === 0) return undefined;

  const row = result[0] as Record<string, unknown>;
  const commonThreads = Array.isArray(row.common_threads) ? row.common_threads : [];

  return {
    otherUserName: row.other_user_name as string,
    healthScore: row.health_score as number,
    commonThreads: commonThreads.map((t: Record<string, unknown>) => ({
      theme: t.theme as string,
    })),
    sharedReflectionCount: Array.isArray(row.shared_reflections)
      ? row.shared_reflections.length
      : 0,
  };
}

async function assembleCollectiveContext(
  familyId: string
): Promise<AssembledContext['familyInfo']> {
  const sql = getSql();

  const memberResult = await sql`
    SELECT COUNT(*)::int AS count
    FROM family_memberships
    WHERE family_id = ${familyId}
  `;

  const memberCount = ((memberResult[0] as Record<string, unknown>)?.count as number) ?? 0;

  // Aggregate common threads across all family relationships
  const threadsResult = await sql`
    SELECT rh.common_threads
    FROM relational_hearts rh
    INNER JOIN relationships r ON r.id = rh.relationship_id
    WHERE r.family_id = ${familyId}
  `;

  const themeMap = new Map<string, number>();
  threadsResult.forEach((row: Record<string, unknown>) => {
    const threads = Array.isArray(row.common_threads) ? row.common_threads : [];
    threads.forEach((t: Record<string, unknown>) => {
      const theme = t.theme as string;
      themeMap.set(theme, (themeMap.get(theme) ?? 0) + 1);
    });
  });

  const sharedThemes = Array.from(themeMap.entries())
    .map(([theme, count]) => ({ theme, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return { memberCount, sharedThemes };
}

/**
 * Assembles the user's own profile context (self-portrait + relational foundation)
 * for personalizing prompt/exercise suggestions.
 * No permission filter needed — this is the user's own data.
 */
export interface ProfileContext {
  currentSeason?: string;
  values?: string[];
  energySources?: string;
  relationshipNeeds?: string;
  connectionStyles?: string[];
  howTheyShowCare?: string;
  relationshipStrengths?: string[];
  areasOfGrowth?: string[];
}

export async function assembleProfileContext(userId: string): Promise<ProfileContext> {
  const sql = getSql();

  const result = await sql`
    SELECT self_portrait, relational_foundation
    FROM profiles
    WHERE id = ${userId}
    LIMIT 1
  `;

  if (result.length === 0) return {};

  const row = result[0] as Record<string, unknown>;
  const sp = (
    typeof row.self_portrait === 'string' ? JSON.parse(row.self_portrait) : row.self_portrait
  ) as Record<string, unknown> | null;
  const rf = (
    typeof row.relational_foundation === 'string'
      ? JSON.parse(row.relational_foundation)
      : row.relational_foundation
  ) as Record<string, unknown> | null;

  return {
    currentSeason: sp?.currentSeason as string | undefined,
    values: sp?.valuesIHoldClose as string[] | undefined,
    energySources: sp?.whatGivesMeEnergy as string | undefined,
    relationshipNeeds: sp?.needsInRelationships as string | undefined,
    connectionStyles: sp?.howILikeToConnect as string[] | undefined,
    howTheyShowCare: rf?.howIShowCare as string | undefined,
    relationshipStrengths: rf?.relationshipStrengths as string[] | undefined,
    areasOfGrowth: rf?.areasOfGrowth as string[] | undefined,
  };
}
