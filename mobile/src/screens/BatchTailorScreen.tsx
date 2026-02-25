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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft, FileText, ChevronDown, Plus, X, Target,
  Layers, CheckCircle, AlertCircle, Clock
} from 'lucide-react-native';
import { GlassButton } from '../components/glass/GlassButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { useResumeStore } from '../stores/resumeStore';

interface BatchResult {
  jobUrl: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
  tailoredResumeId?: number;
  company?: string;
  title?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MAX_JOBS = 10;

export default function BatchTailorScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();

  // Resume store
  const {
    resumes,
    selectedResumeId,
    setSelectedResumeId,
    loading: resumesLoading,
    fetchResumes,
  } = useResumeStore();

  // Form state
  const [jobUrls, setJobUrls] = useState<string[]>(['']);
  const [showResumeSelector, setShowResumeSelector] = useState(false);

  // Batch processing state
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!showResults) {
        fetchResumes();
      }
    }, [showResults])
  );

  // Auto-select first resume if none selected
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId, setSelectedResumeId]);

  const handleAddUrl = () => {
    if (jobUrls.length < MAX_JOBS) {
      setJobUrls([...jobUrls, '']);
    }
  };

  const handleRemoveUrl = (index: number) => {
    if (jobUrls.length > 1) {
      const newUrls = jobUrls.filter((_, i) => i !== index);
      setJobUrls(newUrls);
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...jobUrls];
    newUrls[index] = value;
    setJobUrls(newUrls);
  };

  const handleBatchTailor = async () => {
    if (!selectedResumeId) {
      Alert.alert('Error', 'Please select a resume');
      return;
    }

    const validUrls = jobUrls.filter(url => url.trim().length > 0);
    if (validUrls.length === 0) {
      Alert.alert('Error', 'Please enter at least one job URL');
      return;
    }

    setProcessing(true);
    setResults(validUrls.map(url => ({
      jobUrl: url,
      status: 'pending',
    })));
    setShowResults(true);

    try {
      // Update status to processing
      setResults(prev => prev.map(r => ({ ...r, status: 'processing' as const })));

      const result = await api.tailorResumeBatch({
        baseResumeId: selectedResumeId,
        jobUrls: validUrls,
      });

      if (result.success && result.data) {
        // Update results with success/error status
        const batchResults = result.data.results || [];
        setResults(validUrls.map((url, index) => {
          const jobResult = batchResults[index];
          if (jobResult?.success) {
            return {
              jobUrl: url,
              status: 'success' as const,
              tailoredResumeId: jobResult.tailored_resume_id,
              company: jobResult.company,
              title: jobResult.title,
            };
          } else {
            return {
              jobUrl: url,
              status: 'error' as const,
              error: jobResult?.error || 'Failed to tailor',
            };
          }
        }));
      } else {
        // All failed
        setResults(validUrls.map(url => ({
          jobUrl: url,
          status: 'error' as const,
          error: result.error || 'Batch tailoring failed',
        })));
      }
    } catch (error: any) {
      setResults(validUrls.map(url => ({
        jobUrl: url,
        status: 'error' as const,
        error: error.message || 'An error occurred',
      })));
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setResults([]);
    setJobUrls(['']);
  };

  const handleViewResult = (tailoredResumeId: number) => {
    navigation.navigate('TailorResume', { resumeId: tailoredResumeId });
  };

  const selectedResume = resumes?.find((r) => r.id === selectedResumeId);
  const validUrlCount = jobUrls.filter(url => url.trim().length > 0).length;
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;

  // Loading state
  if (resumesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Results View
  if (showResults) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleReset}
            accessibilityRole="button"
            accessibilityLabel="Reset and start new batch"
            accessibilityHint="Returns to batch input screen"
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Batch Results</Text>
        </View>

        {/* Summary Banner */}
        <View style={[styles.summaryBanner, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          {processing ? (
            <>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={[styles.summaryText, { color: colors.text }]}>
                Processing {validUrlCount} jobs...
              </Text>
            </>
          ) : (
            <>
              <Layers color={COLORS.primary} size={20} />
              <Text style={[styles.summaryText, { color: colors.text }]}>
                {successCount} succeeded, {errorCount} failed
              </Text>
            </>
          )}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.resultsContainer}
        >
          {results.map((result, index) => (
            <View
              key={index}
              style={[
                styles.resultCard,
                { backgroundColor: colors.glass, borderColor: colors.glassBorder }
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={styles.resultStatus}>
                  {result.status === 'pending' && (
                    <Clock color={colors.textSecondary} size={20} />
                  )}
                  {result.status === 'processing' && (
                    <ActivityIndicator size="small" color={COLORS.primary} />
                  )}
                  {result.status === 'success' && (
                    <CheckCircle color={COLORS.success} size={20} />
                  )}
                  {result.status === 'error' && (
                    <AlertCircle color={COLORS.danger} size={20} />
                  )}
                </View>
                <View style={styles.resultInfo}>
                  {result.company ? (
                    <>
                      <Text style={[styles.resultCompany, { color: colors.text }]} numberOfLines={1}>
                        {result.company}
                      </Text>
                      <Text style={[styles.resultTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                        {result.title}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.resultUrl, { color: colors.textSecondary }]} numberOfLines={2}>
                      {result.jobUrl}
                    </Text>
                  )}
                </View>
              </View>

              {result.error && (
                <Text style={[styles.resultError, { color: COLORS.danger }]}>
                  {result.error}
                </Text>
              )}

              {result.status === 'success' && result.tailoredResumeId && (
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewResult(result.tailoredResumeId!)}
                  accessibilityRole="button"
                  accessibilityLabel={`View tailored resume for ${result.company || 'this job'}`}
                  accessibilityHint="Opens the tailored resume details"
                >
                  <Text style={styles.viewButtonText}>View Result</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <GlassButton
            label="Start New Batch"
            variant="secondary"
            onPress={handleReset}
            fullWidth
            accessibilityLabel="Start new batch tailoring"
            accessibilityHint="Resets the form to create another batch of tailored resumes"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Empty state - no resumes
  if (resumes.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Batch Tailor</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <FileText color={colors.textTertiary} size={64} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Resumes</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Upload a resume first to start batch tailoring.
          </Text>
          <TouchableOpacity
            style={[styles.uploadButton, { backgroundColor: colors.text }]}
            onPress={() => navigation.navigate('UploadResume')}
            accessibilityRole="button"
            accessibilityLabel="Upload new resume"
            accessibilityHint="Navigates to upload screen to select and upload a resume"
          >
            <Text style={[styles.uploadButtonText, { color: colors.background }]}>Upload Resume</Text>
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
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            accessibilityHint="Returns to the previous screen"
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Batch Tailor</Text>
        </View>

        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: ALPHA_COLORS.primary.bg, borderColor: ALPHA_COLORS.primary.border }]}>
          <Layers color={COLORS.primary} size={20} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Tailor your resume for up to {MAX_JOBS} jobs at once
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Resume Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Select Resume</Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
              onPress={() => setShowResumeSelector(!showResumeSelector)}
              accessibilityRole="button"
              accessibilityLabel={`Selected resume: ${selectedResume?.filename || 'None selected'}`}
              accessibilityHint={showResumeSelector ? "Collapse resume list" : "Expand to select a resume"}
              accessibilityState={{ expanded: showResumeSelector }}
            >
              <View style={styles.selectorContent}>
                <FileText color={COLORS.primary} size={20} />
                <Text style={[styles.selectorText, { color: colors.text }]} numberOfLines={1}>
                  {selectedResume?.filename || 'Select a resume'}
                </Text>
              </View>
              <ChevronDown
                color={colors.textSecondary}
                size={20}
                style={showResumeSelector ? { transform: [{ rotate: '180deg' }] } : {}}
              />
            </TouchableOpacity>

            {showResumeSelector && (
              <View style={[styles.selectorDropdown, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                {resumes.map((resume) => (
                  <TouchableOpacity
                    key={resume.id}
                    style={[
                      styles.selectorOption,
                      selectedResumeId === resume.id && [styles.selectorOptionSelected, { backgroundColor: colors.glass }],
                    ]}
                    onPress={() => {
                      setSelectedResumeId(resume.id);
                      setShowResumeSelector(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`${resume.filename}, ${resume.skills_count} skills`}
                    accessibilityHint="Select this resume for batch tailoring"
                    accessibilityState={{ selected: selectedResumeId === resume.id }}
                  >
                    <Text
                      style={[
                        styles.selectorOptionText, { color: colors.text },
                        selectedResumeId === resume.id && styles.selectorOptionTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {resume.filename}
                    </Text>
                    <Text style={[styles.selectorOptionMeta, { color: colors.textTertiary }]}>
                      {resume.skills_count} skills
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Job URLs */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Job URLs</Text>
              <Text style={[styles.urlCount, { color: colors.textTertiary }]}>
                {validUrlCount}/{MAX_JOBS}
              </Text>
            </View>

            {jobUrls.map((url, index) => (
              <View key={index} style={styles.urlInputRow}>
                <View style={[styles.urlInputWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                  <Text style={[styles.urlNumber, { color: colors.textTertiary }]}>{index + 1}</Text>
                  <TextInput
                    style={[styles.urlInput, { color: colors.text }]}
                    placeholder="https://linkedin.com/jobs/..."
                    placeholderTextColor={colors.textTertiary}
                    value={url}
                    onChangeText={(value) => handleUrlChange(index, value)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    accessibilityLabel={`Job URL ${index + 1}`}
                    accessibilityHint="Enter the web address of the job posting"
                  />
                </View>
                {jobUrls.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveUrl(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove job URL ${index + 1}`}
                    accessibilityHint="Removes this job URL from the batch"
                  >
                    <X color={COLORS.danger} size={20} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {jobUrls.length < MAX_JOBS && (
              <TouchableOpacity
                style={[styles.addButton, { borderColor: isDark ? colors.glassBorder : 'transparent', borderWidth: isDark ? 1 : 0 }]}
                onPress={handleAddUrl}
                accessibilityRole="button"
                accessibilityLabel="Add another job URL"
                accessibilityHint={`Adds a new job URL input. ${jobUrls.length} of ${MAX_JOBS} URLs added`}
              >
                <Plus color={COLORS.primary} size={20} />
                <Text style={[styles.addButtonText, { color: COLORS.primary }]}>Add Another URL</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <GlassButton
            label={processing ? 'Processing...' : `Tailor ${validUrlCount} Resume${validUrlCount !== 1 ? 's' : ''}`}
            variant="primary"
            onPress={handleBatchTailor}
            disabled={processing || validUrlCount === 0}
            loading={processing}
            icon={!processing ? <Target color="#fff" size={20} /> : undefined}
            fullWidth
            accessibilityLabel={processing ? 'Processing batch tailoring' : `Tailor ${validUrlCount} resume${validUrlCount !== 1 ? 's' : ''} for ${validUrlCount} job${validUrlCount !== 1 ? 's' : ''}`}
            accessibilityHint={validUrlCount === 0 ? "Add at least one job URL to continue" : "Starts batch tailoring process for all entered job URLs"}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.sm,
    paddingBottom: SPACING.xs,
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
  },
  titleWithBack: {
    fontSize: 24,
  },
  pageTitle: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  infoText: {
    ...TYPOGRAPHY.subhead,
    flex: 1,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  summaryText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  resultsContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urlCount: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.md,
    borderWidth: 1,
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
    flex: 1,
  },
  selectorDropdown: {
    marginTop: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  selectorOption: {
    padding: SPACING.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  selectorOptionSelected: {},
  selectorOptionText: {
    ...TYPOGRAPHY.subhead,
  },
  selectorOptionTextSelected: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  selectorOptionMeta: {
    ...TYPOGRAPHY.caption1,
    marginTop: 2,
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  urlInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    minHeight: 48,
  },
  urlNumber: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    width: 24,
    textAlign: 'center',
    marginLeft: SPACING.sm,
  },
  urlInput: {
    flex: 1,
    ...TYPOGRAPHY.subhead,
    padding: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    minHeight: 48,
  },
  addButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  footer: {
    padding: SPACING.lg,
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
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  uploadButton: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  uploadButtonText: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  resultStatus: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultCompany: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
  resultTitle: {
    ...TYPOGRAPHY.subhead,
    marginTop: 2,
  },
  resultUrl: {
    ...TYPOGRAPHY.caption1,
  },
  resultError: {
    ...TYPOGRAPHY.caption1,
    marginTop: SPACING.sm,
    marginLeft: 36,
  },
  viewButton: {
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  viewButtonText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    color: '#fff',
  },
});
