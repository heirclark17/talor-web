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
import { Briefcase, Building2, ChevronRight, Target } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

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
  const [preps, setPreps] = useState<InterviewPrep[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPreps = async () => {
    try {
      const result = await api.listInterviewPreps();
      if (result.success && result.data) {
        const prepsList = Array.isArray(result.data) ? result.data : [];
        setPreps(prepsList);
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
      style={styles.card}
      onPress={() => navigation.navigate('InterviewPrep', { tailoredResumeId: item.tailored_resume_id })}
      accessibilityRole="button"
      accessibilityLabel={`Interview prep for ${item.company_name} ${item.job_title}`}
      accessibilityHint={`Created on ${formatDate(item.created_at)}`}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Briefcase color={COLORS.primary} size={24} />
        </View>
        <View style={styles.cardText}>
          <View style={styles.cardHeader}>
            <Building2 color={COLORS.dark.textSecondary} size={14} />
            <Text style={styles.company} numberOfLines={1}>
              {item.company_name || 'Unknown Company'}
            </Text>
          </View>
          <Text style={styles.jobTitle} numberOfLines={2}>
            {item.job_title || 'Interview Prep'}
          </Text>
          <Text style={styles.meta}>
            {item.job_location ? `${item.job_location} • ` : ''}
            {formatDate(item.created_at)}
          </Text>
        </View>
      </View>
      <ChevronRight color={COLORS.dark.textTertiary} size={20} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Briefcase color={COLORS.dark.textTertiary} size={64} />
      </View>
      <Text style={styles.emptyTitle}>No Interview Preps</Text>
      <Text style={styles.emptyText}>
        Tailor a resume for a job posting to generate interview preparation materials.
      </Text>
      <TouchableOpacity
        style={styles.tailorButton}
        onPress={() => navigation.navigate('Main' as any)}
        accessibilityRole="button"
        accessibilityLabel="Tailor a resume"
        accessibilityHint="Navigate to resume tailoring to create interview prep materials"
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
          <Text style={styles.loadingText}>Loading interview preps...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Interview Prep</Text>
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
    fontFamily: FONTS.regular,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.extralight,
    color: COLORS.dark.text,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
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
    backgroundColor: COLORS.dark.backgroundTertiary,
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
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textSecondary,
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    color: COLORS.dark.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.dark.textTertiary,
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
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.semibold,
    color: COLORS.dark.background,
  },
});
