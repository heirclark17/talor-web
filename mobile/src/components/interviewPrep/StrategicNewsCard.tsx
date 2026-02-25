import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { TrendingUp, Newspaper, Target, Lightbulb, ChevronUp, ChevronDown } from 'lucide-react-native';
import { GlassCard } from '../glass/GlassCard';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../../utils/constants';
import { StrategicNewsItem, ThemeColors } from './types';

interface StrategicNewsCardProps {
  newsItems: StrategicNewsItem[];
  loading: boolean;
  colors: ThemeColors & { backgroundTertiary?: string; textTertiary?: string };
}

export const StrategicNewsCard: React.FC<StrategicNewsCardProps> = ({ newsItems, loading, colors }) => {
  const { isDark } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleNewsItem = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return '1 day ago';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return `${Math.floor(diffInDays / 30)} months ago`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <GlassCard style={styles.strategicNewsCard} material="regular">
        <View style={styles.strategicNewsHeader}>
          <View style={[styles.strategicNewsIcon, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
            <TrendingUp color={COLORS.purple} size={24} />
          </View>
          <Text style={[styles.strategicNewsTitle, { color: colors.text }]}>Strategic News & Insights</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.strategicNewsLoader} />
      </GlassCard>
    );
  }

  if (!newsItems || newsItems.length === 0) {
    return null;
  }

  return (
    <GlassCard style={styles.strategicNewsCard} material="regular">
      <View style={styles.strategicNewsHeader}>
        <View style={[styles.strategicNewsIcon, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
          <TrendingUp color={COLORS.purple} size={24} />
        </View>
        <Text style={[styles.strategicNewsTitle, { color: colors.text }]}>Strategic News & Insights</Text>
      </View>

      <Text style={[styles.strategicNewsSubtitle, { color: colors.textSecondary }]}>
        Recent developments relevant to your interview
      </Text>

      <View style={styles.strategicNewsList}>
        {newsItems.map((item, index) => (
          <View
            key={index}
            style={[styles.strategicNewsItem, { backgroundColor: colors.backgroundTertiary }]}
          >
            <TouchableOpacity
              style={styles.strategicNewsItemHeader}
              onPress={() => toggleNewsItem(index)}
              accessibilityRole="button"
            >
              <View style={styles.strategicNewsItemHeaderLeft}>
                <View style={[styles.newsRecencyBadge, { backgroundColor: ALPHA_COLORS.purple.bg, borderColor: COLORS.purple }]}>
                  <Text style={[styles.newsRecencyText, { color: COLORS.purple }]}>
                    {getTimeAgo(item.date)}
                  </Text>
                </View>
              </View>
              {expandedIndex === index ? (
                <ChevronUp color={colors.textSecondary} size={18} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={18} />
              )}
            </TouchableOpacity>

            <Text style={[styles.strategicNewsHeadline, { color: colors.text }]}>
              {item.headline || item.title}
            </Text>

            {item.source && (
              <View style={styles.strategicNewsSourceRow}>
                <Newspaper color={colors.textTertiary} size={12} />
                <Text style={[styles.strategicNewsSource, { color: colors.textTertiary }]}>
                  {item.source}
                </Text>
              </View>
            )}

            {expandedIndex === index && (
              <View style={[styles.strategicNewsExpandedContent, { borderTopColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[5] }]}>
                {/* Summary */}
                <View style={styles.strategicNewsSection}>
                  <Text style={[styles.strategicNewsSectionTitle, { color: colors.text }]}>Summary</Text>
                  <Text style={[styles.strategicNewsSectionText, { color: colors.textSecondary }]}>
                    {item.summary}
                  </Text>
                </View>

                {/* Relevance to Interview */}
                {(item.relevance_to_interview || item.relevance) && (
                  <View style={[styles.strategicNewsSection, styles.relevanceSection]}>
                    <View style={styles.strategicNewsSectionHeader}>
                      <Target color={COLORS.info} size={16} />
                      <Text style={[styles.strategicNewsSectionTitle, { color: COLORS.info }]}>
                        Why This Matters
                      </Text>
                    </View>
                    <Text style={[styles.strategicNewsSectionText, { color: colors.textSecondary }]}>
                      {item.relevance_to_interview || item.relevance}
                    </Text>
                  </View>
                )}

                {/* Talking Points */}
                {item.talking_points && item.talking_points.length > 0 && (
                  <View style={styles.strategicNewsSection}>
                    <View style={styles.strategicNewsSectionHeader}>
                      <Lightbulb color={COLORS.purple} size={16} />
                      <Text style={[styles.strategicNewsSectionTitle, { color: COLORS.purple }]}>
                        Talking Points
                      </Text>
                    </View>
                    {item.talking_points.map((point, pointIndex) => (
                      <View key={pointIndex} style={styles.talkingPointItem}>
                        <View style={[styles.talkingPointDot, { backgroundColor: COLORS.purple }]} />
                        <Text style={[styles.talkingPointText, { color: colors.textSecondary }]}>
                          {point}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  strategicNewsCard: {
    marginBottom: SPACING.lg,
  },
  strategicNewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  strategicNewsIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  strategicNewsTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  strategicNewsSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  strategicNewsLoader: {
    paddingVertical: SPACING.xl,
  },
  strategicNewsList: {
    gap: SPACING.md,
  },
  strategicNewsItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  strategicNewsItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  strategicNewsItemHeaderLeft: {
    flex: 1,
  },
  newsRecencyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  newsRecencyText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  strategicNewsHeadline: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    lineHeight: 21,
    marginBottom: SPACING.sm,
  },
  strategicNewsSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.sm,
  },
  strategicNewsSource: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  strategicNewsExpandedContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  strategicNewsSection: {
    marginBottom: SPACING.md,
  },
  relevanceSection: {
    backgroundColor: ALPHA_COLORS.info.bg,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },
  strategicNewsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  strategicNewsSectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
  },
  strategicNewsSectionText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 19,
  },
  talkingPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingLeft: SPACING.sm,
  },
  talkingPointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  talkingPointText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 19,
  },
});
