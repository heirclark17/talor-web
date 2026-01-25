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
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

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

export default function BehavioralTechnicalQuestionsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BehavioralTechnicalQuestionsRouteProp>();
  const { interviewPrepId } = route.params;

  const [data, setData] = useState<QuestionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('behavioral');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    handleGenerateQuestions();
  }, []);

  const handleGenerateQuestions = async () => {
    setGenerating(true);
    try {
      const result = await api.generateBehavioralTechnicalQuestions(interviewPrepId);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate questions');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      Alert.alert('Error', 'Failed to generate behavioral and technical questions');
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpanded = (type: string, id: number) => {
    const key = `${type}-${id}`;
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
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
            <ArrowLeft color={COLORS.dark.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Interview Questions</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Generating your questions...</Text>
          <Text style={styles.loadingSubtext}>
            Researching company tech stack and creating personalized questions
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
        <Text style={styles.headerTitle}>Interview Questions</Text>
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
          style={[styles.tab, activeTab === 'behavioral' && styles.activeTab]}
          onPress={() => setActiveTab('behavioral')}
        >
          <Brain
            color={activeTab === 'behavioral' ? COLORS.primary : COLORS.dark.textSecondary}
            size={18}
          />
          <Text style={[styles.tabText, activeTab === 'behavioral' && styles.activeTabText]}>
            Behavioral ({data?.behavioral?.questions?.length || 0})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'technical' && styles.activeTab]}
          onPress={() => setActiveTab('technical')}
        >
          <Code
            color={activeTab === 'technical' ? COLORS.primary : COLORS.dark.textSecondary}
            size={18}
          />
          <Text style={[styles.tabText, activeTab === 'technical' && styles.activeTabText]}>
            Technical ({data?.technical?.questions?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Summary Card */}
        {data?.summary && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryNumber}>{data.summary.total_questions}</Text>
                <Text style={styles.summaryLabel}>Total Questions</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: COLORS.success }]}>
                  {data.summary.skill_matches}
                </Text>
                <Text style={styles.summaryLabel}>Skill Matches</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: COLORS.warning }]}>
                  {data.summary.skill_gaps}
                </Text>
                <Text style={styles.summaryLabel}>Skill Gaps</Text>
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
                <Text style={styles.contextText}>{data.behavioral.company_context}</Text>
              </View>
            )}

            {/* Behavioral Questions */}
            {data?.behavioral?.questions?.map((question) => {
              const isExpanded = expandedQuestions.has(`behavioral-${question.id}`);
              return (
                <View key={`behavioral-${question.id}`} style={styles.questionCard}>
                  <TouchableOpacity
                    style={styles.questionHeader}
                    onPress={() => toggleExpanded('behavioral', question.id)}
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
                      <Text style={styles.questionText}>{question.question}</Text>
                      {isExpanded ? (
                        <ChevronUp color={COLORS.dark.textSecondary} size={20} />
                      ) : (
                        <ChevronDown color={COLORS.dark.textSecondary} size={20} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.answerContent}>
                      {/* Competency Tested */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Target color={COLORS.primary} size={16} />
                          <Text style={styles.sectionTitle}>Competency Tested</Text>
                        </View>
                        <Text style={styles.sectionText}>{question.competency_tested}</Text>
                      </View>

                      {/* Why Asked */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Lightbulb color={COLORS.info} size={16} />
                          <Text style={styles.sectionTitle}>Why It's Asked</Text>
                        </View>
                        <Text style={styles.sectionText}>{question.why_asked}</Text>
                      </View>

                      {/* STAR Prompt */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Zap color={COLORS.warning} size={16} />
                          <Text style={styles.sectionTitle}>STAR Framework Hints</Text>
                        </View>
                        <View style={styles.starContainer}>
                          <View style={styles.starItem}>
                            <Text style={styles.starLabel}>S - Situation</Text>
                            <Text style={styles.starHint}>{question.star_prompt.situation_hint}</Text>
                          </View>
                          <View style={styles.starItem}>
                            <Text style={styles.starLabel}>T - Task</Text>
                            <Text style={styles.starHint}>{question.star_prompt.task_hint}</Text>
                          </View>
                          <View style={styles.starItem}>
                            <Text style={styles.starLabel}>A - Action</Text>
                            <Text style={styles.starHint}>{question.star_prompt.action_hint}</Text>
                          </View>
                          <View style={styles.starItem}>
                            <Text style={styles.starLabel}>R - Result</Text>
                            <Text style={styles.starHint}>{question.star_prompt.result_hint}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Key Themes */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <CheckCircle2 color={COLORS.success} size={16} />
                          <Text style={styles.sectionTitle}>Key Themes to Address</Text>
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
                          <Text style={styles.sectionTitle}>Common Mistakes</Text>
                        </View>
                        {question.common_mistakes.map((mistake, idx) => (
                          <View key={idx} style={styles.mistakeItem}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.mistakeText}>{mistake}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Job Alignment */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Target color={COLORS.primary} size={16} />
                          <Text style={styles.sectionTitle}>Job Alignment</Text>
                        </View>
                        <Text style={styles.sectionText}>{question.job_alignment}</Text>
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
              <View style={styles.techStackCard}>
                <Text style={styles.techStackTitle}>Tech Stack Analysis</Text>

                {data.technical.tech_stack_analysis.candidate_matching_skills?.length > 0 && (
                  <View style={styles.techSection}>
                    <Text style={styles.techSectionTitle}>Your Matching Skills</Text>
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
                    <Text style={styles.techSectionTitle}>Skill Gaps to Address</Text>
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
              const isExpanded = expandedQuestions.has(`technical-${question.id}`);
              return (
                <View key={`technical-${question.id}`} style={styles.questionCard}>
                  <TouchableOpacity
                    style={styles.questionHeader}
                    onPress={() => toggleExpanded('technical', question.id)}
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
                      <Text style={styles.questionText}>{question.question}</Text>
                      {isExpanded ? (
                        <ChevronUp color={COLORS.dark.textSecondary} size={20} />
                      ) : (
                        <ChevronDown color={COLORS.dark.textSecondary} size={20} />
                      )}
                    </View>
                    {/* Technology Focus */}
                    <View style={styles.techFocusContainer}>
                      {question.technology_focus.map((tech, idx) => (
                        <View key={idx} style={styles.techFocusChip}>
                          <Text style={styles.techFocusText}>{tech}</Text>
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
                          <Text style={styles.sectionTitle}>Expected Answer Points</Text>
                        </View>
                        {question.expected_answer_points.map((point, idx) => (
                          <View key={idx} style={styles.answerPointItem}>
                            <Text style={styles.bulletDot}>•</Text>
                            <Text style={styles.answerPointText}>{point}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Candidate Skill Leverage */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Zap color={COLORS.primary} size={16} />
                          <Text style={styles.sectionTitle}>Leverage Your Experience</Text>
                        </View>
                        <View style={styles.leverageBox}>
                          <Text style={styles.leverageText}>
                            {question.candidate_skill_leverage.relevant_experience}
                          </Text>
                          {question.candidate_skill_leverage.talking_points?.length > 0 && (
                            <View style={styles.talkingPointsContainer}>
                              <Text style={styles.talkingPointsTitle}>Key Talking Points:</Text>
                              {question.candidate_skill_leverage.talking_points.map((point, idx) => (
                                <View key={idx} style={styles.talkingPointItem}>
                                  <Text style={styles.bulletDot}>•</Text>
                                  <Text style={styles.talkingPointText}>{point}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                          {question.candidate_skill_leverage.skill_bridge && (
                            <View style={styles.skillBridgeContainer}>
                              <Text style={styles.skillBridgeTitle}>Skill Bridge:</Text>
                              <Text style={styles.skillBridgeText}>
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
                            <Text style={styles.sectionTitle}>Likely Follow-ups</Text>
                          </View>
                          {question.follow_up_questions.map((followUp, idx) => (
                            <View key={idx} style={styles.followUpItem}>
                              <Text style={styles.bulletDot}>•</Text>
                              <Text style={styles.followUpText}>{followUp}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Red Flags */}
                      {question.red_flags?.length > 0 && (
                        <View style={styles.section}>
                          <View style={styles.sectionHeader}>
                            <AlertTriangle color={COLORS.error} size={16} />
                            <Text style={styles.sectionTitle}>Avoid These Mistakes</Text>
                          </View>
                          {question.red_flags.map((flag, idx) => (
                            <View key={idx} style={styles.redFlagItem}>
                              <Text style={styles.bulletDot}>•</Text>
                              <Text style={styles.redFlagText}>{flag}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Job Alignment */}
                      <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                          <Target color={COLORS.primary} size={16} />
                          <Text style={styles.sectionTitle}>Job Alignment</Text>
                        </View>
                        <Text style={styles.sectionText}>{question.job_alignment}</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Preparation Strategy */}
            {data?.technical?.preparation_strategy && (
              <View style={styles.prepStrategyCard}>
                <Text style={styles.prepStrategyTitle}>Preparation Strategy</Text>

                {data.technical.preparation_strategy.high_priority_topics?.length > 0 && (
                  <View style={styles.prepSection}>
                    <Text style={styles.prepSectionTitle}>High Priority Topics</Text>
                    {data.technical.preparation_strategy.high_priority_topics.map((topic, idx) => (
                      <View key={idx} style={styles.prepItem}>
                        <Text style={styles.prepNumber}>{idx + 1}</Text>
                        <Text style={styles.prepText}>{topic}</Text>
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
                        <Text style={styles.prepText}>{practice}</Text>
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
    fontFamily: FONTS.semibold,
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
    backgroundColor: COLORS.dark.glass,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}20`,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
  },
  summaryCard: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
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
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    marginTop: 4,
  },
  contextCard: {
    backgroundColor: `${COLORS.info}10`,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: `${COLORS.info}30`,
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
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.info,
  },
  contextText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
    lineHeight: 20,
  },
  techStackCard: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  techStackTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: SPACING.md,
  },
  techSection: {
    marginBottom: SPACING.md,
  },
  techSectionTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.textSecondary,
    marginBottom: SPACING.sm,
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
    backgroundColor: `${COLORS.primary}20`,
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
    color: COLORS.dark.text,
    lineHeight: 22,
  },
  techFocusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  techFocusChip: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  techFocusText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.dark.textSecondary,
  },
  answerContent: {
    padding: SPACING.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
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
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
  },
  starContainer: {
    backgroundColor: COLORS.dark.backgroundTertiary,
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
    color: COLORS.dark.text,
    lineHeight: 18,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  chip: {
    backgroundColor: `${COLORS.primary}20`,
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
    backgroundColor: `${COLORS.success}20`,
  },
  successChipText: {
    color: COLORS.success,
  },
  warningChip: {
    backgroundColor: `${COLORS.warning}20`,
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
    color: COLORS.dark.textSecondary,
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
  answerPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  answerPointText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
    lineHeight: 20,
  },
  leverageBox: {
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: SPACING.md,
  },
  leverageText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
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
    color: COLORS.dark.text,
    lineHeight: 18,
  },
  skillBridgeContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.primary}30`,
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
    color: COLORS.dark.text,
    lineHeight: 18,
  },
  followUpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  followUpText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
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
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    lineHeight: 20,
  },
  prepStrategyCard: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  prepStrategyTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
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
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
    lineHeight: 20,
  },
});
