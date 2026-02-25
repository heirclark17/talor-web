import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Edit2,
  Save,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { GlassButton } from './glass/GlassButton';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';

interface STARStory {
  id?: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  key_themes: string[];
  talking_points: string[];
}

interface Props {
  initialStory?: STARStory;
  jobTitle?: string;
  companyName?: string;
  onSave?: (story: STARStory) => void;
  onCancel?: () => void;
  onGenerateAI?: (title: string) => Promise<STARStory | null>;
}

type STARSection = 'situation' | 'task' | 'action' | 'result';

const SECTION_GUIDANCE = {
  situation: 'Describe the context and background. What was happening? Where were you? What was the challenge?',
  task: 'What was your specific responsibility? What goal needed to be achieved? What was at stake?',
  action: 'What steps did YOU take? Focus on your specific contributions and decisions. Use "I" statements.',
  result: 'What was the measurable outcome? Include numbers, percentages, or concrete achievements. What did you learn?',
};

const SECTION_LABELS = {
  situation: 'Situation',
  task: 'Task',
  action: 'Action',
  result: 'Result',
};

export default function STARStoryBuilder({
  initialStory,
  jobTitle,
  companyName,
  onSave,
  onCancel,
  onGenerateAI,
}: Props) {
  const { colors, isDark } = useTheme();
  const [story, setStory] = useState<STARStory>(
    initialStory || {
      title: '',
      situation: '',
      task: '',
      action: '',
      result: '',
      key_themes: [],
      talking_points: [],
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<STARSection | null>(null);
  const [themeInput, setThemeInput] = useState('');
  const [talkingPointInput, setTalkingPointInput] = useState('');

  const updateStoryField = (field: keyof STARStory, value: any) => {
    setStory({ ...story, [field]: value });
  };

  const handleGenerateAI = async () => {
    if (!onGenerateAI || !story.title) {
      setError('Please enter a story title first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const generatedStory = await onGenerateAI(story.title);
      if (generatedStory) {
        setStory(generatedStory);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate story');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!story.title || !story.situation || !story.task || !story.action || !story.result) {
      setError('Please fill in all STAR sections');
      return;
    }

    if (onSave) {
      onSave(story);
    }
  };

  const addTheme = () => {
    if (themeInput.trim()) {
      updateStoryField('key_themes', [...story.key_themes, themeInput.trim()]);
      setThemeInput('');
    }
  };

  const removeTheme = (index: number) => {
    const newThemes = story.key_themes.filter((_, i) => i !== index);
    updateStoryField('key_themes', newThemes);
  };

  const addTalkingPoint = () => {
    if (talkingPointInput.trim()) {
      updateStoryField('talking_points', [...story.talking_points, talkingPointInput.trim()]);
      setTalkingPointInput('');
    }
  };

  const removeTalkingPoint = (index: number) => {
    const newPoints = story.talking_points.filter((_, i) => i !== index);
    updateStoryField('talking_points', newPoints);
  };

  const getSectionCompleteness = (section: STARSection): boolean => {
    return story[section].length > 0;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <GlassCard material="regular" shadow="subtle" style={styles.headerCard}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {initialStory ? 'Edit STAR Story' : 'Create STAR Story'}
          </Text>
          {jobTitle && companyName && (
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              For {jobTitle} at {companyName}
            </Text>
          )}
        </View>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
            <AlertCircle color={COLORS.danger} size={20} />
            <Text style={[styles.errorText, { color: COLORS.danger }]}>{error}</Text>
          </View>
        )}
      </GlassCard>

      {/* Story Title */}
      <GlassCard material="regular" shadow="subtle" style={styles.card}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Story Title</Text>
        <TextInput
          value={story.title}
          onChangeText={(text) => updateStoryField('title', text)}
          placeholder="E.g., Led security incident response for major breach"
          placeholderTextColor={colors.textTertiary}
          style={[
            styles.titleInput,
            {
              backgroundColor: colors.backgroundTertiary,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
        />
        {onGenerateAI && (
          <GlassButton
            label={loading ? 'Generating...' : 'Generate with AI'}
            variant="primary"
            icon={loading ? undefined : <Sparkles size={20} color="#ffffff" />}
            onPress={handleGenerateAI}
            disabled={loading || !story.title}
            style={styles.generateButton}
          />
        )}
      </GlassCard>

      {/* STAR Sections */}
      {(['situation', 'task', 'action', 'result'] as STARSection[]).map((section) => {
        const isExpanded = expandedSection === section;
        const isComplete = getSectionCompleteness(section);

        return (
          <GlassCard key={section} material="regular" shadow="subtle" style={styles.card}>
            {/* Section Header */}
            <TouchableOpacity
              onPress={() => setExpandedSection(isExpanded ? null : section)}
              style={styles.sectionHeader}
              accessibilityRole="button"
              accessibilityLabel={`${SECTION_LABELS[section]} section`}
              accessibilityState={{ expanded: isExpanded }}
            >
              <View style={styles.sectionHeaderLeft}>
                <View
                  style={[
                    styles.sectionCheckbox,
                    {
                      backgroundColor: isComplete
                        ? ALPHA_COLORS.success.bg
                        : colors.backgroundTertiary,
                      borderColor: isComplete ? COLORS.success : (isDark ? colors.border : 'transparent'),
                    },
                  ]}
                >
                  {isComplete && <CheckCircle color={COLORS.success} size={16} />}
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {SECTION_LABELS[section]}
                </Text>
              </View>
              <Edit2
                color={isExpanded ? COLORS.primary : colors.textSecondary}
                size={20}
              />
            </TouchableOpacity>

            {/* Section Content */}
            {isExpanded && (
              <View style={styles.sectionContent}>
                <View
                  style={[styles.guidanceBox, { backgroundColor: ALPHA_COLORS.info.bg }]}
                >
                  <Lightbulb color={COLORS.info} size={16} />
                  <Text style={[styles.guidanceText, { color: COLORS.info }]}>
                    {SECTION_GUIDANCE[section]}
                  </Text>
                </View>
                <TextInput
                  value={story[section]}
                  onChangeText={(text) => updateStoryField(section, text)}
                  multiline
                  numberOfLines={6}
                  placeholder={`Describe the ${section}...`}
                  placeholderTextColor={colors.textTertiary}
                  textAlignVertical="top"
                  style={[
                    styles.sectionInput,
                    {
                      backgroundColor: colors.backgroundTertiary,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                />
              </View>
            )}
          </GlassCard>
        );
      })}

      {/* Key Themes */}
      <GlassCard material="regular" shadow="subtle" style={styles.card}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
          Key Themes (Skills/Competencies Demonstrated)
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            value={themeInput}
            onChangeText={setThemeInput}
            placeholder="E.g., Leadership, Risk Management, Crisis Communication"
            placeholderTextColor={colors.textTertiary}
            onSubmitEditing={addTheme}
            style={[
              styles.addInput,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <GlassButton
            label="Add"
            variant="secondary"
            size="sm"
            onPress={addTheme}
          />
        </View>
        <View style={styles.chipContainer}>
          {story.key_themes.map((theme, index) => (
            <View
              key={index}
              style={[styles.chip, { backgroundColor: ALPHA_COLORS.primary.bg }]}
            >
              <Text style={[styles.chipText, { color: COLORS.primary }]}>{theme}</Text>
              <TouchableOpacity
                onPress={() => removeTheme(index)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${theme}`}
              >
                <X color={COLORS.primary} size={14} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Talking Points */}
      <GlassCard material="regular" shadow="subtle" style={styles.card}>
        <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>
          Key Talking Points (What to Emphasize)
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            value={talkingPointInput}
            onChangeText={setTalkingPointInput}
            placeholder="E.g., Reduced incident response time by 40%"
            placeholderTextColor={colors.textTertiary}
            onSubmitEditing={addTalkingPoint}
            style={[
              styles.addInput,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
          />
          <GlassButton
            label="Add"
            variant="primary"
            size="sm"
            onPress={addTalkingPoint}
          />
        </View>
        <View style={styles.pointsContainer}>
          {story.talking_points.map((point, index) => (
            <View key={index} style={styles.pointRow}>
              <Text style={[styles.bullet, { color: COLORS.success }]}>•</Text>
              <Text style={[styles.pointText, { color: colors.textSecondary }]}>
                {point}
              </Text>
              <TouchableOpacity
                onPress={() => removeTalkingPoint(index)}
                accessibilityRole="button"
                accessibilityLabel={`Remove talking point ${index + 1}`}
              >
                <X color={colors.textTertiary} size={16} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Actions */}
      <View style={styles.actions}>
        {onCancel && (
          <GlassButton
            label="Cancel"
            variant="secondary"
            onPress={onCancel}
            style={styles.actionButton}
          />
        )}
        <GlassButton
          label="Save Story"
          variant="primary"
          icon={<Save size={18} color="#ffffff" />}
          onPress={handleSave}
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
  headerCard: {
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  errorText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    flex: 1,
  },
  card: {
    padding: SPACING.lg,
  },
  cardLabel: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  titleInput: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
  },
  generateButton: {
    marginTop: SPACING.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.sm,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  sectionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  sectionContent: {
    gap: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  guidanceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  guidanceText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  sectionInput: {
    minHeight: 120,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  addInput: {
    flex: 1,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  chipText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  pointsContainer: {
    gap: SPACING.sm,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  bullet: {
    fontSize: 16,
    lineHeight: 20,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
  },
});
