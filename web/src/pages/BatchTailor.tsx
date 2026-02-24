import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Target, Loader2, CheckCircle, AlertCircle, Clock, FileText, Plus, X, Layers, ChevronDown, Trash2, Bookmark } from 'lucide-react'
import { api } from '../api/client'
import { showSuccess, showError } from '../utils/toast'
import { useResumeStore } from '../stores/resumeStore'

const BATCH_RESULTS_KEY = 'batch_tailor_results'

interface BatchResult {
  jobUrl: string
  status: 'pending' | 'processing' | 'success' | 'error'
  error?: string
  tailoredResumeId?: number
  company?: string
  title?: string
}

interface SavedUrl {
  id: number
  url: string
}

const MAX_JOBS = 10

export default function BatchTailor() {
  const navigate = useNavigate()

  // Resume state from Zustand store
  const {
    resumes,
    selectedResumeId,
    loading: resumesLoading,
    fetchResumes,
    setSelectedResumeId,
  } = useResumeStore()

  const [showResumeDropdown, setShowResumeDropdown] = useState(false)

  // Form state - each entry tracks the DB id (if saved) and the url string
  const [savedUrls, setSavedUrls] = useState<SavedUrl[]>([])
  const [jobUrls, setJobUrls] = useState<string[]>([''])
  const [urlIds, setUrlIds] = useState<(number | null)[]>([null])
  const [loadingUrls, setLoadingUrls] = useState(true)

  // Batch processing state
  const [processing, setProcessing] = useState(false)
  const [results, setResults] = useState<BatchResult[]>([])
  const [showResults, setShowResults] = useState(false)

  // Debounce timer for auto-save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  // Auto-select first resume
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id)
    }
  }, [resumes, selectedResumeId, setSelectedResumeId])

  // Load saved batch URLs on mount + restore persisted results
  useEffect(() => {
    async function loadBatchUrls() {
      try {
        const result = await api.getBatchJobUrls()
        if (result.success && result.data?.urls?.length > 0) {
          const urls = result.data.urls as SavedUrl[]
          setSavedUrls(urls)
          setJobUrls(urls.map(u => u.url))
          setUrlIds(urls.map(u => u.id))
        }
      } catch (e) {
        // Silently fail - user just sees empty form
      } finally {
        setLoadingUrls(false)
      }
    }

    // Restore persisted batch results from localStorage
    try {
      const stored = localStorage.getItem(BATCH_RESULTS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as BatchResult[]
        if (parsed.length > 0) {
          setResults(parsed)
          setShowResults(true)
        }
      }
    } catch {
      // Corrupt data - ignore
    }

    loadBatchUrls()
  }, [])

  // Debounced auto-save whenever URLs change
  const autoSave = useCallback((urls: string[]) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(async () => {
      const nonEmpty = urls.filter(u => u.trim().length > 0)
      if (nonEmpty.length > 0) {
        const result = await api.saveBatchJobUrls(urls)
        if (result.success && result.data?.urls) {
          const saved = result.data.urls as SavedUrl[]
          setSavedUrls(saved)
          // Rebuild urlIds to match current jobUrls
          const newIds: (number | null)[] = urls.map(u => {
            const match = saved.find(s => s.url === u.trim())
            return match ? match.id : null
          })
          setUrlIds(newIds)
        }
      }
    }, 800)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const handleAddUrl = () => {
    if (jobUrls.length < MAX_JOBS) {
      setJobUrls([...jobUrls, ''])
      setUrlIds([...urlIds, null])
    }
  }

  const handleDeleteUrl = async (index: number) => {
    const id = urlIds[index]

    // Remove from local state
    const newUrls = jobUrls.filter((_, i) => i !== index)
    const newIds = urlIds.filter((_, i) => i !== index)

    // Ensure at least one empty row
    if (newUrls.length === 0) {
      setJobUrls([''])
      setUrlIds([null])
    } else {
      setJobUrls(newUrls)
      setUrlIds(newIds)
    }

    // Delete from DB if it has an id
    if (id) {
      await api.deleteBatchJobUrl(id)
    }

    // Auto-save remaining
    const remaining = newUrls.length > 0 ? newUrls : ['']
    autoSave(remaining)
  }

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...jobUrls]
    newUrls[index] = value
    setJobUrls(newUrls)
    autoSave(newUrls)
  }

  const handleBatchTailor = async () => {
    if (!selectedResumeId) {
      showError('Please select a resume')
      return
    }

    const validUrls = jobUrls.filter(url => url.trim().length > 0)
    if (validUrls.length === 0) {
      showError('Please enter at least one job URL')
      return
    }

    setProcessing(true)
    setResults(validUrls.map(url => ({ jobUrl: url, status: 'pending' })))
    setShowResults(true)

    try {
      setResults(prev => prev.map(r => ({ ...r, status: 'processing' as const })))

      const result = await api.tailorResumeBatch({
        baseResumeId: selectedResumeId,
        jobUrls: validUrls,
      })

      if (result.success && result.data) {
        const batchResults = result.data.results || []
        const finalResults = validUrls.map((url, index) => {
          const jobResult = batchResults[index]
          if (jobResult?.success) {
            const data = jobResult.data || jobResult
            return {
              jobUrl: url,
              status: 'success' as const,
              tailoredResumeId: data.tailored_resume_id,
              company: data.company,
              title: data.title,
            }
          } else {
            return {
              jobUrl: url,
              status: 'error' as const,
              error: jobResult?.error || 'Failed to tailor',
            }
          }
        })
        setResults(finalResults)

        // Persist results to localStorage
        localStorage.setItem(BATCH_RESULTS_KEY, JSON.stringify(finalResults))

        const successCount = batchResults.filter((r: any) => r?.success).length
        if (successCount > 0) {
          showSuccess(`${successCount} resume${successCount !== 1 ? 's' : ''} tailored successfully`)

          // Auto-create application entries + saved comparisons for successful results
          for (const br of batchResults) {
            if (br?.success) {
              const d = br.data || br
              try {
                await api.createApplication({
                  job_title: d.title || 'Unknown Title',
                  company_name: d.company || 'Unknown Company',
                  job_url: br.job_url || '',
                  status: 'saved',
                  tailored_resume_id: d.tailored_resume_id,
                })
              } catch {
                // Non-critical
              }
              try {
                await api.saveComparison({
                  tailored_resume_id: d.tailored_resume_id,
                  title: `${d.company || 'Unknown'} - ${d.title || 'Untitled'}`,
                })
              } catch {
                // Non-critical
              }
            }
          }
        }
      } else {
        const errorResults = validUrls.map(url => ({
          jobUrl: url,
          status: 'error' as const,
          error: result.error || 'Batch tailoring failed',
        }))
        setResults(errorResults)
        showError(result.error || 'Batch tailoring failed')
      }
    } catch (error: any) {
      const errorResults = validUrls.map(url => ({
        jobUrl: url,
        status: 'error' as const,
        error: error.message || 'An error occurred',
      }))
      setResults(errorResults)
      showError(error.message || 'An error occurred')
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    setShowResults(false)
    setResults([])
    // Clear persisted results
    localStorage.removeItem(BATCH_RESULTS_KEY)
    // Reload saved URLs instead of clearing
    async function reload() {
      const result = await api.getBatchJobUrls()
      if (result.success && result.data?.urls?.length > 0) {
        const urls = result.data.urls as SavedUrl[]
        setSavedUrls(urls)
        setJobUrls(urls.map(u => u.url))
        setUrlIds(urls.map(u => u.id))
      } else {
        setJobUrls([''])
        setUrlIds([null])
      }
    }
    reload()
  }

  const handleViewResult = (tailoredResumeId: number) => {
    navigate(`/tailor?resumeId=${tailoredResumeId}`)
  }

  const handleViewAllResults = () => {
    navigate('/saved-comparisons')
  }

  const selectedResume = resumes.find(r => r.id === selectedResumeId)
  const validUrlCount = jobUrls.filter(url => url.trim().length > 0).length
  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  // Loading state
  if (resumesLoading || loadingUrls) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-theme-secondary mx-auto mb-3" />
          <p className="text-theme-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Results View
  if (showResults) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleReset}
            className="p-2 hover:bg-theme-glass-10 rounded-lg text-theme-secondary hover:text-theme transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-theme">Batch Results</h1>
        </div>

        {/* Summary Banner */}
        <div className="glass rounded-xl p-4 border border-theme-subtle mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  <span className="text-theme font-medium">Processing {validUrlCount} jobs...</span>
                </>
              ) : (
                <>
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span className="text-theme font-medium">
                    {successCount} succeeded, {errorCount} failed
                  </span>
                </>
              )}
            </div>
            {!processing && successCount > 0 && (
              <button
                onClick={handleViewAllResults}
                className="btn-primary text-sm px-4 py-2 whitespace-nowrap flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4" />
                View in Saved
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {results.map((result, index) => (
            <div key={index} className="glass rounded-xl p-4 border border-theme-subtle">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {result.status === 'pending' && <Clock className="w-5 h-5 text-theme-tertiary" />}
                  {result.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-blue-400" />}
                  {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {result.status === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  {result.company ? (
                    <>
                      <p className="text-theme font-semibold truncate">{result.company}</p>
                      <p className="text-theme-secondary text-sm truncate">{result.title}</p>
                    </>
                  ) : (
                    <p className="text-theme-secondary text-sm break-all">{result.jobUrl}</p>
                  )}
                  {result.error && (
                    <p className="text-red-400 text-xs mt-1">{result.error}</p>
                  )}
                </div>
                {result.status === 'success' && result.tailoredResumeId && (
                  <button
                    onClick={() => handleViewResult(result.tailoredResumeId!)}
                    className="btn-primary text-sm px-4 py-1.5 whitespace-nowrap"
                  >
                    View Result
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8">
          <button
            onClick={handleReset}
            className="w-full py-3 border border-theme-subtle rounded-xl text-theme hover:bg-theme-glass-5 transition-colors font-medium"
          >
            Start New Batch
          </button>
        </div>
      </div>
    )
  }

  // Empty state - no resumes
  if (resumes.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-theme mb-8 flex items-center gap-3">
          <Layers className="w-8 h-8" />
          Batch Tailor
        </h1>
        <div className="glass rounded-2xl p-12 border border-theme-subtle text-center">
          <FileText className="w-16 h-16 text-theme-tertiary mx-auto mb-4 opacity-50" />
          <h2 className="text-xl font-semibold text-theme mb-2">No Resumes</h2>
          <p className="text-theme-secondary mb-6">Upload a resume first to start batch tailoring.</p>
          <button
            onClick={() => navigate('/upload')}
            className="btn-primary px-6 py-3"
          >
            Upload Resume
          </button>
        </div>
      </div>
    )
  }

  // Main Form View
  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <h1 className="text-2xl sm:text-3xl font-bold text-theme mb-2 flex items-center gap-3">
        <Layers className="w-8 h-8" />
        Batch Tailor
      </h1>
      <p className="text-theme-secondary mb-8">Tailor your resume for up to {MAX_JOBS} jobs at once</p>

      {/* Info Banner */}
      <div className="rounded-xl p-4 border border-blue-500/30 bg-blue-500/5 mb-6 flex items-center gap-3">
        <Target className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <p className="text-sm text-theme-secondary">
          Paste LinkedIn or company career page URLs below. Your URLs are saved automatically and will persist until you delete them.
        </p>
      </div>

      {/* Resume Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-theme-secondary uppercase tracking-wider mb-2">
          Select Resume
        </label>
        <div className="relative">
          <button
            onClick={() => setShowResumeDropdown(!showResumeDropdown)}
            className="w-full glass rounded-xl p-3 border border-theme-subtle flex items-center justify-between hover:border-theme-muted transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <span className="text-theme truncate">
                {selectedResume?.filename || 'Select a resume'}
              </span>
            </div>
            <ChevronDown className={`w-5 h-5 text-theme-tertiary flex-shrink-0 transition-transform ${showResumeDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showResumeDropdown && (
            <div className="absolute z-10 w-full mt-1 rounded-xl border border-theme-subtle overflow-hidden shadow-lg" style={{ backgroundColor: 'var(--bg-primary)' }}>
              {resumes.map(resume => (
                <button
                  key={resume.id}
                  onClick={() => {
                    setSelectedResumeId(resume.id)
                    setShowResumeDropdown(false)
                  }}
                  className={`w-full p-3 text-left hover:bg-theme-glass-5 transition-colors flex items-center justify-between ${
                    selectedResumeId === resume.id ? 'bg-theme-glass-10' : ''
                  }`}
                >
                  <span className={`truncate ${selectedResumeId === resume.id ? 'text-blue-400 font-semibold' : 'text-theme'}`}>
                    {resume.filename}
                  </span>
                  <span className="text-xs text-theme-tertiary ml-2">{resume.skills_count} skills</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Job URLs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-theme-secondary uppercase tracking-wider">
            Job URLs
          </label>
          <span className="text-xs text-theme-tertiary">{validUrlCount}/{MAX_JOBS}</span>
        </div>

        <div className="space-y-2">
          {jobUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 glass rounded-xl border border-theme-subtle flex items-center overflow-hidden">
                <span className="text-xs text-theme-tertiary w-8 text-center flex-shrink-0">{index + 1}</span>
                <input
                  type="url"
                  value={url}
                  onChange={e => handleUrlChange(index, e.target.value)}
                  placeholder="https://linkedin.com/jobs/..."
                  className="flex-1 bg-transparent py-3 pr-3 text-theme focus:outline-none text-sm placeholder:text-theme-tertiary"
                />
              </div>
              <button
                onClick={() => handleDeleteUrl(index)}
                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                title="Delete URL"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {jobUrls.length < MAX_JOBS && (
          <button
            onClick={handleAddUrl}
            className="w-full mt-2 p-3 border border-dashed border-theme-muted rounded-xl flex items-center justify-center gap-2 text-blue-400 hover:bg-theme-glass-5 transition-colors text-sm font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Another URL
          </button>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleBatchTailor}
        disabled={processing || validUrlCount === 0}
        className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Target className="w-5 h-5" />
            Tailor {validUrlCount} Resume{validUrlCount !== 1 ? 's' : ''}
          </>
        )}
      </button>
    </div>
  )
}
