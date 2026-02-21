import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS } from '../utils/constants';
import { ApplicationFormModal } from '../components/ApplicationFormModal';

interface Application {
  id: number;
  jobTitle: string;
  companyName: string;
  status: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  appliedDate?: string;
  createdAt: string;
}

interface Stats {
  saved: number;
  applied: number;
  screening: number;
  interviewing: number;
  offer: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  no_response: number;
}

const STATUS_COLORS: Record<string, string> = {
  saved: COLORS.warning,
  applied: COLORS.info,
  screening: COLORS.primary,
  interviewing: COLORS.cyan,
  offer: COLORS.success,
  accepted: COLORS.success,
  rejected: COLORS.error,
  withdrawn: '#9ca3af',
  no_response: '#6b7280',
};

const STATUS_LABELS: Record<string, string> = {
  saved: 'Saved',
  applied: 'Applied',
  screening: 'Screening',
  interviewing: 'Interviewing',
  offer: 'Offer',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  no_response: 'No Response',
};

export default function ApplicationTrackerScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [appsResult, statsResult] = await Promise.all([
        api.listApplications(selectedStatus || undefined),
        api.getApplicationStats(),
      ]);

      if (appsResult.success) {
        setApplications(appsResult.data);
      }

      if (statsResult.success) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderApplicationCard = ({ item }: { item: Application }) => (
    <BlurView intensity={GLASS.getBlurIntensity('subtle')} tint="light" style={styles.cardBlur}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedApplication(item);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {item.jobTitle}
            </Text>
            <Text style={styles.companyName} numberOfLines={1}>
              {item.companyName}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        {(item.location || item.salaryMin || item.salaryMax) && (
          <View style={styles.cardDetails}>
            {item.location && (
              <Text style={styles.detailText}>📍 {item.location}</Text>
            )}
            {formatSalary(item.salaryMin, item.salaryMax) && (
              <Text style={styles.detailText}>💰 {formatSalary(item.salaryMin, item.salaryMax)}</Text>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.dateText}>
            {item.appliedDate ? `Applied ${formatDate(item.appliedDate)}` : `Saved ${formatDate(item.createdAt)}`}
          </Text>
        </View>
      </TouchableOpacity>
    </BlurView>
  );

  const renderStatsCard = () => {
    if (!stats) return null;

    const totalActive = Object.entries(stats)
      .filter(([key]) => !['rejected', 'withdrawn', 'no_response'].includes(key))
      .reduce((sum, [, value]) => sum + value, 0);

    return (
      <BlurView intensity={GLASS.getBlurIntensity('regular')} tint="light" style={styles.statsBlur}>
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Application Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalActive}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.applied || 0}</Text>
              <Text style={styles.statLabel}>Applied</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.interviewing || 0}</Text>
              <Text style={styles.statLabel}>Interviews</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.offer || 0}</Text>
              <Text style={styles.statLabel}>Offers</Text>
            </View>
          </View>
        </View>
      </BlurView>
    );
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterChip, !selectedStatus && styles.filterChipActive]}
        onPress={() => setSelectedStatus(null)}
      >
        <Text style={[styles.filterChipText, !selectedStatus && styles.filterChipTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <TouchableOpacity
          key={key}
          style={[styles.filterChip, selectedStatus === key && styles.filterChipActive]}
          onPress={() => setSelectedStatus(key)}
        >
          <Text style={[styles.filterChipText, selectedStatus === key && styles.filterChipTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Application Tracker</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedApplication(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={applications}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          <>
            {renderStatsCard()}
            {renderFilterChips()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No applications yet</Text>
            <Text style={styles.emptyText}>
              Start tracking your job applications by tapping the Add button above
            </Text>
          </View>
        }
      />

      <ApplicationFormModal
        visible={modalVisible}
        application={selectedApplication}
        onClose={() => {
          setModalVisible(false);
          setSelectedApplication(null);
        }}
        onSave={() => {
          loadData();
        }}
        onDelete={() => {
          loadData();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    paddingVertical: SPACING.md,
    borderBottomWidth: GLASS.getBorderWidth(),
    borderBottomColor: GLASS.getBorderColor(),
  },
  headerTitle: {
    ...TYPOGRAPHY.heading1,
    color: colors.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: GLASS.getCornerRadius('small'),
    ...GLASS.getShadow('medium'),
  },
  addButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#ffffff',
  },
  listContainer: {
    padding: SPACING.md,
  },
  statsBlur: {
    borderRadius: GLASS.getCornerRadius('medium'),
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  statsContainer: {
    padding: SPACING.lg,
  },
  statsTitle: {
    ...TYPOGRAPHY.heading3,
    color: colors.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.primary,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
    marginTop: SPACING.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: GLASS.getCornerRadius('full'),
    backgroundColor: colors.backgroundSecondary + '40',
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  jobTitle: {
    ...TYPOGRAPHY.heading3,
    color: colors.text,
    marginBottom: SPACING.xs,
  },
  companyName: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: GLASS.getCornerRadius('small'),
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: SPACING.sm,
  },
  detailText: {
    ...TYPOGRAPHY.body,
    color: colors.textSecondary,
    marginBottom: SPACING.xs,
  },
  cardFooter: {
    borderTopWidth: GLASS.getBorderWidth(),
    borderTopColor: GLASS.getBorderColor(),
    paddingTop: SPACING.sm,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
    color: colors.textTertiary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading2,
    color: colors.textSecondary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
