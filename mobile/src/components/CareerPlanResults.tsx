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
  const { colors } = useTheme();
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set([planData.milestones[0]?.id]));
  const [showSkillGaps, setShowSkillGaps] = useState(true);
  const [showActions, setShowActions] = useState(true);
  const [showLearning, setShowLearning] = useState(false);
  const [showNetworking, setShowNetworking] = useState(false);
  const [expandedSkillGaps, setExpandedSkillGaps] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'timeline' | 'detailed'>('timeline');

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
      <View style={styles.viewModeContainer}>
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
    backgroundColor: ALPHA_COLORS.white[5],
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
});
