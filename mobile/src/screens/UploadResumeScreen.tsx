import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X, Upload, FileText, CheckCircle } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function UploadResumeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        setUploadSuccess(false);
      }
    } catch (error) {
      console.error('Error picking document:', error);
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
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: selectedFile.mimeType || 'application/pdf',
      } as any);

      const result = await api.uploadResume(formData);

      if (result.success) {
        setUploadSuccess(true);
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        Alert.alert('Error', result.error || 'Failed to upload resume');
      }
    } catch (error) {
      console.error('Error uploading:', error);
      Alert.alert('Error', 'Failed to upload resume');
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close upload screen"
          accessibilityHint="Returns to the previous screen"
        >
          <X color={COLORS.dark.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Upload Resume</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.uploadArea}>
          {uploadSuccess ? (
            <View style={styles.successState}>
              <View style={styles.successIcon}>
                <CheckCircle color={COLORS.success} size={64} />
              </View>
              <Text style={styles.successTitle}>Upload Successful!</Text>
              <Text style={styles.successText}>
                Your resume has been uploaded and is being processed.
              </Text>
            </View>
          ) : selectedFile ? (
            <View style={styles.filePreview}>
              <View style={styles.fileIcon}>
                <FileText color={COLORS.primary} size={48} />
              </View>
              <Text style={styles.fileName} numberOfLines={2}>
                {selectedFile.name}
              </Text>
              <Text style={styles.fileSize}>
                {formatFileSize(selectedFile.size)}
              </Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={handleSelectFile}
                accessibilityRole="button"
                accessibilityLabel="Change selected file"
                accessibilityHint="Opens document picker to select a different resume file"
              >
                <Text style={styles.changeButtonText}>Change File</Text>
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
                <Upload color={COLORS.dark.textTertiary} size={48} />
              </View>
              <Text style={styles.dropZoneTitle}>Select Resume</Text>
              <Text style={styles.dropZoneText}>
                Tap to select a PDF or Word document
              </Text>
              <Text style={styles.supportedFormats}>
                Supported formats: PDF, DOC, DOCX
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>1</Text>
            </View>
            <Text style={styles.infoText}>
              We'll extract your experience, skills, and education
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>2</Text>
            </View>
            <Text style={styles.infoText}>
              Use AI to tailor your resume for specific job postings
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={styles.infoNumberText}>3</Text>
            </View>
            <Text style={styles.infoText}>
              Get interview prep materials based on your tailored resume
            </Text>
          </View>
        </View>
      </ScrollView>

      {selectedFile && !uploadSuccess && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={uploading}
            accessibilityRole="button"
            accessibilityLabel={uploading ? 'Uploading resume' : 'Upload resume to server'}
            accessibilityHint="Sends the selected resume file to be processed"
            accessibilityState={{ disabled: uploading, busy: uploading }}
          >
            {uploading ? (
              <ActivityIndicator color={COLORS.dark.background} />
            ) : (
              <>
                <Upload color={COLORS.dark.background} size={20} />
                <Text style={styles.uploadButtonText}>Upload Resume</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.extralight,
    color: COLORS.dark.text,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  uploadArea: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  dropZone: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  uploadIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  dropZoneTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  dropZoneText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  supportedFormats: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textTertiary,
  },
  filePreview: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  fileIcon: {
    marginBottom: SPACING.lg,
  },
  fileName: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  fileSize: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    marginBottom: SPACING.lg,
  },
  changeButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  changeButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
  },
  successState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
    color: COLORS.success,
    marginBottom: SPACING.sm,
  },
  successText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: SPACING.lg,
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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoNumberText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dark.text,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.background,
  },
});
