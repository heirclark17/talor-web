/**
 * Mock Interview Screen
 * AI-powered interactive mock interviews with adaptive questions
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  FlatList,
  Share,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import {
  Brain,
  Code,
  Briefcase,
  Play,
  ArrowLeft,
  Send,
  RotateCcw,
  Award,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Pause,
  Square,
  Check,
  Star,
  Download,
  Share2,
  HelpCircle,
} from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { COLORS, SPACING, TYPOGRAPHY, FONTS } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';
import { api } from '../api/client';

type InterviewType = 'behavioral' | 'technical' | 'company-specific';

interface MessageFeedback {
  strengths: string[];
  improvements: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  feedback?: MessageFeedback;
}

interface Performance {
  summary: string;
  score: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
}

function getLetterGrade(score: number): { grade: string; color: string } {
  if (score >= 9) return { grade: 'A', color: COLORS.success };
  if (score >= 7) return { grade: 'B', color: COLORS.primary };
  if (score >= 5) return { grade: 'C', color: '#EAB308' };
  if (score >= 3) return { grade: 'D', color: COLORS.warning };
  return { grade: 'F', color: COLORS.danger };
}

const INTERVIEW_TIPS: Record<InterviewType, string[]> = {
  behavioral: [
    'Use the STAR method: Situation, Task, Action, Result',
    'Be specific with examples from your experience',
    'Quantify results when possible (%, $, time)',
    'Focus on YOUR contributions, not the team',
    'Keep answers to 2-3 minutes each',
  ],
  technical: [
    'Think out loud - explain your reasoning process',
    'Ask clarifying questions before diving in',
    'Start with a brute-force approach, then optimize',
    'Consider edge cases and error handling',
    'Discuss time and space complexity trade-offs',
  ],
  'company-specific': [
    'Research the company mission and values beforehand',
    'Show genuine enthusiasm for the role and company',
    'Connect your experience to their specific needs',
    'Ask thoughtful questions about the team and culture',
    'Demonstrate cultural alignment with concrete examples',
  ],
};

export default function MockInterviewScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'MockInterview'>>();
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<FlatList>(null);

  const routeParams = route.params;
  const interviewPrepId = routeParams?.interviewPrepId;

  // Setup state — pre-fill from route params
  const [showChat, setShowChat] = useState(false);
  const [company, setCompany] = useState(routeParams?.company || '');
  const [jobTitle, setJobTitle] = useState(routeParams?.jobTitle || '');
  const [interviewType, setInterviewType] = useState<InterviewType>('behavioral');
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [starting, setStarting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const ds = useMemo(() => ({
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    inputLabel: { color: colors.textSecondary },
    textInput: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      color: colors.text,
    },
    typeOption: {
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
      borderWidth: isDark ? 2 : 0,
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    },
  }), [colors, isDark]);

  // Load past sessions when navigated from InterviewPrep
  React.useEffect(() => {
    if (interviewPrepId) {
      setLoadingSessions(true);
      api.getMockSessions(interviewPrepId).then(result => {
        if (result.success && Array.isArray(result.data)) {
          setPastSessions(result.data);
        }
      }).finally(() => setLoadingSessions(false));
    }
  }, [interviewPrepId]);

  const sendToAPI = useCallback(async (chatMessages: Array<{ role: string; content: string }>) => {
    const result = await api.mockInterviewChat({
      company,
      jobTitle,
      interviewType,
      messages: chatMessages,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to get response');
    }

    return result.data;
  }, [company, jobTitle, interviewType]);

  const startInterview = async () => {
    if (!company.trim() || !jobTitle.trim()) return;

    setStarting(true);
    try {
      // Start with empty messages to get first question
      const data = await sendToAPI([]);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
      };

      setMessages([aiMessage]);
      setQuestionNumber(data.question_number || 1);
      setShowChat(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start interview');
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending || isComplete || isPaused) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setSending(true);

    // Auto-scroll
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const data = await sendToAPI(apiMessages);

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: Date.now(),
        // Capture per-message feedback from API
        feedback: data.feedback ? {
          strengths: data.feedback.strengths || [],
          improvements: data.feedback.improvements || [],
        } : undefined,
      };

      setMessages(prev => [...prev, aiMessage]);
      setQuestionNumber(data.question_number || questionNumber + 1);

      if (data.is_complete) {
        setIsComplete(true);
        if (data.performance) {
          setPerformance(data.performance);
        }
        // Auto-save session if navigated from InterviewPrep
        if (interviewPrepId) {
          const allMessages = [...updatedMessages, aiMessage];
          api.saveMockSession(interviewPrepId, {
            interview_type: interviewType,
            company,
            job_title: jobTitle,
            messages: allMessages.map(m => ({ role: m.role, content: m.content })),
            performance: data.performance || undefined,
            question_count: (data.question_number || questionNumber + 1),
          }).then(() => {
            // Refresh past sessions list
            api.getMockSessions(interviewPrepId).then(result => {
              if (result.success && Array.isArray(result.data)) {
                setPastSessions(result.data);
              }
            });
          });
        }
      }

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get response');
    } finally {
      setSending(false);
    }
  };

  const handleEndInterview = () => {
    Alert.alert(
      'End Interview',
      'End the interview early and see your results?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Interview',
          style: 'destructive',
          onPress: () => {
            setIsComplete(true);
            // Generate a summary from what we have
            if (!performance) {
              setPerformance({
                summary: `Interview ended early after ${questionNumber} of 10 questions.`,
                score: 0,
                strengths: [],
                improvements: ['Complete all 10 questions for a full performance evaluation.'],
                tips: ['Try completing the full interview next time for detailed feedback.'],
              });
            }
          },
        },
      ],
    );
  };

  const handleShareResults = async () => {
    if (!performance) return;
    try {
      const { grade } = getLetterGrade(performance.score);
      await Share.share({
        message: `Mock Interview Results\n\nCompany: ${company}\nRole: ${jobTitle}\nScore: ${performance.score}/10 (${grade})\n\n${performance.summary}\n\nStrengths:\n${performance.strengths.map(s => `- ${s}`).join('\n')}\n\nAreas to Improve:\n${performance.improvements.map(s => `- ${s}`).join('\n')}\n\nPowered by Talor`,
      });
    } catch {
      // User cancelled share
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Start New Interview',
      'This will end the current interview. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'New Interview',
          onPress: () => {
            setMessages([]);
            setInputText('');
            setQuestionNumber(0);
            setIsComplete(false);
            setPerformance(null);
            setShowChat(false);
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isAI = item.role === 'assistant';
    return (
      <View style={[styles.messageBubble, isAI ? styles.aiBubble : styles.userBubble]}>
        {isAI && (
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: COLORS.primary + '20' }]}>
              <Brain size={14} color={COLORS.primary} />
            </View>
            <Text style={[styles.avatarLabel, { color: colors.textTertiary }]}>Interviewer</Text>
          </View>
        )}
        <Text style={[
          styles.messageText,
          { color: colors.text },
          isAI && styles.aiMessageText,
        ]}>
          {item.content}
        </Text>
        {/* Per-message feedback (from web) */}
        {isAI && item.feedback && (item.feedback.strengths.length > 0 || item.feedback.improvements.length > 0) && (
          <View style={[styles.inlineFeedback, { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}>
            <View style={styles.inlineFeedbackHeader}>
              <Star size={12} color={COLORS.warning} />
              <Text style={[styles.inlineFeedbackTitle, { color: colors.textSecondary }]}>Feedback</Text>
            </View>
            {item.feedback.strengths.map((s, i) => (
              <View key={`s-${i}`} style={styles.inlineFeedbackRow}>
                <Check size={12} color={COLORS.success} />
                <Text style={[styles.inlineFeedbackText, { color: colors.textSecondary }]}>{s}</Text>
              </View>
            ))}
            {item.feedback.improvements.map((s, i) => (
              <View key={`i-${i}`} style={styles.inlineFeedbackRow}>
                <AlertCircle size={12} color={COLORS.warning} />
                <Text style={[styles.inlineFeedbackText, { color: colors.textSecondary }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderPerformanceSummary = () => {
    if (!performance) return null;
    const { grade, color: gradeColor } = getLetterGrade(performance.score);

    return (
      <GlassCard style={styles.performanceCard}>
        <View style={styles.performanceHeader}>
          <Award size={24} color={COLORS.warning} />
          <Text style={[styles.performanceTitle, { color: colors.text }]}>Interview Complete</Text>
        </View>

        {/* Score + Grade row */}
        <View style={styles.scoreRow}>
          <View style={[styles.scoreCircle, { borderColor: gradeColor }]}>
            <Text style={[styles.scoreText, { color: gradeColor }]}>{performance.score}/10</Text>
          </View>
          <View style={[styles.gradeBadge, { backgroundColor: gradeColor + '20' }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>{grade}</Text>
          </View>
        </View>

        {performance.score >= 7 && (
          <View style={[styles.hireBadge, { backgroundColor: COLORS.success + '15' }]}>
            <Check size={14} color={COLORS.success} />
            <Text style={[styles.hireBadgeText, { color: COLORS.success }]}>Strong Candidate</Text>
          </View>
        )}

        <Text style={[styles.performanceSummary, { color: colors.textSecondary }]}>
          {performance.summary}
        </Text>

        {performance.strengths?.length > 0 && (
          <View style={styles.perfSection}>
            <View style={styles.perfSectionHeader}>
              <TrendingUp size={16} color={COLORS.success} />
              <Text style={[styles.perfSectionTitle, { color: COLORS.success }]}>Strengths</Text>
            </View>
            {performance.strengths.map((s, i) => (
              <View key={i} style={styles.perfItemRow}>
                <Check size={12} color={COLORS.success} />
                <Text style={[styles.perfItem, { color: colors.text }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {performance.improvements?.length > 0 && (
          <View style={styles.perfSection}>
            <View style={styles.perfSectionHeader}>
              <AlertCircle size={16} color={COLORS.warning} />
              <Text style={[styles.perfSectionTitle, { color: COLORS.warning }]}>Areas to Improve</Text>
            </View>
            {performance.improvements.map((s, i) => (
              <View key={i} style={styles.perfItemRow}>
                <AlertCircle size={12} color={COLORS.warning} />
                <Text style={[styles.perfItem, { color: colors.text }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {performance.tips?.length > 0 && (
          <View style={styles.perfSection}>
            <View style={styles.perfSectionHeader}>
              <Lightbulb size={16} color={COLORS.primary} />
              <Text style={[styles.perfSectionTitle, { color: COLORS.primary }]}>Recommendations</Text>
            </View>
            {performance.tips.map((s, i) => (
              <View key={i} style={styles.perfItemRow}>
                <View style={[styles.recNumberBadge, { backgroundColor: COLORS.primary + '20' }]}>
                  <Text style={[styles.recNumber, { color: COLORS.primary }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.perfItem, { color: colors.text }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.perfActions}>
          <GlassButton
            onPress={() => {
              setMessages([]);
              setInputText('');
              setQuestionNumber(0);
              setIsComplete(false);
              setPerformance(null);
              setIsPaused(false);
              setShowChat(false);
            }}
            variant="primary"
            style={styles.newInterviewButton}
          >
            <RotateCcw size={18} color="#FFF" />
            <Text style={styles.newInterviewText}>Try Again</Text>
          </GlassButton>

          <TouchableOpacity onPress={handleShareResults} style={[styles.shareButton, { borderColor: colors.border }]}>
            <Share2 size={16} color={colors.textSecondary} />
            <Text style={[styles.shareButtonText, { color: colors.textSecondary }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    );
  };

  // ─── CHAT VIEW ───────────────────────────────────────────────────
  if (showChat) {
    return (
      <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Header bar */}
          <View style={[styles.chatHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
            <TouchableOpacity onPress={handleReset} style={styles.backButton}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.chatHeaderInfo}>
              <Text style={[styles.chatHeaderTitle, { color: colors.text }]} numberOfLines={1}>
                {company} - {jobTitle}
              </Text>
              <Text style={[styles.chatHeaderSub, { color: colors.textTertiary }]}>
                {isComplete ? 'Interview Complete' : isPaused ? 'Paused' : `Question ${questionNumber} of 10`}
              </Text>
            </View>
            <View style={styles.chatHeaderActions}>
              <TouchableOpacity onPress={() => setShowTips(true)} style={styles.headerActionBtn}>
                <HelpCircle size={18} color={colors.textSecondary} />
              </TouchableOpacity>
              {!isComplete && (
                <TouchableOpacity onPress={() => setIsPaused(!isPaused)} style={styles.headerActionBtn}>
                  {isPaused ? <Play size={18} color={COLORS.success} /> : <Pause size={18} color={colors.textSecondary} />}
                </TouchableOpacity>
              )}
              {!isComplete && (
                <TouchableOpacity onPress={handleEndInterview} style={styles.headerActionBtn}>
                  <Square size={16} color={COLORS.danger} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Paused indicator */}
          {isPaused && !isComplete && (
            <View style={[styles.pausedBanner, { backgroundColor: COLORS.warning + '15' }]}>
              <Pause size={14} color={COLORS.warning} />
              <Text style={[styles.pausedText, { color: COLORS.warning }]}>Interview paused - tap play to resume</Text>
            </View>
          )}

          {/* Progress bar */}
          <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <View style={[styles.progressFill, { width: `${Math.min((questionNumber / 10) * 100, 100)}%` }]} />
          </View>

          {/* Messages */}
          <FlatList
            ref={scrollRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <>
                {sending && (
                  <View style={[styles.messageBubble, styles.aiBubble]}>
                    <View style={styles.avatarRow}>
                      <View style={[styles.avatar, { backgroundColor: COLORS.primary + '20' }]}>
                        <Brain size={14} color={COLORS.primary} />
                      </View>
                      <Text style={[styles.avatarLabel, { color: colors.textTertiary }]}>Thinking...</Text>
                    </View>
                    <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: 'flex-start', marginTop: 8 }} />
                  </View>
                )}
                {isComplete && renderPerformanceSummary()}
              </>
            }
          />

          {/* Input bar */}
          {!isComplete && (
            <View style={[styles.inputBar, {
              backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }]}>
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder={isPaused ? 'Interview paused...' : 'Type your response...'}
                placeholderTextColor={colors.textTertiary}
                style={[styles.chatInput, ds.textInput]}
                multiline
                maxLength={2000}
                editable={!sending && !isPaused}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={sending || !inputText.trim() || isPaused}
                style={[
                  styles.sendBtn,
                  { backgroundColor: inputText.trim() && !isPaused ? COLORS.primary : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') },
                ]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Send size={18} color={inputText.trim() && !isPaused ? '#FFF' : colors.textTertiary} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>

        {/* Tips Modal */}
        <Modal visible={showTips} transparent animationType="slide" onRequestClose={() => setShowTips(false)}>
          <View style={styles.tipsOverlay}>
            <TouchableOpacity style={styles.tipsBackdrop} activeOpacity={1} onPress={() => setShowTips(false)} />
            <View style={[styles.tipsSheet, { backgroundColor: colors.background }]}>
              <View style={styles.tipsHandle} />
              <View style={styles.tipsHeader}>
                <Award size={20} color={COLORS.warning} />
                <Text style={[styles.tipsTitle, { color: colors.text }]}>Interview Tips</Text>
                <TouchableOpacity onPress={() => setShowTips(false)}>
                  <Text style={[styles.tipsDone, { color: COLORS.primary }]}>Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.tipsContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.tipsTypeLabel, { color: colors.textTertiary }]}>
                  {interviewType === 'behavioral' ? 'BEHAVIORAL' : interviewType === 'technical' ? 'TECHNICAL' : 'COMPANY-SPECIFIC'} TIPS
                </Text>
                {INTERVIEW_TIPS[interviewType].map((tip, i) => (
                  <View key={i} style={styles.tipRow}>
                    <View style={[styles.tipBullet, { backgroundColor: COLORS.primary + '20' }]}>
                      <Text style={[styles.tipBulletText, { color: COLORS.primary }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
                  </View>
                ))}

                <Text style={[styles.tipsTypeLabel, { color: colors.textTertiary, marginTop: SPACING.lg }]}>
                  GENERAL TIPS
                </Text>
                {[
                  'Listen carefully to each question before responding',
                  'Take a moment to organize your thoughts',
                  'Be concise - aim for 2-3 minute responses',
                  'Show enthusiasm and genuine interest',
                  'Ask clarifying questions when needed',
                ].map((tip, i) => (
                  <View key={`g-${i}`} style={styles.tipRow}>
                    <View style={[styles.tipBullet, { backgroundColor: COLORS.success + '20' }]}>
                      <Lightbulb size={12} color={COLORS.success} />
                    </View>
                    <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
                  </View>
                ))}

                <View style={styles.tipResponseCount}>
                  <Text style={[styles.tipResponseCountText, { color: colors.textSecondary }]}>
                    {messages.filter(m => m.role === 'user').length} responses so far
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ─── SETUP VIEW ──────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, ds.title]}>AI Mock Interview</Text>
          </View>
          <Text style={[styles.subtitle, ds.subtitle]}>
            Practice with an AI interviewer that adapts to your responses
          </Text>

          <GlassCard style={styles.setupCard}>
            <Text style={[styles.setupTitle, { color: colors.text }]}>Interview Setup</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, ds.inputLabel]}>Company Name</Text>
              <TextInput
                value={company}
                onChangeText={setCompany}
                placeholder="e.g., Google"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textInput, ds.textInput]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, ds.inputLabel]}>Job Title</Text>
              <TextInput
                value={jobTitle}
                onChangeText={setJobTitle}
                placeholder="e.g., Senior Software Engineer"
                placeholderTextColor={colors.textTertiary}
                style={[styles.textInput, ds.textInput]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, ds.inputLabel]}>Interview Type</Text>
              <View style={styles.typeOptions}>
                {([
                  { id: 'behavioral' as InterviewType, icon: Brain, label: 'Behavioral', desc: 'STAR method questions', color: COLORS.primary },
                  { id: 'technical' as InterviewType, icon: Code, label: 'Technical', desc: 'Skills & problem-solving', color: COLORS.success },
                  { id: 'company-specific' as InterviewType, icon: Briefcase, label: 'Company-Specific', desc: 'Culture & values', color: COLORS.purple },
                ]).map(opt => (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => setInterviewType(opt.id)}
                    style={[
                      styles.typeOption,
                      ds.typeOption,
                      interviewType === opt.id && { borderColor: opt.color, backgroundColor: opt.color + '10', borderWidth: 2 },
                    ]}
                  >
                    <opt.icon size={28} color={interviewType === opt.id ? opt.color : colors.textSecondary} />
                    <Text style={[styles.typeOptionTitle, { color: interviewType === opt.id ? opt.color : colors.text }]}>
                      {opt.label}
                    </Text>
                    <Text style={[styles.typeOptionDesc, { color: colors.textSecondary }]}>{opt.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <GlassButton
              onPress={startInterview}
              disabled={!company.trim() || !jobTitle.trim() || starting}
              variant="primary"
              style={styles.startButton}
            >
              {starting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Play size={20} color="#FFF" />
                  <Text style={styles.startButtonText}>Start Mock Interview</Text>
                </>
              )}
            </GlassButton>
          </GlassCard>

          {/* Past Sessions */}
          {interviewPrepId && pastSessions.length > 0 && (
            <GlassCard style={styles.setupCard}>
              <Text style={[styles.setupTitle, { color: colors.text }]}>Past Sessions</Text>
              {pastSessions.map((session) => {
                const score = session.performance?.score;
                const grade = score != null ? (score >= 9 ? 'A' : score >= 7 ? 'B' : score >= 5 ? 'C' : score >= 3 ? 'D' : 'F') : null;
                const gradeColor = score != null ? (score >= 9 ? COLORS.success : score >= 7 ? COLORS.primary : score >= 5 ? '#EAB308' : COLORS.danger) : '';
                const dateStr = new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const typeBadge = session.interview_type === 'behavioral' ? 'Behavioral' : session.interview_type === 'technical' ? 'Technical' : 'Company';
                return (
                  <View key={session.id} style={[styles.pastSessionRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.infoCardTitle, { color: colors.text, marginBottom: 2 }]}>{typeBadge}</Text>
                      <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>{dateStr} · {session.question_count || 0} questions</Text>
                    </View>
                    {grade && (
                      <Text style={{ fontSize: 24, fontFamily: FONTS.bold, color: gradeColor }}>{grade}</Text>
                    )}
                  </View>
                );
              })}
            </GlassCard>
          )}

          <View style={styles.infoCards}>
            {[
              { title: 'Adaptive Questions', text: 'AI adapts follow-up questions based on your answers' },
              { title: '10-Question Format', text: 'Complete mock interview with performance scoring' },
              { title: 'Instant Feedback', text: 'Get strengths, improvements, and tips after completion' },
            ].map((info, i) => (
              <GlassCard key={i} style={styles.infoCard}>
                <Text style={[styles.infoCardTitle, { color: colors.text }]}>{info.title}</Text>
                <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>{info.text}</Text>
              </GlassCard>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, marginTop: -SPACING.sm, paddingBottom: SPACING.xs },
  title: { fontSize: 34, fontFamily: FONTS.semibold, marginBottom: 12 },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, maxWidth: 320, paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  setupCard: { padding: 20, marginBottom: 16 },
  setupTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  textInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16 },
  typeOptions: { gap: 12 },
  typeOption: { padding: 16, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  typeOptionTitle: { fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  typeOptionDesc: { fontSize: 12, textAlign: 'center' },
  startButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  startButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  infoCards: { gap: 12 },
  infoCard: { padding: 16 },
  infoCardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  infoCardText: { fontSize: 14, lineHeight: 20 },
  pastSessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },

  // Chat styles
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { padding: 8 },
  chatHeaderInfo: { flex: 1, marginHorizontal: 12 },
  chatHeaderTitle: { fontSize: 16, fontFamily: FONTS.semibold },
  chatHeaderSub: { fontSize: 12, marginTop: 2 },
  chatHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerActionBtn: { padding: 8 },
  pausedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, gap: 6 },
  pausedText: { fontSize: 13, fontFamily: FONTS.medium },
  progressTrack: { height: 3 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  messagesList: { padding: 16, paddingBottom: 24 },
  messageBubble: { marginBottom: 16, maxWidth: '85%' },
  aiBubble: { alignSelf: 'flex-start' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary + '15', borderRadius: 16, padding: 14, borderBottomRightRadius: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { fontSize: 12, fontFamily: FONTS.medium },
  messageText: { fontSize: 15, lineHeight: 22 },
  aiMessageText: { backgroundColor: 'rgba(59, 130, 246, 0.06)', borderRadius: 16, padding: 14, borderTopLeftRadius: 4, overflow: 'hidden' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, gap: 8 },
  chatInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, minHeight: 40 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Per-message feedback
  inlineFeedback: { borderTopWidth: 1, marginTop: 10, paddingTop: 8 },
  inlineFeedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  inlineFeedbackTitle: { fontSize: 11, fontFamily: FONTS.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  inlineFeedbackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 3 },
  inlineFeedbackText: { fontSize: 12, lineHeight: 16, flex: 1 },

  // Performance summary
  performanceCard: { padding: 20, marginTop: 16 },
  performanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  performanceTitle: { fontSize: 20, fontFamily: FONTS.bold },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  scoreText: { fontSize: 24, fontFamily: FONTS.bold },
  gradeBadge: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  gradeText: { fontSize: 28, fontFamily: FONTS.bold },
  hireBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8, marginBottom: 16 },
  hireBadgeText: { fontSize: 14, fontFamily: FONTS.semibold },
  performanceSummary: { fontSize: 15, lineHeight: 22, marginBottom: 20, textAlign: 'center' },
  perfSection: { marginBottom: 16 },
  perfSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  perfSectionTitle: { fontSize: 14, fontFamily: FONTS.semibold },
  perfItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  perfItem: { fontSize: 14, lineHeight: 20, flex: 1 },
  recNumberBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  recNumber: { fontSize: 11, fontFamily: FONTS.semibold },
  perfActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  newInterviewButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  newInterviewText: { color: '#FFF', fontSize: 16, fontFamily: FONTS.semibold },
  shareButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderRadius: 12 },
  shareButtonText: { fontSize: 14, fontFamily: FONTS.medium },

  // Tips modal
  tipsOverlay: { flex: 1, justifyContent: 'flex-end' },
  tipsBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  tipsSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 40 },
  tipsHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(128,128,128,0.3)', alignSelf: 'center', marginTop: 8 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.15)' },
  tipsTitle: { fontSize: 18, fontFamily: FONTS.semibold, flex: 1 },
  tipsDone: { fontSize: 15, fontFamily: FONTS.semibold },
  tipsContent: { paddingHorizontal: 20, paddingTop: 16 },
  tipsTypeLabel: { fontSize: 11, fontFamily: FONTS.semibold, letterSpacing: 1, marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  tipBullet: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  tipBulletText: { fontSize: 12, fontFamily: FONTS.semibold },
  tipText: { fontSize: 14, lineHeight: 20, flex: 1 },
  tipResponseCount: { alignItems: 'center', paddingVertical: 16 },
  tipResponseCountText: { fontSize: 13 },
});
