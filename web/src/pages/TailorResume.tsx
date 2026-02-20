import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Target, Loader2, CheckCircle2, AlertCircle, FileText, Sparkles, ArrowRight, Download, Trash2, CheckSquare, Square, Briefcase, Link2, Unlink2, Copy, Check, Edit, ChevronDown, ChevronRight, ChevronUp, Mail, FileDown, Printer, PlayCircle, Save, RotateCcw, Bookmark, X, Plus } from 'lucide-react'
import { api, getApiHeaders } from '../api/client'
import { showSuccess, showError } from '../utils/toast'
import ChangeExplanation from '../components/ChangeExplanation'
import ResumeAnalysis from '../components/ResumeAnalysis'
import KeywordPanel from '../components/KeywordPanel'
import MatchScore from '../components/MatchScore'
import AILoadingScreen from '../components/AILoadingScreen'
import { useResumeStore } from '../stores/resumeStore'
import { usePostHog } from '../contexts/PostHogContext'

// LocalStorage keys for persisting tailor session
const LAST_TAILORED_RESUME_KEY = 'tailor_last_viewed_resume'
const TAILOR_SESSION_KEY = 'tailor_session_data'

interface BaseResume {
  id: number
  filename: string

  // Contact Information (ATS Required)
  name?: string
  email?: string
  phone?: string
  linkedin?: string
  location?: string

  // Resume Sections
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
  const { capture } = usePostHog()

  // Resume state from Zustand store
  const { resumes, fetchResumes, deleteResume: deleteResumeFromStore, loading: storeLoadingResumes } = useResumeStore()

