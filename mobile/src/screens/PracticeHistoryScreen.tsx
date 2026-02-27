import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Building2,
  Briefcase,
  ArrowLeft,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getInterviewPreps, getPracticeHistory, InterviewPrep, PracticeResponse } from '../api/interviewApi';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';
import { GlassCard } from '../components/glass/GlassCard';

export default function PracticeHistoryScreen() {
  const { colors, isDark } = useTheme();

  // Prep list state
  const [preps, setPreps] = useState<InterviewPrep[]>([]);
  const [loadingPreps, setLoadingPreps] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Selected prep + practice history state
  const [selectedPrep, setSelectedPrep] = useState<InterviewPrep | null>(null);
  const [history, setHistory] = useState<PracticeResponse[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Collapsible STAR story state
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Dynamic theme-aware styles
  const dynamicStyles = useMemo(() => ({
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    cardBg: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    },
    starLabel: {
      backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)',
    },
    starLabelText: {
      color: COLORS.primary,
    },
    metaText: { color: colors.textTertiary },
    categoryBadge: {
      backgroundColor: isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)',
      borderColor: isDark ? 'rgba(139,92,246,0.3)' : 'rgba(139,92,246,0.2)',
    },
    categoryBadgeText: {
      color: isDark ? '#a78bfa' : '#7c3aed',
    },
    divider: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
  }), [colors, isDark]);

  // Load all interview preps
  const loadPreps = async () => {
    try {
      const result = await getInterviewPreps();
      if (result.success && result.data) {
        const prepsList = Array.isArray(result.data) ? result.data : [];
        setPreps(prepsList);
      } else {
        console.error('[PracticeHistory] Failed to load preps:', result.error);
        setPreps([]);
      }
    } catch (error) {
      console.error('[PracticeHistory] Error loading preps:', error);
      setPreps([]);
    } finally {
      setLoadingPreps(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPreps();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    if (selectedPrep) {
      loadHistory(selectedPrep.id);
    } else {
      loadPreps();
    }
  };

  // Load practice history for a specific prep
  const loadHistory = async (prepId: number) => {
    setLoadingHistory(true);
    try {
      const result = await getPracticeHistory(prepId);
      if (result.success && result.data) {
        const historyList = result.data.history || [];
        setHistory(historyList);
      } else {
        console.error('[PracticeHistory] Failed to load history:', result.error);
        setHistory([]);
      }
    } catch (error) {
      console.error('[PracticeHistory] Error loading history:', error);
      setHistory([]);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  };

  const handleSelectPrep = (prep: InterviewPrep) => {
    setSelectedPrep(prep);
    setExpandedId(null);
    loadHistory(prep.id);
  };

  const handleBackToPreps = () => {
    setSelectedPrep(null);
    setHistory([]);
    setExpandedId(null);
  };

  const toggleExpanded = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // ── Prep List Item ──
  const renderPrepItem = ({ item }: { item: InterviewPrep }) => (
    <TouchableOpacity
      style={[styles.prepCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
      onPress={() => handleSelectPrep(item)}
      accessibilityRole="button"
      accessibilityLabel={`View practice history for ${item.company} ${item.jobTitle}`}
    >
      <View style={styles.prepCardContent}>
        <View style={[styles.prepIconContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <Briefcase color={COLORS.primary} size={24} />
        </View>
        <View style={styles.prepCardText}>
          <View style={styles.prepCardHeader}>
            <Building2 color={colors.textSecondary} size={14} />
            <Text style={[styles.prepCompany, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.company || 'Unknown Company'}
            </Text>
          </View>
          <Text style={[styles.prepJobTitle, { color: colors.text }]} numberOfLines={2}>
            {item.jobTitle || 'Interview Prep'}
          </Text>
          <Text style={[styles.prepMeta, dynamicStyles.metaText]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>
      <MessageSquare color={colors.textTertiary} size={20} />
    </TouchableOpacity>
  );

  // ── Practice Response Item ──
  const renderHistoryItem = ({ item }: { item: PracticeResponse }) => {
    const isExpanded = expandedId === item.id;
    const hasStar = item.starStory &&
      item.starStory.situation &&
      item.starStory.task &&
      item.starStory.action &&
      item.starStory.result;
    const duration = formatDuration(item.durationSeconds);

    return (
      <GlassCard variant="standard" style={styles.historyCard}>
        {/* Question */}
        <View style={styles.questionRow}>
          <MessageSquare color={COLORS.primary} size={18} />
          <Text style={[styles.questionText, { color: colors.text }]}>
            {item.questionText}
          </Text>
        </View>

        {/* Category badge */}
        {item.questionCategory ? (
          <View style={[styles.categoryBadge, dynamicStyles.categoryBadge]}>
            <Text style={[styles.categoryBadgeText, dynamicStyles.categoryBadgeText]}>
              {item.questionCategory}
            </Text>
          </View>
        ) : null}

        {/* Meta row: date, times practiced, duration */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock color={colors.textTertiary} size={14} />
            <Text style={[styles.metaText, dynamicStyles.metaText]}>
              {formatDate(item.practicedAt)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <BookOpen color={colors.textTertiary} size={14} />
            <Text style={[styles.metaText, dynamicStyles.metaText]}>
              {item.timesPracticed} {item.timesPracticed === 1 ? 'time' : 'times'}
            </Text>
          </View>
          {duration ? (
            <View style={styles.metaItem}>
              <Clock color={colors.textTertiary} size={14} />
              <Text style={[styles.metaText, dynamicStyles.metaText]}>
                {duration}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Response text */}
        {item.responseText ? (
          <>
            <View style={[styles.divider, dynamicStyles.divider]} />
            <Text style={[styles.responseText, { color: colors.textSecondary }]} numberOfLines={3}>
              {item.responseText}
            </Text>
          </>
        ) : null}

        {/* STAR Story toggle */}
        {hasStar ? (
          <>
            <TouchableOpacity
              style={styles.starToggle}
              onPress={() => toggleExpanded(item.id)}
              accessibilityRole="button"
              accessibilityLabel={isExpanded ? 'Collapse STAR breakdown' : 'Expand STAR breakdown'}
            >
              <Text style={[styles.starToggleText, { color: COLORS.primary }]}>
                STAR Breakdown
              </Text>
              {isExpanded ? (
                <ChevronUp color={COLORS.primary} size={18} />
              ) : (
                <ChevronDown color={COLORS.primary} size={18} />
              )}
            </TouchableOpacity>

            {isExpanded && item.starStory ? (
              <View style={styles.starContainer}>
                {(['situation', 'task', 'action', 'result'] as const).map((key) => (
                  <View key={key} style={styles.starSection}>
                    <View style={[styles.starLabel, dynamicStyles.starLabel]}>
                      <Text style={[styles.starLabelText, dynamicStyles.starLabelText]}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                    </View>
                    <Text style={[styles.starContent, { color: colors.text }]}>
                      {item.starStory![key]}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </GlassCard>
    );
  };

  // ── Empty States ──
  const renderEmptyPreps = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <BookOpen color={colors.textTertiary} size={64} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Practice Sessions Yet
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Complete mock interviews to build your history.
      </Text>
    </View>
  );

  const renderEmptyHistory = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <MessageSquare color={colors.textTertiary} size={64} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Practice Responses
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Practice interview questions to see your history here.
      </Text>
    </View>
  );

  // ── Loading State ──
  if (loadingPreps) {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading practice history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Practice History Detail View ──
  if (selectedPrep) {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToPreps}
            accessibilityRole="button"
            accessibilityLabel="Go back to prep list"
          >
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.headerCompany, { color: colors.textSecondary }]} numberOfLines={1}>
              {selectedPrep.company}
            </Text>
            <Text style={[styles.headerJobTitle, { color: colors.text }]} numberOfLines={1}>
              {selectedPrep.jobTitle}
            </Text>
          </View>
        </View>

        {loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading responses...
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={renderEmptyHistory}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
              />
            }
          />
        )}
      </SafeAreaView>
    );
  }

  // ── Prep List View ──
  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Practice History</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Select a prep to view your practice responses
        </Text>
      </View>

      <FlatList
        data={preps}
        renderItem={renderPrepItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyPreps}
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
  title: {
    fontSize: 32,
    fontFamily: FONTS.extralight,
  },
  subtitle: {
    ...TYPOGRAPHY.subhead,
    marginTop: SPACING.xs,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -SPACING.sm,
  },
  headerTextContainer: {
    flex: 1,
    marginTop: SPACING.xs,
  },
  headerCompany: {
    ...TYPOGRAPHY.caption1,
  },
  headerJobTitle: {
    ...TYPOGRAPHY.title3,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },

  // ── Prep Card ──
  prepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 80,
  },
  prepCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  prepCardText: {
    flex: 1,
  },
  prepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  prepCompany: {
    ...TYPOGRAPHY.caption1,
    flex: 1,
  },
  prepJobTitle: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  prepMeta: {
    ...TYPOGRAPHY.caption1,
  },

  // ── History Card ──
  historyCard: {
    marginBottom: SPACING.md,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  questionText: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  categoryBadgeText: {
    ...TYPOGRAPHY.caption1,
    fontFamily: FONTS.semibold,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...TYPOGRAPHY.caption1,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  responseText: {
    ...TYPOGRAPHY.subhead,
    marginBottom: SPACING.sm,
  },

  // ── STAR Story ──
  starToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  starToggleText: {
    ...TYPOGRAPHY.callout,
    fontFamily: FONTS.semibold,
  },
  starContainer: {
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  starSection: {
    gap: SPACING.xs,
  },
  starLabel: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  starLabelText: {
    ...TYPOGRAPHY.caption1,
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  starContent: {
    ...TYPOGRAPHY.subhead,
  },

  // ── Empty State ──
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
});
