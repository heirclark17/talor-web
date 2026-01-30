import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  Users,
  Newspaper,
  Briefcase,
  CheckCircle,
  MessageCircle,
  FileText,
  Award,
  Lightbulb,
  MapPin,
  TrendingUp,
  Cpu,
  Heart,
  ClipboardList,
  HelpCircle,
  Star,
  Brain,
  AlertTriangle,
  Package,
  DollarSign,
  ThumbsUp,
  Info,
  Compass,
  Map,
  BookOpen,
  Check,
  Crown,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassButton } from '../components/glass/GlassButton';
import { api, ReadinessScore, ValuesAlignment, CompanyResearch, StrategicNewsItem, CompetitiveIntelligence, InterviewStrategy, ExecutiveInsights } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT, ALPHA_COLORS } from '../utils/constants';
import { GlassCard } from '../components/glass/GlassCard';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';

// Type definitions matching backend prep_data structure
interface CompanyProfile {
  name: string;
  industry: string;
  locations: string[];
  size_estimate: string;
  overview_paragraph: string;
}

interface StatedValue {
  name: string;
  title?: string;
  description?: string;
  source_snippet?: string;
  url?: string;
  source_url?: string;
}

interface ValuesAndCulture {
  stated_values: StatedValue[];
  practical_implications: string[];
  cultural_priorities?: string[];
}

interface StrategyAndNews {
  recent_events: Array<{
    title?: string;
    headline?: string;
    date?: string;
    summary: string;
    source?: string;
    url?: string;
    source_url?: string;
    impact_summary?: string;
  }>;
  strategic_themes: Array<{
    theme: string;
    name?: string;
    rationale: string;
    description?: string;
  }>;
  technology_focus: Array<{
    technology: string;
    name?: string;
    description: string;
    relevance_to_role: string;
  }>;
}

interface SkillItem {
  name?: string;
  skill?: string;
}

interface RoleAnalysis {
  job_title: string;
  seniority_level: string;
  core_responsibilities: string[];
  must_have_skills: Array<string | SkillItem>;
  nice_to_have_skills: Array<string | SkillItem>;
  success_signals_6_12_months: string[];
}

interface PracticeQuestion {
  question?: string;
  text?: string;
}

interface InterviewPreparation {
  research_tasks: string[];
  practice_questions_for_candidate: Array<string | PracticeQuestion>;
  day_of_checklist: string[];
}

interface CandidatePositioning {
  resume_focus_areas: string[];
  story_prompts: Array<{
    title: string;
    description: string;
    star_hint?: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
  }>;
  keyword_map: Array<{
    company_term: string;
    term?: string;
    candidate_equivalent: string;
    equivalent?: string;
    context: string;
  }>;
}

interface QuestionsToAsk {
  product: string[];
  team: string[];
  culture: string[];
  performance: string[];
  strategy: string[];
}

interface PrepData {
  company_profile: CompanyProfile;
  values_and_culture: ValuesAndCulture;
  strategy_and_news: StrategyAndNews;
  role_analysis: RoleAnalysis;
  interview_preparation: InterviewPreparation;
  candidate_positioning: CandidatePositioning;
  questions_to_ask_interviewer: QuestionsToAsk;
}

