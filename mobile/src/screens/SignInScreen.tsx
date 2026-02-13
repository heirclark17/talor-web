import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { SignIn, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GLASS, SPACING, RADIUS } from '../utils/constants';
import { useEffect } from 'react';

export default function SignInScreen() {
  const { isSignedIn } = useAuth();
  const navigation = useNavigation();

  // Redirect to home if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigation.navigate('Home' as never);
    }
  }, [isSignedIn, navigation]);

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
          {/* Glassmorphic Container */}
          <BlurView
            intensity={GLASS.getBlurIntensity('regular')}
            tint="dark"
            style={styles.glassContainer}
          >
            <View style={styles.innerContainer}>
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                afterSignInUrl="/"
              />
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
    backgroundColor: COLORS.dark.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
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
});
