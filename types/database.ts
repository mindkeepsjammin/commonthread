// Database types for Neon Postgres
// These types match the schema in neon/migrations/

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          date_of_birth: string | null;
          role: 'child' | 'teen' | 'adult' | 'elder' | null;
          onboarding_step: 'not_started' | 'welcome' | 'self_portrait' | 'family_preview' | 'relational_foundation' | 'completed';
          onboarding_completed_at: string | null;
          self_portrait: Json | null;
          relational_foundation: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          role?: 'child' | 'teen' | 'adult' | 'elder' | null;
          onboarding_step?: 'not_started' | 'welcome' | 'self_portrait' | 'family_preview' | 'relational_foundation' | 'completed';
          onboarding_completed_at?: string | null;
          self_portrait?: Json | null;
          relational_foundation?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          date_of_birth?: string | null;
          role?: 'child' | 'teen' | 'adult' | 'elder' | null;
          onboarding_step?: 'not_started' | 'welcome' | 'self_portrait' | 'family_preview' | 'relational_foundation' | 'completed';
          onboarding_completed_at?: string | null;
          self_portrait?: Json | null;
          relational_foundation?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      families: {
        Row: {
          id: string;
          name: string;
          created_by: string;
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          invite_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          invite_code?: string;
          created_at?: string;
        };
      };
      family_memberships: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          role: 'admin' | 'member' | 'child';
          joined_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_id: string;
          role?: 'admin' | 'member' | 'child';
          joined_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          user_id?: string;
          role?: 'admin' | 'member' | 'child';
          joined_at?: string;
        };
      };
      reflections: {
        Row: {
          id: string;
          user_id: string;
          family_id: string | null;
          type: 'journal' | 'check_in' | 'exercise' | 'prompt_response';
          content: Json;
          mood_score: number | null;
          is_shareable: boolean;
          shared_with: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          family_id?: string | null;
          type: 'journal' | 'check_in' | 'exercise' | 'prompt_response';
          content: Json;
          mood_score?: number | null;
          is_shareable?: boolean;
          shared_with?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          family_id?: string | null;
          type?: 'journal' | 'check_in' | 'exercise' | 'prompt_response';
          content?: Json;
          mood_score?: number | null;
          is_shareable?: boolean;
          shared_with?: string[];
          created_at?: string;
        };
      };
      relationships: {
        Row: {
          id: string;
          family_id: string;
          user_a: string;
          user_b: string;
          relationship_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          user_a: string;
          user_b: string;
          relationship_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          family_id?: string;
          user_a?: string;
          user_b?: string;
          relationship_type?: string;
          created_at?: string;
        };
      };
      relational_hearts: {
        Row: {
          id: string;
          relationship_id: string;
          last_check_in: string | null;
          health_score: number;
          shared_reflections: string[];
          common_threads: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          relationship_id: string;
          last_check_in?: string | null;
          health_score?: number;
          shared_reflections?: string[];
          common_threads?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          relationship_id?: string;
          last_check_in?: string | null;
          health_score?: number;
          shared_reflections?: string[];
          common_threads?: Json;
          updated_at?: string;
        };
      };
      alder_wyn_conversations: {
        Row: {
          id: string;
          user_id: string;
          context_type: 'personal' | 'relational' | 'collective';
          context_id: string | null;
          messages: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          context_type: 'personal' | 'relational' | 'collective';
          context_id?: string | null;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          context_type?: 'personal' | 'relational' | 'collective';
          context_id?: string | null;
          messages?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      sharing_settings: {
        Row: {
          id: string;
          user_id: string;
          target_user_id: string | null;
          target_family_id: string | null;
          shareable_fields: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_user_id?: string | null;
          target_family_id?: string | null;
          shareable_fields?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          target_user_id?: string | null;
          target_family_id?: string | null;
          shareable_fields?: string[];
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
