import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Award, Target, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react-native';
import { GlassCard } from '../glass/GlassCard';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../../utils/constants';
import { ReadinessScore, ThemeColors } from './types';
import { ConfidenceBar } from './SharedComponents';

interface ReadinessScoreCardProps {
  score: ReadinessScore;
  loading: boolean;
  colors: ThemeColors;
}

export const ReadinessScoreCard: React.FC<ReadinessScoreCardProps> = ({ score, loading, colors }) => {
  const getConfidenceColor = (level: number) => {
    if (level >= 80) return COLORS.success;
    if (level >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const confidenceColor = getConfidenceColor(score?.confidence_level || 0);

  if (loading) {
    return (
      <GlassCard style={styles.readinessCard} material="regular">
        <View style={styles.readinessHeader}>
          <View style={[styles.readinessIcon, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
            <Award color={COLORS.primary} size={24} />
          </View>
          <Text style={[styles.readinessTitle, { color: colors.text }]}>Interview Readiness Score</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.readinessLoader} />
      </GlassCard>
    );
  }

  if (!score) {
    return null;
  }

  return (
    <GlassCard style={styles.readinessCard} material="regular">
      <View style={styles.readinessHeader}>
        <View style={[styles.readinessIcon, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
          <Award color={COLORS.primary} size={24} />
        </View>
        <Text style={[styles.readinessTitle, { color: colors.text }]}>Interview Readiness Score</Text>
      </View>

      {/* Confidence Level with Progress Bar */}
      <View style={styles.readinessSection}>
        <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Overall Confidence</Text>
        <ConfidenceBar level={score.confidence_level} color={confidenceColor} />
      </View>

      {/* Preparation Level Badge */}
      <View style={styles.readinessSection}>
        <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Preparation Level</Text>
        <View style={[styles.preparationBadge, { backgroundColor: ALPHA_COLORS.info.bg, borderColor: ALPHA_COLORS.info.border }]}>
          <Target color={COLORS.info} size={16} />
          <Text style={[styles.preparationBadgeText, { color: COLORS.info }]}>{score.preparation_level}</Text>
        </View>
      </View>

      {/* Strengths */}
      {score.strengths && score.strengths.length > 0 && (
        <View style={styles.readinessSection}>
          <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Strengths</Text>
          {score.strengths.map((strength, index) => (
            <View key={index} style={styles.readinessItem}>
              <CheckCircle color={COLORS.success} size={16} />
              <Text style={[styles.readinessItemText, { color: colors.textSecondary }]}>{strength}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Areas for Improvement */}
      {score.areas_for_improvement && score.areas_for_improvement.length > 0 && (
        <View style={styles.readinessSection}>
          <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Areas for Improvement</Text>
          {score.areas_for_improvement.map((area, index) => (
            <View key={index} style={styles.readinessItem}>
              <AlertTriangle color={COLORS.warning} size={16} />
              <Text style={[styles.readinessItemText, { color: colors.textSecondary }]}>{area}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {score.recommendations && score.recommendations.length > 0 && (
        <View style={styles.readinessSection}>
          <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Recommendations</Text>
          {score.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.readinessItem}>
              <Lightbulb color={COLORS.purple} size={16} />
              <Text style={[styles.readinessItemText, { color: colors.textSecondary }]}>{recommendation}</Text>
            </View>
          ))}
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  readinessCard: {
    marginBottom: SPACING.lg,
  },
  readinessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  readinessIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  readinessTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  readinessLoader: {
    paddingVertical: SPACING.xl,
  },
  readinessSection: {
    marginBottom: SPACING.lg,
  },
  readinessSectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  readinessItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  readinessItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  preparationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  preparationBadgeText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
});
