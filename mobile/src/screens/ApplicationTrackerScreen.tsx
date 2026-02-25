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
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS } from '../utils/constants';
import { GlassCard } from '../components/glass/GlassCard';
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

const PIPELINE_STAGES = [
  { key: 'applied', label: 'Applied', color: COLORS.info },
  { key: 'screening', label: 'Screen', color: COLORS.primary },
  { key: 'interviewing', label: 'Interview', color: COLORS.cyan },
  { key: 'offer', label: 'Offer', color: COLORS.success },
  { key: 'accepted', label: 'Accepted', color: COLORS.success },
];

const getStageIndex = (status: string): number => {
  const idx = PIPELINE_STAGES.findIndex(s => s.key === status);
  return idx >= 0 ? idx : -1;
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
    <GlassCard style={styles.cardGlass}>
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
            <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>
              {item.jobTitle}
            </Text>
            <Text style={[styles.companyName, { color: colors.textSecondary }]} numberOfLines={1}>
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
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>📍 {item.location}</Text>
            )}
            {formatSalary(item.salaryMin, item.salaryMax) && (
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>💰 {formatSalary(item.salaryMin, item.salaryMax)}</Text>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={[styles.dateText, { color: colors.textTertiary }]}>
            {item.appliedDate ? `Applied ${formatDate(item.appliedDate)}` : `Saved ${formatDate(item.createdAt)}`}
          </Text>
        </View>

        {/* Status Progress Dots */}
        <View style={[styles.progressDots, { borderTopColor: colors.textTertiary + '20' }]}>
          {PIPELINE_STAGES.map((stage, index) => {
            const currentIdx = getStageIndex(item.status);
            const isCompleted = index <= currentIdx;
            const isCurrent = index === currentIdx;
            return (
              <React.Fragment key={stage.key}>
                {index > 0 && (
                  <View style={[styles.progressLine, { backgroundColor: isCompleted ? stage.color : colors.textTertiary + '20' }]} />
                )}
                <View style={[
                  styles.progressDot,
                  isCompleted
                    ? { backgroundColor: stage.color }
                    : { backgroundColor: colors.textTertiary + '20' },
                  isCurrent && styles.progressDotCurrent,
                ]} />
              </React.Fragment>
            );
          })}
        </View>
      </TouchableOpacity>
    </GlassCard>
  );

  const renderPipelineView = () => {
    if (!stats) return null;

    return (
      <GlassCard style={styles.pipelineCard}>
        <Text style={[styles.statsTitle, { color: colors.text }]}>Application Pipeline</Text>
        <View style={styles.pipeline}>
          {PIPELINE_STAGES.map((stage, index) => {
            const count = (stats as any)[stage.key] || 0;
            const isActive = count > 0;
            return (
              <React.Fragment key={stage.key}>
                {index > 0 && (
                  <View style={[styles.pipelineConnector, { backgroundColor: isActive ? stage.color : colors.textTertiary + '30' }]} />
                )}
                <View style={styles.pipelineStage}>
                  <View style={[
                    styles.pipelineCircle,
                    isActive
                      ? { backgroundColor: stage.color }
                      : { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.textTertiary + '40' }
                  ]}>
                    <Text style={[
                      styles.pipelineCount,
                      { color: isActive ? '#ffffff' : colors.textTertiary }
                    ]}>
                      {count}
                    </Text>
                  </View>
                  <Text style={[styles.pipelineLabel, { color: isActive ? colors.text : colors.textTertiary }]}>
                    {stage.label}
                  </Text>
                </View>
              </React.Fragment>
            );
          })}
        </View>

        {/* Summary row below pipeline */}
        <View style={[styles.summaryRow, { borderTopColor: colors.textTertiary + '20' }]}>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {stats.saved || 0} saved
          </Text>
          <Text style={[styles.summaryDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {stats.rejected || 0} rejected
          </Text>
          <Text style={[styles.summaryDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            {stats.no_response || 0} no response
          </Text>
        </View>
      </GlassCard>
    );
  };

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterChip, { backgroundColor: colors.backgroundSecondary + '40' }, !selectedStatus && styles.filterChipActive]}
        onPress={() => setSelectedStatus(null)}
      >
        <Text style={[styles.filterChipText, { color: colors.textSecondary }, !selectedStatus && styles.filterChipTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <TouchableOpacity
          key={key}
          style={[styles.filterChip, { backgroundColor: colors.backgroundSecondary + '40' }, selectedStatus === key && styles.filterChipActive]}
          onPress={() => setSelectedStatus(key)}
        >
          <Text style={[styles.filterChipText, { color: colors.textSecondary }, selectedStatus === key && styles.filterChipTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Application Tracker</Text>
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
            {renderPipelineView()}
            {renderFilterChips()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No applications yet</Text>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
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
  pipelineCard: {
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  statsTitle: {
    ...TYPOGRAPHY.heading3,
    marginBottom: SPACING.md,
  },
  pipeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
  },
  pipelineStage: {
    alignItems: 'center',
  },
  pipelineCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipelineCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  pipelineLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
  },
  pipelineConnector: {
    height: 2,
    flex: 1,
    marginHorizontal: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: SPACING.sm,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
  },
  summaryText: {
    fontSize: 12,
  },
  summaryDot: {
    fontSize: 8,
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
    borderWidth: GLASS.getBorderWidth(),
    borderColor: GLASS.getBorderColor(),
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.caption,
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  cardGlass: {
    marginBottom: SPACING.md,
  },
  card: {
    padding: SPACING.lg,
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
    marginBottom: SPACING.xs,
  },
  companyName: {
    ...TYPOGRAPHY.body,
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
    marginBottom: SPACING.xs,
  },
  cardFooter: {
    borderTopWidth: GLASS.getBorderWidth(),
    borderTopColor: GLASS.getBorderColor(),
    paddingTop: SPACING.sm,
  },
  dateText: {
    ...TYPOGRAPHY.caption,
  },
  progressDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
  },
  progressLine: {
    height: 2,
    flex: 1,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotCurrent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading2,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
