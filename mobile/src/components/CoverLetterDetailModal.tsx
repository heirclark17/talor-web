import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';
import { X, Edit2, Save, Trash2, Download, Share2, Copy } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS, ALPHA_COLORS, FONTS } from '../utils/constants';
import { api } from '../api';

// Lazy-load expo-sharing to avoid crash when native module isn't built
let Sharing: any = null;
try {
  Sharing = require('expo-sharing');
} catch (e) {
  // expo-sharing native module not available
}

interface CoverLetter {
  id: number;
  jobTitle: string;
  companyName: string;
  content: string;
  createdAt: string;
}

interface CoverLetterDetailModalProps {
  visible: boolean;
  coverLetter: CoverLetter | null;
  onClose: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
}

export function CoverLetterDetailModal({
  visible,
  coverLetter,
  onClose,
  onDelete,
  onUpdate,
}: CoverLetterDetailModalProps) {
  const { colors } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (coverLetter) {
      setEditedContent(coverLetter.content);
      setEditMode(false);
      setCopied(false);
    }
  }, [coverLetter]);

  if (!coverLetter) return null;

  const handleSave = async () => {
    if (!editedContent.trim()) {
      Alert.alert('Content Required', 'Cover letter content cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const result = await api.updateCoverLetter(coverLetter.id, {
        content: editedContent,
      });

      if (result.success) {
        setEditMode(false);
        onUpdate?.();
      } else {
        Alert.alert('Save Failed', result.error || 'Could not save changes. Please try again.');
      }
    } catch (error: any) {
      Alert.alert('Save Failed', error.message || 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Cover Letter',
      'Are you sure you want to delete this cover letter? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const result = await api.deleteCoverLetter(coverLetter.id);
              if (result.success) {
                onDelete?.();
                onClose();
              } else {
                Alert.alert('Delete Failed', result.error || 'Could not delete cover letter.');
              }
            } catch (error: any) {
              Alert.alert('Delete Failed', error.message || 'Could not delete cover letter.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(coverLetter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Copy Failed', 'Could not copy to clipboard.');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const result = await api.downloadCoverLetter(coverLetter.id, 'docx');

      if (result.success && result.data) {
        // Convert blob to base64 and write to file
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(result.data as Blob);
        const base64Data = await base64Promise;

        const filename = `Cover_Letter_${coverLetter.companyName}_${coverLetter.jobTitle}.docx`
          .replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Share the file
        const canShare = Sharing && typeof Sharing.isAvailableAsync === 'function'
          ? await Sharing.isAvailableAsync()
          : false;

        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            dialogTitle: `Save ${coverLetter.jobTitle} Cover Letter`,
          });
        } else {
          Alert.alert('File Saved', `Cover letter saved to:\n${fileUri}`);
        }
      } else {
        Alert.alert('Download Failed', result.error || 'Could not download the cover letter.');
      }
    } catch (error: any) {
      Alert.alert('Download Failed', error.message || 'Could not download the cover letter.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Cover Letter for ${coverLetter.jobTitle} at ${coverLetter.companyName}\n\n${coverLetter.content}`,
      });
    } catch (error: any) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <BlurView intensity={GLASS.getBlurIntensity('strong')} tint="dark" style={styles.overlay}>
        <View style={styles.modalContainer}>
          <BlurView
            intensity={GLASS.getBlurIntensity('regular')}
            tint="light"
            style={styles.modalContent}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: GLASS.getBorderColor() }]}>
              <View style={styles.headerLeft}>
                <Text
                  style={[styles.headerTitle, { color: colors.text }]}
                  numberOfLines={1}
                  accessibilityRole="header"
                >
                  {coverLetter.jobTitle}
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {coverLetter.companyName}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                accessibilityLabel="Close cover letter"
                accessibilityRole="button"
              >
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {!editMode ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: ALPHA_COLORS.primary.bg }]}
                    onPress={handleCopyToClipboard}
                    accessibilityLabel={copied ? 'Copied to clipboard' : 'Copy to clipboard'}
                    accessibilityRole="button"
                  >
                    <Copy color={COLORS.primary} size={20} />
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>
                      {copied ? 'Copied!' : 'Copy'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => setEditMode(true)}
                    accessibilityLabel="Edit cover letter"
                    accessibilityRole="button"
                  >
                    <Edit2 color={COLORS.primary} size={20} />
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleDownload}
                    disabled={downloading}
                    accessibilityLabel="Download as Word document"
                    accessibilityRole="button"
                  >
                    {downloading ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Download color={COLORS.primary} size={20} />
                    )}
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Export</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleShare}
                    accessibilityLabel="Share cover letter"
                    accessibilityRole="button"
                  >
                    <Share2 color={COLORS.primary} size={20} />
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: ALPHA_COLORS.danger.bg }]}
                    onPress={handleDelete}
                    disabled={deleting}
                    accessibilityLabel="Delete cover letter"
                    accessibilityRole="button"
                  >
                    {deleting ? (
                      <ActivityIndicator size="small" color={COLORS.error} />
                    ) : (
                      <Trash2 color={COLORS.error} size={20} />
                    )}
                    <Text style={[styles.actionButtonText, { color: COLORS.error }]}>Delete</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: ALPHA_COLORS.success.bg }]}
                    onPress={handleSave}
                    disabled={saving}
                    accessibilityLabel="Save changes"
                    accessibilityRole="button"
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={COLORS.success} />
                    ) : (
                      <Save color={COLORS.success} size={20} />
                    )}
                    <Text style={[styles.actionButtonText, { color: COLORS.success }]}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => {
                      setEditedContent(coverLetter.content);
                      setEditMode(false);
                    }}
                    accessibilityLabel="Cancel editing"
                    accessibilityRole="button"
                  >
                    <X color={colors.textSecondary} size={20} />
                    <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Content */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              {editMode ? (
                <TextInput
                  style={[
                    styles.contentInput,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: GLASS.getBorderColor(),
                    },
                  ]}
                  value={editedContent}
                  onChangeText={setEditedContent}
                  multiline
                  textAlignVertical="top"
                  placeholder="Enter cover letter content..."
                  placeholderTextColor={colors.textTertiary}
                  accessibilityLabel="Cover letter content"
                />
              ) : (
                <Text
                  style={[styles.content, { color: colors.text }]}
                  selectable
                >
                  {coverLetter.content}
                </Text>
              )}

              <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
                Created {new Date(coverLetter.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </ScrollView>
          </BlurView>
        </View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '80%',
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    ...GLASS.getShadow('large'),
  },
  modalContent: {
    flex: 1,
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: GLASS.getBorderWidth(),
  },
  headerLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading2,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
  },
  closeButton: {
    padding: 10,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    padding: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: GLASS.getCornerRadius('medium'),
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  content: {
    ...TYPOGRAPHY.body,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  contentInput: {
    ...TYPOGRAPHY.body,
    minHeight: 300,
    padding: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
    marginBottom: SPACING.xl,
  },
  timestamp: {
    ...TYPOGRAPHY.caption,
    textAlign: 'center',
  },
});
