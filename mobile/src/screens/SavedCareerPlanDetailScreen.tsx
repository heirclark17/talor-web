import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft, Trash2, Share2, Loader,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { CareerPlanResults } from '../components';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';

type DetailRouteProp = RouteProp<RootStackParamList, 'SavedCareerPlanDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavedCareerPlanDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { planId } = route.params;
  const { colors } = useTheme();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getCareerPlan(planId);
      if (result.success && result.data) {
        const planData = result.data;
        // Map to CareerPlanResults expected shape (handles both snake_case and camelCase)
        setPlan({
          id: planId,
          profileSummary: planData.profile_summary || planData.profileSummary,
          generatedAt: planData.created_at || planData.generatedAt,
          estimated_timeline: planData.estimated_timeline || planData.estimatedTimeline,
          milestones: planData.milestones || [],
          skill_gaps: planData.skill_gaps || planData.skillGaps || [],
          immediate_actions: planData.immediate_actions || planData.immediateActions || [],
          long_term_goals: planData.long_term_goals || planData.longTermGoals || [],
          salary_progression: planData.salary_progression || planData.salaryProgression,
          summary: planData.summary,
          certifications: planData.certifications || [],
          networking_events: planData.networking_events || planData.networkingEvents || [],
          learning_resources: planData.learning_resources || planData.learningResources || [],
          current_role: planData.current_role || planData.currentRole || '',
          target_role: planData.target_role || planData.targetRole || '',
        });
      } else {
        setError(result.error || 'Failed to load career plan');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load career plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Plan', 'Delete this career plan? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            setDeleting(true);
            await api.deleteCareerPlan(planId);
            navigation.goBack();
          } catch {
            setDeleting(false);
            Alert.alert('Error', 'Failed to delete career plan.');
          }
        }
      },
    ]);
  };

  const handleShare = async () => {
    if (!plan) return;
    try {
      await Share.share({
        message: `Career Plan: ${plan.target_role || 'My Career Plan'}\n\n${plan.profileSummary || ''}`,
        title: 'Career Plan',
      });
    } catch { }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.textSecondary} />
          <Text style={[styles.backText, { color: colors.textSecondary }]}>Back</Text>
        </TouchableOpacity>

        {plan && (
          <View style={styles.topActions}>
            <TouchableOpacity onPress={handleShare} style={[styles.actionBtn, { backgroundColor: colors.glass }]}>
              <Share2 size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleting}
              style={[styles.actionBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
            >
              {deleting
                ? <ActivityIndicator size="small" color="#EF4444" />
                : <Trash2 size={16} color="#EF4444" />
              }
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.success} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>Loading career plan...</Text>
        </View>
      )}

      {/* Error */}
      {error && !loading && (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorTitle, { color: '#EF4444' }]}>Error</Text>
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity onPress={fetchPlan} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Plan content */}
      {!loading && !error && plan && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header card */}
          <View style={[styles.headerCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Text style={[styles.planTitle, { color: colors.text }]}>
              {plan.target_role || 'Career Plan'}
            </Text>
            {plan.profileSummary ? (
              <Text style={[styles.planSummary, { color: colors.textSecondary }]}>
                {plan.profileSummary}
              </Text>
            ) : null}
            {plan.generatedAt ? (
              <Text style={[styles.planDate, { color: colors.textTertiary }]}>
                Generated {new Date(plan.generatedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric'
                })}
              </Text>
            ) : null}
          </View>

          {/* Career Plan Results component */}
          <CareerPlanResults planData={plan} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 14, fontFamily: FONTS.medium },
  topActions: { flexDirection: 'row', gap: SPACING.xs },
  actionBtn: { padding: 8, borderRadius: RADIUS.sm },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.xl,
  },
  centerText: { fontSize: 15, fontFamily: FONTS.regular, textAlign: 'center' },
  errorTitle: { fontSize: 18, fontFamily: FONTS.bold },
  retryBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  retryText: { color: '#EF4444', fontSize: 14, fontFamily: FONTS.semibold },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.xl,
  },
  headerCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  planTitle: { fontSize: 22, fontFamily: FONTS.bold, marginBottom: 6 },
  planSummary: { fontSize: 14, fontFamily: FONTS.regular, lineHeight: 20, marginBottom: 6 },
  planDate: { fontSize: 12, fontFamily: FONTS.regular },
});
