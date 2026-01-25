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
import { useNavigation, useFocusEffect, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Target, Link, FileText, ChevronDown, Sparkles, Building2, ArrowLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Resume {
  id: number;
  filename: string;
  name?: string;
  skills_count: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TailorResumeRouteProp = RouteProp<RootStackParamList, 'TailorResume'>;

export default function TailorResumeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TailorResumeRouteProp>();
  const initialResumeId = route.params?.resumeId;

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(initialResumeId || null);
  const [jobUrl, setJobUrl] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [tailoring, setTailoring] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [showResumeSelector, setShowResumeSelector] = useState(false);

  const loadResumes = async () => {
    try {
      const result = await api.getResumes();
      if (result.success && result.data) {
        setResumes(result.data);
        // If initialResumeId is set, use it; otherwise use the first resume
        if (result.data.length > 0 && !selectedResumeId) {
          const targetId = initialResumeId || result.data[0].id;
          setSelectedResumeId(targetId);
        }
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadResumes();
    }, [])
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
      } else {
        Alert.alert('Note', 'Could not extract job details. Please enter them manually.');
      }
    } catch (error) {
      console.error('Error extracting job:', error);
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
      const result = await api.tailorResume({
        baseResumeId: selectedResumeId,
        jobUrl: jobUrl.trim() || undefined,
        company: company.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
      });

      if (result.success && result.data) {
        Alert.alert(
          'Success',
          'Your resume has been tailored! View it in the Saved tab.',
          [{ text: 'OK' }]
        );
        // Reset form
        setJobUrl('');
        setCompany('');
        setJobTitle('');
      } else {
        Alert.alert('Error', result.error || 'Failed to tailor resume');
      }
    } catch (error) {
      console.error('Error tailoring:', error);
      Alert.alert('Error', 'Failed to tailor resume');
    } finally {
      setTailoring(false);
    }
  };

  const selectedResume = resumes.find((r) => r.id === selectedResumeId);

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.header}>
          {initialResumeId && (
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
                style={[styles.extractButton, extracting && styles.extractButtonDisabled]}
                onPress={handleExtractJob}
                disabled={extracting || !jobUrl.trim()}
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
    fontWeight: 'bold',
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
    fontWeight: '600',
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
    color: COLORS.dark.text,
  },
  selectorOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  selectorOptionMeta: {
    fontSize: 12,
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
    fontWeight: '600',
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
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
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
    fontWeight: '600',
    color: COLORS.dark.background,
  },
});
