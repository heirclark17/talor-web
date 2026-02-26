import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as DocumentPicker from 'expo-document-picker';
import {
  FileText,
  CheckCircle,
  Circle,
  Wand2,
  X,
  Upload,
  Link,
  Type,
  Search,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings2,
} from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS, ALPHA_COLORS, FONTS } from '../utils/constants';
import { CoverLetterDetailModal } from '../components/CoverLetterDetailModal';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface CoverLetter {
  id: number;
  jobTitle: string;
  companyName: string;
  tone: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface ResumeItem {
  id: number;
  filename: string;
  candidateName: string | null;
  uploadedAt: string;
}

type ResumeSource = 'none' | 'existing' | 'upload';
type JobInputMethod = 'text' | 'url';

interface FieldErrors {
  jobTitle?: string;
  companyName?: string;
  jobDescription?: string;
  jobUrl?: string;
}

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Formal and polished' },
  { value: 'enthusiastic', label: 'Enthusiastic', desc: 'Energetic and passionate' },
  { value: 'strategic', label: 'Strategic', desc: 'Big-picture and visionary' },
  { value: 'technical', label: 'Technical', desc: 'Precise and detailed' },
  { value: 'conversational', label: 'Conversational', desc: 'Friendly and approachable' },
];

const LENGTHS = [
  { value: 'concise', label: 'Concise', desc: '3 paragraphs' },
  { value: 'standard', label: 'Standard', desc: '4 paragraphs' },
  { value: 'detailed', label: 'Detailed', desc: '5 paragraphs' },
];

const FOCUS_AREAS = [
  { value: 'leadership', label: 'Leadership', desc: 'Management & team building' },
  { value: 'technical', label: 'Technical', desc: 'Technical expertise & depth' },
  { value: 'program_management', label: 'Program Mgmt', desc: 'Delivery & coordination' },
  { value: 'cross_functional', label: 'Cross-Functional', desc: 'Collaboration & influence' },
];

