import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Mic, Save, RotateCcw } from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface PracticeQuestion {
  id: string;
  question: string;
  guidance: string;
}

interface Props {
  questions: PracticeQuestion[];
  onSaveResponse?: (questionId: string, response: string) => void;
}

export default function PracticeQuestions({ questions, onSaveResponse }: Props) {
  const { colors } = useTheme();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSave = () => {
    if (onSaveResponse && currentQuestion) {
      onSaveResponse(currentQuestion.id, responses[currentQuestion.id] || '');
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (!currentQuestion) {
    return (
      <GlassCard material="regular" style={styles.emptyCard}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No practice questions available
        </Text>
      </GlassCard>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: COLORS.primary,
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Question */}
      <GlassCard material="regular" shadow="subtle" style={styles.questionCard}>
        <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.question}</Text>
        {currentQuestion.guidance && (
          <View style={[styles.guidanceBox, { backgroundColor: ALPHA_COLORS.info.bg }]}>
            <Text style={[styles.guidanceText, { color: COLORS.info }]}>
              {currentQuestion.guidance}
            </Text>
          </View>
        )}
      </GlassCard>

      {/* Response Input */}
      <GlassCard material="regular" shadow="subtle" style={styles.responseCard}>
        <Text style={[styles.responseLabel, { color: colors.textSecondary }]}>Your Answer:</Text>
        <TextInput
          value={responses[currentQuestion.id] || ''}
          onChangeText={(text) =>
            setResponses({ ...responses, [currentQuestion.id]: text })
          }
          multiline
          numberOfLines={10}
          placeholder="Type your answer here or use voice recording..."
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.responseInput,
            {
              backgroundColor: colors.backgroundTertiary,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
      </GlassCard>

      {/* Actions */}
      <View style={styles.actions}>
        <GlassButton
          label="Previous"
          variant="secondary"
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={styles.actionButton}
        />
        <GlassButton
          label="Save"
          variant="primary"
          icon={<Save size={18} color="#ffffff" />}
          onPress={handleSave}
          style={styles.actionButton}
        />
        <GlassButton
          label="Next"
          variant="primary"
          onPress={handleNext}
          disabled={currentQuestionIndex === questions.length - 1}
          style={styles.actionButton}
        />
      </View>
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
  emptyText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  progressContainer: {
    gap: SPACING.xs,
  },
  progressText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  progressBar: {
    height: 4,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  questionCard: {
    padding: SPACING.lg,
  },
  questionText: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    lineHeight: 26,
    marginBottom: SPACING.md,
  },
  guidanceBox: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  guidanceText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  responseCard: {
    padding: SPACING.lg,
  },
  responseLabel: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  responseInput: {
    minHeight: 200,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
});
