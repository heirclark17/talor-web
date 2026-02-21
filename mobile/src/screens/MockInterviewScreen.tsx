/**
 * Mock Interview Screen
 * AI-powered interactive mock interviews
 */

import React, { useState } from 'react';
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

type InterviewType = 'behavioral' | 'technical' | 'company-specific';

export default function MockInterviewScreen() {
  const navigation = useNavigation();
  const [showChat, setShowChat] = useState(false);
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>('behavioral');

  const startInterview = () => {
    setShowChat(true);
  };

  const handleBackToSetup = () => {
    setShowChat(false);
  };

  if (showChat) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.chatContainer}>
          <TouchableOpacity
            onPress={handleBackToSetup}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="#FFF" />
            <Text style={styles.backButtonText}>Back to Setup</Text>
          </TouchableOpacity>

          <GlassCard style={styles.chatCard}>
            <Text style={styles.chatTitle}>Mock Interview</Text>
            <Text style={styles.chatSubtitle}>
              {company} - {jobTitle}
            </Text>

            <View style={styles.chatMessages}>
              <View style={styles.messageAI}>
                <Text style={styles.messageAIText}>
                  Hello! I'm your AI interviewer. Let's begin with a question about your
                  background. Tell me about yourself and why you're interested in this
                  position at {company}.
                </Text>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Type your response..."
                placeholderTextColor="#9CA3AF"
                style={styles.chatInput}
                multiline
              />
              <GlassButton variant="primary" style={styles.sendButton}>
                <Text style={styles.sendButtonText}>Send</Text>
              </GlassButton>
            </View>
          </GlassCard>

          <GlassCard style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Interview Tips</Text>
            <Text style={styles.tipsText}>
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
    <SafeAreaView style={styles.container} edges={['top']}>
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
            <Text style={styles.title}>AI Mock Interview</Text>
            <Text style={styles.subtitle}>
              Practice your interview skills with an AI interviewer that adapts to your
              responses
            </Text>
          </View>

          {/* Setup Form */}
          <GlassCard style={styles.setupCard}>
            <Text style={styles.setupTitle}>Interview Setup</Text>

            {/* Company Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Company Name</Text>
              <TextInput
                value={company}
                onChangeText={setCompany}
                placeholder="e.g., Google"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />
            </View>

            {/* Job Title Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Job Title</Text>
              <TextInput
                value={jobTitle}
                onChangeText={setJobTitle}
                placeholder="e.g., Senior Software Engineer"
                placeholderTextColor="#9CA3AF"
                style={styles.textInput}
              />
            </View>

            {/* Interview Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Interview Type</Text>
              <View style={styles.typeOptions}>
                <TouchableOpacity
                  onPress={() => setInterviewType('behavioral')}
                  style={[
                    styles.typeOption,
                    interviewType === 'behavioral' && styles.typeOptionActive,
                  ]}
                >
                  <Brain
                    size={32}
                    color={interviewType === 'behavioral' ? '#3B82F6' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.typeOptionTitle,
                      interviewType === 'behavioral' && styles.typeOptionTitleActive,
                    ]}
                  >
                    Behavioral
                  </Text>
                  <Text style={styles.typeOptionDesc}>
                    STAR method questions about past experiences
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setInterviewType('technical')}
                  style={[
                    styles.typeOption,
                    interviewType === 'technical' && styles.typeOptionActive,
                  ]}
                >
                  <Code
                    size={32}
                    color={interviewType === 'technical' ? '#10B981' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.typeOptionTitle,
                      interviewType === 'technical' && styles.typeOptionTitleActive,
                    ]}
                  >
                    Technical
                  </Text>
                  <Text style={styles.typeOptionDesc}>
                    Technical skills and problem-solving
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setInterviewType('company-specific')}
                  style={[
                    styles.typeOption,
                    interviewType === 'company-specific' && styles.typeOptionActive,
                  ]}
                >
                  <Briefcase
                    size={32}
                    color={interviewType === 'company-specific' ? '#8B5CF6' : '#9CA3AF'}
                  />
                  <Text
                    style={[
                      styles.typeOptionTitle,
                      interviewType === 'company-specific' &&
                        styles.typeOptionTitleActive,
                    ]}
                  >
                    Company-Specific
                  </Text>
                  <Text style={styles.typeOptionDesc}>
                    Company culture and values
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Start Button */}
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
              <Text style={styles.infoCardTitle}>Adaptive Questions</Text>
              <Text style={styles.infoCardText}>
                AI interviewer adapts follow-up questions based on your answers
              </Text>
            </GlassCard>

            <GlassCard style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Realistic Scenarios</Text>
              <Text style={styles.infoCardText}>
                Practice with questions tailored to your role and industry
              </Text>
            </GlassCard>

            <GlassCard style={styles.infoCard}>
              <Text style={styles.infoCardTitle}>Instant Feedback</Text>
              <Text style={styles.infoCardText}>
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
    backgroundColor: '#000',
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
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
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
    color: '#FFF',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFF',
    fontSize: 16,
  },
  typeOptions: {
    gap: 12,
  },
  typeOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
  },
  typeOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  typeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 8,
    marginBottom: 4,
  },
  typeOptionTitleActive: {
    color: '#3B82F6',
  },
  typeOptionDesc: {
    fontSize: 12,
    color: '#9CA3AF',
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
    color: '#FFF',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: '#9CA3AF',
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
    color: '#FFF',
    fontSize: 16,
  },
  chatCard: {
    flex: 1,
    padding: 16,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
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
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    gap: 12,
  },
  chatInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFF',
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
    color: '#FFF',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
  },
});
