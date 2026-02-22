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
  BookmarkCheck,
  Building2,
  Briefcase,
  Trash2,
  Target,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
  X as XIcon,
  Pin,
  Tag,
  Plus,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from '../components/glass/GlassCard';

interface SavedComparison {
  id: number;
  title: string;
  company?: string;
  job_title?: string;
  tailored_resume_id: number;
  created_at: string;
  match_score?: number;
  is_pinned?: boolean;
  tags?: string[] | null;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavedComparisonsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Feature #16: Export functionality
  const [exporting, setExporting] = useState(false);

  // Feature #17: Bulk delete
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadComparisons = async () => {
    try {
      const result = await api.getSavedComparisons();
      if (result.success && result.data) {
        const comparisonsList = Array.isArray(result.data) ? result.data : [];
        setComparisons(comparisonsList);
      } else {
        console.error('Failed to load comparisons:', result.error);
        setComparisons([]);
      }
    } catch (error) {
      console.error('Error loading comparisons:', error);
      setComparisons([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadComparisons();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadComparisons();
  };

  const handleDelete = (comparisonId: number) => {
    Alert.alert(
      'Delete Comparison',
      'Are you sure you want to delete this saved comparison?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(comparisonId);
            try {
              const result = await api.deleteComparison(comparisonId);
              if (result.success) {
                setComparisons((prev) => prev.filter((c) => c.id !== comparisonId));
              } else {
                Alert.alert('Error', result.error || 'Failed to delete comparison');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete comparison');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleViewInterviewPrep = (tailoredResumeId: number) => {
    navigation.navigate('InterviewPrep' as any, { tailoredResumeId });
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

  // Feature #16: Export saved items
  const handleExport = async (format: 'pdf' | 'json' = 'json') => {
    setExporting(true);
    try {
      const result = await api.exportSavedItems(format);

      if (result.success && result.data) {
        // Create download link
        const blob = result.data;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `saved-comparisons-${Date.now()}.${format}`;
        link.click();
        URL.revokeObjectURL(url);

        Alert.alert('Success', `Exported ${comparisons.length} items as ${format.toUpperCase()}`);
      } else {
        Alert.alert('Export Failed', result.error || 'Could not export saved items');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export saved items');
    } finally {
      setExporting(false);
    }
  };

  // Feature #17: Bulk delete saved items
  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === comparisons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(comparisons.map(c => c.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      Alert.alert('No Selection', 'Please select items to delete');
      return;
    }

    Alert.alert(
      'Delete Selected Items',
      `Are you sure you want to delete ${selectedIds.length} saved ${selectedIds.length === 1 ? 'comparison' : 'comparisons'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBulkDeleting(true);
            try {
              const result = await api.bulkDeleteSavedItems(selectedIds);

              if (result.success) {
                setComparisons(prev => prev.filter(c => !selectedIds.includes(c.id)));
                setSelectedIds([]);
                setSelectionMode(false);
                Alert.alert('Success', `Deleted ${selectedIds.length} ${selectedIds.length === 1 ? 'item' : 'items'}`);
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

  // Pin/Tag functionality
  const handleTogglePin = async (comparisonId: number, currentPinned: boolean) => {
    try {
      const result = await api.updateComparison(comparisonId, {
        is_pinned: !currentPinned,
      });

      if (result.success) {
        setComparisons(prev => prev.map(c =>
          c.id === comparisonId ? { ...c, is_pinned: !currentPinned } : c
        ));
      } else {
        Alert.alert('Error', result.error || 'Failed to update pin status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update pin status');
    }
  };

  const handleAddTag = (comparisonId: number) => {
    Alert.prompt(
      'Add Tag',
      'Enter a tag name',
      async (tagName: string) => {
        if (!tagName.trim()) return;

        const comparison = comparisons.find(c => c.id === comparisonId);
        const currentTags = comparison?.tags || [];
        const newTags = [...currentTags, tagName.trim()];

        try {
          const result = await api.updateComparison(comparisonId, {
            tags: newTags,
          });

          if (result.success) {
            setComparisons(prev => prev.map(c =>
              c.id === comparisonId ? { ...c, tags: newTags } : c
            ));
          } else {
            Alert.alert('Error', result.error || 'Failed to add tag');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to add tag');
        }
      }
    );
  };

  const handleRemoveTag = async (comparisonId: number, tagToRemove: string) => {
    const comparison = comparisons.find(c => c.id === comparisonId);
    const newTags = (comparison?.tags || []).filter(t => t !== tagToRemove);

    try {
      const result = await api.updateComparison(comparisonId, {
        tags: newTags.length > 0 ? newTags : undefined,
      });

      if (result.success) {
        setComparisons(prev => prev.map(c =>
          c.id === comparisonId ? { ...c, tags: newTags.length > 0 ? newTags : null } : c
        ));
      } else {
        Alert.alert('Error', result.error || 'Failed to remove tag');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to remove tag');
    }
  };

  const renderItem = ({ item }: { item: SavedComparison }) => (
    <GlassCard style={styles.card} material="regular" shadow="subtle">
      <View style={styles.cardContent}>
        {/* Feature #17: Selection checkbox */}
        {selectionMode && (
          <TouchableOpacity
            style={styles.selectionCheckbox}
            onPress={() => toggleSelection(item.id)}
            accessibilityRole="checkbox"
            accessibilityLabel={`${item.title}`}
            accessibilityHint={selectedIds.includes(item.id) ? "Selected. Tap to deselect" : "Not selected. Tap to select for bulk actions"}
            accessibilityState={{ checked: selectedIds.includes(item.id) }}
          >
            {selectedIds.includes(item.id) ? (
              <CheckSquare color={COLORS.primary} size={24} />
            ) : (
              <Square color={colors.textTertiary} size={24} />
            )}
          </TouchableOpacity>
        )}

        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <BookmarkCheck color={COLORS.primary} size={24} />
        </View>
        <View style={styles.cardText}>
          <View style={styles.titleRow}>
            {item.is_pinned && (
              <Pin color={COLORS.warning} size={16} style={{ marginRight: SPACING.xs }} />
            )}
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          {item.company && (
            <View style={styles.metaRow}>
              <Building2 color={colors.textTertiary} size={12} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.company}</Text>
            </View>
          )}
          {item.job_title && (
            <View style={styles.metaRow}>
              <Briefcase color={colors.textTertiary} size={12} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>{item.job_title}</Text>
            </View>
          )}
          <View style={styles.bottomRow}>
            <Text style={[styles.dateText, { color: colors.textTertiary }]}>{formatDate(item.created_at)}</Text>
            {item.match_score !== undefined && (
              <View style={[styles.scoreBadge, { backgroundColor: colors.backgroundTertiary }]}>
                <Text style={[styles.scoreText, { color: getScoreColor(item.match_score) }]}>
                  {item.match_score}% match
                </Text>
              </View>
            )}
          </View>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.tagPill, { backgroundColor: ALPHA_COLORS.primary.bg, borderColor: ALPHA_COLORS.primary.border }]}
                  onPress={() => handleRemoveTag(item.id, tag)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove tag ${tag}`}
                  accessibilityHint="Tap to remove this tag from the comparison"
                >
                  <Tag color={COLORS.primary} size={10} />
                  <Text style={[styles.tagText, { color: COLORS.primary }]}>{tag}</Text>
                  <XIcon color={COLORS.primary} size={10} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.is_pinned ? ALPHA_COLORS.warning.bg : colors.backgroundTertiary }]}
          onPress={() => handleTogglePin(item.id, item.is_pinned || false)}
          accessibilityRole="button"
          accessibilityLabel={item.is_pinned ? 'Unpin comparison' : 'Pin comparison'}
          accessibilityHint={item.is_pinned ? 'Removes pin from this comparison' : 'Pins this comparison to the top'}
        >
          <Pin color={item.is_pinned ? COLORS.warning : COLORS.primary} size={18} />
          <Text style={[styles.actionText, item.is_pinned && { color: COLORS.warning }]}>
            {item.is_pinned ? 'Pinned' : 'Pin'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => handleAddTag(item.id)}
          accessibilityRole="button"
          accessibilityLabel="Add tag"
          accessibilityHint="Adds a custom tag to organize this comparison"
        >
          <Plus color={COLORS.primary} size={18} />
          <Text style={styles.actionText}>Tag</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => handleViewInterviewPrep(item.tailored_resume_id)}
          accessibilityRole="button"
          accessibilityLabel={`View interview prep for ${item.company} ${item.job_title}`}
          accessibilityHint="Opens interview preparation materials for this tailored resume"
        >
          <Target color={COLORS.primary} size={18} />
          <Text style={styles.actionText}>Prep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, { backgroundColor: ALPHA_COLORS.danger.bg }]}
          onPress={() => handleDelete(item.id)}
          disabled={deletingId === item.id}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.title} comparison`}
          accessibilityHint="Permanently removes this saved comparison"
          accessibilityState={{ disabled: deletingId === item.id, busy: deletingId === item.id }}
        >
          {deletingId === item.id ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <Trash2 color={COLORS.danger} size={18} />
          )}
        </TouchableOpacity>
      </View>
    </GlassCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <BookmarkCheck color={colors.textTertiary} size={64} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Saved Comparisons</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Save tailored resume comparisons to quickly access them later and track your applications.
      </Text>
      <TouchableOpacity
        style={[styles.tailorButton, { backgroundColor: colors.text }]}
        onPress={() => navigation.navigate('TailorMain' as any)}
        accessibilityRole="button"
        accessibilityLabel="Tailor a resume"
        accessibilityHint="Navigates to resume tailoring to create new comparisons"
      >
        <Target color={colors.background} size={20} />
        <Text style={[styles.tailorButtonText, { color: colors.background }]}>Tailor a Resume</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading saved comparisons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Saved</Text>
          {comparisons.length > 0 && !selectionMode && (
            <Text style={[styles.headerCount, { color: colors.textSecondary }]}>{comparisons.length} items</Text>
          )}
          {selectionMode && (
            <Text style={[styles.headerCount, { color: COLORS.primary }]}>
              {selectedIds.length} selected
            </Text>
          )}
        </View>

        {/* Feature #16 & #17: Action buttons */}
        {comparisons.length > 0 && !selectionMode && (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('Applications')}
              accessibilityRole="button"
              accessibilityLabel="Track Applications"
              accessibilityHint="Navigate to application tracker"
            >
              <Briefcase color={COLORS.primary} size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => handleExport('json')}
              disabled={exporting}
              accessibilityRole="button"
              accessibilityLabel={exporting ? "Exporting comparisons" : "Export comparisons"}
              accessibilityHint="Downloads saved comparisons as JSON file"
              accessibilityState={{ disabled: exporting, busy: exporting }}
            >
              {exporting ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Download color={COLORS.primary} size={20} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setSelectionMode(true)}
              accessibilityRole="button"
              accessibilityLabel="Enter selection mode"
              accessibilityHint="Enables bulk selection and deletion of comparisons"
            >
              <CheckSquare color={COLORS.primary} size={20} />
            </TouchableOpacity>
          </View>
        )}

        {selectionMode && (
          <View style={styles.selectionActions}>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={toggleSelectAll}
              accessibilityRole="button"
              accessibilityLabel={selectedIds.length === comparisons.length ? 'Deselect all items' : 'Select all items'}
              accessibilityHint={`Currently ${selectedIds.length} of ${comparisons.length} items selected`}
            >
              <Text style={[styles.selectionButtonText, { color: COLORS.primary }]}>
                {selectedIds.length === comparisons.length ? 'Deselect All' : 'Select All'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.selectionButton}
              onPress={cancelSelectionMode}
              accessibilityRole="button"
              accessibilityLabel="Cancel selection mode"
              accessibilityHint="Exits selection mode and clears selections"
            >
              <XIcon color={colors.textSecondary} size={20} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Feature #17: Bulk delete bar */}
      {selectionMode && selectedIds.length > 0 && (
        <View style={[styles.bulkActionBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <Text style={[styles.bulkActionText, { color: colors.text }]}>
            {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
          </Text>
          <TouchableOpacity
            style={[styles.bulkDeleteButton, { backgroundColor: ALPHA_COLORS.danger.bg }]}
            onPress={handleBulkDelete}
            disabled={bulkDeleting}
            accessibilityRole="button"
            accessibilityLabel={bulkDeleting ? "Deleting selected items" : `Delete ${selectedIds.length} selected ${selectedIds.length === 1 ? 'item' : 'items'}`}
            accessibilityHint="Permanently removes all selected comparisons"
            accessibilityState={{ disabled: bulkDeleting, busy: bulkDeleting }}
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
        data={comparisons}
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
    paddingHorizontal: SPACING.screenMargin,
    paddingVertical: SPACING.md,
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
    fontSize: 32,
    fontFamily: FONTS.extralight,
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
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
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
  title: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontFamily: FONTS.medium,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    minHeight: 44,
  },
  deleteButton: {
    flex: 0,
    width: 44,
  },
  actionText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
    color: COLORS.primary,
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
  tailorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  tailorButtonText: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
  },
});
