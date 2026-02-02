import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Info, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface ChangeDetail {
  type: 'added' | 'removed' | 'modified';
  original?: string;
  changed?: string;
  reason: string;
  keywords?: string[];
}

interface Props {
  sectionName: string;
  changes: ChangeDetail[];
  originalText: string;
  tailoredText: string;
}

export default function ChangeExplanation({
  sectionName,
  changes,
  originalText,
  tailoredText,
}: Props) {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'added':
        return COLORS.success;
      case 'removed':
        return COLORS.danger;
      case 'modified':
        return COLORS.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getChangeBorderColor = (type: string) => {
    switch (type) {
      case 'added':
        return COLORS.success;
      case 'removed':
        return COLORS.danger;
      case 'modified':
        return COLORS.warning;
      default:
        return colors.border;
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'modified':
        return '~';
      default:
        return '•';
    }
  };

  if (changes.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { borderTopColor: colors.border }]}>
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.toggleButton}
        accessibilityRole="button"
        accessibilityLabel={`${isExpanded ? 'Hide' : 'Show'} change explanation for ${sectionName}`}
        accessibilityState={{ expanded: isExpanded }}
      >
        <View style={styles.toggleContent}>
          <Info color={COLORS.info} size={16} />
          <Text style={[styles.toggleText, { color: COLORS.info }]}>
            Why was this changed?
          </Text>
        </View>
        {isExpanded ? (
          <ChevronUp color={COLORS.info} size={16} />
        ) : (
          <ChevronDown color={COLORS.info} size={16} />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedContent}>
          {/* Overall Comparison */}
          <GlassCard material="thin" style={styles.comparisonCard}>
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>ORIGINAL</Text>
              <Text style={[styles.text, { color: colors.textSecondary }]}>
                {originalText}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.textBlock}>
              <Text style={[styles.label, { color: colors.textTertiary }]}>TAILORED</Text>
              <Text style={[styles.text, styles.tailoredText, { color: colors.text }]}>
                {tailoredText}
              </Text>
            </View>
          </GlassCard>

          {/* Detailed Changes */}
          <View style={styles.changesSection}>
            <View style={styles.changesSectionHeader}>
              <Lightbulb color={colors.textTertiary} size={16} />
              <Text style={[styles.changesSectionLabel, { color: colors.textTertiary }]}>
                DETAILED CHANGES
              </Text>
            </View>

            {changes.map((change, index) => (
              <View
                key={index}
                style={[
                  styles.changeCard,
                  {
                    backgroundColor: colors.backgroundTertiary,
                    borderLeftColor: getChangeBorderColor(change.type),
                  },
                ]}
              >
                <View style={styles.changeContent}>
                  <Text
                    style={[styles.changeIcon, { color: getChangeColor(change.type) }]}
                  >
                    {getChangeIcon(change.type)}
                  </Text>
                  <View style={styles.changeDetails}>
                    {/* Before */}
                    {change.original && (
                      <View style={styles.changeTextBlock}>
                        <Text style={[styles.changeLabel, { color: colors.textTertiary }]}>
                          Before:
                        </Text>
                        <Text
                          style={[
                            styles.changeText,
                            styles.strikethrough,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {change.original}
                        </Text>
                      </View>
                    )}

                    {/* After */}
                    {change.changed && (
                      <View style={styles.changeTextBlock}>
                        <Text style={[styles.changeLabel, { color: colors.textTertiary }]}>
                          After:
                        </Text>
                        <Text
                          style={[
                            styles.changeText,
                            styles.changedText,
                            { color: getChangeColor(change.type) },
                          ]}
                        >
                          {change.changed}
                        </Text>
                      </View>
                    )}

                    {/* Reason */}
                    <View
                      style={[styles.reasonBlock, { borderTopColor: colors.border }]}
                    >
                      <View style={styles.reasonHeader}>
                        <Info color={COLORS.info} size={14} />
                        <Text style={[styles.reasonText, { color: colors.textSecondary }]}>
                          {change.reason}
                        </Text>
                      </View>
                    </View>

                    {/* Keywords */}
                    {change.keywords && change.keywords.length > 0 && (
                      <View style={styles.keywordsRow}>
                        {change.keywords.map((keyword, i) => (
                          <View
                            key={i}
                            style={[
                              styles.keywordChip,
                              { backgroundColor: ALPHA_COLORS.neutral.bg },
                            ]}
                          >
                            <Text
                              style={[styles.keywordText, { color: colors.text }]}
                            >
                              {keyword}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  expandedContent: {
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  comparisonCard: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  textBlock: {
    gap: SPACING.xs,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
  },
  text: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  tailoredText: {
    fontFamily: FONTS.medium,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  changesSection: {
    gap: SPACING.sm,
  },
  changesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  changesSectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
  },
  changeCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderLeftWidth: 4,
  },
  changeContent: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  changeIcon: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    lineHeight: 22,
  },
  changeDetails: {
    flex: 1,
    gap: SPACING.sm,
  },
  changeTextBlock: {
    gap: 2,
  },
  changeLabel: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
  },
  changeText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  changedText: {
    fontFamily: FONTS.semibold,
  },
  reasonBlock: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  keywordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    paddingTop: SPACING.xs,
  },
  keywordChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  keywordText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
});
