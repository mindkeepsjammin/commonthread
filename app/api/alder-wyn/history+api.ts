import { getSql } from '@/lib/neon/client';

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const contextType = searchParams.get('contextType') || 'personal';
    const contextId = searchParams.get('contextId');

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const sql = getSql();

    let conversation;
    if (contextId) {
      conversation = await sql`
        SELECT * FROM alder_wyn_conversations
        WHERE user_id = ${userId}
          AND context_type = ${contextType}
          AND context_id = ${contextId}
        ORDER BY updated_at DESC
        LIMIT 1
      `;
    } else {
      conversation = await sql`
        SELECT * FROM alder_wyn_conversations
        WHERE user_id = ${userId}
          AND context_type = ${contextType}
          AND context_id IS NULL
        ORDER BY updated_at DESC
        LIMIT 1
      `;
    }

    if (!conversation || conversation.length === 0) {
      return Response.json({ conversation: null });
    }

    const row = conversation[0];
    return Response.json({
      conversation: {
        id: row.id,
        userId: row.user_id,
        contextType: row.context_type,
        contextId: row.context_id,
        messages: row.messages,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error('Alder Wyn history error:', error);
    return Response.json(
      { error: 'Failed to load conversation history' },
      { status: 500 }
    );
  }
}
