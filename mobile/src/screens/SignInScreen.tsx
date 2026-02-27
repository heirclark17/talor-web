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
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { COLORS, GLASS, SPACING, RADIUS, FONTS } from '../utils/constants';
import { useTheme } from '../context/ThemeContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AppNavigator';

type SignInNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const { signIn, resetPassword } = useSupabaseAuth();
  const navigation = useNavigation<SignInNavigationProp>();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    if (__DEV__) console.log('[SignIn] Signing in');

    const { error: signInError } = await signIn(email.trim(), password);

    setIsLoading(false);

    if (signInError) {
      console.error('[SignIn] Error:', signInError.message);

      // Handle specific error cases
      if (signInError.message.includes('Invalid login credentials')) {
        setError('Invalid email or password');
      } else if (signInError.message.includes('Email not confirmed')) {
        setError('Please verify your email before signing in. Check your inbox for the verification link.');
      } else {
        setError(signInError.message || 'An error occurred. Please try again.');
      }
      return;
    }

    console.log('[SignIn] Successfully signed in!');
    // Navigation happens automatically via AppNavigator when isSignedIn becomes true
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address first, then tap "Forgot Password?"');
      return;
    }

    setIsLoading(true);
    const { error: resetError } = await resetPassword(email.trim());
    setIsLoading(false);

    if (resetError) {
      Alert.alert('Error', resetError.message || 'Could not send reset email. Please try again.');
    } else {
      Alert.alert('Check Your Email', `We sent a password reset link to ${email.trim()}`);
    }
  };

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
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to continue with Talor</Text>
          </View>

          <BlurView
            intensity={GLASS.getBlurIntensity('regular')}
            tint={isDark ? 'dark' : 'light'}
            style={[styles.glassContainer, { borderColor: colors.glassBorder }]}
          >
            <View style={styles.innerContainer}>
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={[styles.inputWrapper, { borderColor: colors.glassBorder, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' }]}>
                <Mail color={colors.textTertiary} size={20} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email address"
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  editable={!isLoading}
                />
              </View>

              <View style={[styles.inputWrapper, { borderColor: colors.glassBorder, backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)' }]}>
                <Lock color={colors.textTertiary} size={20} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Password"
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  textContentType="password"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff color={colors.textTertiary} size={20} />
                  ) : (
                    <Eye color={colors.textTertiary} size={20} />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPasswordContainer}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={[styles.forgotPasswordText, { color: colors.textSecondary }]}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
                onPress={handleSignIn}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <LogIn color="#fff" size={20} />
                    <Text style={styles.signInButtonText}>Sign In</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textSecondary }]}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                  <Text style={styles.footerLink}> Sign Up</Text>
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
  header: { alignItems: 'center', marginBottom: SPACING.xl },
  title: { fontSize: 34, fontFamily: FONTS.semibold, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, fontFamily: FONTS.regular, textAlign: 'center', marginTop: SPACING.sm },
  glassContainer: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  innerContainer: { padding: SPACING.xl },
  errorContainer: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md },
  errorText: { color: COLORS.danger, fontSize: 14, fontFamily: FONTS.medium, textAlign: 'center' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.md, height: 52 },
  input: { flex: 1, fontSize: 16, fontFamily: FONTS.regular, marginLeft: SPACING.sm, height: '100%' },
  forgotPasswordContainer: { alignSelf: 'flex-end', marginBottom: SPACING.sm },
  forgotPasswordText: { fontSize: 14, fontFamily: FONTS.medium },
  signInButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, borderRadius: RADIUS.md, height: 52, marginTop: SPACING.sm, gap: SPACING.sm },
  signInButtonDisabled: { opacity: 0.6 },
  signInButtonText: { color: '#fff', fontSize: 16, fontFamily: FONTS.semibold },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  footerText: { fontSize: 14, fontFamily: FONTS.regular },
  footerLink: { color: COLORS.primary, fontSize: 14, fontFamily: FONTS.semibold },
});
