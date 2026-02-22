import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Upload, FileText, CheckCircle } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '../api/client';
import { supabase } from '../lib/supabase';
import { COLORS, SPACING, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassCard } from '../components/glass/GlassCard';
import { ScreenContainer } from '../components/layout';
import { NumberText, RoundedNumeral } from '../components/ui';
import { usePostHog } from '../contexts/PostHogContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function UploadResumeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const { capture } = usePostHog();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Track screen view on mount
  React.useEffect(() => {
    capture('screen_viewed', {
      screen_name: 'Upload Resume',
      screen_type: 'core_feature',
    });
  }, [capture]);

  const handleSelectFile = async () => {
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

      const result = await api.uploadResume(formData);

      console.log('[UploadResume] Upload result:', {
        success: result.success,
        error: result.error,
        hasData: !!result.data,
      });

      if (result.success) {
        setUploadSuccess(true);
        capture('resume_uploaded', {
          screen_name: 'Upload Resume',
          file_type: selectedFile.mimeType || 'unknown',
          filename: selectedFile.name,
          file_size: selectedFile.size,
        });
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
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

        Alert.alert('Upload Failed', userMessage);
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

      Alert.alert('Upload Error', errorMessage);
    } finally {
      setUploading(false);
    }
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
        <Text style={[TYPOGRAPHY.title3, { color: colors.text }]}>Upload Resume</Text>
        <View style={styles.placeholder} />
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
              Upload Successful!
            </Text>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, textAlign: 'center' }]}>
              Your resume has been uploaded and is being processed.
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
              Supported formats: PDF, DOC, DOCX
            </Text>
          </TouchableOpacity>
        )}
      </GlassCard>

      {/* Info Section */}
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

      {/* Footer */}
      {selectedFile && !uploadSuccess && (
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenMargin,
    paddingVertical: SPACING.md,
  },
  closeButton: {
    width: SPACING.touchTarget,
    height: SPACING.touchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: SPACING.touchTarget,
  },
  uploadArea: {
    marginHorizontal: SPACING.screenMargin,
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
});
