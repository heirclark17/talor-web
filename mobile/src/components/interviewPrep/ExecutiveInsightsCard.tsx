import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import {
  Crown, Target, Users, Brain, TrendingUp, MessageCircle, Lightbulb,
  ChevronUp, ChevronDown
} from 'lucide-react-native';
import { GlassCard } from '../glass/GlassCard';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../../utils/constants';
import { ExecutiveInsights, ThemeColors } from './types';

interface ExecutiveInsightsCardProps {
  insights: ExecutiveInsights;
  loading: boolean;
  colors: ThemeColors & { backgroundTertiary?: string; textTertiary?: string };
}

export const ExecutiveInsightsCard: React.FC<ExecutiveInsightsCardProps> = ({
  insights,
  loading,
  colors,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('priorities');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <GlassCard style={styles.executiveCard} material="regular">
        <View style={styles.executiveHeader}>
          <View style={[styles.executiveIcon, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
            <Crown color={COLORS.purple} size={24} />
          </View>
          <Text style={[styles.executiveTitle, { color: colors.text }]}>Executive Insights</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.purple} style={styles.executiveLoader} />
      </GlassCard>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <GlassCard style={styles.executiveCard} material="regular">
      <View style={styles.executiveHeader}>
        <View style={[styles.executiveIcon, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
          <Crown color={COLORS.purple} size={24} />
        </View>
        <Text style={[styles.executiveTitle, { color: colors.text }]}>Executive Insights</Text>
      </View>

      <Text style={[styles.executiveSubtitle, { color: colors.textSecondary }]}>
        Navigate C-suite conversations with confidence
      </Text>

      {/* Executive Priorities */}
      {insights.executive_priorities && insights.executive_priorities.length > 0 && (
        <View style={styles.executiveSection}>
          <TouchableOpacity
            style={styles.executiveSubheader}
            onPress={() => toggleSection('priorities')}
            accessibilityRole="button"
          >
            <View style={styles.executiveSubheaderLeft}>
              <Target color={COLORS.purple} size={16} />
              <Text style={[styles.executiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Executive Priorities
              </Text>
            </View>
            {expandedSection === 'priorities' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'priorities' && (
            <View style={styles.executiveList}>
              {insights.executive_priorities.map((priority, index) => (
                <View key={index} style={styles.executivePriorityItem}>
                  <View style={[styles.executivePriorityDot, { backgroundColor: COLORS.purple }]} />
                  <Text style={[styles.executiveListText, { color: colors.textSecondary }]}>
                    {priority}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Leadership Style */}
      {insights.leadership_style && (
        <View style={styles.executiveSection}>
          <TouchableOpacity
            style={styles.executiveSubheader}
            onPress={() => toggleSection('leadership')}
            accessibilityRole="button"
          >
            <View style={styles.executiveSubheaderLeft}>
              <Users color={COLORS.info} size={16} />
              <Text style={[styles.executiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Leadership Style
              </Text>
            </View>
            {expandedSection === 'leadership' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'leadership' && (
            <View style={[styles.executiveHighlightBox, { backgroundColor: ALPHA_COLORS.info.bg, borderColor: COLORS.info }]}>
              <Text style={[styles.executiveText, { color: colors.text }]}>
                {insights.leadership_style}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Decision Making Factors */}
      {insights.decision_making_factors && insights.decision_making_factors.length > 0 && (
        <View style={styles.executiveSection}>
          <TouchableOpacity
            style={styles.executiveSubheader}
            onPress={() => toggleSection('decisions')}
            accessibilityRole="button"
          >
            <View style={styles.executiveSubheaderLeft}>
              <Brain color={COLORS.warning} size={16} />
              <Text style={[styles.executiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Decision Making Factors
              </Text>
            </View>
            {expandedSection === 'decisions' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'decisions' && (
            <View style={styles.executiveList}>
              {insights.decision_making_factors.map((factor, index) => (
                <View key={index} style={styles.executiveFactorItem}>
                  <View style={[styles.executiveFactorIcon, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
                    <Text style={[styles.executiveFactorNumber, { color: COLORS.warning }]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.executiveListText, { color: colors.textSecondary, flex: 1 }]}>
                    {factor}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Strategic Initiatives */}
      {insights.strategic_initiatives && insights.strategic_initiatives.length > 0 && (
        <View style={styles.executiveSection}>
          <TouchableOpacity
            style={styles.executiveSubheader}
            onPress={() => toggleSection('initiatives')}
            accessibilityRole="button"
          >
            <View style={styles.executiveSubheaderLeft}>
              <TrendingUp color={COLORS.success} size={16} />
              <Text style={[styles.executiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Strategic Initiatives
              </Text>
            </View>
            {expandedSection === 'initiatives' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'initiatives' && (
            <View style={styles.executiveList}>
              {insights.strategic_initiatives.map((initiative, index) => (
                <View key={index} style={styles.executiveInitiativeItem}>
                  <View style={[styles.executiveInitiativeDot, { backgroundColor: COLORS.success }]} />
                  <Text style={[styles.executiveListText, { color: colors.textSecondary }]}>
                    {initiative}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* C-Suite Talking Points - Featured with special styling */}
      {insights.c_suite_talking_points && insights.c_suite_talking_points.length > 0 && (
        <View style={styles.executiveSection}>
          <TouchableOpacity
            style={styles.executiveSubheader}
            onPress={() => toggleSection('talking_points')}
            accessibilityRole="button"
          >
            <View style={styles.executiveSubheaderLeft}>
              <MessageCircle color={COLORS.primary} size={16} />
              <Text style={[styles.executiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                C-Suite Talking Points
              </Text>
              <View style={[styles.executiveFeaturedBadge, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                <Text style={[styles.executiveFeaturedBadgeText, { color: COLORS.primary }]}>KEY</Text>
              </View>
            </View>
            {expandedSection === 'talking_points' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'talking_points' && (
            <View style={[styles.executiveFeaturedBox, { backgroundColor: ALPHA_COLORS.primary.bg, borderColor: COLORS.primary }]}>
              {insights.c_suite_talking_points.map((point, index) => (
                <View key={index} style={styles.executiveTalkingPointItem}>
                  <View style={[styles.executiveTalkingPointIcon, { backgroundColor: COLORS.primary }]}>
                    <Lightbulb color="#FFFFFF" size={14} />
                  </View>
                  <Text style={[styles.executiveTalkingPointText, { color: colors.text }]}>
                    {point}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  executiveCard: {
    marginBottom: SPACING.lg,
  },
  executiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  executiveIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  executiveTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  executiveSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  executiveSubtitleText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  executiveLoader: {
    paddingVertical: SPACING.xl,
  },
  executiveSection: {
    marginBottom: SPACING.md,
  },
  executiveSubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  executiveSubheaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  executiveHighlightBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    marginTop: SPACING.sm,
  },
  executiveText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  executiveList: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  executivePriorityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  executivePriorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  executiveListText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  executiveFactorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: SPACING.md,
    marginBottom: SPACING.md,
  },
  executiveFactorIcon: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  executiveFactorNumber: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  executiveInitiativeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  executiveInitiativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  executiveFeaturedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.xs,
  },
  executiveFeaturedBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  executiveFeaturedBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    marginTop: SPACING.sm,
  },
  executiveTalkingPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  executiveTalkingPointIcon: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  executiveTalkingPointText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },
});
