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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useSignIn, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react-native';
import { COLORS, GLASS, SPACING, RADIUS, FONTS } from '../utils/constants';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/AppNavigator';

type SignInNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const navigation = useNavigation<SignInNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!isLoaded) return;
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      console.log('[SignIn] Result status:', result.status);
      console.log('[SignIn] Session ID:', result.createdSessionId);
      console.log('[SignIn] First factor:', JSON.stringify(result.firstFactorVerification));
      console.log('[SignIn] Second factor:', JSON.stringify(result.secondFactorVerification));

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      } else if (result.createdSessionId) {
        // Status not 'complete' but session exists - activate it anyway
        await setActive({ session: result.createdSessionId });
      } else if (result.status === 'needs_first_factor') {
        // Password wasn't enough, try submitting password as first factor
        const factorResult = await signIn.attemptFirstFactor({
          strategy: 'password',
          password,
        });
        console.log('[SignIn] Factor result:', factorResult.status, factorResult.createdSessionId);
        if (factorResult.createdSessionId) {
          await setActive({ session: factorResult.createdSessionId });
        } else {
          setError('Sign in could not be completed. Please try again.');
        }
      } else {
        setError(`Sign in status: ${result.status}. Please try again.`);
      }
    } catch (err: any) {
      const clerkError = err?.errors?.[0];
      if (clerkError) {
        setError(clerkError.longMessage || clerkError.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to Talor</Text>
          </View>

          {/* Glassmorphic Container */}
          <BlurView
            intensity={GLASS.getBlurIntensity('regular')}
            tint="dark"
            style={styles.glassContainer}
          >
            <View style={styles.innerContainer}>
              {/* Error Message */}
              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email Input */}
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

              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Lock color={COLORS.dark.textTertiary} size={20} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={COLORS.dark.textTertiary}
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
                    <EyeOff color={COLORS.dark.textTertiary} size={20} />
                  ) : (
                    <Eye color={COLORS.dark.textTertiary} size={20} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
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

              {/* Sign Up Link */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
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
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.dark.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
  },
  glassContainer: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    overflow: 'hidden',
  },
  innerContainer: {
    padding: SPACING.xl,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    fontFamily: FONTS.medium,
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    height: 52,
  },
  input: {
    flex: 1,
    color: COLORS.dark.text,
    fontSize: 16,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.sm,
    height: '100%',
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    height: 52,
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  signInButtonDisabled: {
    opacity: 0.6,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  footerText: {
    color: COLORS.dark.textSecondary,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
});
