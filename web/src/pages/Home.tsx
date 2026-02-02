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
import SearchFilter from '../components/SearchFilter'
import { SkeletonCard } from '../components/SkeletonLoader'

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
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [analyzingId, setAnalyzingId] = useState<number | null>(null)
  const [analysisModal, setAnalysisModal] = useState(false)
  const [currentAnalysis, setCurrentAnalysis] = useState<ResumeAnalysis | null>(null)
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

  const loadResumes = useCallback(async () => {
    try {
      setError(null)
      const result = await api.listResumes()
      if (result.success) {
        const resumeList = Array.isArray(result.data) ? result.data : []
        setResumes(resumeList)
      } else {
        console.error('Failed to load resumes:', result.error)
        setError(result.error || 'Failed to load resumes')
        setResumes([])
      }
    } catch (err) {
      console.error('Error loading resumes:', err)
      setError('Failed to load resumes')
      setResumes([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadResumes()
  }, [loadResumes])

  const handleDelete = async (resumeId: number) => {
    if (!window.confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return
    }

    setDeletingId(resumeId)
    try {
      const result = await api.deleteResume(resumeId)
      if (result.success) {
        setResumes((prev) => prev.filter((r) => r.id !== resumeId))
      } else {
        alert(result.error || 'Failed to delete resume')
      }
    } catch (err) {
      alert('Failed to delete resume')
    } finally {
      setDeletingId(null)
    }
  }

  const handleTailor = (resumeId: number) => {
    navigate(`/tailor?resumeId=${resumeId}`)
  }

  const handleAnalyze = async (resumeId: number, filename: string) => {
    setAnalyzingId(resumeId)
    try {
      const result = await api.analyzeResume(resumeId)
      if (result.success && result.data) {
        setCurrentAnalysis(result.data)
        setCurrentFilename(filename)
        setAnalysisModal(true)
      } else {
        alert(result.error || 'Failed to analyze resume')
      }
    } catch (err) {
      alert('Failed to analyze resume')
    } finally {
      setAnalyzingId(null)
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
            <h1 className="text-3xl font-semibold text-white">My Resumes</h1>
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
            <h1 className="text-3xl font-semibold text-white">My Resumes</h1>
          </div>
          <div className="glass rounded-2xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Resumes</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadResumes}
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
            <h1 className="text-3xl font-semibold text-white">My Resumes</h1>
          </div>
          <div className="glass rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">No Resumes Yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
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
          <h1 className="text-3xl font-semibold text-white">My Resumes</h1>
          <button
            onClick={() => navigate('/upload')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors min-h-[44px]"
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
              className="glass rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Icon and Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{resume.filename}</h3>
                    {resume.name && (
                      <p className="text-gray-400 text-sm truncate">{resume.name}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      {resume.skills_count} skills &bull; {formatDate(resume.uploaded_at)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 sm:flex-nowrap">
                  <button
                    onClick={() => handleAnalyze(resume.id, resume.filename)}
                    disabled={analyzingId === resume.id}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
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
            <p className="text-gray-400">No resumes match your search.</p>
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeAnalysisModal}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl border border-white/10">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSearch className="w-6 h-6 text-white" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Resume Analysis</h2>
                  <p className="text-sm text-gray-400 truncate max-w-xs">{currentFilename}</p>
                </div>
              </div>
              <button
                onClick={closeAnalysisModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Overall Score */}
              <div className="glass rounded-xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Overall Score</span>
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
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
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
              <div className="glass rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {currentAnalysis.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="glass rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="font-semibold text-white">Areas for Improvement</h3>
                </div>
                <ul className="space-y-2">
                  {currentAnalysis.weaknesses.map((weakness, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                      <span className="text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keyword Optimization */}
              <div className="glass rounded-xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Keyword Optimization</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${getScoreColor(currentAnalysis.keyword_optimization.score).bg}`}>
                    <span className={`text-sm font-bold ${getScoreColor(currentAnalysis.keyword_optimization.score).text}`}>
                      {currentAnalysis.keyword_optimization.score}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{currentAnalysis.keyword_optimization.suggestions}</p>
                {currentAnalysis.keyword_optimization.missing_keywords.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Missing Keywords:</p>
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
              <div className="glass rounded-xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">ATS Compatibility</h3>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${getScoreColor(currentAnalysis.ats_compatibility.score).bg}`}>
                    <span className={`text-sm font-bold ${getScoreColor(currentAnalysis.ats_compatibility.score).text}`}>
                      {currentAnalysis.ats_compatibility.score}
                    </span>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">{currentAnalysis.ats_compatibility.recommendations}</p>
                {currentAnalysis.ats_compatibility.issues.length > 0 && (
                  <>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Issues Found:</p>
                    <ul className="space-y-2">
                      {currentAnalysis.ats_compatibility.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                          <span className="text-gray-300">{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {/* Improvement Recommendations */}
              <div className="glass rounded-xl p-5 border border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-white">Action Items</h3>
                </div>
                <div className="space-y-4">
                  {currentAnalysis.improvement_recommendations.map((rec, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{rec.category}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${getPriorityColor(rec.priority).bg} ${getPriorityColor(rec.priority).text} border ${getPriorityColor(rec.priority).border}`}
                        >
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{rec.recommendation}</p>
                      <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                        <p className="text-xs text-green-400 font-semibold mb-1">Example:</p>
                        <p className="text-gray-300 text-sm">{rec.example}</p>
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
