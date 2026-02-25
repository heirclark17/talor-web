import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Briefcase, Building2, ChevronRight, Target, Star } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';

interface InterviewPrep {
  id: number;
  tailored_resume_id: number;
  company_name: string;
  job_title: string;
  job_location?: string;
  created_at: string;
  updated_at?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function InterviewPrepListScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [preps, setPreps] = useState<InterviewPrep[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storyCounts, setStoryCounts] = useState<Record<number, number>>({});

  const loadPreps = async () => {
    try {
      const result = await api.listInterviewPreps();
      if (result.success && result.data) {
        const prepsList = Array.isArray(result.data) ? result.data : [];
        setPreps(prepsList);

        // Load story counts for each prep
        const counts: Record<number, number> = {};
        await Promise.all(
          prepsList.map(async (prep: InterviewPrep) => {
            try {
              const storiesResult = await api.listStarStories(prep.tailored_resume_id);
              if (storiesResult.success && Array.isArray(storiesResult.data)) {
                counts[prep.id] = storiesResult.data.length;
              }
            } catch {
              counts[prep.id] = 0;
            }
          })
        );
        setStoryCounts(counts);
      } else {
        console.error('Failed to load interview preps:', result.error);
        setPreps([]);
      }
    } catch (error) {
      console.error('Error loading interview preps:', error);
      setPreps([]);
    } finally {
      setLoading(false);
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
    loadPreps();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: InterviewPrep }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
      onPress={() => navigation.navigate('InterviewPrep', { tailoredResumeId: item.tailored_resume_id })}
      accessibilityRole="button"
      accessibilityLabel={`Interview prep for ${item.company_name} ${item.job_title}`}
      accessibilityHint={`Created on ${formatDate(item.created_at)}`}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <Briefcase color={COLORS.primary} size={24} />
        </View>
        <View style={styles.cardText}>
          <View style={styles.cardHeader}>
            <Building2 color={colors.textSecondary} size={14} />
            <Text style={[styles.company, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.company_name || 'Unknown Company'}
            </Text>
          </View>
          <Text style={[styles.jobTitle, { color: colors.text }]} numberOfLines={2}>
            {item.job_title || 'Interview Prep'}
          </Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.textTertiary }]}>
              {item.job_location ? `${item.job_location} • ` : ''}
              {formatDate(item.created_at)}
            </Text>
            {(storyCounts[item.id] || 0) > 0 && (
              <View style={styles.storyBadge}>
                <Star color="#f59e0b" size={12} />
                <Text style={styles.storyBadgeText}>{storyCounts[item.id]} STAR {storyCounts[item.id] === 1 ? 'story' : 'stories'}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <ChevronRight color={colors.textTertiary} size={20} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Briefcase color={colors.textTertiary} size={64} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Interview Preps</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Tailor a resume for a job posting to generate interview preparation materials.
      </Text>
      <TouchableOpacity
        style={[styles.tailorButton, { backgroundColor: colors.text }]}
        onPress={() => navigation.navigate('Tailor' as any)}
        accessibilityRole="button"
        accessibilityLabel="Tailor a resume"
        accessibilityHint="Navigate to resume tailoring to create interview prep materials"
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
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading interview preps...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Interview Prep</Text>
      </View>

      <FlatList
        data={preps}
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
  title: {
    fontSize: 32,
    fontFamily: FONTS.extralight,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SPACING.radiusMD,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 80,
  },
  cardContent: {
    flex: 1,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  company: {
    ...TYPOGRAPHY.caption1,
    flex: 1,
  },
  jobTitle: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    ...TYPOGRAPHY.caption1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  storyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  storyBadgeText: {
    color: '#f59e0b',
    fontSize: 11,
    fontFamily: FONTS.medium,
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
