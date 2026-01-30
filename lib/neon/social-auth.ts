import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './client';

WebBrowser.maybeCompleteAuthSession();

const redirectUri = AuthSession.makeRedirectUri();

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUri,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data.url) {
    return { error: error ?? new Error('Failed to get OAuth URL') };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);

  if (result.type !== 'success' || !result.url) {
    return { error: new Error('Authentication was cancelled') };
  }

  // Extract tokens from the redirect URL
  const url = new URL(result.url);
  // Supabase returns tokens in the hash fragment
  const hashParams = new URLSearchParams(url.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');

  if (!accessToken || !refreshToken) {
    return { error: new Error('No tokens received from authentication') };
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return { error: sessionError };
}
