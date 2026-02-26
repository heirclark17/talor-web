import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Upload, FileText, CheckCircle, AlertCircle, Trash2, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
let DocumentPicker: typeof import('expo-document-picker') | null = null;
try { DocumentPicker = require('expo-document-picker'); } catch {}
import { api } from '../api/client';
import { supabase } from '../lib/supabase';
import { COLORS, SPACING, TYPOGRAPHY, FONTS, STORAGE_KEYS, ALPHA_COLORS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassCard } from '../components/glass/GlassCard';
import { ScreenContainer } from '../components/layout';
import { NumberText, RoundedNumeral } from '../components/ui';
import { usePostHog } from '../contexts/PostHogContext';

interface ParsedResume {
  resume_id: number;
  filename: string;
  parsed_data: {
    name: string;
    email: string;
    phone: string;
    linkedin: string;
    location: string;
    summary: string;
    skills: string[];
    experience: Array<{
      header?: string;
      title?: string;
      position?: string;
      role?: string;
      job_title?: string;
      company?: string;
      location?: string;
      dates?: string;
      date_range?: string;
      duration?: string;
      bullets?: string[];
      description?: string;
    }>;
    education: string;
    certifications: string;
  };
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function UploadResumeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const { capture } = usePostHog();
  const [selectedFile, setSelectedFile] = useState<{ uri: string; name: string; size?: number; mimeType?: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Track screen view + clear old tailor session on mount
  useEffect(() => {
    capture('screen_viewed', {
      screen_name: 'Upload Resume',
      screen_type: 'core_feature',
    });

    // Clear old tailor session data when uploading new resume (matches web behavior)
    const clearOldSession = async () => {
      try {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.LAST_TAILORED_RESUME,
          STORAGE_KEYS.SESSION_DATA,
        ]);
      } catch (e) {
        // Silent fail
      }
    };
    clearOldSession();
  }, [capture]);

  const handleSelectFile = async () => {
    if (!DocumentPicker) {
      Alert.alert('Unavailable', 'Document picker requires a new native build. Please rebuild the app.');
      return;
    }
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
      });

      console.log('[UploadResume] Document picker result:', {
        canceled: result.canceled,
        assetsCount: result.assets?.length,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        console.log('[UploadResume] Selected file:', {
          name: file.name,
          uri: file.uri,
          size: file.size,
          mimeType: file.mimeType,
        });

        // Validate file
        if (!file.uri || !file.name) {
          Alert.alert('Error', 'Invalid file selected. Please try again.');
          return;
        }

        if (!file.mimeType || !['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimeType)) {
          Alert.alert(
            'Invalid File Type',
            'Please select a PDF or Word document (.pdf, .doc, .docx)'
          );
          return;
        }

        setSelectedFile(file);
        setUploadSuccess(false);
      }
    } catch (error) {
      console.error('[UploadResume] Error picking document:', error);
      Alert.alert('Error', 'Failed to select document');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setUploading(true);

    try {
      // Check authentication before uploading - use Supabase session directly
      console.log('[UploadResume] Checking authentication...');
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('[UploadResume] No valid Supabase session found');
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please sign out and sign back in to continue.',
          [
            { text: 'OK', style: 'default' }
          ]
        );
        setUploading(false);
        return;
      }
      console.log('[UploadResume] Valid Supabase session found');

      // Validate file before upload
      if (!selectedFile.uri || !selectedFile.name) {
        Alert.alert('Error', 'Invalid file. Please select a different file.');
        setUploading(false);
        return;
      }

      // Create FormData with file
      const formData = new FormData();

      // React Native FormData requires proper file object structure
      // @ts-ignore - FormData append in React Native accepts this structure
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/pdf',
      });

      console.log('[UploadResume] Uploading file:', {
        name: selectedFile.name,
        type: selectedFile.mimeType,
        size: selectedFile.size,
        uriPrefix: selectedFile.uri.substring(0, 20),
      });

      // Use updated uploadResume method with direct fetch + explicit auth headers
      const result = await api.uploadResume(formData);

      console.log('[UploadResume] Upload result:', {
        success: result.success,
        error: result.error,
        hasData: !!result.data,
      });

      if (result.success) {
        // Map backend response to parsed resume (matching web behavior)
        const backendData = result.data?.parsed_data || result.data;
        const mappedData: ParsedResume = {
          resume_id: result.data?.resume_id || result.data?.id,
          filename: result.data?.filename || selectedFile.name,
          parsed_data: {
            name: backendData?.candidate_name || backendData?.name || backendData?.Name || backendData?.full_name || '',
            email: backendData?.candidate_email || backendData?.email || backendData?.Email || '',
            phone: backendData?.candidate_phone || backendData?.phone || backendData?.Phone || backendData?.phone_number || '',
            linkedin: backendData?.candidate_linkedin || backendData?.linkedin || backendData?.LinkedIn || backendData?.linkedin_url || '',
            location: backendData?.candidate_location || backendData?.location || backendData?.Location || backendData?.address || '',
            summary: backendData?.summary || '',
            skills: backendData?.skills || [],
            experience: backendData?.experience || [],
            education: backendData?.education || '',
            certifications: backendData?.certifications || '',
          },
        };

        setParsedResume(mappedData);
        setUploadSuccess(true);
        setError(null);
        capture('resume_uploaded', {
          screen_name: 'Upload Resume',
          file_type: selectedFile.mimeType || 'unknown',
          filename: selectedFile.name,
          file_size: selectedFile.size,
        });
      } else {
        const errorMessage = result.error || 'Failed to upload resume';
        console.error('[UploadResume] Upload failed:', errorMessage);

        // Provide user-friendly error messages
        let userMessage = errorMessage;
        if (errorMessage.includes('timeout')) {
          userMessage = 'Upload timed out. Please check your internet connection and try again.';
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          userMessage = 'Network error. Please check your internet connection and try again.';
        } else if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
          userMessage = 'Authentication failed. Please sign out and sign in again.';
        } else if (errorMessage.includes('rate limit')) {
          userMessage = 'Too many upload attempts. Please wait a moment and try again.';
        }

        setError(userMessage);
      }
    } catch (error) {
      console.error('[UploadResume] Upload exception:', error);

      // More detailed error handling
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (error instanceof Error) {
        console.error('[UploadResume] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });

        if (error.message.includes('timeout')) {
          errorMessage = 'Upload timed out. Please check your internet connection and try again.';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (error.message.includes('JSON')) {
          errorMessage = 'Invalid response from server. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = (resumeId: number, filename: string) => {
    Alert.alert(
      'Delete Resume',
      `Are you sure you want to delete "${filename}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(resumeId);
              const result = await api.deleteResume(resumeId);
              if (result.success) {
                if (parsedResume?.resume_id === resumeId) {
                  setParsedResume(null);
                  setUploadSuccess(false);
                  setSelectedFile(null);
                }
              } else {
                Alert.alert('Error', `Failed to delete resume: ${result.error || 'Unknown error'}`);
              }
            } catch (err: any) {
              Alert.alert('Error', `Error deleting resume: ${err.message || 'Unknown error'}`);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleUploadAnother = () => {
    setParsedResume(null);
    setUploadSuccess(false);
    setSelectedFile(null);
    setError(null);
  };

  const getExperienceTitle = (job: any) => {
    return job.header || job.title || job.position || job.role || job.job_title || job.company || 'Position';
  };

  const getExperienceMeta = (job: any) => {
    const location = job.location || '';
    const dates = job.dates || job.date_range || job.duration || '';
    if (location && dates) return `${location} | ${dates}`;
    return location || dates;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ScreenContainer scrollable edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close upload screen"
          accessibilityHint="Returns to the previous screen"
        >
          <X color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Upload Resume</Text>
      </View>

      {/* Upload Area */}
      <GlassCard
        style={styles.uploadArea}
        material="thin"
        borderRadius={SPACING.radiusLG}
        padding={SPACING.xl}
      >
        {uploadSuccess ? (
          <View style={styles.successState}>
            <View style={styles.successIcon}>
              <CheckCircle color={COLORS.success} size={64} />
            </View>
            <Text style={[TYPOGRAPHY.title3, { color: COLORS.success, marginBottom: SPACING.sm }]}>
              Resume uploaded successfully!
            </Text>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, textAlign: 'center', marginBottom: SPACING.lg }]}>
              Parsed {parsedResume?.filename || selectedFile?.name || 'resume'}
            </Text>
            <TouchableOpacity
              onPress={handleUploadAnother}
              style={styles.changeButton}
              accessibilityRole="button"
              accessibilityLabel="Upload another resume"
            >
              <Text style={[TYPOGRAPHY.subhead, { color: COLORS.primary, fontWeight: '600' }]}>
                Upload Another Resume
              </Text>
            </TouchableOpacity>
          </View>
        ) : error ? (
          <View style={styles.successState}>
            <View style={styles.successIcon}>
              <AlertCircle color={COLORS.danger} size={64} />
            </View>
            <Text style={[TYPOGRAPHY.title3, { color: COLORS.danger, marginBottom: SPACING.sm }]}>
              Upload failed
            </Text>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, textAlign: 'center', marginBottom: SPACING.lg }]}>
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => { setError(null); setSelectedFile(null); }}
              style={styles.changeButton}
              accessibilityRole="button"
              accessibilityLabel="Try again"
            >
              <Text style={[TYPOGRAPHY.subhead, { color: COLORS.primary, fontWeight: '600' }]}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : uploading ? (
          <View style={styles.successState}>
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginBottom: SPACING.lg }} />
            <Text style={[TYPOGRAPHY.title3, { color: colors.text, marginBottom: SPACING.sm }]}>
              Uploading and parsing resume...
            </Text>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, textAlign: 'center' }]}>
              This may take a moment
            </Text>
          </View>
        ) : selectedFile ? (
          <View style={styles.filePreview}>
            <View style={styles.fileIcon}>
              <FileText color={COLORS.primary} size={48} />
            </View>
            <Text style={[TYPOGRAPHY.body, { color: colors.text, fontWeight: '600', textAlign: 'center', marginBottom: SPACING.xs }]} numberOfLines={2}>
              {selectedFile.name}
            </Text>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, marginBottom: SPACING.lg }]}>
              {formatFileSize(selectedFile.size)}
            </Text>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleSelectFile}
              accessibilityRole="button"
              accessibilityLabel="Change selected file"
              accessibilityHint="Opens document picker to select a different resume file"
            >
              <Text style={[TYPOGRAPHY.subhead, { color: COLORS.primary, fontWeight: '600' }]}>
                Change File
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.dropZone}
            onPress={handleSelectFile}
            accessibilityRole="button"
            accessibilityLabel="Select resume file"
            accessibilityHint="Opens document picker to choose a PDF or Word document"
          >
            <View style={styles.uploadIcon}>
              <Upload color={colors.textTertiary} size={48} />
            </View>
            <Text style={[TYPOGRAPHY.title3, { color: colors.text, marginBottom: SPACING.sm }]}>
              Select Resume
            </Text>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, textAlign: 'center', marginBottom: SPACING.md }]}>
              Tap to select a PDF or Word document
            </Text>
            <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary }]}>
              Supported formats: PDF, DOC, DOCX (max 10MB)
            </Text>
          </TouchableOpacity>
        )}
      </GlassCard>

      {/* Info Section - shown before upload */}
      {!parsedResume && (
        <GlassCard
          style={styles.infoSection}
          material="thin"
          borderRadius={SPACING.radiusMD}
          padding={SPACING.lg}
        >
          <Text style={[TYPOGRAPHY.headline, { color: colors.text, marginBottom: SPACING.lg }]}>
            What happens next?
          </Text>

          <View style={styles.infoItem}>
            <View style={[styles.infoNumber, { backgroundColor: COLORS.primary }]}>
              <NumberText weight="semiBold" style={[TYPOGRAPHY.caption1, { color: '#ffffff' }]}>
                1
              </NumberText>
            </View>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, flex: 1 }]}>
              We'll extract your experience, skills, and education
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={[styles.infoNumber, { backgroundColor: COLORS.primary }]}>
              <NumberText weight="semiBold" style={[TYPOGRAPHY.caption1, { color: '#ffffff' }]}>
                2
              </NumberText>
            </View>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, flex: 1 }]}>
              Use AI to tailor your resume for specific job postings
            </Text>
          </View>

          <View style={styles.infoItem}>
            <View style={[styles.infoNumber, { backgroundColor: COLORS.primary }]}>
              <NumberText weight="semiBold" style={[TYPOGRAPHY.caption1, { color: '#ffffff' }]}>
                3
              </NumberText>
            </View>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, flex: 1 }]}>
              Get interview prep materials based on your tailored resume
            </Text>
          </View>
        </GlassCard>
      )}

      {/* Parsed Resume Display */}
      {parsedResume && (
        <View style={styles.parsedResumeContainer}>
          {/* Parsed Header */}
          <View style={styles.parsedHeader}>
            <FileText color={COLORS.primary} size={28} />
            <View style={{ flex: 1, marginLeft: SPACING.md }}>
              <Text style={[TYPOGRAPHY.headline, { color: colors.text }]}>Parsed Resume</Text>
              <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary }]}>
                Resume ID: {parsedResume.resume_id}
              </Text>
            </View>
          </View>

          {/* Contact Information - ATS Critical */}
          <GlassCard
            style={[styles.parsedSection, { borderWidth: 2, borderColor: 'rgba(59, 130, 246, 0.3)' }]}
            material="thin"
            padding={SPACING.lg}
          >
            <View style={styles.atsSectionHeader}>
              <AlertCircle color="#60a5fa" size={20} />
              <Text style={[TYPOGRAPHY.headline, { color: colors.text, marginLeft: SPACING.sm }]}>
                Contact Information
              </Text>
              <View style={styles.atsBadge}>
                <Text style={styles.atsBadgeText}>ATS Required</Text>
              </View>
            </View>

            <View style={styles.contactGrid}>
              {/* Name */}
              {parsedResume.parsed_data.name ? (
                <View style={styles.contactField}>
                  <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary }]}>Name</Text>
                  <Text style={[TYPOGRAPHY.body, { color: colors.text, fontWeight: '600' }]}>
                    {parsedResume.parsed_data.name}
                  </Text>
                </View>
              ) : (
                <View style={[styles.contactField, styles.missingField]}>
                  <View style={styles.missingFieldRow}>
                    <AlertCircle color={COLORS.danger} size={14} />
                    <Text style={[TYPOGRAPHY.caption1, { color: COLORS.danger, marginLeft: 4 }]}>
                      Name not found - required for ATS
                    </Text>
                  </View>
                </View>
              )}

              {/* Email */}
              {parsedResume.parsed_data.email ? (
                <View style={styles.contactField}>
                  <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary }]}>Email</Text>
                  <Text style={[TYPOGRAPHY.body, { color: colors.text, fontWeight: '600' }]}>
                    {parsedResume.parsed_data.email}
                  </Text>
                </View>
              ) : (
                <View style={[styles.contactField, styles.missingField]}>
                  <View style={styles.missingFieldRow}>
                    <AlertCircle color={COLORS.danger} size={14} />
                    <Text style={[TYPOGRAPHY.caption1, { color: COLORS.danger, marginLeft: 4 }]}>
                      Email missing - required for ATS
                    </Text>
                  </View>
                </View>
              )}

              {/* Phone */}
              {parsedResume.parsed_data.phone ? (
                <View style={styles.contactField}>
                  <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary }]}>Phone</Text>
                  <Text style={[TYPOGRAPHY.body, { color: colors.text, fontWeight: '600' }]}>
                    {parsedResume.parsed_data.phone}
                  </Text>
                </View>
              ) : (
                <View style={[styles.contactField, styles.missingField]}>
                  <View style={styles.missingFieldRow}>
                    <AlertCircle color={COLORS.danger} size={14} />
                    <Text style={[TYPOGRAPHY.caption1, { color: COLORS.danger, marginLeft: 4 }]}>
                      Phone missing - required for ATS
                    </Text>
                  </View>
                </View>
              )}

              {/* LinkedIn - optional */}
              {parsedResume.parsed_data.linkedin ? (
                <View style={styles.contactField}>
                  <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary }]}>LinkedIn</Text>
                  <Text style={[TYPOGRAPHY.body, { color: colors.text }]} numberOfLines={1}>
                    {parsedResume.parsed_data.linkedin}
                  </Text>
                </View>
              ) : null}

              {/* Location - optional */}
              {parsedResume.parsed_data.location ? (
                <View style={styles.contactField}>
                  <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary }]}>Location</Text>
                  <Text style={[TYPOGRAPHY.body, { color: colors.text }]}>
                    {parsedResume.parsed_data.location}
                  </Text>
                </View>
              ) : null}
            </View>
          </GlassCard>

          {/* Professional Summary */}
          {parsedResume.parsed_data.summary ? (
            <GlassCard style={styles.parsedSection} material="thin" padding={SPACING.lg}>
              <Text style={[TYPOGRAPHY.headline, { color: colors.text, marginBottom: SPACING.md }]}>
                Professional Summary
              </Text>
              <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, lineHeight: 22 }]}>
                {parsedResume.parsed_data.summary}
              </Text>
            </GlassCard>
          ) : null}

          {/* Skills */}
          {parsedResume.parsed_data.skills && parsedResume.parsed_data.skills.length > 0 ? (
            <GlassCard style={styles.parsedSection} material="thin" padding={SPACING.lg}>
              <Text style={[TYPOGRAPHY.headline, { color: colors.text, marginBottom: SPACING.md }]}>
                Skills
              </Text>
              <View style={styles.skillsContainer}>
                {parsedResume.parsed_data.skills.map((skill, idx) => (
                  <View key={idx} style={[styles.skillPill, { backgroundColor: colors.backgroundTertiary }]}>
                    <Text style={[TYPOGRAPHY.caption1, { color: colors.text, fontWeight: '500' }]}>
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          ) : null}

          {/* Professional Experience */}
          {parsedResume.parsed_data.experience && parsedResume.parsed_data.experience.length > 0 ? (
            <View>
              <Text style={[TYPOGRAPHY.headline, { color: colors.text, marginBottom: SPACING.md, marginHorizontal: SPACING.screenMargin }]}>
                Professional Experience
              </Text>
              {parsedResume.parsed_data.experience.map((job, idx) => (
                <GlassCard key={idx} style={styles.parsedSection} material="thin" padding={SPACING.lg}>
                  <Text style={[TYPOGRAPHY.body, { color: colors.text, fontWeight: '600', marginBottom: 4 }]}>
                    {getExperienceTitle(job)}
                  </Text>
                  {getExperienceMeta(job) ? (
                    <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary, fontStyle: 'italic', marginBottom: SPACING.sm }]}>
                      {getExperienceMeta(job)}
                    </Text>
                  ) : null}
                  {job.bullets && Array.isArray(job.bullets) && job.bullets.length > 0 ? (
                    <View style={{ gap: 6 }}>
                      {job.bullets.map((bullet, bIdx) => (
                        <View key={bIdx} style={styles.bulletRow}>
                          <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary, marginRight: 6 }]}>
                            {'\u2022'}
                          </Text>
                          <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, flex: 1 }]}>
                            {bullet}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : job.description ? (
                    <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary }]}>
                      {job.description}
                    </Text>
                  ) : (
                    <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary, fontStyle: 'italic' }]}>
                      No details available
                    </Text>
                  )}
                </GlassCard>
              ))}
            </View>
          ) : null}

          {/* Education */}
          {parsedResume.parsed_data.education ? (
            <GlassCard style={styles.parsedSection} material="thin" padding={SPACING.lg}>
              <Text style={[TYPOGRAPHY.headline, { color: colors.text, marginBottom: SPACING.md }]}>
                Education
              </Text>
              <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary }]}>
                {parsedResume.parsed_data.education}
              </Text>
            </GlassCard>
          ) : null}

          {/* Certifications */}
          {parsedResume.parsed_data.certifications ? (
            <GlassCard style={styles.parsedSection} material="thin" padding={SPACING.lg}>
              <Text style={[TYPOGRAPHY.headline, { color: colors.text, marginBottom: SPACING.md }]}>
                Certifications
              </Text>
              <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary }]}>
                {parsedResume.parsed_data.certifications}
              </Text>
            </GlassCard>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <GlassButton
              label="Tailor This Resume"
              variant="primary"
              size="md"
              fullWidth
              icon={<ChevronRight color="#ffffff" size={20} />}
              onPress={() => navigation.navigate('TailorResume' as any, { selectedResumeId: parsedResume.resume_id })}
              accessibilityLabel="Tailor this resume"
              accessibilityHint="Navigate to tailor this resume for a specific job"
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: colors.border }]}
                onPress={() => navigation.navigate('TailorResume' as any)}
                accessibilityRole="button"
                accessibilityLabel="View all resumes"
              >
                <Text style={[TYPOGRAPHY.subhead, { color: colors.text, fontWeight: '600' }]}>
                  View All Resumes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteButton, { borderColor: colors.border }]}
                onPress={() => handleDeleteResume(parsedResume.resume_id, parsedResume.filename)}
                disabled={deletingId === parsedResume.resume_id}
                accessibilityRole="button"
                accessibilityLabel="Delete this resume"
              >
                {deletingId === parsedResume.resume_id ? (
                  <ActivityIndicator size="small" color={COLORS.danger} />
                ) : (
                  <Trash2 color={COLORS.danger} size={20} />
                )}
                <Text style={[TYPOGRAPHY.subhead, { color: COLORS.danger, fontWeight: '600', marginLeft: 6 }]}>
                  {deletingId === parsedResume.resume_id ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Footer - Upload Button */}
      {selectedFile && !uploadSuccess && !uploading && !error && (
        <View style={styles.footer}>
          <GlassButton
            label="Upload Resume"
            variant="primary"
            size="md"
            fullWidth
            loading={uploading}
            disabled={uploading}
            icon={<Upload color="#ffffff" size={24} />}
            onPress={handleUpload}
            accessibilityLabel={uploading ? "Uploading resume" : "Upload resume"}
            accessibilityHint="Uploads the selected resume file to your account"
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -SPACING.sm,
    marginRight: SPACING.sm,
  },
  pageTitle: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
  },
  uploadArea: {
    marginHorizontal: SPACING.screenMargin,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sectionGap,
  },
  dropZone: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  uploadIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  filePreview: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  fileIcon: {
    marginBottom: SPACING.lg,
  },
  changeButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: SPACING.touchTarget,
    justifyContent: 'center',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  infoSection: {
    marginHorizontal: SPACING.screenMargin,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  infoNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  footer: {
    padding: SPACING.screenMargin,
    marginTop: SPACING.lg,
  },
  // Parsed Resume Display
  parsedResumeContainer: {
    marginTop: SPACING.md,
  },
  parsedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.screenMargin,
    marginBottom: SPACING.lg,
  },
  parsedSection: {
    marginHorizontal: SPACING.screenMargin,
    marginBottom: SPACING.md,
  },
  atsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  atsBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: SPACING.sm,
  },
  atsBadgeText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '600',
    fontFamily: FONTS.semibold,
  },
  contactGrid: {
    gap: SPACING.md,
  },
  contactField: {
    gap: 2,
  },
  missingField: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 8,
    padding: SPACING.sm,
  },
  missingFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionButtons: {
    marginHorizontal: SPACING.screenMargin,
    marginTop: SPACING.md,
    marginBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  deleteButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
