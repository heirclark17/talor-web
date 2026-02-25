import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Save, Trash2 } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS } from '../utils/constants';
import { api } from '../api';

const STATUS_OPTIONS = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offer', label: 'Offer' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'no_response', label: 'No Response' },
];

interface ApplicationData {
  id?: number;
  jobTitle: string;
  companyName: string;
  jobUrl?: string;
  status: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  notes?: string;
  appliedDate?: string;
  contactName?: string;
  contactEmail?: string;
}

interface ApplicationFormModalProps {
  visible: boolean;
  application?: ApplicationData | null;
  onClose: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

export function ApplicationFormModal({
  visible,
  application,
  onClose,
  onSave,
  onDelete,
}: ApplicationFormModalProps) {
  const { colors, isDark } = useTheme();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [status, setStatus] = useState('saved');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [notes, setNotes] = useState('');
  const [appliedDate, setAppliedDate] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    if (application) {
      setJobTitle(application.jobTitle || '');
      setCompanyName(application.companyName || '');
      setJobUrl(application.jobUrl || '');
      setStatus(application.status || 'saved');
      setLocation(application.location || '');
      setSalaryMin(application.salaryMin?.toString() || '');
      setSalaryMax(application.salaryMax?.toString() || '');
      setNotes(application.notes || '');
      setAppliedDate(application.appliedDate || '');
      setContactName(application.contactName || '');
      setContactEmail(application.contactEmail || '');
    } else {
      // Reset form for new application
      setJobTitle('');
      setCompanyName('');
      setJobUrl('');
      setStatus('saved');
      setLocation('');
      setSalaryMin('');
      setSalaryMax('');
      setNotes('');
      setAppliedDate('');
      setContactName('');
      setContactEmail('');
    }
  }, [application, visible]);

  const handleSave = async () => {
    // Validation
    if (!jobTitle.trim()) {
      Alert.alert('Validation Error', 'Job title is required');
      return;
    }
    if (!companyName.trim()) {
      Alert.alert('Validation Error', 'Company name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        jobUrl: jobUrl.trim() || undefined,
        status,
        location: location.trim() || undefined,
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : undefined,
        notes: notes.trim() || undefined,
        appliedDate: appliedDate.trim() || undefined,
        contactName: contactName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
      };

      let result;
      if (application?.id) {
        result = await api.updateApplication(application.id, payload);
      } else {
        result = await api.createApplication(payload);
      }

      if (result.success) {
        Alert.alert('Success', application?.id ? 'Application updated' : 'Application created');
        onSave?.();
        onClose();
      } else {
        Alert.alert('Error', result.error || 'Failed to save application');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save application');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!application?.id) return;

    Alert.alert(
      'Delete Application',
      'Are you sure you want to delete this application? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const result = await api.deleteApplication(application.id!);

              if (result.success) {
                Alert.alert('Success', 'Application deleted');
                onDelete?.();
                onClose();
              } else {
                Alert.alert('Error', result.error || 'Failed to delete application');
              }
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete application');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
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
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {application?.id ? 'Edit Application' : 'New Application'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Job Title *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: GLASS.getBorderColor(),
                    },
                  ]}
                  placeholder="e.g., Senior Product Manager"
                  placeholderTextColor={colors.textTertiary}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Company Name *</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: GLASS.getBorderColor(),
                    },
                  ]}
                  placeholder="e.g., Apple"
                  placeholderTextColor={colors.textTertiary}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Job URL</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: GLASS.getBorderColor(),
                    },
                  ]}
                  placeholder="https://..."
                  placeholderTextColor={colors.textTertiary}
                  value={jobUrl}
                  onChangeText={setJobUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Status</Text>
                <View style={styles.chipContainer}>
                  {STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: colors.backgroundSecondary,
                          borderColor: isDark ? GLASS.getBorderColor() : 'transparent',
                        },
                        status === option.value && {
                          backgroundColor: COLORS.primary,
                          borderColor: COLORS.primary,
                        },
                      ]}
                      onPress={() => setStatus(option.value)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: colors.textSecondary },
                          status === option.value && { color: '#ffffff', fontWeight: '600' },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Location</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: GLASS.getBorderColor(),
                    },
                  ]}
                  placeholder="e.g., New York, NY / Remote"
                  placeholderTextColor={colors.textTertiary}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Salary Min ($)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: GLASS.getBorderColor(),
                      },
                    ]}
                    placeholder="80000"
                    placeholderTextColor={colors.textTertiary}
                    value={salaryMin}
                    onChangeText={setSalaryMin}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Salary Max ($)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: colors.text,
                        backgroundColor: colors.backgroundSecondary,
                        borderColor: GLASS.getBorderColor(),
                      },
                    ]}
                    placeholder="120000"
                    placeholderTextColor={colors.textTertiary}
                    value={salaryMax}
                    onChangeText={setSalaryMax}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Applied Date</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: GLASS.getBorderColor(),
                    },
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textTertiary}
                  value={appliedDate}
                  onChangeText={setAppliedDate}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Contact Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: GLASS.getBorderColor(),
                    },
                  ]}
                  placeholder="Hiring Manager Name"
                  placeholderTextColor={colors.textTertiary}
                  value={contactName}
                  onChangeText={setContactName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Contact Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: GLASS.getBorderColor(),
                    },
                  ]}
                  placeholder="recruiter@company.com"
                  placeholderTextColor={colors.textTertiary}
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Notes</Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: GLASS.getBorderColor(),
                    },
                  ]}
                  placeholder="Additional notes about this application..."
                  placeholderTextColor={colors.textTertiary}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: COLORS.primary }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Save color="#ffffff" size={20} />
                      <Text style={styles.saveButtonText}>
                        {application?.id ? 'Update' : 'Create'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {application?.id && (
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: COLORS.error + '20' }]}
                    onPress={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <ActivityIndicator color={COLORS.error} />
                    ) : (
                      <>
                        <Trash2 color={COLORS.error} size={20} />
                        <Text style={[styles.deleteButtonText, { color: COLORS.error }]}>
                          Delete
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
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
    maxHeight: '90%',
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
  headerTitle: {
    ...TYPOGRAPHY.heading2,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodyBold,
    marginBottom: SPACING.sm,
  },
  input: {
    ...TYPOGRAPHY.body,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
  },
  textArea: {
    minHeight: 100,
    paddingTop: SPACING.md,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: GLASS.getCornerRadius('full'),
    borderWidth: GLASS.getBorderWidth(),
  },
  chipText: {
    ...TYPOGRAPHY.caption,
  },
  row: {
    flexDirection: 'row',
  },
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    ...GLASS.getShadow('medium'),
  },
  saveButtonText: {
    ...TYPOGRAPHY.heading3,
    color: '#ffffff',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
  },
  deleteButtonText: {
    ...TYPOGRAPHY.heading3,
  },
});
