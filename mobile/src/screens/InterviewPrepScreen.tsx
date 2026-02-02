import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronRight,
  Sparkles,
  Target,
  Newspaper,
  Briefcase,
  CheckCircle,
  MapPin,
  TrendingUp,
  Cpu,
  HelpCircle,
  Heart,
  Award,
  Star,
  Brain,
  MessageCircle,
  ClipboardList,
  RefreshCw,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReadinessScore, ValuesAlignment, CompanyResearch, StrategicNewsItem, CompetitiveIntelligence, InterviewStrategy, ExecutiveInsights } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT, ALPHA_COLORS } from '../utils/constants';
import { GlassCard } from '../components/glass/GlassCard';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { useInterviewPrepStore, selectCachedPrep } from '../stores';
import {
  PrepData,
  InterviewPrepResponse,
  CompanyProfile,
  ValuesAndCulture,
  StrategyAndNews,
  RoleAnalysis,
  InterviewPreparation,
  CandidatePositioning,
  QuestionsToAsk,
  SkillItem,
} from '../components/interviewPrep/types';

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

// NOTE: Card components (ReadinessScoreCard, ValuesAlignmentCard, CompanyResearchCard,
// StrategicNewsCard, CompetitiveIntelligenceCard, InterviewStrategyCard, ExecutiveInsightsCard)
// have been extracted to ../components/interviewPrep/ for reusability.
// They are not currently used in this screen but available for future use.

