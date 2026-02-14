import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff, UserPlus, ShieldCheck } from 'lucide-react-native';
import { COLORS, GLASS, SPACING, RADIUS, FONTS } from '../utils/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AppNavigator';

type SignUpNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const { signUp, resendVerification } = useSupabaseAuth();
  const navigation = useNavigation<SignUpNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

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

    console.log('[SignUp] Starting sign up for:', email.trim());

    const { error: signUpError } = await signUp(email.trim(), password);

    setIsLoading(false);

    if (signUpError) {
      console.error('[SignUp] Error:', signUpError.message);

      // Handle specific error cases
      if (signUpError.message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (signUpError.message.includes('invalid')) {
        setError('Invalid email address');
      } else {
        setError(signUpError.message || 'An error occurred. Please try again.');
      }
      return;
    }

    console.log('[SignUp] Account created successfully');
    setPendingVerification(true);
  };

  const handleResend = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    const { error: resendError } = await resendVerification(email.trim());
    setIsLoading(false);

    if (resendError) {
      Alert.alert('Error', resendError.message || 'Could not resend email');
    } else {
      Alert.alert('Success', 'Verification email sent! Check your inbox.');
    }
  };

  // Verification pending screen
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
              <Text style={styles.title}>Check Your Email</Text>
              <Text style={styles.subtitle}>
                We sent a verification link to{'\n'}
                <Text style={styles.emailText}>{email}</Text>
              </Text>
            </View>

            <BlurView
              intensity={GLASS.getBlurIntensity('regular')}
              tint="dark"
              style={styles.glassContainer}
            >
              <View style={styles.innerContainer}>
                <View style={styles.instructionBox}>
                  <Text style={styles.instructionTitle}>Next Steps:</Text>
                  <Text style={styles.instructionText}>
                    1. Check your email inbox{'\n'}
                    2. Click the verification link{'\n'}
                    3. Return to this app and sign in
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
                  onPress={handleResend}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.signUpButtonText}>Resend Email</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.goBackContainer}>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('[SignUp] User tapped Go Back');
                      setPendingVerification(false);
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.footerLink}>← Go Back to Sign Up</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.goBackContainer}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('SignIn')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.footerLink}>Already verified? Sign In →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </BlurView>

            <View style={{ height: 100 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Sign up form
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
                  placeholder="Password (min 8 characters)"
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

              <View style={styles.inputWrapper}>
                <Lock color={COLORS.dark.textTertiary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  placeholderTextColor={COLORS.dark.textTertiary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  textContentType="newPassword"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showConfirmPassword ? (
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
    paddingBottom: SPACING.xxl,
  },
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: 32, fontFamily: FONTS.bold, color: COLORS.dark.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, fontFamily: FONTS.regular, color: COLORS.dark.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
  emailText: { fontFamily: FONTS.semibold, color: COLORS.primary },
  glassContainer: { borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.dark.glassBorder, overflow: 'hidden' },
  innerContainer: { padding: SPACING.xl },
  errorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  errorText: { color: COLORS.danger, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'center' },
  instructionBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  instructionTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  instructionText: {
    color: COLORS.dark.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderWidth: 1, borderColor: COLORS.dark.glassBorder, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.md, height: 52 },
  input: { flex: 1, color: COLORS.dark.text, fontSize: 16, fontFamily: FONTS.regular, marginLeft: SPACING.sm, height: '100%' },
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
