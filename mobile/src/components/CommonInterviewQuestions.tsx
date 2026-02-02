import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  AlertCircle,
  MessageSquare,
} from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface CommonInterviewQuestion {
  id: string;
  question: string;
  why_hard: string;
  common_mistakes: string[];
  answer_builder: {
    opening: string;
    body: string;
    closing: string;
  };
  ready_answer: string;
}

interface CommonQuestionsData {
  questions: CommonInterviewQuestion[];
}

interface Props {
  interviewPrepId: number;
  companyName: string;
  jobTitle: string;
  onGenerate?: () => Promise<CommonQuestionsData | null>;
}

export default function CommonInterviewQuestions({
  interviewPrepId,
  companyName,
  jobTitle,
  onGenerate,
}: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CommonQuestionsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [copiedAnswers, setCopiedAnswers] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    if (!onGenerate) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onGenerate();
      if (result) {
        setData(result);
        // Auto-expand first question
        setExpandedQuestions(new Set([result.questions[0]?.id]));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (questionId: string) => {
    const newSet = new Set(expandedQuestions);
    if (newSet.has(questionId)) {
      newSet.delete(questionId);
    } else {
      newSet.add(questionId);
    }
    setExpandedQuestions(newSet);
  };

  const copyAnswer = (questionId: string, text: string) => {
    // In a real app, use Clipboard from react-native or expo-clipboard
    setCopiedAnswers((prev) => new Set(prev).add(questionId));
    setTimeout(() => {
      setCopiedAnswers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }, 2000);
  };

  if (!data && !loading) {
    return (
      <GlassCard material="regular" shadow="subtle" style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <MessageSquare color={COLORS.purple} size={48} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Common Interview Questions People Struggle With
        </Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          Get tailored answers for the 10 most challenging interview questions, customized to your
          resume and this specific role at {companyName}.
        </Text>
        <Text style={[styles.emptyNote, { color: colors.textTertiary }]}>
          Each question includes detailed guidance, common mistakes to avoid, and ready-to-use
          answers you can practice and customize.
        </Text>
        <GlassButton
          label={loading ? 'Generating...' : 'Generate Tailored Guidance'}
          variant="primary"
          onPress={handleGenerate}
          disabled={loading}
          icon={loading ? undefined : <Sparkles size={20} color="#ffffff" />}
          style={styles.generateButton}
        />
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
            <AlertCircle color={COLORS.danger} size={20} />
            <Text style={[styles.errorText, { color: COLORS.danger }]}>{error}</Text>
          </View>
        )}
      </GlassCard>
    );
  }

  if (loading) {
    return (
      <GlassCard material="regular" style={styles.loadingCard}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Generating tailored guidance...
        </Text>
      </GlassCard>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {data?.questions.map((question, index) => {
        const isExpanded = expandedQuestions.has(question.id);
        const isCopied = copiedAnswers.has(question.id);

        return (
          <GlassCard key={question.id} material="regular" shadow="subtle" style={styles.questionCard}>
            {/* Question Header */}
            <TouchableOpacity
              onPress={() => toggleExpand(question.id)}
              style={styles.questionHeader}
              accessibilityRole="button"
              accessibilityLabel={`Question ${index + 1}`}
              accessibilityState={{ expanded: isExpanded }}
            >
              <View style={styles.questionHeaderContent}>
                <View style={[styles.questionNumber, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.questionNumberText, { color: colors.text }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.questionText, { color: colors.text }]} numberOfLines={isExpanded ? undefined : 2}>
                  {question.question}
                </Text>
              </View>
              {isExpanded ? (
                <ChevronDown color={colors.textSecondary} size={20} />
              ) : (
                <ChevronRight color={colors.textSecondary} size={20} />
              )}
            </TouchableOpacity>

            {/* Expanded Content */}
            {isExpanded && (
              <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                {/* Why This Is Hard */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: COLORS.warning }]}>
                    WHY THIS IS CHALLENGING
                  </Text>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {question.why_hard}
                  </Text>
                </View>

                {/* Common Mistakes */}
                {question.common_mistakes && question.common_mistakes.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: COLORS.danger }]}>
                      COMMON MISTAKES TO AVOID
                    </Text>
                    {question.common_mistakes.map((mistake, idx) => (
                      <View key={idx} style={styles.mistakeItem}>
                        <Text style={[styles.bullet, { color: COLORS.danger }]}>×</Text>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                          {mistake}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Answer Builder */}
                {question.answer_builder && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: COLORS.info }]}>
                      ANSWER FRAMEWORK
                    </Text>
                    <View style={[styles.answerPart, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={[styles.answerPartLabel, { color: COLORS.success }]}>
                        Opening:
                      </Text>
                      <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                        {question.answer_builder.opening}
                      </Text>
                    </View>
                    <View style={[styles.answerPart, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={[styles.answerPartLabel, { color: COLORS.primary }]}>Body:</Text>
                      <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                        {question.answer_builder.body}
                      </Text>
                    </View>
                    <View style={[styles.answerPart, { backgroundColor: colors.backgroundTertiary }]}>
                      <Text style={[styles.answerPartLabel, { color: COLORS.warning }]}>
                        Closing:
                      </Text>
                      <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                        {question.answer_builder.closing}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Ready Answer */}
                <View style={styles.section}>
                  <View style={styles.answerHeader}>
                    <Text style={[styles.sectionLabel, { color: COLORS.success }]}>
                      READY-TO-USE ANSWER
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyAnswer(question.id, question.ready_answer)}
                      style={[styles.copyButton, { backgroundColor: ALPHA_COLORS.success.bg }]}
                      accessibilityRole="button"
                      accessibilityLabel="Copy answer"
                    >
                      {isCopied ? (
                        <Check color={COLORS.success} size={16} />
                      ) : (
                        <Copy color={COLORS.success} size={16} />
                      )}
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.readyAnswer, { color: colors.text }]}>
                    {question.ready_answer}
                  </Text>
                </View>
              </View>
            )}
          </GlassCard>
        );
      })}
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
  emptyCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  emptyDescription: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.sm,
  },
  emptyNote: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  generateButton: {
    minWidth: 200,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  loadingCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  questionCard: {
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  questionHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: '#000',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.semibold,
    lineHeight: 20,
  },
  expandedContent: {
    borderTopWidth: 1,
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  bullet: {
    fontSize: 18,
    lineHeight: 20,
  },
  answerPart: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    gap: 4,
  },
  answerPartLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyAnswer: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
});
