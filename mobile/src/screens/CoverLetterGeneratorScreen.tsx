import React, { useState, useEffect } from 'react';
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
  Loader2,
  Trash2,
} from 'lucide-react-native';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS, FONTS } from '../utils/constants';
import { CoverLetterDetailModal } from '../components/CoverLetterDetailModal';

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
      setExtractionError({ company: 'Please enter a job URL first', title: 'Please enter a job URL first' });
      return;
    }

    setExtracting(true);
    setExtractionAttempted(false);
    setExtractionError({});

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
  }

  async function handleGenerate() {
    if (!jobTitle.trim() || !companyName.trim()) {
      Alert.alert('Missing Fields', 'Please enter both a job title and company name.');
      return;
    }
    if (jobInputMethod === 'text' && !jobDescription.trim()) {
      Alert.alert('Missing Fields', 'Please enter a job description.');
      return;
    }
    if (jobInputMethod === 'url' && !jobUrl.trim()) {
      Alert.alert('Missing Fields', 'Please enter a job URL.');
      return;
    }

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
                backgroundColor: isActive ? COLORS.primary + '15' : (isDark ? colors.backgroundSecondary + '40' : colors.backgroundSecondary + '60'),
                borderColor: isActive ? COLORS.primary + '60' : (isDark ? GLASS.getBorderColor() : 'transparent'),
              },
            ]}
            onPress={() => onSelect(opt.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionLabel, { color: isActive ? COLORS.primary : colors.text }]}>{opt.label}</Text>
            <Text style={[styles.optionDesc, { color: colors.textTertiary }]}>{opt.desc}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderLetterCard = (letter: CoverLetter) => (
    <TouchableOpacity
      key={letter.id}
      activeOpacity={0.7}
      onPress={() => {
        setSelectedCoverLetter(letter);
        setModalVisible(true);
      }}
      onLongPress={() => handleDeleteLetter(letter.id)}
    >
      <BlurView
        intensity={GLASS.getBlurIntensity('subtle')}
        tint={isDark ? 'dark' : 'light'}
        style={styles.letterCardBlur}
      >
        <View style={[styles.letterCard, { borderColor: isDark ? GLASS.getBorderColor() : 'transparent' }]}>
          <View style={styles.letterCardContent}>
            <View style={styles.letterCardLeft}>
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
              <View style={[styles.toneBadge, { backgroundColor: COLORS.primary + '15' }]}>
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
      >
        <Wand2 color="#fff" size={20} />
        <Text style={styles.emptyButtonText}>Generate Cover Letter</Text>
      </TouchableOpacity>
    </View>
  );

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
                backgroundColor: jobInputMethod === 'text' ? COLORS.primary + '15' : (isDark ? colors.backgroundSecondary + '40' : colors.backgroundSecondary + '60'),
                borderColor: jobInputMethod === 'text' ? COLORS.primary + '60' : (isDark ? GLASS.getBorderColor() : 'transparent'),
              },
            ]}
            onPress={() => {
              setJobInputMethod('text');
              setExtractionAttempted(false);
              setCompanyExtracted(false);
              setTitleExtracted(false);
              setExtractionError({});
            }}
            activeOpacity={0.7}
          >
            <Type color={jobInputMethod === 'text' ? COLORS.primary : colors.textSecondary} size={18} />
            <Text style={[styles.methodLabel, { color: jobInputMethod === 'text' ? COLORS.primary : colors.text }]}>Paste Text</Text>
            <Text style={[styles.methodDesc, { color: colors.textTertiary }]}>Manually enter job details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.methodButton,
              {
                backgroundColor: jobInputMethod === 'url' ? COLORS.primary + '15' : (isDark ? colors.backgroundSecondary + '40' : colors.backgroundSecondary + '60'),
                borderColor: jobInputMethod === 'url' ? COLORS.primary + '60' : (isDark ? GLASS.getBorderColor() : 'transparent'),
              },
            ]}
            onPress={() => {
              setJobInputMethod('url');
              setExtractionAttempted(false);
              setCompanyExtracted(false);
              setTitleExtracted(false);
              setExtractionError({});
            }}
            activeOpacity={0.7}
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
              style={[
                styles.urlInput,
                {
                  color: colors.text,
                  backgroundColor: isDark ? colors.backgroundSecondary + '40' : colors.backgroundSecondary + '80',
                  borderColor: isDark ? GLASS.getBorderColor() : 'transparent',
                },
              ]}
              value={jobUrl}
              onChangeText={(text) => {
                setJobUrl(text);
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
            />
            <TouchableOpacity
              style={[
                styles.extractButton,
                (!jobUrl.trim() || extracting) && styles.extractButtonDisabled,
              ]}
              onPress={handleExtract}
              disabled={!jobUrl.trim() || extracting}
              activeOpacity={0.7}
            >
              {extracting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.extractButtonText}>Extract</Text>
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.helperText, { color: colors.textTertiary }]}>
            Paste the job URL and tap Extract to auto-fill company and title.
          </Text>
        </View>
      )}

      {/* Extraction Success */}
      {jobInputMethod === 'url' && extractionAttempted && (companyExtracted || titleExtracted) && (
        <View style={styles.extractionSuccess}>
          <CheckCircle color="#34D399" size={18} />
          <View style={{ flex: 1 }}>
            <Text style={styles.extractionSuccessTitle}>Extraction Successful!</Text>
            {companyExtracted && <Text style={styles.extractionSuccessItem}>Company: {companyName}</Text>}
            {titleExtracted && <Text style={styles.extractionSuccessItem}>Job Title: {jobTitle}</Text>}
          </View>
        </View>
      )}

      {/* Text Input - Job Description */}
      {jobInputMethod === 'text' && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Job Description *</Text>
          <TextInput
            style={[
              styles.textArea,
              {
                color: colors.text,
                backgroundColor: isDark ? colors.backgroundSecondary + '40' : colors.backgroundSecondary + '80',
                borderColor: isDark ? GLASS.getBorderColor() : 'transparent',
              },
            ]}
            value={jobDescription}
            onChangeText={setJobDescription}
            placeholder="Paste the job description here..."
            placeholderTextColor={colors.textTertiary}
            multiline
            textAlignVertical="top"
          />
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
            style={[
              styles.textInput,
              {
                color: colors.text,
                backgroundColor: isDark ? colors.backgroundSecondary + '40' : colors.backgroundSecondary + '80',
                borderColor: extractionError.company ? COLORS.danger : (isDark ? GLASS.getBorderColor() : 'transparent'),
              },
            ]}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="e.g., Microsoft"
            placeholderTextColor={colors.textTertiary}
          />
          {extractionError.company && (
            <Text style={styles.errorText}>{extractionError.company}</Text>
          )}
        </View>
      )}

      {(jobInputMethod === 'text' || (jobInputMethod === 'url' && extractionAttempted && !titleExtracted)) && (
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            Job Title *
            {jobInputMethod === 'url' && <Text style={{ color: COLORS.danger, fontSize: 11 }}> (extraction failed)</Text>}
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                color: colors.text,
                backgroundColor: isDark ? colors.backgroundSecondary + '40' : colors.backgroundSecondary + '80',
                borderColor: extractionError.title ? COLORS.danger : (isDark ? GLASS.getBorderColor() : 'transparent'),
              },
            ]}
            value={jobTitle}
            onChangeText={setJobTitle}
            placeholder="e.g., Senior Software Engineer"
            placeholderTextColor={colors.textTertiary}
          />
          {extractionError.title && (
            <Text style={styles.errorText}>{extractionError.title}</Text>
          )}
        </View>
      )}

      {/* Resume Picker */}
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Resume (Optional)</Text>
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
                    backgroundColor: isActive ? COLORS.primary + '15' : (isDark ? colors.backgroundSecondary + '40' : colors.backgroundSecondary + '60'),
                    borderColor: isActive ? COLORS.primary + '60' : (isDark ? GLASS.getBorderColor() : 'transparent'),
                  },
                ]}
                onPress={() => {
                  setResumeSource(key);
                  if (key === 'none') setSelectedResumeId(null);
                }}
                activeOpacity={0.7}
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
                        backgroundColor: isSelected ? COLORS.primary + '15' : 'transparent',
                        borderColor: isSelected ? COLORS.primary + '40' : (isDark ? GLASS.getBorderColor() : colors.backgroundSecondary),
                      },
                    ]}
                    onPress={() => setSelectedResumeId(isSelected ? null : r.id)}
                    activeOpacity={0.7}
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
              <View style={styles.uploadedSuccess}>
                <CheckCircle color="#34D399" size={18} />
                <Text style={[styles.uploadedText, { color: colors.text }]} numberOfLines={1}>
                  {resumes.find(r => r.id === selectedResumeId)?.filename || 'Resume uploaded'}
                </Text>
                <TouchableOpacity onPress={() => setSelectedResumeId(null)}>
                  <X color={colors.textTertiary} size={18} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadButton, { borderColor: isDark ? GLASS.getBorderColor() : colors.backgroundSecondary }]}
                onPress={handleFileUpload}
                activeOpacity={0.7}
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

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, (generating || uploading) && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={generating || uploading}
        activeOpacity={0.7}
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {showGenerator ? (
          // Generator View
          <View style={{ flex: 1 }}>
            <View style={[styles.generatorHeader, { borderBottomColor: isDark ? GLASS.getBorderColor() : colors.backgroundSecondary }]}>
              <Text style={[styles.pageTitle, { color: colors.text }]}>Generate Cover Letter</Text>
              <TouchableOpacity
                onPress={() => { if (!generating) { setShowGenerator(false); resetGeneratorForm(); } }}
                style={styles.closeButton}
                disabled={generating}
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
  },
  pageSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
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
  },
  // Letters list
  lettersList: {
    padding: SPACING.md,
    gap: SPACING.sm,
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
    marginBottom: 2,
  },
  letterCardCompany: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
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
    textTransform: 'capitalize',
  },
  letterCardDate: {
    fontSize: 11,
    fontFamily: FONTS.regular,
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
    marginBottom: SPACING.sm,
  },
  textInput: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    fontSize: 15,
    fontFamily: FONTS.regular,
  },
  textArea: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: 1,
    fontSize: 15,
    fontFamily: FONTS.regular,
    minHeight: 140,
  },
  helperText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
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
    marginTop: 4,
  },
  methodDesc: {
    fontSize: 11,
    fontFamily: FONTS.regular,
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
  },
  extractionSuccess: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    backgroundColor: '#34D39915',
    borderColor: '#34D39940',
    borderWidth: 1,
    borderRadius: GLASS.getCornerRadius('medium'),
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  extractionSuccessTitle: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: '#34D399',
    marginBottom: 4,
  },
  extractionSuccessItem: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#34D399',
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
  },
  resumePickerDate: {
    fontSize: 11,
    fontFamily: FONTS.regular,
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
    backgroundColor: '#34D39915',
    borderColor: '#34D39940',
    borderWidth: 1,
    borderRadius: GLASS.getCornerRadius('medium'),
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  uploadedText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
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
  },
  optionDesc: {
    fontSize: 10,
    fontFamily: FONTS.regular,
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
