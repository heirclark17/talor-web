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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
} from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';
import { api } from '../api/client';

type InterviewType = 'behavioral' | 'technical' | 'company-specific';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface Performance {
  summary: string;
  score: number;
  strengths: string[];
  improvements: string[];
  tips: string[];
}

export default function MockInterviewScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const scrollRef = useRef<FlatList>(null);

  // Setup state
  const [showChat, setShowChat] = useState(false);
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>('behavioral');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [starting, setStarting] = useState(false);

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
    if (!inputText.trim() || sending || isComplete) return;

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
      };

      setMessages(prev => [...prev, aiMessage]);
      setQuestionNumber(data.question_number || questionNumber + 1);

      if (data.is_complete) {
        setIsComplete(true);
        if (data.performance) {
          setPerformance(data.performance);
        }
      }

      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get response');
    } finally {
      setSending(false);
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
      </View>
    );
  };

  const renderPerformanceSummary = () => {
    if (!performance) return null;

    return (
      <GlassCard style={styles.performanceCard}>
        <View style={styles.performanceHeader}>
          <Award size={24} color={COLORS.warning} />
          <Text style={[styles.performanceTitle, { color: colors.text }]}>Interview Complete</Text>
        </View>

        <View style={[styles.scoreCircle, { borderColor: COLORS.primary }]}>
          <Text style={[styles.scoreText, { color: COLORS.primary }]}>{performance.score}/10</Text>
        </View>

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
              <Text key={i} style={[styles.perfItem, { color: colors.text }]}>  {s}</Text>
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
              <Text key={i} style={[styles.perfItem, { color: colors.text }]}>  {s}</Text>
            ))}
          </View>
        )}

        {performance.tips?.length > 0 && (
          <View style={styles.perfSection}>
            <View style={styles.perfSectionHeader}>
              <Lightbulb size={16} color={COLORS.primary} />
              <Text style={[styles.perfSectionTitle, { color: COLORS.primary }]}>Tips</Text>
            </View>
            {performance.tips.map((s, i) => (
              <Text key={i} style={[styles.perfItem, { color: colors.text }]}>  {s}</Text>
            ))}
          </View>
        )}

        <GlassButton
          onPress={() => {
            setMessages([]);
            setInputText('');
            setQuestionNumber(0);
            setIsComplete(false);
            setPerformance(null);
            setShowChat(false);
          }}
          variant="primary"
          style={styles.newInterviewButton}
        >
          <RotateCcw size={18} color="#FFF" />
          <Text style={styles.newInterviewText}>Start New Interview</Text>
        </GlassButton>
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
                {isComplete ? 'Interview Complete' : `Question ${questionNumber} of 10`}
              </Text>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <RotateCcw size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

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
                placeholder="Type your response..."
                placeholderTextColor={colors.textTertiary}
                style={[styles.chatInput, ds.textInput]}
                multiline
                maxLength={2000}
                editable={!sending}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={sending || !inputText.trim()}
                style={[
                  styles.sendBtn,
                  { backgroundColor: inputText.trim() ? COLORS.primary : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') },
                ]}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Send size={18} color={inputText.trim() ? '#FFF' : colors.textTertiary} />
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
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
            <Text style={[styles.subtitle, ds.subtitle]}>
              Practice with an AI interviewer that adapts to your responses
            </Text>
          </View>

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
  header: { marginBottom: 24, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, maxWidth: 320 },
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

  // Chat styles
  chatHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { padding: 8 },
  chatHeaderInfo: { flex: 1, marginHorizontal: 12 },
  chatHeaderTitle: { fontSize: 16, fontWeight: '600' },
  chatHeaderSub: { fontSize: 12, marginTop: 2 },
  resetButton: { padding: 8 },
  progressTrack: { height: 3 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  messagesList: { padding: 16, paddingBottom: 24 },
  messageBubble: { marginBottom: 16, maxWidth: '85%' },
  aiBubble: { alignSelf: 'flex-start' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: COLORS.primary + '15', borderRadius: 16, padding: 14, borderBottomRightRadius: 4 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  avatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarLabel: { fontSize: 12, fontWeight: '500' },
  messageText: { fontSize: 15, lineHeight: 22 },
  aiMessageText: { backgroundColor: 'rgba(59, 130, 246, 0.06)', borderRadius: 16, padding: 14, borderTopLeftRadius: 4, overflow: 'hidden' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, borderTopWidth: 1, gap: 8 },
  chatInput: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, maxHeight: 100, minHeight: 40 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },

  // Performance summary
  performanceCard: { padding: 20, marginTop: 16 },
  performanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  performanceTitle: { fontSize: 20, fontWeight: 'bold' },
  scoreCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  scoreText: { fontSize: 24, fontWeight: 'bold' },
  performanceSummary: { fontSize: 15, lineHeight: 22, marginBottom: 20, textAlign: 'center' },
  perfSection: { marginBottom: 16 },
  perfSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  perfSectionTitle: { fontSize: 14, fontWeight: '600' },
  perfItem: { fontSize: 14, lineHeight: 20, marginBottom: 4, paddingLeft: 4 },
  newInterviewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 },
  newInterviewText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
