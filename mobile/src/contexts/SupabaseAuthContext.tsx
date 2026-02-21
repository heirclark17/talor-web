import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { saveAuthToken, clearAuthTokens, getUserId, saveSessionData } from '../utils/userSession';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resendVerification: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[SupabaseAuth] Initializing auth provider');

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[SupabaseAuth] Initial session:', session?.user?.email || 'No session');

      // Save JWT token for backend API calls
      if (session?.access_token) {
        console.log('[SupabaseAuth] Saving initial JWT token to secure storage');
        await saveAuthToken(session.access_token);
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
      console.log('[SupabaseAuth] Auth state changed:', _event, 'User:', session?.user?.email || 'No user');

      // Save or clear JWT token for backend API calls
      if (session?.access_token) {
        console.log('[SupabaseAuth] Saving JWT token to secure storage');
        await saveAuthToken(session.access_token);

        // Also save user ID and email for session data
        await saveSessionData({
          userId: session.user.id,
          email: session.user.email,
        });
      } else {
        console.log('[SupabaseAuth] Clearing JWT token from secure storage');
        await clearAuthTokens();
      }

      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      console.log('[SupabaseAuth] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('[SupabaseAuth] Starting sign up for:', email);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'talor://auth/callback',
          // Fallback to web URL if deep link fails
          data: {
            email_confirm_redirect: 'https://talorme.com/auth/confirm',
          }
        },
      });

      if (error) {
        console.error('[SupabaseAuth] Sign up error:', error.message);
        console.error('[SupabaseAuth] Error details:', JSON.stringify(error, null, 2));
        return { error };
      }

      console.log('[SupabaseAuth] Sign up successful!');
      console.log('[SupabaseAuth] User created:', data.user?.email);
      console.log('[SupabaseAuth] User ID:', data.user?.id);
      console.log('[SupabaseAuth] Email confirmed:', data.user?.email_confirmed_at || 'NOT CONFIRMED');
      console.log('[SupabaseAuth] Confirmation required:', !data.user?.email_confirmed_at);

      // Check if user was auto-confirmed (means email confirmations are disabled)
      if (data.user?.email_confirmed_at) {
        console.warn('[SupabaseAuth] ⚠️ User auto-confirmed - email verification is DISABLED in Supabase dashboard');
      } else {
        console.log('[SupabaseAuth] ✉️ Verification email should be sent to:', email);
      }

      return { error: null, data };
    } catch (error: any) {
      console.error('[SupabaseAuth] Sign up exception:', error);
      console.error('[SupabaseAuth] Exception details:', error?.message || error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('[SupabaseAuth] Starting sign in for:', email);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('[SupabaseAuth] Sign in error:', error.message);
        return { error };
      }

      console.log('[SupabaseAuth] Sign in successful!');
      return { error: null };
    } catch (error: any) {
      console.error('[SupabaseAuth] Sign in exception:', error);
      return { error };
    }
  };

  const signOut = async () => {
    console.log('[SupabaseAuth] Signing out');

    try {
      await supabase.auth.signOut();
      console.log('[SupabaseAuth] Sign out successful');
    } catch (error) {
      console.error('[SupabaseAuth] Sign out error:', error);
    }
  };

  const resendVerification = async (email: string) => {
    console.log('[SupabaseAuth] Resending verification email to:', email);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        console.error('[SupabaseAuth] Resend error:', error.message);
        return { error };
      }

      console.log('[SupabaseAuth] Verification email resent successfully');
      return { error: null };
    } catch (error: any) {
      console.error('[SupabaseAuth] Resend exception:', error);
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
    resendVerification,
  };

  console.log('[SupabaseAuth] Context state:', {
    isLoading,
    isSignedIn: !!user,
    userEmail: user?.email || 'none',
  });

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
