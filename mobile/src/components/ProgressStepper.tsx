import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Check } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface Step {
  id: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface ProgressStepperProps {
  /** Array of step definitions */
  steps: Step[];
  /** Current active step index (0-based) */
  currentStep: number;
  /** Callback when a completed step is clicked */
  onStepClick?: (stepIndex: number) => void;
  /** Visual style variant */
  variant?: 'default' | 'compact' | 'vertical';
  /** Additional styles */
  style?: StyleProp<ViewStyle>;
  /** Whether to allow clicking on completed steps */
  allowStepClick?: boolean;
}

/**
 * Progress stepper component for multi-step workflows.
 * Shows visual progress through a series of steps.
 *
 * Variants:
 * - default: Horizontal with labels below each step
 * - compact: Minimal dots only
 * - vertical: Stacked with descriptions
 */
export default function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  variant = 'default',
  style,
  allowStepClick = true,
}: ProgressStepperProps) {
  const { colors, isDark } = useTheme();

  const handleStepClick = useCallback(
    (index: number) => {
      if (allowStepClick && index < currentStep && onStepClick) {
        onStepClick(index);
      }
    },
    [allowStepClick, currentStep, onStepClick]
  );

  // Compact variant - minimal dots
  if (variant === 'compact') {
    return (
      <View
        style={[styles.compactContainer, style]}
        accessibilityRole="progressbar"
        accessibilityLabel={`Step ${currentStep + 1} of ${steps.length}`}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = allowStepClick && isCompleted && onStepClick;

          return (
            <TouchableOpacity
              key={step.id}
              onPress={() => handleStepClick(index)}
              disabled={!isClickable}
              accessibilityRole="button"
              accessibilityLabel={`Step ${index + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
              accessibilityState={{ selected: isCurrent }}
              style={[
                styles.compactDot,
                {
                  backgroundColor: isCompleted
                    ? COLORS.success
                    : isCurrent
                    ? COLORS.primary
                    : colors.backgroundTertiary,
                },
                isCurrent && styles.compactDotCurrent,
              ]}
            />
          );
        })}
      </View>
    );
  }

  // Vertical variant - stacked with descriptions
  if (variant === 'vertical') {
    return (
      <View
        style={[styles.verticalContainer, style]}
        accessibilityRole="progressbar"
        accessibilityLabel={`Step ${currentStep + 1} of ${steps.length}`}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = allowStepClick && isCompleted && onStepClick;
          const isLast = index === steps.length - 1;

          return (
            <View key={step.id} style={styles.verticalStepWrapper}>
              {/* Step indicator and line */}
              <View style={styles.verticalIndicatorColumn}>
                <TouchableOpacity
                  onPress={() => handleStepClick(index)}
                  disabled={!isClickable}
                  accessibilityRole="button"
                  accessibilityLabel={`Step ${index + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                  accessibilityState={{ selected: isCurrent }}
                  style={[
                    styles.verticalStepCircle,
                    {
                      backgroundColor: isCompleted
                        ? COLORS.success
                        : isCurrent
                        ? COLORS.primary
                        : colors.backgroundTertiary,
                      borderColor: isCompleted
                        ? COLORS.success
                        : isCurrent
                        ? COLORS.primary
                        : colors.border,
                    },
                    isCurrent && styles.verticalStepCircleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Check color="#ffffff" size={18} />
                  ) : (
                    step.icon || (
                      <Text
                        style={[
                          styles.verticalStepNumber,
                          {
                            color: isCurrent ? '#ffffff' : colors.textSecondary,
                          },
                        ]}
                      >
                        {index + 1}
                      </Text>
                    )
                  )}
                </TouchableOpacity>

                {/* Connector line */}
                {!isLast && (
                  <View
                    style={[
                      styles.verticalLine,
                      {
                        backgroundColor: isCompleted
                          ? COLORS.success
                          : colors.border,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Step content */}
              <View style={styles.verticalContent}>
                <Text
                  style={[
                    styles.verticalLabel,
                    {
                      color: isCurrent
                        ? colors.text
                        : isCompleted
                        ? COLORS.success
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {step.label}
                </Text>
                {step.description && (
                  <Text
                    style={[
                      styles.verticalDescription,
                      { color: colors.textTertiary },
                    ]}
                  >
                    {step.description}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Default variant - horizontal with labels
  return (
    <View
      style={[styles.defaultContainer, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentStep + 1} of ${steps.length}`}
    >
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isClickable = allowStepClick && isCompleted && onStepClick;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.id}>
            {/* Step circle and label */}
            <View style={styles.defaultStepWrapper}>
              <TouchableOpacity
                onPress={() => handleStepClick(index)}
                disabled={!isClickable}
                accessibilityRole="button"
                accessibilityLabel={`Step ${index + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                accessibilityState={{ selected: isCurrent }}
                style={[
                  styles.defaultStepCircle,
                  {
                    backgroundColor: isCompleted
                      ? COLORS.success
                      : isCurrent
                      ? COLORS.primary
                      : colors.backgroundTertiary,
                    borderColor: isCompleted
                      ? COLORS.success
                      : isCurrent
                      ? COLORS.primary
                      : colors.border,
                  },
                  isCurrent && styles.defaultStepCircleCurrent,
                  isClickable && styles.defaultStepClickable,
                ]}
              >
                {isCompleted ? (
                  <Check color="#ffffff" size={20} />
                ) : (
                  step.icon || (
                    <Text
                      style={[
                        styles.defaultStepNumber,
                        {
                          color: isCurrent ? '#ffffff' : colors.textSecondary,
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )
                )}
              </TouchableOpacity>

              {/* Label */}
              <Text
                style={[
                  styles.defaultLabel,
                  {
                    color: isCurrent
                      ? colors.text
                      : isCompleted
                      ? COLORS.success
                      : colors.textSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>

              {/* Description (optional, hidden on small screens) */}
              {step.description && (
                <Text
                  style={[
                    styles.defaultDescription,
                    { color: colors.textTertiary },
                  ]}
                  numberOfLines={2}
                >
                  {step.description}
                </Text>
              )}
            </View>

            {/* Connector line */}
            {!isLast && (
              <View
                style={[
                  styles.defaultLine,
                  {
                    backgroundColor: isCompleted
                      ? COLORS.success
                      : colors.border,
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

/**
 * Hook for managing step navigation state
 */
export function useStepNavigation(totalSteps: number, initialStep = 0) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const completeStep = useCallback((step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(initialStep);
    setCompletedSteps(new Set());
  }, [initialStep]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isStepCompleted = (step: number) => completedSteps.has(step);
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return {
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    completeStep,
    reset,
    isFirstStep,
    isLastStep,
    isStepCompleted,
    completedSteps,
    progress,
  };
}

const styles = StyleSheet.create({
  // Compact variant
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  compactDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  compactDotCurrent: {
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },

  // Vertical variant
  verticalContainer: {
    flexDirection: 'column',
  },
  verticalStepWrapper: {
    flexDirection: 'row',
  },
  verticalIndicatorColumn: {
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  verticalStepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  verticalStepCircleCurrent: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  verticalStepNumber: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  verticalLine: {
    width: 2,
    height: 48,
    marginVertical: SPACING.xs,
  },
  verticalContent: {
    flex: 1,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  verticalLabel: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  verticalDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },

  // Default variant
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  defaultStepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  defaultStepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  defaultStepCircleCurrent: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  defaultStepClickable: {
    transform: [{ scale: 1 }],
  },
  defaultStepNumber: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  defaultLabel: {
    marginTop: SPACING.sm,
    fontSize: 12,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    maxWidth: 80,
  },
  defaultDescription: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    maxWidth: 80,
    display: 'none', // Hidden by default on mobile for space
  },
  defaultLine: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    marginTop: 22, // Center with circle
    marginHorizontal: SPACING.xs,
  },
});
