import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { COLORS, RADIUS, SPACING } from '../utils/constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Single skeleton element with shimmer animation
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = RADIUS.sm,
  style,
}: SkeletonProps) {
  const { isDark } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [0.3, 0.6, 0.3]
    );
    return { opacity };
  });

  const backgroundColor = isDark
    ? COLORS.dark.backgroundTertiary
    : COLORS.light.backgroundTertiary;

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Skeleton for text lines
 */
export function SkeletonText({
  lines = 3,
  lineHeight = 16,
  spacing = SPACING.sm,
  lastLineWidth = '60%',
}: {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
  lastLineWidth?: string | number;
}) {
  return (
    <View style={{ gap: spacing }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </View>
  );
}

/**
 * Skeleton for avatar/profile image
 */
export function SkeletonAvatar({
  size = 48,
  rounded = true,
}: {
  size?: number;
  rounded?: boolean;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      borderRadius={rounded ? size / 2 : RADIUS.md}
    />
  );
}

/**
 * Skeleton for card content (common pattern)
 */
export function SkeletonCard() {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark
            ? COLORS.dark.backgroundSecondary
            : COLORS.light.backgroundSecondary,
          borderColor: isDark
            ? COLORS.dark.border
            : COLORS.light.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <SkeletonAvatar size={40} />
        <View style={styles.cardHeaderText}>
          <Skeleton height={18} width="70%" />
          <Skeleton height={14} width="50%" />
        </View>
      </View>
      <SkeletonText lines={3} />
    </View>
  );
}

/**
 * Skeleton for resume list item
 */
export function SkeletonResumeItem() {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.resumeItem,
        {
          backgroundColor: isDark
            ? COLORS.dark.backgroundSecondary
            : COLORS.light.backgroundSecondary,
          borderColor: isDark
            ? COLORS.dark.border
            : COLORS.light.border,
        },
      ]}
    >
      <View style={styles.resumeItemLeft}>
        <Skeleton width={48} height={48} borderRadius={RADIUS.md} />
        <View style={styles.resumeItemText}>
          <Skeleton height={18} width={150} />
          <Skeleton height={14} width={100} />
        </View>
      </View>
      <View style={styles.resumeItemActions}>
        <Skeleton width={32} height={32} borderRadius={RADIUS.full} />
        <Skeleton width={32} height={32} borderRadius={RADIUS.full} />
      </View>
    </View>
  );
}

/**
 * Skeleton for interview prep item
 */
export function SkeletonInterviewPrepItem() {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.interviewItem,
        {
          backgroundColor: isDark
            ? COLORS.dark.backgroundSecondary
            : COLORS.light.backgroundSecondary,
          borderColor: isDark
            ? COLORS.dark.border
            : COLORS.light.border,
        },
      ]}
    >
      <View style={styles.interviewHeader}>
        <Skeleton height={20} width="60%" />
        <Skeleton width={60} height={24} borderRadius={RADIUS.full} />
      </View>
      <Skeleton height={14} width="80%" />
      <View style={styles.interviewFooter}>
        <Skeleton width={80} height={14} />
        <Skeleton width={100} height={32} borderRadius={RADIUS.md} />
      </View>
    </View>
  );
}

/**
 * Skeleton for career plan card
 */
export function SkeletonCareerPlan() {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.careerCard,
        {
          backgroundColor: isDark
            ? COLORS.dark.backgroundSecondary
            : COLORS.light.backgroundSecondary,
          borderColor: isDark
            ? COLORS.dark.border
            : COLORS.light.border,
        },
      ]}
    >
      <View style={styles.careerHeader}>
        <View style={{ flex: 1 }}>
          <Skeleton height={22} width="50%" />
          <Skeleton height={16} width="40%" style={{ marginTop: SPACING.xs }} />
        </View>
        <Skeleton width={40} height={40} borderRadius={RADIUS.md} />
      </View>

      <View style={styles.careerProgress}>
        <Skeleton height={8} width="100%" borderRadius={RADIUS.full} />
        <View style={styles.careerMilestones}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} width={24} height={24} borderRadius={RADIUS.full} />
          ))}
        </View>
      </View>

      <SkeletonText lines={2} lineHeight={14} />
    </View>
  );
}

/**
 * Full page skeleton loader
 */
export function SkeletonPage({
  type = 'list',
  count = 3,
}: {
  type?: 'list' | 'card' | 'resume' | 'interview' | 'career';
  count?: number;
}) {
  const renderSkeleton = () => {
    switch (type) {
      case 'resume':
        return <SkeletonResumeItem />;
      case 'interview':
        return <SkeletonInterviewPrepItem />;
      case 'career':
        return <SkeletonCareerPlan />;
      case 'card':
        return <SkeletonCard />;
      default:
        return <SkeletonCard />;
    }
  };

  return (
    <View style={styles.page}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.pageItem}>
          {renderSkeleton()}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  cardHeaderText: {
    flex: 1,
    gap: SPACING.xs,
  },
  resumeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
  },
  resumeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  resumeItemText: {
    gap: SPACING.xs,
  },
  resumeItemActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  interviewItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  interviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  interviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  careerCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  careerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  careerProgress: {
    gap: SPACING.sm,
  },
  careerMilestones: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  page: {
    flex: 1,
    padding: SPACING.md,
  },
  pageItem: {
    marginBottom: SPACING.md,
  },
});

export default Skeleton;
