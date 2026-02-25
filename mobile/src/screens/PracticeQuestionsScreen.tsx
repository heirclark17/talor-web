import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Play,
  Save,
  Clock,
  CheckCircle,
  History,
  Calendar,
  TrendingUp,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, PracticeHistoryItem } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { GlassButton } from '../components/glass/GlassButton';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PracticeQuestionsRouteProp = RouteProp<RootStackParamList, 'PracticeQuestions'>;

interface PracticeQuestion {
  question: string;
  category: string;
  difficulty: string;
  why_asked: string;
  key_skills_tested: string[];
}

interface STARStory {
  situation: string;
  task: string;
  action: string;
  result: string;
}

interface SavedPracticeResponse {
  id: number;
  question_text: string;
  question_category?: string;
  written_answer?: string;
  star_story?: STARStory;
  times_practiced: number;
  last_practiced_at: string;
}

export default function PracticeQuestionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PracticeQuestionsRouteProp>();
  const { colors, isDark } = useTheme();
  const { interviewPrepId, tailoredResumeId } = route.params;

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [starStories, setStarStories] = useState<Map<number, STARStory>>(new Map());
  const [generatingStory, setGeneratingStory] = useState<number | null>(null);
  const [savingResponse, setSavingResponse] = useState<number | null>(null);
  const [savedResponses, setSavedResponses] = useState<Map<number, boolean>>(new Map());
  const [practiceStartTime, setPracticeStartTime] = useState<Map<number, number>>(new Map());
  const [userAnswers, setUserAnswers] = useState<Map<number, string>>(new Map());

  // History tab state
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice');
  const [practiceHistory, setPracticeHistory] = useState<PracticeHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [expandedHistoryItem, setExpandedHistoryItem] = useState<number | null>(null);

  useEffect(() => {
    loadPracticeQuestions();
  }, []);

  useEffect(() => {
    if (activeTab === 'history') {
      loadPracticeHistory();
    }
  }, [activeTab]);

  const loadSavedResponses = async (loadedQuestions: PracticeQuestion[]) => {
    try {
      const result = await api.getPracticeResponses(interviewPrepId);
      if (result.success && result.data && Array.isArray(result.data)) {
        // Map saved responses to questions
        const savedMap = new Map<number, boolean>();
        const answersMap = new Map<number, string>();

        (result.data as SavedPracticeResponse[]).forEach((response) => {
          const questionIndex = loadedQuestions.findIndex(q => q.question === response.question_text);
          if (questionIndex !== -1) {
            savedMap.set(questionIndex, true);
            if (response.written_answer) {
              answersMap.set(questionIndex, response.written_answer);
            }
          }
        });

        setSavedResponses(savedMap);
        setUserAnswers(answersMap);
      }
    } catch (error) {
      console.error('Error loading saved responses:', error);
    }
  };

  const loadPracticeQuestions = async () => {
    console.log('=== PracticeQuestions: Starting to generate for interviewPrepId:', interviewPrepId);
    setLoading(true);
    try {
      const result = await api.generatePracticeQuestions(interviewPrepId, 10);
      console.log('=== PracticeQuestions API Result keys:', Object.keys(result.data || {}));
      console.log('=== PracticeQuestions API Result:', JSON.stringify(result, null, 2).slice(0, 1000));

      if (result.success && result.data) {
        // Handle nested data structure - API might return { success, data: { data: {...} } }
        const responseData = result.data.data || result.data;
        const loadedQuestions = responseData.questions || [];
        console.log('=== PracticeQuestions: Setting questions count:', loadedQuestions.length);
        setQuestions(loadedQuestions);
        // Load saved responses after questions are loaded
        await loadSavedResponses(loadedQuestions);
      } else {
        console.log('=== PracticeQuestions API Error:', result.error);
        Alert.alert('Error', result.error || 'Failed to load practice questions');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load practice questions');
    } finally {
      setLoading(false);
    }
  };

  const loadPracticeHistory = async () => {
    setLoadingHistory(true);
    try {
      const result = await api.getPracticeHistory(interviewPrepId);
      if (result.success && result.data) {
        setPracticeHistory(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load practice history');
      }
    } catch (error) {
      console.error('Error loading practice history:', error);
      Alert.alert('Error', 'Failed to load practice history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerateStory = async (index: number) => {
    setGeneratingStory(index);
    try {
      const question = questions[index];
      const result = await api.generatePracticeStarStory(interviewPrepId, question.question);

      if (result.success && result.data) {
        const newStarStories = new Map(starStories);
        newStarStories.set(index, result.data.star_story);
        setStarStories(newStarStories);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate STAR story');
      }
    } catch (error) {
      console.error('Error generating story:', error);
      Alert.alert('Error', 'Failed to generate STAR story');
    } finally {
      setGeneratingStory(null);
    }
  };

  const startPractice = (index: number) => {
    const newTimes = new Map(practiceStartTime);
    newTimes.set(index, Date.now());
    setPracticeStartTime(newTimes);
  };

  const handleSaveResponse = async (index: number) => {
    setSavingResponse(index);
    try {
      const question = questions[index];
      const starStory = starStories.get(index);
      const writtenAnswer = userAnswers.get(index);
      const startTime = practiceStartTime.get(index);
      const duration = startTime ? Math.floor((Date.now() - startTime) / 1000) : undefined;

      const result = await api.savePracticeResponse({
        interviewPrepId: interviewPrepId,
        questionText: question.question,
        questionCategory: question.category,
        starStory: starStory,
        writtenAnswer: writtenAnswer,
        practiceDurationSeconds: duration,
      });

      if (result.success) {
        // Mark as saved
        const newSaved = new Map(savedResponses);
        newSaved.set(index, true);
        setSavedResponses(newSaved);

        // Clear practice time
        const newTimes = new Map(practiceStartTime);
        newTimes.delete(index);
        setPracticeStartTime(newTimes);

        // Reload practice history if we're on that tab
        if (activeTab === 'history') {
          await loadPracticeHistory();
        }

        // Show success feedback
        Alert.alert(
          '✓ Response Saved',
          'Your practice response has been saved successfully.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to save response');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      Alert.alert('Error', 'Failed to save practice response');
    } finally {
      setSavingResponse(null);
    }
  };

  const toggleExpanded = (index: number) => {
    if (expandedQuestion === index) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(index);
      if (!starStories.has(index)) {
        handleGenerateStory(index);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Practice Questions</Text>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading practice questions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateCompletionStats = () => {
    const totalQuestions = questions.length;
    const practicedQuestions = practiceHistory.length;
    const percentage = totalQuestions > 0 ? Math.round((practicedQuestions / totalQuestions) * 100) : 0;

    return {
      total: totalQuestions,
      practiced: practicedQuestions,
      percentage,
    };
  };

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Practice Questions</Text>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.backgroundSecondary, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'practice' && { borderBottomColor: COLORS.primary },
          ]}
          onPress={() => setActiveTab('practice')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'practice' }}
        >
          <Play color={activeTab === 'practice' ? COLORS.primary : colors.textSecondary} size={18} />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'practice' ? COLORS.primary : colors.textSecondary }
          ]}>
            Practice
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'history' && { borderBottomColor: COLORS.primary },
          ]}
          onPress={() => setActiveTab('history')}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'history' }}
        >
          <History color={activeTab === 'history' ? COLORS.primary : colors.textSecondary} size={18} />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'history' ? COLORS.primary : colors.textSecondary }
          ]}>
            History {practiceHistory.length > 0 && `(${practiceHistory.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'practice' && (
          <>
            <View style={[styles.introCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <Sparkles color={COLORS.purple} size={24} />
              <Text style={[styles.introTitle, { color: colors.text }]}>Job-Specific Practice</Text>
              <Text style={[styles.introText, { color: colors.textSecondary }]}>
                These questions are tailored to this specific role. Practice with AI-generated STAR stories or
                write your own answers.
              </Text>
            </View>

        {questions.map((question, index) => {
          const isExpanded = expandedQuestion === index;
          const starStory = starStories.get(index);
          const isGeneratingStory = generatingStory === index;
          const isSaving = savingResponse === index;
          const isPracticing = practiceStartTime.has(index);
          const isSaved = savedResponses.get(index) || false;
          const answerLength = userAnswers.get(index)?.length || 0;

          return (
            <View key={index} style={[styles.questionCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <TouchableOpacity
                style={styles.questionHeader}
                onPress={() => toggleExpanded(index)}
                accessibilityRole="button"
                accessibilityLabel={`${question.question}, ${isExpanded ? 'expanded' : 'collapsed'}`}
              >
                <View style={styles.questionMeta}>
                  <View style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor:
                        question.difficulty === 'Hard'
                          ? `${COLORS.error}20`
                          : question.difficulty === 'Medium'
                          ? `${COLORS.warning}20`
                          : `${COLORS.success}20`,
                    },
                  ]}>
                    <Text style={[
                      styles.difficultyText,
                      {
                        color:
                          question.difficulty === 'Hard'
                            ? COLORS.error
                            : question.difficulty === 'Medium'
                            ? COLORS.warning
                            : COLORS.success,
                      },
                    ]}>
                      {question.difficulty}
                    </Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{question.category}</Text>
                  </View>
                </View>

                <Text style={[styles.questionText, { color: colors.text }]}>{question.question}</Text>

                {isExpanded ? (
                  <ChevronUp color={colors.textSecondary} size={20} />
                ) : (
                  <ChevronDown color={colors.textSecondary} size={20} />
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.answerContent}>
                  {/* Why Asked */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Why This Question Is Asked</Text>
                    <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{question.why_asked}</Text>
                  </View>

                  {/* Key Skills */}
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Skills Tested</Text>
                    <View style={styles.skillsContainer}>
                      {question.key_skills_tested.map((skill, idx) => (
                        <View key={idx} style={[styles.skillChip, { backgroundColor: colors.backgroundTertiary }]}>
                          <Text style={[styles.skillText, { color: colors.text }]}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* STAR Story */}
                  {isGeneratingStory && (
                    <View style={styles.generatingContainer}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={[styles.generatingText, { color: colors.textSecondary }]}>Generating STAR story...</Text>
                    </View>
                  )}

                  {starStory && (
                    <View style={[styles.starContainer, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={styles.starTitle}>AI-Generated STAR Story</Text>

                      <View style={styles.starSection}>
                        <Text style={[styles.starLabel, { color: colors.text }]}>Situation</Text>
                        <Text style={[styles.starText, { color: colors.textSecondary }]}>{starStory.situation}</Text>
                      </View>

                      <View style={styles.starSection}>
                        <Text style={[styles.starLabel, { color: colors.text }]}>Task</Text>
                        <Text style={[styles.starText, { color: colors.textSecondary }]}>{starStory.task}</Text>
                      </View>

                      <View style={styles.starSection}>
                        <Text style={[styles.starLabel, { color: colors.text }]}>Action</Text>
                        <Text style={[styles.starText, { color: colors.textSecondary }]}>{starStory.action}</Text>
                      </View>

                      <View style={styles.starSection}>
                        <Text style={[styles.starLabel, { color: colors.text }]}>Result</Text>
                        <Text style={[styles.starText, { color: colors.textSecondary }]}>{starStory.result}</Text>
                      </View>
                    </View>
                  )}

                  {/* Practice Area */}
                  <View style={styles.practiceSection}>
                    <View style={styles.practiceSectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Answer</Text>
                      {isSaved && (
                        <View style={styles.savedBadge}>
                          <CheckCircle color={COLORS.success} size={14} />
                          <Text style={styles.savedBadgeText}>Saved</Text>
                        </View>
                      )}
                    </View>
                    <TextInput
                      style={[styles.answerInput, { backgroundColor: colors.backgroundTertiary, borderColor: isSaved ? COLORS.success : colors.border, color: colors.text }]}
                      placeholder="Write your answer here..."
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={6}
                      value={userAnswers.get(index) || ''}
                      onChangeText={(text) => {
                        const newAnswers = new Map(userAnswers);
                        newAnswers.set(index, text);
                        setUserAnswers(newAnswers);
                        // Clear saved status when user edits
                        if (isSaved) {
                          const newSaved = new Map(savedResponses);
                          newSaved.set(index, false);
                          setSavedResponses(newSaved);
                        }
                      }}
                      onFocus={() => {
                        if (!isPracticing) {
                          startPractice(index);
                        }
                      }}
                    />

                    <View style={styles.practiceFooter}>
                      {isPracticing && (
                        <View style={styles.practiceTimer}>
                          <Clock color={COLORS.warning} size={14} />
                          <Text style={styles.timerText}>Practice in progress...</Text>
                        </View>
                      )}
                      {answerLength > 0 && (
                        <Text style={[styles.characterCounter, { color: colors.textTertiary }]}>
                          {answerLength} characters
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    {!starStory && !isGeneratingStory && (
                      <TouchableOpacity
                        style={[styles.actionButton, { borderColor: isDark ? COLORS.primary : 'transparent' }]}
                        onPress={() => handleGenerateStory(index)}
                        accessibilityRole="button"
                        accessibilityLabel="Generate STAR story"
                      >
                        <Sparkles color={COLORS.primary} size={16} />
                        <Text style={styles.actionButtonText}>Generate STAR Story</Text>
                      </TouchableOpacity>
                    )}

                    {!isPracticing && (
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onPress={() => startPractice(index)}
                        icon={<Play color="#ffffff" size={16} />}
                        label="Start Practice"
                      />
                    )}

                    {(starStory || userAnswers.get(index)) && (
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        onPress={() => handleSaveResponse(index)}
                        loading={isSaving}
                        disabled={isSaving}
                        icon={<Save color={colors.text} size={16} />}
                        label={isSaving ? 'Saving...' : 'Save Response'}
                      />
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}
          </>
        )}

        {activeTab === 'history' && (
          <>
            {/* Stats Card */}
            {practiceHistory.length > 0 && (
              <View style={[styles.statsCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <View style={styles.statRow}>
                  <View style={styles.statItem}>
                    <TrendingUp color={COLORS.success} size={20} />
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {calculateCompletionStats().percentage}%
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completion</Text>
                  </View>

                  <View style={styles.statItem}>
                    <CheckCircle color={COLORS.primary} size={20} />
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {practiceHistory.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Practiced</Text>
                  </View>

                  <View style={styles.statItem}>
                    <Calendar color={COLORS.warning} size={20} />
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      {questions.length}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
                  </View>
                </View>
              </View>
            )}

            {loadingHistory ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading practice history...
                </Text>
              </View>
            ) : practiceHistory.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <History color={colors.textTertiary} size={48} />
                <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Practice History</Text>
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  Start practicing questions to see your history here.
                </Text>
                <GlassButton
                  variant="primary"
                  size="md"
                  onPress={() => setActiveTab('practice')}
                  label="Start Practicing"
                  style={{ marginTop: SPACING.md }}
                />
              </View>
            ) : (
              <>
                {practiceHistory.map((item, index) => {
                  const isExpanded = expandedHistoryItem === index;

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.historyCard,
                        { backgroundColor: colors.glass, borderColor: colors.glassBorder },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.historyHeader}
                        onPress={() => setExpandedHistoryItem(isExpanded ? null : index)}
                        accessibilityRole="button"
                        accessibilityLabel={`Practice history item ${index + 1}`}
                      >
                        <View style={styles.historyHeaderTop}>
                          {item.question_category && (
                            <View style={[styles.categoryBadge, { marginBottom: SPACING.xs }]}>
                              <Text style={styles.categoryText}>{item.question_category}</Text>
                            </View>
                          )}
                          <View style={styles.historyMetaRow}>
                            <View style={styles.historyMetaItem}>
                              <Clock color={colors.textTertiary} size={12} />
                              <Text style={[styles.historyMetaText, { color: colors.textSecondary }]}>
                                {formatDate(item.practiced_at)}
                              </Text>
                            </View>
                            {item.duration_seconds && (
                              <View style={styles.historyMetaItem}>
                                <Text style={[styles.historyMetaText, { color: colors.textSecondary }]}>
                                  Duration: {formatDuration(item.duration_seconds)}
                                </Text>
                              </View>
                            )}
                            <View style={styles.historyMetaItem}>
                              <Text style={[styles.historyMetaText, { color: colors.textSecondary }]}>
                                Practiced {item.times_practiced}x
                              </Text>
                            </View>
                          </View>
                        </View>

                        <Text style={[styles.historyQuestionText, { color: colors.text }]} numberOfLines={isExpanded ? undefined : 2}>
                          {item.question_text}
                        </Text>

                        {isExpanded ? (
                          <ChevronUp color={colors.textSecondary} size={20} style={styles.chevron} />
                        ) : (
                          <ChevronDown color={colors.textSecondary} size={20} style={styles.chevron} />
                        )}
                      </TouchableOpacity>

                      {isExpanded && (
                        <View style={styles.historyContent}>
                          {/* User's Written Response */}
                          {item.response_text && (
                            <View style={styles.historySection}>
                              <Text style={[styles.historySectionTitle, { color: colors.text }]}>
                                Your Response
                              </Text>
                              <Text style={[styles.historyResponseText, { color: colors.textSecondary }]}>
                                {item.response_text}
                              </Text>
                            </View>
                          )}

                          {/* STAR Story if available */}
                          {item.star_story && (
                            <View style={[styles.starContainer, { backgroundColor: colors.backgroundTertiary, marginTop: SPACING.md }]}>
                              <Text style={styles.starTitle}>STAR Story</Text>

                              <View style={styles.starSection}>
                                <Text style={[styles.starLabel, { color: colors.text }]}>Situation</Text>
                                <Text style={[styles.starText, { color: colors.textSecondary }]}>
                                  {item.star_story.situation}
                                </Text>
                              </View>

                              <View style={styles.starSection}>
                                <Text style={[styles.starLabel, { color: colors.text }]}>Task</Text>
                                <Text style={[styles.starText, { color: colors.textSecondary }]}>
                                  {item.star_story.task}
                                </Text>
                              </View>

                              <View style={styles.starSection}>
                                <Text style={[styles.starLabel, { color: colors.text }]}>Action</Text>
                                <Text style={[styles.starText, { color: colors.textSecondary }]}>
                                  {item.star_story.action}
                                </Text>
                              </View>

                              <View style={styles.starSection}>
                                <Text style={[styles.starLabel, { color: colors.text }]}>Result</Text>
                                <Text style={[styles.starText, { color: colors.textSecondary }]}>
                                  {item.star_story.result}
                                </Text>
                              </View>
                            </View>
                          )}

                          {/* Practice Again Button */}
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onPress={() => {
                              setActiveTab('practice');
                              // Find the question in the practice list
                              const questionIndex = questions.findIndex(
                                q => q.question === item.question_text
                              );
                              if (questionIndex !== -1) {
                                setExpandedQuestion(questionIndex);
                              }
                            }}
                            icon={<Play color={colors.text} size={16} />}
                            label="Practice Again"
                            style={{ marginTop: SPACING.md }}
                          />
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            )}
          </>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  introCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  introText: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
    lineHeight: 20,
  },
  questionCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  questionHeader: {
    padding: SPACING.lg,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  difficultyText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
  },
  categoryBadge: {
    backgroundColor: ALPHA_COLORS.info.bg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.info,
  },
  questionText: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  answerContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sectionText: {
    ...TYPOGRAPHY.subhead,
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
    borderRadius: RADIUS.sm,
  },
  skillText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
  },
  generatingText: {
    ...TYPOGRAPHY.subhead,
  },
  starContainer: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  starTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  starSection: {
    marginBottom: SPACING.md,
  },
  starLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  starText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  practiceSection: {
    marginBottom: SPACING.md,
  },
  practiceSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  savedBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.success,
  },
  answerInput: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    ...TYPOGRAPHY.subhead,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  practiceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  practiceTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  timerText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
  },
  characterCounter: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  statsCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statValue: {
    fontSize: 24,
    fontFamily: FONTS.bold,
  },
  statLabel: {
    ...TYPOGRAPHY.caption1,
  },
  emptyState: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.headline,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateText: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
    lineHeight: 20,
  },
  historyCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  historyHeader: {
    padding: SPACING.lg,
  },
  historyHeaderTop: {
    marginBottom: SPACING.sm,
  },
  historyMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  historyMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyMetaText: {
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  historyQuestionText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    lineHeight: 21,
    marginTop: SPACING.xs,
  },
  chevron: {
    marginTop: SPACING.xs,
    alignSelf: 'center',
  },
  historyContent: {
    padding: SPACING.lg,
    paddingTop: 0,
  },
  historySection: {
    marginBottom: SPACING.md,
  },
  historySectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  historyResponseText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
});
