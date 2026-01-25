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
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

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

export default function PracticeQuestionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PracticeQuestionsRouteProp>();
  const { interviewPrepId, tailoredResumeId } = route.params;

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [starStories, setStarStories] = useState<Map<number, STARStory>>(new Map());
  const [generatingStory, setGeneratingStory] = useState<number | null>(null);
  const [savingResponse, setSavingResponse] = useState<number | null>(null);
  const [practiceStartTime, setPracticeStartTime] = useState<Map<number, number>>(new Map());
  const [userAnswers, setUserAnswers] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    loadPracticeQuestions();
  }, []);

  const loadPracticeQuestions = async () => {
    setLoading(true);
    try {
      const result = await api.generatePracticeQuestions(interviewPrepId, 10);
      if (result.success && result.data) {
        setQuestions(result.data.questions || []);
      } else {
        Alert.alert('Error', result.error || 'Failed to load practice questions');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      Alert.alert('Error', 'Failed to load practice questions');
    } finally {
      setLoading(false);
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
        interview_prep_id: interviewPrepId,
        question_text: question.question,
        question_category: question.category,
        star_story: starStory,
        written_answer: writtenAnswer,
        practice_duration_seconds: duration,
      });

      if (result.success) {
        Alert.alert('Success', 'Practice response saved successfully');
        // Clear practice time
        const newTimes = new Map(practiceStartTime);
        newTimes.delete(index);
        setPracticeStartTime(newTimes);
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
            <ArrowLeft color={COLORS.dark.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Practice Questions</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading practice questions...</Text>
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
          <ArrowLeft color={COLORS.dark.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Practice Questions</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.introCard}>
          <Sparkles color={COLORS.purple} size={24} />
          <Text style={styles.introTitle}>Job-Specific Practice</Text>
          <Text style={styles.introText}>
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

          return (
            <View key={index} style={styles.questionCard}>
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

                <Text style={styles.questionText}>{question.question}</Text>

                {isExpanded ? (
                  <ChevronUp color={COLORS.dark.textSecondary} size={20} />
                ) : (
                  <ChevronDown color={COLORS.dark.textSecondary} size={20} />
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.answerContent}>
                  {/* Why Asked */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Why This Question Is Asked</Text>
                    <Text style={styles.sectionText}>{question.why_asked}</Text>
                  </View>

                  {/* Key Skills */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Key Skills Tested</Text>
                    <View style={styles.skillsContainer}>
                      {question.key_skills_tested.map((skill, idx) => (
                        <View key={idx} style={styles.skillChip}>
                          <Text style={styles.skillText}>{skill}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* STAR Story */}
                  {isGeneratingStory && (
                    <View style={styles.generatingContainer}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.generatingText}>Generating STAR story...</Text>
                    </View>
                  )}

                  {starStory && (
                    <View style={styles.starContainer}>
                      <Text style={styles.starTitle}>AI-Generated STAR Story</Text>

                      <View style={styles.starSection}>
                        <Text style={styles.starLabel}>Situation</Text>
                        <Text style={styles.starText}>{starStory.situation}</Text>
                      </View>

                      <View style={styles.starSection}>
                        <Text style={styles.starLabel}>Task</Text>
                        <Text style={styles.starText}>{starStory.task}</Text>
                      </View>

                      <View style={styles.starSection}>
                        <Text style={styles.starLabel}>Action</Text>
                        <Text style={styles.starText}>{starStory.action}</Text>
                      </View>

                      <View style={styles.starSection}>
                        <Text style={styles.starLabel}>Result</Text>
                        <Text style={styles.starText}>{starStory.result}</Text>
                      </View>
                    </View>
                  )}

                  {/* Practice Area */}
                  <View style={styles.practiceSection}>
                    <Text style={styles.sectionTitle}>Your Answer</Text>
                    <TextInput
                      style={styles.answerInput}
                      placeholder="Write your answer here..."
                      placeholderTextColor={COLORS.dark.textTertiary}
                      multiline
                      numberOfLines={6}
                      value={userAnswers.get(index) || ''}
                      onChangeText={(text) => {
                        const newAnswers = new Map(userAnswers);
                        newAnswers.set(index, text);
                        setUserAnswers(newAnswers);
                      }}
                      onFocus={() => {
                        if (!isPracticing) {
                          startPractice(index);
                        }
                      }}
                    />

                    {isPracticing && (
                      <View style={styles.practiceTimer}>
                        <Clock color={COLORS.warning} size={14} />
                        <Text style={styles.timerText}>Practice in progress...</Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    {!starStory && !isGeneratingStory && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleGenerateStory(index)}
                        accessibilityRole="button"
                        accessibilityLabel="Generate STAR story"
                      >
                        <Sparkles color={COLORS.primary} size={16} />
                        <Text style={styles.actionButtonText}>Generate STAR Story</Text>
                      </TouchableOpacity>
                    )}

                    {!isPracticing && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                        onPress={() => startPractice(index)}
                        accessibilityRole="button"
                        accessibilityLabel="Start practice timer"
                      >
                        <Play color={COLORS.dark.background} size={16} />
                        <Text style={[styles.actionButtonText, { color: COLORS.dark.background }]}>
                          Start Practice
                        </Text>
                      </TouchableOpacity>
                    )}

                    {(starStory || userAnswers.get(index)) && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: COLORS.info }]}
                        onPress={() => handleSaveResponse(index)}
                        disabled={isSaving}
                        accessibilityRole="button"
                        accessibilityLabel="Save practice response"
                      >
                        {isSaving ? (
                          <ActivityIndicator size="small" color={COLORS.dark.background} />
                        ) : (
                          <Save color={COLORS.dark.background} size={16} />
                        )}
                        <Text style={[styles.actionButtonText, { color: COLORS.dark.background }]}>
                          {isSaving ? 'Saving...' : 'Save Response'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}

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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  introCard: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  introTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  introText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  questionCard: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
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
    backgroundColor: `${COLORS.info}20`,
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
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  answerContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
  },
  section: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: SPACING.xs,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillChip: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  skillText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.dark.text,
  },
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
  },
  generatingText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
  },
  starContainer: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  starTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  starSection: {
    marginBottom: SPACING.md,
  },
  starLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  starText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
  },
  practiceSection: {
    marginBottom: SPACING.md,
  },
  answerInput: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    padding: SPACING.md,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  practiceTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  timerText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
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
});
