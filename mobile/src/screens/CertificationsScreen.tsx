import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Award,
  Clock,
  DollarSign,
  TrendingUp,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Bookmark,
  CheckCircle,
  ExternalLink,
  FileText,
  Calendar,
  Target,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS, TAB_BAR_HEIGHT, TYPOGRAPHY } from '../utils/constants';
import { GlassCard } from '../components/glass/GlassCard';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../hooks/useTheme';
import { useInterviewPrepStore } from '../stores';
import {
  Certification,
  CertificationRecommendations,
  CertificationRoadmapStep,
} from '../components/interviewPrep/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CertificationsRouteProp = RouteProp<RootStackParamList, 'Certifications'>;

type LevelFilter = 'all' | 'entry' | 'mid' | 'advanced';

export default function CertificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CertificationsRouteProp>();
  const { colors, isDark } = useTheme();
  const { interviewPrepId } = route.params;

  // Get cached data from store
  const { loadingCertifications } = useInterviewPrepStore();
  const cachedPrep = useInterviewPrepStore((state) => {
    // Find the cached prep that matches this interviewPrepId
    const preps = Object.values(state.cachedPreps);
    return preps.find((prep) => prep.interviewPrepId === interviewPrepId) || null;
  });

  const certifications = cachedPrep?.certificationRecommendations || null;
  const loading = loadingCertifications && !certifications;

  const [selectedLevel, setSelectedLevel] = useState<LevelFilter>('all');
  const [expandedCerts, setExpandedCerts] = useState<Set<string>>(new Set());
  const [savedCerts, setSavedCerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSavedCerts();
  }, []);

  const loadSavedCerts = async () => {
    try {
      const saved = await AsyncStorage.getItem('saved_certifications');
      if (saved) {
        setSavedCerts(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      console.error('Error loading saved certs:', error);
    }
  };

  const toggleSaveCert = async (certName: string) => {
    const newSaved = new Set(savedCerts);
    if (newSaved.has(certName)) {
      newSaved.delete(certName);
    } else {
      newSaved.add(certName);
    }
    setSavedCerts(newSaved);
    try {
      await AsyncStorage.setItem('saved_certifications', JSON.stringify([...newSaved]));
    } catch (error) {
      console.error('Error saving cert:', error);
    }
  };

  const toggleExpanded = (certName: string) => {
    const newExpanded = new Set(expandedCerts);
    if (newExpanded.has(certName)) {
      newExpanded.delete(certName);
    } else {
      newExpanded.add(certName);
    }
    setExpandedCerts(newExpanded);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'entry':
      case 'foundation':
        return COLORS.success;
      case 'mid':
      case 'intermediate':
        return COLORS.warning;
      case 'advanced':
        return COLORS.error;
      default:
        return COLORS.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.info;
      default:
        return COLORS.primary;
    }
  };

  const getRoiColor = (roi: string) => {
    if (roi?.toLowerCase().includes('high')) return COLORS.success;
    if (roi?.toLowerCase().includes('medium')) return COLORS.warning;
    return COLORS.info;
  };

  const getAllCertifications = (): Certification[] => {
    if (!certifications?.certifications_by_level) return [];

    const all: Certification[] = [];
    const levels = certifications.certifications_by_level;

    if (levels.entry) all.push(...levels.entry);
    if (levels.foundation) all.push(...levels.foundation);
    if (levels.mid) all.push(...levels.mid);
    if (levels.intermediate) all.push(...levels.intermediate);
    if (levels.advanced) all.push(...levels.advanced);

    return all;
  };

  const getFilteredCertifications = (): Certification[] => {
    const all = getAllCertifications();
    if (selectedLevel === 'all') return all;

    return all.filter(cert => {
      if (selectedLevel === 'entry') return cert.level === 'entry' || cert.level === 'foundation';
      if (selectedLevel === 'mid') return cert.level === 'mid' || cert.level === 'intermediate';
      if (selectedLevel === 'advanced') return cert.level === 'advanced';
      return true;
    });
  };

  const filteredCerts = getFilteredCertifications();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Certifications</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading certification recommendations...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <ArrowLeft color={colors.text} size={24} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Certifications</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Header Card */}
        <GlassCard material="thin" style={styles.introCard}>
          <View style={styles.introHeader}>
            <Award color={COLORS.warning} size={28} />
            <Text style={[styles.introTitle, { color: colors.text }]}>
              Recommended Certifications
            </Text>
          </View>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            AI-curated certifications based on your target role and current skills.
          </Text>
        </GlassCard>

        {/* Level Filter */}
        <View style={styles.filterContainer}>
          {(['all', 'entry', 'mid', 'advanced'] as LevelFilter[]).map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.filterButton,
                { backgroundColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[3] },
                selectedLevel === level && styles.filterButtonActive,
                selectedLevel === level && { backgroundColor: getLevelColor(level) },
              ]}
              onPress={() => setSelectedLevel(level)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${level === 'all' ? 'all levels' : level + ' level'}`}
              accessibilityState={{ selected: selectedLevel === level }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  { color: selectedLevel === level ? '#fff' : colors.textSecondary },
                ]}
              >
                {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Certifications List */}
        {filteredCerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No certifications found for this level.
            </Text>
          </View>
        ) : (
          filteredCerts.map((cert, index) => {
            const isExpanded = expandedCerts.has(cert.name);
            const isSaved = savedCerts.has(cert.name);
            const levelColor = getLevelColor(cert.level);

            return (
              <GlassCard key={index} material="thin" style={styles.certCard}>
                {/* Card Header */}
                <TouchableOpacity
                  style={styles.certHeader}
                  onPress={() => toggleExpanded(cert.name)}
                  accessibilityRole="button"
                  accessibilityLabel={`${cert.name}, ${cert.level} level certification`}
                  accessibilityHint={isExpanded ? "Collapse details" : "Expand to view details"}
                  accessibilityState={{ expanded: isExpanded }}
                >
                  <View style={styles.certHeaderLeft}>
                    <Text style={[styles.certName, { color: colors.text }]}>{cert.name}</Text>
                    <Text style={[styles.certProvider, { color: colors.textSecondary }]}>
                      {cert.provider}
                    </Text>
                    <View style={styles.certBadges}>
                      <View style={[styles.levelBadge, { backgroundColor: `${levelColor}20`, borderColor: levelColor }]}>
                        <Text style={[styles.levelBadgeText, { color: levelColor }]}>
                          {cert.level.toUpperCase()}
                        </Text>
                      </View>
                      {cert.priority && (
                        <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(cert.priority)}20`, borderColor: getPriorityColor(cert.priority) }]}>
                          <Text style={[styles.priorityBadgeText, { color: getPriorityColor(cert.priority) }]}>
                            {cert.priority.toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View style={styles.certHeaderRight}>
                    <TouchableOpacity
                      style={[styles.saveButton, { backgroundColor: isDark ? ALPHA_COLORS.white[5] : ALPHA_COLORS.black[3] }, isSaved && styles.saveButtonActive]}
                      onPress={(e) => {
                        e.stopPropagation();
                        toggleSaveCert(cert.name);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={isSaved ? `Remove ${cert.name} from saved` : `Save ${cert.name}`}
                      accessibilityHint={isSaved ? "Removes from your saved certifications" : "Adds to your saved certifications"}
                      accessibilityState={{ selected: isSaved }}
                    >
                      <Bookmark
                        color={isSaved ? '#fff' : colors.textSecondary}
                        size={18}
                        fill={isSaved ? '#fff' : 'transparent'}
                      />
                    </TouchableOpacity>
                    {isExpanded ? (
                      <ChevronUp color={colors.textSecondary} size={20} />
                    ) : (
                      <ChevronDown color={colors.textSecondary} size={20} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Quick Stats */}
                <View style={[styles.quickStats, { borderTopColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] }]}>
                  <View style={styles.statItem}>
                    <DollarSign color={COLORS.success} size={14} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>{cert.cost}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Clock color={COLORS.info} size={14} />
                    <Text style={[styles.statText, { color: colors.textSecondary }]}>{cert.time_to_complete}</Text>
                  </View>
                  {cert.roi_rating && (
                    <View style={styles.statItem}>
                      <TrendingUp color={getRoiColor(cert.roi_rating)} size={14} />
                      <Text style={[styles.statText, { color: getRoiColor(cert.roi_rating) }]}>
                        ROI: {cert.roi_rating}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Expanded Content */}
                {isExpanded && (
                  <View style={[styles.expandedContent, { borderTopColor: colors.border }]}>
                    {/* Why Recommended */}
                    <View style={styles.expandedSection}>
                      <Text style={[styles.expandedLabel, { color: colors.text }]}>Why Recommended</Text>
                      <Text style={[styles.expandedText, { color: colors.textSecondary }]}>
                        {cert.why_recommended}
                      </Text>
                    </View>

                    {/* Skills Gained */}
                    {cert.skills_gained && cert.skills_gained.length > 0 && (
                      <View style={styles.expandedSection}>
                        <Text style={[styles.expandedLabel, { color: colors.text }]}>Skills Gained</Text>
                        <View style={styles.skillsContainer}>
                          {cert.skills_gained.map((skill, skillIndex) => (
                            <View key={skillIndex} style={[styles.skillChip, { backgroundColor: ALPHA_COLORS.primary.bg }]}>
                              <Text style={[styles.skillChipText, { color: COLORS.primary }]}>{skill}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Details Grid */}
                    <View style={styles.detailsGrid}>
                      <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Cost</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{cert.cost}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Time</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{cert.time_to_complete}</Text>
                      </View>
                      {cert.difficulty && (
                        <View style={styles.detailItem}>
                          <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Difficulty</Text>
                          <Text style={[styles.detailValue, { color: colors.text }]}>{cert.difficulty}</Text>
                        </View>
                      )}
                      {cert.roi_rating && (
                        <View style={styles.detailItem}>
                          <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>ROI Rating</Text>
                          <Text style={[styles.detailValue, { color: getRoiColor(cert.roi_rating) }]}>{cert.roi_rating}</Text>
                        </View>
                      )}
                    </View>

                    {/* Prerequisites */}
                    {cert.prerequisites && (
                      <View style={styles.expandedSection}>
                        <Text style={[styles.expandedLabel, { color: colors.text }]}>Prerequisites</Text>
                        <Text style={[styles.expandedText, { color: colors.textSecondary }]}>
                          {cert.prerequisites}
                        </Text>
                      </View>
                    )}

                    {/* Exam Details */}
                    {cert.exam_details && (
                      <View style={styles.expandedSection}>
                        <View style={styles.sectionHeader}>
                          <FileText color={COLORS.purple} size={16} />
                          <Text style={[styles.expandedLabel, { color: colors.text }]}>Exam Details</Text>
                        </View>
                        <View style={[styles.examDetailsBox, { backgroundColor: colors.backgroundTertiary }]}>
                          {cert.exam_details.format && (
                            <View style={styles.examDetailRow}>
                              <Text style={[styles.examDetailLabel, { color: colors.textTertiary }]}>Format:</Text>
                              <Text style={[styles.examDetailValue, { color: colors.text }]}>{cert.exam_details.format}</Text>
                            </View>
                          )}
                          {cert.exam_details.duration && (
                            <View style={styles.examDetailRow}>
                              <Text style={[styles.examDetailLabel, { color: colors.textTertiary }]}>Duration:</Text>
                              <Text style={[styles.examDetailValue, { color: colors.text }]}>{cert.exam_details.duration}</Text>
                            </View>
                          )}
                          {cert.exam_details.passing_score && (
                            <View style={styles.examDetailRow}>
                              <Text style={[styles.examDetailLabel, { color: colors.textTertiary }]}>Passing Score:</Text>
                              <Text style={[styles.examDetailValue, { color: colors.text }]}>{cert.exam_details.passing_score}</Text>
                            </View>
                          )}
                          {cert.exam_details.validity && (
                            <View style={styles.examDetailRow}>
                              <Text style={[styles.examDetailLabel, { color: colors.textTertiary }]}>Validity:</Text>
                              <Text style={[styles.examDetailValue, { color: colors.text }]}>{cert.exam_details.validity}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Study Resources */}
                    {cert.study_resources && cert.study_resources.length > 0 && (
                      <View style={styles.expandedSection}>
                        <View style={styles.sectionHeader}>
                          <BookOpen color={COLORS.info} size={16} />
                          <Text style={[styles.expandedLabel, { color: colors.text }]}>Study Resources</Text>
                        </View>
                        {cert.study_resources.map((resource, resIndex) => (
                          <View key={resIndex} style={styles.resourceItem}>
                            <View style={[styles.resourceDot, { backgroundColor: COLORS.info }]} />
                            <Text style={[styles.resourceText, { color: colors.textSecondary }]}>{resource}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </GlassCard>
            );
          })
        )}

        {/* Recommended Certification Path */}
        {certifications?.recommended_path && certifications.recommended_path.length > 0 && (
          <GlassCard material="thin" style={styles.roadmapCard}>
            <View style={styles.roadmapHeader}>
              <CheckCircle color={COLORS.success} size={24} />
              <Text style={[styles.roadmapTitle, { color: colors.text }]}>
                Recommended Certification Path
              </Text>
            </View>
            <View style={styles.roadmapList}>
              {certifications.recommended_path.map((step, index) => (
                <View key={index} style={styles.roadmapStep}>
                  <View style={styles.roadmapStepIndicator}>
                    <View style={[styles.roadmapStepNumber, { backgroundColor: COLORS.primary }]}>
                      <Text style={styles.roadmapStepNumberText}>{step.step}</Text>
                    </View>
                    {index < certifications.recommended_path!.length - 1 && (
                      <View style={[styles.roadmapConnector, { backgroundColor: COLORS.primary }]} />
                    )}
                  </View>
                  <View style={styles.roadmapStepContent}>
                    <View style={styles.roadmapStepHeader}>
                      <Text style={[styles.roadmapStepName, { color: colors.text }]}>{step.certification}</Text>
                      <Text style={[styles.roadmapStepTimeline, { color: colors.textTertiary }]}>{step.timeline}</Text>
                    </View>
                    <Text style={[styles.roadmapStepRationale, { color: colors.textSecondary }]}>
                      {step.rationale}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* Personalized Advice */}
        {certifications?.personalized_advice && (
          <GlassCard material="thin" style={styles.adviceCard}>
            <View style={styles.adviceHeader}>
              <Target color={COLORS.purple} size={24} />
              <Text style={[styles.adviceTitle, { color: colors.text }]}>Personalized Career Advice</Text>
            </View>
            <Text style={[styles.adviceText, { color: colors.textSecondary }]}>
              {certifications.personalized_advice}
            </Text>
          </GlassCard>
        )}

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.headline,
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: TAB_BAR_HEIGHT + SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    ...TYPOGRAPHY.subhead,
  },
  introCard: {
    marginBottom: SPACING.lg,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  introTitle: {
    fontSize: 20,
    fontFamily: FONTS.semibold,
  },
  introText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  filterButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    // backgroundColor set dynamically for light/dark mode
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  emptyState: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.subhead,
    textAlign: 'center',
  },
  certCard: {
    marginBottom: SPACING.md,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  certHeaderLeft: {
    flex: 1,
  },
  certName: {
    ...TYPOGRAPHY.callout,
    fontWeight: '600',
    marginBottom: 2,
  },
  certProvider: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  certBadges: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  levelBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  levelBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  priorityBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.semibold,
  },
  certHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  saveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // backgroundColor set dynamically for light/dark mode
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonActive: {
    backgroundColor: COLORS.primary,
  },
  quickStats: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    // borderTopColor set dynamically for light/dark mode
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  expandedContent: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  expandedSection: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  expandedLabel: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  expandedText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  skillChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  skillChipText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailItem: {
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  examDetailsBox: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  examDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  examDetailLabel: {
    ...TYPOGRAPHY.caption1,
  },
  examDetailValue: {
    fontSize: 12,
    fontFamily: FONTS.medium,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  resourceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  resourceText: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 20,
  },
  roadmapCard: {
    marginTop: SPACING.md,
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  roadmapTitle: {
    ...TYPOGRAPHY.headline,
  },
  roadmapList: {
    gap: SPACING.sm,
  },
  roadmapStep: {
    flexDirection: 'row',
  },
  roadmapStepIndicator: {
    alignItems: 'center',
    width: 32,
  },
  roadmapStepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadmapStepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  roadmapConnector: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  roadmapStepContent: {
    flex: 1,
    paddingLeft: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  roadmapStepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  roadmapStepName: {
    ...TYPOGRAPHY.subhead,
    fontWeight: '600',
    flex: 1,
  },
  roadmapStepTimeline: {
    ...TYPOGRAPHY.caption1,
    marginLeft: SPACING.sm,
  },
  roadmapStepRationale: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  adviceCard: {
    marginTop: SPACING.md,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  adviceTitle: {
    ...TYPOGRAPHY.headline,
  },
  adviceText: {
    ...TYPOGRAPHY.subhead,
    lineHeight: 22,
  },
});
