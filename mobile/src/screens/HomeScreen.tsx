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
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { OnboardingTour } from '../components/OnboardingTour';
import { SearchFilter, useSearchFilter } from '../components/SearchFilter';
import { useResumeStore, Resume } from '../stores/resumeStore';

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
    <GlassCard style={styles.card} material="thin">
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <FileText color={colors.text} size={24} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.filename, { color: colors.text }]} numberOfLines={1}>
            {item.filename}
          </Text>
          {item.name && (
            <Text style={[styles.name, { color: colors.textSecondary }]}>{item.name}</Text>
          )}
          <Text style={[styles.meta, { color: colors.textTertiary }]}>
            {item.skills_count} skills {'\u2022'} {formatDate(item.uploaded_at)}
          </Text>
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
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Resumes Yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
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
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
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

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Resumes</Text>
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
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderLeft}>
              <FileSearch color={colors.text} size={24} />
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Resume Analysis</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
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
                <GlassCard style={styles.scoreCard} material="regular">
                  <View style={styles.scoreHeader}>
                    <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>Overall Score</Text>
                    <View style={[
                      styles.scoreBadge,
                      {
                        backgroundColor: currentAnalysis.overall_score >= 80
                          ? ALPHA_COLORS.success.bg
                          : currentAnalysis.overall_score >= 60
                          ? ALPHA_COLORS.warning.bg
                          : ALPHA_COLORS.danger.bg,
                      }
                    ]}>
                      <Text style={[
                        styles.scoreValue,
                        {
                          color: currentAnalysis.overall_score >= 80
                            ? COLORS.success
                            : currentAnalysis.overall_score >= 60
                            ? COLORS.warning
                            : COLORS.danger,
                        }
                      ]}>
                        {currentAnalysis.overall_score}
                      </Text>
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
                <GlassCard style={styles.sectionCard} material="regular">
                  <View style={styles.sectionHeader}>
                    <CheckCircle color={COLORS.success} size={20} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Strengths</Text>
                  </View>
                  {currentAnalysis.strengths.map((strength, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <View style={[styles.bulletDot, { backgroundColor: COLORS.success }]} />
                      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{strength}</Text>
                    </View>
                  ))}
                </GlassCard>

                {/* Weaknesses */}
                <GlassCard style={styles.sectionCard} material="regular">
                  <View style={styles.sectionHeader}>
                    <AlertCircle color={COLORS.danger} size={20} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Areas for Improvement</Text>
                  </View>
                  {currentAnalysis.weaknesses.map((weakness, idx) => (
                    <View key={idx} style={styles.bulletItem}>
                      <View style={[styles.bulletDot, { backgroundColor: COLORS.danger }]} />
                      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{weakness}</Text>
                    </View>
                  ))}
                </GlassCard>

                {/* Keyword Optimization */}
                <GlassCard style={styles.sectionCard} material="regular">
                  <View style={styles.sectionHeader}>
                    <TrendingUp color={COLORS.info} size={20} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Keyword Optimization</Text>
                    <View style={[styles.miniScore, { backgroundColor: ALPHA_COLORS.info.bg }]}>
                      <Text style={[styles.miniScoreText, { color: COLORS.info }]}>
                        {currentAnalysis.keyword_optimization.score}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {currentAnalysis.keyword_optimization.suggestions}
                  </Text>
                  {currentAnalysis.keyword_optimization.missing_keywords.length > 0 && (
                    <>
                      <Text style={[styles.subsectionTitle, { color: colors.textTertiary }]}>Missing Keywords:</Text>
                      <View style={styles.keywordContainer}>
                        {currentAnalysis.keyword_optimization.missing_keywords.map((keyword, idx) => (
                          <View key={idx} style={[styles.keywordChip, { backgroundColor: ALPHA_COLORS.info.bg, borderColor: ALPHA_COLORS.info.border }]}>
                            <Text style={[styles.keywordText, { color: COLORS.info }]}>{keyword}</Text>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </GlassCard>

                {/* ATS Compatibility */}
                <GlassCard style={styles.sectionCard} material="regular">
                  <View style={styles.sectionHeader}>
                    <FileText color={COLORS.purple} size={20} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>ATS Compatibility</Text>
                    <View style={[styles.miniScore, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
                      <Text style={[styles.miniScoreText, { color: COLORS.purple }]}>
                        {currentAnalysis.ats_compatibility.score}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                    {currentAnalysis.ats_compatibility.recommendations}
                  </Text>
                  {currentAnalysis.ats_compatibility.issues.length > 0 && (
                    <>
                      <Text style={[styles.subsectionTitle, { color: colors.textTertiary }]}>Issues Found:</Text>
                      {currentAnalysis.ats_compatibility.issues.map((issue, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <View style={[styles.bulletDot, { backgroundColor: COLORS.warning }]} />
                          <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{issue}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </GlassCard>

                {/* Improvement Recommendations */}
                <GlassCard style={styles.sectionCard} material="regular">
                  <View style={styles.sectionHeader}>
                    <TrendingDown color={COLORS.cyan} size={20} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Action Items</Text>
                  </View>
                  {currentAnalysis.improvement_recommendations.map((rec, idx) => (
                    <View key={idx} style={[styles.recommendationCard, { backgroundColor: colors.backgroundTertiary }]}>
                      <View style={styles.recommendationHeader}>
                        <Text style={[styles.categoryText, { color: colors.text }]}>{rec.category}</Text>
                        <View style={[
                          styles.priorityBadge,
                          {
                            backgroundColor: rec.priority === 'high'
                              ? ALPHA_COLORS.danger.bg
                              : rec.priority === 'medium'
                              ? ALPHA_COLORS.warning.bg
                              : ALPHA_COLORS.info.bg,
                            borderColor: rec.priority === 'high'
                              ? ALPHA_COLORS.danger.border
                              : rec.priority === 'medium'
                              ? ALPHA_COLORS.warning.border
                              : ALPHA_COLORS.info.border,
                          }
                        ]}>
                          <Text style={[
                            styles.priorityText,
                            {
                              color: rec.priority === 'high'
                                ? COLORS.danger
                                : rec.priority === 'medium'
                                ? COLORS.warning
                                : COLORS.info,
                            }
                          ]}>
                            {rec.priority}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>
                        {rec.recommendation}
                      </Text>
                      <View style={[styles.exampleBox, { backgroundColor: ALPHA_COLORS.success.bg }]}>
                        <Text style={[styles.exampleLabel, { color: COLORS.success }]}>Example:</Text>
                        <Text style={[styles.exampleText, { color: colors.textSecondary }]}>{rec.example}</Text>
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
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.extralight,
  },
  addButton: {
    width: 44,
    height: 44,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  filename: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    fontFamily: FONTS.regular,
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
    fontSize: 24,
    fontFamily: FONTS.extralight,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: ALPHA_COLORS.white[10],
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
  },
  modalSubtitle: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  scoreCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreLabel: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  scoreBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.lg,
  },
  scoreValue: {
    fontSize: 24,
    fontFamily: FONTS.bold,
  },
  progressBar: {
    height: 8,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: RADIUS.sm,
  },
  sectionCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    flex: 1,
  },
  miniScore: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  miniScoreText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
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
  bulletText: {
    flex: 1,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  sectionText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  subsectionTitle: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  keywordChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  keywordText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  recommendationCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  recommendationText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  exampleBox: {
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
  },
  exampleLabel: {
    fontSize: 11,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    lineHeight: 16,
  },
});
