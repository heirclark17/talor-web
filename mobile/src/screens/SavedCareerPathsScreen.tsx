import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  FolderOpen, Trash2, Eye, Plus, CheckSquare, Square,
  ArrowRight, Calendar, Clock, Award, Briefcase, TrendingUp, XCircle,
  DollarSign, GraduationCap, Target, Zap,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';

interface CareerPlanListItem {
  id: number;
  dream_role?: string;
  dreamRole?: string;
  target_roles?: string[];
  targetRoles?: string[];
  current_role?: string;
  currentRole?: string;
  current_industry?: string;
  currentIndustry?: string;
  timeline?: string;
  target_industries?: string[];
  targetIndustries?: string[];
  num_certifications?: number;
  numCertifications?: number;
  num_projects?: number;
  numProjects?: number;
  profile_summary?: string;
  profileSummary?: string;
  salary_range?: string;
  salaryRange?: string;
  top_certifications?: string[];
  topCertifications?: string[];
  skills_gap_count?: number;
  skillsGapCount?: number;
  skills_have_count?: number;
  skillsHaveCount?: number;
  bridge_role?: string;
  bridgeRole?: string;
  top_education?: string;
  topEducation?: string;
  current_phase?: string;
  currentPhase?: string;
  num_events?: number;
  numEvents?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  version?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SavedCareerPathsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const [plans, setPlans] = useState<CareerPlanListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadPlans = async () => {
    try {
      const result = await api.listCareerPlans();
      if (result.success && result.data) {
        setPlans(Array.isArray(result.data) ? result.data : []);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Error loading career plans:', error);
      setPlans([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPlans();
  };

  const getDreamRole = (item: CareerPlanListItem) =>
    item.dream_role || item.dreamRole || (item.target_roles || item.targetRoles)?.[0] || 'Career Plan';

  const getCurrentRole = (item: CareerPlanListItem) =>
    item.current_role || item.currentRole || '';

  const getProfileSummary = (item: CareerPlanListItem) =>
    item.profile_summary || item.profileSummary || '';

  const getTimeline = (item: CareerPlanListItem) =>
    item.timeline || '';

  const getTargetIndustries = (item: CareerPlanListItem): string[] =>
    item.target_industries || item.targetIndustries || [];

  const getCertCount = (item: CareerPlanListItem) =>
    item.num_certifications ?? item.numCertifications ?? 0;

  const getProjectCount = (item: CareerPlanListItem) =>
    item.num_projects ?? item.numProjects ?? 0;

  const getSalaryRange = (item: CareerPlanListItem) =>
    item.salary_range || item.salaryRange || '';

  const getTopCertifications = (item: CareerPlanListItem): string[] =>
    item.top_certifications || item.topCertifications || [];

  const getSkillsGapCount = (item: CareerPlanListItem) =>
    item.skills_gap_count ?? item.skillsGapCount ?? 0;

  const getSkillsHaveCount = (item: CareerPlanListItem) =>
    item.skills_have_count ?? item.skillsHaveCount ?? 0;

  const getBridgeRole = (item: CareerPlanListItem) =>
    item.bridge_role || item.bridgeRole || '';

  const getTopEducation = (item: CareerPlanListItem) =>
    item.top_education || item.topEducation || '';

  const getCurrentPhase = (item: CareerPlanListItem) =>
    item.current_phase || item.currentPhase || '';

  const getTargetRoles = (item: CareerPlanListItem): string[] =>
    item.target_roles || item.targetRoles || [];

  const getCreatedAt = (item: CareerPlanListItem) =>
    item.created_at || item.createdAt || '';

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDelete = (planId: number) => {
    Alert.alert('Delete Plan', 'Delete this career plan? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            setDeletingId(planId);
            await api.deleteCareerPlan(planId);
            setPlans(prev => prev.filter(p => p.id !== planId));
            setSelectedIds(prev => { const next = new Set(prev); next.delete(planId); return next; });
          } catch { }
          finally { setDeletingId(null); }
        }
      },
    ]);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    Alert.alert('Delete Selected', `Delete ${selectedIds.size} selected plan${selectedIds.size > 1 ? 's' : ''}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setBulkDeleting(true);
          try {
            await Promise.all(Array.from(selectedIds).map(id => api.deleteCareerPlan(id)));
            setPlans(prev => prev.filter(p => !selectedIds.has(p.id)));
            setSelectedIds(new Set());
          } catch { loadPlans(); }
          finally { setBulkDeleting(false); }
        }
      },
    ]);
  };

  const handleDeleteAll = () => {
    if (plans.length === 0) return;
    Alert.alert('Delete All', `Delete ALL ${plans.length} career plans?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete All', style: 'destructive', onPress: async () => {
          setBulkDeleting(true);
          try {
            await api.deleteAllCareerPlans();
            setPlans([]);
            setSelectedIds(new Set());
          } catch { loadPlans(); }
          finally { setBulkDeleting(false); }
        }
      },
    ]);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === plans.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(plans.map(p => p.id)));
  };

  const allSelected = plans.length > 0 && selectedIds.size === plans.length;

  const renderItem = ({ item }: { item: CareerPlanListItem }) => {
    const dreamRole = getDreamRole(item);
    const currentRole = getCurrentRole(item);
    const summary = getProfileSummary(item);
    const industries = getTargetIndustries(item);
    const certs = getCertCount(item);
    const projects = getProjectCount(item);
    const timeline = getTimeline(item);
    const created = formatDate(getCreatedAt(item));
    const salaryRange = getSalaryRange(item);
    const topCerts = getTopCertifications(item);
    const skillsGap = getSkillsGapCount(item);
    const skillsHave = getSkillsHaveCount(item);
    const bridgeRole = getBridgeRole(item);
    const topEdu = getTopEducation(item);
    const phase = getCurrentPhase(item);
    const targetRoles = getTargetRoles(item);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigation.navigate('SavedCareerPlanDetail', { planId: item.id })}
        style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
      >
        <View style={styles.cardRow}>
          {/* Checkbox */}
          <TouchableOpacity onPress={() => toggleSelect(item.id)} style={styles.checkbox}>
            {selectedIds.has(item.id)
              ? <CheckSquare size={20} color={COLORS.success} />
              : <Square size={20} color={colors.textTertiary} />
            }
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={[styles.dreamRole, { color: colors.text }]} numberOfLines={1}>
              {dreamRole}
            </Text>

            {currentRole ? (
              <View style={styles.transitionRow}>
                <Briefcase size={14} color={colors.textSecondary} />
                <Text style={[styles.transitionText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {currentRole}
                </Text>
                <ArrowRight size={14} color={COLORS.success} />
                <Text style={[styles.transitionTarget, { color: COLORS.success }]} numberOfLines={1}>
                  {dreamRole}
                </Text>
              </View>
            ) : null}

            {/* Target roles (if more than 1) */}
            {targetRoles.length > 1 && (
              <View style={styles.targetRolesRow}>
                <Target size={13} color={colors.textSecondary} />
                <Text style={[styles.targetRolesText, { color: colors.textSecondary }]} numberOfLines={1}>
                  Targeting: {targetRoles.slice(0, 3).join(', ')}
                </Text>
              </View>
            )}

            {/* Salary + bridge role */}
            {(salaryRange || bridgeRole) ? (
              <View style={styles.salaryBridgeRow}>
                {salaryRange ? (
                  <View style={styles.salaryPill}>
                    <DollarSign size={12} color={COLORS.success} />
                    <Text style={styles.salaryText}>{salaryRange}</Text>
                  </View>
                ) : null}
                {bridgeRole ? (
                  <View style={styles.bridgeRow}>
                    <TrendingUp size={12} color={colors.textSecondary} />
                    <Text style={[styles.bridgeText, { color: colors.textSecondary }]} numberOfLines={1}>
                      via: {bridgeRole}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Top certifications */}
            {topCerts.length > 0 && (
              <View style={styles.certRow}>
                <Award size={13} color={COLORS.warning} />
                <Text style={[styles.certListText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {topCerts.join(', ')}
                </Text>
              </View>
            )}

            {/* Top education */}
            {topEdu ? (
              <View style={styles.educationRow}>
                <GraduationCap size={13} color={COLORS.purple} />
                <Text style={[styles.educationText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {topEdu}
                </Text>
              </View>
            ) : null}

            {industries.length > 0 && (
              <View style={styles.pillRow}>
                {industries.slice(0, 3).map((ind, i) => (
                  <View key={i} style={[styles.pill, { backgroundColor: 'rgba(96,165,250,0.15)', borderColor: 'rgba(96,165,250,0.2)' }]}>
                    <Text style={[styles.pillText, { color: COLORS.primary }]}>{ind}</Text>
                  </View>
                ))}
                {industries.length > 3 && (
                  <Text style={[styles.moreText, { color: colors.textTertiary }]}>+{industries.length - 3}</Text>
                )}
              </View>
            )}

            {summary ? (
              <Text style={[styles.summary, { color: colors.textSecondary }]} numberOfLines={2}>
                {summary}
              </Text>
            ) : null}

            {/* Skills stats + phase */}
            {(skillsHave > 0 || skillsGap > 0 || phase) ? (
              <View style={styles.skillsStatsRow}>
                {(skillsHave > 0 || skillsGap > 0) && (
                  <View style={styles.skillStat}>
                    <Zap size={12} color={COLORS.warning} />
                    <Text style={[styles.skillStatText, { color: colors.textSecondary }]}>
                      {skillsHave} skills | {skillsGap} gaps
                    </Text>
                  </View>
                )}
                {phase ? (
                  <View style={[styles.phasePill, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                    <Text style={styles.phaseText}>{phase}</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            <View style={styles.metaRow}>
              {created ? (
                <View style={styles.metaItem}>
                  <Calendar size={12} color={colors.textTertiary} />
                  <Text style={[styles.metaText, { color: colors.textTertiary }]}>{created}</Text>
                </View>
              ) : null}
              {timeline ? (
                <View style={styles.metaItem}>
                  <Clock size={12} color={colors.textTertiary} />
                  <Text style={[styles.metaText, { color: colors.textTertiary }]}>{timeline}</Text>
                </View>
              ) : null}
              {certs > 0 && (
                <View style={styles.metaItem}>
                  <Award size={12} color={colors.textTertiary} />
                  <Text style={[styles.metaText, { color: colors.textTertiary }]}>{certs} certs</Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={() => navigation.navigate('SavedCareerPlanDetail', { planId: item.id })}
              style={[styles.viewBtn, { backgroundColor: 'rgba(16,185,129,0.15)' }]}
            >
              <Eye size={16} color={COLORS.success} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item.id)}
              disabled={deletingId === item.id}
              style={[styles.deleteBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}
            >
              {deletingId === item.id
                ? <ActivityIndicator size="small" color={COLORS.error} />
                : <Trash2 size={16} color={COLORS.error} />
              }
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
        <FolderOpen size={48} color={colors.textTertiary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Career Plans Yet</Text>
        <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
          Create your first AI-powered career plan to get personalized recommendations.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('CareerMain')}
          style={styles.createBtn}
        >
          <Plus size={18} color="#fff" />
          <Text style={styles.createBtnText}>Create Your First Plan</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FolderOpen size={28} color={COLORS.success} />
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Saved Career Plans</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {loading ? 'Loading...' : `${plans.length} plan${plans.length !== 1 ? 's' : ''} saved`}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('CareerMain')}
          style={styles.newBtn}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Bulk Actions */}
      {plans.length > 0 && (
        <View style={styles.bulkActions}>
          <TouchableOpacity onPress={toggleSelectAll} style={styles.bulkBtn}>
            {allSelected
              ? <CheckSquare size={16} color={COLORS.success} />
              : <Square size={16} color={colors.textTertiary} />
            }
            <Text style={[styles.bulkText, { color: colors.textSecondary }]}>
              {allSelected ? 'Deselect' : 'Select All'}
            </Text>
          </TouchableOpacity>
          {selectedIds.size > 0 && (
            <TouchableOpacity onPress={handleDeleteSelected} disabled={bulkDeleting} style={styles.bulkDeleteBtn}>
              {bulkDeleting
                ? <ActivityIndicator size="small" color={COLORS.error} />
                : <Trash2 size={14} color={COLORS.error} />
              }
              <Text style={styles.bulkDeleteText}>Delete ({selectedIds.size})</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={handleDeleteAll} disabled={bulkDeleting} style={styles.bulkDeleteAllBtn}>
            <XCircle size={14} color="rgba(239,68,68,0.7)" />
            <Text style={[styles.bulkDeleteText, { color: 'rgba(239,68,68,0.7)' }]}>All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.success} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading career plans...</Text>
        </View>
      )}

      {/* List */}
      {!loading && (
        <FlatList
          data={plans}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[styles.listContent, plans.length === 0 && styles.listEmpty]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.success} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  title: { fontSize: 22, fontFamily: FONTS.bold },
  subtitle: { fontSize: 13, fontFamily: FONTS.regular, marginTop: 2 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  newBtnText: { color: '#fff', fontSize: 14, fontFamily: FONTS.semibold },
  bulkActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  bulkBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bulkText: { fontSize: 12, fontFamily: FONTS.medium },
  bulkDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  bulkDeleteAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  bulkDeleteText: { fontSize: 12, fontFamily: FONTS.medium, color: COLORS.error },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: SPACING.md },
  loadingText: { fontSize: 15 },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: TAB_BAR_HEIGHT + SPACING.xl },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  checkbox: { paddingTop: 2 },
  cardContent: { flex: 1 },
  dreamRole: { fontSize: 17, fontFamily: FONTS.bold, marginBottom: 4 },
  transitionRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  transitionText: { fontSize: 12, fontFamily: FONTS.regular, maxWidth: '35%' },
  transitionTarget: { fontSize: 12, fontFamily: FONTS.semibold, maxWidth: '35%' },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  pillText: { fontSize: 11, fontFamily: FONTS.medium },
  moreText: { fontSize: 11, fontFamily: FONTS.regular, alignSelf: 'center' },
  targetRolesRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5, paddingLeft: 0 },
  targetRolesText: { fontSize: 12, fontFamily: FONTS.regular, flex: 1 },
  salaryBridgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' },
  salaryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16,185,129,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  salaryText: { fontSize: 12, fontFamily: FONTS.semibold, color: '#10B981' },
  bridgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  bridgeText: { fontSize: 12, fontFamily: FONTS.regular },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  certListText: { fontSize: 12, fontFamily: FONTS.regular, flex: 1 },
  educationRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
  educationText: { fontSize: 12, fontFamily: FONTS.regular, flex: 1 },
  skillsStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  skillStat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  skillStatText: { fontSize: 11, fontFamily: FONTS.medium },
  phasePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  phaseText: { fontSize: 11, fontFamily: FONTS.medium, color: '#8B5CF6' },
  summary: { fontSize: 13, fontFamily: FONTS.regular, lineHeight: 18, marginBottom: 6 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, fontFamily: FONTS.regular },
  actions: { gap: 6 },
  viewBtn: { padding: 8, borderRadius: RADIUS.sm },
  deleteBtn: { padding: 8, borderRadius: RADIUS.sm },
  emptyContainer: {
    alignItems: 'center',
    padding: SPACING.xl * 2,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  emptyTitle: { fontSize: 18, fontFamily: FONTS.bold, marginTop: SPACING.sm },
  emptyDesc: { fontSize: 14, fontFamily: FONTS.regular, textAlign: 'center', lineHeight: 20 },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  createBtnText: { color: '#fff', fontSize: 15, fontFamily: FONTS.semibold },
});
