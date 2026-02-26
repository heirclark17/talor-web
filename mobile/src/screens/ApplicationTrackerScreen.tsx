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
  TextInput,
  ScrollView,
  Linking,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Bookmark,
  ChevronDown,
  X,
  User,
  Mail,
  Clock,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { api } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, GLASS, COLORS, FONTS } from '../utils/constants';
import { GlassCard } from '../components/glass/GlassCard';
import { ApplicationFormModal } from '../components/ApplicationFormModal';

type ApplicationStatus = 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'accepted' | 'rejected' | 'withdrawn' | 'no_response';

interface Application {
  id: number;
  jobTitle: string;
  companyName: string;
  jobUrl?: string | null;
  status: ApplicationStatus;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  appliedDate?: string | null;
  nextFollowUp?: string | null;
  notes?: string | null;
  contactName?: string | null;
  contactEmail?: string | null;
  tailoredResumeId?: number | null;
  salaryInsights?: any;
  createdAt: string;
  updatedAt?: string;
}

interface SavedJob {
  id: number;
  jobUrl: string;
  company: string;
  jobTitle: string;
  location?: string;
  salary?: string;
  createdAt: string | null;
}

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string }> = {
  saved: { label: 'Saved', color: '#9CA3AF', bg: 'rgba(107,114,128,0.2)' },
  applied: { label: 'Applied', color: '#60A5FA', bg: 'rgba(59,130,246,0.2)' },
  screening: { label: 'Screening', color: '#22D3EE', bg: 'rgba(6,182,212,0.2)' },
  interviewing: { label: 'Interviewing', color: '#A78BFA', bg: 'rgba(139,92,246,0.2)' },
  offer: { label: 'Offer', color: '#FBBF24', bg: 'rgba(245,158,11,0.2)' },
  accepted: { label: 'Accepted', color: '#34D399', bg: 'rgba(16,185,129,0.2)' },
  rejected: { label: 'Rejected', color: '#F87171', bg: 'rgba(239,68,68,0.2)' },
  withdrawn: { label: 'Withdrawn', color: '#FB923C', bg: 'rgba(249,115,22,0.2)' },
  no_response: { label: 'No Response', color: '#6B7280', bg: 'rgba(107,114,128,0.15)' },
};

const ALL_STATUSES: ApplicationStatus[] = ['saved', 'applied', 'screening', 'interviewing', 'offer', 'accepted', 'rejected', 'withdrawn', 'no_response'];
const STATS_STATUSES: ApplicationStatus[] = ['applied', 'screening', 'interviewing', 'offer', 'accepted'];

const formatLocalDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function ApplicationTrackerScreen() {
  const { colors, isDark } = useTheme();
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [prefilledJob, setPrefilledJob] = useState<SavedJob | null>(null);

  // Status picker state
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [statusPickerApp, setStatusPickerApp] = useState<Application | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      const res = await api.listApplications(filterStatus === 'all' ? undefined : filterStatus);
      if (res.success) {
        setApplications(res.data || []);
      }
    } catch (error) {
      console.error('[ApplicationTracker] Load error:', error);
    }
  }, [filterStatus]);

  const loadStats = useCallback(async () => {
    try {
      const res = await api.getApplicationStats();
      if (res.success) {
        setStats(res.data || {});
      }
    } catch (error) {
      console.error('[ApplicationTracker] Stats error:', error);
    }
  }, []);

  const loadSavedJobs = useCallback(async () => {
    try {
      const res = await api.getSavedJobs();
      if (res.success) {
        setSavedJobs(res.data || []);
      }
    } catch (error) {
      console.error('[ApplicationTracker] Saved jobs error:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([loadApplications(), loadStats(), loadSavedJobs()]);
    setLoading(false);
    setRefreshing(false);
  }, [loadApplications, loadStats, loadSavedJobs]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadApplications();
  }, [filterStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleStatusChange = async (appId: number, newStatus: ApplicationStatus) => {
    const res = await api.updateApplication(appId, { status: newStatus });
    if (res.success) {
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      loadStats();
    }
  };

  const handleDelete = async (appId: number) => {
    const res = await api.deleteApplication(appId);
    if (res.success) {
      setApplications(prev => prev.filter(a => a.id !== appId));
      loadStats();
    }
  };

  const filtered = applications.filter(a => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.jobTitle.toLowerCase().includes(q) || a.companyName.toLowerCase().includes(q);
    }
    return true;
  });

  const totalActive = (stats['applied'] || 0) + (stats['screening'] || 0) + (stats['interviewing'] || 0);

  const renderStatsRow = () => (
    <View style={styles.statsRow}>
      {STATS_STATUSES.map(status => {
        const config = STATUS_CONFIG[status];
        const isSelected = filterStatus === status;
        return (
          <TouchableOpacity
            key={status}
            style={[
              styles.statCard,
              { backgroundColor: config.bg, borderColor: isSelected ? config.color : (isDark ? colors.glassBorder : 'transparent') },
              isSelected && { borderWidth: 1.5 },
            ]}
            onPress={() => setFilterStatus(filterStatus === status ? 'all' : status)}
            activeOpacity={0.7}
          >
            <Text style={[styles.statCount, { color: config.color }]}>
              {stats[status] || 0}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSavedJobs = () => {
    if (savedJobs.length === 0) return null;

    return (
      <View style={styles.savedJobsSection}>
        <View style={styles.savedJobsHeader}>
          <Bookmark color={colors.textSecondary} size={14} />
          <Text style={[styles.savedJobsTitle, { color: colors.textSecondary }]}>
            Quick Add from Saved Jobs
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.savedJobsScroll}
        >
          {savedJobs.map(job => (
            <TouchableOpacity
              key={job.id}
              style={[
                styles.savedJobCard,
                {
                  backgroundColor: colors.backgroundSecondary + '40',
                  borderColor: isDark ? colors.glassBorder : 'transparent',
                },
              ]}
              onPress={() => {
                setPrefilledJob(job);
                setSelectedApplication(null);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.savedJobCompany, { color: colors.text }]} numberOfLines={1}>
                {job.company}
              </Text>
              <Text style={[styles.savedJobTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {job.jobTitle}
              </Text>
              {job.location && (
                <Text style={[styles.savedJobLocation, { color: colors.textTertiary }]} numberOfLines={1}>
                  {job.location}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderSearchAndFilter = () => (
    <View style={styles.searchFilterRow}>
      <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary + '40', borderColor: isDark ? colors.glassBorder : 'transparent' }]}>
        <Search color={colors.textTertiary} size={18} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search by job title or company..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X color={colors.textTertiary} size={16} />
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: filterStatus !== 'all'
              ? STATUS_CONFIG[filterStatus].bg
              : colors.backgroundSecondary + '40',
            borderColor: filterStatus !== 'all'
              ? STATUS_CONFIG[filterStatus].color
              : (isDark ? colors.glassBorder : 'transparent'),
          },
        ]}
        onPress={() => {
          // Cycle through statuses or show picker
          const currentIndex = filterStatus === 'all' ? -1 : ALL_STATUSES.indexOf(filterStatus);
          const nextIndex = currentIndex + 1;
          setFilterStatus(nextIndex >= ALL_STATUSES.length ? 'all' : ALL_STATUSES[nextIndex]);
        }}
        onLongPress={() => setFilterStatus('all')}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.filterButtonText,
          {
            color: filterStatus !== 'all'
              ? STATUS_CONFIG[filterStatus].color
              : colors.textSecondary,
          },
        ]}>
          {filterStatus === 'all' ? 'All' : STATUS_CONFIG[filterStatus].label}
        </Text>
        <ChevronDown
          color={filterStatus !== 'all' ? STATUS_CONFIG[filterStatus].color : colors.textSecondary}
          size={14}
        />
      </TouchableOpacity>
    </View>
  );

  const renderApplicationCard = ({ item }: { item: Application }) => (
    <GlassCard style={styles.cardGlass}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setSelectedApplication(item);
          setPrefilledJob(null);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardTopLeft}>
            {/* Title + Status Badge */}
            <View style={styles.titleRow}>
              <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={1}>
                {item.jobTitle}
              </Text>
              <TouchableOpacity
                style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[item.status]?.bg }]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  setStatusPickerApp(item);
                  setStatusPickerVisible(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.statusText, { color: STATUS_CONFIG[item.status]?.color }]}>
                  {STATUS_CONFIG[item.status]?.label}
                </Text>
              </TouchableOpacity>
            </View>
            {/* Company */}
            <Text style={[styles.companyName, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.companyName}
            </Text>
            {/* Details row */}
            <View style={styles.detailsRow}>
              {item.location && (
                <View style={styles.detailItem}>
                  <MapPin color={colors.textTertiary} size={12} />
                  <Text style={[styles.detailText, { color: colors.textTertiary }]} numberOfLines={1}>
                    {item.location}
                  </Text>
                </View>
              )}
              {item.salaryMin && (
                <View style={styles.detailItem}>
                  <DollarSign color={colors.textTertiary} size={12} />
                  <Text style={[styles.detailText, { color: colors.textTertiary }]}>
                    {item.salaryMin.toLocaleString()}{item.salaryMax ? ` - ${item.salaryMax.toLocaleString()}` : ''}
                  </Text>
                </View>
              )}
              {item.appliedDate && (
                <View style={styles.detailItem}>
                  <Calendar color={colors.textTertiary} size={12} />
                  <Text style={[styles.detailText, { color: colors.textTertiary }]}>
                    Applied {formatLocalDate(item.appliedDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Right actions */}
          <View style={styles.cardActions}>
            {item.jobUrl && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  if (item.jobUrl) Linking.openURL(item.jobUrl);
                }}
                activeOpacity={0.7}
              >
                <ExternalLink color={colors.textSecondary} size={16} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setSelectedApplication(item);
                setPrefilledJob(null);
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <MoreHorizontal color={colors.textSecondary} size={16} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact & Follow-up */}
        {(item.contactName || item.contactEmail || item.nextFollowUp) && (
          <View style={[styles.notesSection, { borderTopColor: isDark ? colors.glassBorder : colors.border }]}>
            <View style={styles.detailsRow}>
              {item.contactName && (
                <View style={styles.detailItem}>
                  <User color={colors.textTertiary} size={12} />
                  <Text style={[styles.detailText, { color: colors.textTertiary }]}>{item.contactName}</Text>
                </View>
              )}
              {item.contactEmail && (
                <View style={styles.detailItem}>
                  <Mail color={colors.textTertiary} size={12} />
                  <Text style={[styles.detailText, { color: colors.textTertiary }]}>{item.contactEmail}</Text>
                </View>
              )}
              {item.nextFollowUp && (
                <View style={styles.detailItem}>
                  <Clock color={COLORS.warning || '#FBBF24'} size={12} />
                  <Text style={[styles.detailText, { color: COLORS.warning || '#FBBF24' }]}>
                    Follow up {formatLocalDate(item.nextFollowUp)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Notes */}
        {item.notes && (
          <View style={[styles.notesSection, { borderTopColor: isDark ? colors.glassBorder : colors.border }]}>
            <Text style={[styles.notesText, { color: colors.textTertiary }]} numberOfLines={2}>
              {item.notes}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </GlassCard>
  );

  const renderStatusPicker = () => (
    <Modal
      visible={statusPickerVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setStatusPickerVisible(false)}
    >
      <Pressable style={styles.pickerOverlay} onPress={() => setStatusPickerVisible(false)}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      </Pressable>
      <View style={styles.pickerContainer}>
        <BlurView
          intensity={GLASS.getBlurIntensity('strong')}
          tint={isDark ? 'dark' : 'light'}
          style={styles.pickerContent}
        >
          <View style={[styles.pickerInner, { borderColor: colors.glassBorder }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Change Status</Text>
            {ALL_STATUSES.map(status => {
              const config = STATUS_CONFIG[status];
              const isCurrentStatus = statusPickerApp?.status === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.pickerOption,
                    isCurrentStatus && { backgroundColor: config.bg },
                  ]}
                  onPress={() => {
                    if (statusPickerApp) {
                      handleStatusChange(statusPickerApp.id, status);
                    }
                    setStatusPickerVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.pickerDot, { backgroundColor: config.color }]} />
                  <Text style={[styles.pickerOptionText, { color: isCurrentStatus ? config.color : colors.text }]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </Modal>
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.headerTitleRow}>
            <Briefcase color={colors.text} size={28} />
            <Text style={[styles.headerTitle, { color: colors.text }]}>Application Tracker</Text>
          </View>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {totalActive} active application{totalActive !== 1 ? 's' : ''} in pipeline
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedApplication(null);
            setPrefilledJob(null);
            setModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Plus color="#ffffff" size={18} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        renderItem={renderApplicationCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          <>
            {renderStatsRow()}
            {renderSavedJobs()}
            {renderSearchAndFilter()}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Briefcase color={colors.textTertiary} size={56} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No applications yet</Text>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Start tracking your job applications by tapping "Add" above
            </Text>
          </View>
        }
      />

      {/* Status Picker Modal */}
      {renderStatusPicker()}

      {/* Add/Edit Modal */}
      <ApplicationFormModal
        visible={modalVisible}
        application={selectedApplication}
        savedJobs={savedJobs}
        prefilledJob={prefilledJob}
        onClose={() => {
          setModalVisible(false);
          setSelectedApplication(null);
          setPrefilledJob(null);
        }}
        onSave={() => {
          loadApplications();
          loadStats();
        }}
        onDelete={() => {
          loadApplications();
          loadStats();
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
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: FONTS.bold,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.body,
    marginTop: 2,
    marginLeft: 36,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: GLASS.getCornerRadius('medium'),
    ...GLASS.getShadow('medium'),
  },
  addButtonText: {
    ...TYPOGRAPHY.bodyBold,
    color: '#ffffff',
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl * 2,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: GLASS.getCornerRadius('medium'),
    padding: SPACING.sm,
    borderWidth: GLASS.getBorderWidth(),
  },
  statCount: {
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Saved Jobs
  savedJobsSection: {
    marginBottom: SPACING.lg,
  },
  savedJobsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  savedJobsTitle: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  savedJobsScroll: {
    gap: SPACING.sm,
  },
  savedJobCard: {
    minWidth: 200,
    maxWidth: 260,
    borderRadius: GLASS.getCornerRadius('medium'),
    padding: SPACING.sm,
    borderWidth: GLASS.getBorderWidth(),
  },
  savedJobCompany: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
  },
  savedJobTitle: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  savedJobLocation: {
    fontSize: 11,
    marginTop: 2,
  },

  // Search + Filter
  searchFilterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
    height: 44,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    borderRadius: GLASS.getCornerRadius('medium'),
    borderWidth: GLASS.getBorderWidth(),
    height: 44,
  },
  filterButtonText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
  },

  // Application Cards
  cardGlass: {
    marginBottom: SPACING.sm,
  },
  card: {
    padding: SPACING.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  cardTopLeft: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  jobTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 15,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: GLASS.getCornerRadius('full'),
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  companyName: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  detailText: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionButton: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: GLASS.getCornerRadius('small'),
  },
  notesSection: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: GLASS.getBorderWidth(),
  },
  notesText: {
    ...TYPOGRAPHY.caption,
    fontSize: 13,
  },

  // Status Picker Modal
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  pickerContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: GLASS.getCornerRadius('large'),
    overflow: 'hidden',
  },
  pickerInner: {
    padding: SPACING.lg,
    borderWidth: GLASS.getBorderWidth(),
    borderRadius: GLASS.getCornerRadius('large'),
    gap: 4,
  },
  pickerTitle: {
    ...TYPOGRAPHY.heading3,
    marginBottom: SPACING.sm,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: GLASS.getCornerRadius('small'),
  },
  pickerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pickerOptionText: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 3,
    gap: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading3,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