export default function CoverLetterGeneratorScreen() {
  const { colors, isDark } = useTheme();

  // Cover letters list
  const [letters, setLetters] = useState<CoverLetter[]>([]);
  const [loadingLetters, setLoadingLetters] = useState(true);

  // Generator modal visibility
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<'researching' | 'generating' | null>(null);

  // Generator form state
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [jobInputMethod, setJobInputMethod] = useState<JobInputMethod>('text');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('standard');
  const [focus, setFocus] = useState('leadership');

  // URL extraction states
  const [extractionAttempted, setExtractionAttempted] = useState(false);
  const [companyExtracted, setCompanyExtracted] = useState(false);
  const [titleExtracted, setTitleExtracted] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<{ company?: string; title?: string }>({});

  // Resume picker state
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);
  const [resumeSource, setResumeSource] = useState<ResumeSource>('none');
  const [uploading, setUploading] = useState(false);
  const [loadingResumes, setLoadingResumes] = useState(false);

  // Detail modal state
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Inline validation
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  // Collapsible customize section
  const [customizeExpanded, setCustomizeExpanded] = useState(false);

  // Swipeable refs for closing
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  useEffect(() => {
    loadLetters();
    loadResumes();
  }, []);

  async function loadLetters() {
    setLoadingLetters(true);
    try {
      const res = await api.listCoverLetters();
      if (res.success && res.data) {
        setLetters(res.data);
      }
    } catch (err) {
      console.error('Error loading cover letters:', err);
    } finally {
      setLoadingLetters(false);
    }
  }

  async function loadResumes() {
    setLoadingResumes(true);
    try {
      const res = await api.getResumes();
      if (res.success && res.data) {
        setResumes(res.data);
      }
    } catch (err) {
      console.error('Error loading resumes:', err);
    } finally {
      setLoadingResumes(false);
    }
  }

  async function handleExtract() {
    const trimmedUrl = jobUrl.trim();
    if (!trimmedUrl) {
      setFieldErrors(prev => ({ ...prev, jobUrl: 'Please enter a job URL first' }));
      return;
    }

    setExtracting(true);
    setExtractionAttempted(false);
    setExtractionError({});
    setFieldErrors(prev => ({ ...prev, jobUrl: undefined }));

    try {
      const result = await api.extractJobDetails(trimmedUrl);

      if (!result.success) {
        setExtractionAttempted(true);
        setCompanyExtracted(false);
        setTitleExtracted(false);
        setExtractionError({
          company: 'Could not extract company name. Please enter it manually.',
          title: 'Could not extract job title. Please enter it manually.',
        });
        return;
      }

      const extractedCompany = result.data?.company || '';
      const extractedTitle = result.data?.title || '';
      const extractedDescription = result.data?.description || '';

      setExtractionAttempted(true);

      if (extractedCompany) {
        setCompanyName(extractedCompany);
        setCompanyExtracted(true);
      } else {
        setCompanyExtracted(false);
        setExtractionError(prev => ({ ...prev, company: 'Could not extract company name. Please enter it manually.' }));
      }

      if (extractedTitle) {
        setJobTitle(extractedTitle);
        setTitleExtracted(true);
      } else {
        setTitleExtracted(false);
        setExtractionError(prev => ({ ...prev, title: 'Could not extract job title. Please enter it manually.' }));
      }

      if (extractedDescription) {
        setJobDescription(extractedDescription);
      }
    } catch (err: any) {
      setExtractionAttempted(true);
      setCompanyExtracted(false);
      setTitleExtracted(false);
      setExtractionError({
        company: 'Extraction failed. Please enter company name manually.',
        title: 'Extraction failed. Please enter job title manually.',
      });
    } finally {
      setExtracting(false);
    }
  }

  async function handleFileUpload() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });

      if (result.canceled || !result.assets?.[0]) return;

      const file = result.assets[0];
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert('Error', 'File must be under 10MB');
        return;
      }

      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name || 'resume.pdf',
        type: file.mimeType || 'application/pdf',
      } as any);

      const res = await api.uploadResume(formData);
      if (res.success && res.data) {
        const newResume = res.data.resume || res.data;
        setResumes(prev => [newResume, ...prev]);
        setSelectedResumeId(newResume.id);
      } else {
        Alert.alert('Error', 'Upload failed. Please try again.');
        setResumeSource('none');
        setSelectedResumeId(null);
      }
    } catch (err) {
      Alert.alert('Error', 'Upload error. Please try again.');
      setResumeSource('none');
      setSelectedResumeId(null);
    } finally {
      setUploading(false);
    }
  }

  function resetGeneratorForm() {
    setJobTitle('');
    setCompanyName('');
    setJobDescription('');
    setJobUrl('');
    setJobInputMethod('text');
    setExtractionAttempted(false);
    setCompanyExtracted(false);
    setTitleExtracted(false);
    setExtractionError({});
    setResumeSource('none');
    setSelectedResumeId(null);
    setTone('professional');
    setLength('standard');
    setFocus('leadership');
    setFieldErrors({});
    setCustomizeExpanded(false);
  }

  function validateForm(): boolean {
    const errors: FieldErrors = {};

    if (!jobTitle.trim()) {
      errors.jobTitle = 'Job title is required';
    }
    if (!companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    if (jobInputMethod === 'text' && !jobDescription.trim()) {
      errors.jobDescription = 'Job description is required';
    }
    if (jobInputMethod === 'url' && !jobUrl.trim()) {
      errors.jobUrl = 'Job URL is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleGenerate() {
    if (!validateForm()) return;

    setGenerating(true);
    setGenerationStage('researching');

    const stageTimer = setTimeout(() => {
      setGenerationStage('generating');
    }, 5000);

    try {
      const params: Record<string, any> = {
        jobTitle,
        companyName,
        tone,
        length,
        focus,
      };

      if (jobInputMethod === 'url') {
        params.jobUrl = jobUrl;
        if (extractionAttempted && jobDescription) {
          params.jobDescription = jobDescription;
        }
      } else {
        params.jobDescription = jobDescription;
      }

      if (resumeSource !== 'none' && selectedResumeId) {
        params.baseResumeId = selectedResumeId;
      }

      const res = await api.generateCoverLetter(params);

      if (res.success && res.data) {
        await loadLetters();
        setShowGenerator(false);
        resetGeneratorForm();

        if (res.data.cover_letter || res.data.coverLetter) {
          const letter = res.data.cover_letter || res.data.coverLetter;
          setSelectedCoverLetter(letter);
          setModalVisible(true);
        }
      } else {
        Alert.alert('Error', res.error || 'Generation failed. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to generate cover letter.');
    } finally {
      clearTimeout(stageTimer);
      setGenerating(false);
      setGenerationStage(null);
    }
  }

  async function handleDeleteLetter(id: number) {
    Alert.alert(
      'Delete Cover Letter',
      'Are you sure you want to delete this cover letter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.deleteCoverLetter(id);
              if (res.success) {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setLetters(prev => prev.filter(l => l.id !== id));
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete cover letter.');
            }
          },
        },
      ]
    );
  }

  const toggleCustomize = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCustomizeExpanded(prev => !prev);
  }, []);

  // Clear field error on change
  const handleFieldChange = useCallback((field: keyof FieldErrors, value: string, setter: (v: string) => void) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [fieldErrors]);

  // --- Render helpers ---

  const renderOptionSelector = (
    options: { value: string; label: string; desc: string }[],
    selectedValue: string,
    onSelect: (value: string) => void,
    columns: number = 3,
  ) => (
    <View style={[styles.optionGrid, columns === 2 && { flexWrap: 'wrap' }]}>
      {options.map((opt) => {
        const isActive = selectedValue === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.optionCard,
              {
                width: columns === 2 ? '48%' : columns === 3 ? '31.5%' : `${(100 / columns) - 2}%`,
                backgroundColor: isActive ? ALPHA_COLORS.primary.bg : (isDark ? ALPHA_COLORS.white[10] : colors.backgroundSecondary),
                borderColor: isActive ? ALPHA_COLORS.primary.border : (isDark ? GLASS.getBorderColor() : ALPHA_COLORS.white[20]),
              },
            ]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${opt.label}: ${opt.desc}`}
          >
            <Text style={[styles.optionLabel, { color: isActive ? COLORS.primary : colors.text }]}>{opt.label}</Text>
            <Text style={[styles.optionDesc, { color: colors.textTertiary }]}>{opt.desc}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSwipeDeleteAction = () => (
    <TouchableOpacity style={styles.swipeDeleteAction} activeOpacity={0.8}>
      <Trash2 color="#fff" size={20} />
      <Text style={styles.swipeDeleteText}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLetterCard = (letter: CoverLetter) => (
    <Swipeable
      key={letter.id}
      ref={ref => {
        if (ref) swipeableRefs.current.set(letter.id, ref);
      }}
      renderRightActions={renderSwipeDeleteAction}
      onSwipeableOpen={() => {
        handleDeleteLetter(letter.id);
        swipeableRefs.current.get(letter.id)?.close();
      }}
      overshootRight={false}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          setSelectedCoverLetter(letter);
          setModalVisible(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${letter.jobTitle} at ${letter.companyName}, ${letter.tone} tone`}
        accessibilityHint="Tap to view, swipe left to delete"
      >
        <BlurView
          intensity={GLASS.getBlurIntensity('subtle')}
          tint={isDark ? 'dark' : 'light'}
          style={styles.letterCardBlur}
        >
          <View style={[styles.letterCard, { borderColor: isDark ? GLASS.getBorderColor() : ALPHA_COLORS.white[20] }]}>
            <View style={styles.letterCardContent}>
              <View style={[styles.letterCardLeft, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                <FileText color={COLORS.primary} size={20} />
              </View>
              <View style={styles.letterCardText}>
                <Text style={[styles.letterCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {letter.jobTitle}
                </Text>
                <Text style={[styles.letterCardCompany, { color: colors.textSecondary }]} numberOfLines={1}>
                  {letter.companyName}
                </Text>
              </View>
              <View style={styles.letterCardRight}>
                <View style={[styles.toneBadge, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                  <Text style={[styles.toneBadgeText, { color: COLORS.primary }]}>{letter.tone || 'professional'}</Text>
                </View>
                <Text style={[styles.letterCardDate, { color: colors.textTertiary }]}>
                  {new Date(letter.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Swipeable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FileText color={colors.textTertiary} size={56} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Create Your First Cover Letter</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Generate a personalized cover letter in 60 seconds
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => setShowGenerator(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Generate cover letter"
      >
        <Wand2 color="#fff" size={20} />
        <Text style={styles.emptyButtonText}>Generate Cover Letter</Text>
      </TouchableOpacity>
    </View>
  );

  // Input field styling helper
  const getInputStyle = (fieldKey?: keyof FieldErrors) => ({
    color: colors.text,
    backgroundColor: isDark ? ALPHA_COLORS.white[10] : colors.backgroundSecondary,
    borderColor: fieldKey && fieldErrors[fieldKey]
      ? COLORS.danger
      : (isDark ? GLASS.getBorderColor() : ALPHA_COLORS.white[20]),
  });

  // --- Generator Form ---
  const renderGeneratorForm = () => (
    <ScrollView
      style={styles.generatorScroll}
      contentContainerStyle={styles.generatorScrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Input Method Toggle */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>How would you like to provide the job details?</Text>
        <View style={styles.methodToggle}>
          <TouchableOpacity
            style={[
              styles.methodButton,
              {
                backgroundColor: jobInputMethod === 'text' ? ALPHA_COLORS.primary.bg : (isDark ? ALPHA_COLORS.white[10] : colors.backgroundSecondary),
                borderColor: jobInputMethod === 'text' ? ALPHA_COLORS.primary.border : (isDark ? GLASS.getBorderColor() : ALPHA_COLORS.white[20]),
              },
            ]}
            onPress={() => {
              setJobInputMethod('text');
              setExtractionAttempted(false);
              setCompanyExtracted(false);
              setTitleExtracted(false);
              setExtractionError({});
              setFieldErrors(prev => ({ ...prev, jobUrl: undefined }));
            }}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: jobInputMethod === 'text' }}
            accessibilityLabel="Paste Text: Manually enter job details"
          >
            <Type color={jobInputMethod === 'text' ? COLORS.primary : colors.textSecondary} size={18} />
            <Text style={[styles.methodLabel, { color: jobInputMethod === 'text' ? COLORS.primary : colors.text }]}>Paste Text</Text>
            <Text style={[styles.methodDesc, { color: colors.textTertiary }]}>Manually enter job details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.methodButton,
              {
                backgroundColor: jobInputMethod === 'url' ? ALPHA_COLORS.primary.bg : (isDark ? ALPHA_COLORS.white[10] : colors.backgroundSecondary),
                borderColor: jobInputMethod === 'url' ? ALPHA_COLORS.primary.border : (isDark ? GLASS.getBorderColor() : ALPHA_COLORS.white[20]),
              },
            ]}
            onPress={() => {
              setJobInputMethod('url');
              setExtractionAttempted(false);
              setCompanyExtracted(false);
              setTitleExtracted(false);
              setExtractionError({});
              setFieldErrors(prev => ({ ...prev, jobDescription: undefined }));
            }}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: jobInputMethod === 'url' }}
            accessibilityLabel="Enter URL: Extract from job posting"
          >
            <Link color={jobInputMethod === 'url' ? COLORS.primary : colors.textSecondary} size={18} />
            <Text style={[styles.methodLabel, { color: jobInputMethod === 'url' ? COLORS.primary : colors.text }]}>Enter URL</Text>
            <Text style={[styles.methodDesc, { color: colors.textTertiary }]}>Extract from job posting</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* URL Input */}
      {jobInputMethod === 'url' && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Job URL *</Text>
          <View style={styles.urlRow}>
            <TextInput
              style={[styles.urlInput, getInputStyle('jobUrl')]}
              value={jobUrl}
              onChangeText={(text) => {
                handleFieldChange('jobUrl', text, setJobUrl);
                if (extractionAttempted) {
                  setExtractionAttempted(false);
                  setCompanyExtracted(false);
                  setTitleExtracted(false);
                  setExtractionError({});
                  setCompanyName('');
                  setJobTitle('');
                }
              }}
              placeholder="https://linkedin.com/jobs/view/..."
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              editable={!extracting}
              accessibilityLabel="Job URL"
            />
            <TouchableOpacity
              style={[
                styles.extractButton,
                (!jobUrl.trim() || extracting) && styles.extractButtonDisabled,
              ]}
              onPress={handleExtract}
              disabled={!jobUrl.trim() || extracting}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Extract job details from URL"
            >
              {extracting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.extractButtonText}>Extract</Text>
              )}
            </TouchableOpacity>
          </View>
          {fieldErrors.jobUrl ? (
            <Text style={styles.errorText}>{fieldErrors.jobUrl}</Text>
          ) : (
            <Text style={[styles.helperText, { color: colors.textTertiary }]}>
              Paste the job URL and tap Extract to auto-fill company and title.
            </Text>
          )}
        </View>
      )}

      {/* Extraction Success */}
      {jobInputMethod === 'url' && extractionAttempted && (companyExtracted || titleExtracted) && (
        <View style={[styles.extractionSuccess, { backgroundColor: ALPHA_COLORS.success.bg, borderColor: ALPHA_COLORS.success.border }]}>
          <CheckCircle color={COLORS.success} size={18} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.extractionSuccessTitle, { color: COLORS.success }]}>Extraction Successful!</Text>
            {companyExtracted && <Text style={[styles.extractionSuccessItem, { color: COLORS.success }]}>Company: {companyName}</Text>}
            {titleExtracted && <Text style={[styles.extractionSuccessItem, { color: COLORS.success }]}>Job Title: {jobTitle}</Text>}
            {jobDescription ? (
              <Text style={[styles.extractionSuccessItem, { color: COLORS.success }]}>Job description extracted</Text>
            ) : null}
          </View>
        </View>
      )}

      {/* Extracted Job Description (editable) */}
      {jobInputMethod === 'url' && extractionAttempted && jobDescription ? (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Extracted Job Description</Text>
          <TextInput
            style={[styles.textArea, getInputStyle()]}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Extracted job description..."
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Extracted job description, editable"
          />
          <Text style={[styles.helperText, { color: colors.textTertiary }]}>
            You can edit the extracted description if needed.
          </Text>
        </View>
      ) : null}

      {/* Text Input - Job Description */}
      {jobInputMethod === 'text' && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Job Description *</Text>
          <TextInput
            style={[styles.textArea, getInputStyle('jobDescription')]}
            value={jobDescription}
            onChangeText={(text) => handleFieldChange('jobDescription', text, setJobDescription)}
            placeholder="Paste the job description here..."
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Job description"
          />
          {fieldErrors.jobDescription && (
            <Text style={styles.errorText}>{fieldErrors.jobDescription}</Text>
          )}
        </View>
      )}

      {/* Manual fields: show for text method or if URL extraction failed */}
      {(jobInputMethod === 'text' || (jobInputMethod === 'url' && extractionAttempted && !companyExtracted)) && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Company Name *
            {jobInputMethod === 'url' && <Text style={{ color: COLORS.danger, fontSize: 11 }}> (extraction failed)</Text>}
          </Text>
          <TextInput
            style={[styles.textInput, getInputStyle('companyName')]}
            value={companyName}
            onChangeText={(text) => handleFieldChange('companyName', text, setCompanyName)}
            placeholder="e.g., Microsoft"
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel="Company name"
          />
          {fieldErrors.companyName ? (
            <Text style={styles.errorText}>{fieldErrors.companyName}</Text>
          ) : extractionError.company ? (
            <Text style={styles.errorText}>{extractionError.company}</Text>
          ) : null}
        </View>
      )}

      {(jobInputMethod === 'text' || (jobInputMethod === 'url' && extractionAttempted && !titleExtracted)) && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Job Title *
            {jobInputMethod === 'url' && <Text style={{ color: COLORS.danger, fontSize: 11 }}> (extraction failed)</Text>}
          </Text>
          <TextInput
            style={[styles.textInput, getInputStyle('jobTitle')]}
            value={jobTitle}
            onChangeText={(text) => handleFieldChange('jobTitle', text, setJobTitle)}
            placeholder="e.g., Senior Software Engineer"
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel="Job title"
          />
          {fieldErrors.jobTitle ? (
            <Text style={styles.errorText}>{fieldErrors.jobTitle}</Text>
          ) : extractionError.title ? (
            <Text style={styles.errorText}>{extractionError.title}</Text>
          ) : null}
        </View>
      )}

      {/* Resume Picker */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Attach Resume</Text>
        <Text style={[styles.helperText, { color: colors.textTertiary, marginBottom: SPACING.sm, marginTop: 0 }]}>
          Attach your resume to personalize the cover letter with your experience
        </Text>
        <View style={styles.resumeSourceRow}>
          {([
            { key: 'none' as ResumeSource, icon: X, label: 'None' },
            { key: 'existing' as ResumeSource, icon: FileText, label: 'Existing' },
            { key: 'upload' as ResumeSource, icon: Upload, label: 'Upload' },
          ]).map(({ key, icon: Icon, label }) => {
            const isActive = resumeSource === key;
            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.resumeSourceButton,
                  {
                    backgroundColor: isActive ? ALPHA_COLORS.primary.bg : (isDark ? ALPHA_COLORS.white[10] : colors.backgroundSecondary),
                    borderColor: isActive ? ALPHA_COLORS.primary.border : (isDark ? GLASS.getBorderColor() : ALPHA_COLORS.white[20]),
                  },
                ]}
                onPress={() => {
                  setResumeSource(key);
                  if (key === 'none') setSelectedResumeId(null);
                }}
                activeOpacity={0.7}
                accessibilityRole="radio"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Resume source: ${label}`}
              >
                <Icon color={isActive ? COLORS.primary : colors.textSecondary} size={16} />
                <Text style={[styles.resumeSourceLabel, { color: isActive ? COLORS.primary : colors.text }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Existing resume list */}
        {resumeSource === 'existing' && (
          <View style={styles.resumePickerList}>
            {loadingResumes ? (
              <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: SPACING.md }} />
            ) : resumes.length === 0 ? (
              <Text style={[styles.helperText, { color: colors.textTertiary, paddingVertical: SPACING.sm }]}>
                No resumes uploaded yet. Use "Upload" instead.
              </Text>
            ) : (
              resumes.map((r) => {
                const isSelected = selectedResumeId === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    style={[
                      styles.resumePickerItem,
                      {
                        backgroundColor: isSelected ? ALPHA_COLORS.primary.bg : 'transparent',
                        borderColor: isSelected ? ALPHA_COLORS.primary.border : (isDark ? GLASS.getBorderColor() : colors.backgroundSecondary),
                      },
                    ]}
                    onPress={() => setSelectedResumeId(isSelected ? null : r.id)}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Resume: ${r.candidateName || r.filename}`}
                  >
                    {isSelected ? (
                      <CheckCircle color={COLORS.primary} size={18} />
                    ) : (
                      <Circle color={colors.textSecondary} size={18} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.resumePickerName, { color: colors.text }]} numberOfLines={1}>
                        {r.candidateName || r.filename}
                      </Text>
                      <Text style={[styles.resumePickerDate, { color: colors.textTertiary }]}>
                        {new Date(r.uploadedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Upload resume */}
        {resumeSource === 'upload' && (
          <View style={{ marginTop: SPACING.sm }}>
            {uploading ? (
              <View style={styles.uploadingRow}>
                <ActivityIndicator color={COLORS.primary} size="small" />
                <Text style={[styles.helperText, { color: colors.textSecondary }]}>Uploading resume...</Text>
              </View>
            ) : selectedResumeId && resumeSource === 'upload' ? (
              <View style={[styles.uploadedSuccess, { backgroundColor: ALPHA_COLORS.success.bg, borderColor: ALPHA_COLORS.success.border }]}>
                <CheckCircle color={COLORS.success} size={18} />
                <Text style={[styles.uploadedText, { color: colors.text }]} numberOfLines={1}>
                  {resumes.find(r => r.id === selectedResumeId)?.filename || 'Resume uploaded'}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedResumeId(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Remove uploaded resume"
                >
                  <X color={colors.textTertiary} size={18} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadButton, { borderColor: isDark ? GLASS.getBorderColor() : colors.backgroundSecondary }]}
                onPress={handleFileUpload}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Choose resume file to upload"
              >
                <Upload color={colors.textSecondary} size={18} />
                <Text style={[styles.uploadButtonText, { color: colors.textSecondary }]}>
                  Choose .pdf or .docx file (max 10MB)
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Collapsible Customize Section */}
      <TouchableOpacity
        style={[
          styles.customizeToggle,
          {
            backgroundColor: isDark ? ALPHA_COLORS.white[5] : colors.backgroundSecondary,
            borderColor: isDark ? GLASS.getBorderColor() : ALPHA_COLORS.white[20],
          },
        ]}
        onPress={toggleCustomize}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Customize tone, length, and focus. Currently ${customizeExpanded ? 'expanded' : 'collapsed'}`}
        accessibilityState={{ expanded: customizeExpanded }}
      >
        <View style={styles.customizeToggleLeft}>
          <Settings2 color={colors.textSecondary} size={18} />
          <Text style={[styles.customizeToggleText, { color: colors.text }]}>Customize</Text>
          <Text style={[styles.customizeToggleSummary, { color: colors.textTertiary }]}>
            {tone} · {length} · {focus.replace('_', ' ')}
          </Text>
        </View>
        {customizeExpanded ? (
          <ChevronUp color={colors.textSecondary} size={20} />
        ) : (
          <ChevronDown color={colors.textSecondary} size={20} />
        )}
      </TouchableOpacity>

      {customizeExpanded && (
        <View style={styles.customizeContent}>
          {/* Tone */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Tone</Text>
            {renderOptionSelector(TONES, tone, setTone, 3)}
          </View>

          {/* Length */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Length</Text>
            {renderOptionSelector(LENGTHS, length, setLength, 3)}
          </View>

          {/* Focus Area */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Focus Area</Text>
            {renderOptionSelector(FOCUS_AREAS, focus, setFocus, 2)}
          </View>
        </View>
      )}

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, (generating || uploading) && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={generating || uploading}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={generating ? 'Generating cover letter' : 'Generate cover letter'}
        accessibilityState={{ disabled: generating || uploading }}
      >
        {generating ? (
          <View style={styles.generatingRow}>
            <ActivityIndicator color="#fff" size="small" />
            {generationStage === 'researching' ? (
              <View style={styles.generatingTextRow}>
                <Search color="#fff" size={16} />
                <Text style={styles.generateButtonText}>Researching {companyName || 'company'}...</Text>
              </View>
            ) : (
              <Text style={styles.generateButtonText}>Generating cover letter...</Text>
            )}
          </View>
        ) : (
          <View style={styles.generatingRow}>
            <Wand2 color="#fff" size={20} />
            <Text style={styles.generateButtonText}>Generate Cover Letter</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  // --- Main render ---
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {showGenerator ? (
          // Generator View
          <View style={{ flex: 1 }}>
            <View style={[styles.generatorHeader, { borderBottomColor: isDark ? GLASS.getBorderColor() : colors.backgroundSecondary }]}>
              <Text style={[styles.pageTitle, { color: colors.text }]}>Generate Cover Letter</Text>
              <TouchableOpacity
                onPress={() => { if (!generating) setShowGenerator(false); }}
                style={styles.closeButton}
                disabled={generating}
                accessibilityRole="button"
                accessibilityLabel="Close generator"
              >
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>
            {renderGeneratorForm()}
          </View>
        ) : (
          // Letters List View
          <View style={{ flex: 1 }}>
            <View style={styles.listHeader}>
              <View>
                <Text style={[styles.pageTitle, { color: colors.text }]}>Cover Letters</Text>
                <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
                  {letters.length} cover letter{letters.length !== 1 ? 's' : ''} generated
                </Text>
              </View>
              <TouchableOpacity
                style={styles.newButton}
                onPress={() => setShowGenerator(true)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Generate new cover letter"
              >
                <Wand2 color="#fff" size={18} />
                <Text style={styles.newButtonText}>Generate</Text>
              </TouchableOpacity>
            </View>

            {loadingLetters ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator color={COLORS.primary} size="large" />
              </View>
            ) : letters.length === 0 ? (
              renderEmptyState()
            ) : (
              <ScrollView contentContainerStyle={styles.lettersList} showsVerticalScrollIndicator={false}>
                <Text style={[styles.swipeHint, { color: colors.textTertiary }]}>
                  Swipe left on a letter to delete
                </Text>
                {letters.map(renderLetterCard)}
              </ScrollView>
            )}
          </View>
        )}
      </KeyboardAvoidingView>

      <CoverLetterDetailModal
        visible={modalVisible}
        coverLetter={selectedCoverLetter}
        onClose={() => {
          setModalVisible(false);
          setSelectedCoverLetter(null);
        }}
        onDelete={() => loadLetters()}
        onUpdate={() => loadLetters()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // List view header
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  pageTitle: {
    fontSize: 28,
    fontFamily: FONTS.semibold,
    lineHeight: 34,
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginTop: 2,
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: GLASS.getCornerRadius('medium'),
  },
  newButtonText: {
    color: '#fff',
    fontFamily: FONTS.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  // Letters list
  lettersList: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  swipeHint: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  letterCardBlur: {
    borderRadius: GLASS.getCornerRadius('medium'),
    overflow: 'hidden',
  },
  letterCard: {
    padding: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
  },
  letterCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  letterCardLeft: {
    width: 36,
    height: 36,
    borderRadius: GLASS.getCornerRadius('small'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterCardText: {
    flex: 1,
  },
  letterCardTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 2,
  },
  letterCardCompany: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
    lineHeight: 18,
  },
  letterCardRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  toneBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: GLASS.getCornerRadius('small'),
  },
  toneBadgeText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    lineHeight: 16,
    textTransform: 'capitalize',
  },
  letterCardDate: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  // Swipe delete action
  swipeDeleteAction: {
    backgroundColor: COLORS.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: GLASS.getCornerRadius('medium'),
    marginLeft: SPACING.sm,
    gap: 4,
  },
  swipeDeleteText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.semibold,
    lineHeight: 16,
  },
  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 28,
  },
  emptySubtitle: {
    fontSize: 15,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    marginTop: SPACING.sm,
  },
  emptyButtonText: {
    color: '#fff',
    fontFamily: FONTS.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Generator
  generatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  generatorScroll: {
    flex: 1,
  },
  generatorScrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },
  // Form elements
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  textInput: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    fontSize: 15,
    fontFamily: FONTS.regular,
    lineHeight: 22,
  },
  textArea: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    fontSize: 15,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    minHeight: 140,
  },
  helperText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
  // Method toggle
  methodToggle: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  methodButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  methodLabel: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    lineHeight: 20,
    marginTop: 4,
  },
  methodDesc: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  // URL extraction
  urlRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  urlInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  extractButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: GLASS.getCornerRadius('medium'),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  extractButtonDisabled: {
    opacity: 0.5,
  },
  extractButtonText: {
    color: '#fff',
    fontFamily: FONTS.semibold,
    fontSize: 14,
    lineHeight: 20,
  },
  extractionSuccess: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: GLASS.getCornerRadius('medium'),
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  extractionSuccessTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    lineHeight: 18,
    marginBottom: 4,
  },
  extractionSuccessItem: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  // Resume picker
  resumeSourceRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  resumeSourceButton: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  resumeSourceLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    lineHeight: 18,
  },
  resumePickerList: {
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  resumePickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm + 2,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
  },
  resumePickerName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    lineHeight: 20,
  },
  resumePickerDate: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    justifyContent: 'center',
  },
  uploadedSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderRadius: GLASS.getCornerRadius('medium'),
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  uploadedText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  // Customize section
  customizeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  customizeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  customizeToggleText: {
    fontSize: 15,
    fontFamily: FONTS.semibold,
    lineHeight: 22,
  },
  customizeToggleSummary: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
    flex: 1,
  },
  customizeContent: {
    marginBottom: SPACING.sm,
  },
  // Option selector grid
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionCard: {
    padding: SPACING.sm + 2,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    lineHeight: 18,
  },
  optionDesc: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    lineHeight: 14,
    marginTop: 2,
  },
  // Generate button
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: GLASS.getCornerRadius('medium'),
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: '#fff',
    fontFamily: FONTS.semibold,
    fontSize: 16,
    lineHeight: 22,
  },
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  generatingTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
});