interface InterviewPrepResponse {
  success: boolean;
  interview_prep_id: number;
  prep_data: PrepData;
  created_at: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type InterviewPrepRouteProp = RouteProp<RootStackParamList, 'InterviewPrep'>;

// Expandable Section Component
const ExpandableSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  accentColor?: string;
  colors: {
    glass: string;
    glassBorder: string;
    text: string;
    textSecondary: string;
  };
}> = ({ title, icon, children, defaultExpanded = false, accentColor = COLORS.primary, colors }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={`${title} section, ${expanded ? 'expanded' : 'collapsed'}`}
      >
        <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}20` }]}>
          {icon}
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        {expanded ? (
          <ChevronUp color={colors.textSecondary} size={20} />
        ) : (
          <ChevronDown color={colors.textSecondary} size={20} />
        )}
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

// Bullet List Component
const BulletList: React.FC<{ items: any[]; icon?: React.ReactNode; textColor?: string }> = ({ items, icon, textColor }) => {
  // Handle undefined or non-array items
  if (!items || !Array.isArray(items)) {
    return null;
  }

  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => {
        // Handle items that might be objects or strings
        let displayText: string;
        if (typeof item === 'string') {
          displayText = item;
        } else if (item && typeof item === 'object') {
          // Try common text properties
          displayText = item.title || item.name || item.text || item.description || JSON.stringify(item);
        } else {
          displayText = String(item || '');
        }

        return (
          <View key={index} style={styles.bulletItem}>
            {icon || <View style={styles.bulletDot} />}
            <Text style={[styles.bulletText, textColor ? { color: textColor } : undefined]}>{displayText}</Text>
          </View>
        );
      })}
    </View>
  );
};

// Chip/Badge Component
const Chip: React.FC<{ label: string; color?: string }> = ({ label, color = COLORS.primary }) => (
  <View style={[styles.chip, { backgroundColor: `${color}20` }]}>
    <Text style={[styles.chipText, { color }]}>{label}</Text>
  </View>
);

// Confidence Level Progress Bar Component
const ConfidenceBar: React.FC<{
  level: number;
  color: string;
}> = ({ level, color }) => (
  <View style={styles.confidenceBarContainer}>
    <View style={[styles.confidenceBarBackground, { borderColor: `${color}40` }]}>
      <View
        style={[
          styles.confidenceBarFill,
          { width: `${level}%`, backgroundColor: color }
        ]}
      />
    </View>
    <Text style={[styles.confidenceBarLabel, { color }]}>{level}%</Text>
  </View>
);

// Readiness Score Card Component
const ReadinessScoreCard: React.FC<{
  score: ReadinessScore;
  loading: boolean;
  colors: any;
}> = ({ score, loading, colors }) => {
  const getConfidenceColor = (level: number) => {
    if (level >= 80) return COLORS.success;
    if (level >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const confidenceColor = getConfidenceColor(score.confidence_level);

  if (loading) {
    return (
      <GlassCard style={styles.readinessCard} material="regular">
        <View style={styles.readinessHeader}>
          <View style={[styles.readinessIcon, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
            <Award color={COLORS.primary} size={24} />
          </View>
          <Text style={[styles.readinessTitle, { color: colors.text }]}>Interview Readiness Score</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.readinessLoader} />
      </GlassCard>
    );
  }

  return (
    <GlassCard style={styles.readinessCard} material="regular">
      <View style={styles.readinessHeader}>
        <View style={[styles.readinessIcon, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
          <Award color={COLORS.primary} size={24} />
        </View>
        <Text style={[styles.readinessTitle, { color: colors.text }]}>Interview Readiness Score</Text>
      </View>

      {/* Confidence Level with Progress Bar */}
      <View style={styles.readinessSection}>
        <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Overall Confidence</Text>
        <ConfidenceBar level={score.confidence_level} color={confidenceColor} />
      </View>

      {/* Preparation Level Badge */}
      <View style={styles.readinessSection}>
        <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Preparation Level</Text>
        <View style={[styles.preparationBadge, { backgroundColor: ALPHA_COLORS.info.bg, borderColor: ALPHA_COLORS.info.border }]}>
          <Target color={COLORS.info} size={16} />
          <Text style={[styles.preparationBadgeText, { color: COLORS.info }]}>{score.preparation_level}</Text>
        </View>
      </View>

      {/* Strengths */}
      {score.strengths && score.strengths.length > 0 && (
        <View style={styles.readinessSection}>
          <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Strengths</Text>
          {score.strengths.map((strength, index) => (
            <View key={index} style={styles.readinessItem}>
              <CheckCircle color={COLORS.success} size={16} />
              <Text style={[styles.readinessItemText, { color: colors.textSecondary }]}>{strength}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Areas for Improvement */}
      {score.areas_for_improvement && score.areas_for_improvement.length > 0 && (
        <View style={styles.readinessSection}>
          <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Areas for Improvement</Text>
          {score.areas_for_improvement.map((area, index) => (
            <View key={index} style={styles.readinessItem}>
              <AlertTriangle color={COLORS.warning} size={16} />
              <Text style={[styles.readinessItemText, { color: colors.textSecondary }]}>{area}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {score.recommendations && score.recommendations.length > 0 && (
        <View style={styles.readinessSection}>
          <Text style={[styles.readinessSectionTitle, { color: colors.text }]}>Recommendations</Text>
          {score.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.readinessItem}>
              <Lightbulb color={COLORS.purple} size={16} />
              <Text style={[styles.readinessItemText, { color: colors.textSecondary }]}>{recommendation}</Text>
            </View>
          ))}
        </View>
      )}
    </GlassCard>
  );
};

// Values Alignment Card Component
const ValuesAlignmentCard: React.FC<{
  alignment: ValuesAlignment;
  loading: boolean;
  colors: any;
}> = ({ alignment, loading, colors }) => {
  const getAlignmentColor = (score: number) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const alignmentColor = getAlignmentColor(alignment.alignment_score);

  if (loading) {
    return (
      <GlassCard style={styles.valuesCard} material="regular">
        <>
          <View style={styles.valuesHeader}>
            <View style={[styles.valuesIcon, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
              <Heart color={COLORS.error} size={24} />
            </View>
            <Text style={[styles.valuesTitle, { color: colors.text }]}>Values Alignment</Text>
          </View>
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.valuesLoader} />
        </>
      </GlassCard>
    );
  }

  return (
    <GlassCard style={styles.valuesCard} material="regular">
      <>
        <View style={styles.valuesHeader}>
          <View style={[styles.valuesIcon, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
            <Heart color={COLORS.error} size={24} />
          </View>
          <Text style={[styles.valuesTitle, { color: colors.text }]}>Values Alignment</Text>
        </View>

      {/* Alignment Score with Progress Bar */}
      <View style={styles.valuesSection}>
        <Text style={[styles.valuesSectionTitle, { color: colors.text }]}>Alignment Score</Text>
        <ConfidenceBar level={alignment.alignment_score} color={alignmentColor} />
      </View>

      {/* Matched Values */}
      {alignment.matched_values && alignment.matched_values.length > 0 && (
        <View style={styles.valuesSection}>
          <Text style={[styles.valuesSectionTitle, { color: colors.text }]}>Matched Values</Text>
          {alignment.matched_values.map((match, index) => (
            <View key={index} style={styles.valuesMatchItem}>
              <View style={styles.valuesMatchHeader}>
                <CheckCircle color={COLORS.success} size={16} />
                <Text style={[styles.valuesMatchValue, { color: colors.text }]}>{match.value}</Text>
              </View>
              {match.company_context && (
                <Text style={[styles.valuesMatchContext, { color: colors.textSecondary }]}>
                  Company: {match.company_context}
                </Text>
              )}
              {match.candidate_evidence && (
                <Text style={[styles.valuesMatchEvidence, { color: colors.textTertiary }]}>
                  Your evidence: {match.candidate_evidence}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Value Gaps */}
      {alignment.value_gaps && alignment.value_gaps.length > 0 && (
        <View style={styles.valuesSection}>
          <Text style={[styles.valuesSectionTitle, { color: colors.text }]}>Areas to Develop</Text>
          {alignment.value_gaps.map((gap, index) => (
            <View key={index} style={styles.valuesGapItem}>
              <View style={styles.valuesGapHeader}>
                <AlertTriangle color={COLORS.warning} size={16} />
                <Text style={[styles.valuesGapValue, { color: colors.text }]}>{gap.value}</Text>
              </View>
              {gap.company_context && (
                <Text style={[styles.valuesGapContext, { color: colors.textSecondary }]}>
                  Company: {gap.company_context}
                </Text>
              )}
              {gap.suggestion && (
                <View style={[styles.valuesSuggestionBox, { backgroundColor: ALPHA_COLORS.warning.bg, borderColor: ALPHA_COLORS.warning.border }]}>
                  <Lightbulb color={COLORS.warning} size={14} />
                  <Text style={[styles.valuesSuggestionText, { color: colors.textSecondary }]}>
                    {gap.suggestion}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

        {/* Cultural Fit Insights */}
        {alignment.cultural_fit_insights && (
          <View style={styles.valuesSection}>
            <Text style={[styles.valuesSectionTitle, { color: colors.text }]}>Cultural Fit Insights</Text>
            <View style={[styles.valuesInsightsBox, { backgroundColor: colors.backgroundTertiary }]}>
              <Users color={COLORS.purple} size={16} />
              <Text style={[styles.valuesInsightsText, { color: colors.textSecondary }]}>
                {alignment.cultural_fit_insights}
              </Text>
            </View>
          </View>
        )}
      </>
    </GlassCard>
  );
};

// Strategic News Card Component
const StrategicNewsCard: React.FC<{
  newsItems: StrategicNewsItem[];
  loading: boolean;
  colors: any;
}> = ({ newsItems, loading, colors }) => {
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
      <>
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
                {item.headline}
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
                <View style={styles.strategicNewsExpandedContent}>
                  {/* Summary */}
                  <View style={styles.strategicNewsSection}>
                    <Text style={[styles.strategicNewsSectionTitle, { color: colors.text }]}>Summary</Text>
                    <Text style={[styles.strategicNewsSectionText, { color: colors.textSecondary }]}>
                      {item.summary}
                    </Text>
                  </View>

                  {/* Relevance to Interview */}
                  <View style={[styles.strategicNewsSection, styles.relevanceSection]}>
                    <View style={styles.strategicNewsSectionHeader}>
                      <Target color={COLORS.info} size={16} />
                      <Text style={[styles.strategicNewsSectionTitle, { color: COLORS.info }]}>
                        Why This Matters
                      </Text>
                    </View>
                    <Text style={[styles.strategicNewsSectionText, { color: colors.textSecondary }]}>
                      {item.relevance_to_interview}
                    </Text>
                  </View>

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
      </>
    </GlassCard>
  );
};

// Company Research Card Component
const CompanyResearchCard: React.FC<{
  research: CompanyResearch;
  loading: boolean;
  colors: any;
}> = ({ research, loading, colors }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const getFinancialStatusColor = (status: string) => {
    if (status === 'good') return COLORS.success;
    if (status === 'fair') return COLORS.warning;
    return COLORS.error;
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'positive') return COLORS.success;
    if (sentiment === 'neutral') return COLORS.warning;
    return COLORS.error;
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <GlassCard style={styles.companyResearchCard} material="regular">
        <View style={styles.companyResearchHeader}>
          <View style={[styles.companyResearchIcon, { backgroundColor: ALPHA_COLORS.info.bg }]}>
            <Building2 color={COLORS.info} size={24} />
          </View>
          <Text style={[styles.companyResearchTitle, { color: colors.text }]}>Company Research</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.primary} style={styles.companyResearchLoader} />
      </GlassCard>
    );
  }

  return (
    <GlassCard style={styles.companyResearchCard} material="regular">
      <>
        <View style={styles.companyResearchHeader}>
          <View style={[styles.companyResearchIcon, { backgroundColor: ALPHA_COLORS.info.bg }]}>
            <Building2 color={COLORS.info} size={24} />
          </View>
          <Text style={[styles.companyResearchTitle, { color: colors.text }]}>Company Research</Text>
        </View>

        {/* Company Overview */}
        <View style={styles.companyResearchSection}>
          <TouchableOpacity
            style={styles.companyResearchSubheader}
            onPress={() => toggleSection('overview')}
            accessibilityRole="button"
          >
            <View style={styles.companyResearchSubheaderLeft}>
              <Info color={COLORS.info} size={16} />
              <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>Company Overview</Text>
            </View>
            {expandedSection === 'overview' ? (
              <ChevronUp color={colors.textSecondary} size={18} />
            ) : (
              <ChevronDown color={colors.textSecondary} size={18} />
            )}
          </TouchableOpacity>
          {expandedSection === 'overview' && research.company_overview && (
            <Text style={[styles.companyResearchText, { color: colors.textSecondary }]}>
              {research.company_overview}
            </Text>
          )}
        </View>

        {/* Recent News */}
        {research.recent_news && research.recent_news.length > 0 && (
          <View style={styles.companyResearchSection}>
            <TouchableOpacity
              style={styles.companyResearchSubheader}
              onPress={() => toggleSection('news')}
              accessibilityRole="button"
            >
              <View style={styles.companyResearchSubheaderLeft}>
                <Newspaper color={COLORS.purple} size={16} />
                <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>
                  Recent News ({research.recent_news.length})
                </Text>
              </View>
              {expandedSection === 'news' ? (
                <ChevronUp color={colors.textSecondary} size={18} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={18} />
              )}
            </TouchableOpacity>
            {expandedSection === 'news' && (
              <View style={styles.companyResearchList}>
                {research.recent_news.map((newsItem, index) => (
                  <View
                    key={index}
                    style={[styles.companyResearchNewsItem, { backgroundColor: colors.backgroundTertiary }]}
                  >
                    <Text style={[styles.companyResearchNewsHeadline, { color: colors.text }]}>
                      {newsItem.headline}
                    </Text>
                    {newsItem.date && (
                      <Text style={[styles.companyResearchNewsDate, { color: colors.textTertiary }]}>
                        {newsItem.date}
                      </Text>
                    )}
                    <Text style={[styles.companyResearchNewsSummary, { color: colors.textSecondary }]}>
                      {newsItem.summary}
                    </Text>
                    {newsItem.source && (
                      <Text style={[styles.companyResearchNewsSource, { color: colors.textTertiary }]}>
                        Source: {newsItem.source}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Key Products & Services */}
        {research.key_products_services && research.key_products_services.length > 0 && (
          <View style={styles.companyResearchSection}>
            <TouchableOpacity
              style={styles.companyResearchSubheader}
              onPress={() => toggleSection('products')}
              accessibilityRole="button"
            >
              <View style={styles.companyResearchSubheaderLeft}>
                <Package color={COLORS.success} size={16} />
                <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>
                  Key Products & Services
                </Text>
              </View>
              {expandedSection === 'products' ? (
                <ChevronUp color={colors.textSecondary} size={18} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={18} />
              )}
            </TouchableOpacity>
            {expandedSection === 'products' && (
              <View style={styles.companyResearchList}>
                {research.key_products_services.map((product, index) => (
                  <View key={index} style={styles.companyResearchBulletItem}>
                    <View style={[styles.bulletDot, { backgroundColor: COLORS.success }]} />
                    <Text style={[styles.companyResearchBulletText, { color: colors.textSecondary }]}>
                      {product}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Competitors */}
        {research.competitors && research.competitors.length > 0 && (
          <View style={styles.companyResearchSection}>
            <TouchableOpacity
              style={styles.companyResearchSubheader}
              onPress={() => toggleSection('competitors')}
              accessibilityRole="button"
            >
              <View style={styles.companyResearchSubheaderLeft}>
                <TrendingUp color={COLORS.warning} size={16} />
                <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>
                  Key Competitors
                </Text>
              </View>
              {expandedSection === 'competitors' ? (
                <ChevronUp color={colors.textSecondary} size={18} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={18} />
              )}
            </TouchableOpacity>
            {expandedSection === 'competitors' && (
              <View style={styles.companyResearchList}>
                {research.competitors.map((competitor, index) => (
                  <View
                    key={index}
                    style={[styles.companyResearchCompetitorItem, { backgroundColor: colors.backgroundTertiary }]}
                  >
                    <Text style={[styles.companyResearchCompetitorName, { color: colors.text }]}>
                      {competitor.name}
                    </Text>
                    {competitor.context && (
                      <Text style={[styles.companyResearchCompetitorContext, { color: colors.textSecondary }]}>
                        {competitor.context}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Financial Health */}
        {research.financial_health && (
          <View style={styles.companyResearchSection}>
            <View style={styles.companyResearchInlineHeader}>
              <View style={styles.companyResearchSubheaderLeft}>
                <DollarSign color={getFinancialStatusColor(research.financial_health.status)} size={16} />
                <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>Financial Health</Text>
              </View>
              <View
                style={[
                  styles.companyResearchStatusBadge,
                  {
                    backgroundColor: `${getFinancialStatusColor(research.financial_health.status)}20`,
                    borderColor: getFinancialStatusColor(research.financial_health.status),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.companyResearchStatusText,
                    { color: getFinancialStatusColor(research.financial_health.status) },
                  ]}
                >
                  {research.financial_health.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={[styles.companyResearchText, { color: colors.textSecondary, marginTop: SPACING.sm }]}>
              {research.financial_health.summary}
            </Text>
          </View>
        )}

        {/* Employee Sentiment */}
        {research.employee_sentiment && (
          <View style={styles.companyResearchSection}>
            <View style={styles.companyResearchInlineHeader}>
              <View style={styles.companyResearchSubheaderLeft}>
                <ThumbsUp color={getSentimentColor(research.employee_sentiment.sentiment)} size={16} />
                <Text style={[styles.companyResearchSubtitle, { color: colors.text }]}>Employee Sentiment</Text>
              </View>
              <View style={styles.companyResearchRatingContainer}>
                {research.employee_sentiment.rating && (
                  <View style={styles.companyResearchRating}>
                    <Star
                      color={getSentimentColor(research.employee_sentiment.sentiment)}
                      size={14}
                      fill={getSentimentColor(research.employee_sentiment.sentiment)}
                    />
                    <Text
                      style={[
                        styles.companyResearchRatingText,
                        { color: getSentimentColor(research.employee_sentiment.sentiment) },
                      ]}
                    >
                      {research.employee_sentiment.rating.toFixed(1)}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.companyResearchStatusBadge,
                    {
                      backgroundColor: `${getSentimentColor(research.employee_sentiment.sentiment)}20`,
                      borderColor: getSentimentColor(research.employee_sentiment.sentiment),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.companyResearchStatusText,
                      { color: getSentimentColor(research.employee_sentiment.sentiment) },
                    ]}
                  >
                    {research.employee_sentiment.sentiment.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={[styles.companyResearchText, { color: colors.textSecondary, marginTop: SPACING.sm }]}>
              {research.employee_sentiment.summary}
            </Text>
          </View>
        )}
      </>
    </GlassCard>
  );
};

// Competitive Intelligence Card Component
const CompetitiveIntelligenceCard: React.FC<{
  intelligence: CompetitiveIntelligence;
  loading: boolean;
  colors: any;
}> = ({ intelligence, loading, colors }) => {
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

  return (
    <GlassCard style={styles.competitiveCard} material="regular">
      <>
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
              <Text style={[styles.competitiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
                <Text style={[styles.competitiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
                <Text style={[styles.competitiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
                <Text style={[styles.competitiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
                <Text style={[styles.competitiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
      </>
    </GlassCard>
  );
};

// Interview Strategy Card Component
const InterviewStrategyCard: React.FC<{
  strategy: InterviewStrategy;
  loading: boolean;
  colors: any;
}> = ({ strategy, loading, colors }) => {
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

  return (
    <GlassCard style={styles.strategyCard} material="regular">
      <>
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
                <Text style={[styles.strategySubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
                <Text style={[styles.strategySubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
                <Text style={[styles.strategySubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
                <Text style={[styles.strategySubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
                <Text style={[styles.strategySubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
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
      </>
    </GlassCard>
  );
};

// Executive Insights Card Component
const ExecutiveInsightsCard: React.FC<{
  insights: ExecutiveInsights;
  loading: boolean;
  colors: any;
}> = ({ insights, loading, colors }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('priorities');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (loading) {
    return (
      <GlassCard style={styles.executiveCard} material="regular">
        <View style={styles.executiveHeader}>
          <View style={[styles.executiveIcon, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
            <Crown color={COLORS.purple} size={24} />
          </View>
          <Text style={[styles.executiveTitle, { color: colors.text }]}>Executive Insights</Text>
        </View>
        <ActivityIndicator size="small" color={COLORS.purple} style={styles.executiveLoader} />
      </GlassCard>
    );
  }

  return (
    <GlassCard style={styles.executiveCard} material="regular">
      <>
        <View style={styles.executiveHeader}>
          <View style={[styles.executiveIcon, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
            <Crown color={COLORS.purple} size={24} />
          </View>
          <Text style={[styles.executiveTitle, { color: colors.text }]}>Executive Insights</Text>
        </View>

        <Text style={[styles.executiveSubtitle, { color: colors.textSecondary }]}>
          Navigate C-suite conversations with confidence
        </Text>

        {/* Executive Priorities */}
        {insights.executive_priorities && insights.executive_priorities.length > 0 && (
          <View style={styles.executiveSection}>
            <TouchableOpacity
              style={styles.executiveSubheader}
              onPress={() => toggleSection('priorities')}
              accessibilityRole="button"
            >
              <View style={styles.executiveSubheaderLeft}>
                <Target color={COLORS.purple} size={16} />
                <Text style={[styles.executiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
                  Executive Priorities
                </Text>
              </View>
              {expandedSection === 'priorities' ? (
                <ChevronUp color={colors.textSecondary} size={18} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={18} />
              )}
            </TouchableOpacity>
            {expandedSection === 'priorities' && (
              <View style={styles.executiveList}>
                {insights.executive_priorities.map((priority, index) => (
                  <View key={index} style={styles.executivePriorityItem}>
                    <View style={[styles.executivePriorityDot, { backgroundColor: COLORS.purple }]} />
                    <Text style={[styles.executiveListText, { color: colors.textSecondary }]}>
                      {priority}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Leadership Style */}
        {insights.leadership_style && (
          <View style={styles.executiveSection}>
            <TouchableOpacity
              style={styles.executiveSubheader}
              onPress={() => toggleSection('leadership')}
              accessibilityRole="button"
            >
              <View style={styles.executiveSubheaderLeft}>
                <Users color={COLORS.info} size={16} />
                <Text style={[styles.executiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
                  Leadership Style
                </Text>
              </View>
              {expandedSection === 'leadership' ? (
                <ChevronUp color={colors.textSecondary} size={18} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={18} />
              )}
            </TouchableOpacity>
            {expandedSection === 'leadership' && (
              <View style={[styles.executiveHighlightBox, { backgroundColor: ALPHA_COLORS.info.bg, borderColor: COLORS.info }]}>
                <Text style={[styles.executiveText, { color: colors.text }]}>
                  {insights.leadership_style}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Decision Making Factors */}
        {insights.decision_making_factors && insights.decision_making_factors.length > 0 && (
          <View style={styles.executiveSection}>
            <TouchableOpacity
              style={styles.executiveSubheader}
              onPress={() => toggleSection('decisions')}
              accessibilityRole="button"
            >
              <View style={styles.executiveSubheaderLeft}>
                <Brain color={COLORS.warning} size={16} />
                <Text style={[styles.executiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
                  Decision Making Factors
                </Text>
              </View>
              {expandedSection === 'decisions' ? (
                <ChevronUp color={colors.textSecondary} size={18} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={18} />
              )}
            </TouchableOpacity>
            {expandedSection === 'decisions' && (
              <View style={styles.executiveList}>
                {insights.decision_making_factors.map((factor, index) => (
                  <View key={index} style={styles.executiveFactorItem}>
                    <View style={[styles.executiveFactorIcon, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
                      <Text style={[styles.executiveFactorNumber, { color: COLORS.warning }]}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.executiveListText, { color: colors.textSecondary, flex: 1 }]}>
                      {factor}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Strategic Initiatives */}
        {insights.strategic_initiatives && insights.strategic_initiatives.length > 0 && (
          <View style={styles.executiveSection}>
            <TouchableOpacity
              style={styles.executiveSubheader}
              onPress={() => toggleSection('initiatives')}
              accessibilityRole="button"
            >
              <View style={styles.executiveSubheaderLeft}>
                <TrendingUp color={COLORS.success} size={16} />
                <Text style={[styles.executiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
                  Strategic Initiatives
                </Text>
              </View>
              {expandedSection === 'initiatives' ? (
                <ChevronUp color={colors.textSecondary} size={18} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={18} />
              )}
            </TouchableOpacity>
            {expandedSection === 'initiatives' && (
              <View style={styles.executiveList}>
                {insights.strategic_initiatives.map((initiative, index) => (
                  <View key={index} style={styles.executiveInitiativeItem}>
                    <View style={[styles.executiveInitiativeDot, { backgroundColor: COLORS.success }]} />
                    <Text style={[styles.executiveListText, { color: colors.textSecondary }]}>
                      {initiative}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* C-Suite Talking Points - Featured with special styling */}
        {insights.c_suite_talking_points && insights.c_suite_talking_points.length > 0 && (
          <View style={styles.executiveSection}>
            <TouchableOpacity
              style={styles.executiveSubheader}
              onPress={() => toggleSection('talking_points')}
              accessibilityRole="button"
            >
              <View style={styles.executiveSubheaderLeft}>
                <MessageCircle color={COLORS.primary} size={16} />
                <Text style={[styles.executiveSubtitle, { color: colors.text, fontFamily: FONTS.semibold }]}>
                  C-Suite Talking Points
                </Text>
                <View style={[styles.executiveFeaturedBadge, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                  <Text style={[styles.executiveFeaturedBadgeText, { color: COLORS.primary }]}>KEY</Text>
                </View>
              </View>
              {expandedSection === 'talking_points' ? (
                <ChevronUp color={colors.textSecondary} size={18} />
              ) : (
                <ChevronDown color={colors.textSecondary} size={18} />
              )}
            </TouchableOpacity>
            {expandedSection === 'talking_points' && (
              <View style={[styles.executiveFeaturedBox, { backgroundColor: ALPHA_COLORS.primary.bg, borderColor: COLORS.primary }]}>
                {insights.c_suite_talking_points.map((point, index) => (
                  <View key={index} style={styles.executiveTalkingPointItem}>
                    <View style={[styles.executiveTalkingPointIcon, { backgroundColor: COLORS.primary }]}>
                      <Lightbulb color="#FFFFFF" size={14} />
                    </View>
                    <Text style={[styles.executiveTalkingPointText, { color: colors.text }]}>
                      {point}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </>
    </GlassCard>
  );
};

export default function InterviewPrepScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<InterviewPrepRouteProp>();
  const { colors } = useTheme();
  const { tailoredResumeId } = route.params;

  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [interviewPrepId, setInterviewPrepId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [readinessScore, setReadinessScore] = useState<ReadinessScore | null>(null);
  const [loadingReadiness, setLoadingReadiness] = useState(false);
  const [valuesAlignment, setValuesAlignment] = useState<ValuesAlignment | null>(null);
  const [loadingValuesAlignment, setLoadingValuesAlignment] = useState(false);
  const [companyResearch, setCompanyResearch] = useState<CompanyResearch | null>(null);
  const [loadingCompanyResearch, setLoadingCompanyResearch] = useState(false);
  const [strategicNews, setStrategicNews] = useState<StrategicNewsItem[] | null>(null);
  const [loadingStrategicNews, setLoadingStrategicNews] = useState(false);
  const [competitiveIntelligence, setCompetitiveIntelligence] = useState<CompetitiveIntelligence | null>(null);
  const [loadingCompetitiveIntelligence, setLoadingCompetitiveIntelligence] = useState(false);
  const [interviewStrategy, setInterviewStrategy] = useState<InterviewStrategy | null>(null);
  const [loadingInterviewStrategy, setLoadingInterviewStrategy] = useState(false);
  const [executiveInsights, setExecutiveInsights] = useState<ExecutiveInsights | null>(null);
  const [loadingExecutiveInsights, setLoadingExecutiveInsights] = useState(false);

  useEffect(() => {
    loadInterviewPrep();
  }, [tailoredResumeId]);

  const loadInterviewPrep = async () => {
    setLoading(true);
    try {
      const result = await api.getInterviewPrep(tailoredResumeId);
      if (result.success && result.data) {
        const data = result.data as InterviewPrepResponse;
        setPrepData(data.prep_data);
        setInterviewPrepId(data.interview_prep_id);
        // Load readiness score, values alignment, company research, strategic news, competitive intelligence, interview strategy, and executive insights after getting interview prep
        if (data.interview_prep_id) {
          loadReadinessScore(data.interview_prep_id);
          loadValuesAlignment(data.interview_prep_id);
          loadCompanyResearch(data.interview_prep_id);
          loadStrategicNews(data.interview_prep_id);
          loadCompetitiveIntelligence(data.interview_prep_id);
          loadInterviewStrategy(data.interview_prep_id);
          loadExecutiveInsights(data.interview_prep_id);
        }
      }
    } catch (error) {
      console.error('Error loading interview prep:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReadinessScore = async (prepId: number) => {
    setLoadingReadiness(true);
    try {
      const result = await api.getInterviewReadinessScore(prepId);
      if (result.success && result.data) {
        setReadinessScore(result.data);
      }
    } catch (error) {
      console.error('Error loading readiness score:', error);
    } finally {
      setLoadingReadiness(false);
    }
  };

  const loadValuesAlignment = async (prepId: number) => {
    setLoadingValuesAlignment(true);
    try {
      const result = await api.getValuesAlignment(prepId);
      if (result.success && result.data) {
        setValuesAlignment(result.data);
      }
    } catch (error) {
      console.error('Error loading values alignment:', error);
    } finally {
      setLoadingValuesAlignment(false);
    }
  };

  const loadCompanyResearch = async (prepId: number) => {
    setLoadingCompanyResearch(true);
    try {
      const result = await api.getCompanyResearchForPrep(prepId);
      if (result.success && result.data) {
        setCompanyResearch(result.data);
      }
    } catch (error) {
      console.error('Error loading company research:', error);
    } finally {
      setLoadingCompanyResearch(false);
    }
  };

  const loadStrategicNews = async (prepId: number) => {
    setLoadingStrategicNews(true);
    try {
      const result = await api.getStrategicNews(prepId);
      if (result.success && result.data) {
        setStrategicNews(result.data);
      }
    } catch (error) {
      console.error('Error loading strategic news:', error);
    } finally {
      setLoadingStrategicNews(false);
    }
  };

  const loadCompetitiveIntelligence = async (prepId: number) => {
    setLoadingCompetitiveIntelligence(true);
    try {
      const result = await api.getCompetitiveIntelligence(prepId);
      if (result.success && result.data) {
        setCompetitiveIntelligence(result.data);
      }
    } catch (error) {
      console.error('Error loading competitive intelligence:', error);
    } finally {
      setLoadingCompetitiveIntelligence(false);
    }
  };

  const loadInterviewStrategy = async (prepId: number) => {
    setLoadingInterviewStrategy(true);
    try {
      const result = await api.getInterviewStrategy(prepId);
      if (result.success && result.data) {
        setInterviewStrategy(result.data);
      }
    } catch (error) {
      console.error('Error loading interview strategy:', error);
    } finally {
      setLoadingInterviewStrategy(false);
    }
  };

  const loadExecutiveInsights = async (prepId: number) => {
    setLoadingExecutiveInsights(true);
    try {
      const result = await api.getExecutiveInsights(prepId);
      if (result.success && result.data) {
        setExecutiveInsights(result.data);
      }
    } catch (error) {
      console.error('Error loading executive insights:', error);
    } finally {
      setLoadingExecutiveInsights(false);
    }
  };

  const handleGeneratePrep = async () => {
    setGenerating(true);
    try {
      const result = await api.generateInterviewPrep(tailoredResumeId);
      if (result.success && result.data) {
        const data = result.data as InterviewPrepResponse;
        setPrepData(data.prep_data);
        setInterviewPrepId(data.interview_prep_id);
        // Load AI features after generating interview prep
        if (data.interview_prep_id) {
          loadReadinessScore(data.interview_prep_id);
          loadValuesAlignment(data.interview_prep_id);
          loadCompanyResearch(data.interview_prep_id);
          loadStrategicNews(data.interview_prep_id);
          loadCompetitiveIntelligence(data.interview_prep_id);
          loadInterviewStrategy(data.interview_prep_id);
          loadExecutiveInsights(data.interview_prep_id);
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to generate interview prep');
      }
    } catch (error) {
      console.error('Error generating prep:', error);
      Alert.alert('Error', 'Failed to generate interview prep');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading interview prep...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!prepData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Interview Prep</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Briefcase color={colors.textTertiary} size={64} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Prep Available</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Generate AI-powered interview preparation materials for this job application.
          </Text>
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={handleGeneratePrep}
            disabled={generating}
            accessibilityRole="button"
            accessibilityLabel={generating ? 'Generating interview prep' : 'Generate interview prep'}
          >
            {generating ? (
              <>
                <ActivityIndicator color={colors.background} />
                <Text style={[styles.generateButtonText, { color: colors.text }]}>Generating...</Text>
              </>
            ) : (
              <>
                <Sparkles color={colors.background} size={20} />
                <Text style={[styles.generateButtonText, { color: colors.text }]}>Generate Interview Prep</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { company_profile, values_and_culture, strategy_and_news, role_analysis, interview_preparation, candidate_positioning, questions_to_ask_interviewer } = prepData;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Interview Prep</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Action Buttons */}
        {interviewPrepId && (
          <View style={styles.actionButtonsContainer}>
            <GlassButton
              variant="primary"
              size="sm"
              label="Common Questions"
              icon={<MessageCircle color="#ffffff" size={18} />}
              onPress={() => {
                navigation.navigate('CommonQuestions' as any, { interviewPrepId });
              }}
              style={styles.actionButtonFlex}
            />

            <GlassButton
              variant="secondary"
              size="sm"
              label="Practice Questions"
              icon={<ClipboardList color={colors.text} size={18} />}
              onPress={() => {
                navigation.navigate('PracticeQuestions' as any, {
                  interviewPrepId,
                  tailoredResumeId
                });
              }}
              style={styles.actionButtonFlex}
            />

            <GlassButton
              variant="secondary"
              size="sm"
              label="Behavioral & Technical"
              icon={<Brain color={colors.text} size={18} />}
              onPress={() => {
                navigation.navigate('BehavioralTechnicalQuestions' as any, {
                  interviewPrepId
                });
              }}
              style={styles.actionButtonFlex}
            />
          </View>
        )}

        {/* Interview Readiness Score */}
        {interviewPrepId && readinessScore && (
          <ReadinessScoreCard score={readinessScore} loading={loadingReadiness} colors={colors} />
        )}

        {/* Values Alignment */}
        {interviewPrepId && valuesAlignment && (
          <ValuesAlignmentCard alignment={valuesAlignment} loading={loadingValuesAlignment} colors={colors} />
        )}

        {/* Company Research */}
        {interviewPrepId && companyResearch && (
          <CompanyResearchCard research={companyResearch} loading={loadingCompanyResearch} colors={colors} />
        )}

        {/* Strategic News */}
        {interviewPrepId && strategicNews && strategicNews.length > 0 && (
          <StrategicNewsCard newsItems={strategicNews} loading={loadingStrategicNews} colors={colors} />
        )}

        {/* Competitive Intelligence */}
        {interviewPrepId && competitiveIntelligence && (
          <CompetitiveIntelligenceCard intelligence={competitiveIntelligence} loading={loadingCompetitiveIntelligence} colors={colors} />
        )}

        {/* Interview Strategy */}
        {interviewPrepId && interviewStrategy && (
          <InterviewStrategyCard strategy={interviewStrategy} loading={loadingInterviewStrategy} colors={colors} />
        )}

        {/* Executive Insights */}
        {interviewPrepId && executiveInsights && (
          <ExecutiveInsightsCard insights={executiveInsights} loading={loadingExecutiveInsights} colors={colors} />
        )}

        {/* Job Info Card */}
        <View style={[styles.jobCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <View style={styles.jobCardHeader}>
            <View style={[styles.jobIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <Building2 color={COLORS.primary} size={24} />
            </View>
            <View style={styles.jobInfo}>
              <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{company_profile?.name || 'Company'}</Text>
              <Text style={[styles.jobTitle, { color: colors.text }]}>{role_analysis?.job_title || 'Position'}</Text>
            </View>
          </View>
          <View style={styles.jobMeta}>
            {company_profile?.industry && (
              <View style={styles.metaItem}>
                <Briefcase color={colors.textSecondary} size={14} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{company_profile.industry}</Text>
              </View>
            )}
            {company_profile?.locations && company_profile.locations.length > 0 && (
              <View style={styles.metaItem}>
                <MapPin color={colors.textSecondary} size={14} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{company_profile.locations[0]}</Text>
              </View>
            )}
            {role_analysis?.seniority_level && (
              <View style={styles.metaItem}>
                <TrendingUp color={colors.textSecondary} size={14} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>{role_analysis.seniority_level}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Company Profile Section */}
        <ExpandableSection
          title="Company Profile"
          icon={<Building2 color={COLORS.primary} size={20} />}
          defaultExpanded={true}
          accentColor={COLORS.primary}
          colors={colors}
        >
          {company_profile?.overview_paragraph && (
            <Text style={[styles.overviewText, { color: colors.textSecondary }]}>{company_profile.overview_paragraph}</Text>
          )}
          {company_profile?.size_estimate && (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>Company Size:</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>{company_profile.size_estimate}</Text>
            </View>
          )}
        </ExpandableSection>

        {/* Role Analysis Section */}
        <ExpandableSection
          title="Role Analysis"
          icon={<Target color={COLORS.purple} size={20} />}
          accentColor={COLORS.purple}
          colors={colors}
        >
          {role_analysis?.core_responsibilities && Array.isArray(role_analysis.core_responsibilities) && role_analysis.core_responsibilities.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Core Responsibilities</Text>
              <BulletList items={role_analysis.core_responsibilities} textColor={colors.textSecondary} />
            </View>
          )}
          {role_analysis?.must_have_skills && Array.isArray(role_analysis.must_have_skills) && role_analysis.must_have_skills.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Must-Have Skills</Text>
              <View style={styles.chipContainer}>
                {role_analysis.must_have_skills.map((skill, index) => {
                  const label = typeof skill === 'string' ? skill : (skill?.name || skill?.skill || JSON.stringify(skill));
                  return <Chip key={index} label={label} color={COLORS.success} />;
                })}
              </View>
            </View>
          )}
          {role_analysis?.nice_to_have_skills && Array.isArray(role_analysis.nice_to_have_skills) && role_analysis.nice_to_have_skills.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Nice-to-Have Skills</Text>
              <View style={styles.chipContainer}>
                {role_analysis.nice_to_have_skills.map((skill, index) => {
                  const label = typeof skill === 'string' ? skill : (skill?.name || skill?.skill || JSON.stringify(skill));
                  return <Chip key={index} label={label} color={colors.textSecondary} />;
                })}
              </View>
            </View>
          )}
          {role_analysis?.success_signals_6_12_months && Array.isArray(role_analysis.success_signals_6_12_months) && role_analysis.success_signals_6_12_months.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Success Signals (6-12 Months)</Text>
              <BulletList
                items={role_analysis.success_signals_6_12_months}
                icon={<Star color={COLORS.warning} size={12} />}
                textColor={colors.textSecondary}
              />
            </View>
          )}
        </ExpandableSection>

        {/* Values & Culture Section */}
        <ExpandableSection
          title="Values & Culture"
          icon={<Heart color={COLORS.error} size={20} />}
          accentColor={COLORS.error}
          colors={colors}
        >
          {values_and_culture?.stated_values && Array.isArray(values_and_culture.stated_values) && values_and_culture.stated_values.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Company Values</Text>
              {values_and_culture.stated_values.map((value, index) => {
                // Handle case where value might be a string or object
                const name = typeof value === 'string' ? value : (value?.name || value?.title || '');
                const description = typeof value === 'object' ? (value?.description || value?.source_snippet || '') : '';

                return (
                  <View key={index} style={[styles.valueCard, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.valueName, { color: colors.text }]}>{name}</Text>
                    {description ? (
                      <Text style={[styles.valueDescription, { color: colors.textSecondary }]}>{description}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
          {values_and_culture?.practical_implications && Array.isArray(values_and_culture.practical_implications) && values_and_culture.practical_implications.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>What This Means for You</Text>
              <BulletList items={values_and_culture.practical_implications} textColor={colors.textSecondary} />
            </View>
          )}
        </ExpandableSection>

        {/* Strategy & News Section */}
        <ExpandableSection
          title="Strategy & Recent News"
          icon={<Newspaper color={COLORS.info} size={20} />}
          accentColor={COLORS.info}
          colors={colors}
        >
          {strategy_and_news?.strategic_themes && Array.isArray(strategy_and_news.strategic_themes) && strategy_and_news.strategic_themes.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Strategic Themes</Text>
              {strategy_and_news.strategic_themes.map((theme, index) => {
                const themeName = typeof theme === 'string' ? theme : (theme?.theme || theme?.name || '');
                const rationale = typeof theme === 'object' ? (theme?.rationale || theme?.description || '') : '';

                return (
                  <View key={index} style={[styles.themeCard, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.themeName, { color: colors.text }]}>{themeName}</Text>
                    {rationale ? <Text style={[styles.themeRationale, { color: colors.textSecondary }]}>{rationale}</Text> : null}
                  </View>
                );
              })}
            </View>
          )}
          {strategy_and_news?.technology_focus && Array.isArray(strategy_and_news.technology_focus) && strategy_and_news.technology_focus.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Technology Focus</Text>
              {strategy_and_news.technology_focus.map((tech, index) => {
                const techName = typeof tech === 'string' ? tech : (tech?.technology || tech?.name || '');
                const description = typeof tech === 'object' ? (tech?.description || '') : '';
                const relevance = typeof tech === 'object' ? (tech?.relevance_to_role || '') : '';

                return (
                  <View key={index} style={[styles.techCard, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={styles.techName}>{techName}</Text>
                    {description ? <Text style={[styles.techDescription, { color: colors.textSecondary }]}>{description}</Text> : null}
                    {relevance ? <Text style={[styles.techRelevance, { color: colors.textTertiary }]}>Relevance: {relevance}</Text> : null}
                  </View>
                );
              })}
            </View>
          )}
          {strategy_and_news?.recent_events && Array.isArray(strategy_and_news.recent_events) && strategy_and_news.recent_events.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Recent News</Text>
              {strategy_and_news.recent_events.slice(0, 5).map((event, index) => {
                const headline = typeof event === 'string' ? event : (event?.title || event?.headline || '');
                const date = typeof event === 'object' ? (event?.date || '') : '';
                const source = typeof event === 'object' ? (event?.source || '') : '';
                const summary = typeof event === 'object' ? (event?.summary || '') : '';
                const impact = typeof event === 'object' ? (event?.impact_summary || '') : '';

                return (
                  <View key={index} style={[styles.newsItem, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[styles.newsHeadline, { color: colors.text }]}>{headline}</Text>
                    {date ? <Text style={[styles.newsDate, { color: colors.textTertiary }]}>{date}</Text> : null}
                    {source ? <Text style={[styles.newsSource, { color: colors.textTertiary }]}>Source: {source}</Text> : null}
                    {summary ? <Text style={[styles.newsSummary, { color: colors.textSecondary }]}>{summary}</Text> : null}
                    {impact ? <Text style={styles.newsImpact}>Impact: {impact}</Text> : null}
                  </View>
                );
              })}
            </View>
          )}
        </ExpandableSection>

        {/* Interview Preparation Section */}
        <ExpandableSection
          title="Preparation Checklist"
          icon={<ClipboardList color={COLORS.success} size={20} />}
          accentColor={COLORS.success}
          colors={colors}
        >
          {interview_preparation?.research_tasks && Array.isArray(interview_preparation.research_tasks) && interview_preparation.research_tasks.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Research Tasks</Text>
              <BulletList
                items={interview_preparation.research_tasks}
                icon={<CheckCircle color={COLORS.success} size={14} />}
                textColor={colors.textSecondary}
              />
            </View>
          )}
          {interview_preparation?.day_of_checklist && Array.isArray(interview_preparation.day_of_checklist) && interview_preparation.day_of_checklist.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Day-of Checklist</Text>
              <BulletList
                items={interview_preparation.day_of_checklist}
                icon={<CheckCircle color={COLORS.warning} size={14} />}
                textColor={colors.textSecondary}
              />
            </View>
          )}
          {interview_preparation?.practice_questions_for_candidate && Array.isArray(interview_preparation.practice_questions_for_candidate) && interview_preparation.practice_questions_for_candidate.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Practice Questions</Text>
              {interview_preparation.practice_questions_for_candidate.map((question, index) => {
                const questionText = typeof question === 'string' ? question : (question?.question || question?.text || JSON.stringify(question));
                return (
                  <View key={index} style={[styles.practiceQuestion, { backgroundColor: colors.backgroundTertiary }]}>
                    <HelpCircle color={COLORS.primary} size={16} />
                    <Text style={[styles.practiceQuestionText, { color: colors.textSecondary }]}>{questionText}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </ExpandableSection>

        {/* Questions to Ask Section */}
        <ExpandableSection
          title="Questions to Ask"
          icon={<MessageCircle color={COLORS.warning} size={20} />}
          accentColor={COLORS.warning}
          colors={colors}
        >
          {questions_to_ask_interviewer?.product && Array.isArray(questions_to_ask_interviewer.product) && questions_to_ask_interviewer.product.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>About the Product</Text>
              <BulletList items={questions_to_ask_interviewer.product} textColor={colors.textSecondary} />
            </View>
          )}
          {questions_to_ask_interviewer?.team && Array.isArray(questions_to_ask_interviewer.team) && questions_to_ask_interviewer.team.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>About the Team</Text>
              <BulletList items={questions_to_ask_interviewer.team} textColor={colors.textSecondary} />
            </View>
          )}
          {questions_to_ask_interviewer?.culture && Array.isArray(questions_to_ask_interviewer.culture) && questions_to_ask_interviewer.culture.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>About Culture</Text>
              <BulletList items={questions_to_ask_interviewer.culture} textColor={colors.textSecondary} />
            </View>
          )}
          {questions_to_ask_interviewer?.performance && Array.isArray(questions_to_ask_interviewer.performance) && questions_to_ask_interviewer.performance.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>About Performance</Text>
              <BulletList items={questions_to_ask_interviewer.performance} textColor={colors.textSecondary} />
            </View>
          )}
          {questions_to_ask_interviewer?.strategy && Array.isArray(questions_to_ask_interviewer.strategy) && questions_to_ask_interviewer.strategy.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>About Strategy</Text>
              <BulletList items={questions_to_ask_interviewer.strategy} textColor={colors.textSecondary} />
            </View>
          )}
        </ExpandableSection>

        {/* Candidate Positioning Section */}
        <ExpandableSection
          title="Your Positioning"
          icon={<Award color={COLORS.purple} size={20} />}
          accentColor={COLORS.purple}
          colors={colors}
        >
          {candidate_positioning?.resume_focus_areas && Array.isArray(candidate_positioning.resume_focus_areas) && candidate_positioning.resume_focus_areas.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Resume Focus Areas</Text>
              <BulletList items={candidate_positioning.resume_focus_areas} textColor={colors.textSecondary} />
            </View>
          )}
          {candidate_positioning?.story_prompts && Array.isArray(candidate_positioning.story_prompts) && candidate_positioning.story_prompts.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>STAR Story Prompts</Text>
              {candidate_positioning.story_prompts.map((prompt, index) => {
                // Handle case where prompt might be a string or have different structure
                const title = typeof prompt === 'string' ? prompt : (prompt?.title || '');
                const description = typeof prompt === 'object' ? (prompt?.description || '') : '';

                return (
                  <View key={index} style={[styles.storyPromptCard, { backgroundColor: colors.backgroundTertiary }]}>
                    <View style={styles.storyPromptHeader}>
                      <Lightbulb color={COLORS.warning} size={16} />
                      <Text style={[styles.storyPromptTitle, { color: colors.text }]}>{title}</Text>
                    </View>
                    {description ? (
                      <Text style={[styles.storyPromptDescription, { color: colors.textSecondary }]}>{description}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
          {candidate_positioning?.keyword_map && Array.isArray(candidate_positioning.keyword_map) && candidate_positioning.keyword_map.length > 0 && (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionTitle, { color: colors.text }]}>Keywords to Use</Text>
              {candidate_positioning.keyword_map.map((item, index) => {
                // Handle case where item structure might vary
                const companyTerm = item?.company_term || item?.term || '';
                const candidateEquivalent = item?.candidate_equivalent || item?.equivalent || '';
                const context = item?.context || '';

                return (
                  <View key={index} style={[styles.keywordItem, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={styles.keywordLabel}>
                      {companyTerm} → {candidateEquivalent}
                    </Text>
                    {context ? (
                      <Text style={[styles.keywordContext, { color: colors.textSecondary }]}>{context}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
        </ExpandableSection>

        {/* Bottom padding */}
        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.extralight,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  actionButtonFlex: {
    flex: 1,
  },
  jobCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  jobCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  jobIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  jobInfo: {
    flex: 1,
  },
  jobCompany: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  sectionCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    minHeight: 60,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  sectionContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  subsection: {
    marginTop: SPACING.md,
  },
  subsectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  overviewText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    marginTop: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginRight: SPACING.xs,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  bulletList: {
    marginTop: SPACING.xs,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    paddingRight: SPACING.md,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  chipText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  valueCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  valueName: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  themeCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  themeName: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  themeRationale: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  techCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  techName: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.info,
    marginBottom: 4,
  },
  techDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginBottom: 4,
  },
  techRelevance: {
    fontSize: 12,
    fontFamily: FONTS.italic,
    lineHeight: 16,
  },
  newsItem: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  newsHeadline: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  newsSource: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  newsImpact: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
    lineHeight: 16,
    marginTop: 6,
  },
  practiceQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  practiceQuestionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginLeft: SPACING.sm,
  },
  storyPromptCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  storyPromptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  storyPromptTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginLeft: SPACING.sm,
  },
  storyPromptDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  storyPrompt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  storyPromptText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginLeft: SPACING.sm,
  },
  keywordItem: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  keywordLabel: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    marginBottom: 4,
  },
  keywordContext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  // Readiness Score Styles
  readinessCard: {
    marginBottom: SPACING.lg,
  },
  readinessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  readinessIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  readinessTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  readinessLoader: {
    paddingVertical: SPACING.xl,
  },
  readinessSection: {
    marginBottom: SPACING.lg,
  },
  readinessSectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  readinessItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  readinessItemText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  confidenceBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  confidenceBarBackground: {
    flex: 1,
    height: 12,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  confidenceBarLabel: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    minWidth: 48,
    textAlign: 'right',
  },
  preparationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  preparationBadgeText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  // Values Alignment Styles
  valuesCard: {
    marginBottom: SPACING.lg,
  },
  valuesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  valuesIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  valuesTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  valuesLoader: {
    paddingVertical: SPACING.xl,
  },
  valuesSection: {
    marginBottom: SPACING.lg,
  },
  valuesSectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  valuesMatchItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  valuesMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  valuesMatchValue: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
  valuesMatchContext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginLeft: 24,
    marginBottom: SPACING.xs,
  },
  valuesMatchEvidence: {
    fontSize: 12,
    fontFamily: FONTS.italic,
    lineHeight: 16,
    marginLeft: 24,
  },
  valuesGapItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  valuesGapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  valuesGapValue: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
  valuesGapContext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginLeft: 24,
    marginBottom: SPACING.sm,
  },
  valuesSuggestionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginLeft: 24,
    marginTop: SPACING.xs,
  },
  valuesSuggestionText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  valuesInsightsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  valuesInsightsText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  // Company Research Styles
  companyResearchCard: {
    marginBottom: SPACING.lg,
  },
  companyResearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  companyResearchIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  companyResearchTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  companyResearchLoader: {
    paddingVertical: SPACING.xl,
  },
  companyResearchSection: {
    marginBottom: SPACING.md,
  },
  companyResearchSubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  companyResearchSubheaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  companyResearchSubtitle: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
  companyResearchInlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyResearchText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  companyResearchList: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  companyResearchNewsItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  companyResearchNewsHeadline: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  companyResearchNewsDate: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: 6,
  },
  companyResearchNewsSummary: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginBottom: 4,
  },
  companyResearchNewsSource: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  companyResearchBulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: SPACING.md,
  },
  companyResearchBulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  companyResearchCompetitorItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  companyResearchCompetitorName: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  companyResearchCompetitorContext: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  companyResearchStatusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  companyResearchStatusText: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  companyResearchRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  companyResearchRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  companyResearchRatingText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  // Strategic News Styles
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
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  strategicNewsSection: {
    marginBottom: SPACING.md,
  },
  relevanceSection: {
    backgroundColor: 'rgba(52, 152, 219, 0.05)',
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
  // Competitive Intelligence Styles
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
  // Interview Strategy Styles
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
  // Executive Insights Styles
  executiveCard: {
    marginBottom: SPACING.lg,
  },
  executiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  executiveIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  executiveTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  executiveSubtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  executiveLoader: {
    paddingVertical: SPACING.xl,
  },
  executiveSection: {
    marginBottom: SPACING.md,
  },
  executiveSubheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  executiveSubheaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  executiveHighlightBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    marginTop: SPACING.sm,
  },
  executiveText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  executiveList: {
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  executivePriorityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  executivePriorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  executiveListText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  executiveFactorItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: SPACING.md,
    marginBottom: SPACING.md,
  },
  executiveFactorIcon: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  executiveFactorNumber: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  executiveInitiativeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  executiveInitiativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  executiveFeaturedBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: SPACING.xs,
  },
  executiveFeaturedBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  executiveFeaturedBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    marginTop: SPACING.sm,
  },
  executiveTalkingPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  executiveTalkingPointIcon: {
    width: 24,
    height: 24,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  executiveTalkingPointText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },
});
