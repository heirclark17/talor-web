import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FileText, Target, Briefcase, Compass, ChevronRight, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, RADIUS, FONTS, ANIMATION, ALPHA_COLORS } from '../utils/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ONBOARDING_COMPLETE_KEY = 'talor_onboarding_complete';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface OnboardingTourProps {
  /** Force show the tour even if previously completed */
  forceShow?: boolean;
  /** Callback when tour completes */
  onComplete?: () => void;
  /** Callback when tour is skipped */
  onSkip?: () => void;
}

/**
 * Onboarding tour component for first-time users
 * Provides a guided walkthrough of the main app features
 */
export function OnboardingTour({ forceShow = false, onComplete, onSkip }: OnboardingTourProps) {
  const { colors, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  const progress = useSharedValue(0);
  const slideAnim = useSharedValue(0);

  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Talor!',
      description: 'Let us show you how to create job-winning resumes in minutes. This quick tour will guide you through the main features.',
      icon: <FileText color={COLORS.primary} size={48} />,
    },
    {
      id: 'upload',
      title: 'Step 1: Upload Your Resume',
      description: 'Start by uploading your existing resume. We support PDF and Word documents. Our AI will parse and understand your experience.',
      icon: <FileText color={COLORS.success} size={48} />,
    },
    {
      id: 'tailor',
      title: 'Step 2: Tailor Your Resume',
      description: 'Paste any job URL and our AI will customize your resume to match the role perfectly. See a side-by-side comparison of changes.',
      icon: <Target color={COLORS.info} size={48} />,
    },
    {
      id: 'interview',
      title: 'Step 3: Prepare for Interviews',
      description: 'Get AI-generated interview prep materials including company research, practice questions, and STAR stories based on your tailored resume.',
      icon: <Briefcase color={COLORS.warning} size={48} />,
    },
    {
      id: 'career',
      title: 'Bonus: Plan Your Career Path',
      description: 'Use our Career Path Designer to get personalized recommendations for transitioning to your dream role.',
      icon: <Compass color={COLORS.purple} size={48} />,
    },
    {
      id: 'complete',
      title: "You're All Set!",
      description: 'Ready to create your first tailored resume? Tap "Get Started" to begin your journey.',
      icon: <Target color={COLORS.primary} size={48} />,
    },
  ];

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        if (!completed || forceShow) {
          // Delay to let the app render first
          setTimeout(() => {
            setVisible(true);
            progress.value = withTiming(1, { duration: ANIMATION.normal });
          }, 1000);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setHasCheckedStorage(true);
      }
    };

    checkOnboardingStatus();
  }, [forceShow, progress]);

  const markComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  }, []);

  const handleNext = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep < steps.length - 1) {
      slideAnim.value = -1;
      slideAnim.value = withSpring(0, {
        damping: ANIMATION.spring.damping,
        stiffness: ANIMATION.spring.stiffness,
      });
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length, slideAnim]);

  const handleBack = useCallback(() => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (currentStep > 0) {
      slideAnim.value = 1;
      slideAnim.value = withSpring(0, {
        damping: ANIMATION.spring.damping,
        stiffness: ANIMATION.spring.stiffness,
      });
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, slideAnim]);

  const handleSkip = useCallback(async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    await markComplete();
    progress.value = withTiming(0, { duration: ANIMATION.fast }, () => {
      runOnJS(setVisible)(false);
    });
    onSkip?.();
  }, [markComplete, progress, onSkip]);

  const handleComplete = useCallback(async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    await markComplete();
    progress.value = withTiming(0, { duration: ANIMATION.fast }, () => {
      runOnJS(setVisible)(false);
    });
    onComplete?.();
  }, [markComplete, progress, onComplete]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: slideAnim.value * 50 },
      { scale: interpolate(progress.value, [0, 1], [0.9, 1], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0.5, 1], Extrapolation.CLAMP),
  }));

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  if (!visible || !hasCheckedStorage) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleSkip}
    >
      <StatusBar barStyle="light-content" />
      <Animated.View style={[styles.overlay, overlayStyle]}>
        {/* Background overlay */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => {}}
        >
          <View style={styles.backdropDark} />
        </TouchableOpacity>

        {/* Content */}
        <Animated.View style={[styles.contentContainer, contentStyle]}>
          <GlassCard style={styles.card} material="thick" shadow="elevated">
            {/* Skip button */}
            {!isLastStep && (
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleSkip}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X color={colors.textTertiary} size={20} />
              </TouchableOpacity>
            )}

            {/* Progress dots */}
            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    {
                      backgroundColor:
                        index === currentStep
                          ? COLORS.primary
                          : index < currentStep
                          ? colors.textTertiary
                          : colors.backgroundTertiary,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>{step.icon}</View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text }]}>{step.title}</Text>

            {/* Description */}
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {step.description}
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {!isFirstStep && (
                <GlassButton
                  label="Back"
                  variant="ghost"
                  size="md"
                  onPress={handleBack}
                  style={styles.backButton}
                />
              )}

              <GlassButton
                label={isLastStep ? 'Get Started' : 'Next'}
                variant="primary"
                size="md"
                icon={!isLastStep ? <ChevronRight color="#ffffff" size={18} /> : undefined}
                iconPosition="right"
                onPress={handleNext}
                style={[styles.nextButton, isFirstStep && styles.fullWidthButton]}
              />
            </View>

            {/* Step counter */}
            <Text style={[styles.stepCounter, { color: colors.textTertiary }]}>
              {currentStep + 1} of {steps.length}
            </Text>
          </GlassCard>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/**
 * Hook to manage onboarding tour state
 */
export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);

  const startTour = useCallback(() => {
    setShowTour(true);
  }, []);

  const resetTour = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      setShowTour(true);
    } catch (error) {
      console.error('Error resetting tour:', error);
    }
  }, []);

  const hasCompletedTour = useCallback(async (): Promise<boolean> => {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking tour completion:', error);
      return false;
    }
  }, []);

  return {
    showTour,
    startTour,
    resetTour,
    hasCompletedTour,
    OnboardingTour: (props: Omit<OnboardingTourProps, 'forceShow'>) => (
      <OnboardingTour {...props} forceShow={showTour} />
    ),
  };
}

export default OnboardingTour;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  backdropDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ALPHA_COLORS.overlay.heavy,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  skipButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: ALPHA_COLORS.primary.bgSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    width: '100%',
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  fullWidthButton: {
    flex: 1,
  },
  stepCounter: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: SPACING.lg,
  },
});
