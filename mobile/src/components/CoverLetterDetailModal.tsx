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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Edit2, Save, Trash2, Download, Share2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS } from '../utils/constants';
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

  React.useEffect(() => {
    if (coverLetter) {
      setEditedContent(coverLetter.content);
      setEditMode(false);
    }
  }, [coverLetter]);

  if (!coverLetter) return null;

  const handleSave = async () => {
    if (!editedContent.trim()) {
      Alert.alert('Validation Error', 'Content cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const result = await api.updateCoverLetter(coverLetter.id, {
        content: editedContent,
      });

      if (result.success) {
        Alert.alert('Success', 'Cover letter updated successfully');
        setEditMode(false);
        onUpdate?.();
      } else {
        Alert.alert('Error', result.error || 'Failed to update cover letter');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update cover letter');
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
                Alert.alert('Success', 'Cover letter deleted');
                onDelete?.();
                onClose();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete cover letter');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete cover letter');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const result = await api.downloadCoverLetter(coverLetter.id);

      if (result.success && result.data) {
        // Create blob URL and share
        const canShare = Sharing && typeof Sharing.isAvailableAsync === 'function'
          ? await Sharing.isAvailableAsync()
          : false;
        if (canShare) {
          // In a real implementation, you'd save the blob to a file first
          // then share the file URI
          Alert.alert('Success', 'Cover letter ready to download');
        } else {
          Alert.alert('Info', 'Sharing not available on this device');
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to download cover letter');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to download cover letter');
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
                <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
                  {coverLetter.jobTitle}
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {coverLetter.companyName}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {!editMode ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={() => setEditMode(true)}
                  >
                    <Edit2 color={COLORS.primary} size={20} />
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleDownload}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Download color={COLORS.primary} size={20} />
                    )}
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Download</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.backgroundSecondary }]}
                    onPress={handleShare}
                  >
                    <Share2 color={COLORS.primary} size={20} />
                    <Text style={[styles.actionButtonText, { color: COLORS.primary }]}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: COLORS.error + '20' }]}
                    onPress={handleDelete}
                    disabled={deleting}
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
                    style={[styles.actionButton, { backgroundColor: COLORS.success + '20' }]}
                    onPress={handleSave}
                    disabled={saving}
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
                />
              ) : (
                <Text style={[styles.content, { color: colors.text }]}>{coverLetter.content}</Text>
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
    padding: SPACING.sm,
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
    ...TYPOGRAPHY.bodyBold,
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
