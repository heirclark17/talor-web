import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import {
  Target, Lightbulb, TrendingUp, CheckCircle, AlertTriangle,
  Award, ChevronUp, ChevronDown
} from 'lucide-react-native';
import { GlassCard } from '../glass/GlassCard';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../../utils/constants';
import { CompetitiveIntelligence, ThemeColors } from './types';

interface CompetitiveIntelligenceCardProps {
  intelligence: CompetitiveIntelligence;
  loading: boolean;
  colors: ThemeColors & { backgroundTertiary?: string; textTertiary?: string };
}

export const CompetitiveIntelligenceCard: React.FC<CompetitiveIntelligenceCardProps> = ({
  intelligence,
  loading,
  colors,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('interview_angles');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <GlassCard style={styles.competitiveCard} material="regular">
        <View style={styles.competitiveHeader}>
          <View style={[styles.competitiveIcon, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
            <Target color={COLORS.warning} size={24} />
          </View>
          <Text style={[styles.competitiveTitle, { color: colors.text }]}>Competitive Intelligence</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.competitiveLoader} />
      </GlassCard>
    );
  }

  if (!intelligence) {
    return null;
  }

  return (
    <GlassCard style={styles.competitiveCard} material="regular">
      <View style={styles.competitiveHeader}>
        <View style={[styles.competitiveIcon, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
          <Target color={COLORS.warning} size={24} />
        </View>
        <Text style={[styles.competitiveTitle, { color: colors.text }]}>Competitive Intelligence</Text>
      </View>

      <Text style={[styles.competitiveSubtitle, { color: colors.textSecondary }]}>
        Strategic positioning and market context
      </Text>

      {/* Interview Angles - Most Important */}
      <View style={styles.competitiveSection}>
        <TouchableOpacity
          style={styles.competitiveSubheader}
          onPress={() => toggleSection('interview_angles')}
          accessibilityRole="button"
        >
          <View style={styles.competitiveSubheaderLeft}>
            <Lightbulb color={COLORS.warning} size={16} />
            <Text style={[styles.competitiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
              Interview Angles
            </Text>
          </View>
          {expandedSection === 'interview_angles' ? (
            <ChevronUp color={colors.textSecondary} size={18} />
          ) : (
            <ChevronDown color={colors.textSecondary} size={18} />
          )}
        </TouchableOpacity>
        {expandedSection === 'interview_angles' && intelligence.interview_angles && intelligence.interview_angles.length > 0 && (
          <View style={[styles.competitiveHighlightBox, { backgroundColor: ALPHA_COLORS.warning.bg, borderColor: COLORS.warning }]}>
            {intelligence.interview_angles.map((angle, index) => (
              <View key={index} style={styles.competitiveAngleItem}>
                <View style={[styles.competitiveAngleDot, { backgroundColor: COLORS.warning }]} />
                <Text style={[styles.competitiveAngleText, { color: colors.text }]}>
                  {angle}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Market Position */}
      {intelligence.market_position && (
        <View style={styles.competitiveSection}>
          <TouchableOpacity
            style={styles.competitiveSubheader}
            onPress={() => toggleSection('market_position')}
            accessibilityRole="button"
          >
            <View style={styles.competitiveSubheaderLeft}>
              <TrendingUp color={COLORS.info} size={16} />
              <Text style={[styles.competitiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Market Position
              </Text>
            </View>
            {expandedSection === 'market_position' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'market_position' && (
            <View style={[styles.competitiveInfoBox, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={[styles.competitiveText, { color: colors.textSecondary }]}>
                {intelligence.market_position}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Competitive Advantages */}
      {intelligence.competitive_advantages && intelligence.competitive_advantages.length > 0 && (
        <View style={styles.competitiveSection}>
          <TouchableOpacity
            style={styles.competitiveSubheader}
            onPress={() => toggleSection('advantages')}
            accessibilityRole="button"
          >
            <View style={styles.competitiveSubheaderLeft}>
              <CheckCircle color={COLORS.success} size={16} />
              <Text style={[styles.competitiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Competitive Advantages
              </Text>
            </View>
            {expandedSection === 'advantages' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'advantages' && (
            <View style={styles.competitiveList}>
              {intelligence.competitive_advantages.map((advantage, index) => (
                <View key={index} style={styles.competitiveAdvantageItem}>
                  <View style={[styles.competitiveCheckIcon, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                    <CheckCircle color={COLORS.success} size={14} />
                  </View>
                  <Text style={[styles.competitiveListText, { color: colors.textSecondary }]}>
                    {advantage}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Challenges */}
      {intelligence.challenges && intelligence.challenges.length > 0 && (
        <View style={styles.competitiveSection}>
          <TouchableOpacity
            style={styles.competitiveSubheader}
            onPress={() => toggleSection('challenges')}
            accessibilityRole="button"
          >
            <View style={styles.competitiveSubheaderLeft}>
              <AlertTriangle color={COLORS.error} size={16} />
              <Text style={[styles.competitiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Challenges
              </Text>
            </View>
            {expandedSection === 'challenges' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'challenges' && (
            <View style={styles.competitiveList}>
              {intelligence.challenges.map((challenge, index) => (
                <View key={index} style={styles.competitiveChallengeItem}>
                  <View style={[styles.competitiveWarningIcon, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
                    <AlertTriangle color={COLORS.error} size={14} />
                  </View>
                  <Text style={[styles.competitiveListText, { color: colors.textSecondary }]}>
                    {challenge}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Differentiation Strategy */}
      {intelligence.differentiation_strategy && (
        <View style={styles.competitiveSection}>
          <TouchableOpacity
            style={styles.competitiveSubheader}
            onPress={() => toggleSection('differentiation')}
            accessibilityRole="button"
          >
            <View style={styles.competitiveSubheaderLeft}>
              <Award color={COLORS.purple} size={16} />
              <Text style={[styles.competitiveSubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Differentiation Strategy
              </Text>
            </View>
            {expandedSection === 'differentiation' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'differentiation' && (
            <View style={[styles.competitiveInfoBox, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={[styles.competitiveText, { color: colors.textSecondary }]}>
                {intelligence.differentiation_strategy}
              </Text>
            </View>
          )}
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  competitiveCard: {
    marginBottom: SPACING.lg,
  },
  competitiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  competitiveIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  competitiveTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  competitiveSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  competitiveSubtitleText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  competitiveLoader: {
    paddingVertical: SPACING.xl,
  },
  competitiveSection: {
    marginBottom: SPACING.md,
  },
  competitiveSubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  competitiveSubheaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  competitiveHighlightBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    marginTop: SPACING.sm,
  },
  competitiveAngleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  competitiveAngleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  competitiveAngleText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },
  competitiveInfoBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  competitiveText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  competitiveList: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  competitiveAdvantageItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: SPACING.md,
  },
  competitiveChallengeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: SPACING.md,
  },
  competitiveCheckIcon: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  competitiveWarningIcon: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  competitiveListText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
});
