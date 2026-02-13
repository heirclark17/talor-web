# Supabase Auth Migration Guide

## Why Switch from Clerk to Supabase?

### Clerk Pain Points:
- Complex session management with "pending" states
- Separate auth service (another moving part)
- Unclear error messages ("already logged in" but not really)
- Test account pollution issues
- Expensive after free tier ($25/month)

### Supabase Benefits:
- Auth is part of your database (one less service)
- Simple token management (JWT stored locally)
- Clear user state (user exists in database = authenticated)
- Better debugging (can see user records directly)
- Free tier: 50,000 MAU (vs Clerk's 10,000)
- Email verification is built-in and straightforward

---

## Migration Steps

### 1. Set Up Supabase Project (10 minutes)

```bash
# 1. Create Supabase account
# Go to: https://supabase.com/dashboard

# 2. Create new project
# Name: talor-app
# Database Password: [save this securely]
# Region: [closest to you]

# 3. Get API keys from project settings
# Settings → API → Copy these:
# - Project URL: https://xxx.supabase.co
# - anon public key: eyJhbG...
```

### 2. Install Supabase Client (2 minutes)

```bash
cd /c/Users/derri/projects/resume-ai-app/mobile

# Install Supabase client
npm install @supabase/supabase-js

# Install URL polyfill for React Native
npm install react-native-url-polyfill

# Install secure storage (Supabase uses this for tokens)
# Already installed: @react-native-async-storage/async-storage
```

### 3. Configure Supabase Client (5 minutes)

Create `src/lib/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://YOUR_PROJECT.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 4. Create Auth Context (15 minutes)

Create `src/contexts/SupabaseAuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[SupabaseAuth] Initial session:', session?.user?.email || 'none');
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[SupabaseAuth] Auth state changed:', _event, session?.user?.email || 'none');
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('[SupabaseAuth] Signing up:', email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'talor://auth/callback',
      },
    });

    if (error) {
      console.error('[SupabaseAuth] Sign up error:', error.message);
    } else {
      console.log('[SupabaseAuth] Sign up successful - check email for verification');
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('[SupabaseAuth] Signing in:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[SupabaseAuth] Sign in error:', error.message);
    } else {
      console.log('[SupabaseAuth] Sign in successful');
    }

    return { error };
  };

  const signOut = async () => {
    console.log('[SupabaseAuth] Signing out');
    await supabase.auth.signOut();
  };

  const resendVerification = async (email: string) => {
    console.log('[SupabaseAuth] Resending verification to:', email);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    if (error) {
      console.error('[SupabaseAuth] Resend error:', error.message);
    }

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        resendVerification,
      }}
    >
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
```

### 5. Update App Navigator (10 minutes)

Modify `src/navigation/AppNavigator.tsx`:

```typescript
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export default function AppNavigator() {
  const { user, isLoading } = useSupabaseAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  console.log('[AppNavigator] User state:', user ? 'authenticated' : 'not authenticated');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth screens
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          // Main app screens
          <Stack.Screen name="MainTabs" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 6. Update Sign Up Screen (20 minutes)

Modify `src/screens/SignUpScreen.tsx`:

```typescript
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export default function SignUpScreen() {
  const { signUp, resendVerification } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      // Show verification screen
      setPendingVerification(true);
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsLoading(true);
    const { error } = await resendVerification(email);
    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      Alert.alert('Success', 'Verification email sent!');
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.message}>
          We've sent a verification link to {email}
        </Text>
        <Text style={styles.instruction}>
          Click the link in the email to verify your account, then return to the app.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleResend}>
          <Text style={styles.buttonText}>Resend Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => setPendingVerification(false)}
        >
          <Text style={styles.linkText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 7. Update Sign In Screen (15 minutes)

Similar pattern - use `signIn` from context instead of Clerk.

### 8. Remove Clerk Dependencies (5 minutes)

```bash
# Uninstall Clerk
npm uninstall @clerk/clerk-expo

# Remove Clerk config from app.json
# Delete the "plugins" section with Clerk
```

### 9. Test Auth Flow (15 minutes)

```bash
# Clear everything
npx expo start --clear

# Install on device
# Test: Sign up → Verify email → Auto login → Success
```

---

## Comparison: Clerk vs Supabase

| Feature | Clerk | Supabase |
|---------|-------|----------|
| **Setup Complexity** | Medium (third-party service) | Low (integrated with DB) |
| **Email Verification** | Complex pending state | Simple email link |
| **User Management** | Clerk Dashboard | Supabase Dashboard (SQL) |
| **Session Management** | Complex (pending sessions) | Simple (JWT token) |
| **Debugging** | Hard (external service) | Easy (see DB directly) |
| **Free Tier** | 10,000 MAU | 50,000 MAU |
| **Pricing (after free)** | $25/mo | $25/mo |
| **Error Messages** | Vague | Clear |
| **Test Account Issues** | Common | Rare |

---

## Decision

**Try Clerk one more time** with clean state (Path 1), but if it still fails:

**Switch to Supabase** - the migration takes ~2 hours and will save you days of debugging.
