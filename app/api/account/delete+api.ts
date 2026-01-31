import { getSql } from '@/lib/neon/client';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request): Promise<Response> {
  try {
    const { userId } = (await request.json()) as { userId: string };

    if (!userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const sql = getSql();

    // Delete in dependency order — explicit deletes for tables
    // that don't CASCADE from profiles
    await sql`
      DELETE FROM relational_hearts
      WHERE relationship_id IN (
        SELECT id FROM relationships
        WHERE user_a = ${userId} OR user_b = ${userId}
      )
    `;

    await sql`
      DELETE FROM relationships
      WHERE user_a = ${userId} OR user_b = ${userId}
    `;

    await sql`
      DELETE FROM family_invites
      WHERE invited_by = ${userId}
    `;

    // profiles has ON DELETE CASCADE for:
    // reflections, family_memberships, alder_wyn_conversations, sharing_settings
    await sql`
      DELETE FROM profiles WHERE id = ${userId}
    `;

    // Delete auth user via Supabase Admin API (requires service role key)
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      await adminClient.auth.admin.deleteUser(userId);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Account deletion error:', error);
    return Response.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 },
    );
  }
}
