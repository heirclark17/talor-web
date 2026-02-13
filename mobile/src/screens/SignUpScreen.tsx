import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useSignUp, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff, UserPlus, ShieldCheck } from 'lucide-react-native';
import { COLORS, GLASS, SPACING, RADIUS, FONTS } from '../utils/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AppNavigator';

type SignUpNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { isSignedIn, userId } = useAuth();
  const navigation = useNavigation<SignUpNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationSucceeded, setVerificationSucceeded] = useState(false);

  // Monitor auth state changes after verification attempt
  useEffect(() => {
    if ((isSignedIn || userId) && pendingVerification) {
      console.log('[SignUp] Auth state updated after verification - user is now signed in!');
      console.log('[SignUp] isSignedIn:', isSignedIn, 'userId:', userId);
      setVerificationSucceeded(false); // Clear the flag
      // Auth state has changed, AppNavigator will handle navigation
    }
  }, [isSignedIn, userId, pendingVerification]);

  // Show helpful message if verification succeeded but auth state didn't update
  useEffect(() => {
    if (verificationSucceeded && !isSignedIn && !userId) {
      const timer = setTimeout(() => {
        console.error('[SignUp] Auth state still not updated 2 seconds after verification!');
        setError('Verification succeeded but authentication is still loading. Please restart the app if you\'re not automatically signed in.');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [verificationSucceeded, isSignedIn, userId]);

  // Step 1: Create account and send verification code
  const handleSignUp = async () => {
    if (!isLoaded || !signUp) return;
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signUp.create({
        emailAddress: email.trim(),
        password,
      });

      console.log('[SignUp] Create status:', result.status);

      // Send email verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      console.log('[SignUp] Verification email sent to', email.trim());

      setPendingVerification(true);
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const msg = clerkError?.longMessage || clerkError?.message || '';

      if (msg.includes('already') || msg.includes('taken') || clerkError?.code === 'form_identifier_exists') {
        setError('Account already exists. Please sign in instead.');
      } else {
        setError(msg || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify email with code
  const handleVerify = async () => {
    if (!isLoaded || !signUp) return;
    if (!code.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      console.log('[SignUp] Verify result:', {
        status: result.status,
        createdSessionId: result.createdSessionId,
        createdUserId: result.createdUserId,
        verifications: result.verifications,
      });

      if (result.createdSessionId) {
        console.log('[SignUp] Setting active session:', result.createdSessionId);

        // Activate the session and wait for Clerk state to update
        await setActive({ session: result.createdSessionId });

        console.log('[SignUp] Session activated! Waiting for Clerk state update...');

        // Give Clerk more time to update its internal state
        // Increased from 100ms to 500ms to ensure state propagates
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if auth state updated
        console.log('[SignUp] After delay - checking auth state...');
        console.log('[SignUp] Current state: isSignedIn=', isSignedIn, 'userId=', userId);

        if (!isSignedIn && !userId) {
          console.warn('[SignUp] WARNING: Auth state did not update after verification!');
          console.warn('[SignUp] Session was activated but Clerk context still shows signed out');
          console.warn('[SignUp] This may indicate a Clerk state propagation issue');
          console.warn('[SignUp] AppNavigator should still pick up the change when context updates');
          console.warn('[SignUp] If stuck on auth screen, try:');
          console.warn('[SignUp]   1. Pull down to refresh');
          console.warn('[SignUp]   2. Restart the app');
          console.warn('[SignUp]   3. Check Clerk Dashboard for session status');
        } else {
          console.log('[SignUp] ✓ Verification complete - auth state updated successfully!');
        }

        // Set flag to trigger timeout warning if auth doesn't update
        setVerificationSucceeded(true);

        // Note: Navigation happens automatically via AppNavigator when isSignedIn becomes true
      } else {
        console.error('[SignUp] No session ID returned:', result);
        setError('Could not complete verification. Please try again.');
      }
    } catch (err: any) {
      console.error('[SignUp] Verification error:', err);
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || '';
      setError(msg || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResend = async () => {
    if (!isLoaded || !signUp) return;
    setError('');

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setError('New code sent! Check your email.');
    } catch (err: any) {
      setError('Could not resend code. Please try again.');
    }
  };

  // Step 2 UI: Email verification code input
  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.verificationScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.header}>
              <ShieldCheck color={COLORS.primary} size={48} />
              <Text style={styles.title}>Verify Email</Text>
              <Text style={styles.subtitle}>
                Enter the code sent to {email}
              </Text>
            </View>

            <BlurView
              intensity={GLASS.getBlurIntensity('regular')}
              tint="dark"
              style={styles.glassContainer}
            >
              <View style={styles.innerContainer}>
                {error ? (
                  <View style={[
                    styles.errorContainer,
                    error.includes('sent') && styles.successContainer,
                  ]}>
                    <Text style={[
                      styles.errorText,
                      error.includes('sent') && styles.successText,
                    ]}>{error}</Text>
                  </View>
                ) : null}

                <View style={styles.inputWrapper}>
                  <ShieldCheck color={COLORS.dark.textTertiary} size={20} />
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={COLORS.dark.textTertiary}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!isLoading}
                    autoFocus
                  />
                </View>

                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                  onPress={handleVerify}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Verify & Continue</Text>
                  )}
                </TouchableOpacity>

                {/* Resend link with better visibility */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Didn't get the code?</Text>
                  <TouchableOpacity
                    onPress={handleResend}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.footerLink}> Resend</Text>
                  </TouchableOpacity>
                </View>

                {/* Go Back link with better visibility and spacing */}
                <View style={styles.goBackContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('[SignUp] User tapped Go Back');
                      setPendingVerification(false);
                      setCode('');
                      setError('');
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.footerLink}>← Go Back to Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>

            {/* Extra space to ensure buttons are visible above keyboard */}
            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Step 1 UI: Email + Password form
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started with Talor</Text>
          </View>

          <BlurView
            intensity={GLASS.getBlurIntensity('regular')}
            tint="dark"
            style={styles.glassContainer}
          >
            <View style={styles.innerContainer}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.inputWrapper}>
                <Mail color={COLORS.dark.textTertiary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={COLORS.dark.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Lock color={COLORS.dark.textTertiary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.dark.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff color={COLORS.dark.textTertiary} size={20} />
                  ) : (
                    <Eye color={COLORS.dark.textTertiary} size={20} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                onPress={handleSignUp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <UserPlus color="#fff" size={20} />
                    <Text style={styles.signUpButtonText}>Sign Up</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                  <Text style={styles.footerLink}> Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  verificationScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl, // Extra bottom padding for visibility
  },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: 32, fontFamily: FONTS.bold, color: COLORS.dark.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, fontFamily: FONTS.regular, color: COLORS.dark.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
  glassContainer: { borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.dark.glassBorder, overflow: 'hidden' },
  innerContainer: { padding: SPACING.xl },
  errorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  successContainer: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: 'rgba(34, 197, 94, 0.3)' },
  errorText: { color: COLORS.danger, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'center' },
  successText: { color: '#22c55e' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1, borderColor: COLORS.dark.glassBorder, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.md, height: 52 },
  input: { flex: 1, color: COLORS.dark.text, fontSize: 16, fontFamily: FONTS.regular, marginLeft: SPACING.sm, height: '100%' },
  codeInput: { fontSize: 24, letterSpacing: 8, textAlign: 'center', fontFamily: FONTS.semibold },
  signUpButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 52, marginTop: SPACING.sm, gap: SPACING.sm },
  signUpButtonDisabled: { opacity: 0.6 },
  signUpButtonText: { color: '#fff', fontSize: 16, fontFamily: FONTS.semibold },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  footerText: { color: COLORS.dark.textSecondary, fontSize: 14, fontFamily: FONTS.regular },
  footerLink: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.semibold },
  goBackContainer: {
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
});
