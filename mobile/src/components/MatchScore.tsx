import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface CategoryScore {
  skills_match: number;
  experience_relevance: number;
  keyword_optimization: number;
  role_alignment: number;
}

interface Improvement {
  suggestion: string;
  priority: 'high' | 'medium' | 'low';
  potential_score_gain: number;
  rationale: string;
}

interface MatchScoreData {
  overall_score: number;
  grade: string;
  category_scores: CategoryScore;
  strengths: string[];
  gaps: string[];
  improvements: Improvement[];
  explanation: string;
}

interface MatchScoreProps {
  matchScore: MatchScoreData | null;
  loading: boolean;
}

export default function MatchScore({ matchScore, loading }: MatchScoreProps) {
  const { colors } = useTheme();

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  const getPriorityColors = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: ALPHA_COLORS.danger.bg,
          border: ALPHA_COLORS.danger.border,
          text: COLORS.danger,
        };
      case 'medium':
        return {
          bg: ALPHA_COLORS.warning.bg,
          border: ALPHA_COLORS.warning.border,
          text: COLORS.warning,
        };
      case 'low':
        return {
          bg: ALPHA_COLORS.primary.bg,
          border: ALPHA_COLORS.primary.border,
          text: COLORS.info,
        };
      default:
        return {
          bg: colors.backgroundTertiary,
          border: colors.border,
          text: colors.textSecondary,
        };
    }
  };

  if (loading) {
    return (
      <GlassCard material="regular" style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Calculating match score...
        </Text>
      </GlassCard>
    );
  }

  if (!matchScore) {
    return (
      <GlassCard material="regular" style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No match score available.
        </Text>
      </GlassCard>
    );
  }

  // Ensure score is in valid range
  const validatedScore = Math.max(0, Math.min(100, matchScore.overall_score));

  return (
    <View style={styles.container}>
      {/* Overall Score */}
      <GlassCard material="regular" shadow="subtle" style={styles.card}>
        <View style={styles.scoreHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Match Score</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              How well your resume matches this job
            </Text>
          </View>
          <View style={styles.scoreDisplay}>
            <Text
              style={[styles.scoreValue, { color: getScoreColor(validatedScore) }]}
              accessibilityLabel={`Match score ${validatedScore} out of 100`}
            >
              {validatedScore}
            </Text>
            <Text style={[styles.scoreGrade, { color: colors.textSecondary }]}>
              {matchScore.grade || getScoreGrade(validatedScore)}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: colors.backgroundTertiary }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: getProgressBarColor(validatedScore),
                width: `${validatedScore}%`,
              },
            ]}
            accessibilityLabel={`Progress bar showing ${validatedScore} percent`}
          />
        </View>
      </GlassCard>

      {/* Category Breakdowns */}
      <GlassCard material="regular" shadow="subtle" style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Score Breakdown</Text>
        <View style={styles.categoriesContainer}>
          {Object.entries(matchScore.category_scores).map(([category, score]) => {
            const validatedCategoryScore = Math.max(0, Math.min(100, score));
            const categoryLabel = category
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');

            return (
              <View key={category} style={styles.categoryItem}>
                <View style={styles.categoryHeader}>
                  <Text style={[styles.categoryLabel, { color: colors.textSecondary }]}>
                    {categoryLabel}
                  </Text>
                  <Text
                    style={[
                      styles.categoryScore,
                      { color: getScoreColor(validatedCategoryScore) },
                    ]}
                  >
                    {validatedCategoryScore}/100
                  </Text>
                </View>
                <View
                  style={[styles.categoryProgressTrack, { backgroundColor: colors.backgroundTertiary }]}
                >
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        backgroundColor: getProgressBarColor(validatedCategoryScore),
                        width: `${validatedCategoryScore}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </GlassCard>

      {/* Strengths */}
      <GlassCard material="regular" shadow="subtle" style={styles.card}>
        <View style={styles.sectionHeader}>
          <CheckCircle color={COLORS.success} size={20} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Strengths</Text>
        </View>
        <View style={styles.listContainer}>
          {matchScore.strengths && matchScore.strengths.length > 0 ? (
            matchScore.strengths.map((strength, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={[styles.bullet, { color: COLORS.success }]}>✓</Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>{strength}</Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No strengths identified.
            </Text>
          )}
        </View>
      </GlassCard>

      {/* Gaps */}
      {matchScore.gaps && matchScore.gaps.length > 0 && (
        <GlassCard material="regular" shadow="subtle" style={styles.card}>
          <View style={styles.sectionHeader}>
            <AlertTriangle color={COLORS.warning} size={20} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Areas for Improvement
            </Text>
          </View>
          <View style={styles.listContainer}>
            {matchScore.gaps.map((gap, idx) => (
              <View key={idx} style={styles.listItem}>
                <Text style={[styles.bullet, { color: COLORS.warning }]}>⚠</Text>
                <Text style={[styles.listText, { color: colors.textSecondary }]}>{gap}</Text>
              </View>
            ))}
          </View>
        </GlassCard>
      )}

      {/* Improvement Suggestions */}
      <GlassCard material="regular" shadow="subtle" style={styles.card}>
        <View style={styles.sectionHeader}>
          <Target color={COLORS.info} size={20} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Recommendations</Text>
        </View>
        <View style={styles.suggestionsContainer}>
          {matchScore.improvements && matchScore.improvements.length > 0 ? (
            matchScore.improvements.map((improvement, idx) => {
              const priorityColors = getPriorityColors(improvement.priority);
              return (
                <View
                  key={idx}
                  style={[
                    styles.suggestionCard,
                    { backgroundColor: colors.backgroundTertiary },
                  ]}
                >
                  <View style={styles.suggestionHeader}>
                    <View
                      style={[
                        styles.priorityBadge,
                        {
                          backgroundColor: priorityColors.bg,
                          borderColor: priorityColors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.priorityText, { color: priorityColors.text }]}
                      >
                        {improvement.priority} priority
                      </Text>
                    </View>
                    {improvement.potential_score_gain > 0 && (
                      <View style={styles.gainBadge}>
                        <TrendingUp color={COLORS.success} size={12} />
                        <Text style={[styles.gainText, { color: COLORS.success }]}>
                          +{improvement.potential_score_gain} points
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.suggestionText, { color: colors.text }]}>
                    {improvement.suggestion}
                  </Text>
                  <Text style={[styles.rationaleText, { color: colors.textTertiary }]}>
                    {improvement.rationale}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No recommendations at this time.
            </Text>
          )}
        </View>
      </GlassCard>

      {/* AI Explanation */}
      <GlassCard material="regular" shadow="subtle" style={styles.card}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Detailed Analysis</Text>
        <Text style={[styles.explanationText, { color: colors.textSecondary }]}>
          {matchScore.explanation}
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  card: {
    padding: SPACING.lg,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  scoreDisplay: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    lineHeight: 52,
  },
  scoreGrade: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  progressBarTrack: {
    width: '100%',
    height: 12,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  categoriesContainer: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  categoryItem: {
    gap: SPACING.xs,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  categoryScore: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  categoryProgressTrack: {
    width: '100%',
    height: 8,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  listContainer: {
    gap: SPACING.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  bullet: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  suggestionsContainer: {
    gap: SPACING.sm,
  },
  suggestionCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  suggestionHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    textTransform: 'capitalize',
  },
  gainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: ALPHA_COLORS.success.bg,
    borderWidth: 1,
    borderColor: ALPHA_COLORS.success.border,
    borderRadius: RADIUS.sm,
  },
  gainText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  rationaleText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    marginTop: SPACING.sm,
  },
});
