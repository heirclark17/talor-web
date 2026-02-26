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
  Target, Award, Zap, DollarSign, Briefcase,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { CareerPlanResults } from '../components';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import type { CareerPlan } from '../types/career-plan';
import { transformApiResponse } from '../utils/careerPlanTransform';

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
        const transformed = transformApiResponse(planData.plan || planData);
        setPlan({ ...transformed, id: planId, _timeline: planData.timeline || '' });
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
        message: `Career Plan: ${plan.targetRoles?.[0]?.title || 'My Career Plan'}\n\n${plan.profileSummary || ''}`,
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
              {plan.targetRoles?.[0]?.title || 'Career Plan'}
            </Text>

            {/* Salary range */}
            {plan.targetRoles?.[0]?.salaryRange ? (
              <View style={styles.detailSalaryRow}>
                <DollarSign size={14} color="#10B981" />
                <Text style={styles.detailSalaryText}>{plan.targetRoles[0].salaryRange}</Text>
              </View>
            ) : null}

            {/* Quick stats */}
            <View style={styles.quickStatsRow}>
              {plan.targetRoles?.length > 0 && (
                <View style={[styles.quickStat, { backgroundColor: 'rgba(96,165,250,0.12)' }]}>
                  <Target size={11} color="#60A5FA" />
                  <Text style={[styles.quickStatText, { color: '#60A5FA' }]}>
                    {plan.targetRoles.length} role{plan.targetRoles.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {plan.certificationPath?.length > 0 && (
                <View style={[styles.quickStat, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
                  <Award size={11} color="#F59E0B" />
                  <Text style={[styles.quickStatText, { color: '#F59E0B' }]}>
                    {plan.certificationPath.length} cert{plan.certificationPath.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {plan.skillsAnalysis?.needToBuild?.length > 0 && (
                <View style={[styles.quickStat, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                  <Zap size={11} color="#EF4444" />
                  <Text style={[styles.quickStatText, { color: '#EF4444' }]}>
                    {plan.skillsAnalysis.needToBuild.length} gap{plan.skillsAnalysis.needToBuild.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
              {plan.experiencePlan?.length > 0 && (
                <View style={[styles.quickStat, { backgroundColor: 'rgba(139,92,246,0.12)' }]}>
                  <Briefcase size={11} color="#8B5CF6" />
                  <Text style={[styles.quickStatText, { color: '#8B5CF6' }]}>
                    {plan.experiencePlan.length} project{plan.experiencePlan.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>

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
          <CareerPlanResults plan={plan as CareerPlan} timeline={plan._timeline || ''} />
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
  detailSalaryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  detailSalaryText: { fontSize: 15, fontFamily: FONTS.semibold, color: '#10B981' },
  quickStatsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  quickStatText: { fontSize: 12, fontFamily: FONTS.medium },
  planSummary: { fontSize: 14, fontFamily: FONTS.regular, lineHeight: 20, marginBottom: 6 },
  planDate: { fontSize: 12, fontFamily: FONTS.regular },
});
