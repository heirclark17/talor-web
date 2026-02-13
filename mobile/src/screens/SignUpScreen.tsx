import React from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { SignUp, useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import { COLORS, GLASS, SPACING, RADIUS } from '../utils/constants';
import { useEffect } from 'react';

export default function SignUpScreen() {
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
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                afterSignUpUrl="/"
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
