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
  RefreshCw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CommonQuestionsRouteProp = RouteProp<RootStackParamList, 'CommonQuestions'>;

interface CommonQuestion {
  id: string;
  question: string;
  category: string;
  why_hard: string;
  common_mistakes: string[];
  exceptional_answer_builder: string;
  what_to_say_short: string;
  what_to_say_long: string;
}

export default function CommonQuestionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CommonQuestionsRouteProp>();
  const { interviewPrepId } = route.params;

  const [questions, setQuestions] = useState<CommonQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  useEffect(() => {
    handleGenerateQuestions();
  }, []);

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    try {
      const result = await api.generateCommonQuestions(interviewPrepId);
      if (result.success && result.data) {
        setQuestions(result.data.questions || []);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      Alert.alert('Error', 'Failed to generate common questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerateQuestion = async (questionId: string) => {
    setRegeneratingId(questionId);
    try {
      const result = await api.regenerateSingleQuestion({
        interview_prep_id: interviewPrepId,
        question_id: questionId,
      });

      if (result.success && result.data) {
        // Update the specific question in the list
        setQuestions(prevQuestions =>
          prevQuestions.map(q => (q.id === questionId ? result.data : q))
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to regenerate question');
      }
    } catch (error) {
      console.error('Error regenerating question:', error);
      Alert.alert('Error', 'Failed to regenerate question');
    } finally {
      setRegeneratingId(null);
    }
  };

  const toggleExpanded = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
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
            <ArrowLeft color={COLORS.dark.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Common Questions</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Generating personalized answers...</Text>
          <Text style={styles.loadingSubtext}>
            Analyzing your background and the job requirements
          </Text>
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
        <Text style={styles.headerTitle}>Common Questions</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleGenerateQuestions}
          disabled={generating}
          accessibilityRole="button"
          accessibilityLabel="Regenerate all questions"
        >
          <RefreshCw color={COLORS.primary} size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.introCard}>
          <Sparkles color={COLORS.primary} size={24} />
          <Text style={styles.introTitle}>10 Common Interview Questions</Text>
          <Text style={styles.introText}>
            Each answer is personalized based on your background and tailored to this specific role.
          </Text>
        </View>

        {questions.map((question, index) => {
          const isExpanded = expandedQuestions.has(question.id);
          const isRegenerating = regeneratingId === question.id;

          return (
            <View key={question.id} style={styles.questionCard}>
              <TouchableOpacity
                style={styles.questionHeader}
                onPress={() => toggleExpanded(question.id)}
                accessibilityRole="button"
                accessibilityLabel={`${question.question}, ${isExpanded ? 'expanded' : 'collapsed'}`}
              >
                <View style={styles.questionNumberBadge}>
                  <Text style={styles.questionNumber}>{index + 1}</Text>
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
                  {/* Category */}
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{question.category}</Text>
                  </View>

                  {/* Why It's Hard */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <AlertCircle color={COLORS.warning} size={16} />
                      <Text style={styles.sectionTitle}>Why This Question Is Hard</Text>
                    </View>
                    <Text style={styles.sectionText}>{question.why_hard}</Text>
                  </View>

                  {/* Common Mistakes */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <AlertCircle color={COLORS.error} size={16} />
                      <Text style={styles.sectionTitle}>Common Mistakes</Text>
                    </View>
                    {question.common_mistakes.map((mistake, idx) => (
                      <View key={idx} style={styles.mistakeItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.mistakeText}>{mistake}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Exceptional Answer Builder */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Lightbulb color={COLORS.success} size={16} />
                      <Text style={styles.sectionTitle}>How to Build an Exceptional Answer</Text>
                    </View>
                    <Text style={styles.sectionText}>{question.exceptional_answer_builder}</Text>
                  </View>

                  {/* Short Answer */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <CheckCircle2 color={COLORS.primary} size={16} />
                      <Text style={styles.sectionTitle}>What to Say (Short Version)</Text>
                    </View>
                    <View style={styles.answerBox}>
                      <Text style={styles.answerText}>{question.what_to_say_short}</Text>
                    </View>
                  </View>

                  {/* Long Answer */}
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <CheckCircle2 color={COLORS.primary} size={16} />
                      <Text style={styles.sectionTitle}>What to Say (Detailed Version)</Text>
                    </View>
                    <View style={styles.answerBox}>
                      <Text style={styles.answerText}>{question.what_to_say_long}</Text>
                    </View>
                  </View>

                  {/* Regenerate Button */}
                  <TouchableOpacity
                    style={styles.regenerateButton}
                    onPress={() => handleRegenerateQuestion(question.id)}
                    disabled={isRegenerating}
                    accessibilityRole="button"
                    accessibilityLabel="Regenerate this answer"
                  >
                    {isRegenerating ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <RefreshCw color={COLORS.primary} size={16} />
                    )}
                    <Text style={styles.regenerateButtonText}>
                      {isRegenerating ? 'Regenerating...' : 'Regenerate Answer'}
                    </Text>
                  </TouchableOpacity>
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
    fontSize: 18,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: SPACING.sm,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    minHeight: 64,
  },
  questionNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  questionNumber: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.dark.background,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    lineHeight: 22,
  },
  answerContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.info}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    color: COLORS.info,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginLeft: SPACING.xs,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  bulletDot: {
    fontSize: 14,
    color: COLORS.error,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  mistakeText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
  },
  answerBox: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: SPACING.md,
  },
  answerText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
    lineHeight: 22,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: SPACING.sm,
  },
  regenerateButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
});
