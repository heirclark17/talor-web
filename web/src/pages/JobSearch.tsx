/**
 * Job Search Page
 *
 * Search for jobs across multiple job boards with advanced filters
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  ExternalLink,
  Target,
  Bookmark,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  Building2,
} from 'lucide-react'
import {
  searchJobs,
  getRecentSearches,
  saveRecentSearch,
  formatRelativeTime,
  type JobPosting,
  type JobSearchFilters,
  type JobSearchResult,
} from '../lib/jobSearch'
import { formatCurrency } from '../lib/salaryData'
import { showSuccess } from '../utils/toast'
import { usePostHog } from '../contexts/PostHogContext'

export default function JobSearch() {
  const navigate = useNavigate()
  const { capture } = usePostHog()

  const [searchResults, setSearchResults] = useState<JobSearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Search filters
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')
  const [remote, setRemote] = useState<boolean | undefined>(undefined)
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined)
  const [datePosted, setDatePosted] = useState<'day' | 'week' | 'month' | 'any'>('any')

  useEffect(() => {
    // Load recent searches
    setRecentSearches(getRecentSearches())

    // Track page view
    capture('page_viewed', {
      page_name: 'Job Search',
      page_type: 'job_discovery',
    })

    // Perform initial search with default filters
    handleSearch()
  }, [])

  const handleSearch = async () => {
    setLoading(true)

    const filters: JobSearchFilters = {
      keywords: keywords.trim() || undefined,
      location: location.trim() || undefined,
      remote,
      salaryMin,
      datePosted,
    }

    try {
      const results = await searchJobs(filters, 1, 20)
      setSearchResults(results)

      // Save to recent searches
      if (keywords.trim()) {
        saveRecentSearch(keywords.trim())
        setRecentSearches(getRecentSearches())
      }

      // Track search
      capture('job_search_performed', {
        keywords,
        location,
        remote,
        salaryMin,
        datePosted,
        resultCount: results.totalCount,
      })
    } catch (error) {
      console.error('Job search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTailorResume = (job: JobPosting) => {
    capture('job_tailor_clicked', {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
    })
    navigate(`/tailor?jobUrl=${encodeURIComponent(job.url)}&company=${encodeURIComponent(job.company)}&title=${encodeURIComponent(job.title)}`)
  }

  const handleViewJob = (job: JobPosting) => {
    capture('job_external_link_clicked', {
      jobId: job.id,
      jobTitle: job.title,
      company: job.company,
      source: job.source,
    })
    window.open(job.url, '_blank')
  }

  const handleRecentSearch = (search: string) => {
    setKeywords(search)
    setTimeout(() => handleSearch(), 100)
  }

  const clearFilters = () => {
    setKeywords('')
    setLocation('')
    setRemote(undefined)
    setSalaryMin(undefined)
    setDatePosted('any')
  }

  const activeFilterCount = [
    keywords,
    location,
    remote !== undefined,
    salaryMin,
    datePosted !== 'any',
  ].filter(Boolean).length

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-theme mb-4">Find Your Next Role</h1>
          <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
            Search thousands of jobs and tailor your resume with one click
          </p>
        </div>

        {/* Search Bar */}
        <div className="glass rounded-2xl border border-theme-subtle p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Keywords Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Job title, keywords, or company"
                className="w-full pl-12 pr-4 py-3 bg-theme-glass-5 border border-theme-subtle rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all text-theme placeholder-theme-tertiary"
              />
            </div>

            {/* Location Input */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="City, state, or remote"
                className="w-full pl-12 pr-4 py-3 bg-theme-glass-5 border border-theme-subtle rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all text-theme placeholder-theme-tertiary"
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-primary px-8 py-3 whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </span>
              ) : (
                'Search Jobs'
              )}
            </button>
          </div>

          {/* Filters Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm text-theme-secondary hover:text-theme transition-colors"
            >
              <Filter className="w-4 h-4" />
              Advanced Filters
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold">
                  {activeFilterCount}
                </span>
              )}
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-theme-tertiary hover:text-theme transition-colors"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-theme-subtle grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Remote Toggle */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Work Location
                </label>
                <select
                  value={remote === undefined ? 'any' : remote ? 'remote' : 'onsite'}
                  onChange={(e) =>
                    setRemote(e.target.value === 'any' ? undefined : e.target.value === 'remote')
                  }
                  className="w-full px-4 py-2 bg-theme-glass-5 border border-theme-subtle rounded-lg text-theme"
                >
                  <option value="any">Any</option>
                  <option value="remote">Remote Only</option>
                  <option value="onsite">On-site/Hybrid</option>
                </select>
              </div>

              {/* Minimum Salary */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Minimum Salary
                </label>
                <select
                  value={salaryMin || ''}
                  onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-4 py-2 bg-theme-glass-5 border border-theme-subtle rounded-lg text-theme"
                >
                  <option value="">Any</option>
                  <option value="50000">$50,000+</option>
                  <option value="75000">$75,000+</option>
                  <option value="100000">$100,000+</option>
                  <option value="125000">$125,000+</option>
                  <option value="150000">$150,000+</option>
                  <option value="200000">$200,000+</option>
                </select>
              </div>

              {/* Date Posted */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Date Posted
                </label>
                <select
                  value={datePosted}
                  onChange={(e) => setDatePosted(e.target.value as any)}
                  className="w-full px-4 py-2 bg-theme-glass-5 border border-theme-subtle rounded-lg text-theme"
                >
                  <option value="any">Any Time</option>
                  <option value="day">Past 24 Hours</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Recent Searches */}
        {!searchResults && recentSearches.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-theme-secondary uppercase tracking-wide mb-3">
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(search)}
                  className="px-4 py-2 bg-theme-glass-5 hover:bg-theme-glass-10 border border-theme-subtle rounded-lg text-sm text-theme transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-theme">
                {searchResults.totalCount} {searchResults.totalCount === 1 ? 'Job' : 'Jobs'} Found
              </h2>
            </div>

            {/* Job Cards */}
            <div className="space-y-4">
              {searchResults.jobs.map((job) => (
                <div
                  key={job.id}
                  className="glass rounded-xl border border-theme-subtle p-6 hover:border-accent transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        {/* Company Logo */}
                        <div className="w-12 h-12 bg-theme-glass-10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          {job.companyLogo || <Building2 className="w-6 h-6 text-theme-tertiary" />}
                        </div>

                        {/* Title and Company */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-theme mb-1">{job.title}</h3>
                          <p className="text-theme-secondary font-medium mb-2">{job.company}</p>

                          <div className="flex flex-wrap gap-3 text-sm text-theme-tertiary">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.remote ? 'Remote' : job.location}
                              {job.hybrid && ' (Hybrid)'}
                            </span>
                            {job.salary && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {formatCurrency(job.salary.min || 0)} - {formatCurrency(job.salary.max || 0)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatRelativeTime(job.postedDate)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-theme-secondary text-sm mb-4 line-clamp-2">
                        {job.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleTailorResume(job)}
                        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap"
                      >
                        <Target className="w-4 h-4" />
                        Tailor Resume
                      </button>
                      <button
                        onClick={() => handleViewJob(job)}
                        className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Job
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {searchResults.totalCount === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-theme-glass-10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-theme-tertiary" />
                </div>
                <h3 className="text-xl font-semibold text-theme mb-2">No jobs found</h3>
                <p className="text-theme-secondary mb-6">
                  Try adjusting your search criteria or clearing some filters
                </p>
                <button onClick={clearFilters} className="btn-secondary">
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!searchResults && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-theme mb-2">Smart Search</h3>
              <p className="text-sm text-theme-secondary">
                Find relevant jobs with advanced filtering by location, salary, and date posted
              </p>
            </div>

            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="font-semibold text-theme mb-2">One-Click Tailoring</h3>
              <p className="text-sm text-theme-secondary">
                Tailor your resume for any job with a single click directly from search results
              </p>
            </div>

            <div className="glass rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-theme mb-2">Track Applications</h3>
              <p className="text-sm text-theme-secondary">
                Seamlessly add jobs to your application tracker for organized job hunting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
