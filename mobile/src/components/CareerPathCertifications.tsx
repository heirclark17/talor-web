import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import {
  Award,
  Clock,
  DollarSign,
  TrendingUp,
  ExternalLink,
  CheckCircle,
  Star,
  Target,
  BookOpen,
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
  why_recommended: string;
  relevance_score: number;
  priority: 'high' | 'medium' | 'low';
  estimated_time: string;
  estimated_cost: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  prerequisites?: string[];
  skills_gained: string[];
  career_impact: string;
  study_resources?: {
    name: string;
    type: 'official' | 'course' | 'book' | 'practice';
    url?: string;
  }[];
  exam_details?: {
    format: string;
    duration: string;
    passing_score: string;
  };
  url?: string;
}

interface Props {
  certifications: Certification[];
  currentRole?: string;
  targetRole?: string;
  onToggleCompleted?: (certId: string) => void;
  completedCertIds?: string[];
}

export default function CareerPathCertifications({
  certifications,
  currentRole,
  targetRole,
  onToggleCompleted,
  completedCertIds = [],
}: Props) {
  const { colors, isDark } = useTheme();
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const toggleExpand = (certId: string) => {
    const newSet = new Set(expandedCerts);
    if (newSet.has(certId)) {
      newSet.delete(certId);
    } else {
      newSet.add(certId);
    }
    setExpandedCerts(newSet);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return COLORS.danger;
      case 'medium':
        return COLORS.warning;
      case 'low':
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
        return COLORS.info;
      case 'advanced':
        return COLORS.warning;
      case 'expert':
        return COLORS.danger;
      default:
        return colors.textSecondary;
    }
  };

  const openUrl = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const filteredCerts =
    priorityFilter === 'all'
      ? certifications
      : certifications.filter((cert) => cert.priority === priorityFilter);

  const sortedCerts = [...filteredCerts].sort((a, b) => {
    // Sort by priority, then relevance score
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];

    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    return b.relevance_score - a.relevance_score;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      {(currentRole || targetRole) && (
        <GlassCard material="thin" style={styles.headerCard}>
          <View style={styles.header}>
            <Target color={COLORS.primary} size={24} />
            <View style={styles.headerText}>
              {currentRole && (
                <Text style={[styles.roleText, { color: colors.textSecondary }]}>
                  Current: {currentRole}
                </Text>
              )}
              {targetRole && (
                <Text style={[styles.targetRoleText, { color: colors.text }]}>
                  Target: {targetRole}
                </Text>
              )}
            </View>
          </View>
        </GlassCard>
      )}

      {/* Priority Filter */}
      <GlassCard material="thin" style={styles.filterCard}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Priority:</Text>
        <View style={styles.filterRow}>
          {(['all', 'high', 'medium', 'low'] as const).map((priority) => (
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
              accessibilityLabel={`Filter by ${priority} priority`}
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
          ))}
        </View>
      </GlassCard>

      {/* Certifications List */}
      {sortedCerts.map((cert, index) => {
        const isExpanded = expandedCerts.has(cert.id);
        const isCompleted = completedCertIds.includes(cert.id);

        return (
          <GlassCard
            key={cert.id}
            material="regular"
            shadow="subtle"
            style={[
              styles.certCard,
              isCompleted && { opacity: 0.7 },
            ]}
          >
            {/* Cert Header */}
            <TouchableOpacity
              onPress={() => toggleExpand(cert.id)}
              style={styles.certHeader}
              accessibilityRole="button"
              accessibilityLabel={`Certification ${index + 1}`}
              accessibilityState={{ expanded: isExpanded }}
            >
              <View style={styles.certHeaderContent}>
                <View style={styles.certMeta}>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: `${getPriorityColor(cert.priority)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getPriorityColor(cert.priority) },
                      ]}
                    >
                      {cert.priority.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.scoreContainer}>
                    <Star color={COLORS.warning} size={14} fill={COLORS.warning} />
                    <Text style={[styles.scoreText, { color: COLORS.warning }]}>
                      {cert.relevance_score}%
                    </Text>
                  </View>
                </View>
                <Text style={[styles.certName, { color: colors.text }]}>
                  {cert.name}
                </Text>
                <Text style={[styles.provider, { color: colors.textSecondary }]}>
                  {cert.provider}
                </Text>
                <View style={styles.quickInfo}>
                  <View style={styles.infoItem}>
                    <Clock color={colors.textTertiary} size={14} />
                    <Text style={[styles.infoText, { color: colors.textTertiary }]}>
                      {cert.estimated_time}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <DollarSign color={colors.textTertiary} size={14} />
                    <Text style={[styles.infoText, { color: colors.textTertiary }]}>
                      {cert.estimated_cost}
                    </Text>
                  </View>
                </View>
              </View>
              {isCompleted && (
                <CheckCircle color={COLORS.success} size={24} fill={COLORS.success} />
              )}
            </TouchableOpacity>

            {/* Expanded Content */}
            {isExpanded && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {/* Description */}
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                  {cert.description}
                </Text>

                {/* Why Recommended */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: COLORS.info }]}>
                    WHY RECOMMENDED
                  </Text>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {cert.why_recommended}
                  </Text>
                </View>

                {/* Career Impact */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <TrendingUp color={COLORS.success} size={16} />
                    <Text style={[styles.sectionLabel, { color: COLORS.success }]}>
                      CAREER IMPACT
                    </Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {cert.career_impact}
                  </Text>
                </View>

                {/* Skills Gained */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>
                    SKILLS YOU'LL GAIN
                  </Text>
                  <View style={styles.skillsContainer}>
                    {cert.skills_gained.map((skill, idx) => (
                      <View
                        key={idx}
                        style={[styles.skillChip, { backgroundColor: ALPHA_COLORS.primary.bg }]}
                      >
                        <Text style={[styles.skillText, { color: COLORS.primary }]}>
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Prerequisites */}
                {cert.prerequisites && cert.prerequisites.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: COLORS.warning }]}>
                      PREREQUISITES
                    </Text>
                    {cert.prerequisites.map((prereq, idx) => (
                      <View key={idx} style={styles.prereqItem}>
                        <Text style={[styles.bullet, { color: COLORS.warning }]}>•</Text>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                          {prereq}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Exam Details */}
                {cert.exam_details && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: colors.text }]}>
                      EXAM DETAILS
                    </Text>
                    <View
                      style={[
                        styles.examBox,
                        { backgroundColor: colors.backgroundTertiary },
                      ]}
                    >
                      <View style={styles.examRow}>
                        <Text style={[styles.examLabel, { color: colors.textSecondary }]}>
                          Format:
                        </Text>
                        <Text style={[styles.examValue, { color: colors.text }]}>
                          {cert.exam_details.format}
                        </Text>
                      </View>
                      <View style={styles.examRow}>
                        <Text style={[styles.examLabel, { color: colors.textSecondary }]}>
                          Duration:
                        </Text>
                        <Text style={[styles.examValue, { color: colors.text }]}>
                          {cert.exam_details.duration}
                        </Text>
                      </View>
                      <View style={styles.examRow}>
                        <Text style={[styles.examLabel, { color: colors.textSecondary }]}>
                          Passing Score:
                        </Text>
                        <Text style={[styles.examValue, { color: colors.text }]}>
                          {cert.exam_details.passing_score}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Study Resources */}
                {cert.study_resources && cert.study_resources.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <BookOpen color={COLORS.info} size={16} />
                      <Text style={[styles.sectionLabel, { color: COLORS.info }]}>
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

                {/* Actions */}
                <View style={styles.actions}>
                  {cert.url && (
                    <GlassButton
                      label="Learn More"
                      variant="secondary"
                      icon={<ExternalLink color={colors.text} size={16} />}
                      onPress={() => openUrl(cert.url!)}
                      style={styles.actionButton}
                    />
                  )}
                  {onToggleCompleted && (
                    <TouchableOpacity
                      onPress={() => onToggleCompleted(cert.id)}
                      style={[
                        styles.completeButton,
                        {
                          backgroundColor: isCompleted
                            ? ALPHA_COLORS.success.bg
                            : colors.backgroundTertiary,
                        },
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isCompleted ? 'Mark as incomplete' : 'Mark as completed'
                      }
                    >
                      <CheckCircle
                        color={isCompleted ? COLORS.success : colors.textSecondary}
                        size={16}
                        fill={isCompleted ? COLORS.success : 'none'}
                      />
                      <Text
                        style={[
                          styles.completeButtonText,
                          {
                            color: isCompleted ? COLORS.success : colors.textSecondary,
                          },
                        ]}
                      >
                        {isCompleted ? 'Completed' : 'Mark Complete'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </GlassCard>
        );
      })}

      {sortedCerts.length === 0 && (
        <GlassCard material="regular" style={styles.emptyCard}>
          <Award color={colors.textTertiary} size={48} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No certifications match the selected filter.
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
  headerCard: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  roleText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  targetRoleText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  filterCard: {
    padding: SPACING.md,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
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
  certMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
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
  quickInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  skillText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  prereqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
  },
  examBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  examRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  examLabel: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  examValue: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
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
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  completeButtonText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
});
