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
} from 'lucide-react'
import { api } from '../api/client'
import { showError } from '../utils/toast'
import SearchFilter from '../components/SearchFilter'
import { SkeletonCard } from '../components/SkeletonLoader'
import { useResumeStore } from '../stores/resumeStore'

interface Resume {
  id: number
  filename: string
  name?: string
  email?: string
  skills_count: number
  uploaded_at: string
}

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

export default function Home() {
  const navigate = useNavigate()

  // Resume state from Zustand store
  const {
    resumes,
    loading,
    deletingId,
    analyzingId,
    currentAnalysis,
    fetchResumes,
    deleteResume,
    analyzeResume,
  } = useResumeStore()

  const [error, setError] = useState<string | null>(null)
  const [analysisModal, setAnalysisModal] = useState(false)
  const [currentFilename, setCurrentFilename] = useState<string>('')

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})
  const [selectedSort, setSelectedSort] = useState('')

  // Filter resumes based on search and sort
  const filteredResumes = useMemo(() => {
    let result = [...resumes]

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (resume) =>
          resume.filename.toLowerCase().includes(query) ||
          (resume.name && resume.name.toLowerCase().includes(query))
      )
    }

    // Apply sort
    if (selectedSort === 'newest') {
      result.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
    } else if (selectedSort === 'oldest') {
      result.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime())
    } else if (selectedSort === 'name') {
      result.sort((a, b) => a.filename.localeCompare(b.filename))
    } else if (selectedSort === 'skills') {
      result.sort((a, b) => b.skills_count - a.skills_count)
    }

    return result
  }, [resumes, searchQuery, selectedSort])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  const handleDelete = async (resumeId: number) => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return
    }

    const success = await deleteResume(resumeId)
    if (!success) {
      showError('Failed to delete resume')
    }
  }

  const handleTailor = (resumeId: number) => {
    navigate(`/tailor?resumeId=${resumeId}`)
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
    setCurrentAnalysis(null)
    setCurrentFilename('')
  }

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

  // Loading state
  if (loading) {
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

  // Error state
  if (error && resumes.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-theme">My Resumes</h1>
          </div>
          <div className="glass rounded-2xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-theme mb-2">Failed to Load Resumes</h2>
            <p className="text-theme-secondary mb-6">{error}</p>
            <button
              onClick={fetchResumes}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (resumes.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-theme">My Resumes</h1>
          </div>
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-theme-glass-5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-theme-secondary" />
            </div>
            <h2 className="text-2xl font-semibold text-theme mb-3">No Resumes Yet</h2>
            <p className="text-theme-secondary mb-8 max-w-md mx-auto">
              Upload your first resume to get started with tailoring for specific jobs.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
            >
              <Upload className="w-5 h-5" />
              Upload Resume
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-semibold text-theme">My Resumes</h1>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme font-medium rounded-xl transition-colors min-h-[44px]"
          >
            <Upload className="w-5 h-5" />
            Upload
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
              { value: 'skills', label: 'Most Skills' },
            ]}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
          />
        </div>

        {/* Resume List */}
        <div className="space-y-4">
          {filteredResumes.map((resume) => (
            <div
              key={resume.id}
              className="glass rounded-xl p-6 border border-theme-subtle hover:border-theme-muted transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Icon and Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-theme-glass-5 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-theme" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-theme truncate">{resume.filename}</h3>
                    {resume.name && (
                      <p className="text-theme-secondary text-sm truncate">{resume.name}</p>
                    )}
                    <p className="text-theme-tertiary text-sm mt-1">
                      {resume.skills_count} skills &bull; {formatDate(resume.uploaded_at)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                  <button
                    onClick={() => handleAnalyze(resume.id, resume.filename)}
                    disabled={analyzingId === resume.id}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-theme-glass-5 hover:bg-theme-glass-10 text-theme-secondary hover:text-theme rounded-lg transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Analyze resume"
                  >
                    {analyzingId === resume.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileSearch className="w-4 h-4" />
                    )}
                    <span className="text-sm">Analyze</span>
                  </button>
                  <button
                    onClick={() => handleTailor(resume.id)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg transition-colors min-h-[44px]"
                    aria-label="Tailor resume"
                  >
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Tailor</span>
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    disabled={deletingId === resume.id}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Delete resume"
                  >
                    {deletingId === resume.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No results */}
        {filteredResumes.length === 0 && resumes.length > 0 && (
          <div className="glass rounded-xl p-8 text-center">
            <p className="text-theme-secondary">No resumes match your search.</p>
          </div>
        )}
      </div>

      {/* Analysis Modal */}
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
                  {currentAnalysis.strengths.map((strength, idx) => (
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
                  {currentAnalysis.weaknesses.map((weakness, idx) => (
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
                      {currentAnalysis.keyword_optimization.missing_keywords.map((keyword, idx) => (
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
                      {currentAnalysis.ats_compatibility.issues.map((issue, idx) => (
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
                  {currentAnalysis.improvement_recommendations.map((rec, idx) => (
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
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
