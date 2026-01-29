import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Target, Link, FileText, ChevronDown, Sparkles, Building2, ArrowLeft,
  Check, Download, RefreshCw, Bookmark, Briefcase, ChevronRight
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Resume {
  id: number;
  filename: string;
  name?: string;
  skills_count: number;
}

interface BaseResumeData {
  id: number;
  filename: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string[];
  experience?: any[];
  education?: string;
  certifications?: string;
}

interface TailoredResumeData {
  id: number;
  summary: string;
  competencies: string[];
  experience: any[];
  education: string;
  certifications: string;
  alignment_statement: string;
  company: string;
  title: string;
  docx_path: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TailorResumeRouteProp = RouteProp<RootStackParamList, 'TailorResume'>;

export default function TailorResumeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TailorResumeRouteProp>();
  const initialResumeId = route.params?.resumeId;

  // Form state
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(initialResumeId || null);
  const [jobUrl, setJobUrl] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [tailoring, setTailoring] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [showResumeSelector, setShowResumeSelector] = useState(false);

  // Comparison view state
  const [showComparison, setShowComparison] = useState(false);
  const [baseResumeData, setBaseResumeData] = useState<BaseResumeData | null>(null);
  const [tailoredResumeData, setTailoredResumeData] = useState<TailoredResumeData | null>(null);
  const [activeTab, setActiveTab] = useState<'original' | 'tailored'>('tailored');
  const [saving, setSaving] = useState(false);

  const loadResumes = async () => {
    try {
      const result = await api.getResumes();
      if (result.success && result.data) {
        const resumeList = Array.isArray(result.data) ? result.data : [];
        setResumes(resumeList);
        if (resumeList.length > 0 && !selectedResumeId) {
          const targetId = initialResumeId || resumeList[0].id;
          setSelectedResumeId(targetId);
        }
      } else {
        console.error('Failed to load resumes:', result.error);
        setResumes([]);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Only load if not showing comparison
      if (!showComparison) {
        loadResumes();
      }
    }, [showComparison])
  );

  const handleExtractJob = async () => {
    if (!jobUrl.trim()) {
      Alert.alert('Error', 'Please enter a job URL');
      return;
    }

    setExtracting(true);
    try {
      const result = await api.extractJobDetails(jobUrl);
      if (result.success && result.data) {
        setCompany(result.data.company || '');
        setJobTitle(result.data.title || '');
        Alert.alert('Success', 'Job details extracted successfully!');
      } else {
        Alert.alert('Error', result.error || 'Could not extract job details. Please enter them manually.');
      }
    } catch (error: any) {
      console.error('Error extracting job:', error);
      Alert.alert('Error', error.message || 'Failed to extract job details. Please try again.');
    } finally {
      setExtracting(false);
    }
  };

  const handleTailor = async () => {
    if (!selectedResumeId) {
      Alert.alert('Error', 'Please select a resume');
      return;
    }

    if (!jobUrl.trim() && !company.trim()) {
      Alert.alert('Error', 'Please enter a job URL or company name');
      return;
    }

    setTailoring(true);
    try {
      // First, fetch the base resume data for comparison
      const baseResult = await api.getResume(selectedResumeId);
      if (!baseResult.success || !baseResult.data) {
        throw new Error('Failed to fetch base resume data');
      }
      setBaseResumeData(baseResult.data);

      // Now tailor the resume
      const result = await api.tailorResume({
        baseResumeId: selectedResumeId,
        jobUrl: jobUrl.trim() || undefined,
        company: company.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
      });

      if (result.success && result.data) {
        // Store the tailored resume data
        setTailoredResumeData({
          id: result.data.tailored_resume_id,
          summary: result.data.summary,
          competencies: result.data.competencies || [],
          experience: result.data.experience || [],
          education: result.data.education || '',
          certifications: result.data.certifications || '',
          alignment_statement: result.data.alignment_statement || '',
          company: result.data.company || company,
          title: result.data.title || jobTitle,
          docx_path: result.data.docx_path || '',
        });

        // Show the comparison view
        setShowComparison(true);
        setActiveTab('tailored');
      } else {
        console.error('Tailoring failed:', result.error);
        Alert.alert('Error', result.error || 'Failed to tailor resume. Please try again.');
      }
    } catch (error: any) {
      console.error('Error tailoring:', error);
      Alert.alert('Error', error.message || 'Failed to tailor resume. Please check your connection.');
    } finally {
      setTailoring(false);
    }
  };

