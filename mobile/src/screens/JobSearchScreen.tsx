/**
 * Job Search Screen
 * Search for jobs and tailor resume with one click
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Search,
  MapPin,
  Briefcase,
  ExternalLink,
  Target,
  Filter,
  X,
  Clock,
  Building2,
  DollarSign,
} from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { GlassInput } from '../components/glass/GlassInput';
import { tailorApi } from '../api';
import { COLORS, SPACING, FONTS } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  remote: boolean;
  hybrid?: boolean;
  url: string;
  postedDate: string;
  description: string;
  source: string;
}

export default function JobSearchScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);

  // Search filters
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState<boolean | undefined>(undefined);
  const [salaryMin, setSalaryMin] = useState<string>('');

  const ds = useMemo(() => ({
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    inputContainer: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    },
    input: { color: colors.text },
    filterDivider: { borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
    filterButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
      borderWidth: isDark ? 1 : 0,
    },
    recentChip: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
      borderWidth: isDark ? 1 : 0,
    },
    companyLogo: { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' },
  }), [colors, isDark]);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    setRecentSearches([]);
  };

  const handleSearch = async () => {
    if (!keywords.trim()) return;
    setLoading(true);
    try {
      setJobs([]);
      if (keywords.trim() && !recentSearches.includes(keywords.trim())) {
        const updated = [keywords.trim(), ...recentSearches.slice(0, 4)];
        setRecentSearches(updated);
      }
    } catch (error) {
      console.error('Job search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTailorResume = (job: JobPosting) => {
    (navigation as any).navigate('TailorResume', {
      jobUrl: job.url,
      company: job.company,
      title: job.title,
    });
  };

  const handleViewJob = async (job: JobPosting) => {
    await Linking.openURL(job.url);
  };

  const handleRecentSearch = (search: string) => {
    setKeywords(search);
    setTimeout(() => handleSearch(), 100);
  };

  const clearFilters = () => {
    setKeywords('');
    setLocation('');
    setRemote(undefined);
    setSalaryMin('');
  };

  const activeFilterCount = [
    keywords,
    location,
    remote !== undefined,
    salaryMin,
  ].filter(Boolean).length;

  return (
    <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, ds.title]}>Find Your Next Role</Text>
        </View>
        <Text style={[styles.subtitle, ds.subtitle]}>
          Search thousands of jobs and tailor your resume with one click
        </Text>

        {/* Search Bar */}
        <GlassCard style={styles.searchCard}>
          <View style={styles.searchInputs}>
            <View style={[styles.inputContainer, ds.inputContainer]}>
              <Search size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={keywords}
                onChangeText={setKeywords}
                onSubmitEditing={handleSearch}
                placeholder="Job title, keywords, or company"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, ds.input]}
                returnKeyType="search"
              />
            </View>

            <View style={[styles.inputContainer, ds.inputContainer]}>
              <MapPin size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                onSubmitEditing={handleSearch}
                placeholder="City, state, or remote"
                placeholderTextColor={colors.textTertiary}
                style={[styles.input, ds.input]}
                returnKeyType="search"
              />
            </View>

            <GlassButton
              onPress={handleSearch}
              disabled={loading}
              variant="primary"
              style={styles.searchButton}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#FFF" size="small" />
                  <Text style={styles.searchButtonText}>Searching...</Text>
                </View>
              ) : (
                <Text style={styles.searchButtonText}>Search Jobs</Text>
              )}
            </GlassButton>
          </View>

          {/* Filters Toggle */}
          <View style={[styles.filtersToggleRow, ds.filterDivider]}>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              style={styles.filtersToggle}
            >
              <Filter size={16} color={colors.textSecondary} />
              <Text style={[styles.filtersToggleText, { color: colors.textSecondary }]}>
                Advanced Filters
              </Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearFilters}>
                <X size={16} color={colors.textSecondary} />
                <Text style={[styles.clearFiltersText, { color: colors.textSecondary }]}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Advanced Filters */}
          {showFilters && (
            <View style={[styles.advancedFilters, ds.filterDivider]}>
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
                  Work Location
                </Text>
                <View style={styles.filterButtons}>
                  {(['Any', 'Remote', 'On-site'] as const).map((label, i) => {
                    const value = i === 0 ? undefined : i === 1 ? true : false;
                    const isActive = remote === value;
                    return (
                      <TouchableOpacity
                        key={label}
                        onPress={() => setRemote(value)}
                        style={[
                          styles.filterButton,
                          ds.filterButton,
                          isActive && styles.filterButtonActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.filterButtonText,
                            { color: colors.textSecondary },
                            isActive && styles.filterButtonTextActive,
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}
        </GlassCard>

        {/* Recent Searches */}
        {!jobs.length && recentSearches.length > 0 && (
          <View style={styles.recentSearches}>
            <Text style={[styles.recentSearchesTitle, { color: colors.textSecondary }]}>
              Recent Searches
            </Text>
            <View style={styles.recentSearchesContainer}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleRecentSearch(search)}
                  style={[styles.recentSearchChip, ds.recentChip]}
                >
                  <Clock size={14} color={colors.textSecondary} />
                  <Text style={[styles.recentSearchText, { color: colors.text }]}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results */}
        {jobs.length > 0 && (
          <View style={styles.results}>
            <Text style={[styles.resultsCount, { color: colors.text }]}>
              {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
            </Text>

            {jobs.map((job) => (
              <GlassCard key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={[styles.companyLogo, ds.companyLogo]}>
                    <Building2 size={24} color={colors.textSecondary} />
                  </View>
                  <View style={styles.jobTitleContainer}>
                    <Text style={[styles.jobTitle, { color: colors.text }]}>{job.title}</Text>
                    <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>
                      {job.company}
                    </Text>
                  </View>
                </View>

                <View style={styles.jobMeta}>
                  <View style={styles.jobMetaItem}>
                    <MapPin size={14} color={colors.textSecondary} />
                    <Text style={[styles.jobMetaText, { color: colors.textSecondary }]}>
                      {job.remote ? 'Remote' : job.location}
                      {job.hybrid && ' (Hybrid)'}
                    </Text>
                  </View>
                  {job.salary && (
                    <View style={styles.jobMetaItem}>
                      <DollarSign size={14} color={colors.textSecondary} />
                      <Text style={[styles.jobMetaText, { color: colors.textSecondary }]}>
                        {job.salary}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[styles.jobDescription, { color: colors.textSecondary }]}
                  numberOfLines={3}
                >
                  {job.description}
                </Text>

                <View style={styles.jobActions}>
                  <GlassButton
                    onPress={() => handleTailorResume(job)}
                    variant="primary"
                    style={styles.tailorButton}
                  >
                    <Target size={16} color="#FFF" />
                    <Text style={styles.tailorButtonText}>Tailor Resume</Text>
                  </GlassButton>

                  <TouchableOpacity
                    onPress={() => handleViewJob(job)}
                    style={styles.viewJobButton}
                  >
                    <Text style={[styles.viewJobText, { color: colors.accent }]}>View Job</Text>
                    <ExternalLink size={16} color={colors.accent} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && keywords && (
          <GlassCard style={styles.emptyState}>
            <Briefcase size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No jobs found</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Try adjusting your search filters or keywords
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  title: {
    fontSize: 34,
    fontFamily: FONTS.semibold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 320,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  searchCard: {
    padding: 16,
    marginBottom: 16,
  },
  searchInputs: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  searchButton: {
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  filtersToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  filtersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filtersToggleText: {
    fontSize: 14,
  },
  filterBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  filterBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontFamily: FONTS.semibold,
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearFiltersText: {
    fontSize: 14,
  },
  advancedFilters: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.semibold,
  },
  recentSearches: {
    marginBottom: 24,
  },
  recentSearchesTitle: {
    fontSize: 12,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  recentSearchesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  recentSearchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  recentSearchText: {
    fontSize: 14,
  },
  results: {
    gap: 16,
  },
  resultsCount: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginBottom: 8,
  },
  jobCard: {
    padding: 16,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  jobTitleContainer: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  jobMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  jobMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
  },
  jobDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  jobActions: {
    flexDirection: 'row',
    gap: 12,
  },
  tailorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tailorButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  viewJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  viewJobText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
