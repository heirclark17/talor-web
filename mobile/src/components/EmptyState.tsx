/**
 * Empty State Component
 * Consistent empty state display with actionable CTAs
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS, COLORS, ALPHA_COLORS } from '../utils/constants';
import { GlassButton } from './glass/GlassButton';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: isDark
              ? ALPHA_COLORS.primary.bg
              : ALPHA_COLORS.primary.bgSubtle,
          },
        ]}
      >
        <Ionicons name={icon} size={48} color={COLORS.primary} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {description}
      </Text>

      {actionLabel && onAction && (
        <View style={styles.actions}>
          <GlassButton
            label={actionLabel}
            onPress={onAction}
            variant="primary"
            size="md"
          />

          {secondaryActionLabel && onSecondaryAction && (
            <GlassButton
              label={secondaryActionLabel}
              onPress={onSecondaryAction}
              variant="secondary"
              size="md"
              style={styles.secondaryButton}
            />
          )}
        </View>
      )}
    </View>
  );
}

/**
 * Pre-configured empty states for common scenarios
 */
export function NoResumesEmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      icon="document-text-outline"
      title="No Resumes Yet"
      description="Upload your resume to get started with AI-powered tailoring for your dream job."
      actionLabel="Upload Resume"
      onAction={onUpload}
    />
  );
}

export function NoTailoredResumesEmptyState({ onTailor }: { onTailor: () => void }) {
  return (
    <EmptyState
      icon="sparkles-outline"
      title="No Tailored Resumes"
      description="Customize your resume for specific job postings to increase your chances of landing interviews."
      actionLabel="Tailor a Resume"
      onAction={onTailor}
    />
  );
}

export function NoInterviewPrepsEmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <EmptyState
      icon="chatbubbles-outline"
      title="No Interview Preps"
      description="Generate personalized interview preparation materials based on your tailored resume."
      actionLabel="Generate Interview Prep"
      onAction={onGenerate}
    />
  );
}

export function NoQuestionsEmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <EmptyState
      icon="help-circle-outline"
      title="No Questions Yet"
      description="Generate practice interview questions customized to your experience and the job requirements."
      actionLabel="Generate Questions"
      onAction={onGenerate}
    />
  );
}

export function NoStarStoriesEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon="star-outline"
      title="No STAR Stories"
      description="Build a library of STAR format stories to ace your behavioral interviews."
      actionLabel="Create STAR Story"
      onAction={onAdd}
    />
  );
}

export function NoSavedComparisonsEmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <EmptyState
      icon="bookmark-outline"
      title="No Saved Comparisons"
      description="Save resume comparisons to easily access and share your tailored resumes."
      actionLabel="Browse Resumes"
      onAction={onBrowse}
    />
  );
}

export function NoSearchResultsEmptyState({
  searchQuery,
  onClear,
}: {
  searchQuery: string;
  onClear: () => void;
}) {
  return (
    <EmptyState
      icon="search-outline"
      title="No Results Found"
      description={`No items match "${searchQuery}". Try different keywords or clear the search.`}
      actionLabel="Clear Search"
      onAction={onClear}
    />
  );
}

export function NetworkErrorEmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

export function GenericErrorEmptyState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <EmptyState
      icon="warning-outline"
      title="Something Went Wrong"
      description={message || "An unexpected error occurred. Please try again."}
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    marginBottom: SPACING.lg,
  },
  actions: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 280,
  },
  secondaryButton: {
    marginTop: SPACING.sm,
  },
});

export default EmptyState;
