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
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

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
    rationale: string;
  }>;
  technology_focus: Array<{
    technology: string;
    description: string;
    relevance_to_role: string;
  }>;
}

interface RoleAnalysis {
  job_title: string;
  seniority_level: string;
  core_responsibilities: string[];
  must_have_skills: string[];
  nice_to_have_skills: string[];
  success_signals_6_12_months: string[];
}

interface InterviewPreparation {
  research_tasks: string[];
  practice_questions_for_candidate: string[];
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
    candidate_equivalent: string;
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
}> = ({ title, icon, children, defaultExpanded = false, accentColor = COLORS.primary }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.sectionCard}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={`${title} section, ${expanded ? 'expanded' : 'collapsed'}`}
      >
        <View style={[styles.sectionIconContainer, { backgroundColor: `${accentColor}20` }]}>
          {icon}
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {expanded ? (
          <ChevronUp color={COLORS.dark.textSecondary} size={20} />
        ) : (
          <ChevronDown color={COLORS.dark.textSecondary} size={20} />
        )}
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

// Bullet List Component
const BulletList: React.FC<{ items: any[]; icon?: React.ReactNode }> = ({ items, icon }) => {
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
            <Text style={styles.bulletText}>{displayText}</Text>
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

export default function InterviewPrepScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<InterviewPrepRouteProp>();
  const { tailoredResumeId } = route.params;

  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [interviewPrepId, setInterviewPrepId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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
      }
    } catch (error) {
      console.error('Error loading interview prep:', error);
    } finally {
      setLoading(false);
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
          <Text style={styles.loadingText}>Loading interview prep...</Text>
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
            <ArrowLeft color={COLORS.dark.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Prep</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Briefcase color={COLORS.dark.textTertiary} size={64} />
          </View>
          <Text style={styles.emptyTitle}>No Prep Available</Text>
          <Text style={styles.emptyText}>
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
                <ActivityIndicator color={COLORS.dark.background} />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </>
            ) : (
              <>
                <Sparkles color={COLORS.dark.background} size={20} />
                <Text style={styles.generateButtonText}>Generate Interview Prep</Text>
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
          <ArrowLeft color={COLORS.dark.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interview Prep</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Action Buttons */}
        {interviewPrepId && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                // Navigate to common questions screen
                navigation.navigate('CommonQuestions' as any, { interviewPrepId });
              }}
              accessibilityRole="button"
              accessibilityLabel="View common interview questions"
            >
              <MessageCircle color={COLORS.dark.background} size={18} />
              <Text style={styles.actionButtonText}>Common Questions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.purple }]}
              onPress={() => {
                // Navigate to practice questions screen
                navigation.navigate('PracticeQuestions' as any, {
                  interviewPrepId,
                  tailoredResumeId
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Practice interview questions"
            >
              <ClipboardList color={COLORS.dark.background} size={18} />
              <Text style={styles.actionButtonText}>Practice Questions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.info }]}
              onPress={() => {
                // Navigate to behavioral/technical questions screen
                navigation.navigate('BehavioralTechnicalQuestions' as any, {
                  interviewPrepId
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="View behavioral and technical questions"
            >
              <Brain color={COLORS.dark.background} size={18} />
              <Text style={styles.actionButtonText}>Behavioral & Technical</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Job Info Card */}
        <View style={styles.jobCard}>
          <View style={styles.jobCardHeader}>
            <View style={styles.jobIcon}>
              <Building2 color={COLORS.primary} size={24} />
            </View>
            <View style={styles.jobInfo}>
              <Text style={styles.jobCompany}>{company_profile?.name || 'Company'}</Text>
              <Text style={styles.jobTitle}>{role_analysis?.job_title || 'Position'}</Text>
            </View>
          </View>
          <View style={styles.jobMeta}>
            {company_profile?.industry && (
              <View style={styles.metaItem}>
                <Briefcase color={COLORS.dark.textSecondary} size={14} />
                <Text style={styles.metaText}>{company_profile.industry}</Text>
              </View>
            )}
            {company_profile?.locations && company_profile.locations.length > 0 && (
              <View style={styles.metaItem}>
                <MapPin color={COLORS.dark.textSecondary} size={14} />
                <Text style={styles.metaText}>{company_profile.locations[0]}</Text>
              </View>
            )}
            {role_analysis?.seniority_level && (
              <View style={styles.metaItem}>
                <TrendingUp color={COLORS.dark.textSecondary} size={14} />
                <Text style={styles.metaText}>{role_analysis.seniority_level}</Text>
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
        >
          {company_profile?.overview_paragraph && (
            <Text style={styles.overviewText}>{company_profile.overview_paragraph}</Text>
          )}
          {company_profile?.size_estimate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Company Size:</Text>
              <Text style={styles.infoValue}>{company_profile.size_estimate}</Text>
            </View>
          )}
        </ExpandableSection>

        {/* Role Analysis Section */}
        <ExpandableSection
          title="Role Analysis"
          icon={<Target color={COLORS.purple} size={20} />}
          accentColor={COLORS.purple}
        >
          {role_analysis?.core_responsibilities && Array.isArray(role_analysis.core_responsibilities) && role_analysis.core_responsibilities.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Core Responsibilities</Text>
              <BulletList items={role_analysis.core_responsibilities} />
            </View>
          )}
          {role_analysis?.must_have_skills && Array.isArray(role_analysis.must_have_skills) && role_analysis.must_have_skills.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Must-Have Skills</Text>
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
              <Text style={styles.subsectionTitle}>Nice-to-Have Skills</Text>
              <View style={styles.chipContainer}>
                {role_analysis.nice_to_have_skills.map((skill, index) => {
                  const label = typeof skill === 'string' ? skill : (skill?.name || skill?.skill || JSON.stringify(skill));
                  return <Chip key={index} label={label} color={COLORS.dark.textSecondary} />;
                })}
              </View>
            </View>
          )}
          {role_analysis?.success_signals_6_12_months && Array.isArray(role_analysis.success_signals_6_12_months) && role_analysis.success_signals_6_12_months.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Success Signals (6-12 Months)</Text>
              <BulletList
                items={role_analysis.success_signals_6_12_months}
                icon={<Star color={COLORS.warning} size={12} />}
              />
            </View>
          )}
        </ExpandableSection>

        {/* Values & Culture Section */}
        <ExpandableSection
          title="Values & Culture"
          icon={<Heart color={COLORS.error} size={20} />}
          accentColor={COLORS.error}
        >
          {values_and_culture?.stated_values && Array.isArray(values_and_culture.stated_values) && values_and_culture.stated_values.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Company Values</Text>
              {values_and_culture.stated_values.map((value, index) => {
                // Handle case where value might be a string or object
                const name = typeof value === 'string' ? value : (value?.name || value?.title || '');
                const description = typeof value === 'object' ? (value?.description || value?.source_snippet || '') : '';

                return (
                  <View key={index} style={styles.valueCard}>
                    <Text style={styles.valueName}>{name}</Text>
                    {description ? (
                      <Text style={styles.valueDescription}>{description}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
          {values_and_culture?.practical_implications && Array.isArray(values_and_culture.practical_implications) && values_and_culture.practical_implications.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>What This Means for You</Text>
              <BulletList items={values_and_culture.practical_implications} />
            </View>
          )}
        </ExpandableSection>

        {/* Strategy & News Section */}
        <ExpandableSection
          title="Strategy & Recent News"
          icon={<Newspaper color={COLORS.info} size={20} />}
          accentColor={COLORS.info}
        >
          {strategy_and_news?.strategic_themes && Array.isArray(strategy_and_news.strategic_themes) && strategy_and_news.strategic_themes.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Strategic Themes</Text>
              {strategy_and_news.strategic_themes.map((theme, index) => {
                const themeName = typeof theme === 'string' ? theme : (theme?.theme || theme?.name || '');
                const rationale = typeof theme === 'object' ? (theme?.rationale || theme?.description || '') : '';

                return (
                  <View key={index} style={styles.themeCard}>
                    <Text style={styles.themeName}>{themeName}</Text>
                    {rationale ? <Text style={styles.themeRationale}>{rationale}</Text> : null}
                  </View>
                );
              })}
            </View>
          )}
          {strategy_and_news?.technology_focus && Array.isArray(strategy_and_news.technology_focus) && strategy_and_news.technology_focus.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Technology Focus</Text>
              {strategy_and_news.technology_focus.map((tech, index) => {
                const techName = typeof tech === 'string' ? tech : (tech?.technology || tech?.name || '');
                const description = typeof tech === 'object' ? (tech?.description || '') : '';
                const relevance = typeof tech === 'object' ? (tech?.relevance_to_role || '') : '';

                return (
                  <View key={index} style={styles.techCard}>
                    <Text style={styles.techName}>{techName}</Text>
                    {description ? <Text style={styles.techDescription}>{description}</Text> : null}
                    {relevance ? <Text style={styles.techRelevance}>Relevance: {relevance}</Text> : null}
                  </View>
                );
              })}
            </View>
          )}
          {strategy_and_news?.recent_events && Array.isArray(strategy_and_news.recent_events) && strategy_and_news.recent_events.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Recent News</Text>
              {strategy_and_news.recent_events.slice(0, 5).map((event, index) => {
                const headline = typeof event === 'string' ? event : (event?.title || event?.headline || '');
                const date = typeof event === 'object' ? (event?.date || '') : '';
                const source = typeof event === 'object' ? (event?.source || '') : '';
                const summary = typeof event === 'object' ? (event?.summary || '') : '';
                const impact = typeof event === 'object' ? (event?.impact_summary || '') : '';

                return (
                  <View key={index} style={styles.newsItem}>
                    <Text style={styles.newsHeadline}>{headline}</Text>
                    {date ? <Text style={styles.newsDate}>{date}</Text> : null}
                    {source ? <Text style={styles.newsSource}>Source: {source}</Text> : null}
                    {summary ? <Text style={styles.newsSummary}>{summary}</Text> : null}
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
        >
          {interview_preparation?.research_tasks && Array.isArray(interview_preparation.research_tasks) && interview_preparation.research_tasks.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Research Tasks</Text>
              <BulletList
                items={interview_preparation.research_tasks}
                icon={<CheckCircle color={COLORS.success} size={14} />}
              />
            </View>
          )}
          {interview_preparation?.day_of_checklist && Array.isArray(interview_preparation.day_of_checklist) && interview_preparation.day_of_checklist.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Day-of Checklist</Text>
              <BulletList
                items={interview_preparation.day_of_checklist}
                icon={<CheckCircle color={COLORS.warning} size={14} />}
              />
            </View>
          )}
          {interview_preparation?.practice_questions_for_candidate && Array.isArray(interview_preparation.practice_questions_for_candidate) && interview_preparation.practice_questions_for_candidate.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Practice Questions</Text>
              {interview_preparation.practice_questions_for_candidate.map((question, index) => {
                const questionText = typeof question === 'string' ? question : (question?.question || question?.text || JSON.stringify(question));
                return (
                  <View key={index} style={styles.practiceQuestion}>
                    <HelpCircle color={COLORS.primary} size={16} />
                    <Text style={styles.practiceQuestionText}>{questionText}</Text>
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
        >
          {questions_to_ask_interviewer?.product && Array.isArray(questions_to_ask_interviewer.product) && questions_to_ask_interviewer.product.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>About the Product</Text>
              <BulletList items={questions_to_ask_interviewer.product} />
            </View>
          )}
          {questions_to_ask_interviewer?.team && Array.isArray(questions_to_ask_interviewer.team) && questions_to_ask_interviewer.team.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>About the Team</Text>
              <BulletList items={questions_to_ask_interviewer.team} />
            </View>
          )}
          {questions_to_ask_interviewer?.culture && Array.isArray(questions_to_ask_interviewer.culture) && questions_to_ask_interviewer.culture.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>About Culture</Text>
              <BulletList items={questions_to_ask_interviewer.culture} />
            </View>
          )}
          {questions_to_ask_interviewer?.performance && Array.isArray(questions_to_ask_interviewer.performance) && questions_to_ask_interviewer.performance.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>About Performance</Text>
              <BulletList items={questions_to_ask_interviewer.performance} />
            </View>
          )}
          {questions_to_ask_interviewer?.strategy && Array.isArray(questions_to_ask_interviewer.strategy) && questions_to_ask_interviewer.strategy.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>About Strategy</Text>
              <BulletList items={questions_to_ask_interviewer.strategy} />
            </View>
          )}
        </ExpandableSection>

        {/* Candidate Positioning Section */}
        <ExpandableSection
          title="Your Positioning"
          icon={<Award color={COLORS.purple} size={20} />}
          accentColor={COLORS.purple}
        >
          {candidate_positioning?.resume_focus_areas && Array.isArray(candidate_positioning.resume_focus_areas) && candidate_positioning.resume_focus_areas.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Resume Focus Areas</Text>
              <BulletList items={candidate_positioning.resume_focus_areas} />
            </View>
          )}
          {candidate_positioning?.story_prompts && Array.isArray(candidate_positioning.story_prompts) && candidate_positioning.story_prompts.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>STAR Story Prompts</Text>
              {candidate_positioning.story_prompts.map((prompt, index) => {
                // Handle case where prompt might be a string or have different structure
                const title = typeof prompt === 'string' ? prompt : (prompt?.title || '');
                const description = typeof prompt === 'object' ? (prompt?.description || '') : '';

                return (
                  <View key={index} style={styles.storyPromptCard}>
                    <View style={styles.storyPromptHeader}>
                      <Lightbulb color={COLORS.warning} size={16} />
                      <Text style={styles.storyPromptTitle}>{title}</Text>
                    </View>
                    {description ? (
                      <Text style={styles.storyPromptDescription}>{description}</Text>
                    ) : null}
                  </View>
                );
              })}
            </View>
          )}
          {candidate_positioning?.keyword_map && Array.isArray(candidate_positioning.keyword_map) && candidate_positioning.keyword_map.length > 0 && (
            <View style={styles.subsection}>
              <Text style={styles.subsectionTitle}>Keywords to Use</Text>
              {candidate_positioning.keyword_map.map((item, index) => {
                // Handle case where item structure might vary
                const companyTerm = item?.company_term || item?.term || '';
                const candidateEquivalent = item?.candidate_equivalent || item?.equivalent || '';
                const context = item?.context || '';

                return (
                  <View key={index} style={styles.keywordItem}>
                    <Text style={styles.keywordLabel}>
                      {companyTerm} → {candidateEquivalent}
                    </Text>
                    {context ? (
                      <Text style={styles.keywordContext}>{context}</Text>
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
    backgroundColor: COLORS.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.dark.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
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
    color: COLORS.dark.text,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
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
    color: COLORS.dark.background,
  },
  jobCard: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
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
    backgroundColor: COLORS.dark.backgroundTertiary,
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
    color: COLORS.dark.textSecondary,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
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
    color: COLORS.dark.textSecondary,
  },
  sectionCard: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
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
    color: COLORS.dark.text,
  },
  sectionContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
  },
  subsection: {
    marginTop: SPACING.md,
  },
  subsectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  overviewText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
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
    color: COLORS.dark.text,
    marginRight: SPACING.xs,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
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
    color: COLORS.dark.textSecondary,
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
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  valueName: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: 4,
  },
  valueDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 18,
  },
  themeCard: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  themeName: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: 4,
  },
  themeRationale: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 18,
  },
  techCard: {
    backgroundColor: COLORS.dark.backgroundTertiary,
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
    color: COLORS.dark.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  techRelevance: {
    fontSize: 12,
    fontFamily: FONTS.italic,
    color: COLORS.dark.textTertiary,
    lineHeight: 16,
  },
  newsItem: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  newsHeadline: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: 4,
  },
  newsDate: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textTertiary,
    marginBottom: 4,
  },
  newsSource: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.dark.textTertiary,
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
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
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  practiceQuestionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
    marginLeft: SPACING.sm,
  },
  storyPromptCard: {
    backgroundColor: COLORS.dark.backgroundTertiary,
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
    color: COLORS.dark.text,
    marginLeft: SPACING.sm,
  },
  storyPromptDescription: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 18,
  },
  storyPrompt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  storyPromptText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
    marginLeft: SPACING.sm,
  },
  keywordItem: {
    backgroundColor: COLORS.dark.backgroundTertiary,
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
    color: COLORS.dark.textSecondary,
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
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
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
    color: COLORS.dark.text,
  },
});
