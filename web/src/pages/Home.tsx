import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  Upload,
  Trash2,
  Target,
  FileSearch,
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  RefreshCw,
  Loader2,
  BookOpen,
  Briefcase,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { api, getApiHeaders } from '../api/client'
import { showError } from '../utils/toast'
import SearchFilter from '../components/SearchFilter'
import { SkeletonCard } from '../components/SkeletonLoader'
import { useResumeStore } from '../stores/resumeStore'
import { useOnboardingStore } from '../stores/onboardingStore'
import ActivationChecklist from '../components/guidance/ActivationChecklist'
import EmptyState from '../components/guidance/EmptyState'

interface Resume {
  id: number
  filename: string
  name?: string
  email?: string
  skills_count: number
  uploaded_at: string
}

interface TailoredResume {
  id: number
  base_resume_id: number
  job_id?: number
  job_title?: string
  company_name?: string
  // Some API responses use these field names
  company?: string
  title?: string
  quality_score?: number
  created_at: string
}

// Unified list item discriminated union
type UnifiedResumeItem =
  | { type: 'base'; data: Resume }
  | { type: 'tailored'; data: TailoredResume }

interface ResumeAnalysis {
  overall_score: number
  strengths: string[]
  weaknesses: string[]
  keyword_optimization: {
    score: number
    suggestions: string
    missing_keywords: string[]
  }
  ats_compatibility: {
    score: number
    recommendations: string
    issues: string[]
  }
  improvement_recommendations: {
    category: string
    priority: 'high' | 'medium' | 'low'
    recommendation: string
    example: string
  }[]
}

// Helper to extract a display title for a tailored resume
function getTailoredTitle(tr: TailoredResume): string {
  return tr.job_title || tr.title || 'Untitled Position'
}

// Helper to extract a display company name for a tailored resume
function getTailoredCompany(tr: TailoredResume): string | null {
  return tr.company_name || tr.company || null
}

