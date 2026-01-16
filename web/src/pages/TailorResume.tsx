import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Target, Loader2, CheckCircle2, AlertCircle, FileText, Sparkles, ArrowRight, Download, Trash2, CheckSquare, Square, Briefcase, Link2, Unlink2, Copy, Check, Edit, ChevronDown, ChevronRight, ChevronUp, Mail, FileDown, Printer, PlayCircle, Save, RotateCcw, Bookmark } from 'lucide-react'
import { api } from '../api/client'
import ChangeExplanation from '../components/ChangeExplanation'
import ResumeAnalysis from '../components/ResumeAnalysis'
import KeywordPanel from '../components/KeywordPanel'
import MatchScore from '../components/MatchScore'
import ThemeToggle from '../components/ThemeToggle'

// LocalStorage keys for persisting tailor session
const LAST_TAILORED_RESUME_KEY = 'tailor_last_viewed_resume'
const TAILOR_SESSION_KEY = 'tailor_session_data'

interface BaseResume {
  id: number
  filename: string
  summary: string
  skills: string[]
  experience: any[]
  education: string
  certifications: string
  skills_count: number
  uploaded_at: string
}

interface TailoredResume {
  id: number
  tailored_summary: string
  tailored_skills: string[]
  tailored_experience: any[]
  tailored_education: string
  tailored_certifications: string
  alignment_statement: string
  quality_score: number
  docx_path: string
  company: string
  title: string
}

// Helper functions for session persistence
const saveSessionToLocalStorage = (
  selectedResume: BaseResume | null,
  tailoredResume: TailoredResume | null,
  jobUrl: string,
  company: string,
  jobTitle: string,
  analysis?: any,
  keywords?: any,
  matchScore?: any
) => {
  try {
    const sessionData = {
      selectedResume,
      tailoredResume,
      jobUrl,
      company,
      jobTitle,
      analysis,
      keywords,
      matchScore,
      timestamp: Date.now()
    }
    localStorage.setItem(TAILOR_SESSION_KEY, JSON.stringify(sessionData))
    console.log('Saved session to localStorage with AI analysis data')
  } catch (err) {
    console.error('Error saving session:', err)
  }
}

const loadSessionFromLocalStorage = () => {
  try {
    const sessionData = localStorage.getItem(TAILOR_SESSION_KEY)
    if (!sessionData) return null

    const parsed = JSON.parse(sessionData)
    console.log('Loaded session from localStorage')
    return parsed
  } catch (err) {
    console.error('Error loading session:', err)
    return null
  }
}

const clearSession = () => {
  try {
    localStorage.removeItem(TAILOR_SESSION_KEY)
    localStorage.removeItem(LAST_TAILORED_RESUME_KEY)
    console.log('Cleared session from localStorage')
  } catch (err) {
    console.error('Error clearing session:', err)
  }
}

