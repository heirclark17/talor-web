import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FileText, CheckCircle, Circle, Target, Trash2 } from 'lucide-react-native';
import { api } from '../api/client';
import { tailorApi, TailoredResume } from '../api/tailorApi';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS, FONTS } from '../utils/constants';
import { CoverLetterDetailModal } from '../components/CoverLetterDetailModal';
import { MainStackParamList } from '../navigation/AppNavigator';

interface CoverLetter {
  id: number;
  jobTitle: string;
  companyName: string;
  content: string;
  createdAt: string;
}

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
  { value: 'strategic', label: 'Strategic' },
  { value: 'technical', label: 'Technical' },
  { value: 'conversational', label: 'Conversational' },
];

const LENGTH_OPTIONS = [
  { value: 'concise', label: 'Concise (3 para)' },
  { value: 'standard', label: 'Standard (4 para)' },
  { value: 'detailed', label: 'Detailed (5 para)' },
];

const FOCUS_OPTIONS = [
  { value: 'leadership', label: 'Leadership' },
  { value: 'technical', label: 'Technical' },
  { value: 'program_management', label: 'Program Mgmt' },
  { value: 'cross_functional', label: 'Cross-Functional' },
];

export default function CoverLetterGeneratorScreen() {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);

  // Tailored resume selection
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResume[]>([]);
  const [selectedResume, setSelectedResume] = useState<TailoredResume | null>(null);
  const [loadingResumes, setLoadingResumes] = useState(true);

  // Options state
  const [tone, setTone] = useState<string>('professional');
  const [length, setLength] = useState<string>('standard');
  const [focus, setFocus] = useState<string>('program_management');

  // Bulk delete state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  // Modal state
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadTailoredResumes();
    loadCoverLetters();
  }, []);

  const loadTailoredResumes = async () => {
    setLoadingResumes(true);
    try {
      const result = await tailorApi.listTailoredResumes();
      if (result.success && result.data) {
        setTailoredResumes(result.data);
      }
    } catch (error) {
      console.error('Error loading tailored resumes:', error);
    } finally {
      setLoadingResumes(false);
    }
  };

  const loadCoverLetters = async () => {
    try {
      const result = await api.listCoverLetters();
      if (result.success) {
        setCoverLetters(result.data);
      }
    } catch (error) {
      console.error('Error loading cover letters:', error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedResume) {
      Alert.alert('Select Resume', 'Please select a tailored resume first.');
      return;
    }

    setLoading(true);
    try {
      const result = await api.generateCoverLetter({
        jobTitle: selectedResume.jobTitle,
        companyName: selectedResume.company,
        jobDescription: selectedResume.jobDescription || '',
        baseResumeId: selectedResume.resumeId,
        tone: tone as any,
        length: length as any,
        focus: focus as any,
      });

      if (result.success) {
        Alert.alert('Success', 'Cover letter generated successfully!');
        loadCoverLetters();
        setSelectedResume(null);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate cover letter');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate cover letter');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectMode = () => {
    if (selectMode) {
      setSelectedIds(new Set());
    }
    setSelectMode(!selectMode);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === tailoredResumes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tailoredResumes.map(r => r.id)));
    }
  };

  const toggleSelectId = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    Alert.alert(
      'Delete Resumes',
      `Delete ${selectedIds.size} tailored resume${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const ids = Array.from(selectedIds);
              const result = await tailorApi.bulkDeleteTailoredResumes(ids);
              if (result.success) {
                setTailoredResumes(prev => prev.filter(r => !selectedIds.has(r.id)));
                setSelectedIds(new Set());
                setSelectMode(false);
                setSelectedResume(null);
              } else {
                Alert.alert('Error', result.error || 'Failed to delete resumes');
              }
            } catch (err: any) {
              console.error('Bulk delete error:', err);
              Alert.alert('Error', 'Failed to delete resumes');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const renderOptionButtons = (
    options: { value: string; label: string }[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={styles.optionsContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.optionButton,
            { backgroundColor: colors.backgroundSecondary + '40', borderColor: isDark ? GLASS.getBorderColor() : 'transparent' },
            selectedValue === option.value && styles.optionButtonActive,
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text
            style={[
              styles.optionButtonText,
              { color: colors.textSecondary },
              selectedValue === option.value && styles.optionButtonTextActive,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderResumeCard = (item: TailoredResume) => {
    const isSelected = selectedResume?.id === item.id;
    const isChecked = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.7}
        onPress={() => selectMode ? toggleSelectId(item.id) : setSelectedResume(isSelected ? null : item)}
      >
        <BlurView
          intensity={GLASS.getBlurIntensity('subtle')}
          tint={isDark ? 'dark' : 'light'}
          style={styles.resumeCardBlur}
        >
          <View
            style={[
              styles.resumeCard,
              {
                borderColor: selectMode
                  ? (isChecked ? COLORS.danger : (isDark ? GLASS.getBorderColor() : 'transparent'))
                  : (isSelected ? COLORS.primary : (isDark ? GLASS.getBorderColor() : 'transparent')),
                borderWidth: (selectMode ? isChecked : isSelected) ? 2 : GLASS.getBorderWidth(),
              },
            ]}
          >
            <View style={styles.resumeCardContent}>
              {selectMode ? (
                <View style={styles.resumeCardLeft}>
                  {isChecked ? (
                    <CheckCircle color={COLORS.danger} size={20} />
                  ) : (
                    <Circle color={colors.textSecondary} size={20} />
                  )}
                </View>
              ) : (
                <View style={styles.resumeCardLeft}>
                  <FileText color={isSelected ? COLORS.primary : colors.textSecondary} size={20} />
                </View>
              )}
              <View style={styles.resumeCardText}>
                <Text style={[styles.resumeCardTitle, { color: !selectMode && isSelected ? COLORS.primary : colors.text }]}>
                  {item.jobTitle}
                </Text>
                <Text style={[styles.resumeCardCompany, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.company}
                </Text>
              </View>
              <View style={styles.resumeCardRight}>
                {item.matchScore != null && (
                  <View style={[styles.matchBadge, { backgroundColor: COLORS.primary + '20' }]}>
                    <Text style={[styles.matchBadgeText, { color: COLORS.primary }]}>
                      {item.matchScore}%
                    </Text>
                  </View>
                )}
                {!selectMode && isSelected && (
                  <CheckCircle color={COLORS.primary} size={20} />
                )}
              </View>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  const renderCoverLetterCard = (item: CoverLetter) => (
    <BlurView
      key={item.id}
      intensity={GLASS.getBlurIntensity('subtle')}
      tint={isDark ? 'dark' : 'light'}
      style={styles.cardBlur}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedCoverLetter(item);
          setModalVisible(true);
        }}
      >
        <Text style={[styles.cardTitle, { color: colors.text }]}>{item.jobTitle}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>{item.companyName}</Text>
        <Text style={[styles.cardDate, { color: colors.textTertiary }]}>
          {new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </Text>
      </TouchableOpacity>
    </BlurView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Target color={colors.textTertiary} size={48} />
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No Tailored Resumes Yet</Text>
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        Tailor a resume first to generate a cover letter.
      </Text>
      <TouchableOpacity
        style={styles.emptyStateButton}
        onPress={() => navigation.navigate('TailorMain')}
        activeOpacity={0.7}
      >
        <Text style={styles.emptyStateButtonText}>Tailor a Resume</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Generate Cover Letter</Text>
        <BlurView intensity={GLASS.getBlurIntensity('regular')} tint={isDark ? 'dark' : 'light'} style={styles.formBlur}>
          <View style={styles.formContainer}>

            {/* Tailored Resume Selection */}
            <View style={styles.resumeListHeader}>
              <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>Select a Tailored Resume</Text>
              {tailoredResumes.length > 0 && (
                <TouchableOpacity onPress={toggleSelectMode} style={styles.selectModeButton}>
                  <Text style={[styles.selectModeText, { color: selectMode ? COLORS.danger : COLORS.primary }]}>
                    {selectMode ? 'Cancel' : 'Select'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingResumes ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading resumes...</Text>
              </View>
            ) : tailoredResumes.length === 0 ? (
              renderEmptyState()
            ) : (
              <>
                {selectMode && (
                  <View style={styles.bulkActions}>
                    <TouchableOpacity onPress={toggleSelectAll} style={styles.selectAllButton}>
                      {selectedIds.size === tailoredResumes.length ? (
                        <CheckCircle color={COLORS.danger} size={18} />
                      ) : (
                        <Circle color={colors.textSecondary} size={18} />
                      )}
                      <Text style={[styles.selectAllText, { color: colors.text }]}>
                        {selectedIds.size === tailoredResumes.length ? 'Deselect All' : 'Select All'}
                      </Text>
                    </TouchableOpacity>
                    {selectedIds.size > 0 && (
                      <TouchableOpacity onPress={handleBulkDelete} style={styles.deleteButton} disabled={deleting}>
                        {deleting ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Trash2 color="#fff" size={16} />
                            <Text style={styles.deleteButtonText}>Delete ({selectedIds.size})</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <View style={styles.resumeList}>
                  {tailoredResumes.map(renderResumeCard)}
                </View>

                {/* Customization Options */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Tone</Text>
                  {renderOptionButtons(TONE_OPTIONS, tone, setTone)}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Length</Text>
                  {renderOptionButtons(LENGTH_OPTIONS, length, setLength)}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Focus</Text>
                  {renderOptionButtons(FOCUS_OPTIONS, focus, setFocus)}
                </View>

                {/* Generate Button */}
                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    (loading || !selectedResume) && styles.generateButtonDisabled,
                  ]}
                  onPress={handleGenerate}
                  disabled={loading || !selectedResume}
                >
                  {loading ? (
                    <ActivityIndicator color={'#ffffff'} />
                  ) : (
                    <Text style={styles.generateButtonText}>Generate Cover Letter</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </BlurView>

        {/* Previous Cover Letters */}
        {coverLetters.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historySectionTitle, { color: colors.text }]}>Previous Cover Letters</Text>
            {coverLetters.map(renderCoverLetterCard)}
          </View>
        )}
      </ScrollView>

      <CoverLetterDetailModal
        visible={modalVisible}
        coverLetter={selectedCoverLetter}
        onClose={() => {
          setModalVisible(false);
          setSelectedCoverLetter(null);
        }}
        onDelete={() => {
          loadCoverLetters();
        }}
        onUpdate={() => {
          loadCoverLetters();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  formBlur: {
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    ...GLASS.getShadow('medium'),
  },
  formContainer: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 28,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodyBold,
    marginBottom: SPACING.sm,
  },
  // Resume list header & bulk actions
  resumeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  selectModeButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  selectModeText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  selectAllText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: GLASS.getCornerRadius('small'),
  },
  deleteButtonText: {
    fontSize: 13,
    fontFamily: FONTS.semibold,
    color: '#fff',
  },
  // Resume selection list
  resumeList: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  resumeCardBlur: {
    borderRadius: GLASS.getCornerRadius('medium'),
    overflow: 'hidden',
  },
  resumeCard: {
    padding: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
  },
  resumeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  resumeCardLeft: {
    width: 36,
    height: 36,
    borderRadius: GLASS.getCornerRadius('small'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeCardText: {
    flex: 1,
  },
  resumeCardTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    marginBottom: 2,
  },
  resumeCardCompany: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
  },
  resumeCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  matchBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: GLASS.getCornerRadius('small'),
  },
  matchBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  // Options
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionButtonText: {
    ...TYPOGRAPHY.caption,
  },
  optionButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  generateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: GLASS.getCornerRadius('medium'),
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...GLASS.getShadow('medium'),
    marginTop: SPACING.md,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    ...TYPOGRAPHY.heading3,
    color: '#ffffff',
  },
  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
    gap: SPACING.md,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.heading3,
    marginTop: SPACING.sm,
  },
  emptyStateText: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    borderRadius: GLASS.getCornerRadius('medium'),
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  emptyStateButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#ffffff',
  },
  // Loading
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    gap: SPACING.sm,
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
  },
  // History
  historySection: {
    marginTop: SPACING.xl,
  },
  historySectionTitle: {
    ...TYPOGRAPHY.heading2,
    marginBottom: SPACING.md,
  },
  cardBlur: {
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...GLASS.getShadow('medium'),
  },
  card: {
    padding: SPACING.lg,
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
  },
  cardTitle: {
    ...TYPOGRAPHY.heading3,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.xs,
  },
  cardDate: {
    ...TYPOGRAPHY.caption,
  },
});
