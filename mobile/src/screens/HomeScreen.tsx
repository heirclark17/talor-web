import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FileText, Upload, Trash2, Target, FileSearch, X, CheckCircle, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { OnboardingTour } from '../components/OnboardingTour';
import { SearchFilter, useSearchFilter } from '../components/SearchFilter';
import { useResumeStore, Resume } from '../stores/resumeStore';
import { NumberText } from '../components/ui';
import { SectionHeader } from '../components/layout';
import { CardStyles, BadgeStyles, ModalStyles } from '../constants/SharedStyles';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();

  // Zustand store for resume management
  const {
    resumes,
    loading,
    refreshing,
    deletingId,
    analyzingId,
    currentAnalysis,
    fetchResumes,
    refreshResumes,
    deleteResume,
    analyzeResume,
    clearAnalysis,
  } = useResumeStore();

  // Local UI state (not shared across screens)
  const [analysisModal, setAnalysisModal] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [selectedSort, setSelectedSort] = useState('');

  // Filter resumes based on search and filters
  const filteredResumes = useMemo(() => {
    let result = [...resumes];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((resume) =>
        resume.filename.toLowerCase().includes(query) ||
        (resume.name && resume.name.toLowerCase().includes(query))
      );
    }

    // Apply sort
    if (selectedSort === 'newest') {
      result.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
    } else if (selectedSort === 'oldest') {
      result.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime());
    } else if (selectedSort === 'name') {
      result.sort((a, b) => a.filename.localeCompare(b.filename));
    } else if (selectedSort === 'skills') {
      result.sort((a, b) => b.skills_count - a.skills_count);
    }

    return result;
  }, [resumes, searchQuery, selectedSort]);

  // Load resumes on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchResumes();
    }, [fetchResumes])
  );

  const handleRefresh = () => {
    refreshResumes();
  };

  const handleDelete = (resumeId: number) => {
    Alert.alert(
      'Delete Resume',
      'Are you sure you want to delete this resume? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteResume(resumeId);
            if (!success) {
              Alert.alert('Error', 'Failed to delete resume');
            }
          },
        },
      ]
    );
  };

  const handleTailor = (resumeId: number) => {
    navigation.navigate('Tailor' as any, { screen: 'TailorResume', params: { resumeId } });
  };

  const handleAnalyze = async (resumeId: number, filename: string) => {
    setCurrentFilename(filename);
    const analysis = await analyzeResume(resumeId);
    if (analysis) {
      setAnalysisModal(true);
    } else {
      Alert.alert('Analysis Failed', 'Failed to analyze resume');
    }
  };

  const closeAnalysisModal = () => {
    setAnalysisModal(false);
    clearAnalysis();
    setCurrentFilename('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: Resume }) => (
    <GlassCard style={styles.card} material="thin" borderRadius={SPACING.radiusMD}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <FileText color={colors.text} size={24} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[TYPOGRAPHY.body, styles.filename, { color: colors.text }]} numberOfLines={1}>
            {item.filename}
          </Text>
          {item.name && (
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, marginBottom: 4 }]}>{item.name}</Text>
          )}
          <View style={styles.metaRow}>
            <NumberText weight="semiBold" style={[TYPOGRAPHY.caption1, { color: colors.textTertiary }]}>
              {item.skills_count}
            </NumberText>
            <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary }]}> skills</Text>
            <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary }]}> {'\u2022'} </Text>
            <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary }]}>{formatDate(item.uploaded_at)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <GlassButton
          label="Analyze"
          variant="secondary"
          size="sm"
          icon={
            analyzingId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.info} />
            ) : (
              <FileSearch color={COLORS.info} size={18} />
            )
          }
          onPress={() => handleAnalyze(item.id, item.filename)}
          disabled={analyzingId === item.id}
          style={styles.actionButton}
        />

        <GlassButton
          label="Tailor"
          variant="secondary"
          size="sm"
          icon={<Target color={COLORS.primary} size={18} />}
          onPress={() => handleTailor(item.id)}
          style={styles.actionButton}
        />

        <GlassButton
          label={deletingId === item.id ? '' : 'Delete'}
          variant="danger"
          size="sm"
          icon={
            deletingId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Trash2 color={COLORS.danger} size={18} />
            )
          }
          onPress={() => handleDelete(item.id)}
          disabled={deletingId === item.id}
          style={styles.actionButton}
        />
      </View>
    </GlassCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <FileText color={colors.textTertiary} size={64} />
      </View>
      <Text style={[TYPOGRAPHY.title2, styles.emptyTitle, { color: colors.text }]}>No Resumes Yet</Text>
      <Text style={[TYPOGRAPHY.body, styles.emptyText, { color: colors.textSecondary }]}>
        Upload your first resume to get started with tailoring for specific jobs.
      </Text>
      <GlassButton
        label="Upload Resume"
        variant="primary"
        size="lg"
        icon={<Upload color="#ffffff" size={20} />}
        onPress={() => navigation.navigate('UploadResume')}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[TYPOGRAPHY.body, { color: colors.textSecondary, marginTop: SPACING.md }]}>
            Loading resumes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Onboarding Tour */}
      <OnboardingTour />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[TYPOGRAPHY.largeTitle, { color: colors.text }]}>My Resumes</Text>
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<Upload color={colors.text} size={20} />}
          onPress={() => navigation.navigate('UploadResume')}
          style={styles.addButton}
        />
      </View>

      {/* Search and Filter */}
      {resumes.length > 0 && (
        <View style={styles.searchContainer}>
          <SearchFilter
            placeholder="Search resumes..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            sortOptions={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'name', label: 'Name (A-Z)' },
              { value: 'skills', label: 'Most Skills' },
            ]}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
          />
        </View>
      )}

      <FlatList
        data={filteredResumes}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      />

      {/* Analysis Modal */}
      <Modal
        visible={analysisModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeAnalysisModal}
      >
        <SafeAreaView style={[ModalStyles.backdrop, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] }]}>
            <View style={styles.modalHeaderLeft}>
              <FileSearch color={colors.text} size={24} />
              <View>
                <Text style={[TYPOGRAPHY.title3, { color: colors.text }]}>Resume Analysis</Text>
                <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                  {currentFilename}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeAnalysisModal} style={styles.closeButton}>
              <X color={colors.textSecondary} size={24} />
            </TouchableOpacity>
          </View>

          {/* Analysis Content */}
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent}>
            {currentAnalysis && (
              <>
                {/* Overall Score */}
                <GlassCard style={styles.scoreCard} material="regular" borderRadius={SPACING.radiusMD}>
                  <View style={styles.scoreHeader}>
                    <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary }]}>Overall Score</Text>
                    <View style={[
                      BadgeStyles.base,
                      {
                        backgroundColor: currentAnalysis.overall_score >= 80
                          ? ALPHA_COLORS.success.bg
                          : currentAnalysis.overall_score >= 60
                          ? ALPHA_COLORS.warning.bg
                          : ALPHA_COLORS.danger.bg,
                      }
                    ]}>
                      <NumberText
                        weight="bold"
                        style={[
                          TYPOGRAPHY.title2,
                          {
                            color: currentAnalysis.overall_score >= 80
                              ? COLORS.success
                              : currentAnalysis.overall_score >= 60
                              ? COLORS.warning
                              : COLORS.danger,
                          }
                        ]}
                      >
                        {currentAnalysis.overall_score}
                      </NumberText>
                    </View>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${currentAnalysis.overall_score}%`,
                          backgroundColor: currentAnalysis.overall_score >= 80
                            ? COLORS.success
                            : currentAnalysis.overall_score >= 60
                            ? COLORS.warning
                            : COLORS.danger,
                        }
                      ]}
                    />
                  </View>
                </GlassCard>

                {/* Strengths */}
                <GlassCard style={styles.sectionCard} material="regular" borderRadius={SPACING.radiusMD}>
                  <View style={styles.sectionHeader}>
                    <CheckCircle color={COLORS.success} size={20} />
                    <Text style={[TYPOGRAPHY.headline, { color: colors.text, flex: 1, marginLeft: SPACING.sm }]}>Strengths</Text>
                  </View>
                  {currentAnalysis.strengths.map((strength, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <View style={[styles.bulletDot, { backgroundColor: COLORS.success }]} />
                      <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, flex: 1 }]}>{strength}</Text>
                    </View>
                  ))}
                </GlassCard>

                {/* Weaknesses */}
                <GlassCard style={styles.sectionCard} material="regular" borderRadius={SPACING.radiusMD}>
                  <View style={styles.sectionHeader}>
                    <AlertCircle color={COLORS.danger} size={20} />
                    <Text style={[TYPOGRAPHY.headline, { color: colors.text, flex: 1, marginLeft: SPACING.sm }]}>Areas for Improvement</Text>
                  </View>
                  {currentAnalysis.weaknesses.map((weakness, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <View style={[styles.bulletDot, { backgroundColor: COLORS.danger }]} />
                      <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, flex: 1 }]}>{weakness}</Text>
                    </View>
                  ))}
                </GlassCard>

                {/* Keyword Optimization */}
                <GlassCard style={styles.sectionCard} material="regular" borderRadius={SPACING.radiusMD}>
                  <View style={styles.sectionHeader}>
                    <TrendingUp color={COLORS.info} size={20} />
                    <Text style={[TYPOGRAPHY.headline, { color: colors.text, flex: 1, marginLeft: SPACING.sm }]}>Keyword Optimization</Text>
                    <View style={[BadgeStyles.base, BadgeStyles.info]}>
                      <NumberText weight="bold" style={[TYPOGRAPHY.caption1, { color: COLORS.info }]}>
                        {currentAnalysis.keyword_optimization.score}
                      </NumberText>
                    </View>
                  </View>
                  <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, marginBottom: SPACING.md }]}>
                    {currentAnalysis.keyword_optimization.suggestions}
                  </Text>
                  {currentAnalysis.keyword_optimization.missing_keywords.length > 0 && (
                    <>
                      <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: SPACING.sm, marginBottom: SPACING.sm }]}>Missing Keywords:</Text>
                      <View style={styles.keywordContainer}>
                        {currentAnalysis.keyword_optimization.missing_keywords.map((keyword, idx) => (
                          <View key={idx} style={[BadgeStyles.base, BadgeStyles.info]}>
                            <Text style={[TYPOGRAPHY.caption1, { color: COLORS.info }]}>{keyword}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </GlassCard>

                {/* ATS Compatibility */}
                <GlassCard style={styles.sectionCard} material="regular" borderRadius={SPACING.radiusMD}>
                  <View style={styles.sectionHeader}>
                    <FileText color={COLORS.purple} size={20} />
                    <Text style={[TYPOGRAPHY.headline, { color: colors.text, flex: 1, marginLeft: SPACING.sm }]}>ATS Compatibility</Text>
                    <View style={[BadgeStyles.base, BadgeStyles.primary, { backgroundColor: ALPHA_COLORS.purple.bg, borderColor: ALPHA_COLORS.purple.border }]}>
                      <NumberText weight="bold" style={[TYPOGRAPHY.caption1, { color: COLORS.purple }]}>
                        {currentAnalysis.ats_compatibility.score}
                      </NumberText>
                    </View>
                  </View>
                  <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, marginBottom: SPACING.md }]}>
                    {currentAnalysis.ats_compatibility.recommendations}
                  </Text>
                  {currentAnalysis.ats_compatibility.issues.length > 0 && (
                    <>
                      <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: SPACING.sm, marginBottom: SPACING.sm }]}>Issues Found:</Text>
                      {currentAnalysis.ats_compatibility.issues.map((issue, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <View style={[styles.bulletDot, { backgroundColor: COLORS.warning }]} />
                          <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, flex: 1 }]}>{issue}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </GlassCard>

                {/* Improvement Recommendations */}
                <GlassCard style={styles.sectionCard} material="regular" borderRadius={SPACING.radiusMD}>
                  <View style={styles.sectionHeader}>
                    <TrendingDown color={COLORS.cyan} size={20} />
                    <Text style={[TYPOGRAPHY.headline, { color: colors.text, flex: 1, marginLeft: SPACING.sm }]}>Action Items</Text>
                  </View>
                  {currentAnalysis.improvement_recommendations.map((rec, idx) => (
                    <View key={idx} style={[styles.recommendationCard, { backgroundColor: colors.backgroundTertiary }]}>
                      <View style={styles.recommendationHeader}>
                        <Text style={[TYPOGRAPHY.subhead, { color: colors.text, fontWeight: '600' }]}>{rec.category}</Text>
                        <View style={[
                          BadgeStyles.base,
                          rec.priority === 'high' ? BadgeStyles.error :
                          rec.priority === 'medium' ? BadgeStyles.warning :
                          BadgeStyles.info,
                        ]}>
                          <Text style={[
                            TYPOGRAPHY.caption1,
                            {
                              color: rec.priority === 'high'
                                ? COLORS.danger
                                : rec.priority === 'medium'
                                ? COLORS.warning
                                : COLORS.info,
                              fontWeight: '700',
                              textTransform: 'uppercase',
                            }
                          ]}>
                            {rec.priority}
                          </Text>
                        </View>
                      </View>
                      <Text style={[TYPOGRAPHY.footnote, { color: colors.textSecondary, marginBottom: SPACING.sm }]}>
                        {rec.recommendation}
                      </Text>
                      <View style={[styles.exampleBox, { backgroundColor: ALPHA_COLORS.success.bg, padding: SPACING.sm, borderRadius: SPACING.radiusSM, marginTop: SPACING.xs }]}>
                        <Text style={[TYPOGRAPHY.caption1, { color: COLORS.success, fontWeight: '600', marginBottom: 4 }]}>Example:</Text>
                        <Text style={[TYPOGRAPHY.caption1, { color: colors.textSecondary }]}>{rec.example}</Text>
                      </View>
                    </View>
                  ))}
                </GlassCard>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.screenMargin,
    paddingVertical: SPACING.md,
  },
  addButton: {
    width: SPACING.touchTarget,
    height: SPACING.touchTarget,
  },
  searchContainer: {
    paddingHorizontal: SPACING.screenMargin,
    paddingBottom: SPACING.sm,
  },
  list: {
    padding: SPACING.screenMargin,
    paddingTop: SPACING.sm,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  card: {
    marginBottom: SPACING.cardGap,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: SPACING.radiusMD,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  filename: {
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    marginBottom: SPACING.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenMargin,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: SPACING.screenMargin,
    paddingBottom: SPACING.xxl,
  },
  scoreCard: {
    marginBottom: SPACING.cardGap,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: 8,
    borderRadius: SPACING.radiusSM,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: SPACING.radiusSM,
  },
  sectionCard: {
    marginBottom: SPACING.cardGap,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  recommendationCard: {
    padding: SPACING.md,
    borderRadius: SPACING.radiusMD,
    marginBottom: SPACING.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  exampleBox: {
    // Styling applied inline in component
  },
});
