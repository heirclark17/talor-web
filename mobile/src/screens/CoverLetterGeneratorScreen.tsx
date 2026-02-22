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
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS } from '../utils/constants';
import { CoverLetterDetailModal } from '../components/CoverLetterDetailModal';

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
  const { colors, isDark } = useTheme();
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

  // Modal state
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
            { backgroundColor: colors.backgroundSecondary + '40' },
            selectedValue === option.value && styles.optionButtonActive,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.optionButtonText,
              { color: colors.textSecondary },
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
          setSelectedCoverLetter(item);
          setModalVisible(true);
        }}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.jobTitle}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.companyName}</Text>
        <Text style={[styles.cardDate, { color: colors.textTertiary }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <BlurView intensity={GLASS.getBlurIntensity('regular')} tint="light" style={styles.formBlur}>
            <View style={styles.formContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Generate Cover Letter</Text>

              {/* Input Method Toggle */}
              <View style={[styles.toggleContainer, { backgroundColor: colors.backgroundSecondary + '40' }]}>
                <TouchableOpacity
                  style={[styles.toggleButton, inputMethod === 'url' && styles.toggleButtonActive]}
                  onPress={() => setInputMethod('url')}
                >
                  <Text
                    style={[
                      styles.toggleButtonText,
                      { color: colors.textSecondary },
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
                      { color: colors.textSecondary },
                      inputMethod === 'manual' && styles.toggleButtonTextActive,
                    ]}
                  >
                    Manual Input
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Job Details */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Job Title *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g., Senior Product Manager"
                  placeholderTextColor={colors.textTertiary}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Company Name *</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="e.g., Apple"
                  placeholderTextColor={colors.textTertiary}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              {inputMethod === 'url' ? (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Job URL *</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="https://..."
                    placeholderTextColor={colors.textTertiary}
                    value={jobUrl}
                    onChangeText={setJobUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Job Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea, { color: colors.text }]}
                    placeholder="Paste the job description here..."
                    placeholderTextColor={colors.textTertiary}
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
                <Text style={[styles.inputLabel, { color: colors.text }]}>Tone</Text>
                {renderOptionButtons(TONE_OPTIONS, tone, setTone)}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Length</Text>
                {renderOptionButtons(LENGTH_OPTIONS, length, setLength)}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Focus</Text>
                {renderOptionButtons(FOCUS_OPTIONS, focus, setFocus)}
              </View>

              {/* Generate Button */}
              <TouchableOpacity
                style={[styles.generateButton, loading && styles.generateButtonDisabled]}
                onPress={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={'#ffffff'} />
                ) : (
                  <Text style={styles.generateButtonText}>Generate Cover Letter</Text>
                )}
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Previous Cover Letters */}
          {coverLetters.length > 0 && (
            <View style={styles.historySection}>
              <Text style={[styles.historySectionTitle, { color: colors.text }]}>Previous Cover Letters</Text>
              {coverLetters.map(renderCoverLetterCard)}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <CoverLetterDetailModal
        visible={modalVisible}
        coverLetter={selectedCoverLetter}
        onClose={() => {
          setModalVisible(false);
          setSelectedCoverLetter(null);
        }}
        onDelete={() => {
          loadCoverLetters();
        }}
        onUpdate={() => {
          loadCoverLetters();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  formBlur: {
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    ...GLASS.getShadow('medium'),
  },
  formContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.heading2,
    marginBottom: SPACING.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    borderRadius: GLASS.getCornerRadius('medium'),
    padding: SPACING.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: GLASS.getCornerRadius('small'),
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
  },
  toggleButtonText: {
    ...TYPOGRAPHY.body,
  },
  toggleButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodyBold,
    marginBottom: SPACING.sm,
  },
  input: {
    ...TYPOGRAPHY.body,
    backgroundColor: '#ffffff80',
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionButtonText: {
    ...TYPOGRAPHY.caption,
  },
  optionButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: GLASS.getCornerRadius('medium'),
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...GLASS.getShadow('medium'),
    marginTop: SPACING.md,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    ...TYPOGRAPHY.heading3,
    color: '#ffffff',
  },
  historySection: {
    marginTop: SPACING.xl,
  },
  historySectionTitle: {
    ...TYPOGRAPHY.heading2,
    marginBottom: SPACING.md,
  },
  cardBlur: {
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...GLASS.getShadow('medium'),
  },
  card: {
    padding: SPACING.lg,
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
  },
  cardTitle: {
    ...TYPOGRAPHY.heading3,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.xs,
  },
  cardDate: {
    ...TYPOGRAPHY.caption,
  },
});
