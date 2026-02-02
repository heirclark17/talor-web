import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface Change {
  change_type: 'added' | 'modified' | 'removed';
  impact_level: 'high' | 'medium' | 'low';
  original_text: string | null;
  new_text: string | null;
  why_this_matters: string;
  what_changed: string;
  how_it_helps: string;
  job_requirements_matched: string[];
  keywords_added: string[];
}

interface Section {
  section_name: string;
  changes: Change[];
}

interface Analysis {
  sections: Section[];
}

interface ResumeAnalysisProps {
  analysis: Analysis | null;
  loading: boolean;
}

export default function ResumeAnalysis({ analysis, loading }: ResumeAnalysisProps) {
  const { colors } = useTheme();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());

  const toggleSection = (sectionName: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    setExpandedSections(newExpanded);
  };

  const toggleChange = (changeId: string) => {
    const newExpanded = new Set(expandedChanges);
    if (newExpanded.has(changeId)) {
      newExpanded.delete(changeId);
    } else {
      newExpanded.add(changeId);
    }
    setExpandedChanges(newExpanded);
  };

  const getImpactColors = (level: string) => {
    switch (level) {
      case 'high':
        return {
          bg: ALPHA_COLORS.success.bg,
          border: ALPHA_COLORS.success.border,
          text: COLORS.success,
        };
      case 'medium':
        return {
          bg: ALPHA_COLORS.warning.bg,
          border: ALPHA_COLORS.warning.border,
          text: COLORS.warning,
        };
      case 'low':
        return {
          bg: ALPHA_COLORS.info.bg,
          border: ALPHA_COLORS.info.border,
          text: COLORS.info,
        };
      default:
        return {
          bg: ALPHA_COLORS.neutral.bg,
          border: colors.border,
          text: colors.textSecondary,
        };
    }
  };

  const getChangeTypeIcon = (type: string) => {
    const iconSize = 16;
    switch (type) {
      case 'added':
        return <CheckCircle color={COLORS.success} size={iconSize} />;
      case 'modified':
        return <AlertCircle color={COLORS.warning} size={iconSize} />;
      case 'removed':
        return <Info color={COLORS.danger} size={iconSize} />;
      default:
        return <Info color={colors.textSecondary} size={iconSize} />;
    }
  };

  if (loading) {
    return (
      <GlassCard material="regular" style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Analyzing resume changes...
        </Text>
      </GlassCard>
    );
  }

  if (!analysis || !analysis.sections || analysis.sections.length === 0) {
    return (
      <GlassCard material="regular" style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No analysis available. Generate a tailored resume to see changes.
        </Text>
      </GlassCard>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          AI-Powered Change Analysis
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          {analysis.sections.length} section{analysis.sections.length !== 1 ? 's' : ''} modified
        </Text>
      </View>

      {/* Sections */}
      <View style={styles.sectionsContainer}>
        {analysis.sections.map((section, sectionIdx) => {
          const isExpanded = expandedSections.has(section.section_name);

          return (
            <GlassCard key={sectionIdx} material="regular" shadow="subtle" style={styles.sectionCard}>
              {/* Section Header */}
              <TouchableOpacity
                onPress={() => toggleSection(section.section_name)}
                style={styles.sectionHeader}
                accessibilityRole="button"
                accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${section.section_name}`}
                accessibilityState={{ expanded: isExpanded }}
              >
                <View style={styles.sectionHeaderLeft}>
                  {isExpanded ? (
                    <ChevronDown color={colors.textSecondary} size={20} />
                  ) : (
                    <ChevronRight color={colors.textSecondary} size={20} />
                  )}
                  <Text style={[styles.sectionName, { color: colors.text }]}>
                    {section.section_name}
                  </Text>
                  <View style={[styles.changeCount, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.changeCountText, { color: colors.textSecondary }]}>
                      {section.changes.length} change{section.changes.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Section Content */}
              {isExpanded && (
                <View style={styles.changesContainer}>
                  {section.changes.map((change, changeIdx) => {
                    const changeId = `${section.section_name}-${changeIdx}`;
                    const isChangeExpanded = expandedChanges.has(changeId);
                    const impactColors = getImpactColors(change.impact_level);

                    return (
                      <View
                        key={changeIdx}
                        style={[
                          styles.changeCard,
                          { backgroundColor: colors.backgroundTertiary },
                        ]}
                      >
                        {/* Change Header */}
                        <TouchableOpacity
                          onPress={() => toggleChange(changeId)}
                          style={styles.changeHeader}
                          accessibilityRole="button"
                          accessibilityLabel={`${isChangeExpanded ? 'Collapse' : 'Expand'} change details`}
                          accessibilityState={{ expanded: isChangeExpanded }}
                        >
                          <View style={styles.changeHeaderContent}>
                            {/* Badges */}
                            <View style={styles.badgesRow}>
                              {/* Change Type */}
                              <View style={styles.changeTypeBadge}>
                                {getChangeTypeIcon(change.change_type)}
                                <Text style={[styles.badgeText, { color: colors.text }]}>
                                  {change.change_type}
                                </Text>
                              </View>

                              {/* Impact Level */}
                              <View
                                style={[
                                  styles.impactBadge,
                                  {
                                    backgroundColor: impactColors.bg,
                                    borderColor: impactColors.border,
                                  },
                                ]}
                              >
                                <Text style={[styles.badgeText, { color: impactColors.text }]}>
                                  {change.impact_level} impact
                                </Text>
                              </View>
                            </View>

                            {/* What Changed Preview */}
                            <Text
                              style={[styles.previewText, { color: colors.textSecondary }]}
                              numberOfLines={2}
                            >
                              {change.what_changed}
                            </Text>
                          </View>

                          {isChangeExpanded ? (
                            <ChevronDown color={colors.textSecondary} size={20} />
                          ) : (
                            <ChevronRight color={colors.textSecondary} size={20} />
                          )}
                        </TouchableOpacity>

                        {/* Expanded Change Details */}
                        {isChangeExpanded && (
                          <View
                            style={[styles.changeDetails, { borderTopColor: colors.border }]}
                          >
                            {/* Original Text */}
                            {change.original_text && (
                              <View style={styles.detailBlock}>
                                <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>
                                  ORIGINAL
                                </Text>
                                <View
                                  style={[
                                    styles.textBlock,
                                    {
                                      backgroundColor: ALPHA_COLORS.danger.bg,
                                      borderLeftColor: COLORS.danger,
                                    },
                                  ]}
                                >
                                  <Text style={[styles.textContent, { color: colors.textSecondary }]}>
                                    {change.original_text}
                                  </Text>
                                </View>
                              </View>
                            )}

                            {/* New Text */}
                            {change.new_text && (
                              <View style={styles.detailBlock}>
                                <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>
                                  NEW
                                </Text>
                                <View
                                  style={[
                                    styles.textBlock,
                                    {
                                      backgroundColor: ALPHA_COLORS.success.bg,
                                      borderLeftColor: COLORS.success,
                                    },
                                  ]}
                                >
                                  <Text style={[styles.textContent, { color: COLORS.success }]}>
                                    {change.new_text}
                                  </Text>
                                </View>
                              </View>
                            )}

                            {/* Why This Matters */}
                            <View style={styles.detailBlock}>
                              <Text style={[styles.detailLabel, { color: COLORS.info }]}>
                                WHY THIS MATTERS
                              </Text>
                              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                {change.why_this_matters}
                              </Text>
                            </View>

                            {/* What Changed */}
                            <View style={styles.detailBlock}>
                              <Text style={[styles.detailLabel, { color: COLORS.warning }]}>
                                WHAT CHANGED
                              </Text>
                              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                {change.what_changed}
                              </Text>
                            </View>

                            {/* How It Helps */}
                            <View style={styles.detailBlock}>
                              <Text style={[styles.detailLabel, { color: COLORS.success }]}>
                                HOW IT HELPS
                              </Text>
                              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                                {change.how_it_helps}
                              </Text>
                            </View>

                            {/* Job Requirements Matched */}
                            {change.job_requirements_matched &&
                              change.job_requirements_matched.length > 0 && (
                                <View style={styles.detailBlock}>
                                  <Text style={[styles.detailLabel, { color: COLORS.purple }]}>
                                    JOB REQUIREMENTS MATCHED
                                  </Text>
                                  <View style={styles.chipsContainer}>
                                    {change.job_requirements_matched.map((req, idx) => (
                                      <View
                                        key={idx}
                                        style={[
                                          styles.chip,
                                          {
                                            backgroundColor: ALPHA_COLORS.purple.bg,
                                            borderColor: ALPHA_COLORS.purple.border,
                                          },
                                        ]}
                                      >
                                        <Text style={[styles.chipText, { color: COLORS.purple }]}>
                                          {req}
                                        </Text>
                                      </View>
                                    ))}
                                  </View>
                                </View>
                              )}

                            {/* Keywords Added */}
                            {change.keywords_added && change.keywords_added.length > 0 && (
                              <View style={styles.detailBlock}>
                                <Text style={[styles.detailLabel, { color: COLORS.cyan }]}>
                                  KEYWORDS ADDED
                                </Text>
                                <View style={styles.chipsContainer}>
                                  {change.keywords_added.map((keyword, idx) => (
                                    <View
                                      key={idx}
                                      style={[
                                        styles.chip,
                                        {
                                          backgroundColor: ALPHA_COLORS.info.bg,
                                          borderColor: ALPHA_COLORS.info.border,
                                        },
                                      ]}
                                    >
                                      <Text style={[styles.chipText, { color: COLORS.cyan }]}>
                                        {keyword}
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </GlassCard>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.md,
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  sectionsContainer: {
    gap: SPACING.md,
  },
  sectionCard: {
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  sectionName: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
  changeCount: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  changeCountText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  changesContainer: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    gap: SPACING.sm,
  },
  changeCard: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  changeHeader: {
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  changeHeaderContent: {
    flex: 1,
    gap: SPACING.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  changeTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  impactBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    textTransform: 'capitalize',
  },
  previewText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  changeDetails: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderTopWidth: 1,
    paddingTop: SPACING.md,
    gap: SPACING.md,
  },
  detailBlock: {
    gap: SPACING.xs,
  },
  detailLabel: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    letterSpacing: 0.5,
  },
  textBlock: {
    padding: SPACING.sm,
    borderLeftWidth: 2,
  },
  textContent: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  detailText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
});
