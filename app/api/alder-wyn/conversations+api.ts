import { getSql } from '@/lib/neon/client';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const sql = getSql();

    const conversations = await sql`
      SELECT
        awc.*,
        CASE
          WHEN awc.context_type = 'relational' THEN (
            SELECT p.display_name
            FROM relationships r
            INNER JOIN profiles p ON p.id = CASE
              WHEN r.user_a = ${userId} THEN r.user_b
              ELSE r.user_a
            END
            WHERE r.id = awc.context_id
            LIMIT 1
          )
          WHEN awc.context_type = 'collective' THEN (
            SELECT f.name
            FROM families f
            WHERE f.id = awc.context_id
            LIMIT 1
          )
          ELSE NULL
        END AS context_name
      FROM alder_wyn_conversations awc
      WHERE awc.user_id = ${userId}
      ORDER BY awc.updated_at DESC
    `;

    const result = conversations.map((conv: Record<string, unknown>) => ({
      id: conv.id,
      userId: conv.user_id,
      contextType: conv.context_type,
      contextId: conv.context_id,
      contextName: conv.context_name,
      messageCount: Array.isArray(conv.messages) ? conv.messages.length : 0,
      lastMessage:
        Array.isArray(conv.messages) && conv.messages.length > 0
          ? (conv.messages[conv.messages.length - 1] as Record<string, unknown>)
              .content
          : null,
      createdAt: conv.created_at,
      updatedAt: conv.updated_at,
    }));

    return Response.json({ conversations: result });
  } catch (error) {
    console.error('Alder Wyn conversations list error:', error);
    return Response.json(
      { error: 'Failed to load conversations' },
      { status: 500 }
    );
  }
}
