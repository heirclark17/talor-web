import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Search, Briefcase, TrendingUp, Award, Wrench, X, MapPin } from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface Keyword {
  keyword: string;
  why_added: string;
  jd_frequency: number;
  ats_impact: 'high' | 'medium' | 'low';
  location_in_resume: string;
  context: string;
}

interface KeywordGroup {
  category: string;
  keywords: Keyword[];
}

interface KeywordAnalysis {
  keyword_groups: KeywordGroup[];
  total_keywords_added: number;
  ats_optimization_score: number;
}

interface KeywordPanelProps {
  keywords: KeywordAnalysis | null;
  loading: boolean;
}

type CategoryKey = 'technical_skills' | 'soft_skills' | 'industry_terms' | 'certifications' | 'tools_technologies';

const categoryLabels: Record<string, string> = {
  technical_skills: 'Technical Skills',
  soft_skills: 'Soft Skills',
  industry_terms: 'Industry Terms',
  certifications: 'Certifications',
  tools_technologies: 'Tools & Technologies',
};

export default function KeywordPanel({ keywords, loading }: KeywordPanelProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    const iconProps = { size: 16, color: colors.text };
    switch (category) {
      case 'technical_skills':
        return <Briefcase {...iconProps} />;
      case 'soft_skills':
        return <TrendingUp {...iconProps} />;
      case 'industry_terms':
        return <Award {...iconProps} />;
      case 'certifications':
        return <Award {...iconProps} />;
      case 'tools_technologies':
        return <Wrench {...iconProps} />;
      default:
        return <Briefcase {...iconProps} />;
    }
  };

  const getImpactColors = (impact: string) => {
    switch (impact) {
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

  const filterKeywords = () => {
    if (!keywords || !keywords.keyword_groups) return [];

    let filtered = keywords.keyword_groups;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((group) => group.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered
        .map((group) => ({
          ...group,
          keywords: group.keywords.filter(
            (k) =>
              k.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
              k.why_added.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((group) => group.keywords.length > 0);
    }

    return filtered;
  };

  if (loading) {
    return (
      <GlassCard material="regular" style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Analyzing keywords...
        </Text>
      </GlassCard>
    );
  }

  if (!keywords || !keywords.keyword_groups || keywords.keyword_groups.length === 0) {
    return (
      <GlassCard material="regular" style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No keyword analysis available.
        </Text>
      </GlassCard>
    );
  }

  const filteredGroups = filterKeywords();

  return (
    <View style={styles.container}>
      {/* Header with Stats */}
      <GlassCard material="regular" shadow="subtle" style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Keywords Added</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {keywords.total_keywords_added} total • ATS Score: {keywords.ats_optimization_score}/100
            </Text>
          </View>
          <View style={styles.scoreDisplay}>
            <Text style={[styles.scoreValue, { color: COLORS.success }]}>
              {keywords.ats_optimization_score}
            </Text>
            <Text style={[styles.scoreLabel, { color: colors.textTertiary }]}>ATS Score</Text>
          </View>
        </View>
      </GlassCard>

      {/* Search Bar */}
      <GlassCard material="thin" style={styles.searchCard}>
        <View style={styles.searchContainer}>
          <Search color={colors.textTertiary} size={16} />
          <TextInput
            placeholder="Search keywords..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X color={colors.textTertiary} size={16} />
            </TouchableOpacity>
          )}
        </View>
      </GlassCard>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          style={[
            styles.categoryChip,
            selectedCategory === null
              ? { backgroundColor: COLORS.primary }
              : { backgroundColor: colors.backgroundTertiary },
          ]}
        >
          <Text
            style={[
              styles.categoryText,
              { color: selectedCategory === null ? '#000' : colors.textSecondary },
            ]}
          >
            All Categories
          </Text>
        </TouchableOpacity>
        {keywords.keyword_groups.map((group) => (
          <TouchableOpacity
            key={group.category}
            onPress={() => setSelectedCategory(group.category)}
            style={[
              styles.categoryChip,
              selectedCategory === group.category
                ? { backgroundColor: COLORS.primary }
                : { backgroundColor: colors.backgroundTertiary },
            ]}
          >
            <View style={styles.categoryChipContent}>
              {getCategoryIcon(group.category)}
              <Text
                style={[
                  styles.categoryText,
                  {
                    color:
                      selectedCategory === group.category ? '#000' : colors.textSecondary,
                  },
                ]}
              >
                {categoryLabels[group.category] || group.category}
              </Text>
              <Text
                style={[
                  styles.categoryCount,
                  {
                    color:
                      selectedCategory === group.category
                        ? ALPHA_COLORS.black[70]
                        : colors.textTertiary,
                  },
                ]}
              >
                {group.keywords.length}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Keyword Groups */}
      <View style={styles.groupsContainer}>
        {filteredGroups.length === 0 ? (
          <GlassCard material="regular" style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No keywords match your search.
            </Text>
          </GlassCard>
        ) : (
          filteredGroups.map((group) => (
            <GlassCard key={group.category} material="regular" shadow="subtle" style={styles.groupCard}>
              {/* Group Header */}
              <View style={styles.groupHeader}>
                {getCategoryIcon(group.category)}
                <Text style={[styles.groupTitle, { color: colors.text }]}>
                  {categoryLabels[group.category] || group.category}
                </Text>
                <View style={[styles.groupCount, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.groupCountText, { color: colors.textTertiary }]}>
                    {group.keywords.length}
                  </Text>
                </View>
              </View>

              {/* Keywords */}
              <View style={styles.keywordsContainer}>
                {group.keywords.map((keyword, idx) => {
                  const impactColors = getImpactColors(keyword.ats_impact);
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.keywordCard,
                        { backgroundColor: colors.backgroundTertiary },
                      ]}
                    >
                      {/* Keyword Name & Badges */}
                      <View style={styles.keywordHeader}>
                        <Text style={[styles.keywordName, { color: colors.text }]}>
                          {keyword.keyword}
                        </Text>
                      </View>

                      <View style={styles.badgesRow}>
                        {/* ATS Impact */}
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: impactColors.bg,
                              borderColor: impactColors.border,
                            },
                          ]}
                        >
                          <Text style={[styles.badgeText, { color: impactColors.text }]}>
                            {keyword.ats_impact} impact
                          </Text>
                        </View>

                        {/* JD Frequency */}
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor: ALPHA_COLORS.primary.bg,
                              borderColor: ALPHA_COLORS.primary.border,
                            },
                          ]}
                        >
                          <Text style={[styles.badgeText, { color: COLORS.primary }]}>
                            {keyword.jd_frequency}x in JD
                          </Text>
                        </View>
                      </View>

                      {/* Why Added */}
                      <Text style={[styles.whyAdded, { color: colors.textSecondary }]}>
                        {keyword.why_added}
                      </Text>

                      {/* Context */}
                      {keyword.context && (
                        <Text style={[styles.context, { color: colors.textTertiary }]}>
                          "{keyword.context}"
                        </Text>
                      )}

                      {/* Location */}
                      <View style={styles.locationRow}>
                        <MapPin color={COLORS.info} size={12} />
                        <Text style={[styles.locationText, { color: COLORS.info }]}>
                          {keyword.location_in_resume}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          ))
        )}
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
    justifyContent: 'center',
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
  headerCard: {
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  scoreDisplay: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: FONTS.bold,
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  searchCard: {
    padding: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    paddingVertical: SPACING.xs,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.xs,
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    marginRight: SPACING.xs,
  },
  categoryChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  categoryCount: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  groupsContainer: {
    gap: SPACING.md,
  },
  groupCard: {
    padding: SPACING.lg,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  groupTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    flex: 1,
  },
  groupCount: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  groupCountText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  keywordsContainer: {
    gap: SPACING.sm,
  },
  keywordCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  keywordHeader: {
    marginBottom: SPACING.xs,
  },
  keywordName: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    lineHeight: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  badge: {
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
  whyAdded: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  context: {
    fontSize: 12,
    fontFamily: FONTS.italic,
    lineHeight: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
});
