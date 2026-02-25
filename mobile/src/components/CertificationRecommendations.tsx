import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  Award,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Clock,
  DollarSign,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Filter,
  Star,
} from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface Certification {
  id: string;
  name: string;
  provider: string;
  description: string;
  relevance_to_role: string;
  priority: 'essential' | 'recommended' | 'optional';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_time: string;
  estimated_cost: string;
  roi_description: string;
  skills_covered: string[];
  official_url?: string;
  study_resources?: {
    name: string;
    type: string;
    url?: string;
  }[];
}

interface RecommendationsData {
  certifications: Certification[];
  role_context: {
    current_role: string;
    target_role: string;
  };
}

interface Props {
  jobTitle: string;
  companyName?: string;
  onGenerate?: () => Promise<RecommendationsData | null>;
}

type PriorityFilter = 'all' | 'essential' | 'recommended' | 'optional';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

export default function CertificationRecommendations({
  jobTitle,
  companyName,
  onGenerate,
}: Props) {
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');

  const handleGenerate = async () => {
    if (!onGenerate) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onGenerate();
      if (result) {
        setData(result);
        // Auto-expand first essential certification
        const firstEssential = result.certifications.find((c) => c.priority === 'essential');
        if (firstEssential) {
          setExpandedCerts(new Set([firstEssential.id]));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (certId: string) => {
    const newSet = new Set(expandedCerts);
    if (newSet.has(certId)) {
      newSet.delete(certId);
    } else {
      newSet.add(certId);
    }
    setExpandedCerts(newSet);
  };

  const openUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'essential':
        return COLORS.danger;
      case 'recommended':
        return COLORS.warning;
      case 'optional':
        return COLORS.info;
      default:
        return colors.textSecondary;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return COLORS.success;
      case 'intermediate':
        return COLORS.warning;
      case 'advanced':
        return COLORS.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getFilteredCerts = (): Certification[] => {
    if (!data) return [];

    let filtered = data.certifications;

    if (priorityFilter !== 'all') {
      filtered = filtered.filter((c) => c.priority === priorityFilter);
    }

    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((c) => c.difficulty === difficultyFilter);
    }

    // Sort by priority
    const priorityOrder = { essential: 0, recommended: 1, optional: 2 };
    return filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  if (!data && !loading) {
    return (
      <GlassCard material="regular" shadow="subtle" style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Award color={COLORS.primary} size={64} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Certification Recommendations
        </Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          Get AI-powered certification recommendations tailored to your career goals
          {companyName && ` at ${companyName}`}.
        </Text>
        <Text style={[styles.emptyNote, { color: colors.textTertiary }]}>
          We'll analyze the {jobTitle} role and recommend certifications that maximize your
          ROI, considering difficulty, cost, and career impact.
        </Text>
        <GlassButton
          label={loading ? 'Generating...' : 'Generate Recommendations'}
          variant="primary"
          onPress={handleGenerate}
          disabled={loading}
          icon={loading ? undefined : <Sparkles size={20} color="#ffffff" />}
          style={styles.generateButton}
        />
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
            <AlertCircle color={COLORS.danger} size={20} />
            <Text style={[styles.errorText, { color: COLORS.danger }]}>{error}</Text>
          </View>
        )}
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard material="regular" style={styles.loadingCard}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Analyzing role and generating recommendations...
        </Text>
      </GlassCard>
    );
  }

  const filteredCerts = getFilteredCerts();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Role Context */}
      {data?.role_context && (
        <GlassCard material="thin" style={styles.contextCard}>
          <View style={styles.contextRow}>
            <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>
              Current:
            </Text>
            <Text style={[styles.contextValue, { color: colors.text }]}>
              {data.role_context.current_role}
            </Text>
          </View>
          <View style={styles.contextRow}>
            <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>
              Target:
            </Text>
            <Text style={[styles.contextValue, { color: COLORS.primary }]}>
              {data.role_context.target_role}
            </Text>
          </View>
        </GlassCard>
      )}

      {/* Filters */}
      <GlassCard material="thin" style={styles.filterCard}>
        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <Filter color={colors.textSecondary} size={16} />
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Priority:</Text>
          </View>
          <View style={styles.filterRow}>
            {(['all', 'essential', 'recommended', 'optional'] as PriorityFilter[]).map(
              (priority) => (
                <TouchableOpacity
                  key={priority}
                  onPress={() => setPriorityFilter(priority)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        priorityFilter === priority
                          ? ALPHA_COLORS.primary.bg
                          : colors.backgroundTertiary,
                      borderColor: priorityFilter === priority ? COLORS.primary : (isDark ? colors.border : 'transparent'),
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${priority}`}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color:
                          priorityFilter === priority
                            ? priority === 'all'
                              ? COLORS.primary
                              : getPriorityColor(priority)
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>

        <View style={styles.filterSection}>
          <View style={styles.filterHeader}>
            <TrendingUp color={colors.textSecondary} size={16} />
            <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
              Difficulty:
            </Text>
          </View>
          <View style={styles.filterRow}>
            {(['all', 'beginner', 'intermediate', 'advanced'] as DifficultyFilter[]).map(
              (diff) => (
                <TouchableOpacity
                  key={diff}
                  onPress={() => setDifficultyFilter(diff)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        difficultyFilter === diff
                          ? ALPHA_COLORS.primary.bg
                          : colors.backgroundTertiary,
                      borderColor: difficultyFilter === diff ? COLORS.primary : (isDark ? colors.border : 'transparent'),
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${diff}`}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color:
                          difficultyFilter === diff
                            ? diff === 'all'
                              ? COLORS.primary
                              : getDifficultyColor(diff)
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </GlassCard>

      {/* Certifications */}
      {filteredCerts.map((cert, index) => {
        const isExpanded = expandedCerts.has(cert.id);

        return (
          <GlassCard key={cert.id} material="regular" shadow="subtle" style={styles.certCard}>
            {/* Cert Header */}
            <TouchableOpacity
              onPress={() => toggleExpand(cert.id)}
              style={styles.certHeader}
              accessibilityRole="button"
              accessibilityLabel={`Certification ${index + 1}`}
              accessibilityState={{ expanded: isExpanded }}
            >
              <View style={styles.certHeaderContent}>
                <View style={styles.badges}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: `${getPriorityColor(cert.priority)}20` },
                    ]}
                  >
                    <Star
                      color={getPriorityColor(cert.priority)}
                      size={12}
                      fill={cert.priority === 'essential' ? getPriorityColor(cert.priority) : 'none'}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(cert.priority) },
                      ]}
                    >
                      {cert.priority.toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: `${getDifficultyColor(cert.difficulty)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(cert.difficulty) },
                      ]}
                    >
                      {cert.difficulty}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.certName, { color: colors.text }]}>{cert.name}</Text>
                <Text style={[styles.provider, { color: colors.textSecondary }]}>
                  {cert.provider}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Clock color={colors.textTertiary} size={14} />
                    <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                      {cert.estimated_time}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <DollarSign color={colors.textTertiary} size={14} />
                    <Text style={[styles.metaText, { color: colors.textTertiary }]}>
                      {cert.estimated_cost}
                    </Text>
                  </View>
                </View>
              </View>
              <Award
                color={isExpanded ? COLORS.primary : colors.textSecondary}
                size={24}
              />
            </TouchableOpacity>

            {/* Expanded Content */}
            {isExpanded && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {/* Description */}
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  {cert.description}
                </Text>

                {/* Relevance */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: COLORS.info }]}>
                    RELEVANCE TO YOUR ROLE
                  </Text>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {cert.relevance_to_role}
                  </Text>
                </View>

                {/* ROI */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <TrendingUp color={COLORS.success} size={16} />
                    <Text style={[styles.sectionLabel, { color: COLORS.success }]}>
                      RETURN ON INVESTMENT
                    </Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {cert.roi_description}
                  </Text>
                </View>

                {/* Skills Covered */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>
                    SKILLS COVERED
                  </Text>
                  <View style={styles.skillsContainer}>
                    {cert.skills_covered.map((skill, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.skillChip,
                          { backgroundColor: ALPHA_COLORS.primary.bg },
                        ]}
                      >
                        <CheckCircle color={COLORS.primary} size={12} />
                        <Text style={[styles.skillText, { color: COLORS.primary }]}>
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Study Resources */}
                {cert.study_resources && cert.study_resources.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <BookOpen color={COLORS.warning} size={16} />
                      <Text style={[styles.sectionLabel, { color: COLORS.warning }]}>
                        STUDY RESOURCES
                      </Text>
                    </View>
                    {cert.study_resources.map((resource, idx) => (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => resource.url && openUrl(resource.url)}
                        style={[
                          styles.resourceItem,
                          { backgroundColor: colors.backgroundTertiary },
                        ]}
                        disabled={!resource.url}
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${resource.name}`}
                      >
                        <View style={styles.resourceInfo}>
                          <Text style={[styles.resourceName, { color: colors.text }]}>
                            {resource.name}
                          </Text>
                          <Text style={[styles.resourceType, { color: colors.textTertiary }]}>
                            {resource.type}
                          </Text>
                        </View>
                        {resource.url && <ExternalLink color={COLORS.primary} size={16} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Official Link */}
                {cert.official_url && (
                  <GlassButton
                    label="View Official Page"
                    variant="primary"
                    icon={<ExternalLink size={18} color="#ffffff" />}
                    onPress={() => openUrl(cert.official_url!)}
                    style={styles.officialButton}
                  />
                )}
              </View>
            )}
          </GlassCard>
        );
      })}

      {filteredCerts.length === 0 && (
        <GlassCard material="regular" style={styles.emptyFilterCard}>
          <AlertCircle color={colors.textSecondary} size={48} />
          <Text style={[styles.emptyFilterText, { color: colors.textSecondary }]}>
            No certifications match the selected filters.
          </Text>
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  emptyNote: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  generateButton: {
    minWidth: 200,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  loadingCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  contextCard: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  contextLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    width: 70,
  },
  contextValue: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    flex: 1,
  },
  filterCard: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  filterSection: {
    gap: SPACING.xs,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  filterChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
  certCard: {
    overflow: 'hidden',
  },
  certHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  certHeaderContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'capitalize',
  },
  certName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    lineHeight: 22,
  },
  provider: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  metaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  expandedContent: {
    borderTopWidth: 1,
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  skillText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceName: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  resourceType: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    textTransform: 'capitalize',
  },
  officialButton: {
    marginTop: SPACING.xs,
  },
  emptyFilterCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyFilterText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
});