  const handleStartNew = () => {
    setShowComparison(false);
    setBaseResumeData(null);
    setTailoredResumeData(null);
    setJobUrl('');
    setCompany('');
    setJobTitle('');
    setActiveTab('tailored');
  };

  const handleSaveComparison = async () => {
    if (!tailoredResumeData) return;

    setSaving(true);
    try {
      const result = await api.saveComparison({
        tailoredResumeId: tailoredResumeData.id,
        title: `${tailoredResumeData.company} - ${tailoredResumeData.title}`,
      });

      if (result.success) {
        Alert.alert('Saved', 'Comparison saved successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to save comparison');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save comparison');
    } finally {
      setSaving(false);
    }
  };

  const handleViewInterviewPrep = () => {
    if (tailoredResumeData) {
      navigation.navigate('InterviewPrep', { tailoredResumeId: tailoredResumeData.id });
    }
  };

  const selectedResume = resumes?.find((r) => r.id === selectedResumeId);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Comparison View
  if (showComparison && baseResumeData && tailoredResumeData) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.comparisonHeader}>
          <TouchableOpacity
            style={styles.comparisonBackButton}
            onPress={handleStartNew}
          >
            <ArrowLeft color={COLORS.dark.text} size={24} />
          </TouchableOpacity>
          <View style={styles.comparisonHeaderContent}>
            <Text style={styles.comparisonTitle}>Resume Comparison</Text>
            <Text style={styles.comparisonSubtitle}>
              Tailored for {tailoredResumeData.company}
            </Text>
          </View>
        </View>

