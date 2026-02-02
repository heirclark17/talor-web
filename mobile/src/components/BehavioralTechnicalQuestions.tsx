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
  Code,
  Users,
  Sparkles,
  AlertCircle,
  Target,
  TrendingUp,
} from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface Question {
  id: string;
  question: string;
  type: 'behavioral' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  why_asked: string;
  what_theyre_looking_for: string;
  approach: string;
  example_answer?: string;
  follow_ups?: string[];
  tips?: string[];
}

interface QuestionsData {
  behavioral_questions: Question[];
  technical_questions: Question[];
}

interface Props {
  interviewPrepId: number;
  companyName: string;
  jobTitle: string;
  onGenerate?: () => Promise<QuestionsData | null>;
}

type QuestionType = 'all' | 'behavioral' | 'technical';
type DifficultyFilter = 'all' | 'easy' | 'medium' | 'hard';

export default function BehavioralTechnicalQuestions({
  interviewPrepId,
  companyName,
  jobTitle,
  onGenerate,
}: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QuestionsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState<QuestionType>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');

  const handleGenerate = async () => {
    if (!onGenerate) return;

    setLoading(true);
    setError(null);

    try {
      const result = await onGenerate();
      if (result) {
        setData(result);
        // Auto-expand first question
        const firstQuestion =
          result.behavioral_questions[0]?.id || result.technical_questions[0]?.id;
        if (firstQuestion) {
          setExpandedQuestions(new Set([firstQuestion]));
        }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return COLORS.success;
      case 'medium':
        return COLORS.warning;
      case 'hard':
        return COLORS.danger;
      default:
        return colors.textSecondary;
    }
  };

  const getFilteredQuestions = (): Question[] => {
    if (!data) return [];

    let questions: Question[] = [];

    if (typeFilter === 'all' || typeFilter === 'behavioral') {
      questions = questions.concat(data.behavioral_questions);
    }
    if (typeFilter === 'all' || typeFilter === 'technical') {
      questions = questions.concat(data.technical_questions);
    }

    if (difficultyFilter !== 'all') {
      questions = questions.filter((q) => q.difficulty === difficultyFilter);
    }

    return questions;
  };

  if (!data && !loading) {
    return (
      <GlassCard material="regular" shadow="subtle" style={styles.emptyCard}>
        <View style={styles.emptyIcon}>
          <Code color={COLORS.primary} size={48} />
          <Users color={COLORS.purple} size={48} style={styles.overlappingIcon} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          Behavioral & Technical Interview Questions
        </Text>
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          Get AI-generated interview questions tailored to {jobTitle} at {companyName},
          covering both behavioral competencies and technical skills.
        </Text>
        <Text style={[styles.emptyNote, { color: colors.textTertiary }]}>
          Includes difficulty ratings, what interviewers are looking for, suggested approaches,
          and follow-up questions to expect.
        </Text>
        <GlassButton
          label={loading ? 'Generating...' : 'Generate Questions'}
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
          Generating tailored questions...
        </Text>
      </GlassCard>
    );
  }

  const filteredQuestions = getFilteredQuestions();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Filters */}
      <GlassCard material="thin" style={styles.filterCard}>
        {/* Type Filter */}
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Question Type:</Text>
        <View style={styles.filterRow}>
          {(['all', 'behavioral', 'technical'] as QuestionType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setTypeFilter(type)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    typeFilter === type ? ALPHA_COLORS.primary.bg : colors.backgroundTertiary,
                  borderColor: typeFilter === type ? COLORS.primary : colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${type}`}
            >
              {type === 'behavioral' && <Users color={COLORS.purple} size={16} />}
              {type === 'technical' && <Code color={COLORS.primary} size={16} />}
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: typeFilter === type ? COLORS.primary : colors.textSecondary,
                  },
                ]}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Difficulty Filter */}
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Difficulty:</Text>
        <View style={styles.filterRow}>
          {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map((diff) => (
            <TouchableOpacity
              key={diff}
              onPress={() => setDifficultyFilter(diff)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    difficultyFilter === diff
                      ? ALPHA_COLORS.primary.bg
                      : colors.backgroundTertiary,
                  borderColor: difficultyFilter === diff ? COLORS.primary : colors.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${diff} difficulty`}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      difficultyFilter === diff
                        ? diff === 'all'
                          ? COLORS.primary
                          : getDifficultyColor(diff)
                        : colors.textSecondary,
                  },
                ]}
              >
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </GlassCard>

      {/* Questions List */}
      {filteredQuestions.map((question, index) => {
        const isExpanded = expandedQuestions.has(question.id);

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
                <View style={styles.questionMeta}>
                  {question.type === 'behavioral' ? (
                    <Users color={COLORS.purple} size={18} />
                  ) : (
                    <Code color={COLORS.primary} size={18} />
                  )}
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: `${getDifficultyColor(question.difficulty)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(question.difficulty) },
                      ]}
                    >
                      {question.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.questionText, { color: colors.text }]}
                  numberOfLines={isExpanded ? undefined : 2}
                >
                  {question.question}
                </Text>
                {question.category && (
                  <Text style={[styles.categoryText, { color: colors.textTertiary }]}>
                    {question.category}
                  </Text>
                )}
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
                {/* Why Asked */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Target color={COLORS.info} size={16} />
                    <Text style={[styles.sectionLabel, { color: COLORS.info }]}>
                      WHY THEY ASK THIS
                    </Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {question.why_asked}
                  </Text>
                </View>

                {/* What They're Looking For */}
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <TrendingUp color={COLORS.success} size={16} />
                    <Text style={[styles.sectionLabel, { color: COLORS.success }]}>
                      WHAT THEY'RE LOOKING FOR
                    </Text>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {question.what_theyre_looking_for}
                  </Text>
                </View>

                {/* Approach */}
                <View style={styles.section}>
                  <Text style={[styles.sectionLabel, { color: COLORS.primary }]}>
                    RECOMMENDED APPROACH
                  </Text>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {question.approach}
                  </Text>
                </View>

                {/* Example Answer */}
                {question.example_answer && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: COLORS.warning }]}>
                      EXAMPLE ANSWER
                    </Text>
                    <View
                      style={[
                        styles.exampleBox,
                        { backgroundColor: colors.backgroundTertiary },
                      ]}
                    >
                      <Text style={[styles.exampleText, { color: colors.text }]}>
                        {question.example_answer}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Tips */}
                {question.tips && question.tips.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: COLORS.success }]}>
                      PRO TIPS
                    </Text>
                    {question.tips.map((tip, idx) => (
                      <View key={idx} style={styles.tipItem}>
                        <Text style={[styles.bullet, { color: COLORS.success }]}>✓</Text>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                          {tip}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Follow-ups */}
                {question.follow_ups && question.follow_ups.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionLabel, { color: COLORS.warning }]}>
                      POTENTIAL FOLLOW-UP QUESTIONS
                    </Text>
                    {question.follow_ups.map((followUp, idx) => (
                      <View key={idx} style={styles.followUpItem}>
                        <Text style={[styles.bullet, { color: COLORS.warning }]}>→</Text>
                        <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                          {followUp}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </GlassCard>
        );
      })}

      {filteredQuestions.length === 0 && (
        <GlassCard material="regular" style={styles.emptyFilterCard}>
          <Text style={[styles.emptyFilterText, { color: colors.textSecondary }]}>
            No questions match the selected filters.
          </Text>
        </GlassCard>
      )}
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
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  overlappingIcon: {
    marginLeft: -SPACING.md,
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
  filterCard: {
    padding: SPACING.md,
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
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
    gap: SPACING.xs,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  difficultyBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    lineHeight: 20,
  },
  categoryText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  expandedContent: {
    borderTopWidth: 1,
    padding: SPACING.md,
    gap: SPACING.lg,
  },
  section: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
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
  exampleBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.xs,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
  },
  emptyFilterCard: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
});
