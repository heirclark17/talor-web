import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ClipboardCheck,
  Building2,
  Briefcase,
  Trash2,
  Target,
  ChevronRight,
  CheckSquare,
  Square,
  X as XIcon,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tailorApi, TailoredResume } from '../api/tailorApi';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { MainStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from '../components/glass/GlassCard';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function TailoredResumesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();
  const [resumes, setResumes] = useState<TailoredResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Bulk delete state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadResumes = async () => {
    try {
      const result = await tailorApi.listTailoredResumes();
      if (result.success && result.data) {
        const list = Array.isArray(result.data) ? result.data : [];
        setResumes(list);
      } else {
        console.error('Failed to load tailored resumes:', result.error);
        setResumes([]);
      }
    } catch (error) {
      console.error('Error loading tailored resumes:', error);
      setResumes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadResumes();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadResumes();
  };

  const handleDelete = (resumeId: number) => {
    Alert.alert(
      'Delete Tailored Resume',
      'Are you sure you want to delete this tailored resume?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(resumeId);
            try {
              const result = await tailorApi.deleteTailoredResume(resumeId);
              if (result.success) {
                setResumes((prev) => prev.filter((r) => r.id !== resumeId));
              } else {
                Alert.alert('Error', result.error || 'Failed to delete resume');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete resume');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleViewResume = (item: TailoredResume) => {
    navigation.navigate('TailorResume', { resumeId: item.id });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getScoreColor = (score?: number) => {
    if (!score) return colors.textTertiary;
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  // Bulk delete helpers
  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === resumes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(resumes.map((r) => r.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select items to delete');
      return;
    }

    Alert.alert(
      'Delete Selected',
      `Are you sure you want to delete ${selectedIds.length} tailored ${selectedIds.length === 1 ? 'resume' : 'resumes'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBulkDeleting(true);
            try {
              const result = await tailorApi.bulkDeleteTailoredResumes(selectedIds);
              if (result.success) {
                setResumes((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
                setSelectedIds([]);
                setSelectionMode(false);
              } else {
                Alert.alert('Error', result.error || 'Failed to delete items');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete items');
            } finally {
              setBulkDeleting(false);
            }
          },
        },
      ]
    );
  };

  const cancelSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  const renderItem = ({ item }: { item: TailoredResume }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => (selectionMode ? toggleSelection(item.id) : handleViewResume(item))}
    >
      <GlassCard style={styles.card} material="regular" shadow="subtle">
        <View style={styles.cardContent}>
          {selectionMode && (
            <TouchableOpacity
              style={styles.selectionCheckbox}
              onPress={() => toggleSelection(item.id)}
            >
              {selectedIds.includes(item.id) ? (
                <CheckSquare color={COLORS.primary} size={24} />
              ) : (
                <Square color={colors.textTertiary} size={24} />
              )}
            </TouchableOpacity>
          )}

          <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
            <ClipboardCheck color="#EC4899" size={24} />
          </View>

          <View style={styles.cardText}>
            {item.companyName && (
              <View style={styles.metaRow}>
                <Building2 color={colors.textTertiary} size={12} />
                <Text style={[styles.companyText, { color: colors.text }]} numberOfLines={1}>
                  {item.companyName}
                </Text>
              </View>
            )}
            <View style={styles.metaRow}>
              <Briefcase color={colors.textTertiary} size={12} />
              <Text style={[styles.titleText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.jobTitle || 'Untitled Position'}
              </Text>
            </View>
            <View style={styles.bottomRow}>
              <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                {formatDate(item.createdAt)}
              </Text>
              {item.qualityScore != null && (
                <View style={[styles.scoreBadge, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.scoreText, { color: getScoreColor(item.qualityScore) }]}>
                    {Math.round(item.qualityScore)}% match
                  </Text>
                </View>
              )}
            </View>
          </View>

          {!selectionMode && (
            <View style={styles.navArrow}>
              {deletingId === item.id ? (
                <ActivityIndicator size="small" color={COLORS.danger} />
              ) : (
                <TouchableOpacity
                  style={[styles.deleteIcon, { backgroundColor: ALPHA_COLORS.danger.bg }]}
                  onPress={() => handleDelete(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Trash2 color={COLORS.danger} size={16} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <ClipboardCheck color={colors.textTertiary} size={64} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Tailored Resumes</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Tailor your resume for a specific job to see it here. Each tailored version is saved automatically.
      </Text>
      <TouchableOpacity
        style={[styles.ctaButton, { backgroundColor: colors.text }]}
        onPress={() => navigation.navigate('TailorMain' as any)}
      >
        <Target color={colors.background} size={20} />
        <Text style={[styles.ctaButtonText, { color: colors.background }]}>Tailor a Resume</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading tailored resumes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Tailored</Text>
          {resumes.length > 0 && !selectionMode && (
            <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
              {resumes.length} {resumes.length === 1 ? 'resume' : 'resumes'}
            </Text>
          )}
          {selectionMode && (
            <Text style={[styles.headerCount, { color: COLORS.primary }]}>
              {selectedIds.length} selected
            </Text>
          )}
        </View>

        {resumes.length > 0 && !selectionMode && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setSelectionMode(true)}
            >
              <CheckSquare color={COLORS.primary} size={20} />
            </TouchableOpacity>
          </View>
        )}

        {selectionMode && (
          <View style={styles.selectionActions}>
            <TouchableOpacity style={styles.selectionButton} onPress={toggleSelectAll}>
              <Text style={[styles.selectionButtonText, { color: COLORS.primary }]}>
                {selectedIds.length === resumes.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.selectionButton} onPress={cancelSelectionMode}>
              <XIcon color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {selectionMode && selectedIds.length > 0 && (
        <View style={[styles.bulkActionBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Text style={[styles.bulkActionText, { color: colors.text }]}>
            {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
          </Text>
          <TouchableOpacity
            style={[styles.bulkDeleteButton, { backgroundColor: ALPHA_COLORS.danger.bg }]}
            onPress={handleBulkDelete}
            disabled={bulkDeleting}
          >
            {bulkDeleting ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <>
                <Trash2 color={COLORS.danger} size={18} />
                <Text style={[styles.bulkDeleteText, { color: COLORS.danger }]}>Delete</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={resumes}
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
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.lg,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  selectionButton: {
    padding: SPACING.sm,
  },
  selectionButtonText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  bulkActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenMargin,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
  },
  bulkActionText: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
  bulkDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minHeight: 36,
  },
  bulkDeleteText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  selectionCheckbox: {
    marginRight: SPACING.sm,
  },
  headerTitle: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
  },
  headerCount: {
    ...TYPOGRAPHY.subhead,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  card: {
    marginBottom: SPACING.md,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardText: {
    flex: 1,
  },
  companyText: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    marginBottom: 2,
  },
  titleText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  dateText: {
    ...TYPOGRAPHY.caption1,
  },
  scoreBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  scoreText: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
  navArrow: {
    marginLeft: SPACING.sm,
  },
  deleteIcon: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
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
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  ctaButtonText: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
});
