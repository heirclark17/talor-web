import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
import { useTheme } from '../hooks/useTheme';
import { GlassButton } from '../components/glass/GlassButton';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function UploadResumeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
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
          <X color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Upload Resume</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={[styles.uploadArea, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          {uploadSuccess ? (
            <View style={styles.successState}>
              <View style={styles.successIcon}>
                <CheckCircle color={COLORS.success} size={64} />
              </View>
              <Text style={styles.successTitle}>Upload Successful!</Text>
              <Text style={[styles.successText, { color: colors.textSecondary }]}>
                Your resume has been uploaded and is being processed.
              </Text>
            </View>
          ) : selectedFile ? (
            <View style={styles.filePreview}>
              <View style={styles.fileIcon}>
                <FileText color={COLORS.primary} size={48} />
              </View>
              <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={2}>
                {selectedFile.name}
              </Text>
              <Text style={[styles.fileSize, { color: colors.textSecondary }]}>
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
                <Upload color={colors.textTertiary} size={48} />
              </View>
              <Text style={[styles.dropZoneTitle, { color: colors.text }]}>Select Resume</Text>
              <Text style={[styles.dropZoneText, { color: colors.textSecondary }]}>
                Tap to select a PDF or Word document
              </Text>
              <Text style={[styles.supportedFormats, { color: colors.textTertiary }]}>
                Supported formats: PDF, DOC, DOCX
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoSection, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>What happens next?</Text>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={[styles.infoNumberText, { color: colors.text }]}>1</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              We'll extract your experience, skills, and education
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={[styles.infoNumberText, { color: colors.text }]}>2</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Use AI to tailor your resume for specific job postings
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.infoNumber}>
              <Text style={[styles.infoNumberText, { color: colors.text }]}>3</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Get interview prep materials based on your tailored resume
            </Text>
          </View>
        </View>
      </ScrollView>

      {selectedFile && !uploadSuccess && (
        <View style={styles.footer}>
          <GlassButton
            label="Upload Resume"
            variant="primary"
            size="lg"
            fullWidth
            loading={uploading}
            disabled={uploading}
            icon={<Upload color="#ffffff" size={20} />}
            onPress={handleUpload}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
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
    borderRadius: RADIUS.lg,
    borderWidth: 1,
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
    marginBottom: SPACING.sm,
  },
  dropZoneText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  supportedFormats: {
    fontSize: 12,
    fontFamily: FONTS.regular,
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
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  fileSize: {
    fontSize: 14,
    fontFamily: FONTS.regular,
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
    textAlign: 'center',
  },
  infoSection: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
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
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.lg,
  },
});
