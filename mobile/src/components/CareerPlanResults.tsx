import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import Svg, { Line, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import {
  TrendingUp,
  Target,
  Calendar,
  Award,
  Briefcase,
  DollarSign,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Clock,
  BookOpen,
  Users,
  ExternalLink,
  Code,
  GraduationCap,
  Zap,
  Star,
} from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, ANIMATION } from '../utils/constants';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CareerMilestone {
  id: string;
  role: string;
  timeline: string;
  salary_range: string;
  key_skills_needed: string[];
  certifications_recommended: string[];
  experience_required: string;
  companies_to_target?: string[];
}

interface SkillGap {
  skill: string;
  current_level: 'none' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
  required_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  priority: 'critical' | 'high' | 'medium' | 'low';
  how_to_acquire: string;
}

interface LearningResource {
  title: string;
  type: 'course' | 'certification' | 'book' | 'workshop' | 'online';
  provider?: string;
  estimated_hours?: number;
  cost?: string;
  url?: string;
  skill_addressed: string;
}

interface NetworkingEvent {
  name: string;
  type: 'conference' | 'meetup' | 'webinar' | 'workshop';
  date?: string;
  location?: string;
  url?: string;
  relevance: string;
}

interface ExperienceProject {
  type: string;
  title: string;
  description: string;
  skills_demonstrated: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  step_by_step_guide: string[];
  time_commitment: string;
  how_to_showcase: string;
  detailed_tech_stack?: any[];
  architecture_overview?: string;
  github_example_repos?: string[];
}

interface EducationOptionItem {
  type: string;
  name: string;
  duration: string;
  cost_range: string;
  format: string;
  official_link?: string;
  description?: string;
  who_its_best_for?: string;
  financing_options?: string;
  employment_outcomes?: string;
  time_commitment_weekly?: string;
  comparison_rank?: number;
  pros: string[];
  cons: string[];
}

interface CareerPlanData {
  current_role: string;
  target_role: string;
  estimated_timeline: string;
  milestones: CareerMilestone[];
  skill_gaps: SkillGap[];
  immediate_actions: string[];
  long_term_goals: string[];
  salary_progression?: {
    current: string;
    target: string;
    growth_percentage: number;
  };
  learning_resources?: LearningResource[];
  networking_events?: NetworkingEvent[];
  experience_plan?: ExperienceProject[];
  education_options?: EducationOptionItem[];
  certification_journey_summary?: string;
  education_recommendation?: string;
}

interface Props {
  planData: CareerPlanData;
  onSavePlan?: () => void;
  onExportPlan?: () => void;
}

