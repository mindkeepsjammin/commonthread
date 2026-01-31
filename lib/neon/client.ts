import { neon } from '@neondatabase/serverless';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Neon serverless client for direct database queries (lazily initialized to avoid
// throwing during Expo static rendering when env vars aren't available)
let _sql: ReturnType<typeof neon<false, false>> | null = null;

export function getSql() {
  if (!_sql) {
    const databaseUrl = process.env.EXPO_PUBLIC_NEON_DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('Missing EXPO_PUBLIC_NEON_DATABASE_URL environment variable');
    }
    _sql = neon<false, false>(databaseUrl);
  }
  return _sql;
}

// Supabase client for auth (lazily initialized for static rendering compatibility)
let _supabase: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables (used for auth)');
    }
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: typeof window !== 'undefined' ? AsyncStorage : undefined,
        autoRefreshToken: true,
        persistSession: typeof window !== 'undefined',
        detectSessionInUrl: false,
      },
    });
  }
  return _supabase;
}

export type FormType = 'parent' | 'teen' | 'grandparent' | 'adult_no_children';

export interface ResearchResponse {
  id: number;
  form_type: FormType;
  submitted_at: string;
  consent_confirmed: boolean;
  preferred_name: string | null;
  responses: Record<string, unknown>;
  user_agent: string | null;
  ip_hash: string | null;
}

export async function submitResearchForm(
  formType: FormType,
  consentConfirmed: boolean,
  preferredName: string | null,
  responses: Record<string, unknown>,
  userAgent?: string,
  ipHash?: string
): Promise<ResearchResponse> {
  const result = await getSql()`
    INSERT INTO research_responses (form_type, consent_confirmed, preferred_name, responses, user_agent, ip_hash)
    VALUES (${formType}, ${consentConfirmed}, ${preferredName}, ${JSON.stringify(responses)}, ${userAgent || null}, ${ipHash || null})
    RETURNING *
  `;
  return result[0] as ResearchResponse;
}

export async function getResponsesByFormType(formType: FormType): Promise<ResearchResponse[]> {
  const result = await getSql()`
    SELECT * FROM research_responses
    WHERE form_type = ${formType}
    ORDER BY submitted_at DESC
  `;
  return result as ResearchResponse[];
}

export async function getResponseCounts(): Promise<{ form_type: FormType; count: number }[]> {
  const result = await getSql()`
    SELECT form_type, COUNT(*)::int as count
    FROM research_responses
    GROUP BY form_type
  `;
  return result as { form_type: FormType; count: number }[];
}
