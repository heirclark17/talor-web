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
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

interface SavedComparison {
  id: number;
  title: string;
  company?: string;
  job_title?: string;
  tailored_resume_id: number;
  created_at: string;
  match_score?: number;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavedComparisonsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [comparisons, setComparisons] = useState<SavedComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadComparisons = async () => {
    try {
      const result = await api.getSavedComparisons();
      if (result.success && result.data) {
        setComparisons(result.data);
      }
    } catch (error) {
      console.error('Error loading comparisons:', error);
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
    navigation.navigate('InterviewPrep', { tailoredResumeId });
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
    if (!score) return COLORS.dark.textTertiary;
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.danger;
  };

  const renderItem = ({ item }: { item: SavedComparison }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <BookmarkCheck color={COLORS.primary} size={24} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.company && (
            <View style={styles.metaRow}>
              <Building2 color={COLORS.dark.textTertiary} size={12} />
              <Text style={styles.metaText}>{item.company}</Text>
            </View>
          )}
          {item.job_title && (
            <View style={styles.metaRow}>
              <Briefcase color={COLORS.dark.textTertiary} size={12} />
              <Text style={styles.metaText}>{item.job_title}</Text>
            </View>
          )}
          <View style={styles.bottomRow}>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            {item.match_score !== undefined && (
              <View style={styles.scoreBadge}>
                <Text style={[styles.scoreText, { color: getScoreColor(item.match_score) }]}>
                  {item.match_score}% match
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleViewInterviewPrep(item.tailored_resume_id)}
        >
          <Target color={COLORS.primary} size={18} />
          <Text style={styles.actionText}>Prep</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
          disabled={deletingId === item.id}
        >
          {deletingId === item.id ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <Trash2 color={COLORS.danger} size={18} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <BookmarkCheck color={COLORS.dark.textTertiary} size={64} />
      </View>
      <Text style={styles.emptyTitle}>No Saved Comparisons</Text>
      <Text style={styles.emptyText}>
        Save tailored resume comparisons to quickly access them later and track your applications.
      </Text>
      <TouchableOpacity
        style={styles.tailorButton}
        onPress={() => navigation.navigate('Main' as any)}
      >
        <Target color={COLORS.dark.background} size={20} />
        <Text style={styles.tailorButtonText}>Tailor a Resume</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading saved comparisons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved</Text>
        {comparisons.length > 0 && (
          <Text style={styles.headerCount}>{comparisons.length} items</Text>
        )}
      </View>

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
    backgroundColor: COLORS.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.dark.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark.text,
  },
  headerCount: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.lg,
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
    backgroundColor: COLORS.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.text,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.dark.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.dark.textTertiary,
  },
  scoreBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    backgroundColor: COLORS.dark.backgroundTertiary,
    borderRadius: RADIUS.sm,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.dark.border,
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
    backgroundColor: COLORS.dark.backgroundTertiary,
    minHeight: 44,
  },
  deleteButton: {
    flex: 0,
    width: 44,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  tailorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dark.text,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  tailorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.background,
  },
});
