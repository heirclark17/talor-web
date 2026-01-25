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
  Briefcase,
  Building2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Question {
  id: number;
  question: string;
  suggested_answer: string;
  category: string;
  difficulty?: string;
}

interface InterviewPrepData {
  id: number;
  company: string;
  job_title: string;
  questions: Question[];
  tips?: string[];
  created_at: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type InterviewPrepRouteProp = RouteProp<RootStackParamList, 'InterviewPrep'>;

export default function InterviewPrepScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<InterviewPrepRouteProp>();
  const { tailoredResumeId } = route.params;

  const [prepData, setPrepData] = useState<InterviewPrepData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadInterviewPrep();
  }, [tailoredResumeId]);

  const loadInterviewPrep = async () => {
    setLoading(true);
    try {
      const result = await api.getInterviewPrep(tailoredResumeId);
      if (result.success && result.data) {
        setPrepData(result.data);
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
        setPrepData(result.data);
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

  const toggleQuestion = (questionId: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'behavioral':
        return COLORS.primary;
      case 'technical':
        return COLORS.purple;
      case 'situational':
        return COLORS.success;
      default:
        return COLORS.dark.textSecondary;
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
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
            Generate interview preparation materials for this job application.
          </Text>
          <TouchableOpacity
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={handleGeneratePrep}
            disabled={generating}
          >
            {generating ? (
              <>
                <ActivityIndicator color={COLORS.dark.background} />
                <Text style={styles.generateButtonText}>Generating...</Text>
              </>
            ) : (
              <>
                <Sparkles color={COLORS.dark.background} size={20} />
                <Text style={styles.generateButtonText}>Generate Prep</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft color={COLORS.dark.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Interview Prep</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Job Info Card */}
        <View style={styles.jobCard}>
          <View style={styles.jobCardHeader}>
            <View style={styles.jobIcon}>
              <Building2 color={COLORS.primary} size={24} />
            </View>
            <View style={styles.jobInfo}>
              <Text style={styles.jobCompany}>{prepData.company}</Text>
              <Text style={styles.jobTitle}>{prepData.job_title}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <MessageSquare color={COLORS.dark.textSecondary} size={16} />
              <Text style={styles.statText}>{prepData.questions.length} questions</Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        {prepData.tips && prepData.tips.length > 0 && (
          <View style={styles.tipsSection}>
            <View style={styles.tipsSectionHeader}>
              <Lightbulb color={COLORS.warning} size={20} />
              <Text style={styles.tipsSectionTitle}>Key Tips</Text>
            </View>
            {prepData.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Questions Section */}
        <View style={styles.questionsSection}>
          <Text style={styles.sectionTitle}>Practice Questions</Text>
          {prepData.questions.map((question) => (
            <View key={question.id} style={styles.questionCard}>
              <TouchableOpacity
                style={styles.questionHeader}
                onPress={() => toggleQuestion(question.id)}
              >
                <View style={styles.questionInfo}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: `${getCategoryColor(question.category)}20` },
                    ]}
                  >
                    <Text
                      style={[styles.categoryText, { color: getCategoryColor(question.category) }]}
                    >
                      {question.category}
                    </Text>
                  </View>
                  <Text style={styles.questionText}>{question.question}</Text>
                </View>
                {expandedQuestions.has(question.id) ? (
                  <ChevronUp color={COLORS.dark.textSecondary} size={20} />
                ) : (
                  <ChevronDown color={COLORS.dark.textSecondary} size={20} />
                )}
              </TouchableOpacity>

              {expandedQuestions.has(question.id) && (
                <View style={styles.answerSection}>
                  <View style={styles.answerHeader}>
                    <Target color={COLORS.success} size={16} />
                    <Text style={styles.answerLabel}>Suggested Answer</Text>
                  </View>
                  <Text style={styles.answerText}>{question.suggested_answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
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
    fontWeight: '600',
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
    color: COLORS.dark.textSecondary,
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
  },
  tipsSection: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  tipsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tipsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.text,
  },
  tipItem: {
    paddingLeft: SPACING.md,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.warning,
    marginBottom: SPACING.sm,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
  },
  questionsSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark.text,
    marginBottom: SPACING.md,
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
    alignItems: 'flex-start',
    padding: SPACING.lg,
    minHeight: 60,
  },
  questionInfo: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    color: COLORS.dark.text,
    lineHeight: 22,
  },
  answerSection: {
    padding: SPACING.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
    marginTop: SPACING.sm,
    paddingTop: SPACING.md,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  answerText: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    lineHeight: 22,
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
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
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
    fontWeight: '600',
    color: COLORS.dark.text,
  },
});
