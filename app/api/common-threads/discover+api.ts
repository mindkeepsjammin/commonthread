import { discoverThreads } from '@/lib/common-threads/discover';
import { getSql } from '@/lib/neon/client';

export async function POST(request: Request): Promise<Response> {
  try {
    const { relationshipId, userId } = (await request.json()) as {
      relationshipId: string;
      userId: string;
    };

    if (!relationshipId || !userId) {
      return Response.json(
        { error: 'relationshipId and userId are required' },
        { status: 400 },
      );
    }

    // Verify the user is part of this relationship
    const rel = await getSql()`
      SELECT id FROM relationships
      WHERE id = ${relationshipId}
      AND (user_a = ${userId} OR user_b = ${userId})
    `;

    if (!rel || rel.length === 0) {
      return Response.json({ error: 'Relationship not found' }, { status: 404 });
    }

    const threads = await discoverThreads(relationshipId);

    return Response.json({ threads });
  } catch (error) {
    console.error('Common threads discovery error:', error);
    return Response.json(
      { error: 'Failed to discover common threads' },
      { status: 500 },
    );
  }
}
