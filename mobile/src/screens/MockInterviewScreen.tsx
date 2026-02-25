/**
 * Mock Interview Screen
 * AI-powered interactive mock interviews
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Brain, Code, Briefcase, Play, ArrowLeft } from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { COLORS } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';

type InterviewType = 'behavioral' | 'technical' | 'company-specific';

export default function MockInterviewScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [showChat, setShowChat] = useState(false);
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>('behavioral');

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
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    },
    typeOptionTitle: { color: colors.text },
    typeOptionDesc: { color: colors.textSecondary },
    chatInput: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      color: colors.text,
    },
  }), [colors, isDark]);

  const startInterview = () => {
    setShowChat(true);
  };

  const handleBackToSetup = () => {
    setShowChat(false);
  };

  if (showChat) {
    return (
      <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
        <View style={styles.chatContainer}>
          <TouchableOpacity
            onPress={handleBackToSetup}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color={colors.text} />
            <Text style={[styles.backButtonText, { color: colors.text }]}>Back to Setup</Text>
          </TouchableOpacity>

          <GlassCard style={styles.chatCard}>
            <Text style={[styles.chatTitle, { color: colors.text }]}>Mock Interview</Text>
            <Text style={[styles.chatSubtitle, { color: colors.textSecondary }]}>
              {company} - {jobTitle}
            </Text>

            <View style={styles.chatMessages}>
              <View style={styles.messageAI}>
                <Text style={[styles.messageAIText, { color: colors.text }]}>
                  Hello! I'm your AI interviewer. Let's begin with a question about your
                  background. Tell me about yourself and why you're interested in this
                  position at {company}.
                </Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Type your response..."
                placeholderTextColor={colors.textTertiary}
                style={[styles.chatInput, ds.chatInput]}
                multiline
              />
              <GlassButton variant="primary" style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Send</Text>
              </GlassButton>
            </View>
          </GlassCard>

          <GlassCard style={styles.tipsCard}>
            <Text style={[styles.tipsTitle, { color: colors.text }]}>Interview Tips</Text>
            <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
              • Use the STAR method (Situation, Task, Action, Result){'\n'}
              • Be specific and provide examples{'\n'}
              • Take your time to think before answering
            </Text>
          </GlassCard>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, ds.title]}>AI Mock Interview</Text>
            <Text style={[styles.subtitle, ds.subtitle]}>
              Practice your interview skills with an AI interviewer that adapts to your
              responses
            </Text>
          </View>

          {/* Setup Form */}
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
                <TouchableOpacity
                  onPress={() => setInterviewType('behavioral')}
                  style={[
                    styles.typeOption,
                    ds.typeOption,
                    interviewType === 'behavioral' && styles.typeOptionActive,
                  ]}
                >
                  <Brain
                    size={32}
                    color={interviewType === 'behavioral' ? COLORS.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeOptionTitle,
                      ds.typeOptionTitle,
                      interviewType === 'behavioral' && styles.typeOptionTitleActive,
                    ]}
                  >
                    Behavioral
                  </Text>
                  <Text style={[styles.typeOptionDesc, ds.typeOptionDesc]}>
                    STAR method questions about past experiences
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setInterviewType('technical')}
                  style={[
                    styles.typeOption,
                    ds.typeOption,
                    interviewType === 'technical' && styles.typeOptionActive,
                  ]}
                >
                  <Code
                    size={32}
                    color={interviewType === 'technical' ? COLORS.success : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeOptionTitle,
                      ds.typeOptionTitle,
                      interviewType === 'technical' && styles.typeOptionTitleActive,
                    ]}
                  >
                    Technical
                  </Text>
                  <Text style={[styles.typeOptionDesc, ds.typeOptionDesc]}>
                    Technical skills and problem-solving
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setInterviewType('company-specific')}
                  style={[
                    styles.typeOption,
                    ds.typeOption,
                    interviewType === 'company-specific' && styles.typeOptionActive,
                  ]}
                >
                  <Briefcase
                    size={32}
                    color={interviewType === 'company-specific' ? COLORS.purple : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeOptionTitle,
                      ds.typeOptionTitle,
                      interviewType === 'company-specific' &&
                        styles.typeOptionTitleActive,
                    ]}
                  >
                    Company-Specific
                  </Text>
                  <Text style={[styles.typeOptionDesc, ds.typeOptionDesc]}>
                    Company culture and values
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <GlassButton
              onPress={startInterview}
              disabled={!company.trim() || !jobTitle.trim()}
              variant="primary"
              style={styles.startButton}
            >
              <Play size={20} color="#FFF" />
              <Text style={styles.startButtonText}>Start Mock Interview</Text>
            </GlassButton>
          </GlassCard>

          {/* Info Cards */}
          <View style={styles.infoCards}>
            <GlassCard style={styles.infoCard}>
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>
                Adaptive Questions
              </Text>
              <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
                AI interviewer adapts follow-up questions based on your answers
              </Text>
            </GlassCard>

            <GlassCard style={styles.infoCard}>
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>
                Realistic Scenarios
              </Text>
              <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
                Practice with questions tailored to your role and industry
              </Text>
            </GlassCard>

            <GlassCard style={styles.infoCard}>
              <Text style={[styles.infoCardTitle, { color: colors.text }]}>
                Instant Feedback
              </Text>
              <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
                Get detailed feedback on your responses and areas to improve
              </Text>
            </GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  setupCard: {
    padding: 20,
    marginBottom: 16,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  typeOptions: {
    gap: 12,
  },
  typeOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  typeOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  typeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  typeOptionTitleActive: {
    color: COLORS.primary,
  },
  typeOptionDesc: {
    fontSize: 12,
    textAlign: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCards: {
    gap: 12,
  },
  infoCard: {
    padding: 16,
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatContainer: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
  },
  chatCard: {
    flex: 1,
    padding: 16,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 16,
  },
  messageAI: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    padding: 16,
  },
  messageAIText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    gap: 12,
  },
  chatInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    alignSelf: 'flex-end',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  tipsCard: {
    padding: 16,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
