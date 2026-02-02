/**
 * Progress Indicator Component
 * Shows step-by-step progress for long operations like resume tailoring
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS, COLORS, ALPHA_COLORS } from '../utils/constants';
import { Ionicons } from '@expo/vector-icons';

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  title?: string;
  estimatedTime?: string;
  error?: string;
}

export function ProgressIndicator({
  steps,
  currentStep,
  title = 'Processing...',
  estimatedTime,
  error,
}: ProgressIndicatorProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const getStepStatus = (index: number) => {
    if (error && index === currentStep) return 'error';
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />;
      case 'error':
        return <Ionicons name="close-circle" size={24} color={COLORS.danger} />;
      case 'active':
        return <ActivityIndicator size="small" color={COLORS.primary} />;
      default:
        return (
          <View
            style={[
              styles.pendingDot,
              { backgroundColor: colors.textTertiary },
            ]}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      {estimatedTime && !error && (
        <Text style={[styles.estimate, { color: colors.textSecondary }]}>
          {estimatedTime}
        </Text>
      )}

      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isActive = status === 'active';

          return (
            <Animated.View
              key={step.id}
              style={[
                styles.stepRow,
                isActive && { opacity: pulseAnim },
              ]}
            >
              <View style={styles.stepIconContainer}>
                {getStepIcon(status)}
                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.connector,
                      {
                        backgroundColor:
                          status === 'completed'
                            ? COLORS.success
                            : colors.border,
                      },
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color:
                        status === 'pending'
                          ? colors.textTertiary
                          : colors.text,
                      fontFamily:
                        isActive ? FONTS.semibold : FONTS.regular,
                    },
                  ]}
                >
                  {step.label}
                </Text>
                {step.description && isActive && (
                  <Text
                    style={[styles.stepDescription, { color: colors.textSecondary }]}
                  >
                    {step.description}
                  </Text>
                )}
              </View>
            </Animated.View>
          );
        })}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color={COLORS.danger} />
          <Text style={[styles.errorText, { color: COLORS.danger }]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

/**
 * Pre-defined step configurations for common operations
 */
export const TAILOR_STEPS: ProgressStep[] = [
  { id: 'extract', label: 'Extracting job details', description: 'Reading job posting...' },
  { id: 'analyze', label: 'Analyzing requirements', description: 'Identifying key skills...' },
  { id: 'match', label: 'Matching your experience', description: 'Finding relevant achievements...' },
  { id: 'tailor', label: 'Customizing resume', description: 'Crafting tailored content...' },
  { id: 'finalize', label: 'Finalizing', description: 'Generating final document...' },
];

export const INTERVIEW_PREP_STEPS: ProgressStep[] = [
  { id: 'research', label: 'Researching company', description: 'Gathering company info...' },
  { id: 'values', label: 'Analyzing values', description: 'Identifying culture fit...' },
  { id: 'questions', label: 'Generating questions', description: 'Creating practice questions...' },
  { id: 'strategy', label: 'Building strategy', description: 'Developing interview plan...' },
];

export const CAREER_PATH_STEPS: ProgressStep[] = [
  { id: 'analyze', label: 'Analyzing your profile', description: 'Reviewing your experience...' },
  { id: 'research', label: 'Researching opportunities', description: 'Finding career paths...' },
  { id: 'plan', label: 'Creating roadmap', description: 'Building your 5-year plan...' },
  { id: 'resources', label: 'Finding resources', description: 'Identifying learning paths...' },
];

const styles = StyleSheet.create({
  container: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginVertical: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  estimate: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  stepsContainer: {
    marginTop: SPACING.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  stepIconContainer: {
    width: 32,
    alignItems: 'center',
  },
  connector: {
    width: 2,
    height: SPACING.lg,
    marginTop: SPACING.xs,
  },
  stepContent: {
    flex: 1,
    marginLeft: SPACING.sm,
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: 16,
  },
  stepDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  pendingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: ALPHA_COLORS.danger.bgSubtle,
    borderRadius: RADIUS.sm,
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginLeft: SPACING.sm,
    flex: 1,
  },
});

export default ProgressIndicator;