        {/* Success Banner */}
        <View style={styles.successBanner}>
          <Check color={COLORS.success} size={20} />
          <Text style={styles.successText}>Resume Successfully Tailored!</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'original' && styles.tabActive]}
            onPress={() => setActiveTab('original')}
          >
            <FileText
              color={activeTab === 'original' ? COLORS.primary : COLORS.dark.textSecondary}
              size={18}
            />
            <Text style={[styles.tabText, activeTab === 'original' && styles.tabTextActive]}>
              Original
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'tailored' && styles.tabActive]}
            onPress={() => setActiveTab('tailored')}
          >
            <Sparkles
              color={activeTab === 'tailored' ? COLORS.success : COLORS.dark.textSecondary}
              size={18}
            />
            <Text style={[styles.tabText, activeTab === 'tailored' && styles.tabTextActive]}>
              Tailored
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.comparisonContent} contentContainerStyle={styles.comparisonContentContainer}>
          {activeTab === 'original' ? (
            // Original Resume Content
            <View>
              {/* Summary */}
              <View style={styles.comparisonSection}>
                <Text style={styles.sectionHeader}>Professional Summary</Text>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText}>
                    {baseResumeData.summary || 'No summary available'}
                  </Text>
                </View>
              </View>

              {/* Skills */}
              <View style={styles.comparisonSection}>
                <Text style={styles.sectionHeader}>Skills</Text>
                <View style={styles.skillsContainer}>
                  {(baseResumeData.skills || []).map((skill, index) => (
                    <View key={index} style={styles.skillPill}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                  {(!baseResumeData.skills || baseResumeData.skills.length === 0) && (
                    <Text style={styles.emptyText}>No skills listed</Text>
                  )}
                </View>
              </View>

              {/* Experience */}
              <View style={styles.comparisonSection}>
                <Text style={styles.sectionHeader}>Experience</Text>
                {(baseResumeData.experience || []).map((exp, index) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.experienceHeader}>{exp.header || exp.title}</Text>
                    {(exp.bullets || []).map((bullet: string, bIndex: number) => (
                      <Text key={bIndex} style={styles.bulletPoint}>• {bullet}</Text>
                    ))}
                  </View>
                ))}
                {(!baseResumeData.experience || baseResumeData.experience.length === 0) && (
                  <Text style={styles.emptyText}>No experience listed</Text>
                )}
              </View>

              {/* Education */}
              <View style={styles.comparisonSection}>
                <Text style={styles.sectionHeader}>Education</Text>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText}>
                    {baseResumeData.education || 'No education listed'}
                  </Text>
                </View>
              </View>

              {/* Certifications */}
              <View style={styles.comparisonSection}>
                <Text style={styles.sectionHeader}>Certifications</Text>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText}>
                    {baseResumeData.certifications || 'No certifications listed'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            // Tailored Resume Content
            <View>
              {/* Summary - Highlighted as changed */}
              <View style={[styles.comparisonSection, styles.changedSection]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeader}>Professional Summary</Text>
                  <View style={styles.changedBadge}>
                    <Text style={styles.changedBadgeText}>Enhanced</Text>
                  </View>
                </View>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText}>
                    {tailoredResumeData.summary}
                  </Text>
                </View>
              </View>

              {/* Core Competencies - Highlighted as changed */}
              <View style={[styles.comparisonSection, styles.changedSection]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeader}>Core Competencies</Text>
                  <View style={styles.changedBadge}>
                    <Text style={styles.changedBadgeText}>Tailored</Text>
                  </View>
                </View>
                <View style={styles.skillsContainer}>
                  {tailoredResumeData.competencies.map((skill, index) => (
                    <View key={index} style={[styles.skillPill, styles.tailoredSkillPill]}>
                      <Text style={styles.skillText}>{skill}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Experience - Highlighted as changed */}
              <View style={[styles.comparisonSection, styles.changedSection]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeader}>Experience</Text>
                  <View style={styles.changedBadge}>
                    <Text style={styles.changedBadgeText}>Reframed</Text>
                  </View>
                </View>
                {tailoredResumeData.experience.map((exp, index) => (
                  <View key={index} style={styles.experienceItem}>
                    <Text style={styles.experienceHeader}>{exp.header}</Text>
                    {(exp.bullets || []).map((bullet: string, bIndex: number) => (
                      <Text key={bIndex} style={styles.bulletPoint}>• {bullet}</Text>
                    ))}
                  </View>
                ))}
              </View>

              {/* Education */}
              <View style={styles.comparisonSection}>
                <Text style={styles.sectionHeader}>Education</Text>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText}>
                    {tailoredResumeData.education || baseResumeData.education || 'No education listed'}
                  </Text>
                </View>
              </View>

              {/* Certifications */}
              <View style={styles.comparisonSection}>
                <Text style={styles.sectionHeader}>Certifications</Text>
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionText}>
                    {tailoredResumeData.certifications || baseResumeData.certifications || 'No certifications listed'}
                  </Text>
                </View>
              </View>

              {/* Alignment Statement - New Section */}
              {tailoredResumeData.alignment_statement && (
                <View style={[styles.comparisonSection, styles.newSection]}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionHeader}>Company Alignment</Text>
                    <View style={styles.newBadge}>
                      <Text style={styles.newBadgeText}>New</Text>
                    </View>
                  </View>
                  <View style={styles.sectionContent}>
                    <Text style={styles.sectionText}>
                      {tailoredResumeData.alignment_statement}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.comparisonFooter}>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSaveComparison}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Bookmark color={COLORS.primary} size={18} />
              )}
              <Text style={styles.secondaryButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.interviewPrepButton}
              onPress={handleViewInterviewPrep}
            >
              <Briefcase color="#fff" size={18} />
              <Text style={styles.interviewPrepButtonText}>Interview Prep</Text>
              <ChevronRight color="#fff" size={18} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.startNewButton}
            onPress={handleStartNew}
          >
            <RefreshCw color={COLORS.dark.textSecondary} size={18} />
            <Text style={styles.startNewButtonText}>Start New Tailoring</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no resumes
  if (resumes.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Tailor Resume</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <FileText color={COLORS.dark.textTertiary} size={64} />
          </View>
          <Text style={styles.emptyTitle}>No Resumes</Text>
          <Text style={styles.emptyText}>
            Upload a resume first to start tailoring it for specific jobs.
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => navigation.navigate('UploadResume')}
          >
            <Text style={styles.uploadButtonText}>Upload Resume</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main Form View
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          {initialResumeId && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Returns to the previous screen"
            >
              <ArrowLeft color={COLORS.dark.text} size={24} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, initialResumeId && styles.titleWithBack]}>Tailor Resume</Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Resume Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Resume</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setShowResumeSelector(!showResumeSelector)}
              accessibilityRole="button"
              accessibilityLabel={`Resume selector: ${selectedResume?.filename || 'No resume selected'}`}
              accessibilityHint={showResumeSelector ? 'Collapses resume list' : 'Expands resume list'}
              accessibilityState={{ expanded: showResumeSelector }}
            >
              <View style={styles.selectorContent}>
                <FileText color={COLORS.primary} size={20} />
                <Text style={styles.selectorText} numberOfLines={1}>
                  {selectedResume?.filename || 'Select a resume'}
                </Text>
              </View>
              <ChevronDown
                color={COLORS.dark.textSecondary}
                size={20}
                style={showResumeSelector ? { transform: [{ rotate: '180deg' }] } : {}}
              />
            </TouchableOpacity>

            {showResumeSelector && (
              <View style={styles.selectorDropdown}>
                {resumes.map((resume) => (
                  <TouchableOpacity
                    key={resume.id}
                    style={[
                      styles.selectorOption,
                      selectedResumeId === resume.id && styles.selectorOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedResumeId(resume.id);
                      setShowResumeSelector(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${resume.filename}`}
                    accessibilityHint={`${resume.skills_count} skills`}
                    accessibilityState={{ selected: selectedResumeId === resume.id }}
                  >
                    <Text
                      style={[
                        styles.selectorOptionText,
                        selectedResumeId === resume.id && styles.selectorOptionTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {resume.filename}
                    </Text>
                    <Text style={styles.selectorOptionMeta}>
                      {resume.skills_count} skills
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Job URL Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Posting URL</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <Link color={COLORS.dark.textTertiary} size={20} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="https://linkedin.com/jobs/..."
                  placeholderTextColor={COLORS.dark.textTertiary}
                  value={jobUrl}
                  onChangeText={setJobUrl}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.extractButton,
                  (extracting || !jobUrl.trim()) && styles.extractButtonDisabled
                ]}
                onPress={handleExtractJob}
                disabled={extracting || !jobUrl.trim()}
                accessibilityRole="button"
                accessibilityLabel={extracting ? 'Extracting job details' : 'Extract job details from URL'}
                accessibilityHint="Uses AI to extract company name and job title from the job posting URL"
                accessibilityState={{ disabled: extracting || !jobUrl.trim(), busy: extracting }}
              >
                {extracting ? (
                  <ActivityIndicator size="small" color={COLORS.dark.text} />
                ) : (
                  <Sparkles color={COLORS.dark.text} size={20} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>
              Paste a job URL to auto-extract company and job details
            </Text>
          </View>

          {/* Manual Entry */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR ENTER MANUALLY</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company</Text>
            <View style={styles.inputWrapper}>
              <Building2 color={COLORS.dark.textTertiary} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Company name"
                placeholderTextColor={COLORS.dark.textTertiary}
                value={company}
                onChangeText={setCompany}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Title</Text>
            <View style={styles.inputWrapper}>
              <Target color={COLORS.dark.textTertiary} size={20} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Job title"
                placeholderTextColor={COLORS.dark.textTertiary}
                value={jobTitle}
                onChangeText={setJobTitle}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.tailorButton, tailoring && styles.tailorButtonDisabled]}
            onPress={handleTailor}
            disabled={tailoring}
            accessibilityRole="button"
            accessibilityLabel={tailoring ? 'Tailoring resume in progress' : 'Tailor resume for this job'}
            accessibilityHint="Uses AI to customize your resume for the specific company and job posting"
            accessibilityState={{ disabled: tailoring, busy: tailoring }}
          >
            {tailoring ? (
              <>
                <ActivityIndicator color={COLORS.dark.background} />
                <Text style={styles.tailorButtonText}>Tailoring...</Text>
              </>
            ) : (
              <>
                <Target color={COLORS.dark.background} size={20} />
                <Text style={styles.tailorButtonText}>Tailor Resume</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.dark.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -SPACING.sm,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.extralight,
    color: COLORS.dark.text,
  },
  titleWithBack: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.md,
    minHeight: 48,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  selectorText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
    flex: 1,
  },
  selectorDropdown: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.dark.backgroundSecondary,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dark.border,
    overflow: 'hidden',
  },
  selectorOption: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
    minHeight: 48,
    justifyContent: 'center',
  },
  selectorOptionSelected: {
    backgroundColor: COLORS.dark.glass,
  },
  selectorOptionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
  },
  selectorOptionTextSelected: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  selectorOptionMeta: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textTertiary,
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    minHeight: 48,
  },
  inputIcon: {
    marginLeft: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
    padding: SPACING.md,
  },
  extractButton: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extractButtonDisabled: {
    opacity: 0.5,
  },
  inputHint: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textTertiary,
    marginTop: SPACING.xs,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.dark.border,
  },
  dividerText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textTertiary,
    marginHorizontal: SPACING.md,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
  },
  tailorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  tailorButtonDisabled: {
    opacity: 0.7,
  },
  tailorButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  uploadButton: {
    backgroundColor: COLORS.dark.text,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.background,
  },

  // Comparison View Styles
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  comparisonBackButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -SPACING.sm,
    marginRight: SPACING.sm,
  },
  comparisonHeaderContent: {
    flex: 1,
  },
  comparisonTitle: {
    fontSize: 24,
    fontFamily: FONTS.extralight,
    color: COLORS.dark.text,
  },
  comparisonSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    marginTop: 2,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  successText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.success,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.dark.backgroundSecondary,
    borderRadius: RADIUS.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  tabActive: {
    backgroundColor: COLORS.dark.glass,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark.textSecondary,
  },
  tabTextActive: {
    color: COLORS.dark.text,
  },
  comparisonContent: {
    flex: 1,
  },
  comparisonContentContainer: {
    padding: SPACING.lg,
  },
  comparisonSection: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  changedSection: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  newSection: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  sectionHeader: {
    fontSize: 14,
    fontFamily: FONTS.extralight,
    color: COLORS.dark.text,
    padding: SPACING.md,
    paddingBottom: 0,
  },
  changedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  changedBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    color: COLORS.success,
    textTransform: 'uppercase',
  },
  newBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  sectionContent: {
    padding: SPACING.md,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.text,
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    padding: SPACING.md,
  },
  skillPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  tailoredSkillPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  skillText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.dark.text,
  },
  experienceItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  experienceHeader: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  bulletPoint: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  comparisonFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
    gap: SPACING.sm,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.dark.glass,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 44,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  interviewPrepButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.purple,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 44,
  },
  interviewPrepButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: '#fff',
  },
  startNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
  startNewButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.dark.textSecondary,
  },
});
