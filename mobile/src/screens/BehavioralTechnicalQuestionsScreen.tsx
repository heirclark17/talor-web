import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Clipboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  RefreshCw,
  Brain,
  Code,
  ChevronDown,
  ChevronUp,
  Target,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Zap,
  BookOpen,
  Sparkles,
  Edit3,
  Save,
  Copy,
  X,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from '../components/glass/GlassCard';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type BehavioralTechnicalQuestionsRouteProp = RouteProp<RootStackParamList, 'BehavioralTechnicalQuestions'>;

interface StarPrompt {
  situation_hint: string;
  task_hint: string;
  action_hint: string;
  result_hint: string;
}

interface BehavioralQuestion {
  id: number;
  question: string;
  category: string;
  competency_tested: string;
  why_asked: string;
  difficulty: string;
  star_prompt: StarPrompt;
  key_themes: string[];
  common_mistakes: string[];
  job_alignment: string;
}

interface CandidateSkillLeverage {
  relevant_experience: string;
  talking_points: string[];
  skill_bridge: string;
}

interface TechnicalQuestion {
  id: number;
  question: string;
  category: string;
  technology_focus: string[];
  difficulty: string;
  expected_answer_points: string[];
  candidate_skill_leverage: CandidateSkillLeverage;
  follow_up_questions: string[];
  red_flags: string[];
  job_alignment: string;
}

interface TechStackAnalysis {
  company_technologies: string[];
  candidate_matching_skills: string[];
  skill_gaps: string[];
  transferable_skills: Array<{
    candidate_skill: string;
    applies_to: string;
    how_to_discuss: string;
  }>;
}

interface QuestionsData {
  company_name: string;
  job_title: string;
  company_tech_stack: Record<string, string[]>;
  behavioral: {
    questions: BehavioralQuestion[];
    preparation_tips: string[];
    company_context: string;
  };
  technical: {
    tech_stack_analysis: TechStackAnalysis;
    questions: TechnicalQuestion[];
    preparation_strategy: {
      high_priority_topics: string[];
      recommended_study_areas: string[];
      hands_on_practice: string[];
    };
  };
  summary: {
    total_questions: number;
    behavioral_count: number;
    technical_count: number;
    skill_matches: number;
    skill_gaps: number;
  };
}

type TabType = 'behavioral' | 'technical';

interface StarStory {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export default function BehavioralTechnicalQuestionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BehavioralTechnicalQuestionsRouteProp>();
  const { colors, isDark } = useTheme();
  const { interviewPrepId } = route.params;

  const [data, setData] = useState<QuestionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('behavioral');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // AI STAR story states
  const [aiGeneratingStory, setAiGeneratingStory] = useState<Record<string, boolean>>({});
  const [aiGeneratedStories, setAiGeneratedStories] = useState<Record<string, StarStory>>({});

  // User-edited STAR stories
  const [starStories, setStarStories] = useState<Record<string, StarStory>>({});
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [savingStory, setSavingStory] = useState(false);

  useEffect(() => {
    loadCachedOrGenerate();
    loadSavedStories();
  }, []);

  // Try loading cached data first (like web), fall back to generating
  const loadCachedOrGenerate = async () => {
    try {
      // Check AsyncStorage cache first
      const cached = await AsyncStorage.getItem(`bt-questions-${interviewPrepId}`);
      if (cached) {
        const cachedData = JSON.parse(cached);
        if (cachedData?.behavioral?.questions?.length > 0) {
          console.log('[BT Questions] Loaded from cache');
          setData(cachedData);
          return;
        }
      }
    } catch (err) {
      console.log('[BT Questions] No cache found, generating...');
    }
    // No cache - generate fresh
    handleGenerateQuestions();
  };

