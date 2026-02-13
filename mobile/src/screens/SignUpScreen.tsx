import React, { useState, useRef } from 'react';
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
import { useSignUp } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff, UserPlus, ShieldCheck, ArrowLeft } from 'lucide-react-native';
import { COLORS, GLASS, SPACING, RADIUS, FONTS } from '../utils/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AppNavigator';

type SignUpNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

type Step = 'form' | 'verify';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const navigation = useNavigation<SignUpNavigationProp>();

  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const codeInputRef = useRef<TextInput>(null);

  // Step 1: Create sign-up
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

      console.log('[SignUp] status:', result.status, 'session:', result.createdSessionId);

      // Case 1: Sign-up complete with session (no verification needed)
      if (result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        return;
      }

      // Case 2: Sign-up complete but no session yet
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        return;
      }

      // Case 3: Email verification required
      if (result.status === 'missing_requirements') {
        console.log('[SignUp] Email verification required, sending code...');
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        console.log('[SignUp] Verification code sent to', email.trim());
        setStep('verify');
        // Auto-focus code input after a short delay
        setTimeout(() => codeInputRef.current?.focus(), 300);
        return;
      }

      setError('Could not complete sign-up. Please try again.');
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const msg = clerkError?.longMessage || clerkError?.message || '';

      // If account already exists, tell user to sign in
      if (msg.includes('already') || msg.includes('taken') || clerkError?.code === 'form_identifier_exists') {
        setError('An account with this email already exists. Please sign in instead.');
        return;
      }

      setError(msg || 'An error occurred. Please try again.');
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

      console.log('[SignUp] Verification result:', result.status, 'session:', result.createdSessionId);

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        return;
      }

      if (result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        return;
      }

      setError('Verification could not be completed. Please try again.');
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      const msg = clerkError?.longMessage || clerkError?.message || '';

      if (msg.includes('incorrect') || msg.includes('expired') || msg.includes('invalid')) {
        setError('Invalid or expired code. Please try again or resend.');
      } else {
        setError(msg || 'Verification failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResendCode = async () => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError('');

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setError(''); // Clear any previous error
      setCode(''); // Clear old code
      console.log('[SignUp] Verification code resent to', email.trim());
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || '';
      setError(msg || 'Could not resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to form from verification
  const handleBackToForm = () => {
    setStep('form');
    setCode('');
    setError('');
  };

  // Render the email + password form
  const renderForm = () => (
    <>
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
    </>
  );

  // Render the verification code input
  const renderVerification = () => (
    <>
      <View style={styles.header}>
        <ShieldCheck color={COLORS.primary} size={48} style={{ marginBottom: SPACING.md }} />
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          We sent a verification code to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>
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
            <ShieldCheck color={COLORS.dark.textTertiary} size={20} />
            <TextInput
              ref={codeInputRef}
              style={styles.input}
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
              <>
                <ShieldCheck color="#fff" size={20} />
                <Text style={styles.signUpButtonText}>Verify & Continue</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.footerText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
              <Text style={styles.footerLink}> Resend</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToForm}
            disabled={isLoading}
          >
            <ArrowLeft color={COLORS.dark.textSecondary} size={16} />
            <Text style={styles.backButtonText}>Back to sign up</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </>
  );

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
          {step === 'form' ? renderForm() : renderVerification()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: 32, fontFamily: FONTS.bold, color: COLORS.dark.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, fontFamily: FONTS.regular, color: COLORS.dark.textSecondary, textAlign: 'center', lineHeight: 24 },
  emailHighlight: { color: COLORS.primary, fontFamily: FONTS.semibold },
  glassContainer: { borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.dark.glassBorder, overflow: 'hidden' },
  innerContainer: { padding: SPACING.xl },
  errorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  errorText: { color: COLORS.danger, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'center' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1, borderColor: COLORS.dark.glassBorder, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.md, height: 52 },
  input: { flex: 1, color: COLORS.dark.text, fontSize: 16, fontFamily: FONTS.regular, marginLeft: SPACING.sm, height: '100%' },
  signUpButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 52, marginTop: SPACING.sm, gap: SPACING.sm },
  signUpButtonDisabled: { opacity: 0.6 },
  signUpButtonText: { color: '#fff', fontSize: 16, fontFamily: FONTS.semibold },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  footerText: { color: COLORS.dark.textSecondary, fontSize: 14, fontFamily: FONTS.regular },
  footerLink: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.semibold },
  resendRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  backButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: SPACING.md, gap: SPACING.xs },
  backButtonText: { color: COLORS.dark.textSecondary, fontSize: 14, fontFamily: FONTS.regular },
});