// Timeline visualization component
function TimelineVisualization({
  milestones,
  colors
}: {
  milestones: CareerMilestone[];
  colors: any;
}) {
  const nodeSize = 12;
  const lineHeight = 60;
  const totalHeight = (milestones.length - 1) * lineHeight + nodeSize * 2;

  return (
    <View style={timelineStyles.container}>
      <Svg width={40} height={totalHeight}>
        <Defs>
          <LinearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={COLORS.primary} />
            <Stop offset="100%" stopColor={COLORS.success} />
          </LinearGradient>
        </Defs>
        {/* Connecting line */}
        <Line
          x1={20}
          y1={nodeSize}
          x2={20}
          y2={totalHeight - nodeSize}
          stroke="url(#lineGradient)"
          strokeWidth={2}
          strokeDasharray={milestones.length > 2 ? "0" : "0"}
        />
        {/* Milestone nodes */}
        {milestones.map((_, index) => {
          const y = index * lineHeight + nodeSize;
          const isFirst = index === 0;
          const isLast = index === milestones.length - 1;
          return (
            <Circle
              key={index}
              cx={20}
              cy={y}
              r={nodeSize / 2 + (isFirst || isLast ? 2 : 0)}
              fill={isFirst ? COLORS.primary : isLast ? COLORS.success : colors.glass}
              stroke={isFirst ? COLORS.primary : isLast ? COLORS.success : COLORS.info}
              strokeWidth={2}
            />
          );
        })}
      </Svg>
      <View style={timelineStyles.labels}>
        {milestones.map((milestone, index) => (
          <View
            key={milestone.id}
            style={[
              timelineStyles.labelContainer,
              { height: index === milestones.length - 1 ? 'auto' : lineHeight }
            ]}
          >
            <Text
              style={[
                timelineStyles.labelText,
                { color: colors.text },
                index === 0 && timelineStyles.firstLabel,
                index === milestones.length - 1 && timelineStyles.lastLabel,
              ]}
              numberOfLines={1}
            >
              {milestone.role}
            </Text>
            <Text style={[timelineStyles.labelTimeline, { color: colors.textSecondary }]}>
              {milestone.timeline}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
  },
  labels: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  labelContainer: {
    justifyContent: 'flex-start',
  },
  labelText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  labelTimeline: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  firstLabel: {
    color: COLORS.primary,
  },
  lastLabel: {
    color: COLORS.success,
  },
});

export default function CareerPlanResults({ planData, onSavePlan, onExportPlan }: Props) {
  const { colors, isDark } = useTheme();
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set([planData.milestones[0]?.id]));
  const [showSkillGaps, setShowSkillGaps] = useState(true);
  const [showActions, setShowActions] = useState(true);
  const [showLearning, setShowLearning] = useState(false);
  const [showNetworking, setShowNetworking] = useState(false);
  const [expandedSkillGaps, setExpandedSkillGaps] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'timeline' | 'detailed'>('timeline');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [showExperiencePlan, setShowExperiencePlan] = useState(false);
  const [showEducationOptions, setShowEducationOptions] = useState(false);

  const toggleMilestone = useCallback((milestoneId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(milestoneId)) {
        newSet.delete(milestoneId);
      } else {
        newSet.add(milestoneId);
      }
      return newSet;
    });
  }, []);

  const toggleSkillGap = useCallback((index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSkillGaps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'none':
        return colors.textTertiary;
      case 'beginner':
        return COLORS.danger;
      case 'intermediate':
        return COLORS.warning;
      case 'advanced':
        return COLORS.info;
      case 'expert':
        return COLORS.success;
      default:
        return colors.textSecondary;
    }
  };

  const toggleProject = useCallback((projectTitle: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectTitle)) {
        newSet.delete(projectTitle);
      } else {
        newSet.add(projectTitle);
      }
      return newSet;
    });
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return COLORS.success;
      case 'intermediate':
        return COLORS.info;
      case 'advanced':
        return COLORS.warning;
      default:
        return colors.textSecondary;
    }
  };

  const getProjectTypeColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('portfolio')) return COLORS.primary;
    if (t.includes('volunteer')) return COLORS.success;
    if (t.includes('lab')) return COLORS.warning;
    return COLORS.info;
  };

  const filteredProjects = planData.experience_plan
    ? difficultyFilter === 'all'
      ? planData.experience_plan
      : planData.experience_plan.filter((p) => p.difficulty_level === difficultyFilter)
    : [];

  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return COLORS.danger;
      case 'high':
        return COLORS.warning;
      case 'medium':
        return COLORS.info;
      case 'low':
        return COLORS.success;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Summary */}
      <GlassCard material="regular" shadow="elevated" style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Target color={COLORS.primary} size={32} />
          <View style={styles.summaryText}>
            <Text style={[styles.currentRole, { color: colors.textSecondary }]}>
              {planData.current_role}
            </Text>
            <ArrowRight color={colors.textTertiary} size={20} />
            <Text style={[styles.targetRole, { color: colors.text }]}>
              {planData.target_role}
            </Text>
          </View>
        </View>

        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Calendar color={COLORS.info} size={20} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Timeline</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {planData.estimated_timeline}
            </Text>
          </View>

          {planData.salary_progression && (
            <View style={styles.statItem}>
              <DollarSign color={COLORS.success} size={20} />
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Salary Growth
              </Text>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                +{planData.salary_progression.growth_percentage}%
              </Text>
            </View>
          )}

          <View style={styles.statItem}>
            <MapPin color={COLORS.warning} size={20} />
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Milestones</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {planData.milestones.length}
            </Text>
          </View>
        </View>
      </GlassCard>

      {/* View Mode Toggle */}
      <View style={[styles.viewModeContainer, { backgroundColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[3] }]}>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'timeline' && styles.viewModeButtonActive,
            { backgroundColor: viewMode === 'timeline' ? ALPHA_COLORS.primary.bg : 'transparent' }
          ]}
          onPress={() => setViewMode('timeline')}
        >
          <Text style={[
            styles.viewModeText,
            { color: viewMode === 'timeline' ? COLORS.primary : colors.textSecondary }
          ]}>
            Timeline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeButton,
            viewMode === 'detailed' && styles.viewModeButtonActive,
            { backgroundColor: viewMode === 'detailed' ? ALPHA_COLORS.primary.bg : 'transparent' }
          ]}
          onPress={() => setViewMode('detailed')}
        >
          <Text style={[
            styles.viewModeText,
            { color: viewMode === 'detailed' ? COLORS.primary : colors.textSecondary }
          ]}>
            Detailed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <Animated.View entering={FadeIn.duration(300)}>
          <GlassCard material="regular" shadow="subtle" style={styles.timelineCard}>
            <View style={styles.sectionHeader}>
              <MapPin color={COLORS.primary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Career Journey</Text>
            </View>
            <TimelineVisualization milestones={planData.milestones} colors={colors} />
          </GlassCard>
        </Animated.View>
      )}

      {/* Career Milestones (Detailed View) */}
      {viewMode === 'detailed' && (
        <Animated.View entering={FadeIn.duration(300)}>
          <GlassCard material="thin" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Briefcase color={COLORS.primary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Career Milestones</Text>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {viewMode === 'detailed' && planData.milestones.map((milestone, index) => {
        const isExpanded = expandedMilestones.has(milestone.id);
        const isLast = index === planData.milestones.length - 1;

        return (
          <View key={milestone.id} style={styles.milestoneContainer}>
            <GlassCard material="regular" shadow="subtle" style={styles.milestoneCard}>
              {/* Milestone Header */}
              <TouchableOpacity
                onPress={() => toggleMilestone(milestone.id)}
                style={styles.milestoneHeader}
                accessibilityRole="button"
                accessibilityLabel={`Milestone ${index + 1}`}
                accessibilityState={{ expanded: isExpanded }}
              >
                <View style={styles.milestoneNumber}>
                  <Text style={[styles.milestoneNumberText, { color: COLORS.primary }]}>
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.milestoneHeaderText}>
                  <Text style={[styles.milestoneRole, { color: colors.text }]}>
                    {milestone.role}
                  </Text>
                  <View style={styles.milestoneMetaRow}>
                    <View style={styles.milestoneMetaItem}>
                      <Calendar color={colors.textTertiary} size={14} />
                      <Text style={[styles.milestoneMetaText, { color: colors.textSecondary }]}>
                        {milestone.timeline}
                      </Text>
                    </View>
                    <View style={styles.milestoneMetaItem}>
                      <DollarSign color={colors.textTertiary} size={14} />
                      <Text style={[styles.milestoneMetaText, { color: colors.textSecondary }]}>
                        {milestone.salary_range}
                      </Text>
                    </View>
                  </View>
                </View>
                {isExpanded ? (
                  <ChevronUp color={colors.textSecondary} size={20} />
                ) : (
                  <ChevronDown color={colors.textSecondary} size={20} />
                )}
              </TouchableOpacity>

              {/* Expanded Milestone Content */}
              {isExpanded && (
                <View style={[styles.milestoneContent, { borderTopColor: colors.border }]}>
                  {/* Key Skills */}
                  <View style={styles.contentSection}>
                    <Text style={[styles.contentLabel, { color: COLORS.primary }]}>
                      Key Skills Needed
                    </Text>
                    <View style={styles.skillsList}>
                      {milestone.key_skills_needed.map((skill, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.skillChip,
                            { backgroundColor: ALPHA_COLORS.primary.bg },
                          ]}
                        >
                          <Text style={[styles.skillChipText, { color: COLORS.primary }]}>
                            {skill}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Certifications */}
                  {milestone.certifications_recommended.length > 0 && (
                    <View style={styles.contentSection}>
                      <Text style={[styles.contentLabel, { color: COLORS.warning }]}>
                        Recommended Certifications
                      </Text>
                      {milestone.certifications_recommended.map((cert, idx) => (
                        <View key={idx} style={styles.certItem}>
                          <Award color={COLORS.warning} size={16} />
                          <Text style={[styles.certText, { color: colors.textSecondary }]}>
                            {cert}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Experience Required */}
                  <View style={styles.contentSection}>
                    <Text style={[styles.contentLabel, { color: COLORS.info }]}>
                      Experience Required
                    </Text>
                    <Text style={[styles.contentText, { color: colors.textSecondary }]}>
                      {milestone.experience_required}
                    </Text>
                  </View>

                  {/* Target Companies */}
                  {milestone.companies_to_target && milestone.companies_to_target.length > 0 && (
                    <View style={styles.contentSection}>
                      <Text style={[styles.contentLabel, { color: COLORS.success }]}>
                        Companies to Target
                      </Text>
                      <View style={styles.companiesList}>
                        {milestone.companies_to_target.map((company, idx) => (
                          <Text
                            key={idx}
                            style={[styles.companyText, { color: colors.textSecondary }]}
                          >
                            • {company}
                          </Text>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </GlassCard>

            {/* Connector Line */}
            {!isLast && (
              <View
                style={[
                  styles.connectorLine,
                  { backgroundColor: colors.border },
                ]}
              />
            )}
          </View>
        );
      })}

      {/* Skill Gaps */}
      <GlassCard material="thin" style={styles.sectionCard}>
        <TouchableOpacity
          onPress={() => setShowSkillGaps(!showSkillGaps)}
          style={styles.sectionHeader}
          accessibilityRole="button"
          accessibilityLabel="Skill gaps section"
          accessibilityState={{ expanded: showSkillGaps }}
        >
          <TrendingUp color={COLORS.warning} size={20} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Skill Gaps to Address ({planData.skill_gaps.length})
          </Text>
          {showSkillGaps ? (
            <ChevronUp color={colors.textSecondary} size={20} />
          ) : (
            <ChevronDown color={colors.textSecondary} size={20} />
          )}
        </TouchableOpacity>
      </GlassCard>

      {showSkillGaps && (
        <GlassCard material="regular" style={styles.skillGapsCard}>
          {planData.skill_gaps.map((gap, index) => (
            <View
              key={index}
              style={[
                styles.skillGapItem,
                index < planData.skill_gaps.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.skillGapHeader}>
                <Text style={[styles.skillGapName, { color: colors.text }]}>{gap.skill}</Text>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: `${getPriorityColor(gap.priority)}20` },
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      { color: getPriorityColor(gap.priority) },
                    ]}
                  >
                    {gap.priority.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.skillLevelBar}>
                <View style={styles.levelItem}>
                  <Text style={[styles.levelLabel, { color: colors.textTertiary }]}>
                    Current
                  </Text>
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: `${getSkillLevelColor(gap.current_level)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.levelText,
                        { color: getSkillLevelColor(gap.current_level) },
                      ]}
                    >
                      {gap.current_level}
                    </Text>
                  </View>
                </View>

                <ArrowRight color={colors.textTertiary} size={16} />

                <View style={styles.levelItem}>
                  <Text style={[styles.levelLabel, { color: colors.textTertiary }]}>
                    Required
                  </Text>
                  <View
                    style={[
                      styles.levelBadge,
                      { backgroundColor: `${getSkillLevelColor(gap.required_level)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.levelText,
                        { color: getSkillLevelColor(gap.required_level) },
                      ]}
                    >
                      {gap.required_level}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={[styles.howToAcquire, { color: colors.textSecondary }]}>
                {gap.how_to_acquire}
              </Text>
            </View>
          ))}
        </GlassCard>
      )}

      {/* Action Items */}
      <GlassCard material="thin" style={styles.sectionCard}>
        <TouchableOpacity
          onPress={() => setShowActions(!showActions)}
          style={styles.sectionHeader}
          accessibilityRole="button"
          accessibilityLabel="Action items section"
          accessibilityState={{ expanded: showActions }}
        >
          <CheckCircle2 color={COLORS.success} size={20} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Action Plan</Text>
          {showActions ? (
            <ChevronUp color={colors.textSecondary} size={20} />
          ) : (
            <ChevronDown color={colors.textSecondary} size={20} />
          )}
        </TouchableOpacity>
      </GlassCard>

      {showActions && (
        <>
          <GlassCard material="regular" style={styles.actionsCard}>
            <Text style={[styles.actionsLabel, { color: COLORS.danger }]}>
              IMMEDIATE ACTIONS (Start Now)
            </Text>
            {planData.immediate_actions.map((action, index) => (
              <View key={index} style={styles.actionItem}>
                <View
                  style={[
                    styles.actionBullet,
                    { backgroundColor: ALPHA_COLORS.danger.bg },
                  ]}
                >
                  <Text style={[styles.actionNumber, { color: COLORS.danger }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                  {action}
                </Text>
              </View>
            ))}
          </GlassCard>

          <GlassCard material="regular" style={styles.actionsCard}>
            <Text style={[styles.actionsLabel, { color: COLORS.info }]}>
              LONG-TERM GOALS (Next 12-24 Months)
            </Text>
            {planData.long_term_goals.map((goal, index) => (
              <View key={index} style={styles.actionItem}>
                <View
                  style={[
                    styles.actionBullet,
                    { backgroundColor: ALPHA_COLORS.info.bg },
                  ]}
                >
                  <Text style={[styles.actionNumber, { color: COLORS.info }]}>
                    {index + 1}
                  </Text>
                </View>
                <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                  {goal}
                </Text>
              </View>
            ))}
          </GlassCard>
        </>
      )}

      {/* Learning Resources */}
      {planData.learning_resources && planData.learning_resources.length > 0 && (
        <>
          <GlassCard material="thin" style={styles.sectionCard}>
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowLearning(!showLearning);
              }}
              style={styles.sectionHeader}
              accessibilityRole="button"
              accessibilityLabel="Learning resources section"
              accessibilityState={{ expanded: showLearning }}
            >
              <BookOpen color={COLORS.purple} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Learning Resources ({planData.learning_resources.length})
              </Text>
              {showLearning ? (
                <ChevronUp color={colors.textSecondary} size={20} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </GlassCard>

          {showLearning && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
              <GlassCard material="regular" style={styles.learningCard}>
                {planData.learning_resources.map((resource, index) => (
                  <View
                    key={index}
                    style={[
                      styles.resourceItem,
                      index < planData.learning_resources!.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.resourceHeader}>
                      <View style={[styles.resourceTypeBadge, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
                        <Text style={[styles.resourceTypeText, { color: COLORS.purple }]}>
                          {resource.type.toUpperCase()}
                        </Text>
                      </View>
                      {resource.estimated_hours && (
                        <View style={styles.resourceMeta}>
                          <Clock color={colors.textTertiary} size={14} />
                          <Text style={[styles.resourceMetaText, { color: colors.textSecondary }]}>
                            {resource.estimated_hours}h
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.resourceTitle, { color: colors.text }]}>
                      {resource.title}
                    </Text>
                    {resource.provider && (
                      <Text style={[styles.resourceProvider, { color: colors.textSecondary }]}>
                        {resource.provider}
                      </Text>
                    )}
                    <View style={styles.resourceFooter}>
                      <View style={[styles.skillBadge, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                        <Text style={[styles.skillBadgeText, { color: COLORS.info }]}>
                          {resource.skill_addressed}
                        </Text>
                      </View>
                      {resource.cost && (
                        <Text style={[styles.resourceCost, { color: COLORS.success }]}>
                          {resource.cost}
                        </Text>
                      )}
                    </View>
                    {resource.url && (
                      <TouchableOpacity style={styles.resourceLinkButton}>
                        <ExternalLink color={COLORS.primary} size={14} />
                        <Text style={[styles.resourceLinkText, { color: COLORS.primary }]}>
                          View Resource
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}
        </>
      )}

      {/* Networking Events */}
      {planData.networking_events && planData.networking_events.length > 0 && (
        <>
          <GlassCard material="thin" style={styles.sectionCard}>
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowNetworking(!showNetworking);
              }}
              style={styles.sectionHeader}
              accessibilityRole="button"
              accessibilityLabel="Networking events section"
              accessibilityState={{ expanded: showNetworking }}
            >
              <Users color={COLORS.cyan} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Networking Events ({planData.networking_events.length})
              </Text>
              {showNetworking ? (
                <ChevronUp color={colors.textSecondary} size={20} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </GlassCard>

          {showNetworking && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
              <GlassCard material="regular" style={styles.networkingCard}>
                {planData.networking_events.map((event, index) => (
                  <View
                    key={index}
                    style={[
                      styles.eventItem,
                      index < planData.networking_events!.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.eventHeader}>
                      <View style={[styles.eventTypeBadge, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                        <Text style={[styles.eventTypeText, { color: COLORS.cyan }]}>
                          {event.type.toUpperCase()}
                        </Text>
                      </View>
                      {event.date && (
                        <View style={styles.eventMeta}>
                          <Calendar color={colors.textTertiary} size={14} />
                          <Text style={[styles.eventMetaText, { color: colors.textSecondary }]}>
                            {event.date}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.eventName, { color: colors.text }]}>
                      {event.name}
                    </Text>
                    {event.location && (
                      <View style={styles.eventLocation}>
                        <MapPin color={colors.textTertiary} size={14} />
                        <Text style={[styles.eventLocationText, { color: colors.textSecondary }]}>
                          {event.location}
                        </Text>
                      </View>
                    )}
                    <Text style={[styles.eventRelevance, { color: colors.textSecondary }]}>
                      {event.relevance}
                    </Text>
                    {event.url && (
                      <TouchableOpacity style={styles.eventLinkButton}>
                        <ExternalLink color={COLORS.cyan} size={14} />
                        <Text style={[styles.eventLinkText, { color: COLORS.cyan }]}>
                          Learn More
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </GlassCard>
            </Animated.View>
          )}
        </>
      )}

      {/* Experience Plan */}
      {planData.experience_plan && planData.experience_plan.length > 0 && (
        <>
          <GlassCard material="thin" style={styles.sectionCard}>
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowExperiencePlan(!showExperiencePlan);
              }}
              style={styles.sectionHeader}
              accessibilityRole="button"
              accessibilityLabel="Experience plan section"
              accessibilityState={{ expanded: showExperiencePlan }}
            >
              <Code color={COLORS.primary} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Experience Plan ({planData.experience_plan.length})
              </Text>
              {showExperiencePlan ? (
                <ChevronUp color={colors.textSecondary} size={20} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </GlassCard>

          {showExperiencePlan && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
              {/* Difficulty Filter */}
              <View style={[styles.expDifficultyFilter, { backgroundColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[3] }]}>
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.expFilterChip,
                      {
                        backgroundColor: difficultyFilter === level ? ALPHA_COLORS.primary.bg : 'transparent',
                        borderColor: difficultyFilter === level ? COLORS.primary : 'transparent',
                      },
                    ]}
                    onPress={() => setDifficultyFilter(level)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${level} difficulty`}
                  >
                    <Text
                      style={[
                        styles.expFilterChipText,
                        { color: difficultyFilter === level ? COLORS.primary : colors.textSecondary },
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Project Cards */}
              {filteredProjects.map((project, index) => {
                const isExpanded = expandedProjects.has(project.title);
                const isBeginnerProject = project.difficulty_level === 'beginner';

                return (
                  <GlassCard key={index} material="regular" shadow="subtle" style={styles.expProjectCard}>
                    <TouchableOpacity
                      onPress={() => toggleProject(project.title)}
                      style={styles.expProjectHeader}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: isExpanded }}
                    >
                      <View style={styles.expProjectHeaderContent}>
                        <View style={styles.expProjectBadgeRow}>
                          <View style={[styles.expTypeBadge, { backgroundColor: `${getProjectTypeColor(project.type)}20` }]}>
                            <Text style={[styles.expTypeBadgeText, { color: getProjectTypeColor(project.type) }]}>
                              {project.type.toUpperCase()}
                            </Text>
                          </View>
                          <View style={[styles.expDiffBadge, { backgroundColor: `${getDifficultyColor(project.difficulty_level)}20` }]}>
                            <Text style={[styles.expDiffBadgeText, { color: getDifficultyColor(project.difficulty_level) }]}>
                              {project.difficulty_level.toUpperCase()}
                            </Text>
                          </View>
                          {isBeginnerProject && (
                            <View style={[styles.expGoodStartBadge, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                              <Zap color={COLORS.success} size={12} />
                              <Text style={[styles.expGoodStartText, { color: COLORS.success }]}>
                                Good Starting Project
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={[styles.expProjectTitle, { color: colors.text }]}>
                          {project.title}
                        </Text>
                        <View style={styles.expProjectMeta}>
                          <View style={styles.expProjectMetaItem}>
                            <Clock color={colors.textTertiary} size={14} />
                            <Text style={[styles.expProjectMetaText, { color: colors.textSecondary }]}>
                              {project.time_commitment}
                            </Text>
                          </View>
                        </View>
                        {/* Top 3 skills */}
                        <View style={styles.expSkillsRow}>
                          {project.skills_demonstrated.slice(0, 3).map((skill, idx) => (
                            <View key={idx} style={[styles.expSkillChip, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                              <Text style={[styles.expSkillChipText, { color: COLORS.primary }]}>{skill}</Text>
                            </View>
                          ))}
                          {project.skills_demonstrated.length > 3 && (
                            <Text style={[styles.expMoreSkills, { color: colors.textTertiary }]}>
                              +{project.skills_demonstrated.length - 3} more
                            </Text>
                          )}
                        </View>
                      </View>
                      {isExpanded ? (
                        <ChevronUp color={colors.textSecondary} size={20} />
                      ) : (
                        <ChevronDown color={colors.textSecondary} size={20} />
                      )}
                    </TouchableOpacity>

                    {/* Expanded Project Content */}
                    {isExpanded && (
                      <View style={[styles.expExpandedContent, { borderTopColor: colors.border }]}>
                        <Text style={[styles.expDescription, { color: colors.textSecondary }]}>
                          {project.description}
                        </Text>

                        {/* Tech Stack */}
                        {project.detailed_tech_stack && project.detailed_tech_stack.length > 0 && (
                          <View style={styles.expSection}>
                            <Text style={[styles.expSectionLabel, { color: COLORS.primary }]}>
                              TECH STACK
                            </Text>
                            <View style={styles.expSkillsRow}>
                              {project.detailed_tech_stack.map((tech: any, idx: number) => (
                                <View key={idx} style={[styles.expSkillChip, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                                  <Text style={[styles.expSkillChipText, { color: COLORS.info }]}>
                                    {typeof tech === 'string' ? tech : tech.name || tech.technology || String(tech)}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {/* Step-by-Step Guide */}
                        {project.step_by_step_guide && project.step_by_step_guide.length > 0 && (
                          <View style={styles.expSection}>
                            <Text style={[styles.expSectionLabel, { color: COLORS.success }]}>
                              STEP-BY-STEP GUIDE
                            </Text>
                            {project.step_by_step_guide.map((step, idx) => (
                              <View key={idx} style={styles.expStepItem}>
                                <View style={[styles.expStepNumber, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                                  <Text style={[styles.expStepNumberText, { color: COLORS.success }]}>{idx + 1}</Text>
                                </View>
                                <Text style={[styles.expStepText, { color: colors.textSecondary }]}>{step}</Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* How to Showcase */}
                        {project.how_to_showcase && (
                          <View style={styles.expSection}>
                            <Text style={[styles.expSectionLabel, { color: COLORS.warning }]}>
                              HOW TO SHOWCASE
                            </Text>
                            <Text style={[styles.expDescription, { color: colors.textSecondary }]}>
                              {project.how_to_showcase}
                            </Text>
                          </View>
                        )}

                        {/* All Skills */}
                        <View style={styles.expSection}>
                          <Text style={[styles.expSectionLabel, { color: COLORS.primary }]}>
                            ALL SKILLS DEMONSTRATED
                          </Text>
                          <View style={styles.expSkillsRow}>
                            {project.skills_demonstrated.map((skill, idx) => (
                              <View key={idx} style={[styles.expSkillChip, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                                <Text style={[styles.expSkillChipText, { color: COLORS.primary }]}>{skill}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    )}
                  </GlassCard>
                );
              })}

              {filteredProjects.length === 0 && (
                <GlassCard material="regular" style={styles.expEmptyCard}>
                  <Text style={[styles.expEmptyText, { color: colors.textSecondary }]}>
                    No projects match the selected difficulty.
                  </Text>
                </GlassCard>
              )}
            </Animated.View>
          )}
        </>
      )}

      {/* Education Options */}
      {planData.education_options && planData.education_options.length > 0 && (
        <>
          <GlassCard material="thin" style={styles.sectionCard}>
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setShowEducationOptions(!showEducationOptions);
              }}
              style={styles.sectionHeader}
              accessibilityRole="button"
              accessibilityLabel="Education options section"
              accessibilityState={{ expanded: showEducationOptions }}
            >
              <GraduationCap color={COLORS.purple} size={20} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Education Options ({planData.education_options.length})
              </Text>
              {showEducationOptions ? (
                <ChevronUp color={colors.textSecondary} size={20} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>
          </GlassCard>

          {showEducationOptions && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
              {/* Education Recommendation Banner */}
              {planData.education_recommendation && (
                <GlassCard material="regular" style={[styles.eduRecommendationCard, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
                  <View style={styles.eduRecommendationContent}>
                    <Star color={COLORS.purple} size={20} fill={COLORS.purple} />
                    <Text style={[styles.eduRecommendationText, { color: colors.text }]}>
                      {planData.education_recommendation}
                    </Text>
                  </View>
                </GlassCard>
              )}

              {/* Education Option Cards */}
              {planData.education_options.map((option, index) => {
                const isBestForYou = option.comparison_rank === 1;

                return (
                  <GlassCard key={index} material="regular" shadow="subtle" style={styles.eduOptionCard}>
                    <View style={styles.eduOptionContent}>
                      {/* Badges Row */}
                      <View style={styles.eduBadgeRow}>
                        <View style={[styles.eduTypeBadge, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
                          <Text style={[styles.eduTypeBadgeText, { color: COLORS.purple }]}>
                            {option.type.toUpperCase()}
                          </Text>
                        </View>
                        <View style={[styles.eduFormatBadge, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                          <Text style={[styles.eduFormatBadgeText, { color: COLORS.info }]}>
                            {option.format.toUpperCase()}
                          </Text>
                        </View>
                        {isBestForYou && (
                          <View style={[styles.eduBestBadge, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                            <Star color={COLORS.success} size={12} fill={COLORS.success} />
                            <Text style={[styles.eduBestBadgeText, { color: COLORS.success }]}>
                              Best for You
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Name */}
                      <Text style={[styles.eduOptionName, { color: colors.text }]}>
                        {option.name}
                      </Text>

                      {/* Duration and Cost */}
                      <View style={styles.eduMetaRow}>
                        <View style={styles.eduMetaItem}>
                          <Clock color={colors.textTertiary} size={14} />
                          <Text style={[styles.eduMetaText, { color: colors.textSecondary }]}>
                            {option.duration}
                          </Text>
                        </View>
                        <View style={styles.eduMetaItem}>
                          <DollarSign color={colors.textTertiary} size={14} />
                          <Text style={[styles.eduMetaText, { color: colors.textSecondary }]}>
                            {option.cost_range}
                          </Text>
                        </View>
                      </View>

                      {/* Description */}
                      {option.description && (
                        <Text style={[styles.eduDescription, { color: colors.textSecondary }]}>
                          {option.description}
                        </Text>
                      )}

                      {/* Who it's best for */}
                      {option.who_its_best_for && (
                        <Text style={[styles.eduBestFor, { color: colors.textTertiary }]}>
                          {option.who_its_best_for}
                        </Text>
                      )}

                      {/* Pros and Cons */}
                      {option.pros && option.pros.length > 0 && (
                        <View style={styles.eduProsConsContainer}>
                          {option.pros.map((pro, idx) => (
                            <View key={`pro-${idx}`} style={styles.eduProItem}>
                              <Text style={[styles.eduProBullet, { color: COLORS.success }]}>+</Text>
                              <Text style={[styles.eduProConText, { color: colors.textSecondary }]}>{pro}</Text>
                            </View>
                          ))}
                          {option.cons && option.cons.map((con, idx) => (
                            <View key={`con-${idx}`} style={styles.eduConItem}>
                              <Text style={[styles.eduConBullet, { color: COLORS.danger }]}>-</Text>
                              <Text style={[styles.eduProConText, { color: colors.textSecondary }]}>{con}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Financing Options */}
                      {option.financing_options && (
                        <View style={styles.eduInfoRow}>
                          <DollarSign color={COLORS.success} size={14} />
                          <Text style={[styles.eduInfoText, { color: colors.textSecondary }]}>
                            {option.financing_options}
                          </Text>
                        </View>
                      )}

                      {/* Employment Outcomes */}
                      {option.employment_outcomes && (
                        <View style={styles.eduInfoRow}>
                          <Briefcase color={COLORS.info} size={14} />
                          <Text style={[styles.eduInfoText, { color: colors.textSecondary }]}>
                            {option.employment_outcomes}
                          </Text>
                        </View>
                      )}

                      {/* View Program Button */}
                      {option.official_link && (
                        <GlassButton
                          label="View Program"
                          variant="secondary"
                          icon={<ExternalLink color={colors.text} size={16} />}
                          onPress={() => openUrl(option.official_link!)}
                          style={styles.eduViewButton}
                        />
                      )}
                    </View>
                  </GlassCard>
                );
              })}
            </Animated.View>
          )}
        </>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {onSavePlan && (
          <GlassButton
            label="Save Plan"
            variant="primary"
            onPress={onSavePlan}
            style={styles.bottomButton}
          />
        )}
        {onExportPlan && (
          <GlassButton
            label="Export Plan"
            variant="secondary"
            onPress={onExportPlan}
            style={styles.bottomButton}
          />
        )}
      </View>
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
  summaryCard: {
    padding: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  summaryText: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  currentRole: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  targetRole: {
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: SPACING.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  statValue: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  sectionCard: {
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  milestoneContainer: {
    position: 'relative',
  },
  milestoneCard: {
    overflow: 'hidden',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  milestoneNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ALPHA_COLORS.primary.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneNumberText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  milestoneHeaderText: {
    flex: 1,
    gap: SPACING.xs,
  },
  milestoneRole: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  milestoneMetaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  milestoneMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  milestoneMetaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  milestoneContent: {
    borderTopWidth: 1,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  contentSection: {
    gap: SPACING.xs,
  },
  contentLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  contentText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  skillChipText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  certItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  certText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  companiesList: {
    gap: 4,
  },
  companyText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  connectorLine: {
    width: 2,
    height: SPACING.md,
    marginLeft: SPACING.md + 15,
  },
  skillGapsCard: {
    padding: SPACING.md,
  },
  skillGapItem: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  skillGapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillGapName: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
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
  skillLevelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  levelItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  levelBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  levelText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    textTransform: 'capitalize',
  },
  howToAcquire: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  actionsCard: {
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  actionsLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  actionItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  actionBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionNumber: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  bottomButton: {
    flex: 1,
  },
  viewModeContainer: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  viewModeButtonActive: {
    borderWidth: 1,
    borderColor: ALPHA_COLORS.primary.border,
  },
  viewModeText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  timelineCard: {
    padding: SPACING.lg,
  },
  learningCard: {
    padding: SPACING.md,
  },
  resourceItem: {
    paddingVertical: SPACING.md,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  resourceTypeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  resourceTypeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  resourceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  resourceMetaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  resourceTitle: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  resourceProvider: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.sm,
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  skillBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  skillBadgeText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  resourceCost: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  resourceLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  resourceLinkText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  networkingCard: {
    padding: SPACING.md,
  },
  eventItem: {
    paddingVertical: SPACING.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  eventTypeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  eventTypeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eventMetaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  eventName: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  eventLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  eventLocationText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  eventRelevance: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  eventLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  eventLinkText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  // Experience Plan styles
  expDifficultyFilter: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: SPACING.sm,
  },
  expFilterChip: {
    flex: 1,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
  },
  expFilterChipText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
  expProjectCard: {
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  expProjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  expProjectHeaderContent: {
    flex: 1,
    gap: SPACING.xs,
  },
  expProjectBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  expTypeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  expTypeBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  expDiffBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  expDiffBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  expGoodStartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  expGoodStartText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  expProjectTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    lineHeight: 22,
  },
  expProjectMeta: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  expProjectMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expProjectMetaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  expSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  expSkillChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  expSkillChipText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  expMoreSkills: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  expExpandedContent: {
    borderTopWidth: 1,
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  expDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  expSection: {
    gap: SPACING.sm,
  },
  expSectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  expStepItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'flex-start',
  },
  expStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expStepNumberText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  expStepText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  expEmptyCard: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  expEmptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  // Education Options styles
  eduRecommendationCard: {
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  eduRecommendationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  eduRecommendationText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  eduOptionCard: {
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  eduOptionContent: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  eduBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    alignItems: 'center',
  },
  eduTypeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  eduTypeBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  eduFormatBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  eduFormatBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  eduBestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  eduBestBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
  },
  eduOptionName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    lineHeight: 22,
  },
  eduMetaRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  eduMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eduMetaText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  eduDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  eduBestFor: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  eduProsConsContainer: {
    gap: 4,
  },
  eduProItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  eduConItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  eduProBullet: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    lineHeight: 20,
  },
  eduConBullet: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    lineHeight: 20,
  },
  eduProConText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  eduInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  eduInfoText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  eduViewButton: {
    marginTop: SPACING.xs,
  },
});
