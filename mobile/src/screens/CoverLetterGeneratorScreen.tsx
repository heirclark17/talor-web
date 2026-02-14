import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { Colors, Typography, Spacing, GLASS } from '../theme';

interface CoverLetter {
  id: number;
  jobTitle: string;
  companyName: string;
  content: string;
  createdAt: string;
}

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'technical', label: 'Technical' },
  { value: 'conversational', label: 'Conversational' },
];

const LENGTH_OPTIONS = [
  { value: 'concise', label: 'Concise (3 paragraphs)' },
  { value: 'standard', label: 'Standard (4 paragraphs)' },
  { value: 'detailed', label: 'Detailed (5 paragraphs)' },
];

const FOCUS_OPTIONS = [
  { value: 'leadership', label: 'Leadership' },
  { value: 'technical', label: 'Technical Expertise' },
  { value: 'program_management', label: 'Program Management' },
  { value: 'cross_functional', label: 'Cross-Functional' },
];

export default function CoverLetterGeneratorScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);

  // Form state
  const [inputMethod, setInputMethod] = useState<'url' | 'manual'>('url');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tone, setTone] = useState<string>('professional');
  const [length, setLength] = useState<string>('standard');
  const [focus, setFocus] = useState<string>('program_management');

  useEffect(() => {
    loadCoverLetters();
  }, []);

  const loadCoverLetters = async () => {
    try {
      const result = await api.listCoverLetters();
      if (result.success) {
        setCoverLetters(result.data);
      }
    } catch (error) {
      console.error('Error loading cover letters:', error);
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (!jobTitle.trim()) {
      Alert.alert('Validation Error', 'Job title is required');
      return;
    }
    if (!companyName.trim()) {
      Alert.alert('Validation Error', 'Company name is required');
      return;
    }
    if (inputMethod === 'url' && !jobUrl.trim()) {
      Alert.alert('Validation Error', 'Job URL is required when using URL input method');
      return;
    }
    if (inputMethod === 'manual' && !jobDescription.trim()) {
      Alert.alert('Validation Error', 'Job description is required when using manual input method');
      return;
    }

    setLoading(true);
    try {
      const result = await api.generateCoverLetter({
        jobTitle,
        companyName,
        jobUrl: inputMethod === 'url' ? jobUrl : undefined,
        jobDescription: inputMethod === 'manual' ? jobDescription : undefined,
        tone: tone as any,
        length: length as any,
        focus: focus as any,
      });

      if (result.success) {
        Alert.alert('Success', 'Cover letter generated successfully!');
        loadCoverLetters();
        // Reset form
        setJobUrl('');
        setJobDescription('');
        setJobTitle('');
        setCompanyName('');
      } else {
        Alert.alert('Error', result.error || 'Failed to generate cover letter');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const renderOptionButtons = (
    options: { value: string; label: string }[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.optionsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.optionButton,
            selectedValue === option.value && styles.optionButtonActive,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.optionButtonText,
              selectedValue === option.value && styles.optionButtonTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCoverLetterCard = (item: CoverLetter) => (
    <BlurView
      key={item.id}
      intensity={GLASS.getBlurIntensity('subtle')}
      tint="light"
      style={styles.cardBlur}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          // TODO: Navigate to cover letter detail
        }}
      >
        <Text style={styles.cardTitle}>{item.jobTitle}</Text>
        <Text style={styles.cardSubtitle}>{item.companyName}</Text>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </TouchableOpacity>
    </BlurView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BlurView intensity={GLASS.getBlurIntensity('regular')} tint="light" style={styles.formBlur}>
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Generate Cover Letter</Text>

              {/* Input Method Toggle */}
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleButton, inputMethod === 'url' && styles.toggleButtonActive]}
                  onPress={() => setInputMethod('url')}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      inputMethod === 'url' && styles.toggleButtonTextActive,
                    ]}
                  >
                    Job URL
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, inputMethod === 'manual' && styles.toggleButtonActive]}
                  onPress={() => setInputMethod('manual')}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      inputMethod === 'manual' && styles.toggleButtonTextActive,
                    ]}
                  >
                    Manual Input
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Job Details */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Job Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Senior Product Manager"
                  placeholderTextColor={Colors.textTertiary}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Company Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Apple"
                  placeholderTextColor={Colors.textTertiary}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              {inputMethod === 'url' ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Job URL *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://..."
                    placeholderTextColor={Colors.textTertiary}
                    value={jobUrl}
                    onChangeText={setJobUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Job Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Paste the job description here..."
                    placeholderTextColor={Colors.textTertiary}
                    value={jobDescription}
                    onChangeText={setJobDescription}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                  />
                </View>
              )}

              {/* Customization Options */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tone</Text>
                {renderOptionButtons(TONE_OPTIONS, tone, setTone)}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Length</Text>
                {renderOptionButtons(LENGTH_OPTIONS, length, setLength)}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Focus</Text>
                {renderOptionButtons(FOCUS_OPTIONS, focus, setFocus)}
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[styles.generateButton, loading && styles.generateButtonDisabled]}
                onPress={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.generateButtonText}>Generate Cover Letter</Text>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Previous Cover Letters */}
          {coverLetters.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.historySectionTitle}>Previous Cover Letters</Text>
              {coverLetters.map(renderCoverLetterCard)}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  formBlur: {
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    ...GLASS.getShadow('medium'),
  },
  formContainer: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.surface + '40',
    borderRadius: GLASS.getCornerRadius('medium'),
    padding: Spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: GLASS.getCornerRadius('small'),
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleButtonText: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  toggleButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.bodyBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.white + '80',
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  textArea: {
    minHeight: 120,
    paddingTop: Spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: GLASS.getCornerRadius('medium'),
    backgroundColor: Colors.surface + '40',
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  optionButtonTextActive: {
    color: Colors.white,
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: Colors.primary,
    borderRadius: GLASS.getCornerRadius('medium'),
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...GLASS.getShadow('medium'),
    marginTop: Spacing.md,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    ...Typography.heading3,
    color: Colors.white,
  },
  historySection: {
    marginTop: Spacing.xl,
  },
  historySectionTitle: {
    ...Typography.heading2,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  cardBlur: {
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...GLASS.getShadow('medium'),
  },
  card: {
    padding: Spacing.lg,
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
  },
  cardTitle: {
    ...Typography.heading3,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  cardDate: {
    ...Typography.caption,
    color: Colors.textTertiary,
  },
});