  // Load saved STAR stories from backend first, fallback to AsyncStorage
  const loadSavedStories = async () => {
    try {
      // Try backend first (like web)
      const result = await api.getPracticeResponses(interviewPrepId);
      if (result.success && result.data) {
        const responses = Array.isArray(result.data) ? result.data : result.data?.responses || [];
        if (responses.length > 0) {
          const dbStories: Record<string, StarStory> = {};
          for (const r of responses) {
            const key = r.question_key || r.questionKey || `${r.question_category || r.questionCategory}_${r.id}`;
            const starStory = r.star_story || r.starStory;
            if (starStory) {
              dbStories[key] = {
                situation: starStory.situation || '',
                task: starStory.task || '',
                action: starStory.action || '',
                result: starStory.result || '',
              };
            }
          }
          if (Object.keys(dbStories).length > 0) {
            setStarStories(dbStories);
            setAiGeneratedStories(dbStories);
            // Sync to AsyncStorage as cache
            await AsyncStorage.setItem(`bt-questions-stories-${interviewPrepId}`, JSON.stringify(dbStories));
            return;
          }
        }
      }
    } catch (err) {
      // Fall through to AsyncStorage
    }
    // Fallback to AsyncStorage
    try {
      const saved = await AsyncStorage.getItem(`bt-questions-stories-${interviewPrepId}`);
      if (saved) {
        setStarStories(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved stories:', error);
    }
  };

  // Generate AI STAR story for a behavioral question
  const generateAiStarStory = useCallback(async (questionKey: string, questionText: string, forceRegenerate = false) => {
    // Don't regenerate if already exists (unless forced) or is being generated
    if (!forceRegenerate && (aiGeneratedStories[questionKey] || aiGeneratingStory[questionKey] || starStories[questionKey])) {
      return;
    }

    setAiGeneratingStory(prev => ({ ...prev, [questionKey]: true }));

    try {
      const result = await api.generatePracticeStarStory(interviewPrepId, questionText);
      if (result.success && result.data?.star_story) {
        const story = result.data.star_story;
        const storyData: StarStory = {
          situation: story.situation || '',
          task: story.task || '',
          action: story.action || '',
          result: story.result || '',
        };
        setAiGeneratedStories(prev => ({
          ...prev,
          [questionKey]: storyData,
        }));
        // Fire-and-forget: persist AI story to backend (like web)
        const questionType = questionKey.startsWith('behavioral_') ? 'behavioral' : 'technical';
        const questionId = parseInt(questionKey.split('_')[1]) || 0;
        api.saveQuestionStarStory({
          interviewPrepId,
          questionId,
          questionText,
          questionType,
          starStory: storyData,
          questionKey,
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to generate AI STAR story:', err);
      Alert.alert('Error', 'Failed to generate AI STAR story');
    } finally {
      setAiGeneratingStory(prev => ({ ...prev, [questionKey]: false }));
    }
  }, [interviewPrepId, aiGeneratedStories, aiGeneratingStory, starStories]);

  // Update STAR story field
  const updateStarStory = async (questionKey: string, field: keyof StarStory, value: string) => {
    const story = starStories[questionKey] || { situation: '', task: '', action: '', result: '' };
    const updated = { ...starStories, [questionKey]: { ...story, [field]: value } };
    setStarStories(updated);
    try {
      await AsyncStorage.setItem(`bt-questions-stories-${interviewPrepId}`, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving story to storage:', error);
    }
  };

  // Save STAR story to backend
  const saveStarStory = async (questionKey: string, questionText: string, questionType: 'behavioral' | 'technical') => {
    const story = starStories[questionKey];
    if (!story) return;

    setSavingStory(true);
    try {
      const questionId = parseInt(questionKey.split('_')[1]) || 0;
      const result = await api.saveQuestionStarStory({
        interviewPrepId,
        questionId,
        questionText,
        questionType,
        starStory: story,
        questionKey,
      });

      if (result.success) {
        setEditingQuestionId(null);
        Alert.alert('Success', 'STAR story saved successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save STAR story');
      }
    } catch (err) {
      console.error('Failed to save STAR story:', err);
      Alert.alert('Error', 'Failed to save STAR story');
    } finally {
      setSavingStory(false);
    }
  };

  // Copy AI story to editable fields
  const copyAiStoryToEdit = (questionKey: string) => {
    const aiStory = aiGeneratedStories[questionKey];
    if (aiStory) {
      setStarStories(prev => ({ ...prev, [questionKey]: { ...aiStory } }));
      setEditingQuestionId(questionKey);
    }
  };

  const handleGenerateQuestions = async () => {
    console.log('[BT Questions] Starting generation for interviewPrepId:', interviewPrepId);
    setGenerating(true);
    setError(null);
    try {
      const result = await api.generateBehavioralTechnicalQuestions(interviewPrepId);

      if (result.success && result.data) {
        // API returns { success, data: { success, data: {...} } } due to client wrapper
        // Check API-level success (like the web does)
        const apiResponse = result.data;
        if (apiResponse.success === false) {
          const errorMsg = apiResponse.error || apiResponse.detail || 'Failed to generate questions';
          console.error('[BT Questions] API error:', errorMsg);
          if (apiResponse.detail?.includes('not found')) {
            setError('Interview prep not found. The tailored resume may have been deleted. Please go back and create a new tailored resume.');
          } else {
            setError(errorMsg);
          }
          return;
        }

        const questionsData = apiResponse.data || apiResponse;
        console.log('[BT Questions] Generated:', {
          behavioral: questionsData?.behavioral?.questions?.length || 0,
          technical: questionsData?.technical?.questions?.length || 0,
        });
        setData(questionsData);

        // Cache to AsyncStorage for fast reload
        AsyncStorage.setItem(
          `bt-questions-${interviewPrepId}`,
          JSON.stringify(questionsData)
        ).catch(() => {});

        // Fire-and-forget: cache generated questions to backend (like web)
        api.cacheInterviewPrepData(interviewPrepId, {
          behavioral_technical_questions: questionsData,
        }).catch(() => {});
      } else {
        const errorMsg = result.error || result.data?.error || result.data?.detail || 'Failed to generate questions';
        console.error('[BT Questions] Error:', errorMsg);
        setError(errorMsg);
      }
    } catch (error: any) {
      console.error('[BT Questions] Exception:', error);
      setError(error.message || 'Failed to generate behavioral and technical questions');
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpanded = (type: string, id: number, questionText?: string) => {
    const key = `${type}_${id}`;
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
        // Auto-generate AI STAR story when expanding any question (like web)
        if (questionText) {
          generateAiStarStory(key, questionText);
        }
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return COLORS.success;
      case 'medium':
        return COLORS.warning;
      case 'hard':
        return COLORS.error;
      default:
        return COLORS.info;
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = { size: 14, color: COLORS.primary };
    if (category.includes('leadership') || category.includes('decision')) {
      return <Target {...iconProps} />;
    }
    if (category.includes('problem') || category.includes('debug')) {
      return <Lightbulb {...iconProps} />;
    }
    if (category.includes('security') || category.includes('architecture')) {
      return <Code {...iconProps} />;
    }
    return <Brain {...iconProps} />;
  };

  if (generating) {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Interview Questions</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Generating your questions...</Text>
          <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
            Researching company tech stack and creating personalized questions
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error or empty state with retry button (like web's Generate button)
  if (!data && !generating) {
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Interview Questions</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconRow}>
            <Brain color={COLORS.purple} size={48} />
            <Code color={COLORS.primary} size={48} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Behavioral & Technical Questions
          </Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Generate 10 behavioral and 10 technical interview questions specifically aligned to this role.
            Includes STAR story prompts and tech stack analysis.
          </Text>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: `${COLORS.error}15` }]}>
              <AlertTriangle color={COLORS.error} size={18} />
              <Text style={[styles.errorBannerText, { color: COLORS.error }]}>{error}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateQuestions}
            activeOpacity={0.7}
          >
            <Sparkles color="#fff" size={20} />
            <Text style={styles.generateButtonText}>Generate Questions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Interview Questions</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleGenerateQuestions}
          disabled={generating}
          accessibilityRole="button"
          accessibilityLabel="Regenerate questions"
        >
          <RefreshCw color={COLORS.primary} size={20} />
        </TouchableOpacity>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: colors.glass, borderColor: isDark ? colors.border : 'transparent' }, activeTab === 'behavioral' && styles.activeTab]}
          onPress={() => setActiveTab('behavioral')}
          accessibilityRole="tab"
          accessibilityLabel={`Behavioral questions, ${data?.behavioral?.questions?.length || 0} questions`}
          accessibilityState={{ selected: activeTab === 'behavioral' }}
          accessibilityHint="View behavioral interview questions"
        >
          <Brain
            color={activeTab === 'behavioral' ? COLORS.primary : colors.textSecondary}
            size={18}
          />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'behavioral' && styles.activeTabText]}>
            Behavioral ({data?.behavioral?.questions?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, { backgroundColor: colors.glass, borderColor: isDark ? colors.border : 'transparent' }, activeTab === 'technical' && styles.activeTab]}
          onPress={() => setActiveTab('technical')}
          accessibilityRole="tab"
          accessibilityLabel={`Technical questions, ${data?.technical?.questions?.length || 0} questions`}
          accessibilityState={{ selected: activeTab === 'technical' }}
          accessibilityHint="View technical interview questions"
        >
          <Code
            color={activeTab === 'technical' ? COLORS.primary : colors.textSecondary}
            size={18}
          />
          <Text style={[styles.tabText, { color: colors.textSecondary }, activeTab === 'technical' && styles.activeTabText]}>
            Technical ({data?.technical?.questions?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Summary Card */}
        {data?.summary && (
          <View style={[styles.summaryCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{data.summary.total_questions}</Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Questions</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: COLORS.success }]}>
                  {data.summary.skill_matches}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Skill Matches</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: COLORS.warning }]}>
                  {data.summary.skill_gaps}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Skill Gaps</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'behavioral' ? (
          <>
            {/* Behavioral Context */}
            {data?.behavioral?.company_context && (
              <View style={styles.contextCard}>
                <View style={styles.contextHeader}>
                  <BookOpen color={COLORS.info} size={16} />
                  <Text style={styles.contextTitle}>Company Context</Text>
                </View>
                <Text style={[styles.contextText, { color: colors.text }]}>{data.behavioral.company_context}</Text>
              </View>
            )}

            {/* Behavioral Questions */}
            {data?.behavioral?.questions?.map((question) => {
              const questionKey = `behavioral_${question.id}`;
              const isExpanded = expandedQuestions.has(questionKey);
              const aiStory = aiGeneratedStories[questionKey];
              const userStory = starStories[questionKey];
              const isGeneratingAi = aiGeneratingStory[questionKey];
              const isEditing = editingQuestionId === questionKey;
              return (
                <View key={questionKey} style={[styles.questionCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <TouchableOpacity
                    style={styles.questionHeader}
                    onPress={() => toggleExpanded('behavioral', question.id, question.question)}
                    accessibilityRole="button"
                    accessibilityLabel={`${question.question}, ${question.difficulty} difficulty, ${question.category.replace(/_/g, ' ')}`}
                    accessibilityHint={isExpanded ? "Collapse to hide answer details" : "Expand to view answer details and STAR framework"}
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <View style={styles.questionMeta}>
                      <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(question.difficulty)}20` }]}>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(question.difficulty) }]}>
                          {question.difficulty}
                        </Text>
                      </View>
                      <View style={styles.categoryBadge}>
                        {getCategoryIcon(question.category)}
                        <Text style={styles.categoryText}>
                          {question.category.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.questionRow}>
                      <Text style={[styles.questionText, { color: colors.text }]}>{question.question}</Text>
                      {isExpanded ? (
                        <ChevronUp color={colors.textSecondary} size={20} />
                      ) : (
                        <ChevronDown color={colors.textSecondary} size={20} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.answerContent}>
                      {/* Competency Tested */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Target color={COLORS.primary} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>Competency Tested</Text>
                        </View>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{question.competency_tested}</Text>
                      </View>

                      {/* Why Asked */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Lightbulb color={COLORS.info} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>Why It's Asked</Text>
                        </View>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{question.why_asked}</Text>
                      </View>

                      {/* STAR Prompt */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Zap color={COLORS.warning} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>STAR Framework Hints</Text>
                        </View>
                        <View style={[styles.starContainer, { backgroundColor: colors.backgroundTertiary }]}>
                          <View style={styles.starItem}>
                            <Text style={styles.starLabel}>S - Situation</Text>
                            <Text style={[styles.starHint, { color: colors.text }]}>{question.star_prompt.situation_hint}</Text>
                          </View>
                          <View style={styles.starItem}>
                            <Text style={styles.starLabel}>T - Task</Text>
                            <Text style={[styles.starHint, { color: colors.text }]}>{question.star_prompt.task_hint}</Text>
                          </View>
                          <View style={styles.starItem}>
                            <Text style={styles.starLabel}>A - Action</Text>
                            <Text style={[styles.starHint, { color: colors.text }]}>{question.star_prompt.action_hint}</Text>
                          </View>
                          <View style={styles.starItem}>
                            <Text style={styles.starLabel}>R - Result</Text>
                            <Text style={[styles.starHint, { color: colors.text }]}>{question.star_prompt.result_hint}</Text>
                          </View>
                        </View>
                      </View>

                      {/* AI-Generated STAR Story */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Sparkles color={COLORS.purple} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI-Generated STAR Story</Text>
                          <View style={{ flex: 1 }} />
                          {aiStory && !isEditing && (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => copyAiStoryToEdit(questionKey)}
                              accessibilityRole="button"
                              accessibilityLabel="Edit AI-generated story"
                              accessibilityHint="Copy AI story to editable fields for customization"
                            >
                              <Edit3 color={COLORS.primary} size={14} />
                              <Text style={styles.actionButtonText}>Edit</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.actionButton, { marginLeft: SPACING.xs }]}
                            onPress={() => generateAiStarStory(questionKey, question.question, true)}
                            disabled={isGeneratingAi}
                            accessibilityRole="button"
                            accessibilityLabel={isGeneratingAi ? 'Generating AI story' : 'Regenerate AI story'}
                            accessibilityHint="Generate a new AI STAR story based on your resume"
                            accessibilityState={{ disabled: isGeneratingAi, busy: isGeneratingAi }}
                          >
                            <RefreshCw color={COLORS.info} size={14} />
                            <Text style={[styles.actionButtonText, { color: COLORS.info }]}>
                              {isGeneratingAi ? 'Generating...' : 'Regenerate'}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {isGeneratingAi ? (
                          <View style={[styles.aiStoryContainer, { backgroundColor: colors.backgroundTertiary }]}>
                            <ActivityIndicator size="small" color={COLORS.purple} />
                            <Text style={[styles.aiGeneratingText, { color: colors.textSecondary }]}>
                              Generating personalized STAR story based on your resume...
                            </Text>
                          </View>
                        ) : isEditing ? (
                          <View style={[styles.aiStoryContainer, { backgroundColor: colors.backgroundTertiary }]}>
                            <View style={styles.editStarItem}>
                              <Text style={styles.editStarLabel}>Situation</Text>
                              <TextInput
                                style={[styles.editStarInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                                value={userStory?.situation || ''}
                                onChangeText={(text) => updateStarStory(questionKey, 'situation', text)}
                                multiline
                                placeholder="Describe the context and situation..."
                                placeholderTextColor={colors.textTertiary}
                              />
                            </View>
                            <View style={styles.editStarItem}>
                              <Text style={styles.editStarLabel}>Task</Text>
                              <TextInput
                                style={[styles.editStarInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                                value={userStory?.task || ''}
                                onChangeText={(text) => updateStarStory(questionKey, 'task', text)}
                                multiline
                                placeholder="What was your responsibility?"
                                placeholderTextColor={colors.textTertiary}
                              />
                            </View>
                            <View style={styles.editStarItem}>
                              <Text style={styles.editStarLabel}>Action</Text>
                              <TextInput
                                style={[styles.editStarInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                                value={userStory?.action || ''}
                                onChangeText={(text) => updateStarStory(questionKey, 'action', text)}
                                multiline
                                placeholder="What specific actions did you take?"
                                placeholderTextColor={colors.textTertiary}
                              />
                            </View>
                            <View style={styles.editStarItem}>
                              <Text style={styles.editStarLabel}>Result</Text>
                              <TextInput
                                style={[styles.editStarInput, { color: colors.text, backgroundColor: colors.background, borderColor: colors.border }]}
                                value={userStory?.result || ''}
                                onChangeText={(text) => updateStarStory(questionKey, 'result', text)}
                                multiline
                                placeholder="What was the outcome?"
                                placeholderTextColor={colors.textTertiary}
                              />
                            </View>
                            <View style={styles.editButtonRow}>
                              <TouchableOpacity
                                style={[styles.cancelButton, { borderColor: isDark ? colors.border : 'transparent' }]}
                                onPress={() => setEditingQuestionId(null)}
                                accessibilityRole="button"
                                accessibilityLabel="Cancel editing"
                                accessibilityHint="Discard changes and exit edit mode"
                              >
                                <X color={colors.textSecondary} size={16} />
                                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.saveButton, savingStory && styles.saveButtonDisabled]}
                                onPress={() => saveStarStory(questionKey, question.question, 'behavioral')}
                                disabled={savingStory}
                                accessibilityRole="button"
                                accessibilityLabel={savingStory ? 'Saving story' : 'Save STAR story'}
                                accessibilityHint="Save your edited STAR story to the backend"
                                accessibilityState={{ disabled: savingStory, busy: savingStory }}
                              >
                                {savingStory ? (
                                  <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                  <>
                                    <Save color="#fff" size={16} />
                                    <Text style={styles.saveButtonText}>Save Story</Text>
                                  </>
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : aiStory ? (
                          <View style={[styles.aiStoryContainer, { backgroundColor: colors.backgroundTertiary }]}>
                            <View style={styles.aiStarItem}>
                              <Text style={styles.aiStarLabel}>S - Situation</Text>
                              <Text style={[styles.aiStarText, { color: colors.text }]}>{aiStory.situation}</Text>
                            </View>
                            <View style={styles.aiStarItem}>
                              <Text style={styles.aiStarLabel}>T - Task</Text>
                              <Text style={[styles.aiStarText, { color: colors.text }]}>{aiStory.task}</Text>
                            </View>
                            <View style={styles.aiStarItem}>
                              <Text style={styles.aiStarLabel}>A - Action</Text>
                              <Text style={[styles.aiStarText, { color: colors.text }]}>{aiStory.action}</Text>
                            </View>
                            <View style={styles.aiStarItem}>
                              <Text style={styles.aiStarLabel}>R - Result</Text>
                              <Text style={[styles.aiStarText, { color: colors.text }]}>{aiStory.result}</Text>
                            </View>
                          </View>
                        ) : userStory ? (
                          <View style={[styles.aiStoryContainer, { backgroundColor: colors.backgroundTertiary }]}>
                            <View style={styles.savedStoryHeader}>
                              <CheckCircle2 color={COLORS.success} size={14} />
                              <Text style={[styles.savedStoryLabel, { color: COLORS.success }]}>Your Saved Story</Text>
                              <TouchableOpacity
                                style={styles.editSavedButton}
                                onPress={() => setEditingQuestionId(questionKey)}
                                accessibilityRole="button"
                                accessibilityLabel="Edit saved story"
                                accessibilityHint="Modify your previously saved STAR story"
                              >
                                <Edit3 color={COLORS.primary} size={14} />
                              </TouchableOpacity>
                            </View>
                            <View style={styles.aiStarItem}>
                              <Text style={styles.aiStarLabel}>S - Situation</Text>
                              <Text style={[styles.aiStarText, { color: colors.text }]}>{userStory.situation}</Text>
                            </View>
                            <View style={styles.aiStarItem}>
                              <Text style={styles.aiStarLabel}>T - Task</Text>
                              <Text style={[styles.aiStarText, { color: colors.text }]}>{userStory.task}</Text>
                            </View>
                            <View style={styles.aiStarItem}>
                              <Text style={styles.aiStarLabel}>A - Action</Text>
                              <Text style={[styles.aiStarText, { color: colors.text }]}>{userStory.action}</Text>
                            </View>
                            <View style={styles.aiStarItem}>
                              <Text style={styles.aiStarLabel}>R - Result</Text>
                              <Text style={[styles.aiStarText, { color: colors.text }]}>{userStory.result}</Text>
                            </View>
                          </View>
                        ) : (
                          <View style={[styles.aiStoryContainer, { backgroundColor: colors.backgroundTertiary }]}>
                            <Text style={[styles.noStoryText, { color: colors.textSecondary }]}>
                              Tap "Regenerate" to generate a personalized STAR story based on your resume.
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* Key Themes */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <CheckCircle2 color={COLORS.success} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Themes to Address</Text>
                        </View>
                        <View style={styles.chipContainer}>
                          {question.key_themes.map((theme, idx) => (
                            <View key={idx} style={styles.chip}>
                              <Text style={styles.chipText}>{theme}</Text>
                            </View>
                          ))}
                        </View>
                      </View>

                      {/* Common Mistakes */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <AlertTriangle color={COLORS.error} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>Common Mistakes</Text>
                        </View>
                        {question.common_mistakes.map((mistake, idx) => (
                          <View key={idx} style={styles.mistakeItem}>
                            <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>*</Text>
                            <Text style={[styles.mistakeText, { color: colors.textSecondary }]}>{mistake}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Job Alignment */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Target color={COLORS.primary} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>Job Alignment</Text>
                        </View>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{question.job_alignment}</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        ) : (
          <>
            {/* Tech Stack Analysis */}
            {data?.technical?.tech_stack_analysis && (
              <View style={[styles.techStackCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.techStackTitle, { color: colors.text }]}>Tech Stack Analysis</Text>

                {data.technical.tech_stack_analysis.candidate_matching_skills?.length > 0 && (
                  <View style={styles.techSection}>
                    <Text style={[styles.techSectionTitle, { color: colors.textSecondary }]}>Your Matching Skills</Text>
                    <View style={styles.chipContainer}>
                      {data.technical.tech_stack_analysis.candidate_matching_skills.map((skill, idx) => (
                        <View key={idx} style={[styles.chip, styles.successChip]}>
                          <Text style={[styles.chipText, styles.successChipText]}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {data.technical.tech_stack_analysis.skill_gaps?.length > 0 && (
                  <View style={styles.techSection}>
                    <Text style={[styles.techSectionTitle, { color: colors.textSecondary }]}>Skill Gaps to Address</Text>
                    <View style={styles.chipContainer}>
                      {data.technical.tech_stack_analysis.skill_gaps.map((gap, idx) => (
                        <View key={idx} style={[styles.chip, styles.warningChip]}>
                          <Text style={[styles.chipText, styles.warningChipText]}>{gap}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Technical Questions */}
            {data?.technical?.questions?.map((question) => {
              const isExpanded = expandedQuestions.has(`technical_${question.id}`);
              return (
                <View key={`technical_${question.id}`} style={[styles.questionCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <TouchableOpacity
                    style={styles.questionHeader}
                    onPress={() => toggleExpanded('technical', question.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${question.question}, ${question.difficulty} difficulty, ${question.category.replace(/_/g, ' ')}`}
                    accessibilityHint={isExpanded ? "Collapse to hide answer details" : "Expand to view expected answers and skill leverage"}
                    accessibilityState={{ expanded: isExpanded }}
                  >
                    <View style={styles.questionMeta}>
                      <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(question.difficulty)}20` }]}>
                        <Text style={[styles.difficultyText, { color: getDifficultyColor(question.difficulty) }]}>
                          {question.difficulty}
                        </Text>
                      </View>
                      <View style={styles.categoryBadge}>
                        <Code color={COLORS.primary} size={14} />
                        <Text style={styles.categoryText}>
                          {question.category.replace(/_/g, ' ')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.questionRow}>
                      <Text style={[styles.questionText, { color: colors.text }]}>{question.question}</Text>
                      {isExpanded ? (
                        <ChevronUp color={colors.textSecondary} size={20} />
                      ) : (
                        <ChevronDown color={colors.textSecondary} size={20} />
                      )}
                    </View>
                    {/* Technology Focus */}
                    <View style={styles.techFocusContainer}>
                      {question.technology_focus.map((tech, idx) => (
                        <View key={idx} style={[styles.techFocusChip, { backgroundColor: colors.backgroundTertiary }]}>
                          <Text style={[styles.techFocusText, { color: colors.textSecondary }]}>{tech}</Text>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.answerContent}>
                      {/* Expected Answer Points */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <CheckCircle2 color={COLORS.success} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>Expected Answer Points</Text>
                        </View>
                        {question.expected_answer_points.map((point, idx) => (
                          <View key={idx} style={styles.answerPointItem}>
                            <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>*</Text>
                            <Text style={[styles.answerPointText, { color: colors.text }]}>{point}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Candidate Skill Leverage */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Zap color={COLORS.primary} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>Leverage Your Experience</Text>
                        </View>
                        <View style={styles.leverageBox}>
                          <Text style={[styles.leverageText, { color: colors.text }]}>
                            {question.candidate_skill_leverage.relevant_experience}
                          </Text>
                          {question.candidate_skill_leverage.talking_points?.length > 0 && (
                            <View style={styles.talkingPointsContainer}>
                              <Text style={styles.talkingPointsTitle}>Key Talking Points:</Text>
                              {question.candidate_skill_leverage.talking_points.map((point, idx) => (
                                <View key={idx} style={styles.talkingPointItem}>
                                  <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>*</Text>
                                  <Text style={[styles.talkingPointText, { color: colors.text }]}>{point}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                          {question.candidate_skill_leverage.skill_bridge && (
                            <View style={styles.skillBridgeContainer}>
                              <Text style={styles.skillBridgeTitle}>Skill Bridge:</Text>
                              <Text style={[styles.skillBridgeText, { color: colors.text }]}>
                                {question.candidate_skill_leverage.skill_bridge}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Follow-up Questions */}
                      {question.follow_up_questions?.length > 0 && (
                        <View style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <Brain color={COLORS.info} size={16} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Likely Follow-ups</Text>
                          </View>
                          {question.follow_up_questions.map((followUp, idx) => (
                            <View key={idx} style={styles.followUpItem}>
                              <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>*</Text>
                              <Text style={[styles.followUpText, { color: colors.textSecondary }]}>{followUp}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Red Flags */}
                      {question.red_flags?.length > 0 && (
                        <View style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <AlertTriangle color={COLORS.error} size={16} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Avoid These Mistakes</Text>
                          </View>
                          {question.red_flags.map((flag, idx) => (
                            <View key={idx} style={styles.redFlagItem}>
                              <Text style={[styles.bulletDot, { color: colors.textSecondary }]}>*</Text>
                              <Text style={styles.redFlagText}>{flag}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Job Alignment */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Target color={COLORS.primary} size={16} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>Job Alignment</Text>
                        </View>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{question.job_alignment}</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Preparation Strategy */}
            {data?.technical?.preparation_strategy && (
              <View style={[styles.prepStrategyCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Text style={[styles.prepStrategyTitle, { color: colors.text }]}>Preparation Strategy</Text>

                {data.technical.preparation_strategy.high_priority_topics?.length > 0 && (
                  <View style={styles.prepSection}>
                    <Text style={styles.prepSectionTitle}>High Priority Topics</Text>
                    {data.technical.preparation_strategy.high_priority_topics.map((topic, idx) => (
                      <View key={idx} style={styles.prepItem}>
                        <Text style={styles.prepNumber}>{idx + 1}</Text>
                        <Text style={[styles.prepText, { color: colors.text }]}>{topic}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {data.technical.preparation_strategy.hands_on_practice?.length > 0 && (
                  <View style={styles.prepSection}>
                    <Text style={styles.prepSectionTitle}>Hands-On Practice</Text>
                    {data.technical.preparation_strategy.hands_on_practice.map((practice, idx) => (
                      <View key={idx} style={styles.prepItem}>
                        <Text style={styles.prepNumber}>{idx + 1}</Text>
                        <Text style={[styles.prepText, { color: colors.text }]}>{practice}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
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
    ...TYPOGRAPHY.headline,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.lg,
    ...TYPOGRAPHY.headline,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: SPACING.sm,
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: ALPHA_COLORS.primary.bg,
    borderColor: COLORS.primary,
  },
  tabText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  summaryCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  summaryLabel: {
    ...TYPOGRAPHY.caption1,
    marginTop: 4,
  },
  contextCard: {
    backgroundColor: ALPHA_COLORS.info.bg,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: ALPHA_COLORS.info.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  contextTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.info,
  },
  contextText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  techStackCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  techStackTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  techSection: {
    marginBottom: SPACING.md,
  },
  techSectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
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
    gap: SPACING.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: ALPHA_COLORS.primary.bg,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.semibold,
    lineHeight: 22,
  },
  techFocusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  techFocusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  techFocusText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  answerContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  sectionText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  starContainer: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  starItem: {
    marginBottom: SPACING.sm,
  },
  starLabel: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.warning,
    marginBottom: 4,
  },
  starHint: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    backgroundColor: ALPHA_COLORS.primary.bg,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  chipText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  successChip: {
    backgroundColor: ALPHA_COLORS.success.bg,
  },
  successChipText: {
    color: COLORS.success,
  },
  warningChip: {
    backgroundColor: ALPHA_COLORS.warning.bg,
  },
  warningChipText: {
    color: COLORS.warning,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  bulletDot: {
    fontSize: 14,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  mistakeText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  answerPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  answerPointText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  leverageBox: {
    backgroundColor: ALPHA_COLORS.primary.bg,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: SPACING.md,
  },
  leverageText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  talkingPointsContainer: {
    marginTop: SPACING.sm,
  },
  talkingPointsTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  talkingPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  talkingPointText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  skillBridgeContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: ALPHA_COLORS.primary.border,
  },
  skillBridgeTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  skillBridgeText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  followUpText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  redFlagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  redFlagText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    color: COLORS.error,
    lineHeight: 20,
  },
  prepStrategyCard: {
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  prepStrategyTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  prepSection: {
    marginBottom: SPACING.md,
  },
  prepSectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  prepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  prepNumber: {
    width: 20,
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  prepText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  // AI STAR Story styles
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    backgroundColor: ALPHA_COLORS.primary.bg,
  },
  actionButtonText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  aiStoryContainer: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  aiGeneratingText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  aiStarItem: {
    marginBottom: SPACING.md,
  },
  aiStarLabel: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.purple,
    marginBottom: 4,
  },
  aiStarText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  noStoryText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  editStarItem: {
    marginBottom: SPACING.md,
  },
  editStarLabel: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.purple,
    marginBottom: 6,
  },
  editStarInput: {
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    ...TYPOGRAPHY.subhead,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editButtonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.success,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: '#fff',
  },
  savedStoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  savedStoryLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    flex: 1,
  },
  editSavedButton: {
    padding: SPACING.xs,
  },
  // Empty/error state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.headline,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    width: '100%',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: '#fff',
  },
});
