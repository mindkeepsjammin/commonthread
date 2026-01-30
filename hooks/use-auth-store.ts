import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/types';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSessionExpired: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSessionExpired: (expired: boolean) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isSessionExpired: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      ...initialState,

      setUser: user =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setSession: session =>
        set({
          session,
          isAuthenticated: !!session,
        }),

      setProfile: profile => set({ profile }),

      setLoading: isLoading => set({ isLoading }),

      setSessionExpired: isSessionExpired => set({ isSessionExpired }),

      reset: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        // Only persist non-sensitive data
        profile: state.profile,
      }),
    }
  )
);