export default function TailorResume() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [resumes, setResumes] = useState<BaseResume[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null)
  const [selectedResume, setSelectedResume] = useState<BaseResume | null>(null)
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null)
  const [jobUrl, setJobUrl] = useState('')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [deletingResumeId, setDeletingResumeId] = useState<number | null>(null)
  const [selectedResumeIds, setSelectedResumeIds] = useState<Set<number>>(new Set())
  const [deletingBulk, setDeletingBulk] = useState(false)

  // Enhancement states
  const [showChanges, setShowChanges] = useState(true)
  const [syncScroll, setSyncScroll] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('summary')
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    skills: true,
    experience: true,
    education: true,
    certifications: true,
    alignment: true
  })
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<Record<string, boolean>>({})
  const [editedContent, setEditedContent] = useState<Record<string, string>>({})
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileTab, setMobileTab] = useState<'original' | 'tailored'>('tailored')

  // New analysis states
  const [analysis, setAnalysis] = useState<any>(null)
  const [keywords, setKeywords] = useState<any>(null)
  const [matchScore, setMatchScore] = useState<any>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [detailMode, setDetailMode] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState<string>('')
  const [analysisEstimate, setAnalysisEstimate] = useState<number>(0)

  // Tab state for main content organization
  const [activeTab, setActiveTab] = useState<'comparison' | 'analysis' | 'insights'>('comparison')
  const [analysisLoaded, setAnalysisLoaded] = useState(false)

  // Highlighting state for click correspondence
  const [highlightedSection, setHighlightedSection] = useState<{ type: string; index?: number } | null>(null)

  // Refs for synchronized scrolling
  const leftScrollRef = useRef<HTMLDivElement>(null)
  const rightScrollRef = useRef<HTMLDivElement>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)

  // Check if a resume was passed via navigation state
  useEffect(() => {
    if (location.state?.selectedResumeId) {
      setSelectedResumeId(location.state.selectedResumeId)
    }
  }, [location])

  useEffect(() => {
    loadResumes()
  }, [])

  useEffect(() => {
    if (selectedResumeId) {
      loadFullResume(selectedResumeId)
    }
  }, [selectedResumeId])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault()
            setSyncScroll(prev => !prev)
            break
          case 'c':
            e.preventDefault()
            setShowChanges(prev => !prev)
            break
          case 'd':
            e.preventDefault()
            if (tailoredResume) {
              handleDownloadResume('docx')
            }
            break
        }
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [tailoredResume])

  // Don't auto-load analysis - wait for user to click tabs (lazy loading)
  // This makes the page load instantly instead of waiting 3-5 minutes
  // Analysis will load when user clicks the Analysis or Insights tabs

  // Load saved comparison from URL parameter
  useEffect(() => {
    const loadSavedComparison = async () => {
      const comparisonId = searchParams.get('comparison')
      if (comparisonId && !tailoredResume && !loading) {
        console.log('Loading saved comparison:', comparisonId)
        try {
          const userId = localStorage.getItem('talor_user_id')
          const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

          const response = await fetch(`${API_BASE_URL}/api/saved-comparisons/${comparisonId}`, {
            headers: {
              'Content-Type': 'application/json',
              'X-User-ID': userId || ''
            }
          })

          if (!response.ok) {
            throw new Error('Failed to load saved comparison')
          }

          const data = await response.json()
          console.log('Loaded saved comparison data:', data)

          // Set base resume data
          setSelectedResume({
            id: 0, // Placeholder - not used when viewing saved comparison
            filename: 'Base Resume',
            summary: data.base_resume.summary,
            skills: data.base_resume.skills,
            experience: data.base_resume.experience,
            education: data.base_resume.education,
            certifications: data.base_resume.certifications,
            skills_count: data.base_resume.skills.length,
            uploaded_at: ''
          })

          // Set tailored resume data
          setTailoredResume({
            id: data.tailored_resume.id || 0,
            tailored_summary: data.tailored_resume.summary,
            tailored_skills: data.tailored_resume.skills,
            tailored_experience: data.tailored_resume.experience,
            tailored_education: data.tailored_resume.education,
            tailored_certifications: data.tailored_resume.certifications,
            alignment_statement: data.tailored_resume.alignment_statement,
            quality_score: 0,
            docx_path: '',
            company: data.job.company,
            title: data.job.title
          })

          // Set job data
          setCompany(data.job.company)
          setJobTitle(data.job.title)
          setJobUrl(data.job.url || '')

          // Restore persisted AI analysis data
          if (data.analysis) {
            console.log('Restoring persisted AI analysis')
            setAnalysis(data.analysis)
            setAnalysisLoaded(true)
          }
          if (data.keywords) {
            console.log('Restoring persisted keyword analysis')
            setKeywords(data.keywords)
          }
          if (data.match_score) {
            console.log('Restoring persisted match score')
            setMatchScore(data.match_score)
          }

          setShowComparison(true)
          setSuccess(true)
        } catch (err: any) {
          console.error('Error loading saved comparison:', err)
          setError('Failed to load saved comparison')
        }
      }
    }
    loadSavedComparison()
  }, [searchParams])

  // Restore session from localStorage on mount (takes priority over API calls)
  useEffect(() => {
    const restoreSession = () => {
      // Don't restore if loading from URL comparison parameter
      const comparisonId = searchParams.get('comparison')
      if (comparisonId) {
        console.log('Skipping session restore - loading from URL comparison')
        return
      }

      const session = loadSessionFromLocalStorage()
      if (session && session.tailoredResume && session.selectedResume) {
        console.log('Restoring session from localStorage')
        setSelectedResume(session.selectedResume)
        setTailoredResume(session.tailoredResume)
        setJobUrl(session.jobUrl || '')
        setCompany(session.company || '')
        setJobTitle(session.jobTitle || '')

        // Restore AI analysis data if available
        if (session.analysis) {
          console.log('Restoring AI analysis from localStorage')
          setAnalysis(session.analysis)
          setAnalysisLoaded(true)
        }
        if (session.keywords) {
          console.log('Restoring keywords from localStorage')
          setKeywords(session.keywords)
        }
        if (session.matchScore) {
          console.log('Restoring match score from localStorage')
          setMatchScore(session.matchScore)
        }

        setShowComparison(true)
        setSuccess(true)
      }
    }
    restoreSession()
  }, []) // Only run on mount

  // Restore last viewed tailored resume on mount (fallback if no session data)
  useEffect(() => {
    const restoreLastViewed = async () => {
      const savedId = localStorage.getItem(LAST_TAILORED_RESUME_KEY)
      const session = loadSessionFromLocalStorage()

      // Only load from API if no session data exists
      if (savedId && !tailoredResume && !loading && !session) {
        console.log('Restoring last viewed tailored resume:', savedId)
        await loadTailoredResumeById(parseInt(savedId))
      }
    }
    restoreLastViewed()
  }, []) // Only run on mount

  // Save session whenever relevant data changes (including AI analysis)
  useEffect(() => {
    if (tailoredResume && selectedResume) {
      saveSessionToLocalStorage(selectedResume, tailoredResume, jobUrl, company, jobTitle, analysis, keywords, matchScore)
    }
  }, [tailoredResume, selectedResume, jobUrl, company, jobTitle, analysis, keywords, matchScore])

  // Scroll sync effect
  useEffect(() => {
    if (!syncScroll || !leftPanelRef.current || !rightPanelRef.current) return

    const leftPanel = leftPanelRef.current
    const rightPanel = rightPanelRef.current

    const handleLeftScroll = () => {
      if (leftPanel && rightPanel) {
        const scrollPercentage = leftPanel.scrollTop / (leftPanel.scrollHeight - leftPanel.clientHeight)
        rightPanel.scrollTop = scrollPercentage * (rightPanel.scrollHeight - rightPanel.clientHeight)
      }
    }

    const handleRightScroll = () => {
      if (leftPanel && rightPanel) {
        const scrollPercentage = rightPanel.scrollTop / (rightPanel.scrollHeight - rightPanel.clientHeight)
        leftPanel.scrollTop = scrollPercentage * (leftPanel.scrollHeight - leftPanel.clientHeight)
      }
    }

    leftPanel.addEventListener('scroll', handleLeftScroll)
    rightPanel.addEventListener('scroll', handleRightScroll)

    return () => {
      leftPanel.removeEventListener('scroll', handleLeftScroll)
      rightPanel.removeEventListener('scroll', handleRightScroll)
    }
  }, [syncScroll])

  // Utility functions
  const handleScroll = (source: 'left' | 'right') => (e: React.UIEvent<HTMLDivElement>) => {
    if (!syncScroll) return

    const scrollRatio = e.currentTarget.scrollTop / (e.currentTarget.scrollHeight - e.currentTarget.clientHeight)
    const target = source === 'left' ? rightScrollRef : leftScrollRef

    if (target.current) {
      target.current.scrollTop = scrollRatio * (target.current.scrollHeight - target.current.clientHeight)
    }
  }

  const scrollToSection = (section: string) => {
    const element = document.getElementById(`section-${section}`)
    if (element && leftScrollRef.current) {
      const container = leftScrollRef.current

      // Get the element's position relative to the container using getBoundingClientRect
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      // Calculate the scroll position (current scroll + difference between positions)
      const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 20

      // Scroll both containers to the section
      container.scrollTo({ top: scrollTop, behavior: 'smooth' })

      // If sync scroll is enabled, scroll the right container too
      if (syncScroll && rightScrollRef.current) {
        rightScrollRef.current.scrollTo({ top: scrollTop, behavior: 'smooth' })
      }

      setActiveSection(section)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCopy = async (content: string, section: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const toggleEditMode = (section: string) => {
    setEditMode(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const saveEdit = (section: string) => {
    toggleEditMode(section)
  }

  const handleSectionClick = (type: string, index?: number) => {
    // Toggle highlighting: if same section clicked, clear highlight, otherwise set new highlight
    if (highlightedSection?.type === type && highlightedSection?.index === index) {
      setHighlightedSection(null)
    } else {
      setHighlightedSection({ type, index })
    }
  }

  const exportToPDF = () => {
    window.print()
  }

  const sendEmail = () => {
    const subject = encodeURIComponent(`Tailored Resume for ${tailoredResume?.company}`)
    const body = encodeURIComponent(`Your tailored resume is ready to download.`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const hasChanged = (original: string, tailored: string): boolean => {
    return original !== tailored
  }

  const loadFullResume = async (resumeId: number) => {
    try {
      const result = await api.getResume(resumeId)
      if (result.success) {
        setSelectedResume(result.data)
      }
    } catch (err: any) {
      console.error('Failed to load full resume:', err)
      // Fallback to partial data from list
      const resume = resumes.find(r => r.id === resumeId)
      setSelectedResume(resume || null)
    }
  }

  const loadResumes = async () => {
    try {
      setLoadingResumes(true)
      const result = await api.listResumes()

      if (!result.success) {
        throw new Error(result.error || 'Failed to load resumes')
      }

      setResumes(result.data.resumes || [])

      // Auto-select first resume if available
      if (result.data.resumes && result.data.resumes.length > 0) {
        setSelectedResumeId(result.data.resumes[0].id)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoadingResumes(false)
    }
  }

  // Load a tailored resume by ID (for restoring from localStorage)
  const loadTailoredResumeById = async (tailoredId: number) => {
    try {
      setLoading(true)
      const userId = localStorage.getItem('talor_user_id')
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

      // Fetch the tailored resume
      const response = await fetch(`${API_BASE_URL}/api/tailor/tailored/${tailoredId}`, {
        headers: {
          'X-User-ID': userId || ''
        }
      })

      if (!response.ok) {
        // If tailored resume not found, clear localStorage
        if (response.status === 404) {
          localStorage.removeItem(LAST_TAILORED_RESUME_KEY)
          throw new Error('Saved resume no longer exists')
        }
        throw new Error('Failed to load saved resume')
      }

      const data = await response.json()

      // Load the base resume
      await loadFullResume(data.base_resume_id)
      setSelectedResumeId(data.base_resume_id)

      // Set the tailored resume
      setTailoredResume({
        id: data.id,
        tailored_summary: data.tailored_summary,
        tailored_skills: data.tailored_skills || [],
        tailored_experience: data.tailored_experience || [],
        tailored_education: data.tailored_education || '',
        tailored_certifications: data.tailored_certifications || '',
        alignment_statement: data.alignment_statement || '',
        quality_score: data.quality_score || 95,
        docx_path: data.docx_path,
        company: data.job?.company || 'Unknown Company',
        title: data.job?.title || 'Unknown Position'
      })

      // Set job details for the form
      setCompany(data.job?.company || '')
      setJobTitle(data.job?.title || '')
      setJobUrl(data.job?.url || '')

      setShowComparison(true)
      setSuccess(true)

      console.log('Successfully restored tailored resume:', tailoredId)
    } catch (err: any) {
      console.error('Error loading tailored resume:', err)
      setError(err.message)
      localStorage.removeItem(LAST_TAILORED_RESUME_KEY)
    } finally {
      setLoading(false)
    }
  }

  // New AI analysis functions - OPTIMIZED with parallel calls
  const loadAllAnalysis = async (tailoredResumeId: number) => {
    if (!tailoredResumeId) return

    setLoadingAnalysis(true)
    setAnalysisProgress('Loading AI analysis in parallel...')
    setAnalysisEstimate(90)

    const userId = localStorage.getItem('talor_user_id')
    const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

    try {
      // Call all 3 APIs in parallel (3x faster!)
      const [analysisRes, keywordsRes, scoreRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/resume-analysis/analyze-changes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId || ''
          },
          body: JSON.stringify({ tailored_resume_id: tailoredResumeId })
        }),
        fetch(`${API_BASE_URL}/api/resume-analysis/analyze-keywords`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId || ''
          },
          body: JSON.stringify({ tailored_resume_id: tailoredResumeId })
        }),
        fetch(`${API_BASE_URL}/api/resume-analysis/match-score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': userId || ''
          },
          body: JSON.stringify({ tailored_resume_id: tailoredResumeId })
        })
      ])

      // Parse results
      if (analysisRes.ok) {
        const data = await analysisRes.json()
        setAnalysis(data.analysis)
      }

      if (keywordsRes.ok) {
        const data = await keywordsRes.json()
        setKeywords(data.keywords)
      }

      if (scoreRes.ok) {
        const data = await scoreRes.json()
        setMatchScore(data.match_score)
      }

      setAnalysisProgress('Analysis complete!')
      setAnalysisEstimate(0)
    } catch (error) {
      console.error('Error loading analysis:', error)
      setAnalysisProgress('Error loading analysis')
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const handleDownloadResume = async (format: 'pdf' | 'docx') => {
    if (!tailoredResume?.id) return

    try {
      const userId = localStorage.getItem('talor_user_id')
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

      const response = await fetch(`${API_BASE_URL}/api/resume-analysis/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId || ''
        },
        body: JSON.stringify({
          tailored_resume_id: tailoredResume.id,
          format: format
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url

        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `TailoredResume.${format}`
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }

        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Error downloading resume')
      }
    } catch (error) {
      console.error('Error downloading resume:', error)
      alert('Error downloading resume')
    }
  }

  const toggleResumeSelection = (resumeId: number) => {
    setSelectedResumeIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(resumeId)) {
        newSet.delete(resumeId)
      } else {
        newSet.add(resumeId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedResumeIds.size === resumes.length) {
      setSelectedResumeIds(new Set())
    } else {
      setSelectedResumeIds(new Set(resumes.map(r => r.id)))
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedResumeIds.size === 0) {
      setError('Please select at least one resume to delete')
      return
    }

    const count = selectedResumeIds.size
    if (!confirm(`Are you sure you want to delete ${count} resume(s)? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingBulk(true)
      setError(null)

      // Delete all selected resumes
      const deletePromises = Array.from(selectedResumeIds).map(id => api.deleteResume(id))
      const results = await Promise.all(deletePromises)

      // Check for failures
      const failures = results.filter(r => !r.success)
      if (failures.length > 0) {
        throw new Error(`Failed to delete ${failures.length} resume(s)`)
      }

      // Remove from local state
      setResumes(prevResumes => prevResumes.filter(r => !selectedResumeIds.has(r.id)))

      // Clear selections
      setSelectedResumeIds(new Set())

      // If currently selected resume was deleted, clear it
      if (selectedResumeId && selectedResumeIds.has(selectedResumeId)) {
        setSelectedResumeId(null)
        setSelectedResume(null)
      }

      console.log(`Successfully deleted ${count} resume(s)`)
    } catch (err: any) {
      console.error('Bulk delete error:', err)
      setError(err.message)
    } finally {
      setDeletingBulk(false)
    }
  }

  const handleDeleteResume = async (resumeId: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the resume when clicking delete

    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingResumeId(resumeId)
      const result = await api.deleteResume(resumeId)

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete resume')
      }

      // Remove from local state using functional update
      setResumes(prevResumes => prevResumes.filter(r => r.id !== resumeId))

      // Remove from selected if it was selected
      setSelectedResumeIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(resumeId)
        return newSet
      })

      // If deleted resume was selected, clear selection
      if (selectedResumeId === resumeId) {
        setSelectedResumeId(null)
        setSelectedResume(null)
      }

      // Show success message
      console.log('Resume deleted successfully:', resumeId)
    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message)
    } finally {
      setDeletingResumeId(null)
    }
  }

  const handleTailor = async () => {
    if (!selectedResumeId) {
      setError('Please select a resume')
      return
    }

    // Trim all inputs
    const trimmedJobUrl = jobUrl.trim()
    const trimmedCompany = company.trim()
    const trimmedJobTitle = jobTitle.trim()

    // Validate that at least job URL or company name is provided
    if (!trimmedJobUrl && !trimmedCompany) {
      setError('Please provide either a job URL or company name to generate a tailored resume')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)
    setShowComparison(false)

    try {
      const result = await api.tailorResume({
        baseResumeId: selectedResumeId,
        jobUrl: trimmedJobUrl || undefined,
        company: trimmedCompany || undefined,
        jobTitle: trimmedJobTitle || undefined,
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to tailor resume')
      }

      // Set tailored resume data
      const tailoredId = result.data.tailored_resume_id
      setTailoredResume({
        id: tailoredId,
        tailored_summary: result.data.summary,
        tailored_skills: result.data.competencies || [],
        tailored_experience: result.data.experience || [],
        tailored_education: result.data.education || '',
        tailored_certifications: result.data.certifications || '',
        alignment_statement: result.data.alignment_statement || '',
        quality_score: 95,
        docx_path: result.data.docx_path,
        company: result.data.company || company,
        title: result.data.title || jobTitle
      })

      // Save to localStorage for persistence
      localStorage.setItem(LAST_TAILORED_RESUME_KEY, tailoredId.toString())
      console.log('Saved tailored resume to localStorage:', tailoredId)

      setSuccess(true)
      setShowComparison(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Save comparison for later viewing with AI analysis data
  const saveComparison = async () => {
    if (!tailoredResume?.id) return

    try {
      const userId = localStorage.getItem('talor_user_id')
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

      const response = await fetch(`${API_BASE_URL}/api/saved-comparisons/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId || ''
        },
        body: JSON.stringify({
          tailored_resume_id: tailoredResume.id,
          title: `${tailoredResume.company} - ${tailoredResume.title}`,
          // Persist AI analysis data so user sees exact same data when reopening
          analysis_data: analysis,
          keywords_data: keywords,
          match_score_data: matchScore
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save comparison')
      }

      alert('Comparison saved successfully! View it in the Saved menu.')
    } catch (err: any) {
      console.error('Error saving comparison:', err)
      alert('Failed to save comparison')
    }
  }

  const resetForm = () => {
    setJobUrl('')
    setCompany('')
    setJobTitle('')
    setTailoredResume(null)
    setShowComparison(false)
    setSuccess(false)
    setError(null)
    setAnalysisLoaded(false)
    setAnalysis(null)
    setKeywords(null)
    setMatchScore(null)

    // Clear persisted session data
    clearSession()
  }

  // Handle tab change with lazy loading
  const handleTabChange = (tab: 'comparison' | 'analysis' | 'insights') => {
    setActiveTab(tab)

    // Lazy load analysis when user clicks Analysis or Insights tabs
    if ((tab === 'analysis' || tab === 'insights') && !analysisLoaded && !loadingAnalysis && tailoredResume?.id) {
      setAnalysisLoaded(true)
      loadAllAnalysis(tailoredResume.id)
    }
  }

  if (showComparison && selectedResume && tailoredResume) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Resume Comparison
                </h1>
                <p className="text-gray-400 mt-1">Original vs. Tailored for {tailoredResume.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={saveComparison}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all "
                title="Save this comparison for later"
              >
                <Bookmark className="w-5 h-5" />
                Save Comparison
              </button>
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all "
              >
                <RotateCcw className="w-5 h-5" />
                Start New Resume
              </button>
            </div>
          </div>

          {/* Control Bar */}
          <div className="mb-6 flex items-center justify-between glass rounded-xl p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSyncScroll(!syncScroll)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  syncScroll ? 'bg-white/20 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                title="Ctrl/Cmd + S"
              >
                {syncScroll ? <Link2 size={18} /> : <Unlink2 size={18} />}
                <span className="text-sm font-medium">Sync Scroll</span>
              </button>

              <button
                onClick={() => setShowChanges(!showChanges)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  showChanges ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
                title="Ctrl/Cmd + C"
              >
                <Sparkles size={18} />
                <span className="text-sm font-medium">Show Changes</span>
              </button>

              <div className="h-6 w-px bg-white/10"></div>

              <button
                onClick={() => {
                  const allExpanded = Object.values(expandedSections).every(v => v)
                  const newState = Object.keys(expandedSections).reduce((acc, key) => ({ ...acc, [key]: !allExpanded }), {})
                  setExpandedSections(newState)
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
              >
                {Object.values(expandedSections).every(v => v) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                <span className="text-sm font-medium">
                  {Object.values(expandedSections).every(v => v) ? 'Collapse All' : 'Expand All'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
              >
                <Printer size={18} />
                <span className="text-sm font-medium">Print</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
                  title="Ctrl/Cmd + D"
                >
                  <FileDown size={18} />
                  <span className="text-sm font-medium">Export</span>
                  <ChevronDown size={16} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-gray-900 rounded-xl shadow-2xl border border-white/10 py-2 min-w-[200px] z-10">
                    <button
                      onClick={() => {
                        handleDownloadResume('docx')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                    >
                      <Download size={16} />
                      Word Document (.docx)
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadResume('pdf')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                    >
                      <FileDown size={16} />
                      PDF Document (.pdf)
                    </button>
                    <button
                      onClick={() => {
                        handleCopy(JSON.stringify(tailoredResume, null, 2), 'all')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                    >
                      <Copy size={16} />
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={() => {
                        sendEmail()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                    >
                      <Mail size={16} />
                      Email to Self
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Success Banner */}
          <div className="mb-8 p-6 glass border-2 border-green-500/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">Resume Successfully Tailored!</h3>
                <p className="text-gray-400">
                  Your resume has been customized for <span className="font-semibold text-white">{tailoredResume.company}</span> - {tailoredResume.title}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  📄 Saved to: <code className="bg-white/10 px-2 py-1 rounded text-xs">{tailoredResume.docx_path}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Loading Progress Indicator */}
          {loadingAnalysis && (
            <div className="mb-6 p-6 glass rounded-xl border border-blue-500/30">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{analysisProgress}</h3>
                    {analysisEstimate > 0 && (
                      <span className="text-sm text-gray-400">
                        ~{analysisEstimate} seconds
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Powered by GPT-4.1-mini • This may take 3-5 minutes total
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6 glass rounded-xl border border-white/20 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => handleTabChange('comparison')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'comparison'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileText className="w-5 h-5" />
                Side-by-Side Comparison
              </button>
              <button
                onClick={() => handleTabChange('analysis')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'analysis'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                AI Analysis & Insights
              </button>
              <button
                onClick={() => handleTabChange('insights')}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'insights'
                    ? 'bg-white/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Target className="w-5 h-5" />
                Match & Keywords
              </button>
            </div>
          </div>

          {/* Tab Content: Side-by-Side Comparison */}
          {activeTab === 'comparison' && (
            <>
              {/* Mobile Tab Switcher */}
              {isMobile && (
                <div className="flex border-b border-white/10 mb-6">
                  <button
                    className={`flex-1 py-3 text-center font-medium transition-all ${
                      mobileTab === 'original'
                        ? 'border-b-2 border-white text-white'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setMobileTab('original')}
                  >
                    Original
                  </button>
                  <button
                    className={`flex-1 py-3 text-center font-medium transition-all ${
                      mobileTab === 'tailored'
                        ? 'border-b-2 border-white text-white'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                    onClick={() => setMobileTab('tailored')}
                  >
                    Tailored ✨
                  </button>
                </div>
              )}

              {/* Side-by-Side Comparison */}
              <div className={`${isMobile ? '' : 'grid grid-cols-2 gap-6'}`}>
              {/* Show only selected tab on mobile */}
              {(!isMobile || mobileTab === 'original') && (
                <div className={`glass rounded-2xl overflow-hidden border border-white/20 ${isMobile ? 'mb-6' : ''}`}>
              <div className="glass p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Original Resume</h2>
                </div>
                <p className="text-gray-400 text-sm">{selectedResume.filename}</p>
              </div>

              <div
                ref={leftScrollRef}
                onScroll={handleScroll('left')}
                className="p-6 max-h-[70vh] overflow-y-auto"
              >
                {/* Summary */}
                <div id="section-summary" className="mb-10">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/10">
                    <button
                      onClick={() => toggleSection('summary')}
                      className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                    >
                      {expandedSections.summary ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      Professional Summary
                    </button>
                    <button
                      onClick={() => handleCopy(selectedResume.summary, 'orig-summary')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedSection === 'orig-summary' ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                  {expandedSections.summary && (
                    <div
                      className={`glass rounded-xl p-4 border border-white/10 cursor-pointer ${
                        highlightedSection?.type === 'summary' ? 'highlight-original' : ''
                      }`}
                      onClick={() => handleSectionClick('summary')}
                    >
                      <p className="text-gray-400 leading-relaxed">{selectedResume.summary}</p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {selectedResume.skills && selectedResume.skills.length > 0 && (
                  <div id="section-skills" className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/10">
                      <button
                        onClick={() => toggleSection('skills')}
                        className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                      >
                        {expandedSections.skills ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Skills ({selectedResume.skills.length})
                      </button>
                      <button
                        onClick={() => handleCopy(selectedResume.skills.join(', '), 'orig-skills')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'orig-skills' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    {expandedSections.skills && (
                      <div
                        className={`glass rounded-xl p-4 border border-white/10 cursor-pointer ${
                          highlightedSection?.type === 'skills' ? 'highlight-original' : ''
                        }`}
                        onClick={() => handleSectionClick('skills')}
                      >
                        <div className="flex flex-wrap gap-2">
                          {selectedResume.skills.slice(0, 12).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-white/10 text-white rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Experience */}
                {selectedResume.experience && selectedResume.experience.length > 0 && (
                  <div id="section-experience" className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/10">
                      <button
                        onClick={() => toggleSection('experience')}
                        className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                      >
                        {expandedSections.experience ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Professional Experience
                      </button>
                      <button
                        onClick={() => handleCopy(JSON.stringify(selectedResume.experience, null, 2), 'orig-experience')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'orig-experience' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    {expandedSections.experience && (
                      <div className="space-y-4">
                        {selectedResume.experience.map((exp: any, idx: number) => (
                          <div
                            key={idx}
                            className={`glass rounded-xl p-4 border border-white/10 cursor-pointer ${
                              highlightedSection?.type === 'experience' && highlightedSection?.index === idx
                                ? 'highlight-original'
                                : ''
                            }`}
                            onClick={() => handleSectionClick('experience', idx)}
                          >
                            <h4 className="font-bold text-white text-base mb-1">{exp.header || exp.title}</h4>
                            {exp.location && (
                              <p className="text-gray-400 text-sm mb-1">{exp.location}</p>
                            )}
                            {exp.dates && (
                              <p className="text-gray-500 text-sm mb-3">{exp.dates}</p>
                            )}
                            {exp.bullets && exp.bullets.length > 0 && (
                              <ul className="space-y-2 text-sm">
                                {exp.bullets.map((bullet: string, bulletIdx: number) => (
                                  <li key={bulletIdx} className="text-gray-400 flex gap-2">
                                    <span className="text-white/40 flex-shrink-0">•</span>
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Education */}
                {selectedResume.education && (
                  <div id="section-education" className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/10">
                      <button
                        onClick={() => toggleSection('education')}
                        className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                      >
                        {expandedSections.education ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Education
                      </button>
                      <button
                        onClick={() => handleCopy(selectedResume.education, 'orig-education')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'orig-education' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    {expandedSections.education && (
                      <div
                        className={`glass rounded-xl p-4 border border-white/10 cursor-pointer ${
                          highlightedSection?.type === 'education' ? 'highlight-original' : ''
                        }`}
                        onClick={() => handleSectionClick('education')}
                      >
                        <p className="text-gray-400">{selectedResume.education}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Certifications */}
                {selectedResume.certifications && (
                  <div id="section-certifications">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/10">
                      <button
                        onClick={() => toggleSection('certifications')}
                        className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                      >
                        {expandedSections.certifications ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Certifications
                      </button>
                      <button
                        onClick={() => handleCopy(selectedResume.certifications, 'orig-certifications')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'orig-certifications' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    {expandedSections.certifications && (
                      <div
                        className={`glass rounded-xl p-4 border border-white/10 cursor-pointer ${
                          highlightedSection?.type === 'certifications' ? 'highlight-original' : ''
                        }`}
                        onClick={() => handleSectionClick('certifications')}
                      >
                        <p className="text-gray-400 whitespace-pre-line">{selectedResume.certifications}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
              )}

            {/* Tailored Resume */}
            {(!isMobile || mobileTab === 'tailored') && (
              <div className={`glass rounded-2xl overflow-hidden border border-white/40 ${isMobile ? '' : ''}`}>
              <div className="glass p-6 border-b border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-white" />
                  <h2 className="text-2xl font-bold text-white">Tailored Resume</h2>
                </div>
                <p className="text-gray-300 text-sm">Customized for {tailoredResume.company}</p>
              </div>

              <div
                ref={rightScrollRef}
                onScroll={handleScroll('right')}
                className="p-6 max-h-[70vh] overflow-y-auto"
              >
                {/* Tailored Summary */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/20">
                    <button
                      onClick={() => toggleSection('summary')}
                      className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                    >
                      {expandedSections.summary ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      Professional Summary
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleEditMode('summary')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Edit section"
                      >
                        {editMode.summary ? <Save size={18} className="text-blue-400" /> : <Edit size={18} className="text-gray-400" />}
                      </button>
                      <button
                        onClick={() => handleCopy(tailoredResume.tailored_summary, 'tail-summary')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'tail-summary' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  {expandedSections.summary && (
                    <div
                      className={`relative cursor-pointer ${
                        showChanges && hasChanged(selectedResume.summary, tailoredResume.tailored_summary)
                          ? 'bg-green-500/10 border-l-2 border-green-500/50 pl-4'
                          : ''
                      } ${highlightedSection?.type === 'summary' ? 'highlight-tailored' : ''}`}
                      onClick={() => handleSectionClick('summary')}
                    >
                      {showChanges && hasChanged(selectedResume.summary, tailoredResume.tailored_summary) && (
                        <div className="absolute -left-1 top-0 bottom-0 w-1 bg-green-500 rounded"></div>
                      )}
                      {editMode.summary ? (
                        <textarea
                          value={editedContent.summary || tailoredResume.tailored_summary}
                          onChange={(e) => setEditedContent(prev => ({ ...prev, summary: e.target.value }))}
                          className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 min-h-[120px]"
                          rows={6}
                        />
                      ) : (
                        <p className="text-gray-400 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/10">
                          {editedContent.summary || tailoredResume.tailored_summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tailored Competencies */}
                {tailoredResume.tailored_skills && tailoredResume.tailored_skills.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/20">
                      <button
                        onClick={() => toggleSection('skills')}
                        className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                      >
                        {expandedSections.skills ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Core Competencies ({tailoredResume.tailored_skills.length})
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEditMode('skills')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit section"
                        >
                          {editMode.skills ? <Save size={18} className="text-blue-400" /> : <Edit size={18} className="text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleCopy(tailoredResume.tailored_skills.join(', '), 'tail-skills')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedSection === 'tail-skills' ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedSections.skills && (
                      <div
                        className={`glass rounded-xl p-4 border border-white/20 cursor-pointer ${
                          highlightedSection?.type === 'skills' ? 'highlight-tailored' : ''
                        }`}
                        onClick={() => handleSectionClick('skills')}
                      >
                        {editMode.skills ? (
                          <textarea
                            value={editedContent.skills || tailoredResume.tailored_skills.join(', ')}
                            onChange={(e) => setEditedContent(prev => ({ ...prev, skills: e.target.value }))}
                            className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 min-h-[100px]"
                            placeholder="Enter skills separated by commas"
                            rows={4}
                          />
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(editedContent.skills ? editedContent.skills.split(',').map(s => s.trim()) : tailoredResume.tailored_skills).map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/15 text-white rounded-full text-sm font-medium border border-white/20">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Tailored Experience */}
                {tailoredResume.tailored_experience && tailoredResume.tailored_experience.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/20">
                      <button
                        onClick={() => toggleSection('experience')}
                        className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                      >
                        {expandedSections.experience ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Professional Experience
                      </button>
                      <button
                        onClick={() => handleCopy(JSON.stringify(tailoredResume.tailored_experience, null, 2), 'tail-experience')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'tail-experience' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    {expandedSections.experience && (
                      <div className="space-y-4">
                        {tailoredResume.tailored_experience.map((exp: any, idx: number) => (
                          <div
                            key={idx}
                            className={`glass rounded-xl p-4 border border-white/20 cursor-pointer ${
                              highlightedSection?.type === 'experience' && highlightedSection?.index === idx
                                ? 'highlight-tailored'
                                : ''
                            }`}
                            onClick={() => handleSectionClick('experience', idx)}
                          >
                            <h4 className="font-bold text-white text-base mb-1">{exp.header || exp.title}</h4>
                            {exp.location && (
                              <p className="text-gray-300 text-sm mb-1">{exp.location}</p>
                            )}
                            {exp.dates && (
                              <p className="text-gray-400 text-sm mb-3">{exp.dates}</p>
                            )}
                            {exp.bullets && exp.bullets.length > 0 && (
                              <ul className="space-y-2 text-sm">
                                {exp.bullets.map((bullet: string, bulletIdx: number) => (
                                  <li key={bulletIdx} className="text-gray-300 flex gap-2">
                                    <span className="text-white/40 flex-shrink-0">•</span>
                                    <span>{bullet}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Education */}
                {tailoredResume.tailored_education && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/20">
                      <button
                        onClick={() => toggleSection('education')}
                        className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                      >
                        {expandedSections.education ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Education
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEditMode('education')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit section"
                        >
                          {editMode.education ? <Save size={18} className="text-blue-400" /> : <Edit size={18} className="text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleCopy(tailoredResume.tailored_education, 'tail-education')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedSection === 'tail-education' ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedSections.education && (
                      <div
                        className={`glass rounded-xl p-4 border border-white/20 cursor-pointer ${
                          highlightedSection?.type === 'education' ? 'highlight-tailored' : ''
                        }`}
                        onClick={() => handleSectionClick('education')}
                      >
                        {editMode.education ? (
                          <textarea
                            value={editedContent.education || tailoredResume.tailored_education}
                            onChange={(e) => setEditedContent(prev => ({ ...prev, education: e.target.value }))}
                            className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 min-h-[80px]"
                            rows={3}
                          />
                        ) : (
                          <p className="text-gray-300">{editedContent.education || tailoredResume.tailored_education}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Certifications */}
                {tailoredResume.tailored_certifications && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/20">
                      <button
                        onClick={() => toggleSection('certifications')}
                        className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                      >
                        {expandedSections.certifications ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Certifications & Training
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEditMode('certifications')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit section"
                        >
                          {editMode.certifications ? <Save size={18} className="text-blue-400" /> : <Edit size={18} className="text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleCopy(tailoredResume.tailored_certifications, 'tail-certifications')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedSection === 'tail-certifications' ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedSections.certifications && (
                      <div
                        className={`glass rounded-xl p-4 border border-white/20 cursor-pointer ${
                          highlightedSection?.type === 'certifications' ? 'highlight-tailored' : ''
                        }`}
                        onClick={() => handleSectionClick('certifications')}
                      >
                        {editMode.certifications ? (
                          <textarea
                            value={editedContent.certifications || tailoredResume.tailored_certifications}
                            onChange={(e) => setEditedContent(prev => ({ ...prev, certifications: e.target.value }))}
                            className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 min-h-[80px]"
                            rows={3}
                          />
                        ) : (
                          <p className="text-gray-300 whitespace-pre-line">{editedContent.certifications || tailoredResume.tailored_certifications}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Alignment Statement */}
                {tailoredResume.alignment_statement && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-white/20">
                      <button
                        onClick={() => toggleSection('alignment')}
                        className="flex items-center gap-2 text-lg font-bold text-white hover:text-gray-300 transition-colors"
                      >
                        {expandedSections.alignment ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Company Alignment
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEditMode('alignment')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit section"
                        >
                          {editMode.alignment ? <Save size={18} className="text-blue-400" /> : <Edit size={18} className="text-gray-400" />}
                        </button>
                        <button
                          onClick={() => handleCopy(tailoredResume.alignment_statement, 'tail-alignment')}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedSection === 'tail-alignment' ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedSections.alignment && (
                      <div
                        className={`glass rounded-xl p-4 border border-white/20 cursor-pointer ${
                          highlightedSection?.type === 'alignment' ? 'highlight-tailored' : ''
                        }`}
                        onClick={() => handleSectionClick('alignment')}
                      >
                        {editMode.alignment ? (
                          <textarea
                            value={editedContent.alignment || tailoredResume.alignment_statement}
                            onChange={(e) => setEditedContent(prev => ({ ...prev, alignment: e.target.value }))}
                            className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 min-h-[80px]"
                            rows={3}
                          />
                        ) : (
                          <p className="text-gray-400">{editedContent.alignment || tailoredResume.alignment_statement}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            )}
            </div>
            </>
          )}

          {/* Tab Content: AI Analysis & Insights */}
          {activeTab === 'analysis' && (
            <div className="mb-6">
              <ResumeAnalysis analysis={analysis} loading={loadingAnalysis} />
            </div>
          )}

          {/* Tab Content: Match & Keywords */}
          {activeTab === 'insights' && (
            <div className="space-y-8">
              <MatchScore matchScore={matchScore} loading={loadingAnalysis} />
              <KeywordPanel keywords={keywords} loading={loadingAnalysis} />
            </div>
          )}

          {/* Print-Only Resume View */}
          <div id="print-resume" className="hidden">
            <div className="max-w-4xl mx-auto bg-white p-8">
              {/* Header */}
              <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {tailoredResume.company ? `Resume for ${tailoredResume.company}` : 'Tailored Resume'}
                </h1>
                {tailoredResume.title && (
                  <h2 className="text-2xl text-gray-700">{tailoredResume.title}</h2>
                )}
              </div>

              {/* Professional Summary */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-400 pb-2">
                  PROFESSIONAL SUMMARY
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  {editedContent.summary || tailoredResume.tailored_summary}
                </p>
              </div>

              {/* Core Competencies */}
              {tailoredResume.tailored_skills && tailoredResume.tailored_skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-400 pb-2">
                    CORE COMPETENCIES
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {(editedContent.skills ? editedContent.skills.split(',').map(s => s.trim()) : tailoredResume.tailored_skills).map((skill, idx) => (
                      <div key={idx} className="text-gray-800 text-sm">
                        • {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Experience */}
              {tailoredResume.tailored_experience && tailoredResume.tailored_experience.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-400 pb-2">
                    PROFESSIONAL EXPERIENCE
                  </h3>
                  <div className="space-y-4">
                    {tailoredResume.tailored_experience.map((exp: any, idx: number) => (
                      <div key={idx} className="mb-4">
                        <h4 className="font-bold text-gray-900 text-lg mb-1">
                          {exp.header || exp.title || exp.position || 'Position'}
                        </h4>
                        {exp.location && (
                          <p className="text-gray-700 text-sm mb-1">{exp.location}</p>
                        )}
                        {exp.dates && (
                          <p className="text-gray-600 text-sm mb-2">{exp.dates}</p>
                        )}
                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="space-y-1">
                            {exp.bullets.map((bullet: string, bulletIdx: number) => (
                              <li key={bulletIdx} className="text-gray-800 text-sm ml-4">
                                • {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {tailoredResume.tailored_education && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-400 pb-2">
                    EDUCATION
                  </h3>
                  <p className="text-gray-800">
                    {editedContent.education || tailoredResume.tailored_education}
                  </p>
                </div>
              )}

              {/* Certifications */}
              {tailoredResume.tailored_certifications && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-400 pb-2">
                    CERTIFICATIONS & TRAINING
                  </h3>
                  <p className="text-gray-800 whitespace-pre-line">
                    {editedContent.certifications || tailoredResume.tailored_certifications}
                  </p>
                </div>
              )}

              {/* Alignment Statement */}
              {tailoredResume.alignment_statement && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-400 pb-2">
                    COMPANY ALIGNMENT
                  </h3>
                  <p className="text-gray-800">
                    {editedContent.alignment || tailoredResume.alignment_statement}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center">
            <button
              onClick={() => navigate(`/interview-prep/${tailoredResume.id}`)}
              className="btn-primary flex items-center gap-3 text-lg bg-purple-600 hover:bg-purple-700"
            >
              <Briefcase className="w-5 h-5" />
              View Interview Prep
            </button>
            <button
              onClick={() => handleDownloadResume('docx')}
              className="btn-primary flex items-center gap-3 text-lg"
            >
              <Download className="w-5 h-5" />
              Download Tailored Resume
            </button>
            <button
              onClick={resetForm}
              className="btn-secondary text-lg"
            >
              Create Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <ThemeToggle />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <h1 className="text-6xl font-bold text-white mb-6">
            Talor
          </h1>
          <p className="text-xl text-gray-400">
            AI-powered resume customization for every job application
          </p>
        </div>

        {error && (
          <div className="mb-16 p-5 glass border-2 border-red-500/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-white text-lg">Error</p>
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Resume Selection */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl text-white">Select Base Resume</h2>
          </div>

          {/* Bulk Actions */}
          <div className="max-w-3xl mx-auto">
          {resumes.length > 0 && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                >
                  {selectedResumeIds.size === resumes.length ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {selectedResumeIds.size === resumes.length ? 'Deselect All' : 'Select All'}
                  </span>
                </button>
                {selectedResumeIds.size > 0 && (
                  <span className="text-sm text-gray-400">
                    {selectedResumeIds.size} selected
                  </span>
                )}
              </div>
              {selectedResumeIds.size > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  disabled={deletingBulk}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deletingBulk ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-medium">Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span className="text-sm font-medium">Delete Selected ({selectedResumeIds.size})</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {loadingResumes ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
              <span className="ml-3 text-gray-400 text-lg">Loading resumes...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-xl">
              <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 mb-6 text-lg">No resumes uploaded yet</p>
              <a href="/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-xl text-white font-semibold text-lg transition-all">
                Upload a resume to get started →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`block p-6 border-2 rounded-xl transition-all ${
                    selectedResumeId === resume.id
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/20 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox for bulk selection */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleResumeSelection(resume.id)
                      }}
                      className="mt-1 flex-shrink-0"
                    >
                      {selectedResumeIds.has(resume.id) ? (
                        <CheckSquare className="w-5 h-5 text-white" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                      )}
                    </button>

                    {/* Resume content - clickable to select */}
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="resume"
                        value={resume.id}
                        checked={selectedResumeId === resume.id}
                        onChange={() => setSelectedResumeId(resume.id)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-white text-lg mb-2">{resume.filename}</p>
                          {resume.summary && (
                            <p className="text-gray-400 line-clamp-2 mb-3">
                              {resume.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-4 h-4" />
                              {resume.skills_count} skills
                            </span>
                            <span>•</span>
                            <span>Uploaded {new Date(resume.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {selectedResumeId === resume.id && (
                        <div className="p-2 bg-white/10 rounded-full">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDeleteResume(resume.id, e)}
                        disabled={deletingResumeId === resume.id}
                        className="p-2 hover:bg-red-500/20 rounded-full transition-colors disabled:opacity-50"
                        title="Delete resume"
                      >
                        {deletingResumeId === resume.id ? (
                          <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5 text-red-400 hover:text-red-300" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>

        {/* Job Details */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl text-white">Job Details</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-10">
            <div>
              <label className="block text-base font-bold text-white mb-4">
                Job URL (LinkedIn, Indeed, Company Site)
              </label>
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://www.linkedin.com/jobs/view/... or https://jobs.microsoft.com/..."
                className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl focus:ring-4 focus:ring-white/20 focus:border-white/40 transition-all text-lg text-white placeholder-gray-500"
              />
              <p className="text-sm text-gray-400 mt-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Just paste the URL - we'll automatically extract company name, job title, and full description.
                If extraction fails, provide company or job title below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-base font-bold text-white mb-4">
                  Company Name (Optional - Fallback)
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="JPMorgan Chase"
                  className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl focus:ring-4 focus:ring-white/20 focus:border-white/40 transition-all text-lg text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Provide if URL extraction fails or no URL available
                </p>
              </div>

              <div>
                <label className="block text-base font-bold text-white mb-4">
                  Job Title (Optional - Fallback)
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Lead Technical Program Manager"
                  className="w-full px-5 py-4 bg-white/5 border-2 border-white/20 rounded-xl focus:ring-4 focus:ring-white/20 focus:border-white/40 transition-all text-lg text-white placeholder-gray-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Provide if URL extraction fails or no URL available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tailor Button */}
        <div className="max-w-3xl mx-auto">
        <button
          onClick={handleTailor}
          disabled={loading || !selectedResumeId}
          className={`w-full py-6 rounded-2xl font-bold text-xl transition-all ${
            loading || !selectedResumeId
              ? 'bg-white/10 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating tailored resume with AI...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6" />
              Generate Tailored Resume
              <ArrowRight className="w-6 h-6" />
            </span>
          )}
        </button>
        </div>
      </div>
    </div>
  )
}
