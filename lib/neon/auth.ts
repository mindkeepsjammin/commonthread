import { getSupabase } from './client';
import type { AuthError, Session, User } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> => {
  const { data, error } = await getSupabase().auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
};

export const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
};

export const signOut = async (): Promise<{ error: AuthError | null }> => {
  const { error } = await getSupabase().auth.signOut();
  return { error };
};

export const getCurrentUser = async (): Promise<User | null> => {
  const {
    data: { user },
  } = await getSupabase().auth.getUser();
  return user;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  return session;
};

export const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
  const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
    redirectTo: 'commonthread://reset-password',
  });
  return { error };
};

export const updatePassword = async (
  newPassword: string
): Promise<{ error: AuthError | null }> => {
  const { error } = await getSupabase().auth.updateUser({ password: newPassword });
  return { error };
};

export const updateEmail = async (newEmail: string): Promise<{ error: AuthError | null }> => {
  const { error } = await getSupabase().auth.updateUser({ email: newEmail });
  return { error };
};

export const resendVerification = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  const { error } = await getSupabase().auth.resend({ type: 'signup', email });
  return { error };
};
