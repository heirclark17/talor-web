import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import {
  Compass, Map, Star, BookOpen, HelpCircle, CheckCircle, Check,
  ChevronUp, ChevronDown
} from 'lucide-react-native';
import { GlassCard } from '../glass/GlassCard';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../../utils/constants';
import { InterviewStrategy, ThemeColors } from './types';

interface InterviewStrategyCardProps {
  strategy: InterviewStrategy;
  loading: boolean;
  colors: ThemeColors & { backgroundTertiary?: string; textTertiary?: string };
}

export const InterviewStrategyCard: React.FC<InterviewStrategyCardProps> = ({
  strategy,
  loading,
  colors,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('approach');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <GlassCard style={styles.strategyCard} material="regular">
        <View style={styles.strategyHeader}>
          <View style={[styles.strategyIcon, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
            <Compass color={COLORS.primary} size={24} />
          </View>
          <Text style={[styles.strategyTitle, { color: colors.text }]}>Interview Strategy</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.strategyLoader} />
      </GlassCard>
    );
  }

  if (!strategy) {
    return null;
  }

  return (
    <GlassCard style={styles.strategyCard} material="regular">
      <View style={styles.strategyHeader}>
        <View style={[styles.strategyIcon, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
          <Compass color={COLORS.primary} size={24} />
        </View>
        <Text style={[styles.strategyTitle, { color: colors.text }]}>Interview Strategy</Text>
      </View>

      <Text style={[styles.strategySubtitle, { color: colors.textSecondary }]}>
        Your game plan for interview success
      </Text>

      {/* Recommended Approach */}
      {strategy.recommended_approach && (
        <View style={styles.strategySection}>
          <TouchableOpacity
            style={styles.strategySubheader}
            onPress={() => toggleSection('approach')}
            accessibilityRole="button"
          >
            <View style={styles.strategySubheaderLeft}>
              <Map color={COLORS.primary} size={16} />
              <Text style={[styles.strategySubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Recommended Approach
              </Text>
            </View>
            {expandedSection === 'approach' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'approach' && (
            <View style={[styles.strategyHighlightBox, { backgroundColor: ALPHA_COLORS.primary.bg, borderColor: COLORS.primary }]}>
              <Text style={[styles.strategyText, { color: colors.text }]}>
                {strategy.recommended_approach}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Key Themes to Emphasize */}
      {strategy.key_themes_to_emphasize && strategy.key_themes_to_emphasize.length > 0 && (
        <View style={styles.strategySection}>
          <TouchableOpacity
            style={styles.strategySubheader}
            onPress={() => toggleSection('themes')}
            accessibilityRole="button"
          >
            <View style={styles.strategySubheaderLeft}>
              <Star color={COLORS.warning} size={16} />
              <Text style={[styles.strategySubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Key Themes to Emphasize
              </Text>
            </View>
            {expandedSection === 'themes' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'themes' && (
            <View style={styles.strategyList}>
              {strategy.key_themes_to_emphasize.map((theme, index) => (
                <View key={index} style={styles.strategyThemeItem}>
                  <View style={[styles.strategyThemeDot, { backgroundColor: COLORS.warning }]} />
                  <Text style={[styles.strategyListText, { color: colors.textSecondary }]}>
                    {theme}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Stories to Prepare */}
      {strategy.stories_to_prepare && strategy.stories_to_prepare.length > 0 && (
        <View style={styles.strategySection}>
          <TouchableOpacity
            style={styles.strategySubheader}
            onPress={() => toggleSection('stories')}
            accessibilityRole="button"
          >
            <View style={styles.strategySubheaderLeft}>
              <BookOpen color={COLORS.purple} size={16} />
              <Text style={[styles.strategySubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Stories to Prepare
              </Text>
            </View>
            {expandedSection === 'stories' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'stories' && (
            <View style={styles.strategyList}>
              {strategy.stories_to_prepare.map((story, index) => (
                <View key={index} style={styles.strategyStoryItem}>
                  <View style={[styles.strategyStoryIcon, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
                    <Text style={[styles.strategyStoryNumber, { color: COLORS.purple }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.strategyStoryContent}>
                    <Text style={[styles.strategyStoryTheme, { color: colors.text }]}>
                      {story.theme}
                    </Text>
                    <Text style={[styles.strategyStoryDescription, { color: colors.textSecondary }]}>
                      {story.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Questions to Ask Interviewer */}
      {strategy.questions_to_ask_interviewer && strategy.questions_to_ask_interviewer.length > 0 && (
        <View style={styles.strategySection}>
          <TouchableOpacity
            style={styles.strategySubheader}
            onPress={() => toggleSection('questions')}
            accessibilityRole="button"
          >
            <View style={styles.strategySubheaderLeft}>
              <HelpCircle color={COLORS.info} size={16} />
              <Text style={[styles.strategySubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Questions to Ask Interviewer
              </Text>
            </View>
            {expandedSection === 'questions' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'questions' && (
            <View style={[styles.strategyHighlightBox, { backgroundColor: ALPHA_COLORS.info.bg, borderColor: COLORS.info }]}>
              {strategy.questions_to_ask_interviewer.map((question, index) => (
                <View key={index} style={styles.strategyQuestionItem}>
                  <View style={[styles.strategyQuestionDot, { backgroundColor: COLORS.info }]} />
                  <Text style={[styles.strategyQuestionText, { color: colors.text }]}>
                    {question}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Pre-Interview Checklist */}
      {strategy.pre_interview_checklist && strategy.pre_interview_checklist.length > 0 && (
        <View style={styles.strategySection}>
          <TouchableOpacity
            style={styles.strategySubheader}
            onPress={() => toggleSection('checklist')}
            accessibilityRole="button"
          >
            <View style={styles.strategySubheaderLeft}>
              <CheckCircle color={COLORS.success} size={16} />
              <Text style={[styles.strategySubtitleText, { color: colors.text, fontFamily: FONTS.semibold }]}>
                Pre-Interview Checklist
              </Text>
            </View>
            {expandedSection === 'checklist' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'checklist' && (
            <View style={styles.strategyList}>
              {strategy.pre_interview_checklist.map((item, index) => (
                <View key={index} style={styles.strategyChecklistItem}>
                  <View style={[styles.strategyCheckbox, { borderColor: COLORS.success }]}>
                    <Check color={COLORS.success} size={14} />
                  </View>
                  <Text style={[styles.strategyListText, { color: colors.textSecondary }]}>
                    {item}
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
  strategyCard: {
    marginBottom: SPACING.lg,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  strategyIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  strategyTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  strategySubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  strategySubtitleText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  strategyLoader: {
    paddingVertical: SPACING.xl,
  },
  strategySection: {
    marginBottom: SPACING.md,
  },
  strategySubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  strategySubheaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  strategyHighlightBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    marginTop: SPACING.sm,
  },
  strategyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  strategyList: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  strategyThemeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  strategyThemeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  strategyListText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  strategyStoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: SPACING.md,
    marginBottom: SPACING.md,
  },
  strategyStoryIcon: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  strategyStoryNumber: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  strategyStoryContent: {
    flex: 1,
  },
  strategyStoryTheme: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
    lineHeight: 18,
  },
  strategyStoryDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  strategyQuestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  strategyQuestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  strategyQuestionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },
  strategyChecklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: SPACING.md,
  },
  strategyCheckbox: {
    width: 20,
    height: 20,
    borderRadius: RADIUS.sm,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
});