export default function Home() {
  const navigate = useNavigate()

  // Base resume state from Zustand store
  const {
    resumes,
    loading,
    deletingId,
    analyzingId,
    currentAnalysis,
    fetchResumes,
    deleteResume,
    analyzeResume,
    clearAnalysis,
  } = useResumeStore()

  // Tailored resume state
  const [tailoredResumes, setTailoredResumes] = useState<TailoredResume[]>([])
  const [tailoredLoading, setTailoredLoading] = useState(false)
  const [deletingTailoredId, setDeletingTailoredId] = useState<number | null>(null)

  // Onboarding state
  const { markStepComplete, activationSteps, isEventCelebrated } = useOnboardingStore()

  const [error, setError] = useState<string | null>(null)
  const [analysisModal, setAnalysisModal] = useState(false)
  const [currentFilename, setCurrentFilename] = useState<string>('')

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
  const [selectedSort, setSelectedSort] = useState('')

  // Confirm delete state — track which type is being deleted
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<
    { type: 'base'; id: number } | { type: 'tailored'; id: number } | null
  >(null)

  // -------------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------------

  const fetchTailoredResumes = useCallback(async () => {
    setTailoredLoading(true)
    try {
      const result = await api.listTailoredResumes()
      if (result.success && result.data?.tailored_resumes) {
        setTailoredResumes(result.data.tailored_resumes)
      } else {
        setTailoredResumes([])
      }
    } catch (err) {
      console.error('[Home] Failed to fetch tailored resumes:', err)
      setTailoredResumes([])
    } finally {
      setTailoredLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResumes()
    fetchTailoredResumes()
  }, [fetchResumes, fetchTailoredResumes])

  // -------------------------------------------------------------------------
  // Build unified list
  // -------------------------------------------------------------------------

  const unifiedList = useMemo<UnifiedResumeItem[]>(() => {
    const baseItems: UnifiedResumeItem[] = resumes.map((r) => ({ type: 'base', data: r }))
    const tailoredItems: UnifiedResumeItem[] = tailoredResumes.map((tr) => ({
      type: 'tailored',
      data: tr,
    }))
    return [...baseItems, ...tailoredItems]
  }, [resumes, tailoredResumes])

  // -------------------------------------------------------------------------
  // Search, filter and sort the unified list
  // -------------------------------------------------------------------------

  const filteredItems = useMemo<UnifiedResumeItem[]>(() => {
    let result = [...unifiedList]

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((item) => {
        if (item.type === 'base') {
          return (
            item.data.filename.toLowerCase().includes(query) ||
            (item.data.name && item.data.name.toLowerCase().includes(query))
          )
        } else {
          const jobTitle = getTailoredTitle(item.data).toLowerCase()
          const company = (getTailoredCompany(item.data) || '').toLowerCase()
          return jobTitle.includes(query) || company.includes(query)
        }
      })
    }

    // Apply sort
    if (selectedSort === 'newest') {
      result.sort((a, b) => {
        const aDate = a.type === 'base' ? a.data.uploaded_at : a.data.created_at
        const bDate = b.type === 'base' ? b.data.uploaded_at : b.data.created_at
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      })
    } else if (selectedSort === 'oldest') {
      result.sort((a, b) => {
        const aDate = a.type === 'base' ? a.data.uploaded_at : a.data.created_at
        const bDate = b.type === 'base' ? b.data.uploaded_at : b.data.created_at
        return new Date(aDate).getTime() - new Date(bDate).getTime()
      })
    } else if (selectedSort === 'name') {
      result.sort((a, b) => {
        const aName =
          a.type === 'base' ? a.data.filename : getTailoredTitle(a.data)
        const bName =
          b.type === 'base' ? b.data.filename : getTailoredTitle(b.data)
        return aName.localeCompare(bName)
      })
    } else if (selectedSort === 'skills') {
      // Base resumes sort by skill count; tailored resumes sort by quality_score.
      // Items without a numeric score sort to the end.
      result.sort((a, b) => {
        const aScore =
          a.type === 'base' ? a.data.skills_count : (a.data.quality_score ?? -1)
        const bScore =
          b.type === 'base' ? b.data.skills_count : (b.data.quality_score ?? -1)
        return bScore - aScore
      })
    } else if (selectedSort === 'type') {
      // Group base resumes first, then tailored
      result.sort((a, b) => {
        if (a.type === b.type) return 0
        return a.type === 'base' ? -1 : 1
      })
    }

    return result
  }, [unifiedList, searchQuery, selectedSort])

  // -------------------------------------------------------------------------
  // Action handlers
  // -------------------------------------------------------------------------

  // Mark upload step as complete when resumes exist
  useEffect(() => {
    if (resumes.length > 0 && !activationSteps.upload_resume) {
      markStepComplete('upload_resume')
    }
  }, [resumes, activationSteps.upload_resume, markStepComplete])

  const handleDeleteBase = (resumeId: number) => {
    setConfirmDeleteItem({ type: 'base', id: resumeId })
  }

  const handleDeleteTailored = (tailoredId: number) => {
    setConfirmDeleteItem({ type: 'tailored', id: tailoredId })
  }

  const confirmDelete = async () => {
    if (confirmDeleteItem === null) return

    if (confirmDeleteItem.type === 'base') {
      const success = await deleteResume(confirmDeleteItem.id)
      if (!success) {
        showError('Failed to delete resume')
      }
    } else {
      setDeletingTailoredId(confirmDeleteItem.id)
      try {
        // The backend exposes DELETE /api/tailor/tailored/:id
        const response = await fetch(`/api/tailor/tailored/${confirmDeleteItem.id}`, {
          method: 'DELETE',
          headers: getApiHeaders(),
        })
        if (response.ok) {
          setTailoredResumes((prev) => prev.filter((tr) => tr.id !== confirmDeleteItem.id))
        } else {
          showError('Failed to delete tailored resume')
        }
      } catch (err) {
        showError('Failed to delete tailored resume')
      } finally {
        setDeletingTailoredId(null)
      }
    }

    setConfirmDeleteItem(null)
  }

  const handleTailor = (resumeId: number) => {
    navigate(`/tailor?resumeId=${resumeId}`)
  }

  const handleViewTailored = (tailoredId: number) => {
    navigate(`/tailor?tailoredId=${tailoredId}`)
  }

  const handleAnalyze = async (resumeId: number, filename: string) => {
    const analysis = await analyzeResume(resumeId)
    if (analysis) {
      setCurrentFilename(filename)
      setAnalysisModal(true)
    } else {
      showError('Failed to analyze resume')
    }
  }

  const closeAnalysisModal = () => {
    setAnalysisModal(false)
    clearAnalysis()
    setCurrentFilename('')
  }

  // -------------------------------------------------------------------------
  // Formatting helpers
  // -------------------------------------------------------------------------

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' }
    if (score >= 60) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' }
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' }
      case 'medium':
        return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' }
      default:
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' }
    }
  }

  // -------------------------------------------------------------------------
  // Loading state — wait for both fetches
  // -------------------------------------------------------------------------

  const isLoading = loading || tailoredLoading

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-theme">My Resumes</h1>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Error state (only when there are no resumes at all to show)
  // -------------------------------------------------------------------------

  if (error && resumes.length === 0 && tailoredResumes.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-theme">My Resumes</h1>
          </div>
          <div className="glass rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
            <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-theme mb-2">Failed to Load Resumes</h2>
            <p className="text-theme-secondary text-sm sm:text-base mb-4 sm:mb-6 px-4">{error}</p>
            <button
              onClick={() => { fetchResumes(); fetchTailoredResumes() }}
              className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors min-h-[44px] w-full sm:w-auto"
            >
              <RefreshCw className="w-5 h-5 flex-shrink-0" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Empty state (no resumes of either type)
  // -------------------------------------------------------------------------

  if (resumes.length === 0 && tailoredResumes.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-theme">Dashboard</h1>
          </div>
          <EmptyState
            icon={FileText}
            headline="Ready to land your dream job?"
            description="Upload your resume and we'll help you tailor it for every application"
            primaryAction={{
              label: 'Upload Resume',
              href: '/upload',
            }}
            secondaryAction={{
              label: 'See how it works',
              href: '/templates',
            }}
            metric="Join thousands of users who've landed interviews using TailorMe"
          />
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Summary counts for the header
  // -------------------------------------------------------------------------

  const baseCount = resumes.length
  const tailoredCount = tailoredResumes.length

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-theme">My Resumes</h1>
            <p className="text-theme-secondary text-sm mt-1">
              {baseCount} base {baseCount === 1 ? 'resume' : 'resumes'}
              {tailoredCount > 0 && (
                <> &bull; {tailoredCount} tailored {tailoredCount === 1 ? 'resume' : 'resumes'}</>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate('/upload')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme font-medium rounded-xl transition-colors min-h-[44px]"
          >
            <Upload className="w-5 h-5 flex-shrink-0" />
            <span>Upload Resume</span>
          </button>
        </div>

        {/* Activation Checklist */}
        <div className="mb-6">
          <ActivationChecklist />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigate('/cover-letters')}
            className="flex items-center gap-3 p-4 bg-theme-glass-5 hover:bg-theme-glass-10 rounded-xl transition-colors"
          >
            <BookOpen className="w-6 h-6 text-blue-400" />
            <span className="text-theme font-medium">Cover Letters</span>
          </button>
          <button
            onClick={() => navigate('/applications')}
            className="flex items-center gap-3 p-4 bg-theme-glass-5 hover:bg-theme-glass-10 rounded-xl transition-colors"
          >
            <Briefcase className="w-6 h-6 text-blue-400" />
            <span className="text-theme font-medium">Track Applications</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <SearchFilter
            placeholder="Search resumes..."
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFilters={selectedFilters}
            onFilterChange={setSelectedFilters}
            sortOptions={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'name', label: 'Name (A-Z)' },
              { value: 'skills', label: 'Most Skills / Score' },
              { value: 'type', label: 'Base First' },
            ]}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
          />
        </div>

        {/* Resume List */}
        <div className="space-y-3 sm:space-y-4">
          {filteredItems.map((item) =>
            item.type === 'base' ? (
              /* -------- Base Resume Card -------- */
              <div
                key={`base-${item.data.id}`}
                className="glass rounded-xl p-6 border border-theme-subtle hover:border-theme-muted transition-colors overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {/* Icon and Info */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 overflow-hidden">
                    <div className="w-12 h-12 bg-theme-glass-5 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-theme flex-shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5 sm:mb-1">
                        <h3 className="text-base font-semibold text-theme truncate">
                          {item.data.filename}
                        </h3>
                        {/* Base Resume badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-theme-glass-10 text-theme-secondary border border-theme-subtle flex-shrink-0">
                          <FileText className="w-3 h-3" />
                          Base
                        </span>
                      </div>
                      {item.data.name && (
                        <p className="text-theme-secondary text-xs sm:text-sm truncate mb-1">
                          {item.data.name}
                        </p>
                      )}
                      <p className="text-theme-tertiary text-xs sm:text-sm truncate">
                        <span className="whitespace-nowrap">{item.data.skills_count} skills</span>{' '}
                        <span className="hidden sm:inline">&bull;</span>{' '}
                        <span className="whitespace-nowrap sm:inline block mt-0.5 sm:mt-0">
                          {formatDate(item.data.uploaded_at)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                    <button
                      onClick={() => handleAnalyze(item.data.id, item.data.filename)}
                      disabled={analyzingId === item.data.id}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 bg-theme-glass-5 hover:bg-theme-glass-10 text-theme-secondary hover:text-theme rounded-lg transition-colors min-h-[40px] min-w-[80px] sm:min-w-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Analyze resume"
                    >
                      {analyzingId === item.data.id ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      ) : (
                        <FileSearch className="w-5 h-5 flex-shrink-0" />
                      )}
                      <span className="text-xs sm:text-sm whitespace-nowrap">Analyze</span>
                    </button>
                    <button
                      onClick={() => handleTailor(item.data.id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg transition-colors min-h-[40px] min-w-[80px] sm:min-w-0"
                      aria-label="Tailor resume"
                    >
                      <Target className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm whitespace-nowrap">Tailor</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBase(item.data.id)}
                      disabled={deletingId === item.data.id}
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors min-h-[40px] min-w-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      aria-label="Delete resume"
                    >
                      {deletingId === item.data.id ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      ) : (
                        <Trash2 className="w-5 h-5 flex-shrink-0" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* -------- Tailored Resume Card -------- */
              <div
                key={`tailored-${item.data.id}`}
                className="glass rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-colors overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                  {/* Icon and Info */}
                  <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 overflow-hidden">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5 sm:mb-1">
                        <h3 className="text-base font-semibold text-theme truncate">
                          {getTailoredTitle(item.data)}
                        </h3>
                        {/* Tailored Resume badge */}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/15 text-purple-400 border border-purple-500/25 flex-shrink-0">
                          <Sparkles className="w-3 h-3" />
                          Tailored
                        </span>
                      </div>
                      {getTailoredCompany(item.data) && (
                        <p className="text-theme-secondary text-xs sm:text-sm truncate mb-1">
                          {getTailoredCompany(item.data)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-theme-tertiary text-xs sm:text-sm whitespace-nowrap">
                          {formatDate(item.data.created_at)}
                        </p>
                        {item.data.quality_score !== undefined && item.data.quality_score !== null && (
                          <>
                            <span className="text-theme-tertiary hidden sm:inline">&bull;</span>
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                getScoreColor(item.data.quality_score).bg
                              } ${getScoreColor(item.data.quality_score).text}`}
                            >
                              Score: {item.data.quality_score}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                    <button
                      onClick={() => handleViewTailored(item.data.id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 rounded-lg transition-colors min-h-[40px] min-w-[80px] sm:min-w-0"
                      aria-label="View tailored resume"
                    >
                      <ExternalLink className="w-5 h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm whitespace-nowrap">View</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTailored(item.data.id)}
                      disabled={deletingTailoredId === item.data.id}
                      className="inline-flex items-center justify-center px-3 sm:px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors min-h-[40px] min-w-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      aria-label="Delete tailored resume"
                    >
                      {deletingTailoredId === item.data.id ? (
                        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                      ) : (
                        <Trash2 className="w-5 h-5 flex-shrink-0" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* No results after filtering */}
        {filteredItems.length === 0 && unifiedList.length > 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-theme-secondary">No resumes match your search.</p>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Delete Confirmation Modal                                           */}
      {/* ------------------------------------------------------------------ */}
      {confirmDeleteItem !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
        >
          <div
            className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm"
            onClick={() => setConfirmDeleteItem(null)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-theme-subtle bg-theme p-6 text-center">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-theme mb-2">
              Delete {confirmDeleteItem.type === 'tailored' ? 'Tailored Resume' : 'Resume'}?
            </h3>
            <p className="text-theme-secondary text-sm mb-6">
              {confirmDeleteItem.type === 'tailored'
                ? 'This will permanently remove the tailored resume. The original base resume will not be affected.'
                : 'This action cannot be undone. The resume and all associated data will be permanently removed.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteItem(null)}
                className="flex-1 px-4 py-2.5 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={
                  deletingId !== null ||
                  deletingTailoredId !== null
                }
                className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium disabled:opacity-50"
              >
                {deletingId !== null || deletingTailoredId !== null ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Analysis Modal                                                      */}
      {/* ------------------------------------------------------------------ */}
      {analysisModal && currentAnalysis && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Resume Analysis"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm"
            onClick={closeAnalysisModal}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-theme-subtle bg-theme">
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between bg-theme">
              <div className="flex items-center gap-3">
                <FileSearch className="w-6 h-6 text-theme" />
                <div>
                  <h2 className="text-lg font-semibold text-theme">Resume Analysis</h2>
                  <p className="text-sm text-theme-secondary truncate max-w-xs">{currentFilename}</p>
                </div>
              </div>
              <button
                onClick={closeAnalysisModal}
                className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-theme-secondary" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Overall Score */}
              <div className="glass rounded-xl p-5 border border-theme-subtle">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-theme-secondary">Overall Score</span>
                  <div
                    className={`px-4 py-1.5 rounded-lg ${getScoreColor(currentAnalysis.overall_score).bg}`}
                  >
                    <span
                      className={`text-2xl font-bold ${getScoreColor(currentAnalysis.overall_score).text}`}
                    >
                      {currentAnalysis.overall_score}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-theme-glass-10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      currentAnalysis.overall_score >= 80
                        ? 'bg-green-500'
                        : currentAnalysis.overall_score >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${currentAnalysis.overall_score}%` }}
                  />
                </div>
              </div>

              {/* Strengths */}
              <div className="glass rounded-xl p-5 border border-theme-subtle">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-theme">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {currentAnalysis.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                      <span className="text-theme-secondary">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="glass rounded-xl p-5 border border-theme-subtle">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="font-semibold text-theme">Areas for Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {currentAnalysis.weaknesses.map((weakness: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                      <span className="text-theme-secondary">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keyword Optimization */}
              <div className="glass rounded-xl p-5 border border-theme-subtle">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-theme">Keyword Optimization</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${getScoreColor(currentAnalysis.keyword_optimization.score).bg}`}>
                    <span className={`text-sm font-bold ${getScoreColor(currentAnalysis.keyword_optimization.score).text}`}>
                      {currentAnalysis.keyword_optimization.score}
                    </span>
                  </div>
                </div>
                <p className="text-theme-secondary mb-4">{currentAnalysis.keyword_optimization.suggestions}</p>
                {currentAnalysis.keyword_optimization.missing_keywords.length > 0 && (
                  <>
                    <p className="text-xs text-theme-tertiary uppercase tracking-wide mb-2">Missing Keywords:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.keyword_optimization.missing_keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm border border-blue-500/30"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* ATS Compatibility */}
              <div className="glass rounded-xl p-5 border border-theme-subtle">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-theme">ATS Compatibility</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${getScoreColor(currentAnalysis.ats_compatibility.score).bg}`}>
                    <span className={`text-sm font-bold ${getScoreColor(currentAnalysis.ats_compatibility.score).text}`}>
                      {currentAnalysis.ats_compatibility.score}
                    </span>
                  </div>
                </div>
                <p className="text-theme-secondary mb-4">{currentAnalysis.ats_compatibility.recommendations}</p>
                {currentAnalysis.ats_compatibility.issues.length > 0 && (
                  <>
                    <p className="text-xs text-theme-tertiary uppercase tracking-wide mb-2">Issues Found:</p>
                    <ul className="space-y-2">
                      {currentAnalysis.ats_compatibility.issues.map((issue: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                          <span className="text-theme-secondary">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Improvement Recommendations */}
              <div className="glass rounded-xl p-5 border border-theme-subtle">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-theme">Action Items</h3>
                </div>
                <div className="space-y-4">
                  {currentAnalysis.improvement_recommendations.map(
                    (rec: ResumeAnalysis['improvement_recommendations'][number], idx: number) => (
                      <div key={idx} className="bg-theme-glass-5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-theme">{rec.category}</span>
                          <span
                            className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${getPriorityColor(rec.priority).bg} ${getPriorityColor(rec.priority).text} border ${getPriorityColor(rec.priority).border}`}
                          >
                            {rec.priority}
                          </span>
                        </div>
                        <p className="text-theme-secondary text-sm mb-3">{rec.recommendation}</p>
                        <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                          <p className="text-xs text-green-400 font-semibold mb-1">Example:</p>
                          <p className="text-theme-secondary text-sm">{rec.example}</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