  const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null)
  const [selectedResume, setSelectedResume] = useState<BaseResume | null>(null)
  const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null)
  const [jobUrl, setJobUrl] = useState('')
  const [company, setCompany] = useState('')
  const [jobTitle, setJobTitle] = useState('')

  // URL extraction states
  const [extractionAttempted, setExtractionAttempted] = useState(false)
  const [companyExtracted, setCompanyExtracted] = useState(false)
  const [titleExtracted, setTitleExtracted] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [extractionError, setExtractionError] = useState<{company?: string; title?: string}>({})

  const [loading, setLoading] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const loadingResumes = storeLoadingResumes
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showSaveWarning, setShowSaveWarning] = useState(false)
  const [savingFromWarning, setSavingFromWarning] = useState(false)
  const [deletingResumeId, setDeletingResumeId] = useState<number | null>(null)
  const [selectedResumeIds, setSelectedResumeIds] = useState<Set<number>>(new Set())
  const [deletingBulk, setDeletingBulk] = useState(false)

  // Enhancement states
  const [showChanges, setShowChanges] = useState(true)
  const [syncScroll, setSyncScroll] = useState(true)
  const [activeSection, setActiveSection] = useState<string>('summary')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
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
  const [editedSkills, setEditedSkills] = useState<string[] | null>(null)
  const [editedExperience, setEditedExperience] = useState<any[] | null>(null)
  const [newSkill, setNewSkill] = useState('')
  const [savingSection, setSavingSection] = useState<string | null>(null)
  const [titleOptionsOpen, setTitleOptionsOpen] = useState<number | null>(null)
  const [customTitleEdit, setCustomTitleEdit] = useState<{ index: number; value: string } | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
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
    fetchResumes()

    // Track page view
    capture('page_viewed', {
      page_name: 'Tailor Resume',
      page_type: 'core_feature',
    })
  }, [fetchResumes])

  useEffect(() => {
    if (selectedResumeId) {
      loadFullResume(selectedResumeId)
    }
  }, [selectedResumeId])

  // Mobile and tablet detection
  useEffect(() => {
    const checkDeviceSize = () => {
      const width = window.innerWidth
      setIsMobile(width < 768)
      setIsTablet(width >= 768 && width < 1024)
    }
    checkDeviceSize()
    window.addEventListener('resize', checkDeviceSize)
    return () => window.removeEventListener('resize', checkDeviceSize)
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
  // This makes the page load instantly instead of waiting for analysis
  // Analysis will load when user clicks the Analysis or Insights tabs

  // Load saved comparison from URL parameter
  useEffect(() => {
    const loadSavedComparison = async () => {
      const comparisonId = searchParams.get('comparison')
      if (comparisonId && !tailoredResume && !loading) {
        console.log('Loading saved comparison:', comparisonId)
        const controller = new AbortController()
        const tid = setTimeout(() => controller.abort(), 30_000)
        try {
          const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

          const response = await fetch(`${API_BASE_URL}/api/saved-comparisons/${comparisonId}`, {
            headers: getApiHeaders({ 'Content-Type': 'application/json' }),
            signal: controller.signal,
          })
          clearTimeout(tid)

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
          setIsSaved(true)
        } catch (err: any) {
          console.error('Error loading saved comparison:', err)
          setError('Failed to load saved comparison')
        }
      }
    }
    loadSavedComparison()
  }, [searchParams])

  // Load tailored resume from URL parameter (from BatchTailor "View Result" button)
  useEffect(() => {
    const resumeId = searchParams.get('resumeId')
    if (resumeId && !tailoredResume && !loading) {
      console.log('Loading tailored resume from URL param:', resumeId)
      loadTailoredResumeById(parseInt(resumeId))
    }
  }, [searchParams])

  // Restore session from localStorage on mount (takes priority over API calls)
  useEffect(() => {
    const restoreSession = () => {
      // Don't restore if loading from URL comparison or resumeId parameter
      const comparisonId = searchParams.get('comparison')
      const resumeId = searchParams.get('resumeId')
      if (comparisonId || resumeId) {
        console.log('Skipping session restore - loading from URL parameter')
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
      // Don't restore if loading from URL parameter
      const comparisonId = searchParams.get('comparison')
      const resumeId = searchParams.get('resumeId')
      if (comparisonId || resumeId) return

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
    const isEnteringEditMode = !editMode[section]

    if (isEnteringEditMode) {
      // Initialize edited arrays when entering edit mode
      if (section === 'skills' && tailoredResume) {
        setEditedSkills([...tailoredResume.tailored_skills])
      }
      if (section === 'experience' && tailoredResume) {
        setEditedExperience(JSON.parse(JSON.stringify(tailoredResume.tailored_experience)))
      }
    } else {
      // Clear edited arrays when exiting edit mode (without saving)
      if (section === 'skills') {
        setEditedSkills(null)
        setNewSkill('')
      }
      if (section === 'experience') {
        setEditedExperience(null)
      }
    }

    setEditMode(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Skills editing helper functions
  const deleteSkill = (index: number) => {
    if (editedSkills) {
      setEditedSkills(editedSkills.filter((_, i) => i !== index))
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && editedSkills) {
      setEditedSkills([...editedSkills, newSkill.trim()])
      setNewSkill('')
    }
  }

  // Experience editing helper functions
  const updateExperience = (index: number, field: string, value: any) => {
    if (editedExperience) {
      const updated = [...editedExperience]
      updated[index] = { ...updated[index], [field]: value }
      setEditedExperience(updated)
    }
  }

  const updateExperienceBullet = (expIndex: number, bulletIndex: number, value: string) => {
    if (editedExperience) {
      const updated = [...editedExperience]
      const bullets = [...(updated[expIndex].bullets || [])]
      bullets[bulletIndex] = value
      updated[expIndex] = { ...updated[expIndex], bullets }
      setEditedExperience(updated)
    }
  }

  const deleteExperienceBullet = (expIndex: number, bulletIndex: number) => {
    if (editedExperience) {
      const updated = [...editedExperience]
      const bullets = [...(updated[expIndex].bullets || [])]
      bullets.splice(bulletIndex, 1)
      updated[expIndex] = { ...updated[expIndex], bullets }
      setEditedExperience(updated)
    }
  }

  const addExperienceBullet = (expIndex: number) => {
    if (editedExperience) {
      const updated = [...editedExperience]
      const bullets = [...(updated[expIndex].bullets || []), '']
      updated[expIndex] = { ...updated[expIndex], bullets }
      setEditedExperience(updated)
    }
  }

  // Title option selection - updates the header with the chosen title and saves immediately
  const selectTitleOption = async (expIndex: number, selectedTitle: string) => {
    if (!tailoredResume) return

    const updatedExperience = JSON.parse(JSON.stringify(tailoredResume.tailored_experience))
    const exp = updatedExperience[expIndex]

    // Extract company/location/dates from the existing header (after the " – " separator)
    const currentHeader = exp.header || ''
    const dashIndex = currentHeader.indexOf(' – ')
    const suffix = dashIndex !== -1 ? currentHeader.substring(dashIndex) : ''

    // Build new header with selected title
    exp.header = selectedTitle + suffix

    // Update local state immediately
    setTailoredResume((prev: any) => prev ? { ...prev, tailored_experience: updatedExperience } : prev)
    setTitleOptionsOpen(null)
    setCustomTitleEdit(null)

    // Save to backend
    try {
      await api.updateTailoredResume(tailoredResume.id, { experience: updatedExperience })
    } catch (err) {
      console.error('[TailorResume] Failed to save title selection:', err)
    }
  }

  const saveCustomTitle = (expIndex: number) => {
    if (customTitleEdit && customTitleEdit.value.trim()) {
      selectTitleOption(expIndex, customTitleEdit.value.trim())
    }
  }

  const saveEdit = async (section: string) => {
    if (!tailoredResume) return

    // Check if there are actual edits to save
    const hasStringEdits = editedContent[section] !== undefined
    const hasSkillsEdits = section === 'skills' && editedSkills !== null
    const hasExperienceEdits = section === 'experience' && editedExperience !== null

    if (!hasStringEdits && !hasSkillsEdits && !hasExperienceEdits) {
      toggleEditMode(section)
      return
    }

    setSavingSection(section)

    try {
      // Build the update payload based on which section was edited
      const updatePayload: Record<string, any> = {}

      if (section === 'summary' && editedContent.summary !== undefined) {
        updatePayload.summary = editedContent.summary
      }
      if (section === 'skills' && editedSkills !== null) {
        updatePayload.competencies = editedSkills.filter(s => s.trim())
      }
      if (section === 'experience' && editedExperience !== null) {
        updatePayload.experience = editedExperience
      }
      if (section === 'alignment' && editedContent.alignment !== undefined) {
        updatePayload.alignment_statement = editedContent.alignment
      }

      // Only call API if there's something to update
      if (Object.keys(updatePayload).length > 0) {
        const response = await api.updateTailoredResume(tailoredResume.id, updatePayload)

        if (response.data.success) {
          // Update local state with saved values
          setTailoredResume(prev => {
            if (!prev) return prev
            return {
              ...prev,
              tailored_summary: response.data.summary || prev.tailored_summary,
              tailored_skills: response.data.competencies || prev.tailored_skills,
              tailored_experience: response.data.experience || prev.tailored_experience,
              alignment_statement: response.data.alignment_statement || prev.alignment_statement
            }
          })
        }
      }

      // Clear edited state
      if (section === 'skills') {
        setEditedSkills(null)
        setNewSkill('')
      }
      if (section === 'experience') {
        setEditedExperience(null)
      }

      setEditMode(prev => ({ ...prev, [section]: false }))
    } catch (error) {
      console.error('Failed to save edit:', error)
      // Still toggle edit mode on error so user isn't stuck
      setEditMode(prev => ({ ...prev, [section]: false }))
    } finally {
      setSavingSection(null)
    }
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
    if (!tailoredResume?.id) {
      showError('Please tailor a resume first')
      return
    }
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

  // Auto-select first resume when resumes are loaded
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id)
    }
  }, [resumes, selectedResumeId])

  // Load a tailored resume by ID (for restoring from localStorage)
  const loadTailoredResumeById = async (tailoredId: number) => {
    // Race the entire restore operation against a 30-second deadline.
    // This covers both the tailored-resume fetch AND the loadFullResume fetch.
    const TIMEOUT_MS = 30_000

    const doRestore = async (signal: AbortSignal) => {
      const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

      const response = await fetch(`${API_BASE_URL}/api/tailor/tailored/${tailoredId}`, {
        headers: getApiHeaders(),
        signal,
      })

      if (!response.ok) {
        if (response.status === 404) {
          localStorage.removeItem(LAST_TAILORED_RESUME_KEY)
          throw new Error('Saved resume no longer exists')
        }
        throw new Error('Failed to load saved resume')
      }

      // Safe JSON parsing
      let data: any
      try {
        const text = await response.text()
        data = JSON.parse(text)
      } catch {
        throw new Error('Server returned an invalid response. Please try again.')
      }

      // Load the base resume (also bounded by the same abort signal deadline)
      await loadFullResume(data.base_resume_id)
      setSelectedResumeId(data.base_resume_id)

      // Backend GET /tailored/{id} returns: summary, competencies, experience
      setTailoredResume({
        id: data.id,
        tailored_summary: data.summary || data.tailored_summary || '',
        tailored_skills: data.competencies || data.tailored_skills || [],
        tailored_experience: data.experience || data.tailored_experience || [],
        tailored_education: data.education || data.tailored_education || '',
        tailored_certifications: data.certifications || data.tailored_certifications || '',
        alignment_statement: data.alignment_statement || '',
        quality_score: data.quality_score || 95,
        docx_path: data.docx_path,
        company: data.company || data.job?.company || 'Unknown Company',
        title: data.title || data.job?.title || 'Unknown Position'
      })

      setCompany(data.company || data.job?.company || '')
      setJobTitle(data.title || data.job?.title || '')
      setJobUrl(data.url || data.job?.url || '')

      setShowComparison(true)
      setSuccess(true)
      console.log('Successfully restored tailored resume:', tailoredId)

      // Signal completion so progress bar reaches 100% before unmount
      setLoadingComplete(true)
      await new Promise(r => setTimeout(r, 600))
      setLoadingComplete(false)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      setLoading(true)
      await doRestore(controller.signal)
    } catch (err: any) {
      console.error('Error loading tailored resume:', err)
      const message = err.name === 'AbortError'
        ? 'Loading saved resume timed out. Please try again.'
        : err.message
      setError(message)
      localStorage.removeItem(LAST_TAILORED_RESUME_KEY)
      // Clear stale ?resumeId= from URL so user doesn't keep hitting this error
      const params = new URLSearchParams(window.location.search)
      if (params.has('resumeId')) {
        params.delete('resumeId')
        const newUrl = params.toString() ? `${window.location.pathname}?${params}` : window.location.pathname
        window.history.replaceState({}, '', newUrl)
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }

  // New AI analysis functions - OPTIMIZED with caching and parallel execution
  const loadAllAnalysis = async (tailoredResumeId: number, forceRefresh: boolean = false) => {
    if (!tailoredResumeId) return

    setLoadingAnalysis(true)
    setAnalysisProgress(forceRefresh ? 'Refreshing AI analysis...' : 'Loading AI analysis...')
    setAnalysisEstimate(forceRefresh ? 60 : 5) // Much faster if cached

    try {
      const result = await api.analyzeAll(tailoredResumeId, forceRefresh)

      if (result.success && result.data) {
        const data = result.data

        // Set all results at once
        if (data.analysis) setAnalysis(data.analysis)
        if (data.keywords) setKeywords(data.keywords)
        if (data.match_score) setMatchScore(data.match_score)

        // Show cache status
        if (data.cached) {
          setAnalysisProgress(`Analysis loaded from cache (${data.elapsed_seconds?.toFixed(2)}s)`)
        } else {
          setAnalysisProgress(`Analysis complete (${data.elapsed_seconds?.toFixed(1)}s)`)
        }
      } else {
        throw new Error(result.error || 'Failed to load analysis')
      }

      setAnalysisEstimate(0)
    } catch (error) {
      console.error('Error loading analysis:', error)
      setAnalysisProgress('Error loading analysis')
    } finally {
      setLoadingAnalysis(false)
    }
  }

  const handleDownloadResume = async (format: 'pdf' | 'docx') => {
    if (!tailoredResume?.id) {
      showError('Please tailor a resume first')
      return
    }

    try {
      console.log(`Downloading resume ${tailoredResume.id} as ${format}...`)
      const result = await api.exportResumeAnalysis(tailoredResume.id, format)

      if (result.success && result.data) {
        const url = window.URL.createObjectURL(result.data)
        const a = document.createElement('a')
        a.href = url

        // Generate filename based on company and title
        const companyName = tailoredResume.company?.replace(/[^a-zA-Z0-9]/g, '_') || 'Tailored'
        const filename = `${companyName}_Resume.${format}`

        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        console.log(`Resume downloaded successfully: ${filename}`)
      } else {
        console.error('Export failed:', result.error)
        showError(result.error || 'Error downloading resume')
      }
    } catch (error) {
      console.error('Error downloading resume:', error)
      showError('Error downloading resume')
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

      // Use store method which handles API call and state update
      const success = await deleteResumeFromStore(resumeId)

      if (!success) {
        throw new Error('Failed to delete resume')
      }

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

  // Extract job details from URL
  const handleExtractJobDetails = async () => {
    const trimmedUrl = jobUrl.trim()

    if (!trimmedUrl) {
      setExtractionError({ company: 'Please enter a job URL first', title: 'Please enter a job URL first' })
      return
    }

    setExtracting(true)
    setExtractionAttempted(false)
    setExtractionError({})

    try {
      const result = await api.extractJobDetails(trimmedUrl)

      if (!result.success) {
        // Extraction failed completely
        setExtractionAttempted(true)
        setCompanyExtracted(false)
        setTitleExtracted(false)
        setExtractionError({
          company: 'Could not extract company name. Please enter it manually.',
          title: 'Could not extract job title. Please enter it manually.'
        })
        return
      }

      // Check what was extracted
      const extractedCompany = result.data.company || result.data.Company || ''
      const extractedTitle = result.data.job_title || result.data.title || result.data.Title || ''

      setExtractionAttempted(true)

      // Update states based on what was extracted
      if (extractedCompany) {
        setCompany(extractedCompany)
        setCompanyExtracted(true)
      } else {
        setCompanyExtracted(false)
        setExtractionError(prev => ({
          ...prev,
          company: 'Could not extract company name. Please enter it manually.'
        }))
      }

      if (extractedTitle) {
        setJobTitle(extractedTitle)
        setTitleExtracted(true)
      } else {
        setTitleExtracted(false)
        setExtractionError(prev => ({
          ...prev,
          title: 'Could not extract job title. Please enter it manually.'
        }))
      }

      console.log('Extraction result:', { company: extractedCompany, title: extractedTitle })
    } catch (err: any) {
      console.error('Extraction error:', err)
      setExtractionAttempted(true)
      setCompanyExtracted(false)
      setTitleExtracted(false)
      setExtractionError({
        company: 'Extraction failed. Please enter company name manually.',
        title: 'Extraction failed. Please enter job title manually.'
      })
    } finally {
      setExtracting(false)
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

    // Validate required fields
    if (!trimmedJobUrl) {
      setError('Please enter a job URL')
      return
    }

    // Require extraction to be attempted first
    if (!extractionAttempted) {
      setError('Please click "Extract Details" to extract company name and job title from the URL first')
      // Auto-trigger extraction for user convenience
      await handleExtractJobDetails()
      return
    }

    // Validate that missing fields are filled after extraction
    if (!companyExtracted && !trimmedCompany) {
      setError('Company name is required. Please enter it manually.')
      return
    }
    if (!titleExtracted && !trimmedJobTitle) {
      setError('Job title is required. Please enter it manually.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)
    setShowComparison(false)

    try {
      // Only include jobUrl when company/jobTitle weren't already extracted.
      // If both are known, omit the URL to skip redundant Firecrawl re-extraction
      // in the backend (saves 10-20 seconds and avoids duplicate scraping costs).
      const shouldSendJobUrl = trimmedJobUrl && (!companyExtracted || !titleExtracted)

      console.log('[handleTailor] Calling api.tailorResume...', {
        baseResumeId: selectedResumeId,
        jobUrl: shouldSendJobUrl ? trimmedJobUrl : undefined,
        company: trimmedCompany,
        jobTitle: trimmedJobTitle,
      })

      const result = await api.tailorResume({
        baseResumeId: selectedResumeId,
        jobUrl: shouldSendJobUrl ? trimmedJobUrl : undefined,
        company: trimmedCompany || undefined,
        jobTitle: trimmedJobTitle || undefined,
      })

      console.log('[handleTailor] API response received:', { success: result.success, error: result.error, hasData: !!result.data })

      if (!result.success) {
        throw new Error(result.error || 'Failed to tailor resume')
      }

      // Set tailored resume data
      const tailoredId = result.data.tailored_resume_id
      console.log('[handleTailor] Setting tailored resume, id:', tailoredId)
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

      // Track successful resume tailoring
      capture('resume_tailored', {
        page_name: 'Tailor Resume',
        company: result.data.company || company,
        job_title: result.data.title || jobTitle,
        has_job_url: !!trimmedJobUrl,
      })

      // Signal completion so progress bar reaches 100% before unmount
      setLoadingComplete(true)
      await new Promise(r => setTimeout(r, 600))
      setLoadingComplete(false)
    } catch (err: any) {
      console.error('[handleTailor] Error caught:', err.message, err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Save comparison for later viewing with AI analysis data
  const saveComparison = async () => {
    if (!tailoredResume?.id) return

    try {
      const result = await api.saveComparison({
        tailored_resume_id: tailoredResume.id,
        title: `${tailoredResume.company} - ${tailoredResume.title}`,
        analysis_data: analysis,
        keywords_data: keywords,
        match_score_data: matchScore
      })

      if (!result.success) {
        throw new Error(result.error || 'Failed to save comparison')
      }

      showSuccess('Comparison saved! View it in the Saved menu.')
      setIsSaved(true)
    } catch (err: any) {
      console.error('Error saving comparison:', err)
      showError('Failed to save comparison')
    }
  }

  const handleSaveAndContinue = async () => {
    setSavingFromWarning(true)
    try {
      if (!tailoredResume?.id) throw new Error('No resume to save')
      const result = await api.saveComparison({
        tailored_resume_id: tailoredResume.id,
        title: `${tailoredResume.company} - ${tailoredResume.title}`,
        analysis_data: analysis,
        keywords_data: keywords,
        match_score_data: matchScore
      })
      if (!result.success) throw new Error(result.error || 'Failed to save')
      setIsSaved(true)
      showSuccess('Comparison saved!')
      setShowSaveWarning(false)
      navigate(`/interview-prep/${tailoredResume.id}`)
    } catch (err: any) {
      console.error('Error saving from warning:', err)
      showError('Failed to save. You can try again or continue without saving.')
    } finally {
      setSavingFromWarning(false)
    }
  }

  const handleInterviewPrepClick = () => {
    if (isSaved) {
      navigate(`/interview-prep/${tailoredResume!.id}`)
    } else {
      setShowSaveWarning(true)
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
    setIsSaved(false)

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
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-3 bg-theme-glass-10 rounded-xl">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-theme" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme">
                  Resume Comparison
                </h1>
                <p className="text-sm sm:text-base text-theme-secondary mt-1">Original vs. Tailored for {tailoredResume.company}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={isSaved ? undefined : saveComparison}
                disabled={isSaved}
                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all min-h-[44px] flex-1 sm:flex-none ${
                  isSaved
                    ? 'bg-green-600/20 text-green-400 border border-green-500/30 cursor-default'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                }`}
                title={isSaved ? 'Comparison saved' : 'Save this comparison for later'}
              >
                {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save Comparison'}</span>
                <span className="sm:hidden">{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={resetForm}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all min-h-[44px] flex-1 sm:flex-none"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="hidden sm:inline">Start New Resume</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>

          {/* Control Bar */}
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 glass rounded-xl p-3 sm:p-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button
                onClick={() => setSyncScroll(!syncScroll)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all min-h-[44px] ${
                  syncScroll ? 'bg-theme-glass-20 text-theme' : 'bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10'
                }`}
                title="Ctrl/Cmd + S"
              >
                {syncScroll ? <Link2 size={18} /> : <Unlink2 size={18} />}
                <span className="text-sm font-medium hidden sm:inline">Sync Scroll</span>
              </button>

              <button
                onClick={() => setShowChanges(!showChanges)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg transition-all min-h-[44px] ${
                  showChanges ? 'bg-green-500/20 text-green-400' : 'bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10'
                }`}
                title="Ctrl/Cmd + C"
              >
                <Sparkles size={18} />
                <span className="text-sm font-medium hidden sm:inline">Show Changes</span>
              </button>

              <div className="hidden sm:block h-6 w-px bg-theme-glass-10"></div>

              <button
                onClick={() => {
                  const allExpanded = Object.values(expandedSections).every(v => v)
                  const newState = Object.keys(expandedSections).reduce<Record<string, boolean>>((acc, key) => ({ ...acc, [key]: !allExpanded }), {})
                  setExpandedSections(newState)
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 transition-all min-h-[44px]"
              >
                {Object.values(expandedSections).every(v => v) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                <span className="text-sm font-medium hidden sm:inline">
                  {Object.values(expandedSections).every(v => v) ? 'Collapse All' : 'Expand All'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 transition-all min-h-[44px]"
              >
                <Printer size={18} />
                <span className="text-sm font-medium hidden sm:inline">Print</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 transition-all min-h-[44px]"
                  title="Ctrl/Cmd + D"
                >
                  <FileDown size={18} />
                  <span className="text-sm font-medium hidden sm:inline">Export</span>
                  <ChevronDown size={16} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-theme rounded-xl shadow-2xl border border-theme-subtle py-2 min-w-[200px] z-10">
                    <button
                      onClick={() => {
                        handleDownloadResume('docx')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-theme hover:bg-theme-glass-10 transition-colors flex items-center gap-3"
                    >
                      <Download size={16} />
                      Word Document (.docx)
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadResume('pdf')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-theme hover:bg-theme-glass-10 transition-colors flex items-center gap-3"
                    >
                      <FileDown size={16} />
                      PDF Document (.pdf)
                    </button>
                    <button
                      onClick={() => {
                        handleCopy(JSON.stringify(tailoredResume, null, 2), 'all')
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-theme hover:bg-theme-glass-10 transition-colors flex items-center gap-3"
                    >
                      <Copy size={16} />
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={() => {
                        sendEmail()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-theme hover:bg-theme-glass-10 transition-colors flex items-center gap-3"
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
                <h3 className="text-xl font-bold text-theme mb-1">Resume Successfully Tailored!</h3>
                <p className="text-theme-secondary">
                  Your resume has been customized for <span className="font-semibold text-theme">{tailoredResume.company}</span> - {tailoredResume.title}
                </p>
                <p className="text-sm text-theme-secondary mt-2">
                  📄 Saved to: <code className="bg-theme-glass-10 px-2 py-1 rounded text-xs">{tailoredResume.docx_path}</code>
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
                    <h3 className="text-lg font-bold text-theme">{analysisProgress}</h3>
                    {analysisEstimate > 0 && (
                      <span className="text-sm text-theme-secondary">
                        ~{analysisEstimate} seconds
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-theme-glass-10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full animate-pulse" style={{ width: '70%' }} />
                  </div>
                  <p className="text-xs text-theme-secondary mt-2">
                    Powered by GPT-4.1-mini • This may take 30-60 seconds
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-4 sm:mb-6 glass rounded-xl border border-theme-muted p-1 sm:p-2">
            <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
              <button
                onClick={() => handleTabChange('comparison')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-3 rounded-lg font-medium transition-all min-h-[44px] ${
                  activeTab === 'comparison'
                    ? 'bg-theme-glass-20 text-theme'
                    : 'text-theme-secondary hover:text-theme hover:bg-theme-glass-5'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Side-by-Side Comparison</span>
                <span className="sm:hidden text-sm">Compare</span>
              </button>
              <button
                onClick={() => handleTabChange('analysis')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-3 rounded-lg font-medium transition-all min-h-[44px] ${
                  activeTab === 'analysis'
                    ? 'bg-theme-glass-20 text-theme'
                    : 'text-theme-secondary hover:text-theme hover:bg-theme-glass-5'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="hidden sm:inline">AI Analysis & Insights</span>
                <span className="sm:hidden text-sm">Analysis</span>
              </button>
              <button
                onClick={() => handleTabChange('insights')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-3 rounded-lg font-medium transition-all min-h-[44px] ${
                  activeTab === 'insights'
                    ? 'bg-theme-glass-20 text-theme'
                    : 'text-theme-secondary hover:text-theme hover:bg-theme-glass-5'
                }`}
              >
                <Target className="w-5 h-5" />
                <span className="hidden sm:inline">Match & Keywords</span>
                <span className="sm:hidden text-sm">Match</span>
              </button>
            </div>
          </div>

          {/* Tab Content: Side-by-Side Comparison */}
          {activeTab === 'comparison' && (
            <>
              {/* Mobile Tab Switcher - Enhanced for better visibility */}
              {isMobile && (
                <div className="mb-6">
                  <div className="glass rounded-xl p-1 border border-theme-subtle">
                    <div className="flex" role="tablist" aria-label="Resume comparison tabs">
                      <button
                        id="original-tab"
                        role="tab"
                        aria-selected={mobileTab === 'original'}
                        aria-controls="original-resume-panel"
                        className={`flex-1 py-3 px-4 text-center font-medium transition-all rounded-lg min-h-[48px] ${
                          mobileTab === 'original'
                            ? 'bg-theme-glass-10 text-theme shadow-lg'
                            : 'text-theme-secondary hover:text-theme-secondary hover:bg-theme-glass-5'
                        }`}
                        onClick={() => setMobileTab('original')}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <FileText className="w-4 h-4" />
                          Original
                        </span>
                      </button>
                      <button
                        id="tailored-tab"
                        role="tab"
                        aria-selected={mobileTab === 'tailored'}
                        aria-controls="tailored-resume-panel"
                        className={`flex-1 py-3 px-4 text-center font-medium transition-all rounded-lg min-h-[48px] ${
                          mobileTab === 'tailored'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'text-theme-secondary hover:text-theme-secondary hover:bg-theme-glass-5'
                        }`}
                        onClick={() => setMobileTab('tailored')}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Tailored
                        </span>
                      </button>
                    </div>
                  </div>
                  <p className="text-center text-xs text-theme-tertiary mt-2">
                    Swipe or tap to switch between versions
                  </p>
                </div>
              )}

              {/* Side-by-Side Comparison */}
              <div className={`${isMobile ? '' : isTablet ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-2 gap-6'}`}>
              {/* Show only selected tab on mobile */}
              {(!isMobile || mobileTab === 'original') && (
                <div
                  id="original-resume-panel"
                  role={isMobile ? "tabpanel" : undefined}
                  aria-labelledby={isMobile ? "original-tab" : undefined}
                  className={`glass rounded-2xl overflow-hidden border border-theme-muted ${isMobile ? 'mb-6' : ''}`}
                >
              <div className="glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="w-6 h-6 text-theme" />
                  <h2 className="text-2xl font-bold text-theme">Original Resume</h2>
                </div>
                <p className="text-theme-secondary text-sm">{selectedResume.filename}</p>
              </div>

              <div
                ref={leftScrollRef}
                onScroll={handleScroll('left')}
                className="p-6 max-h-[70vh] overflow-y-auto"
              >
                {/* Summary */}
                <div id="section-summary" className="mb-10">
                  <div className="flex items-center justify-between mb-4 pb-2">
                    <button
                      onClick={() => toggleSection('summary')}
                      className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                    >
                      {expandedSections.summary ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      Professional Summary
                    </button>
                    <button
                      onClick={() => handleCopy(selectedResume.summary, 'orig-summary')}
                      className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedSection === 'orig-summary' ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} className="text-theme-secondary" />
                      )}
                    </button>
                  </div>
                  {expandedSections.summary && (
                    <div
                      className={`glass rounded-xl p-4 border border-theme-subtle cursor-pointer ${
                        highlightedSection?.type === 'summary' ? 'highlight-original' : ''
                      }`}
                      onClick={() => handleSectionClick('summary')}
                    >
                      <p className="text-theme-secondary leading-relaxed">{selectedResume.summary}</p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {selectedResume.skills && selectedResume.skills.length > 0 && (
                  <div id="section-skills" className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <button
                        onClick={() => toggleSection('skills')}
                        className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                      >
                        {expandedSections.skills ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Skills ({selectedResume.skills.length})
                      </button>
                      <button
                        onClick={() => handleCopy(selectedResume.skills.join(', '), 'orig-skills')}
                        className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'orig-skills' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-theme-secondary" />
                        )}
                      </button>
                    </div>
                    {expandedSections.skills && (
                      <div
                        className={`glass rounded-xl p-4 border border-theme-subtle cursor-pointer ${
                          highlightedSection?.type === 'skills' ? 'highlight-original' : ''
                        }`}
                        onClick={() => handleSectionClick('skills')}
                      >
                        <div className="flex flex-wrap gap-2">
                          {selectedResume.skills.slice(0, 12).map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-theme-glass-10 text-theme rounded-full text-sm">
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
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <button
                        onClick={() => toggleSection('experience')}
                        className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                      >
                        {expandedSections.experience ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Professional Experience
                      </button>
                      <button
                        onClick={() => handleCopy(JSON.stringify(selectedResume.experience, null, 2), 'orig-experience')}
                        className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'orig-experience' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-theme-secondary" />
                        )}
                      </button>
                    </div>
                    {expandedSections.experience && (
                      <div className="space-y-4">
                        {selectedResume.experience.map((exp: any, idx: number) => (
                          <div
                            key={idx}
                            className={`glass rounded-xl p-4 border border-theme-subtle cursor-pointer ${
                              highlightedSection?.type === 'experience' && highlightedSection?.index === idx
                                ? 'highlight-original'
                                : ''
                            }`}
                            onClick={() => handleSectionClick('experience', idx)}
                          >
                            <h4 className="font-bold text-theme text-base mb-1">{exp.header || exp.title}</h4>
                            {exp.location && (
                              <p className="text-theme-secondary text-sm mb-1">{exp.location}</p>
                            )}
                            {exp.dates && (
                              <p className="text-theme-tertiary text-sm mb-3">{exp.dates}</p>
                            )}
                            {exp.bullets && exp.bullets.length > 0 && (
                              <ul className="space-y-2 text-sm">
                                {exp.bullets.map((bullet: string, bulletIdx: number) => (
                                  <li key={bulletIdx} className="text-theme-secondary flex gap-2">
                                    <span className="text-theme-faint flex-shrink-0">•</span>
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
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <button
                        onClick={() => toggleSection('education')}
                        className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                      >
                        {expandedSections.education ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Education
                      </button>
                      <button
                        onClick={() => handleCopy(selectedResume.education, 'orig-education')}
                        className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'orig-education' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-theme-secondary" />
                        )}
                      </button>
                    </div>
                    {expandedSections.education && (
                      <div
                        className={`glass rounded-xl p-4 border border-theme-subtle cursor-pointer ${
                          highlightedSection?.type === 'education' ? 'highlight-original' : ''
                        }`}
                        onClick={() => handleSectionClick('education')}
                      >
                        <p className="text-theme-secondary">{selectedResume.education}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Certifications */}
                {selectedResume.certifications && (
                  <div id="section-certifications">
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <button
                        onClick={() => toggleSection('certifications')}
                        className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                      >
                        {expandedSections.certifications ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Certifications
                      </button>
                      <button
                        onClick={() => handleCopy(selectedResume.certifications, 'orig-certifications')}
                        className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'orig-certifications' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-theme-secondary" />
                        )}
                      </button>
                    </div>
                    {expandedSections.certifications && (
                      <div
                        className={`glass rounded-xl p-4 border border-theme-subtle cursor-pointer ${
                          highlightedSection?.type === 'certifications' ? 'highlight-original' : ''
                        }`}
                        onClick={() => handleSectionClick('certifications')}
                      >
                        <p className="text-theme-secondary whitespace-pre-line">{selectedResume.certifications}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
              )}

            {/* Tailored Resume */}
            {(!isMobile || mobileTab === 'tailored') && (
              <div
                id="tailored-resume-panel"
                role={isMobile ? "tabpanel" : undefined}
                aria-labelledby={isMobile ? "tailored-tab" : undefined}
                className={`glass rounded-2xl overflow-hidden border border-theme-muted ${isMobile ? '' : ''}`}
              >
              <div className="glass p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-theme" />
                  <h2 className="text-2xl font-bold text-theme">Tailored Resume</h2>
                </div>
                <p className="text-theme-secondary text-sm">Customized for {tailoredResume.company}</p>
              </div>

              <div
                ref={rightScrollRef}
                onScroll={handleScroll('right')}
                className="p-6 max-h-[70vh] overflow-y-auto"
              >
                {/* Tailored Summary */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4 pb-2">
                    <button
                      onClick={() => toggleSection('summary')}
                      className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                    >
                      {expandedSections.summary ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      Professional Summary
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => editMode.summary ? saveEdit('summary') : toggleEditMode('summary')}
                        className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                        title={editMode.summary ? "Save changes" : "Edit section"}
                        disabled={savingSection === 'summary'}
                      >
                        {savingSection === 'summary' ? (
                          <Loader2 size={18} className="text-blue-400 animate-spin" />
                        ) : editMode.summary ? (
                          <Save size={18} className="text-blue-400" />
                        ) : (
                          <Edit size={18} className="text-theme-secondary" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCopy(tailoredResume.tailored_summary, 'tail-summary')}
                        className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedSection === 'tail-summary' ? (
                          <Check size={18} className="text-green-500" />
                        ) : (
                          <Copy size={18} className="text-theme-secondary" />
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
                          className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-4 text-theme-secondary min-h-[120px]"
                          rows={6}
                        />
                      ) : (
                        <p className="text-theme-secondary leading-relaxed bg-theme-glass-5 p-4 rounded-lg border border-theme-subtle">
                          {editedContent.summary || tailoredResume.tailored_summary}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Tailored Competencies */}
                {tailoredResume.tailored_skills && tailoredResume.tailored_skills.length > 0 && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <button
                        onClick={() => toggleSection('skills')}
                        className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                      >
                        {expandedSections.skills ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Core Competencies ({tailoredResume.tailored_skills.length})
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editMode.skills ? saveEdit('skills') : toggleEditMode('skills')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title={editMode.skills ? "Save changes" : "Edit section"}
                          disabled={savingSection === 'skills'}
                        >
                          {savingSection === 'skills' ? (
                            <Loader2 size={18} className="text-blue-400 animate-spin" />
                          ) : editMode.skills ? (
                            <Save size={18} className="text-blue-400" />
                          ) : (
                            <Edit size={18} className="text-theme-secondary" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(tailoredResume.tailored_skills.join(', '), 'tail-skills')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedSection === 'tail-skills' ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-theme-secondary" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedSections.skills && (
                      <div
                        className={`glass rounded-xl p-4 border border-theme-muted ${
                          highlightedSection?.type === 'skills' ? 'highlight-tailored' : ''
                        } ${!editMode.skills ? 'cursor-pointer' : ''}`}
                        onClick={() => !editMode.skills && handleSectionClick('skills')}
                      >
                        {editMode.skills ? (
                          <div className="space-y-4">
                            {/* Skills with delete icons */}
                            <div className="flex flex-wrap gap-2">
                              {(editedSkills || tailoredResume.tailored_skills).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-theme-glass-20 text-theme rounded-full text-sm font-medium border border-theme-muted flex items-center gap-2 group"
                                >
                                  {skill}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      deleteSkill(idx)
                                    }}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                                    title="Remove skill"
                                  >
                                    <X size={14} />
                                  </button>
                                </span>
                              ))}
                            </div>
                            {/* Add new skill input */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    addSkill()
                                  }
                                }}
                                placeholder="Add new competency..."
                                className="flex-1 bg-theme-glass-5 border border-theme-muted rounded-lg px-3 py-2 text-theme text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
                              />
                              <button
                                onClick={addSkill}
                                disabled={!newSkill.trim()}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm flex items-center gap-1 transition-colors"
                              >
                                <Plus size={16} />
                                Add
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {tailoredResume.tailored_skills.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 bg-theme-glass-20 text-theme rounded-full text-sm font-medium border border-theme-muted">
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
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <button
                        onClick={() => toggleSection('experience')}
                        className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                      >
                        {expandedSections.experience ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Professional Experience
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editMode.experience ? saveEdit('experience') : toggleEditMode('experience')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title={editMode.experience ? "Save changes" : "Edit section"}
                          disabled={savingSection === 'experience'}
                        >
                          {savingSection === 'experience' ? (
                            <Loader2 size={18} className="text-blue-400 animate-spin" />
                          ) : editMode.experience ? (
                            <Save size={18} className="text-blue-400" />
                          ) : (
                            <Edit size={18} className="text-theme-secondary" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(JSON.stringify(tailoredResume.tailored_experience, null, 2), 'tail-experience')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedSection === 'tail-experience' ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-theme-secondary" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedSections.experience && (
                      <div className="space-y-4">
                        {(editMode.experience ? editedExperience : tailoredResume.tailored_experience)?.map((exp: any, idx: number) => (
                          <div
                            key={idx}
                            className={`glass rounded-xl p-4 border border-theme-muted ${
                              highlightedSection?.type === 'experience' && highlightedSection?.index === idx
                                ? 'highlight-tailored'
                                : ''
                            } ${!editMode.experience ? 'cursor-pointer' : ''}`}
                            onClick={() => !editMode.experience && handleSectionClick('experience', idx)}
                          >
                            {editMode.experience ? (
                              /* Edit Mode */
                              <div className="space-y-3">
                                {/* Title/Header */}
                                <input
                                  type="text"
                                  value={exp.header || exp.title || ''}
                                  onChange={(e) => updateExperience(idx, 'header', e.target.value)}
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg px-3 py-2 text-theme font-bold focus:outline-none focus:border-blue-500"
                                  placeholder="Job Title"
                                />
                                {/* Location */}
                                <input
                                  type="text"
                                  value={exp.location || ''}
                                  onChange={(e) => updateExperience(idx, 'location', e.target.value)}
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg px-3 py-2 text-theme-secondary text-sm focus:outline-none focus:border-blue-500"
                                  placeholder="Company | Location"
                                />
                                {/* Dates */}
                                <input
                                  type="text"
                                  value={exp.dates || ''}
                                  onChange={(e) => updateExperience(idx, 'dates', e.target.value)}
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg px-3 py-2 text-theme-secondary text-sm focus:outline-none focus:border-blue-500"
                                  placeholder="Date Range (e.g., Jan 2020 - Present)"
                                />
                                {/* Bullets */}
                                <div className="space-y-2 mt-3">
                                  <p className="text-xs text-theme-tertiary uppercase tracking-wide">Bullet Points</p>
                                  {(exp.bullets || []).map((bullet: string, bulletIdx: number) => (
                                    <div key={bulletIdx} className="flex gap-2 items-start">
                                      <span className="text-theme-faint mt-2.5 flex-shrink-0">•</span>
                                      <textarea
                                        value={bullet}
                                        onChange={(e) => updateExperienceBullet(idx, bulletIdx, e.target.value)}
                                        className="flex-1 bg-theme-glass-5 border border-theme-muted rounded-lg px-3 py-2 text-theme-secondary text-sm focus:outline-none focus:border-blue-500 min-h-[60px] resize-y"
                                        placeholder="Describe your achievement..."
                                      />
                                      <button
                                        onClick={() => deleteExperienceBullet(idx, bulletIdx)}
                                        className="mt-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full p-1 transition-colors flex-shrink-0"
                                        title="Remove bullet"
                                      >
                                        <X size={16} />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => addExperienceBullet(idx)}
                                    className="w-full py-2 border border-dashed border-theme-muted rounded-lg text-theme-secondary hover:text-theme hover:border-theme-muted text-sm flex items-center justify-center gap-1 transition-colors"
                                  >
                                    <Plus size={14} />
                                    Add Bullet Point
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* View Mode */
                              <>
                                {/* Job Title with options selector */}
                                <div className="mb-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-theme text-base">
                                      {/* Extract just the title part before " – " */}
                                      {(() => {
                                        const header = exp.header || exp.title || ''
                                        const dashIdx = header.indexOf(' – ')
                                        return dashIdx !== -1 ? header.substring(0, dashIdx) : header
                                      })()}
                                    </h4>
                                    {exp.title_options && exp.title_options.length > 1 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setTitleOptionsOpen(titleOptionsOpen === idx ? null : idx)
                                          setCustomTitleEdit(null)
                                        }}
                                        className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
                                        title="Choose from 5 AI-generated title options"
                                      >
                                        <Sparkles size={10} />
                                        {titleOptionsOpen === idx ? 'Close' : '5 Options'}
                                      </button>
                                    )}
                                  </div>
                                  {/* Company suffix from header */}
                                  {(() => {
                                    const header = exp.header || ''
                                    const dashIdx = header.indexOf(' – ')
                                    if (dashIdx !== -1) {
                                      return <p className="text-theme-secondary text-sm">{header.substring(dashIdx)}</p>
                                    }
                                    return null
                                  })()}
                                </div>

                                {/* Title Options Dropdown */}
                                {titleOptionsOpen === idx && exp.title_options && (
                                  <div className="mb-3 mt-2 p-3 rounded-xl bg-theme-glass-5 border border-theme-muted space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                    <p className="text-xs text-theme-tertiary uppercase tracking-wide mb-2 font-medium">Select a title or write your own</p>
                                    {exp.title_options.map((option: string, optIdx: number) => {
                                      const currentHeader = exp.header || ''
                                      const dashIdx = currentHeader.indexOf(' – ')
                                      const currentTitle = dashIdx !== -1 ? currentHeader.substring(0, dashIdx) : currentHeader
                                      const isSelected = option.trim() === currentTitle.trim()
                                      return (
                                        <button
                                          key={optIdx}
                                          onClick={() => selectTitleOption(idx, option)}
                                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                                            isSelected
                                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium'
                                              : 'hover:bg-theme-glass-10 text-theme-secondary hover:text-theme border border-transparent'
                                          }`}
                                        >
                                          {isSelected ? (
                                            <CheckCircle2 size={14} className="text-blue-400 flex-shrink-0" />
                                          ) : (
                                            <span className="w-3.5 h-3.5 rounded-full border border-theme-muted flex-shrink-0" />
                                          )}
                                          <span>{option}</span>
                                        </button>
                                      )
                                    })}
                                    {/* Custom title input */}
                                    <div className="pt-2 mt-1">
                                      {customTitleEdit?.index === idx ? (
                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            value={customTitleEdit.value}
                                            onChange={(e) => setCustomTitleEdit({ index: idx, value: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && saveCustomTitle(idx)}
                                            className="flex-1 bg-theme-glass-5 border border-theme-muted rounded-lg px-3 py-2 text-theme text-sm focus:outline-none focus:border-blue-500"
                                            placeholder="Type your own title..."
                                            autoFocus
                                          />
                                          <button
                                            onClick={() => saveCustomTitle(idx)}
                                            className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={() => setCustomTitleEdit(null)}
                                            className="px-2 py-2 text-theme-tertiary hover:text-theme-secondary rounded-lg text-sm transition-colors"
                                          >
                                            <X size={16} />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            const currentHeader = exp.header || ''
                                            const dashIdx = currentHeader.indexOf(' – ')
                                            const currentTitle = dashIdx !== -1 ? currentHeader.substring(0, dashIdx) : currentHeader
                                            setCustomTitleEdit({ index: idx, value: currentTitle })
                                          }}
                                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-theme-tertiary hover:text-theme-secondary hover:bg-theme-glass-10 transition-all flex items-center gap-2"
                                        >
                                          <Edit size={14} className="flex-shrink-0" />
                                          <span>Write a custom title...</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {exp.location && !exp.header?.includes(exp.location) && (
                                  <p className="text-theme-secondary text-sm mb-1">{exp.location}</p>
                                )}
                                {exp.dates && !exp.header?.includes(exp.dates) && (
                                  <p className="text-theme-secondary text-sm mb-3">{exp.dates}</p>
                                )}
                                {exp.bullets && exp.bullets.length > 0 && (
                                  <ul className="space-y-2 text-sm">
                                    {exp.bullets.map((bullet: string, bulletIdx: number) => (
                                      <li key={bulletIdx} className="text-theme-secondary flex gap-2">
                                        <span className="text-theme-faint flex-shrink-0">•</span>
                                        <span>{bullet}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </>
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
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <button
                        onClick={() => toggleSection('education')}
                        className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                      >
                        {expandedSections.education ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Education
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editMode.education ? toggleEditMode('education') : toggleEditMode('education')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title={editMode.education ? "Done editing" : "Edit section"}
                        >
                          {editMode.education ? (
                            <Save size={18} className="text-blue-400" />
                          ) : (
                            <Edit size={18} className="text-theme-secondary" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(tailoredResume.tailored_education, 'tail-education')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedSection === 'tail-education' ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-theme-secondary" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedSections.education && (
                      <div
                        className={`glass rounded-xl p-4 border border-theme-muted cursor-pointer ${
                          highlightedSection?.type === 'education' ? 'highlight-tailored' : ''
                        }`}
                        onClick={() => handleSectionClick('education')}
                      >
                        {editMode.education ? (
                          <textarea
                            value={editedContent.education || tailoredResume.tailored_education}
                            onChange={(e) => setEditedContent(prev => ({ ...prev, education: e.target.value }))}
                            className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-4 text-theme-secondary min-h-[80px]"
                            rows={3}
                          />
                        ) : (
                          <p className="text-theme-secondary">{editedContent.education || tailoredResume.tailored_education}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Certifications */}
                {tailoredResume.tailored_certifications && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <button
                        onClick={() => toggleSection('certifications')}
                        className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                      >
                        {expandedSections.certifications ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Certifications & Training
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEditMode('certifications')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title={editMode.certifications ? "Done editing" : "Edit section"}
                        >
                          {editMode.certifications ? (
                            <Save size={18} className="text-blue-400" />
                          ) : (
                            <Edit size={18} className="text-theme-secondary" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(tailoredResume.tailored_certifications, 'tail-certifications')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedSection === 'tail-certifications' ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-theme-secondary" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedSections.certifications && (
                      <div
                        className={`glass rounded-xl p-4 border border-theme-muted cursor-pointer ${
                          highlightedSection?.type === 'certifications' ? 'highlight-tailored' : ''
                        }`}
                        onClick={() => handleSectionClick('certifications')}
                      >
                        {editMode.certifications ? (
                          <textarea
                            value={editedContent.certifications || tailoredResume.tailored_certifications}
                            onChange={(e) => setEditedContent(prev => ({ ...prev, certifications: e.target.value }))}
                            className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-4 text-theme-secondary min-h-[80px]"
                            rows={3}
                          />
                        ) : (
                          <p className="text-theme-secondary whitespace-pre-line">{editedContent.certifications || tailoredResume.tailored_certifications}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Alignment Statement */}
                {tailoredResume.alignment_statement && (
                  <div className="mb-10">
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <button
                        onClick={() => toggleSection('alignment')}
                        className="flex items-center gap-2 text-lg font-bold text-theme hover:text-theme-secondary transition-colors"
                      >
                        {expandedSections.alignment ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        Company Alignment
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => editMode.alignment ? saveEdit('alignment') : toggleEditMode('alignment')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title={editMode.alignment ? "Save changes" : "Edit section"}
                          disabled={savingSection === 'alignment'}
                        >
                          {savingSection === 'alignment' ? (
                            <Loader2 size={18} className="text-blue-400 animate-spin" />
                          ) : editMode.alignment ? (
                            <Save size={18} className="text-blue-400" />
                          ) : (
                            <Edit size={18} className="text-theme-secondary" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(tailoredResume.alignment_statement, 'tail-alignment')}
                          className="p-2 hover:bg-theme-glass-10 rounded-lg transition-colors"
                          title="Copy to clipboard"
                        >
                          {copiedSection === 'tail-alignment' ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-theme-secondary" />
                          )}
                        </button>
                      </div>
                    </div>
                    {expandedSections.alignment && (
                      <div
                        className={`glass rounded-xl p-4 border border-theme-muted cursor-pointer ${
                          highlightedSection?.type === 'alignment' ? 'highlight-tailored' : ''
                        }`}
                        onClick={() => handleSectionClick('alignment')}
                      >
                        {editMode.alignment ? (
                          <textarea
                            value={editedContent.alignment || tailoredResume.alignment_statement}
                            onChange={(e) => setEditedContent(prev => ({ ...prev, alignment: e.target.value }))}
                            className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-4 text-theme-secondary min-h-[80px]"
                            rows={3}
                          />
                        ) : (
                          <p className="text-theme-secondary">{editedContent.alignment || tailoredResume.alignment_statement}</p>
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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-semibold text-theme">AI Analysis</h3>
                </div>
                <button
                  onClick={() => tailoredResume?.id && loadAllAnalysis(tailoredResume.id, true)}
                  disabled={loadingAnalysis || !tailoredResume?.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 hover:text-theme transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh analysis"
                  title="Refresh AI analysis (clears cache)"
                >
                  <RotateCcw className={`w-4 h-4 ${loadingAnalysis ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium hidden sm:inline">
                    {loadingAnalysis ? 'Refreshing...' : 'Refresh'}
                  </span>
                </button>
              </div>
              <ResumeAnalysis analysis={analysis} loading={loadingAnalysis} />
            </div>
          )}

          {/* Tab Content: Match & Keywords */}
          {activeTab === 'insights' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-theme">Match Score & Keywords</h3>
                </div>
                <button
                  onClick={() => tailoredResume?.id && loadAllAnalysis(tailoredResume.id, true)}
                  disabled={loadingAnalysis || !tailoredResume?.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 hover:text-theme transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh analysis"
                  title="Refresh AI analysis (clears cache)"
                >
                  <RotateCcw className={`w-4 h-4 ${loadingAnalysis ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium hidden sm:inline">
                    {loadingAnalysis ? 'Refreshing...' : 'Refresh'}
                  </span>
                </button>
              </div>
              <MatchScore matchScore={matchScore} loading={loadingAnalysis} />
              <KeywordPanel keywords={keywords} loading={loadingAnalysis} />
            </div>
          )}

          {/* Print-Only Resume View */}
          <div className="print-content">
            <div className="max-w-4xl mx-auto bg-white p-8">
              {/* Header */}
              <div className="text-center mb-8 pb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {tailoredResume.company ? `Resume for ${tailoredResume.company}` : 'Tailored Resume'}
                </h1>
                {tailoredResume.title && (
                  <h2 className="text-2xl text-gray-700">{tailoredResume.title}</h2>
                )}
              </div>

              {/* Professional Summary */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2">
                  PROFESSIONAL SUMMARY
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  {editedContent.summary || tailoredResume.tailored_summary}
                </p>
              </div>

              {/* Core Competencies */}
              {tailoredResume.tailored_skills && tailoredResume.tailored_skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2">
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
                  <h3 className="text-xl font-bold text-gray-900 mb-3 pb-2">
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
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
            <button
              onClick={handleInterviewPrepClick}
              className="btn-primary flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg bg-purple-600 hover:bg-purple-700 min-h-[48px] w-full sm:w-auto"
            >
              <Briefcase className="w-5 h-5" />
              <span className="hidden sm:inline">View Interview Prep</span>
              <span className="sm:hidden">Interview Prep</span>
            </button>
            <button
              onClick={() => handleDownloadResume('docx')}
              className="btn-primary flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg min-h-[48px] w-full sm:w-auto"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">Download Tailored Resume</span>
              <span className="sm:hidden">Download</span>
            </button>
            <button
              onClick={resetForm}
              className="btn-secondary text-base sm:text-lg min-h-[48px] w-full sm:w-auto"
            >
              Create Another
            </button>
          </div>

          {/* Save Warning Modal */}
          {showSaveWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveWarning(false)} />
              <div className="relative glass rounded-2xl p-6 sm:p-8 max-w-md w-full border border-theme-glass-10 shadow-2xl">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Bookmark className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-bold text-theme">Save Your Comparison?</h3>
                  <p className="text-theme-secondary text-sm leading-relaxed">
                    You haven't saved this comparison yet. Saving lets you revisit it from the Saved menu anytime.
                  </p>
                  <div className="flex flex-col w-full gap-2 mt-2">
                    <button
                      onClick={handleSaveAndContinue}
                      disabled={savingFromWarning}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                      {savingFromWarning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bookmark className="w-5 h-5" />}
                      {savingFromWarning ? 'Saving...' : 'Save & Continue'}
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveWarning(false)
                        navigate(`/interview-prep/${tailoredResume.id}`)
                      }}
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-theme-glass-10 hover:bg-theme-glass-20 text-theme-secondary rounded-xl font-medium transition-all"
                    >
                      Continue Without Saving
                    </button>
                    <button
                      onClick={() => setShowSaveWarning(false)}
                      className="text-sm text-theme-secondary/60 hover:text-theme-secondary transition-colors mt-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {loading && (
        <div className="fixed inset-0 z-50">
          <AILoadingScreen
            title="Generating Tailored Resume"
            subtitle="Our AI is customizing your resume for this specific role"
            footnote="This typically takes 15-30 seconds"
            steps={[
              { id: 'analyze', label: 'Researching company & role', description: 'Gathering company insights and job requirements...' },
              { id: 'match', label: 'Matching your skills & experience', description: 'Identifying transferable qualifications...' },
              { id: 'rewrite', label: 'Rewriting resume content', description: 'Tailoring bullets for maximum impact...' },
              { id: 'finalize', label: 'Finalizing tailored document', description: 'Formatting and generating DOCX file...' },
            ]}
            progress={{ type: 'estimated', estimatedDurationMs: 30000, isComplete: loadingComplete }}
            onCancel={() => {
              setLoading(false)
              setError('Resume generation was cancelled.')
            }}
          />
        </div>
      )}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-theme mb-4 sm:mb-6">
            Talor
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-theme-secondary px-2">
            AI-powered resume customization for every job application
          </p>
        </div>

        {error && (
          <div className="mb-16 p-5 glass border-2 border-red-500/30 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-theme text-lg">Error</p>
                <p className="text-red-400 mb-3">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-sm text-red-400 hover:text-red-300 underline transition-colors min-h-[44px] px-2"
                >
                  Dismiss and try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resume Selection */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-xl sm:text-2xl text-theme">Select Base Resume</h2>
          </div>

          {/* Bulk Actions */}
          <div className="max-w-3xl mx-auto">
          {resumes.length > 0 && (
            <div className="flex items-center justify-between mb-6 pb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-theme hover:text-theme-secondary transition-colors"
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
                  <span className="text-sm text-theme-secondary">
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
              <Loader2 className="w-8 h-8 animate-spin text-theme" />
              <span className="ml-3 text-theme-secondary text-lg">Loading resumes...</span>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 bg-theme-glass-5 rounded-xl">
              <FileText className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <p className="text-theme-secondary mb-6 text-lg">No resumes uploaded yet</p>
              <a href="/upload" className="inline-flex items-center gap-2 px-6 py-3 bg-theme-glass-10 hover:bg-theme-glass-20 border border-theme-muted hover:border-theme-muted rounded-xl text-theme font-semibold text-lg transition-all">
                Upload a resume to get started →
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className={`block p-6 border-2 rounded-xl transition-all duration-300 ${
                    selectedResumeId === resume.id
                      ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.12)] animate-[resumeSelected_0.5s_ease-out]'
                      : 'border-theme-muted hover:border-theme-muted hover:bg-theme-glass-5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox for selection */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedResumeId(resume.id)
                        toggleResumeSelection(resume.id)
                      }}
                      className="mt-0.5 flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 hover:bg-theme-glass-10"
                    >
                      {selectedResumeId === resume.id ? (
                        <CheckSquare className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
                      ) : (
                        <Square className="w-8 h-8 text-theme-tertiary hover:text-theme-secondary transition-colors" />
                      )}
                    </button>

                    {/* Resume content - clickable to select */}
                    <label className="flex-1 min-w-0 cursor-pointer">
                      <input
                        type="radio"
                        name="resume"
                        value={resume.id}
                        checked={selectedResumeId === resume.id}
                        onChange={() => setSelectedResumeId(resume.id)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-theme text-lg mb-2 break-words">{resume.filename}</p>
                          {resume.summary && (
                            <p className="text-theme-secondary line-clamp-2 mb-3">
                              {resume.summary}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-theme-tertiary">
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
        <div className="mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-xl sm:text-2xl text-theme">Job Details</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Job URL Field - Always Visible */}
            <div>
              <label className="block text-sm sm:text-base font-bold text-theme mb-3 sm:mb-4">
                Job URL <span className="text-red-400">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <input
                  type="url"
                  value={jobUrl}
                  onChange={(e) => {
                    setJobUrl(e.target.value)
                    // Reset extraction state when URL changes
                    if (extractionAttempted) {
                      setExtractionAttempted(false)
                      setCompanyExtracted(false)
                      setTitleExtracted(false)
                      setExtractionError({})
                      setCompany('')
                      setJobTitle('')
                    }
                  }}
                  onBlur={handleExtractJobDetails}
                  placeholder="Paste job URL here..."
                  className="flex-1 px-4 sm:px-5 py-3 sm:py-4 bg-theme-glass-5 border-2 border-theme-muted rounded-xl focus:ring-4 focus:ring-theme-glass-20 focus:border-theme-muted transition-all text-[16px] sm:text-lg text-theme placeholder-gray-500 min-h-[48px]"
                  disabled={extracting}
                />
                <button
                  onClick={handleExtractJobDetails}
                  disabled={extracting || !jobUrl.trim()}
                  className={`px-5 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold whitespace-nowrap transition-all w-full sm:w-auto min-h-[48px] ${
                    extracting || !jobUrl.trim()
                      ? 'bg-theme-glass-10 text-theme-tertiary cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {extracting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Extracting...
                    </span>
                  ) : (
                    'Extract Details'
                  )}
                </button>
              </div>
              <p className="text-xs sm:text-sm text-theme-secondary mt-3 sm:mt-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>Paste the job URL and click "Extract Details" to automatically extract company name and job title.</span>
              </p>
            </div>

            {/* Conditionally Show Company & Title Fields if Extraction Failed */}
            {extractionAttempted && (!companyExtracted || !titleExtracted) && (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8">
                {/* Company Name - Show only if not extracted */}
                {!companyExtracted && (
                  <div>
                    <label className="block text-base font-bold text-theme mb-4">
                      Company Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="JPMorgan Chase"
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-theme-glass-5 border-2 rounded-xl focus:ring-4 focus:ring-theme-glass-20 focus:border-theme-muted transition-all text-[16px] sm:text-lg text-theme placeholder-gray-500 min-h-[48px] ${
                        extractionError.company ? 'border-red-500' : 'border-theme-muted'
                      }`}
                    />
                    {extractionError.company && (
                      <p className="text-sm text-red-400 mt-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {extractionError.company}
                      </p>
                    )}
                  </div>
                )}

                {/* Job Title - Show only if not extracted */}
                {!titleExtracted && (
                  <div>
                    <label className="block text-base font-bold text-theme mb-4">
                      Job Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Lead Technical Program Manager"
                      className={`w-full px-4 sm:px-5 py-3 sm:py-4 bg-theme-glass-5 border-2 rounded-xl focus:ring-4 focus:ring-theme-glass-20 focus:border-theme-muted transition-all text-[16px] sm:text-lg text-theme placeholder-gray-500 min-h-[48px] ${
                        extractionError.title ? 'border-red-500' : 'border-theme-muted'
                      }`}
                    />
                    {extractionError.title && (
                      <p className="text-sm text-red-400 mt-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {extractionError.title}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Success Messages if Extracted */}
            {extractionAttempted && (companyExtracted || titleExtracted) && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-green-300 font-semibold mb-1">Extraction Successful!</p>
                    <div className="text-sm text-theme-secondary space-y-1">
                      {companyExtracted && <p>✓ Company: {company}</p>}
                      {titleExtracted && <p>✓ Job Title: {jobTitle}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tailor Button */}
        <div className="max-w-3xl mx-auto px-4 sm:px-0">
        <button
          onClick={handleTailor}
          disabled={loading || !selectedResumeId}
          className={`w-full py-4 sm:py-6 rounded-2xl font-bold text-lg sm:text-xl transition-all min-h-[56px] ${
            loading || !selectedResumeId
              ? 'bg-theme-glass-10 text-theme-tertiary cursor-not-allowed'
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
