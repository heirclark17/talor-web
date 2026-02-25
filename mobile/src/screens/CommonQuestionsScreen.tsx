import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
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
  Share2,
  Check,
  MessageSquare,
  Target,
  FileText,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';

type TabType = 'why-hard' | 'mistakes' | 'builder' | 'answer';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CommonQuestionsRouteProp = RouteProp<RootStackParamList, 'CommonQuestions'>;

interface AnswerBuilder {
  structure?: string;
  customization_checklist?: string[];
  strong_phrases?: string[];
}

interface CommonQuestion {
  id: string;
  question: string;
  category: string;
  why_hard: string;
  common_mistakes: string[];
  exceptional_answer_builder: string | AnswerBuilder;
  what_to_say_short: string;
  what_to_say_long: string;
  placeholders_used?: string[];
}

const TABS: { key: TabType; label: string; icon: React.ElementType }[] = [
  { key: 'why-hard', label: 'Why Hard', icon: AlertCircle },
  { key: 'mistakes', label: 'Mistakes', icon: Target },
  { key: 'builder', label: 'Builder', icon: Lightbulb },
  { key: 'answer', label: 'Answer', icon: MessageSquare },
];

export default function CommonQuestionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CommonQuestionsRouteProp>();
  const { colors, isDark } = useTheme();
  const { interviewPrepId } = route.params;

  const [questions, setQuestions] = useState<CommonQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTabs, setActiveTabs] = useState<Record<string, TabType>>({});

  const getActiveTab = (questionId: string): TabType => activeTabs[questionId] || 'why-hard';

  const setActiveTab = (questionId: string, tab: TabType) => {
    setActiveTabs(prev => ({ ...prev, [questionId]: tab }));
  };

  const countWords = (text: string): number => {
    return text?.trim().split(/\s+/).filter(Boolean).length || 0;
  };

  const handleCopyToClipboard = async (text: string, id: string) => {
    try {
      await Share.share({
        message: text,
      });
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  useEffect(() => {
    handleGenerateQuestions();
  }, []);

  const handleGenerateQuestions = async () => {
    console.log('=== CommonQuestions: Starting to generate for interviewPrepId:', interviewPrepId);
    setGenerating(true);
    try {
      const result = await api.generateCommonQuestions(interviewPrepId);
      console.log('=== CommonQuestions API Result keys:', Object.keys(result.data || {}));
      console.log('=== CommonQuestions API Result:', JSON.stringify(result, null, 2).slice(0, 1000));

      if (result.success && result.data) {
        // Handle nested data structure - API might return { success, data: { data: {...} } }
        const responseData = result.data.data || result.data;
        const questions = responseData.questions || [];
        console.log('=== CommonQuestions: Setting questions count:', questions.length);
        setQuestions(questions);
      } else {
        console.log('=== CommonQuestions API Error:', result.error);
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
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Common Questions</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Generating personalized answers...</Text>
          <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
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
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Common Questions</Text>
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
        <View style={[styles.introCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Sparkles color={COLORS.primary} size={24} />
          <Text style={[styles.introTitle, { color: colors.text }]}>10 Common Interview Questions</Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Each answer is personalized based on your background and tailored to this specific role.
          </Text>
        </View>

        {questions.map((question, index) => {
          const isExpanded = expandedQuestions.has(question.id);
          const isRegenerating = regeneratingId === question.id;

          return (
            <View key={question.id} style={[styles.questionCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
              <TouchableOpacity
                style={styles.questionHeader}
                onPress={() => toggleExpanded(question.id)}
                accessibilityRole="button"
                accessibilityLabel={`${question.question}, ${isExpanded ? 'expanded' : 'collapsed'}`}
              >
                <View style={[styles.questionNumberBadge, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.questionNumber, { color: colors.text }]}>{index + 1}</Text>
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
                  {/* Category */}
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{question.category}</Text>
                  </View>

                  {/* Tab Navigation */}
                  <View style={styles.tabContainer}>
                    {TABS.map((tab) => {
                      const isActive = getActiveTab(question.id) === tab.key;
                      const TabIcon = tab.icon;
                      return (
                        <TouchableOpacity
                          key={tab.key}
                          style={[
                            styles.tab,
                            isActive && styles.activeTab,
                            { borderColor: isActive ? COLORS.primary : (isDark ? colors.border : 'transparent') },
                          ]}
                          onPress={() => setActiveTab(question.id, tab.key)}
                          accessibilityRole="tab"
                          accessibilityState={{ selected: isActive }}
                        >
                          <TabIcon
                            color={isActive ? COLORS.primary : colors.textSecondary}
                            size={14}
                          />
                          <Text
                            style={[
                              styles.tabText,
                              { color: isActive ? COLORS.primary : colors.textSecondary },
                            ]}
                          >
                            {tab.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Tab Content */}
                  <View style={styles.tabContent}>
                    {/* Why It's Hard Tab */}
                    {getActiveTab(question.id) === 'why-hard' && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <AlertCircle color={COLORS.warning} size={18} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Why This Question Is Hard
                          </Text>
                        </View>
                        <View style={[styles.contentBox, { backgroundColor: colors.backgroundTertiary }]}>
                          <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                            {question.why_hard}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Common Mistakes Tab */}
                    {getActiveTab(question.id) === 'mistakes' && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Target color={COLORS.error} size={18} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Common Mistakes to Avoid
                          </Text>
                        </View>
                        <View style={[styles.contentBox, { backgroundColor: colors.backgroundTertiary }]}>
                          {question.common_mistakes?.map((mistake, idx) => (
                            <View key={idx} style={styles.mistakeItem}>
                              <View style={[styles.mistakeBullet, { backgroundColor: ALPHA_COLORS.danger.bg }]}>
                                <Text style={styles.mistakeNumber}>{idx + 1}</Text>
                              </View>
                              <Text style={[styles.mistakeText, { color: colors.textSecondary }]}>
                                {mistake}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Answer Builder Tab */}
                    {getActiveTab(question.id) === 'builder' && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Lightbulb color={COLORS.success} size={18} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Answer Builder
                          </Text>
                        </View>

                        {typeof question.exceptional_answer_builder === 'string' ? (
                          <View style={[styles.contentBox, { backgroundColor: colors.backgroundTertiary }]}>
                            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                              {question.exceptional_answer_builder}
                            </Text>
                          </View>
                        ) : (
                          <View>
                            {/* Structure */}
                            {question.exceptional_answer_builder?.structure && (
                              <View style={[styles.builderSection, { backgroundColor: colors.backgroundTertiary }]}>
                                <Text style={[styles.builderLabel, { color: colors.text }]}>
                                  Structure
                                </Text>
                                {question.exceptional_answer_builder.structure.split('\n').map((line, idx) => {
                                  const trimmed = line.trim();
                                  if (!trimmed) return null;
                                  const match = trimmed.match(/^(\d+)\.\s*(.+)/);
                                  if (match) {
                                    return (
                                      <View key={idx} style={styles.structureItem}>
                                        <View style={[styles.structureNumber, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                                          <Text style={[styles.structureNumberText, { color: COLORS.primary }]}>
                                            {match[1]}
                                          </Text>
                                        </View>
                                        <Text style={[styles.structureText, { color: colors.textSecondary }]}>
                                          {match[2]}
                                        </Text>
                                      </View>
                                    );
                                  }
                                  return (
                                    <Text key={idx} style={[styles.sectionText, { color: colors.textSecondary }]}>
                                      {trimmed}
                                    </Text>
                                  );
                                })}
                              </View>
                            )}

                            {/* Customization Checklist */}
                            {question.exceptional_answer_builder?.customization_checklist &&
                             question.exceptional_answer_builder.customization_checklist.length > 0 && (
                              <View style={[styles.builderSection, { backgroundColor: colors.backgroundTertiary }]}>
                                <Text style={[styles.builderLabel, { color: colors.text }]}>
                                  Customization Checklist
                                </Text>
                                {question.exceptional_answer_builder.customization_checklist.map((item, idx) => (
                                  <View key={idx} style={styles.checklistItem}>
                                    <View style={[styles.checkIcon, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                                      <CheckCircle2 color={COLORS.success} size={14} />
                                    </View>
                                    <Text style={[styles.checklistText, { color: colors.textSecondary }]}>
                                      {item}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}

                            {/* Strong Phrases */}
                            {question.exceptional_answer_builder?.strong_phrases &&
                             question.exceptional_answer_builder.strong_phrases.length > 0 && (
                              <View style={[styles.builderSection, { backgroundColor: colors.backgroundTertiary }]}>
                                <Text style={[styles.builderLabel, { color: colors.text }]}>
                                  Strong Phrases to Use
                                </Text>
                                <View style={styles.phrasesContainer}>
                                  {question.exceptional_answer_builder.strong_phrases.map((phrase, idx) => (
                                    <View key={idx} style={[styles.phraseChip, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
                                      <Text style={[styles.phraseText, { color: COLORS.purple }]}>
                                        "{phrase}"
                                      </Text>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    )}

                    {/* What to Say Tab */}
                    {getActiveTab(question.id) === 'answer' && (
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <MessageSquare color={COLORS.primary} size={18} />
                          <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            What to Say
                          </Text>
                        </View>

                        {/* Short Version */}
                        <View style={[styles.answerSection, { backgroundColor: colors.backgroundTertiary }]}>
                          <View style={styles.answerHeader}>
                            <Text style={[styles.answerLabel, { color: colors.text }]}>
                              Short Version
                            </Text>
                            <View style={styles.answerMeta}>
                              <View style={[styles.wordCountBadge, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                                <Text style={[styles.wordCountText, { color: COLORS.info }]}>
                                  {countWords(question.what_to_say_short)} words
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.shareButton}
                                onPress={() => handleCopyToClipboard(question.what_to_say_short, `${question.id}-short`)}
                                accessibilityRole="button"
                                accessibilityLabel="Share short answer"
                              >
                                {copiedId === `${question.id}-short` ? (
                                  <Check color={COLORS.success} size={14} />
                                ) : (
                                  <Share2 color={COLORS.primary} size={14} />
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View style={[styles.answerBox, { borderLeftColor: COLORS.info }]}>
                            <Text style={[styles.answerText, { color: colors.text }]}>
                              {question.what_to_say_short}
                            </Text>
                          </View>
                        </View>

                        {/* Full Version */}
                        <View style={[styles.answerSection, { backgroundColor: colors.backgroundTertiary }]}>
                          <View style={styles.answerHeader}>
                            <Text style={[styles.answerLabel, { color: colors.text }]}>
                              Full Version
                            </Text>
                            <View style={styles.answerMeta}>
                              <View style={[styles.wordCountBadge, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                                <Text style={[styles.wordCountText, { color: COLORS.success }]}>
                                  {countWords(question.what_to_say_long)} words
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={styles.shareButton}
                                onPress={() => handleCopyToClipboard(question.what_to_say_long, `${question.id}-long`)}
                                accessibilityRole="button"
                                accessibilityLabel="Share full answer"
                              >
                                {copiedId === `${question.id}-long` ? (
                                  <Check color={COLORS.success} size={14} />
                                ) : (
                                  <Share2 color={COLORS.primary} size={14} />
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View style={[styles.answerBox, { borderLeftColor: COLORS.success }]}>
                            <Text style={[styles.answerText, { color: colors.text }]}>
                              {question.what_to_say_long}
                            </Text>
                          </View>
                        </View>

                        {/* Placeholders Used */}
                        {question.placeholders_used && question.placeholders_used.length > 0 && (
                          <View style={[styles.placeholdersSection, { backgroundColor: colors.backgroundTertiary }]}>
                            <Text style={[styles.placeholdersLabel, { color: colors.text }]}>
                              Placeholders Used
                            </Text>
                            <Text style={[styles.placeholdersHint, { color: colors.textTertiary }]}>
                              Replace these with your specific details
                            </Text>
                            <View style={styles.placeholdersList}>
                              {question.placeholders_used.map((placeholder, idx) => (
                                <View key={idx} style={[styles.placeholderChip, { backgroundColor: ALPHA_COLORS.warning.bg }]}>
                                  <Text style={[styles.placeholderText, { color: COLORS.warning }]}>
                                    {placeholder}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Regenerate Button */}
                  <TouchableOpacity
                    style={[styles.regenerateButton, { borderColor: isDark ? COLORS.primary : 'transparent' }]}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  introCard: {
    borderRadius: RADIUS.lg,
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
    borderRadius: RADIUS.lg,
    borderWidth: 1,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  questionNumber: {
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  questionText: {
    flex: 1,
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    lineHeight: 22,
  },
  answerContent: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
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
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: ALPHA_COLORS.primary.bg,
  },
  tabText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  tabContent: {
    minHeight: 100,
  },
  // Section styles
  section: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
  sectionText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
  },
  contentBox: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  // Mistakes styles
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  mistakeBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mistakeNumber: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.error,
  },
  mistakeText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  // Builder styles
  builderSection: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  builderLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  structureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  structureNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  structureNumberText: {
    fontSize: 13,
    fontFamily: FONTS.bold,
  },
  structureText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
    paddingTop: 4,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistText: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
    paddingTop: 2,
  },
  phrasesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  phraseChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  phraseText: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    fontStyle: 'italic',
  },
  // Answer styles
  answerSection: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  answerLabel: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
  },
  answerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  wordCountBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  wordCountText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  shareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ALPHA_COLORS.primary.bg,
  },
  answerBox: {
    borderRadius: RADIUS.sm,
    borderLeftWidth: 3,
    padding: SPACING.sm,
    backgroundColor: ALPHA_COLORS.black[5],
  },
  answerText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
  },
  // Placeholders styles
  placeholdersSection: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  placeholdersLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    marginBottom: 2,
  },
  placeholdersHint: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.sm,
  },
  placeholdersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  placeholderChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  // Regenerate button
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginTop: SPACING.md,
  },
  regenerateButtonText: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
