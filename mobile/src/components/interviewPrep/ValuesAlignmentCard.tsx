import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Heart, CheckCircle, AlertTriangle, Lightbulb, Users } from 'lucide-react-native';
import { GlassCard } from '../glass/GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../../utils/constants';
import { ValuesAlignment, ThemeColors } from './types';
import { ConfidenceBar } from './SharedComponents';

interface ValuesAlignmentCardProps {
  alignment: ValuesAlignment;
  loading: boolean;
  colors: ThemeColors & { backgroundTertiary?: string };
}

export const ValuesAlignmentCard: React.FC<ValuesAlignmentCardProps> = ({ alignment, loading, colors }) => {
  const { isDark } = useTheme();
  const getAlignmentColor = (score: number) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const alignmentColor = getAlignmentColor(alignment?.alignment_score || 0);

  if (loading) {
    return (
      <GlassCard style={styles.valuesCard} material="regular">
        <View style={styles.valuesHeader}>
          <View style={[styles.valuesIcon, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
            <Heart color={COLORS.error} size={24} />
          </View>
          <Text style={[styles.valuesTitle, { color: colors.text }]}>Values Alignment</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.valuesLoader} />
      </GlassCard>
    );
  }

  if (!alignment) {
    return null;
  }

  return (
    <GlassCard style={styles.valuesCard} material="regular">
      <View style={styles.valuesHeader}>
        <View style={[styles.valuesIcon, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
          <Heart color={COLORS.error} size={24} />
        </View>
        <Text style={[styles.valuesTitle, { color: colors.text }]}>Values Alignment</Text>
      </View>

      {/* Alignment Score with Progress Bar */}
      <View style={styles.valuesSection}>
        <Text style={[styles.valuesSectionTitle, { color: colors.text }]}>Alignment Score</Text>
        <ConfidenceBar level={alignment.alignment_score} color={alignmentColor} />
      </View>

      {/* Matched Values */}
      {alignment.matched_values && alignment.matched_values.length > 0 && (
        <View style={styles.valuesSection}>
          <Text style={[styles.valuesSectionTitle, { color: colors.text }]}>Matched Values</Text>
          {alignment.matched_values.map((match, index) => (
            <View key={index} style={[styles.valuesMatchItem, { borderBottomColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[5] }]}>
              <View style={styles.valuesMatchHeader}>
                <CheckCircle color={COLORS.success} size={16} />
                <Text style={[styles.valuesMatchValue, { color: colors.text }]}>{match.value}</Text>
              </View>
              {match.company_context && (
                <Text style={[styles.valuesMatchContext, { color: colors.textSecondary }]}>
                  Company: {match.company_context}
                </Text>
              )}
              {match.candidate_evidence && (
                <Text style={[styles.valuesMatchEvidence, { color: colors.textTertiary }]}>
                  Your evidence: {match.candidate_evidence}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Value Gaps */}
      {alignment.value_gaps && alignment.value_gaps.length > 0 && (
        <View style={styles.valuesSection}>
          <Text style={[styles.valuesSectionTitle, { color: colors.text }]}>Areas to Develop</Text>
          {alignment.value_gaps.map((gap, index) => (
            <View key={index} style={[styles.valuesGapItem, { borderBottomColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[5] }]}>
              <View style={styles.valuesGapHeader}>
                <AlertTriangle color={COLORS.warning} size={16} />
                <Text style={[styles.valuesGapValue, { color: colors.text }]}>{gap.value}</Text>
              </View>
              {gap.company_context && (
                <Text style={[styles.valuesGapContext, { color: colors.textSecondary }]}>
                  Company: {gap.company_context}
                </Text>
              )}
              {gap.suggestion && (
                <View style={[styles.valuesSuggestionBox, { backgroundColor: ALPHA_COLORS.warning.bg, borderColor: ALPHA_COLORS.warning.border }]}>
                  <Lightbulb color={COLORS.warning} size={14} />
                  <Text style={[styles.valuesSuggestionText, { color: colors.textSecondary }]}>
                    {gap.suggestion}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Cultural Fit Insights */}
      {alignment.cultural_fit_insights && (
        <View style={styles.valuesSection}>
          <Text style={[styles.valuesSectionTitle, { color: colors.text }]}>Cultural Fit Insights</Text>
          <View style={[styles.valuesInsightsBox, { backgroundColor: colors.backgroundTertiary }]}>
            <Users color={COLORS.purple} size={16} />
            <Text style={[styles.valuesInsightsText, { color: colors.textSecondary }]}>
              {alignment.cultural_fit_insights}
            </Text>
          </View>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  valuesCard: {
    marginBottom: SPACING.lg,
  },
  valuesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  valuesIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  valuesTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  valuesLoader: {
    paddingVertical: SPACING.xl,
  },
  valuesSection: {
    marginBottom: SPACING.lg,
  },
  valuesSectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  valuesMatchItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  valuesMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  valuesMatchValue: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
  valuesMatchContext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginLeft: 24,
    marginBottom: SPACING.xs,
  },
  valuesMatchEvidence: {
    fontSize: 12,
    fontFamily: FONTS.italic,
    lineHeight: 16,
    marginLeft: 24,
  },
  valuesGapItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
  },
  valuesGapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  valuesGapValue: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
  valuesGapContext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginLeft: 24,
    marginBottom: SPACING.sm,
  },
  valuesSuggestionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginLeft: 24,
    marginTop: SPACING.xs,
  },
  valuesSuggestionText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  valuesInsightsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  valuesInsightsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
});
