/**
 * Job Search Screen
 * Search for jobs and tailor resume with one click
 */

import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);

  // Search filters
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [remote, setRemote] = useState<boolean | undefined>(undefined);
  const [salaryMin, setSalaryMin] = useState<string>('');

  useEffect(() => {
    // Load recent searches from storage
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    // TODO: Load from AsyncStorage
    setRecentSearches([]);
  };

  const handleSearch = async () => {
    if (!keywords.trim()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual job search API
      // For now, show empty results
      setJobs([]);

      // Save to recent searches
      if (keywords.trim() && !recentSearches.includes(keywords.trim())) {
        const updated = [keywords.trim(), ...recentSearches.slice(0, 4)];
        setRecentSearches(updated);
        // TODO: Save to AsyncStorage
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Find Your Next Role</Text>
          <Text style={styles.subtitle}>
            Search thousands of jobs and tailor your resume with one click
          </Text>
        </View>

        {/* Search Bar */}
        <GlassCard style={styles.searchCard}>
          <View style={styles.searchInputs}>
            {/* Keywords Input */}
            <View style={styles.inputContainer}>
              <Search size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                value={keywords}
                onChangeText={setKeywords}
                onSubmitEditing={handleSearch}
                placeholder="Job title, keywords, or company"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                returnKeyType="search"
              />
            </View>

            {/* Location Input */}
            <View style={styles.inputContainer}>
              <MapPin size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                value={location}
                onChangeText={setLocation}
                onSubmitEditing={handleSearch}
                placeholder="City, state, or remote"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                returnKeyType="search"
              />
            </View>

            {/* Search Button */}
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
          <View style={styles.filtersToggleRow}>
            <TouchableOpacity
              onPress={() => setShowFilters(!showFilters)}
              style={styles.filtersToggle}
            >
              <Filter size={16} color="#9CA3AF" />
              <Text style={styles.filtersToggleText}>Advanced Filters</Text>
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {activeFilterCount > 0 && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearFilters}>
                <X size={16} color="#9CA3AF" />
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Advanced Filters */}
          {showFilters && (
            <View style={styles.advancedFilters}>
              {/* Remote Toggle */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Work Location</Text>
                <View style={styles.filterButtons}>
                  <TouchableOpacity
                    onPress={() => setRemote(undefined)}
                    style={[
                      styles.filterButton,
                      remote === undefined && styles.filterButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        remote === undefined && styles.filterButtonTextActive,
                      ]}
                    >
                      Any
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRemote(true)}
                    style={[
                      styles.filterButton,
                      remote === true && styles.filterButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        remote === true && styles.filterButtonTextActive,
                      ]}
                    >
                      Remote
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRemote(false)}
                    style={[
                      styles.filterButton,
                      remote === false && styles.filterButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        remote === false && styles.filterButtonTextActive,
                      ]}
                    >
                      On-site
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </GlassCard>

        {/* Recent Searches */}
        {!jobs.length && recentSearches.length > 0 && (
          <View style={styles.recentSearches}>
            <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
            <View style={styles.recentSearchesContainer}>
              {recentSearches.map((search, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleRecentSearch(search)}
                  style={styles.recentSearchChip}
                >
                  <Clock size={14} color="#9CA3AF" />
                  <Text style={styles.recentSearchText}>{search}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Search Results */}
        {jobs.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsCount}>
              {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Found
            </Text>

            {jobs.map((job) => (
              <GlassCard key={job.id} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <View style={styles.companyLogo}>
                    <Building2 size={24} color="#9CA3AF" />
                  </View>
                  <View style={styles.jobTitleContainer}>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.jobCompany}>{job.company}</Text>
                  </View>
                </View>

                <View style={styles.jobMeta}>
                  <View style={styles.jobMetaItem}>
                    <MapPin size={14} color="#9CA3AF" />
                    <Text style={styles.jobMetaText}>
                      {job.remote ? 'Remote' : job.location}
                      {job.hybrid && ' (Hybrid)'}
                    </Text>
                  </View>
                  {job.salary && (
                    <View style={styles.jobMetaItem}>
                      <DollarSign size={14} color="#9CA3AF" />
                      <Text style={styles.jobMetaText}>{job.salary}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.jobDescription} numberOfLines={3}>
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
                    <Text style={styles.viewJobText}>View Job</Text>
                    <ExternalLink size={16} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!loading && jobs.length === 0 && keywords && (
          <GlassCard style={styles.emptyState}>
            <Briefcase size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptyText}>
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
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    maxWidth: 320,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    color: '#FFF',
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
    fontWeight: '600',
  },
  filtersToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  filtersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filtersToggleText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  filterBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  filterBadgeText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  clearFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearFiltersText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  advancedFilters: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  recentSearches: {
    marginBottom: 24,
  },
  recentSearchesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  recentSearchText: {
    color: '#FFF',
    fontSize: 14,
  },
  results: {
    gap: 16,
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
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
    color: '#9CA3AF',
  },
  jobDescription: {
    fontSize: 14,
    color: '#9CA3AF',
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
    fontWeight: '600',
  },
  viewJobButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  viewJobText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
    marginTop: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
