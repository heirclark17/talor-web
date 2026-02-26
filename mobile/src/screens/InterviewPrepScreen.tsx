import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Share,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Calendar,
  Square,
  CheckSquare,
  Plus,
  Trash2,
  Share2,
  StickyNote,
  ChevronsDown,
  ChevronsUp,
  X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, ReadinessScore, ValuesAlignment, CompanyResearch, StrategicNewsItem, CompetitiveIntelligence, InterviewStrategy, ExecutiveInsights } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT, ALPHA_COLORS, TYPOGRAPHY } from '../utils/constants';
import { GlassCard } from '../components/glass/GlassCard';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { usePostHog } from '../contexts/PostHogContext';
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
  const { colors, isDark } = useTheme();
  const { capture } = usePostHog();
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
  const [starStoryCount, setStarStoryCount] = useState<number>(0);

  // New web-parity state
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showNotesFor, setShowNotesFor] = useState<string | null>(null);
  const [customQuestions, setCustomQuestions] = useState<Array<{ id: string; question: string; category: string }>>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newQuestionCategory, setNewQuestionCategory] = useState('product');
  const [interviewDate, setInterviewDate] = useState<string>('');
  const [showDateInput, setShowDateInput] = useState(false);
  const [dateInputValue, setDateInputValue] = useState('');
  const [allExpanded, setAllExpanded] = useState(false);

  // Debounced save refs
  const saveTimerRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const interviewPrepIdRef = useRef<number | null>(null);

  // Keep ref in sync
  useEffect(() => {
    interviewPrepIdRef.current = interviewPrepId;
  }, [interviewPrepId]);

  // Debounced save to backend
  const debouncedSaveUserData = useCallback((field: string, value: any) => {
    const prepId = interviewPrepIdRef.current;
    if (!prepId) return;

    if (saveTimerRef.current[field]) {
      clearTimeout(saveTimerRef.current[field]);
    }

    saveTimerRef.current[field] = setTimeout(() => {
      api.cacheInterviewPrepData(prepId, { user_data: { [field]: value } });
    }, 500);
  }, []);

  // Load persisted user data from AsyncStorage
  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const [checks, savedNotes, questions, date] = await Promise.all([
          AsyncStorage.getItem(`interview-prep-checks-${tailoredResumeId}`),
          AsyncStorage.getItem(`interview-prep-notes-${tailoredResumeId}`),
          AsyncStorage.getItem(`interview-prep-custom-questions-${tailoredResumeId}`),
          AsyncStorage.getItem(`interview-date-${tailoredResumeId}`),
        ]);
        if (checks) setCheckedItems(JSON.parse(checks));
        if (savedNotes) setNotes(JSON.parse(savedNotes));
        if (questions) setCustomQuestions(JSON.parse(questions));
        if (date) setInterviewDate(date);
      } catch (error) {
        console.error('Error loading persisted interview prep data:', error);
      }
    };
    loadPersistedData();
  }, [tailoredResumeId]);

  // Toggle checklist item
  const toggleCheck = useCallback((itemId: string) => {
    setCheckedItems(prev => {
      const newState = { ...prev, [itemId]: !prev[itemId] };
      AsyncStorage.setItem(`interview-prep-checks-${tailoredResumeId}`, JSON.stringify(newState));
      debouncedSaveUserData('checklist_checks', newState);
      return newState;
    });
  }, [tailoredResumeId, debouncedSaveUserData]);

  // Update note for a section
  const updateNote = useCallback((sectionId: string, content: string) => {
    setNotes(prev => {
      const newNotes = { ...prev, [sectionId]: content };
      AsyncStorage.setItem(`interview-prep-notes-${tailoredResumeId}`, JSON.stringify(newNotes));
      debouncedSaveUserData('notes', newNotes);
      return newNotes;
    });
  }, [tailoredResumeId, debouncedSaveUserData]);

  // Add custom question
  const addCustomQuestion = useCallback(() => {
    if (!newQuestion.trim()) return;
    const question = { id: Date.now().toString(), question: newQuestion.trim(), category: newQuestionCategory };
    setCustomQuestions(prev => {
      const updated = [...prev, question];
      AsyncStorage.setItem(`interview-prep-custom-questions-${tailoredResumeId}`, JSON.stringify(updated));
      debouncedSaveUserData('custom_questions', updated);
      return updated;
    });
    setNewQuestion('');
    setShowAddQuestion(false);
  }, [newQuestion, newQuestionCategory, tailoredResumeId, debouncedSaveUserData]);

  // Delete custom question
  const deleteCustomQuestion = useCallback((id: string) => {
    setCustomQuestions(prev => {
      const updated = prev.filter(q => q.id !== id);
      AsyncStorage.setItem(`interview-prep-custom-questions-${tailoredResumeId}`, JSON.stringify(updated));
      debouncedSaveUserData('custom_questions', updated);
      return updated;
    });
  }, [tailoredResumeId, debouncedSaveUserData]);

  // Save interview date
  const saveInterviewDate = useCallback((date: string) => {
    setInterviewDate(date);
    AsyncStorage.setItem(`interview-date-${tailoredResumeId}`, date);
    debouncedSaveUserData('interview_date', date);
  }, [tailoredResumeId, debouncedSaveUserData]);

  // Get days until interview
  const getDaysUntilInterview = () => {
    if (!interviewDate) return null;
    const today = new Date();
    const interview = new Date(interviewDate);
    if (isNaN(interview.getTime())) return null;
    return Math.ceil((interview.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  // Get countdown color
  const getCountdownColor = () => {
    const days = getDaysUntilInterview();
    if (days === null) return colors.textTertiary;
    if (days <= 3) return COLORS.error;
    if (days <= 7) return COLORS.warning;
    return COLORS.success;
  };

  // Progress stats calculation
  const getProgressStats = () => {
    const researchTasks = prepData?.interview_preparation?.research_tasks || [];
    const researchCompleted = researchTasks.filter((_: string, idx: number) => checkedItems[`research-${idx}`]).length;
    const checklistItems = prepData?.interview_preparation?.day_of_checklist || [];
    const checklistCompleted = checklistItems.filter((_: string, idx: number) => checkedItems[`checklist-${idx}`]).length;
    return { researchCompleted, researchTotal: researchTasks.length, checklistCompleted, checklistTotal: checklistItems.length };
  };

  // Expand/collapse all
  const toggleExpandAll = () => {
    if (allExpanded) {
      setSelectedSection(null);
      setAllExpanded(false);
    } else {
      setAllExpanded(true);
    }
  };

  // Export / Share
  const handleExport = async () => {
    const companyName = prepData?.company_profile?.name || 'Company';
    const jobTitleText = prepData?.role_analysis?.job_title || 'Position';
    try {
      await Share.share({
        title: `Interview Prep: ${jobTitleText} at ${companyName}`,
        message: `Interview Preparation Guide\n\n${jobTitleText} at ${companyName}\n\nUse the Talor app to view your full prep materials.`,
      });
    } catch (error) {
      // User cancelled
    }
  };

  // Handle email
  const handleEmailPrep = () => {
    const companyName = prepData?.company_profile?.name || 'Company';
    const jobTitleText = prepData?.role_analysis?.job_title || 'Position';
    const subject = encodeURIComponent(`Interview Prep: ${jobTitleText} at ${companyName}`);
    const body = encodeURIComponent(`Your interview preparation guide for ${jobTitleText} at ${companyName} is ready in the Talor app.`);
    Linking.openURL(`mailto:?subject=${subject}&body=${body}`);
  };

  // Notes toggle component
  const renderNotesButton = (sectionId: string) => (
    <TouchableOpacity
      style={styles.notesToggleButton}
      onPress={() => setShowNotesFor(showNotesFor === sectionId ? null : sectionId)}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <StickyNote color={notes[sectionId] ? COLORS.warning : colors.textTertiary} size={16} />
    </TouchableOpacity>
  );

  // Notes editor component
  const renderNotesEditor = (sectionId: string) => {
    if (showNotesFor !== sectionId) return null;
    return (
      <View style={[styles.notesContainer, { backgroundColor: colors.backgroundTertiary }]}>
        <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Your Notes</Text>
        <TextInput
          style={[styles.notesInput, { color: colors.text, borderColor: colors.border }]}
          value={notes[sectionId] || ''}
          onChangeText={(text) => updateNote(sectionId, text)}
          placeholder="Add your notes here..."
          placeholderTextColor={colors.textTertiary}
          multiline
          textAlignVertical="top"
        />
      </View>
    );
  };

  // Section press handler
  const handleSectionPress = (section: string) => {
    const newValue = selectedSection === section ? null : section;
    setSelectedSection(newValue);
  };

  // Load interview prep on mount (uses cache if available)
  useEffect(() => {
    console.log('=== InterviewPrepScreen mounted ===');
    console.log('tailoredResumeId:', tailoredResumeId);
    console.log('cachedPrep exists:', !!cachedPrep);

    // Track screen view
    capture('screen_viewed', {
      screen_name: 'Interview Prep',
      screen_type: 'core_feature',
      tailored_resume_id: tailoredResumeId,
      has_cached_data: !!cachedPrep,
    });

    // Only fetch if not cached
    if (!cachedPrep) {
      getInterviewPrep(tailoredResumeId);
    }

    // Load STAR story count
    const loadStoryCount = async () => {
      try {
        const result = await api.listStarStories(tailoredResumeId);
        if (result.success && Array.isArray(result.data)) {
          setStarStoryCount(result.data.length);
        }
      } catch (error) {
        console.error('Error loading story count:', error);
      }
    };
    loadStoryCount();
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
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={toggleExpandAll}
            accessibilityRole="button"
            accessibilityLabel={allExpanded ? 'Collapse all sections' : 'Expand all sections'}
          >
            {allExpanded ? (
              <ChevronsUp color={colors.textSecondary} size={20} />
            ) : (
              <ChevronsDown color={colors.textSecondary} size={20} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleExport}
            accessibilityRole="button"
            accessibilityLabel="Share interview prep"
          >
            <Share2 color={colors.textSecondary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionButton}
            onPress={handleRefresh}
            accessibilityRole="button"
            accessibilityLabel="Refresh interview prep data"
          >
            <RefreshCw color={colors.textSecondary} size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Progress Dashboard */}
        {(() => {
          const stats = getProgressStats();
          const daysUntil = getDaysUntilInterview();
          const countdownColor = getCountdownColor();
          return (
            <GlassCard material="thin" borderRadius={RADIUS.lg} style={styles.progressDashboard}>
              {/* Interview Date Countdown */}
              <View style={styles.countdownRow}>
                <TouchableOpacity
                  style={[styles.countdownButton, { borderColor: countdownColor }]}
                  onPress={() => setShowDateInput(!showDateInput)}
                >
                  <Calendar color={countdownColor} size={18} />
                  {daysUntil !== null ? (
                    <View style={styles.countdownContent}>
                      <Text style={[styles.countdownNumber, { color: countdownColor }]}>{daysUntil}</Text>
                      <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>
                        {daysUntil === 1 ? 'day until interview' : 'days until interview'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.countdownLabel, { color: colors.textSecondary }]}>Set interview date</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Date Input */}
              {showDateInput && (
                <View style={styles.dateInputContainer}>
                  <TextInput
                    style={[styles.dateInput, { color: colors.text, borderColor: colors.border }]}
                    value={dateInputValue || interviewDate}
                    onChangeText={setDateInputValue}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={[styles.dateInputSave, { backgroundColor: COLORS.primary }]}
                    onPress={() => {
                      const val = dateInputValue || interviewDate;
                      if (val && !isNaN(new Date(val).getTime())) {
                        saveInterviewDate(val);
                        setShowDateInput(false);
                        setDateInputValue('');
                      } else {
                        Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format.');
                      }
                    }}
                  >
                    <Text style={styles.dateInputSaveText}>Save</Text>
                  </TouchableOpacity>
                  {interviewDate && (
                    <TouchableOpacity
                      style={styles.dateInputClear}
                      onPress={() => {
                        saveInterviewDate('');
                        setShowDateInput(false);
                        setDateInputValue('');
                      }}
                    >
                      <X color={COLORS.error} size={18} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Progress Bars */}
              <View style={styles.progressBarsContainer}>
                {/* Research Tasks Progress */}
                <View style={styles.progressBarSection}>
                  <View style={styles.progressBarHeader}>
                    <Text style={[styles.progressBarLabel, { color: colors.text }]}>Research Tasks</Text>
                    <Text style={[styles.progressBarCount, { color: colors.textSecondary }]}>
                      {stats.researchCompleted}/{stats.researchTotal}
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.backgroundTertiary }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: COLORS.primary,
                          width: stats.researchTotal > 0 ? `${(stats.researchCompleted / stats.researchTotal) * 100}%` : '0%',
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Day-Of Checklist Progress */}
                <View style={styles.progressBarSection}>
                  <View style={styles.progressBarHeader}>
                    <Text style={[styles.progressBarLabel, { color: colors.text }]}>Day-Of Checklist</Text>
                    <Text style={[styles.progressBarCount, { color: colors.textSecondary }]}>
                      {stats.checklistCompleted}/{stats.checklistTotal}
                    </Text>
                  </View>
                  <View style={[styles.progressBarTrack, { backgroundColor: colors.backgroundTertiary }]}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: COLORS.success,
                          width: stats.checklistTotal > 0 ? `${(stats.checklistCompleted / stats.checklistTotal) * 100}%` : '0%',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </GlassCard>
          );
        })()}

        {/* Job Info Card - Header in Frosted Glass */}
        <GlassCard material="thin" borderRadius={RADIUS.lg} style={styles.jobCardGlass}>
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
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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
                {renderNotesEditor('companyProfile')}
              </View>
            )}
          </GlassCard>

          {/* Values & Culture Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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
                {renderNotesEditor('valuesCulture')}
              </View>
            )}
          </GlassCard>

          {/* Strategy & News Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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

          {/* Competitive Intelligence Card + Expandable */}
          {competitiveIntelligence && (
            <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
              <TouchableOpacity
                style={styles.stackedCardItem}
                onPress={() => handleSectionPress('competitiveIntel')}
                activeOpacity={0.7}
              >
                <View style={styles.stackedCardLeft}>
                  <View style={[styles.stackedCardIcon, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                    <TrendingUp color={COLORS.info} size={24} />
                  </View>
                  <View style={styles.stackedCardContent}>
                    <Text style={[styles.stackedCardTitle, { color: colors.text }]}>Competitive Intelligence</Text>
                    <Text style={[styles.stackedCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                      Market position & strategy
                    </Text>
                  </View>
                </View>
                {selectedSection === 'competitiveIntel' ? (
                  <ChevronDown color={COLORS.info} size={20} />
                ) : (
                  <ChevronRight color={colors.textTertiary} size={20} />
                )}
              </TouchableOpacity>
              {selectedSection === 'competitiveIntel' && (
                <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                  {/* Market Position */}
                  {competitiveIntelligence.market_position && (
                    <View style={styles.expandedSection}>
                      <Text style={[styles.expandedSectionTitle, { color: COLORS.info }]}>Market Position</Text>
                      <Text style={[styles.expandedText, { color: colors.textSecondary }]}>
                        {competitiveIntelligence.market_position}
                      </Text>
                    </View>
                  )}

                  {/* Competitive Advantages */}
                  {competitiveIntelligence.competitive_advantages && competitiveIntelligence.competitive_advantages.length > 0 && (
                    <View style={styles.expandedSection}>
                      <Text style={[styles.expandedSectionTitle, { color: COLORS.success }]}>Competitive Advantages</Text>
                      {competitiveIntelligence.competitive_advantages.map((item: string, index: number) => (
                        <View key={index} style={styles.bulletItem}>
                          <CheckCircle color={COLORS.success} size={14} style={{ marginTop: 3, marginRight: SPACING.sm }} />
                          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Challenges */}
                  {competitiveIntelligence.challenges && competitiveIntelligence.challenges.length > 0 && (
                    <View style={styles.expandedSection}>
                      <Text style={[styles.expandedSectionTitle, { color: COLORS.warning }]}>Key Challenges</Text>
                      {competitiveIntelligence.challenges.map((item: string, index: number) => (
                        <View key={index} style={styles.bulletItem}>
                          <View style={[styles.bulletDot, { backgroundColor: COLORS.warning }]} />
                          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Differentiation Strategy */}
                  {competitiveIntelligence.differentiation_strategy && (
                    <View style={styles.expandedSection}>
                      <Text style={[styles.expandedSectionTitle, { color: COLORS.primary }]}>Differentiation Strategy</Text>
                      <Text style={[styles.expandedText, { color: colors.textSecondary }]}>
                        {competitiveIntelligence.differentiation_strategy}
                      </Text>
                    </View>
                  )}

                  {/* Interview Angles */}
                  {competitiveIntelligence.interview_angles && competitiveIntelligence.interview_angles.length > 0 && (
                    <View style={styles.expandedSection}>
                      <Text style={[styles.expandedSectionTitle, { color: COLORS.purple }]}>Interview Talking Points</Text>
                      {competitiveIntelligence.interview_angles.map((item: string, index: number) => (
                        <View key={index} style={styles.bulletItem}>
                          <MessageCircle color={COLORS.purple} size={14} style={{ marginTop: 3, marginRight: SPACING.sm }} />
                          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </GlassCard>
          )}

          {loadingCompetitiveIntelligence && !competitiveIntelligence && (
            <GlassCard padding={SPACING.lg} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
              <View style={{ alignItems: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.info} />
                <Text style={[styles.loadingText, { color: colors.textSecondary, fontSize: 12 }]}>
                  Loading competitive intelligence...
                </Text>
              </View>
            </GlassCard>
          )}

          {/* Role & Preparation Section */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ROLE & PREPARATION</Text>

          {/* Role Analysis Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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
                    {(() => {
                      const stats = getProgressStats();
                      const total = stats.researchTotal + stats.checklistTotal;
                      const done = stats.researchCompleted + stats.checklistCompleted;
                      return `${done}/${total} tasks completed`;
                    })()}
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
                    {interview_preparation.research_tasks.map((task: string, index: number) => {
                      const itemId = `research-${index}`;
                      const isChecked = !!checkedItems[itemId];
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.checklistItem}
                          onPress={() => toggleCheck(itemId)}
                          activeOpacity={0.7}
                        >
                          {isChecked ? (
                            <CheckSquare color={COLORS.success} size={20} />
                          ) : (
                            <Square color={colors.textTertiary} size={20} />
                          )}
                          <Text
                            style={[
                              styles.checklistText,
                              { color: colors.textSecondary },
                              isChecked && styles.checklistTextChecked,
                            ]}
                          >
                            {task}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                {interview_preparation?.day_of_checklist && interview_preparation.day_of_checklist.length > 0 && (
                  <View style={styles.expandedSection}>
                    <Text style={[styles.expandedSectionTitle, { color: colors.text }]}>Day-of Checklist</Text>
                    {interview_preparation.day_of_checklist.map((item: string, index: number) => {
                      const itemId = `checklist-${index}`;
                      const isChecked = !!checkedItems[itemId];
                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.checklistItem}
                          onPress={() => toggleCheck(itemId)}
                          activeOpacity={0.7}
                        >
                          {isChecked ? (
                            <CheckSquare color={COLORS.success} size={20} />
                          ) : (
                            <Square color={colors.textTertiary} size={20} />
                          )}
                          <Text
                            style={[
                              styles.checklistText,
                              { color: colors.textSecondary },
                              isChecked && styles.checklistTextChecked,
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                {renderNotesEditor('preparation')}
              </View>
            )}
          </GlassCard>

          {/* Questions to Ask Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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

                {/* Custom Questions */}
                {customQuestions.length > 0 && (
                  <View style={[styles.expandedSection, { marginTop: SPACING.md }]}>
                    <Text style={[styles.expandedSectionTitle, { color: COLORS.primary }]}>Your Questions</Text>
                    {customQuestions.map((q) => (
                      <View key={q.id} style={styles.customQuestionItem}>
                        <View style={styles.customQuestionLeft}>
                          <View style={[styles.customQuestionCategoryBadge, { backgroundColor: `${COLORS.primary}20` }]}>
                            <Text style={[styles.customQuestionCategoryText, { color: COLORS.primary }]}>{q.category}</Text>
                          </View>
                          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{q.question}</Text>
                        </View>
                        <TouchableOpacity onPress={() => deleteCustomQuestion(q.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <Trash2 color={COLORS.error} size={16} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Add Custom Question */}
                {showAddQuestion ? (
                  <View style={[styles.addQuestionForm, { borderColor: colors.border }]}>
                    <TextInput
                      style={[styles.addQuestionInput, { color: colors.text, borderColor: colors.border }]}
                      value={newQuestion}
                      onChangeText={setNewQuestion}
                      placeholder="Type your question..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                    />
                    <View style={styles.addQuestionCategoryRow}>
                      {['product', 'team', 'culture', 'performance', 'strategy'].map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryChip,
                            { backgroundColor: newQuestionCategory === cat ? `${COLORS.primary}20` : colors.backgroundTertiary },
                          ]}
                          onPress={() => setNewQuestionCategory(cat)}
                        >
                          <Text
                            style={[
                              styles.categoryChipText,
                              { color: newQuestionCategory === cat ? COLORS.primary : colors.textSecondary },
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <View style={styles.addQuestionActions}>
                      <TouchableOpacity
                        style={[styles.addQuestionSave, { backgroundColor: COLORS.primary }]}
                        onPress={addCustomQuestion}
                      >
                        <Text style={styles.addQuestionSaveText}>Add</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addQuestionCancel}
                        onPress={() => { setShowAddQuestion(false); setNewQuestion(''); }}
                      >
                        <Text style={[styles.addQuestionCancelText, { color: colors.textSecondary }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.addQuestionButton, { borderColor: colors.border }]}
                    onPress={() => setShowAddQuestion(true)}
                  >
                    <Plus color={COLORS.primary} size={18} />
                    <Text style={[styles.addQuestionButtonText, { color: COLORS.primary }]}>Add Your Question</Text>
                  </TouchableOpacity>
                )}

                {renderNotesEditor('questions')}
              </View>
            )}
          </GlassCard>

          {/* Candidate Positioning Card + Expandable */}
          <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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
                          <View style={[styles.starHintContainer, { borderTopColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] }]}>
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
                      {starStoryCount > 0 && (
                        <View style={[styles.storyCountBadge, { backgroundColor: '#10b981' }]}>
                          <Text style={styles.storyCountText}>{starStoryCount}</Text>
                        </View>
                      )}
                      <ChevronRight color="#10b981" size={18} />
                    </TouchableOpacity>
                    {starStoryCount > 0 && (
                      <TouchableOpacity
                        style={[styles.viewStoriesLink]}
                        onPress={() => navigation.navigate('StarStories' as any, { tailoredResumeId })}
                      >
                        <Text style={[styles.viewStoriesText, { color: COLORS.primary }]}>
                          View {starStoryCount} saved {starStoryCount === 1 ? 'story' : 'stories'}
                        </Text>
                        <ChevronRight color={COLORS.primary} size={14} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            )}
          </GlassCard>

          {/* AI Practice Section */}
          {interviewPrepId && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>AI PRACTICE</Text>

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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

              <GlassCard padding={0} material="thin" borderRadius={RADIUS.lg} style={styles.individualCard}>
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
    ...TYPOGRAPHY.callout,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -SPACING.sm,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  actionButtonFlex: {
    flex: 1,
  },
  jobCard: {
    borderRadius: SPACING.radiusMD,
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
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
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
    borderRadius: RADIUS.lg, // Standardized to 16px
    overflow: 'hidden',
  },
  stackedCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenMargin,
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
    borderRadius: SPACING.radiusMD,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  stackedCardContent: {
    flex: 1,
  },
  stackedCardTitle: {
    ...TYPOGRAPHY.headline,
  },
  stackedCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stackedCardSubtitle: {
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.caption2,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Expanded content styles for inline card expansion
  expandedContent: {
    borderTopWidth: 1,
    paddingHorizontal: SPACING.screenMargin,
    paddingVertical: SPACING.lg,
  },
  expandedText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  expandedLabel: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginRight: SPACING.sm,
  },
  expandedValue: {
    ...TYPOGRAPHY.subhead,
    flex: 1,
  },
  expandedSection: {
    marginBottom: SPACING.md,
  },
  expandedSectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
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
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.caption1,
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
    ...TYPOGRAPHY.subhead,
    marginBottom: 2,
  },
  jobTitle: {
    ...TYPOGRAPHY.headline,
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
    ...TYPOGRAPHY.caption1,
  },
  sectionCard: {
    borderRadius: SPACING.radiusMD,
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
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
  sectionContent: {
    paddingHorizontal: SPACING.screenMargin,
    paddingBottom: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  subsection: {
    marginTop: SPACING.md,
  },
  subsectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  overviewText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
    marginTop: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  infoLabel: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  infoValue: {
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueDescription: {
    ...TYPOGRAPHY.footnote,
    lineHeight: 18,
  },
  themeCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  themeName: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeRationale: {
    ...TYPOGRAPHY.footnote,
    lineHeight: 18,
  },
  techCard: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  techName: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.info,
    marginBottom: 4,
  },
  techDescription: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: 4,
  },
  newsDate: {
    ...TYPOGRAPHY.caption1,
    marginBottom: 4,
  },
  newsSource: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    marginBottom: 6,
  },
  newsSummary: {
    ...TYPOGRAPHY.footnote,
    lineHeight: 18,
  },
  newsImpact: {
    ...TYPOGRAPHY.caption1,
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
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  storyPromptDescription: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
    marginLeft: SPACING.sm,
  },
  keywordItem: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  keywordLabel: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  keywordContext: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.callout,
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
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
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
    ...TYPOGRAPHY.headline,
  },
  readinessLoader: {
    paddingVertical: SPACING.xl,
  },
  readinessSection: {
    marginBottom: SPACING.lg,
  },
  readinessSectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
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
    ...TYPOGRAPHY.subhead,
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
    // backgroundColor set dynamically for light/dark mode
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
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
    ...TYPOGRAPHY.headline,
  },
  valuesLoader: {
    paddingVertical: SPACING.xl,
  },
  valuesSection: {
    marginBottom: SPACING.lg,
  },
  valuesSectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  valuesMatchItem: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    // borderBottomColor set dynamically for light/dark mode
  },
  valuesMatchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  valuesMatchValue: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  valuesMatchContext: {
    ...TYPOGRAPHY.footnote,
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
    // borderBottomColor set dynamically for light/dark mode
  },
  valuesGapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  valuesGapValue: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  valuesGapContext: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.caption1,
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
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.headline,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  companyResearchInlineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  companyResearchText: {
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: 4,
  },
  companyResearchNewsDate: {
    ...TYPOGRAPHY.caption1,
    marginBottom: 6,
  },
  companyResearchNewsSummary: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  companyResearchCompetitorItem: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  companyResearchCompetitorName: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: 4,
  },
  companyResearchCompetitorContext: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.headline,
  },
  strategicNewsSubtitle: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
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
    // borderTopColor set dynamically for light/dark mode
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
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.headline,
  },
  competitiveSubtitle: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.headline,
  },
  strategySubtitle: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 18,
  },
  strategyStoryDescription: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.headline,
  },
  executiveSubtitle: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.subhead,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  strategyItemDesc: {
    ...TYPOGRAPHY.footnote,
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
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    marginRight: 4,
  },
  relevanceText: {
    flex: 1,
    ...TYPOGRAPHY.caption1,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
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
    ...TYPOGRAPHY.caption1,
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
    ...TYPOGRAPHY.caption1,
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
    ...TYPOGRAPHY.subhead,
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
    // borderTopColor set dynamically for light/dark mode
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
    ...TYPOGRAPHY.caption1,
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
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    flex: 1,
  },
  storyCountBadge: {
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  storyCountText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: FONTS.semibold,
  },
  viewStoriesLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  viewStoriesText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
  },
  // Header actions
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 4,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Progress Dashboard
  progressDashboard: {
    marginBottom: SPACING.md,
  },
  countdownRow: {
    marginBottom: SPACING.md,
  },
  countdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  countdownContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  countdownNumber: {
    fontSize: 28,
    fontFamily: FONTS.bold,
  },
  countdownLabel: {
    ...TYPOGRAPHY.subhead,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  dateInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    fontFamily: FONTS.regular,
    fontSize: 14,
  },
  dateInputSave: {
    height: 40,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateInputSaveText: {
    color: '#fff',
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },
  dateInputClear: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarsContainer: {
    gap: SPACING.md,
  },
  progressBarSection: {
    gap: 6,
  },
  progressBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBarLabel: {
    ...TYPOGRAPHY.caption1,
    fontFamily: FONTS.medium,
  },
  progressBarCount: {
    ...TYPOGRAPHY.caption1,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Checklist items
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    paddingVertical: 4,
  },
  checklistText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
    flex: 1,
  },
  checklistTextChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  // Notes
  notesToggleButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notesContainer: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  notesLabel: {
    ...TYPOGRAPHY.caption1,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
  },
  notesInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  // Custom Questions
  customQuestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  customQuestionLeft: {
    flex: 1,
    gap: 4,
  },
  customQuestionCategoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  customQuestionCategoryText: {
    ...TYPOGRAPHY.caption2,
    fontFamily: FONTS.medium,
    textTransform: 'capitalize',
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  addQuestionButtonText: {
    ...TYPOGRAPHY.subhead,
    fontFamily: FONTS.medium,
  },
  addQuestionForm: {
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  addQuestionInput: {
    minHeight: 60,
    borderWidth: 1,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    fontFamily: FONTS.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  addQuestionCategoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryChipText: {
    ...TYPOGRAPHY.caption1,
    fontFamily: FONTS.medium,
    textTransform: 'capitalize',
  },
  addQuestionActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  addQuestionSave: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  addQuestionSaveText: {
    color: '#fff',
    fontFamily: FONTS.semibold,
    fontSize: 14,
  },
  addQuestionCancel: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  addQuestionCancelText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
  },
});
