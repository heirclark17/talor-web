import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { saveAuthToken, clearAuthTokens, getUserId, saveSessionData, saveUserId, clearUserSession } from '../utils/userSession';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
  resendVerification: (email: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (__DEV__) console.log('[SupabaseAuth] Initializing auth provider');

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (__DEV__) console.log('[SupabaseAuth] Initial session:', session ? 'active' : 'none');

      // Save JWT token and user ID for backend API calls
      if (session?.access_token) {
        await saveAuthToken(session.access_token);
        await saveUserId(session.user.id);
        await saveSessionData({
          userId: session.user.id,
          email: session.user.email,
        });
      }

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (__DEV__) console.log('[SupabaseAuth] Auth state changed:', _event);

      // Save or clear JWT token and user ID for backend API calls
      if (session?.access_token) {
        await saveAuthToken(session.access_token);
        await saveUserId(session.user.id);
        await saveSessionData({
          userId: session.user.id,
          email: session.user.email,
        });
      } else {
        await clearAuthTokens();
      }

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (__DEV__) console.log('[SupabaseAuth] Starting sign up');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'talor://auth/callback',
          data: {
            email_confirm_redirect: 'https://talorme.com/auth/confirm',
          }
        },
      });

      if (error) {
        if (__DEV__) console.error('[SupabaseAuth] Sign up error:', error.message);
        return { error };
      }

      if (__DEV__) console.log('[SupabaseAuth] Sign up successful');
      return { error: null, data };
    } catch (error: any) {
      if (__DEV__) console.error('[SupabaseAuth] Sign up exception:', error?.message);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (__DEV__) console.log('[SupabaseAuth] Starting sign in');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (__DEV__) console.error('[SupabaseAuth] Sign in error:', error.message);
        return { error };
      }

      if (__DEV__) console.log('[SupabaseAuth] Sign in successful');
      return { error: null };
    } catch (error: any) {
      if (__DEV__) console.error('[SupabaseAuth] Sign in exception:', error?.message);
      return { error };
    }
  };

  const signOut = async () => {
    if (__DEV__) console.log('[SupabaseAuth] Signing out');

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[SupabaseAuth] Sign out error:', error);
    }
  };

  const deleteAccount = async () => {
    if (__DEV__) console.log('[SupabaseAuth] Deleting account');

    try {
      const accessToken = session?.access_token;
      if (!accessToken) {
        return { error: { message: 'No active session' } };
      }

      // Call backend to delete user data and auth account
      const { API_BASE_URL } = require('../utils/constants');
      const { getUserId: getStoredUserId } = require('../utils/userSession');
      const storedUserId = await getStoredUserId();

      const response = await fetch(`${API_BASE_URL}/api/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-User-ID': storedUserId || '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { error: { message: data.detail || 'Failed to delete account' } };
      }

      // Clear all local data
      await clearUserSession();
      await clearAuthTokens();

      // Sign out locally
      await supabase.auth.signOut();

      return { error: null };
    } catch (error: any) {
      console.error('[SupabaseAuth] Delete account error:', error?.message);
      return { error: { message: error?.message || 'Failed to delete account' } };
    }
  };

  const resendVerification = async (email: string) => {
    if (__DEV__) console.log('[SupabaseAuth] Resending verification email');

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        if (__DEV__) console.error('[SupabaseAuth] Resend error:', error.message);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      if (__DEV__) console.error('[SupabaseAuth] Resend exception:', error?.message);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    if (__DEV__) console.log('[SupabaseAuth] Sending password reset email');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'talor://auth/reset-password',
      });

      if (error) {
        if (__DEV__) console.error('[SupabaseAuth] Reset password error:', error.message);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      if (__DEV__) console.error('[SupabaseAuth] Reset password exception:', error?.message);
      return { error };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isSignedIn: !!user,
    signUp,
    signIn,
    signOut,
    deleteAccount,
    resendVerification,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within SupabaseAuthProvider');
  }
  return context;
}
