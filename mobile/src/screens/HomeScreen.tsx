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
import { FileText, Upload, Trash2, Target, FileSearch, X, CheckCircle, AlertCircle, TrendingUp, TrendingDown, BookOpen, Briefcase, Clock, GitBranch, Download, Building2, Sparkles, Eye } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { OnboardingTour } from '../components/OnboardingTour';
import { SearchFilter, useSearchFilter } from '../components/SearchFilter';
import { useResumeStore, Resume } from '../stores/resumeStore';
import { api } from '../api/client';
import { NumberText } from '../components/ui';
import { SectionHeader } from '../components/layout';
import { CardStyles, BadgeStyles, ModalStyles } from '../constants/SharedStyles';
import { usePostHog } from '../contexts/PostHogContext';

interface TailoredResume {
  id: number;
  base_resume_id: number;
  job_title?: string;
  company?: string;
  quality_score?: number;
  created_at: string;
}

type UnifiedItem =
  | { type: 'base'; data: Resume }
  | { type: 'tailored'; data: TailoredResume };

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const { capture } = usePostHog();

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

  // Tailored resumes state
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResume[]>([]);
  const [tailoredLoading, setTailoredLoading] = useState(false);

  // Local UI state (not shared across screens)
  const [analysisModal, setAnalysisModal] = useState(false);
  const [currentFilename, setCurrentFilename] = useState<string>('');

  // Version history state
  const [versionsModal, setVersionsModal] = useState(false);
  const [selectedResumeForVersions, setSelectedResumeForVersions] = useState<number | null>(null);
  const [tailoredVersions, setTailoredVersions] = useState<any[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [selectedSort, setSelectedSort] = useState('');

  const fetchTailoredResumes = useCallback(async () => {
    try {
      setTailoredLoading(true);
      const result = await api.listTailoredResumes();
      if (result.success && Array.isArray(result.data)) {
        setTailoredResumes(result.data);
      }
    } catch (error) {
      console.error('Error fetching tailored resumes:', error);
    } finally {
      setTailoredLoading(false);
    }
  }, []);

  // Build unified list
  const unifiedList = useMemo((): UnifiedItem[] => {
    const items: UnifiedItem[] = [
      ...resumes.map(r => ({ type: 'base' as const, data: r })),
      ...tailoredResumes.map(t => ({ type: 'tailored' as const, data: t })),
    ];
    return items;
  }, [resumes, tailoredResumes]);

  // Filter and sort unified list
  const filteredItems = useMemo(() => {
    let result = [...unifiedList];

    // Apply search across both types
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        if (item.type === 'base') {
          return (
            item.data.filename.toLowerCase().includes(query) ||
            (item.data.name && item.data.name.toLowerCase().includes(query))
          );
        } else {
          const jobTitle = (item.data.job_title || '').toLowerCase();
          const company = (item.data.company || '').toLowerCase();
          return jobTitle.includes(query) || company.includes(query);
        }
      });
    }

    // Apply sort
    const getDate = (item: UnifiedItem) =>
      item.type === 'base' ? item.data.uploaded_at : item.data.created_at;
    const getName = (item: UnifiedItem) =>
      item.type === 'base' ? item.data.filename : (item.data.job_title || '');
    const getScore = (item: UnifiedItem) =>
      item.type === 'base' ? item.data.skills_count : (item.data.quality_score || 0);

    if (selectedSort === 'newest') {
      result.sort((a, b) => new Date(getDate(b)).getTime() - new Date(getDate(a)).getTime());
    } else if (selectedSort === 'oldest') {
      result.sort((a, b) => new Date(getDate(a)).getTime() - new Date(getDate(b)).getTime());
    } else if (selectedSort === 'name') {
      result.sort((a, b) => getName(a).localeCompare(getName(b)));
    } else if (selectedSort === 'skills') {
      result.sort((a, b) => getScore(b) - getScore(a));
    } else if (selectedSort === 'base_first') {
      result.sort((a, b) => (a.type === 'base' ? -1 : 1) - (b.type === 'base' ? -1 : 1));
    }

    return result;
  }, [unifiedList, searchQuery, selectedSort]);

  // Load resumes on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchResumes();
      fetchTailoredResumes();
      capture('screen_viewed', {
        screen_name: 'Home',
        screen_type: 'core_feature',
        resume_count: resumes.length,
      });
    }, [fetchResumes, fetchTailoredResumes, capture, resumes.length])
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
    navigation.navigate('TailorResume' as any, { resumeId });
  };

  const handleAnalyze = async (resumeId: number, filename: string) => {
    setCurrentFilename(filename);
    const analysis = await analyzeResume(resumeId);
    if (analysis) {
      setAnalysisModal(true);
      capture('resume_analyzed', {
        screen_name: 'Home',
        resume_id: resumeId,
        filename: filename,
        overall_score: analysis.overall_score,
      });
    } else {
      Alert.alert('Analysis Failed', 'Failed to analyze resume');
    }
  };

  const closeAnalysisModal = () => {
    setAnalysisModal(false);
    clearAnalysis();
    setCurrentFilename('');
  };

  const handleViewVersions = async (resumeId: number) => {
    setSelectedResumeForVersions(resumeId);
    setVersionsModal(true);
    setLoadingVersions(true);
    try {
      const result = await api.listTailoredResumes();
      if (result.success && Array.isArray(result.data)) {
        // Filter to only versions of THIS base resume
        const versions = result.data.filter((t: any) => t.base_resume_id === resumeId);
        setTailoredVersions(versions);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setLoadingVersions(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDeleteTailored = (id: number) => {
    Alert.alert(
      'Delete Tailored Resume',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteTailoredResume(id);
              setTailoredResumes(prev => prev.filter(t => t.id !== id));
            } catch {
              Alert.alert('Error', 'Failed to delete tailored resume');
            }
          },
        },
      ]
    );
  };

  const renderBaseResumeCard = (item: Resume) => (
    <GlassCard style={styles.card} material="thin" borderRadius={SPACING.radiusMD}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <FileText color={colors.text} size={24} />
        </View>
        <View style={styles.cardContent}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Text style={[TYPOGRAPHY.body, styles.filename, { color: colors.text, marginBottom: 0, flexShrink: 1 }]} numberOfLines={1}>
              {item.filename}
            </Text>
            <View style={[BadgeStyles.base, { backgroundColor: ALPHA_COLORS.primary.bg, flexShrink: 0, borderWidth: 0 }]}>
              <Text style={[TYPOGRAPHY.caption2, { color: COLORS.primary, fontFamily: FONTS.semibold }]}>Base</Text>
            </View>
          </View>
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
              <FileSearch color={COLORS.info} size={20} />
            )
          }
          onPress={() => handleAnalyze(item.id, item.filename)}
          disabled={analyzingId === item.id}
          style={styles.actionButton}
          accessibilityLabel={`Analyze ${item.filename}`}
          accessibilityHint="Shows detailed analysis of resume strengths and weaknesses"
        />

        <GlassButton
          label="Tailor"
          variant="secondary"
          size="sm"
          icon={<Target color={COLORS.primary} size={20} />}
          onPress={() => handleTailor(item.id)}
          style={styles.actionButton}
          accessibilityLabel={`Tailor ${item.filename} for a job`}
          accessibilityHint="Opens resume tailoring screen to customize for specific job posting"
        />

        <GlassButton
          label="Versions"
          variant="secondary"
          size="sm"
          icon={<GitBranch color={COLORS.success} size={20} />}
          onPress={() => handleViewVersions(item.id)}
          style={styles.actionButton}
          accessibilityLabel={`View tailored versions of ${item.filename}`}
          accessibilityHint="Shows all tailored versions created from this resume"
        />

        <GlassButton
          label={deletingId === item.id ? '' : 'Delete'}
          variant="danger"
          size="sm"
          icon={
            deletingId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Trash2 color={COLORS.danger} size={20} />
            )
          }
          onPress={() => handleDelete(item.id)}
          disabled={deletingId === item.id}
          style={styles.actionButton}
          accessibilityLabel={`Delete ${item.filename}`}
          accessibilityHint="Permanently removes this resume from your library"
        />
      </View>
    </GlassCard>
  );

  const renderTailoredResumeCard = (item: TailoredResume) => {
    const scoreColor = (item.quality_score || 0) >= 80
      ? COLORS.success
      : (item.quality_score || 0) >= 60
      ? COLORS.warning
      : COLORS.danger;

    return (
      <GlassCard style={[styles.card, { borderLeftWidth: 3, borderLeftColor: COLORS.purple }]} material="thin" borderRadius={SPACING.radiusMD}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: ALPHA_COLORS.purple.bg }]}>
            <Sparkles color={COLORS.purple} size={24} />
          </View>
          <View style={styles.cardContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text style={[TYPOGRAPHY.body, styles.filename, { color: colors.text, marginBottom: 0, flexShrink: 1 }]} numberOfLines={1}>
                {item.job_title || 'Untitled Position'}
              </Text>
              <View style={[BadgeStyles.base, { backgroundColor: ALPHA_COLORS.purple.bg, flexShrink: 0, borderWidth: 0 }]}>
                <Text style={[TYPOGRAPHY.caption2, { color: COLORS.purple, fontFamily: FONTS.semibold }]}>Tailored</Text>
              </View>
            </View>
            <Text style={[TYPOGRAPHY.subhead, { color: colors.textSecondary, marginBottom: 4 }]}>
              {item.company || 'Unknown Company'}
            </Text>
            <View style={styles.metaRow}>
              {item.quality_score != null && (
                <>
                  <Text style={[TYPOGRAPHY.caption1, { color: scoreColor, fontFamily: FONTS.semibold }]}>
                    Score: {item.quality_score}%
                  </Text>
                  <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary }]}> {'\u2022'} </Text>
                </>
              )}
              <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary }]}>{formatDate(item.created_at)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <GlassButton
            label="View"
            variant="secondary"
            size="sm"
            icon={<Eye color={COLORS.primary} size={20} />}
            onPress={() => navigation.navigate('TailorResume' as any, { resumeId: item.id })}
            style={styles.actionButton}
            accessibilityLabel={`View tailored resume for ${item.company}`}
          />
          <GlassButton
            label="Delete"
            variant="danger"
            size="sm"
            icon={<Trash2 color={COLORS.danger} size={20} />}
            onPress={() => handleDeleteTailored(item.id)}
            style={styles.actionButton}
            accessibilityLabel={`Delete tailored resume for ${item.company}`}
          />
        </View>
      </GlassCard>
    );
  };

  const renderItem = ({ item }: { item: UnifiedItem }) => {
    if (item.type === 'base') {
      return renderBaseResumeCard(item.data);
    }
    return renderTailoredResumeCard(item.data);
  };

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
        accessibilityLabel="Upload your first resume"
        accessibilityHint="Opens file picker to select and upload a resume document"
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
        <Text style={[styles.pageTitle, { color: colors.text }]}>My Resumes</Text>
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<Upload color={colors.text} size={20} />}
          onPress={() => navigation.navigate('UploadResume')}
          style={styles.addButton}
          accessibilityLabel="Upload new resume"
          accessibilityHint="Opens file picker to select and upload a resume document"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => navigation.navigate('CoverLetters' as any)}
        >
          <BookOpen color={COLORS.primary} size={24} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Cover Letters</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => navigation.navigate('Applications' as any)}
        >
          <Briefcase color={COLORS.primary} size={24} />
          <Text style={[styles.quickActionText, { color: colors.text }]}>Track Applications</Text>
        </TouchableOpacity>
      </View>

      {/* Resume Counts */}
      {(resumes.length > 0 || tailoredResumes.length > 0) && (
        <View style={styles.countsRow}>
          <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary }]}>
            {resumes.length} base {resumes.length === 1 ? 'resume' : 'resumes'} {'\u2022'} {tailoredResumes.length} tailored
          </Text>
        </View>
      )}

      {/* Search and Filter */}
      {unifiedList.length > 0 && (
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
              { value: 'skills', label: 'Most Skills / Score' },
              { value: 'base_first', label: 'Base First' },
            ]}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
          />
        </View>
      )}

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.type}-${item.data.id}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { handleRefresh(); fetchTailoredResumes(); }}
            tintColor={COLORS.primary}
          />
        }
      />

      {/* Version History Modal */}
      <Modal visible={versionsModal} animationType="slide" transparent onRequestClose={() => { setVersionsModal(false); setTailoredVersions([]); }}>
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.versionsModalContent, { backgroundColor: colors.background }]}>
            <View style={styles.versionsModalHeader}>
              <Text style={[TYPOGRAPHY.title2, { color: colors.text }]}>Tailored Versions</Text>
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close versions modal" onPress={() => { setVersionsModal(false); setTailoredVersions([]); }}>
                <X color={colors.text} size={24} />
              </TouchableOpacity>
            </View>

            {loadingVersions ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            ) : tailoredVersions.length === 0 ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <GitBranch color={colors.textTertiary} size={48} />
                <Text style={[TYPOGRAPHY.body, { color: colors.textSecondary, marginTop: 12, textAlign: 'center' }]}>
                  No tailored versions yet.{'\n'}Tailor this resume for a job to create one.
                </Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                {tailoredVersions.map((version: any) => (
                  <GlassCard key={version.id} style={styles.versionCard} material="thin">
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <Building2 color={COLORS.primary} size={16} />
                      <Text style={[TYPOGRAPHY.bodyBold || { fontSize: 14, fontFamily: FONTS.semibold }, { color: colors.text, marginLeft: 8, flex: 1 }]} numberOfLines={1}>
                        {version.company || 'Unknown Company'}
                      </Text>
                    </View>
                    <Text style={[TYPOGRAPHY.subhead || { fontSize: 13 }, { color: colors.textSecondary, marginBottom: 8 }]} numberOfLines={1}>
                      {version.title || version.job_title || 'Untitled Position'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Clock color={colors.textTertiary} size={12} />
                        <Text style={[TYPOGRAPHY.caption1 || { fontSize: 11 }, { color: colors.textTertiary, marginLeft: 4 }]}>
                          {version.created_at ? new Date(version.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown date'}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setVersionsModal(false);
                            navigation.navigate('InterviewPrep' as any, { tailoredResumeId: version.id });
                          }}
                          style={{ padding: 6 }}
                        >
                          <Briefcase color={COLORS.info} size={18} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={async () => {
                            try {
                              const url = await api.downloadTailoredResume(version.id);
                              if (url) {
                                Alert.alert('Export', 'Download started for tailored resume.');
                              }
                            } catch (e) {
                              Alert.alert('Error', 'Failed to download resume');
                            }
                          }}
                          style={{ padding: 6 }}
                        >
                          <Download color={COLORS.success} size={18} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </GlassCard>
                ))}
              </ScrollView>
            )}
          </GlassCard>
        </View>
      </Modal>

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
            <TouchableOpacity
              onPress={closeAnalysisModal}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close analysis"
              accessibilityHint="Returns to resume list"
            >
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
                      <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary, fontFamily: FONTS.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: SPACING.sm, marginBottom: SPACING.sm }]}>Missing Keywords:</Text>
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
                    <View style={[BadgeStyles.base, BadgeStyles.primary, { backgroundColor: ALPHA_COLORS.purple.bg, borderColor: isDark ? ALPHA_COLORS.purple.border : 'transparent' }]}>
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
                      <Text style={[TYPOGRAPHY.caption1, { color: colors.textTertiary, fontFamily: FONTS.semibold, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: SPACING.sm, marginBottom: SPACING.sm }]}>Issues Found:</Text>
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
                        <Text style={[TYPOGRAPHY.subhead, { color: colors.text, fontFamily: FONTS.semibold }]}>{rec.category}</Text>
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
                              fontFamily: FONTS.bold,
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
                        <Text style={[TYPOGRAPHY.caption1, { color: COLORS.success, fontFamily: FONTS.semibold, marginBottom: 4 }]}>Example:</Text>
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
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  pageTitle: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
  },
  addButton: {
    width: SPACING.touchTarget,
    height: SPACING.touchTarget,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: 0,
    paddingBottom: SPACING.md,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.radiusMD,
  },
  quickActionText: {
    ...TYPOGRAPHY.bodyBold,
  },
  countsRow: {
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: SPACING.xs,
  },
  searchContainer: {
    paddingHorizontal: SPACING.screenMargin,
    paddingTop: SPACING.sm,
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
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cardActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: '30%',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  versionsModalContent: {
    margin: 20,
    marginTop: 100,
    padding: 20,
    borderRadius: 20,
    maxHeight: '70%',
  },
  versionsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  versionCard: {
    padding: 14,
    marginBottom: 10,
  },
});