export default function InterviewPrepScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<InterviewPrepRouteProp>();
  const { colors } = useTheme();
  const { tailoredResumeId } = route.params;

  // Use the interview prep store for caching
  const {
    loading,
    generating,
    loadingReadiness,
    loadingValuesAlignment,
    loadingCompanyResearch,
    loadingStrategicNews,
    loadingCompetitiveIntelligence,
    loadingInterviewStrategy,
    loadingExecutiveInsights,
    loadingCertifications,
    getInterviewPrep,
    generateInterviewPrep,
    deleteInterviewPrep,
  } = useInterviewPrepStore();

  // Get cached data for this tailoredResumeId
  const cachedPrep = useInterviewPrepStore((state) => selectCachedPrep(state, tailoredResumeId));

  // Extract data from cache
  const prepData = cachedPrep?.prepData || null;
  const interviewPrepId = cachedPrep?.interviewPrepId || null;
  const readinessScore = cachedPrep?.readinessScore || null;
  const valuesAlignment = cachedPrep?.valuesAlignment || null;
  const companyResearch = cachedPrep?.companyResearch || null;
  const strategicNews = cachedPrep?.strategicNews || null;
  const competitiveIntelligence = cachedPrep?.competitiveIntelligence || null;
  const interviewStrategy = cachedPrep?.interviewStrategy || null;
  const executiveInsights = cachedPrep?.executiveInsights || null;
  const certificationRecommendations = cachedPrep?.certificationRecommendations || null;

  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Debug: Log when section changes
  const handleSectionPress = (section: string) => {
    console.log('=== CARD PRESSED ===', section);
    console.log('Current selectedSection:', selectedSection);
    const newValue = selectedSection === section ? null : section;
    console.log('Setting to:', newValue);
    setSelectedSection(newValue);
  };

  // Load interview prep on mount (uses cache if available)
  useEffect(() => {
    console.log('=== InterviewPrepScreen mounted ===');
    console.log('tailoredResumeId:', tailoredResumeId);
    console.log('cachedPrep exists:', !!cachedPrep);

    // Only fetch if not cached
    if (!cachedPrep) {
      getInterviewPrep(tailoredResumeId);
    }
  }, [tailoredResumeId]);

  // Handle generate prep
  const handleGeneratePrep = async () => {
    const result = await generateInterviewPrep(tailoredResumeId);
    if (!result) {
      Alert.alert('Error', 'Failed to generate interview prep');
    }
  };

  // Handle refresh - force re-fetch from server
  const handleRefresh = useCallback(() => {
    Alert.alert(
      'Refresh Interview Prep',
      'This will reload all data from the server. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Refresh',
          onPress: () => {
            deleteInterviewPrep(tailoredResumeId);
            getInterviewPrep(tailoredResumeId);
          },
        },
      ]
    );
  }, [tailoredResumeId]);

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
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          accessibilityRole="button"
          accessibilityLabel="Refresh interview prep data"
        >
          <RefreshCw color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Job Info Card - Header in Frosted Glass */}
        <GlassCard material="thin" borderRadius={RADIUS.xl} style={styles.jobCardGlass}>
          <View style={styles.jobCardHeader}>
            <View style={[styles.jobIcon, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
              <Building2 color={COLORS.primary} size={28} />
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
        </GlassCard>

        {/* Individual Frosted Glass Navigation Cards - Expandable content below each card */}
        <View style={styles.cardStack}>
          {/* Company Insights Section */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>COMPANY INSIGHTS</Text>

          {/* Company Profile Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
            <TouchableOpacity
              style={styles.stackedCardItem}
              onPress={() => handleSectionPress('companyProfile')}
              activeOpacity={0.7}
            >
              <View style={styles.stackedCardLeft}>
                <View style={[styles.stackedCardIcon, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                  <Building2 color={COLORS.primary} size={24} />
                </View>
                <View style={styles.stackedCardContent}>
                  <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Company Profile</Text>
                  <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {company_profile?.name || 'Company overview & culture'}
                  </Text>
                </View>
              </View>
              {selectedSection === 'companyProfile' ? (
                <ChevronDown color={COLORS.primary} size={20} />
              ) : (
                <ChevronRight color={colors.textTertiary} size={20} />
              )}
            </TouchableOpacity>
            {selectedSection === 'companyProfile' && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {company_profile?.overview_paragraph && (
                  <Text style={[styles.expandedText, { color: colors.textSecondary }]}>{company_profile.overview_paragraph}</Text>
                )}
                {company_profile?.size_estimate && (
                  <View style={styles.expandedRow}>
                    <Text style={[styles.expandedLabel, { color: colors.text }]}>Company Size:</Text>
                    <Text style={[styles.expandedValue, { color: colors.textSecondary }]}>{company_profile.size_estimate}</Text>
                  </View>
                )}
                {company_profile?.industry && (
                  <View style={styles.expandedRow}>
                    <Text style={[styles.expandedLabel, { color: colors.text }]}>Industry:</Text>
                    <Text style={[styles.expandedValue, { color: colors.textSecondary }]}>{company_profile.industry}</Text>
                  </View>
                )}
              </View>
            )}
          </GlassCard>

          {/* Values & Culture Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
            <TouchableOpacity
              style={styles.stackedCardItem}
              onPress={() => handleSectionPress('valuesCulture')}
              activeOpacity={0.7}
            >
              <View style={styles.stackedCardLeft}>
                <View style={[styles.stackedCardIcon, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
                  <Heart color={COLORS.warning} size={24} />
                </View>
                <View style={styles.stackedCardContent}>
                  <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Values & Culture</Text>
                  <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {values_and_culture?.stated_values?.length || 0} core values identified
                  </Text>
                </View>
              </View>
              {selectedSection === 'valuesCulture' ? (
                <ChevronDown color={COLORS.warning} size={20} />
              ) : (
                <ChevronRight color={colors.textTertiary} size={20} />
              )}
            </TouchableOpacity>
            {selectedSection === 'valuesCulture' && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {values_and_culture?.stated_values && values_and_culture.stated_values.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Core Values</Text>
                    {values_and_culture.stated_values.map((value, index) => (
                      <View key={index} style={styles.bulletItem}>
                        <View style={[styles.bulletDot, { backgroundColor: COLORS.warning }]} />
                        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{value.name || value.title || 'Unknown Value'}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {values_and_culture?.practical_implications && values_and_culture.practical_implications.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Practical Implications</Text>
                    {values_and_culture.practical_implications.map((implication, index) => (
                      <View key={index} style={styles.bulletItem}>
                        <View style={[styles.bulletDot, { backgroundColor: COLORS.warning }]} />
                        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{implication}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </GlassCard>

          {/* Strategy & News Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
            <TouchableOpacity
              style={styles.stackedCardItem}
              onPress={() => handleSectionPress('strategyNews')}
              activeOpacity={0.7}
            >
              <View style={styles.stackedCardLeft}>
                <View style={[styles.stackedCardIcon, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
                  <Newspaper color={COLORS.purple} size={24} />
                </View>
                <View style={styles.stackedCardContent}>
                  <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Strategy & News</Text>
                  <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {strategy_and_news?.recent_events?.length || 0} recent updates
                  </Text>
                </View>
              </View>
              {selectedSection === 'strategyNews' ? (
                <ChevronDown color={COLORS.purple} size={20} />
              ) : (
                <ChevronRight color={colors.textTertiary} size={20} />
              )}
            </TouchableOpacity>
            {selectedSection === 'strategyNews' && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {/* Strategic Themes */}
                {strategy_and_news?.strategic_themes && strategy_and_news.strategic_themes.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Strategic Themes</Text>
                    {strategy_and_news.strategic_themes.map((theme, index) => (
                      <View key={index} style={styles.strategyItem}>
                        <View style={styles.strategyItemHeader}>
                          <View style={[styles.strategyDot, { backgroundColor: COLORS.purple }]} />
                          <Text style={[styles.strategyItemTitle, { color: colors.text }]}>{theme.theme || theme.name}</Text>
                        </View>
                        <Text style={[styles.strategyItemDesc, { color: colors.textSecondary }]}>{theme.rationale || theme.description}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Technology Focus */}
                {strategy_and_news?.technology_focus && strategy_and_news.technology_focus.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Technology Focus</Text>
                    {strategy_and_news.technology_focus.map((tech, index) => (
                      <View key={index} style={styles.techFocusItem}>
                        <View style={[styles.techBadge, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                          <Cpu color={COLORS.info} size={14} />
                          <Text style={[styles.techBadgeText, { color: COLORS.info }]}>{tech.technology || tech.name}</Text>
                        </View>
                        <Text style={[styles.techDescription, { color: colors.textSecondary }]}>{tech.description}</Text>
                        {tech.relevance_to_role && (
                          <View style={styles.relevanceContainer}>
                            <Text style={[styles.relevanceLabel, { color: COLORS.success }]}>Role Relevance:</Text>
                            <Text style={[styles.relevanceText, { color: colors.textSecondary }]}>{tech.relevance_to_role}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Recent Events */}
                {strategy_and_news?.recent_events && strategy_and_news.recent_events.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Recent Developments</Text>
                    {strategy_and_news.recent_events.slice(0, 5).map((event, index) => (
                      <View key={index} style={styles.newsItem}>
                        <View style={styles.newsHeader}>
                          <Newspaper color={COLORS.purple} size={14} />
                          <Text style={[styles.newsTitle, { color: colors.text }]} numberOfLines={2}>
                            {event.title || event.headline || event.summary}
                          </Text>
                        </View>
                        {event.summary && event.summary !== (event.title || event.headline) && (
                          <Text style={[styles.newsSummary, { color: colors.textSecondary }]} numberOfLines={3}>
                            {event.summary}
                          </Text>
                        )}
                        {event.impact_summary && (
                          <View style={styles.impactContainer}>
                            <TrendingUp color={COLORS.warning} size={12} />
                            <Text style={[styles.impactText, { color: colors.textSecondary }]}>
                              Impact: {event.impact_summary}
                            </Text>
                          </View>
                        )}
                        <View style={styles.newsFooter}>
                          {event.date && (
                            <Text style={[styles.newsDate, { color: colors.textTertiary }]}>{event.date}</Text>
                          )}
                          {event.source && (
                            <Text style={[styles.newsSource, { color: colors.textTertiary }]}>• {event.source}</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </GlassCard>

          {/* Role & Preparation Section */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ROLE & PREPARATION</Text>

          {/* Role Analysis Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
            <TouchableOpacity
              style={styles.stackedCardItem}
              onPress={() => handleSectionPress('roleAnalysis')}
              activeOpacity={0.7}
            >
              <View style={styles.stackedCardLeft}>
                <View style={[styles.stackedCardIcon, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                  <Target color={COLORS.success} size={24} />
                </View>
                <View style={styles.stackedCardContent}>
                  <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Role Analysis</Text>
                  <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {role_analysis?.job_title || 'Skills & requirements'}
                  </Text>
                </View>
              </View>
              {selectedSection === 'roleAnalysis' ? (
                <ChevronDown color={COLORS.success} size={20} />
              ) : (
                <ChevronRight color={colors.textTertiary} size={20} />
              )}
            </TouchableOpacity>
            {selectedSection === 'roleAnalysis' && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {role_analysis?.core_responsibilities && role_analysis.core_responsibilities.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Core Responsibilities</Text>
                    {role_analysis.core_responsibilities.slice(0, 5).map((resp, index) => (
                      <View key={index} style={styles.bulletItem}>
                        <View style={[styles.bulletDot, { backgroundColor: COLORS.success }]} />
                        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{resp}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {role_analysis?.must_have_skills && role_analysis.must_have_skills.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Must-Have Skills</Text>
                    <View style={styles.chipContainer}>
                      {role_analysis.must_have_skills.map((skill, index) => {
                        const label = typeof skill === 'string' ? skill : (skill?.name || skill?.skill || '');
                        return (
                          <View key={index} style={[styles.chip, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                            <Text style={[styles.chipText, { color: COLORS.success }]}>{label}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}
          </GlassCard>

          {/* Preparation Checklist Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
            <TouchableOpacity
              style={styles.stackedCardItem}
              onPress={() => handleSectionPress('preparation')}
              activeOpacity={0.7}
            >
              <View style={styles.stackedCardLeft}>
                <View style={[styles.stackedCardIcon, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                  <CheckCircle color={COLORS.info} size={24} />
                </View>
                <View style={styles.stackedCardContent}>
                  <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Preparation Checklist</Text>
                  <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    {interview_preparation?.research_tasks?.length || 0} tasks to complete
                  </Text>
                </View>
              </View>
              {selectedSection === 'preparation' ? (
                <ChevronDown color={COLORS.info} size={20} />
              ) : (
                <ChevronRight color={colors.textTertiary} size={20} />
              )}
            </TouchableOpacity>
            {selectedSection === 'preparation' && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {interview_preparation?.research_tasks && interview_preparation.research_tasks.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Research Tasks</Text>
                    {interview_preparation.research_tasks.map((task, index) => (
                      <View key={index} style={styles.bulletItem}>
                        <View style={[styles.bulletDot, { backgroundColor: COLORS.info }]} />
                        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{task}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {interview_preparation?.day_of_checklist && interview_preparation.day_of_checklist.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Day-of Checklist</Text>
                    {interview_preparation.day_of_checklist.map((item: string, index: number) => (
                      <View key={index} style={styles.bulletItem}>
                        <View style={[styles.bulletDot, { backgroundColor: COLORS.info }]} />
                        <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </GlassCard>

          {/* Questions to Ask Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
            <TouchableOpacity
              style={styles.stackedCardItem}
              onPress={() => handleSectionPress('questions')}
              activeOpacity={0.7}
            >
              <View style={styles.stackedCardLeft}>
                <View style={[styles.stackedCardIcon, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
                  <HelpCircle color={COLORS.error} size={24} />
                </View>
                <View style={styles.stackedCardContent}>
                  <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Questions to Ask</Text>
                  <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    Questions prepared for interviewer
                  </Text>
                </View>
              </View>
              {selectedSection === 'questions' ? (
                <ChevronDown color={COLORS.error} size={20} />
              ) : (
                <ChevronRight color={colors.textTertiary} size={20} />
              )}
            </TouchableOpacity>
            {selectedSection === 'questions' && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {questions_to_ask_interviewer ? (
                  <View style={styles.expandedSection}>
                    {Object.entries(questions_to_ask_interviewer).map(([category, questions]) => (
                      questions && (questions as string[]).length > 0 && (
                        <View key={category} style={{ marginBottom: SPACING.md }}>
                          <Text style={[styles.expandedSectionTitle, { color: colors.text, textTransform: 'capitalize' }]}>{category}</Text>
                          {(questions as string[]).map((question: string, index: number) => (
                            <View key={index} style={styles.bulletItem}>
                              <View style={[styles.bulletDot, { backgroundColor: COLORS.error }]} />
                              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{question}</Text>
                            </View>
                          ))}
                        </View>
                      )
                    ))}
                  </View>
                ) : (
                  <Text style={[styles.expandedText, { color: colors.textSecondary }]}>No questions generated yet.</Text>
                )}
              </View>
            )}
          </GlassCard>

          {/* Candidate Positioning Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
            <TouchableOpacity
              style={styles.stackedCardItem}
              onPress={() => handleSectionPress('positioning')}
              activeOpacity={0.7}
            >
              <View style={styles.stackedCardLeft}>
                <View style={[styles.stackedCardIcon, { backgroundColor: '#10b98120' }]}>
                  <Award color="#10b981" size={24} />
                </View>
                <View style={styles.stackedCardContent}>
                  <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Candidate Positioning</Text>
                  <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                    Resume focus areas & keyword mapping
                  </Text>
                </View>
              </View>
              {selectedSection === 'positioning' ? (
                <ChevronDown color="#10b981" size={20} />
              ) : (
                <ChevronRight color={colors.textTertiary} size={20} />
              )}
            </TouchableOpacity>
            {selectedSection === 'positioning' && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {/* Resume Focus Areas */}
                {candidate_positioning?.resume_focus_areas && candidate_positioning.resume_focus_areas.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Resume Focus Areas</Text>
                    <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>Key areas to highlight in your resume</Text>
                    {candidate_positioning.resume_focus_areas.map((area, index) => (
                      <View key={index} style={styles.focusAreaItem}>
                        <View style={[styles.focusAreaNumber, { backgroundColor: '#10b98120' }]}>
                          <Text style={[styles.focusAreaNumberText, { color: '#10b981' }]}>{index + 1}</Text>
                        </View>
                        <Text style={[styles.focusAreaText, { color: colors.textSecondary }]}>{area}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Keyword Mapping */}
                {candidate_positioning?.keyword_map && candidate_positioning.keyword_map.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Keyword Translation</Text>
                    <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>Map your experience to company terminology</Text>
                    {candidate_positioning.keyword_map.map((keyword, index) => (
                      <View key={index} style={[styles.keywordMapItem, { backgroundColor: colors.backgroundTertiary }]}>
                        <View style={styles.keywordRow}>
                          <View style={[styles.keywordBadge, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                            <Text style={[styles.keywordBadgeText, { color: COLORS.info }]}>Company uses</Text>
                          </View>
                          <Text style={[styles.keywordText, { color: colors.text }]}>{keyword.company_term || keyword.term}</Text>
                        </View>
                        <View style={styles.keywordArrow}>
                          <ChevronDown color={colors.textTertiary} size={16} />
                        </View>
                        <View style={styles.keywordRow}>
                          <View style={[styles.keywordBadge, { backgroundColor: '#10b98120' }]}>
                            <Text style={[styles.keywordBadgeText, { color: '#10b981' }]}>You say</Text>
                          </View>
                          <Text style={[styles.keywordText, { color: colors.text }]}>{keyword.candidate_equivalent || keyword.equivalent}</Text>
                        </View>
                        {keyword.context && (
                          <Text style={[styles.keywordContext, { color: colors.textTertiary }]}>{keyword.context}</Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Story Prompts */}
                {candidate_positioning?.story_prompts && candidate_positioning.story_prompts.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Story Prompts for Interviews</Text>
                    <Text style={[styles.sectionHint, { color: colors.textTertiary }]}>STAR story ideas based on your experience</Text>
                    {candidate_positioning.story_prompts.map((prompt, index) => (
                      <View key={index} style={[styles.storyPromptCard, { backgroundColor: colors.backgroundTertiary, borderLeftColor: '#10b981' }]}>
                        <View style={styles.storyPromptHeader}>
                          <Star color="#f59e0b" size={16} />
                          <Text style={[styles.storyPromptTitle, { color: colors.text }]}>{prompt.title}</Text>
                        </View>
                        <Text style={[styles.storyPromptDescription, { color: colors.textSecondary }]}>{prompt.description}</Text>
                        {prompt.star_hint && (
                          <View style={styles.starHintContainer}>
                            <Text style={[styles.starHintLabel, { color: colors.textTertiary }]}>STAR Hint:</Text>
                            <View style={styles.starHintRow}>
                              <Text style={[styles.starLetter, { color: COLORS.success }]}>S</Text>
                              <Text style={[styles.starHintText, { color: colors.textSecondary }]} numberOfLines={2}>{prompt.star_hint.situation}</Text>
                            </View>
                            <View style={styles.starHintRow}>
                              <Text style={[styles.starLetter, { color: COLORS.info }]}>T</Text>
                              <Text style={[styles.starHintText, { color: colors.textSecondary }]} numberOfLines={2}>{prompt.star_hint.task}</Text>
                            </View>
                            <View style={styles.starHintRow}>
                              <Text style={[styles.starLetter, { color: COLORS.purple }]}>A</Text>
                              <Text style={[styles.starHintText, { color: colors.textSecondary }]} numberOfLines={2}>{prompt.star_hint.action}</Text>
                            </View>
                            <View style={styles.starHintRow}>
                              <Text style={[styles.starLetter, { color: COLORS.warning }]}>R</Text>
                              <Text style={[styles.starHintText, { color: colors.textSecondary }]} numberOfLines={2}>{prompt.star_hint.result}</Text>
                            </View>
                          </View>
                        )}
                      </View>
                    ))}
                    {/* Build Stories Button */}
                    <TouchableOpacity
                      style={[styles.buildStoriesButton, { backgroundColor: '#10b98120' }]}
                      onPress={() => navigation.navigate('STARStoryBuilder' as any, { interviewPrepId, tailoredResumeId })}
                    >
                      <Star color="#10b981" size={18} />
                      <Text style={[styles.buildStoriesButtonText, { color: '#10b981' }]}>Build Full STAR Stories</Text>
                      <ChevronRight color="#10b981" size={18} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </GlassCard>

          {/* AI Practice Section */}
          {interviewPrepId && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>AI PRACTICE</Text>

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
                <TouchableOpacity
                  style={styles.stackedCardItem}
                  onPress={() => {
                    console.log('=== AI Card Pressed: BehavioralTechnical ===');
                    navigation.navigate('BehavioralTechnicalQuestions' as any, { interviewPrepId });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.stackedCardLeft}>
                    <View style={[styles.stackedCardIcon, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
                      <Brain color={COLORS.purple} size={20} />
                    </View>
                    <View style={styles.stackedCardContent}>
                      <View style={styles.stackedCardTitleRow}>
                        <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Behavioral & Technical</Text>
                        <View style={styles.aiBadge}>
                          <Text style={styles.aiBadgeText}>AI</Text>
                        </View>
                      </View>
                      <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                        Practice questions with STAR story builder
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color={colors.textTertiary} size={20} />
                </TouchableOpacity>
              </GlassCard>

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
                <TouchableOpacity
                  style={styles.stackedCardItem}
                  onPress={() => {
                    console.log('=== AI Card Pressed: CommonQuestions ===');
                    navigation.navigate('CommonQuestions' as any, { interviewPrepId });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.stackedCardLeft}>
                    <View style={[styles.stackedCardIcon, { backgroundColor: '#ec489920' }]}>
                      <MessageCircle color="#ec4899" size={20} />
                    </View>
                    <View style={styles.stackedCardContent}>
                      <View style={styles.stackedCardTitleRow}>
                        <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Common Questions</Text>
                        <View style={styles.aiBadge}>
                          <Text style={styles.aiBadgeText}>AI</Text>
                        </View>
                      </View>
                      <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                        Questions people commonly struggle with
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color={colors.textTertiary} size={20} />
                </TouchableOpacity>
              </GlassCard>

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
                <TouchableOpacity
                  style={styles.stackedCardItem}
                  onPress={() => {
                    console.log('=== AI Card Pressed: PracticeQuestions ===');
                    navigation.navigate('PracticeQuestions' as any, { interviewPrepId, tailoredResumeId });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.stackedCardLeft}>
                    <View style={[styles.stackedCardIcon, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                      <ClipboardList color={COLORS.success} size={20} />
                    </View>
                    <View style={styles.stackedCardContent}>
                      <View style={styles.stackedCardTitleRow}>
                        <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Practice Questions</Text>
                        <View style={styles.aiBadge}>
                          <Text style={styles.aiBadgeText}>AI</Text>
                        </View>
                      </View>
                      <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                        Job-specific practice with STAR stories
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color={colors.textTertiary} size={20} />
                </TouchableOpacity>
              </GlassCard>

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
                <TouchableOpacity
                  style={styles.stackedCardItem}
                  onPress={() => {
                    console.log('=== AI Card Pressed: STARStoryBuilder ===');
                    navigation.navigate('STARStoryBuilder' as any, { interviewPrepId, tailoredResumeId });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.stackedCardLeft}>
                    <View style={[styles.stackedCardIcon, { backgroundColor: '#f59e0b20' }]}>
                      <Star color="#f59e0b" size={20} />
                    </View>
                    <View style={styles.stackedCardContent}>
                      <View style={styles.stackedCardTitleRow}>
                        <Text style={[styles.stackedCardTitle, { color: colors.text }]}>STAR Story Builder</Text>
                        <View style={styles.aiBadge}>
                          <Text style={styles.aiBadgeText}>AI</Text>
                        </View>
                      </View>
                      <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                        Build stories from your experiences
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color={colors.textTertiary} size={20} />
                </TouchableOpacity>
              </GlassCard>

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.xl} style={styles.individualCard}>
                <TouchableOpacity
                  style={styles.stackedCardItem}
                  onPress={() => {
                    console.log('=== AI Card Pressed: Certifications ===');
                    navigation.navigate('Certifications' as any, { interviewPrepId });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.stackedCardLeft}>
                    <View style={[styles.stackedCardIcon, { backgroundColor: '#8b5cf620' }]}>
                      <Award color="#8b5cf6" size={20} />
                    </View>
                    <View style={styles.stackedCardContent}>
                      <View style={styles.stackedCardTitleRow}>
                        <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Certifications</Text>
                        {loadingCertifications ? (
                          <ActivityIndicator size="small" color="#8b5cf6" style={{ marginLeft: 8 }} />
                        ) : certificationRecommendations ? (
                          <CheckCircle color={COLORS.success} size={16} style={{ marginLeft: 8 }} />
                        ) : (
                          <View style={styles.aiBadge}>
                            <Text style={styles.aiBadgeText}>AI</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                        {loadingCertifications ? 'Loading recommendations...' : 'Recommended certifications for this role'}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color={colors.textTertiary} size={20} />
                </TouchableOpacity>
              </GlassCard>
            </>
          )}
        </View>

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
  refreshButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  actionButtonsContainer: {
    flexDirection: 'column',
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
  // Stacked Card Layout - frosted glass like Settings
  cardStack: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
    marginTop: SPACING.lg,
    letterSpacing: 0.5,
    paddingHorizontal: SPACING.xs,
  },
  stackedCard: {
    marginBottom: SPACING.sm,
  },
  individualCard: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.xl, // More rounded edges
    overflow: 'hidden',
  },
  stackedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    minHeight: 88,
  },
  stackedCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stackedCardIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  stackedCardContent: {
    flex: 1,
  },
  stackedCardTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  stackedCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stackedCardSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginTop: 4,
    lineHeight: 20,
  },
  stackedCardDivider: {
    height: 1,
    marginLeft: 64,
  },
  aiBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    color: '#FFFFFF',
  },
  // Expanded content styles for inline card expansion
  expandedContent: {
    borderTopWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  expandedText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  expandedLabel: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginRight: SPACING.sm,
  },
  expandedValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  expandedSection: {
    marginBottom: SPACING.md,
  },
  expandedSectionTitle: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: SPACING.sm,
  },
  bulletText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    flex: 1,
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  chipText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Job card in glass
  jobCardGlass: {
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
    borderLeftWidth: 3,
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
    backgroundColor: ALPHA_COLORS.white[10],
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
    borderBottomColor: ALPHA_COLORS.white[5],
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
    borderBottomColor: ALPHA_COLORS.white[5],
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
    borderTopColor: ALPHA_COLORS.white[5],
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
  // Enhanced Strategy & News Styles
  strategyItem: {
    marginBottom: SPACING.md,
  },
  strategyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  strategyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.sm,
  },
  strategyItemTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  strategyItemDesc: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginLeft: SPACING.md + 8,
  },
  techFocusItem: {
    marginBottom: SPACING.md,
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  techBadgeText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
  },
  relevanceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingLeft: SPACING.xs,
  },
  relevanceLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    marginRight: 4,
  },
  relevanceText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  newsTitle: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.semibold,
    lineHeight: 20,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    backgroundColor: ALPHA_COLORS.warning.bg,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  impactText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    lineHeight: 16,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  // Enhanced Candidate Positioning Styles
  sectionHint: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  focusAreaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  focusAreaNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  focusAreaNumberText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  focusAreaText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    paddingTop: 2,
  },
  keywordMapItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  keywordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  keywordArrow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  keywordBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  keywordBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  keywordText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  starHintContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: ALPHA_COLORS.white[10],
  },
  starHintLabel: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  starHintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  starLetter: {
    width: 20,
    fontSize: 14,
    fontFamily: FONTS.bold,
    marginRight: 4,
  },
  starHintText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  buildStoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  buildStoriesButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
});
