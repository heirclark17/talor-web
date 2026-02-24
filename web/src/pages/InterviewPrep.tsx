import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Target,
  CheckCircle2,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Award,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileText,
  Plus,
  Save,
  Trash2,
  PlayCircle,
  X,
  Clock,
  Printer,
  Mail,
  FileDown,
  Calendar,
  Edit,
  Check,
  Square,
  CheckSquare,
  Sparkles
} from 'lucide-react'
import { api, getApiHeaders } from '../api/client'
import STARStoryBuilder from '../components/STARStoryBuilder'
import CommonInterviewQuestions from '../components/CommonInterviewQuestions'
import CertificationRecommendations from '../components/CertificationRecommendations'
import BehavioralTechnicalQuestions from '../components/BehavioralTechnicalQuestions'
import AILoadingScreen from '../components/AILoadingScreen'

// API base URL - same logic as API client
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

interface InterviewPrepData {
  company_profile: {
    name: string
    industry: string
    locations: string[]
    size_estimate: string
    overview_paragraph: string
  }
  values_and_culture: {
    stated_values: Array<{
      name: string
      source_snippet: string
      url: string
    }>
    practical_implications: string[]
  }
  strategy_and_news: {
    recent_events: Array<{
      date: string
      title: string
      summary?: string
      source?: string
      url?: string
      impact_summary: string
    }>
    strategic_themes: Array<{
      theme: string
      rationale: string
    }>
    technology_focus?: Array<{
      technology: string
      description: string
      relevance_to_role: string
    }>
  }
  role_analysis: {
    job_title: string
    seniority_level: string
    core_responsibilities: string[]
    must_have_skills: string[]
    nice_to_have_skills: string[]
    success_signals_6_12_months: string
  }
  interview_preparation: {
    research_tasks: string[]
    practice_questions_for_candidate: string[]
    day_of_checklist: string[]
  }
  candidate_positioning: {
    resume_focus_areas: string[]
    story_prompts: Array<{
      title: string
      description: string
      star_hint: {
        situation: string
        task: string
        action: string
        result: string
      }
    }>
    keyword_map: Array<{
      company_term: string
      candidate_equivalent: string
      context: string
    }>
  }
  questions_to_ask_interviewer: {
    product: string[]
    team: string[]
    culture: string[]
    performance: string[]
    strategy: string[]
  }
}

interface CompanyResearchData {
  strategic_initiatives: Array<{
    title: string
    description: string
    source: string
    url: string
    date: string
    relevance_to_role: string
  }>
  recent_developments: string[]
  technology_focus: string[]
  sources_consulted: Array<{
    title: string
    url: string
    type: string
  }>
  last_updated: string
  company_name: string
}

interface NewsArticle {
  title: string
  summary: string
  source: string
  url: string
  published_date: string
  relevance_score: number
  category: string
  impact_summary: string
}

interface NewsData {
  news_articles: NewsArticle[]
  total_articles: number
  sources_used: string[]
  date_range: string
  last_updated: string
  company_name: string
}

interface InterviewQuestion {
  question: string
  type: string
  difficulty: string
  frequency: string
  source: string
  source_url: string
  date: string
  context: string
  tips: string
}

interface InterviewQuestionsData {
  questions: InterviewQuestion[]
  total_questions: number
  question_types: Record<string, number>
  difficulty_breakdown: Record<string, number>
  sources: string[]
  last_updated: string
  company_name: string
  job_title: string
}

export default function InterviewPrep() {
  const { tailoredResumeId } = useParams<{ tailoredResumeId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [prepData, setPrepData] = useState<InterviewPrepData | null>(null)
  const [interviewPrepId, setInterviewPrepId] = useState<number | null>(null)
  const [baseResumeExperiences, setBaseResumeExperiences] = useState<any[]>([])
  const [tailoredResumeData, setTailoredResumeData] = useState<any>(null)

  // Real data from backend services
  const [companyResearch, setCompanyResearch] = useState<CompanyResearchData | null>(null)
  const [companyNews, setCompanyNews] = useState<NewsData | null>(null)
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestionsData | null>(null)
  const [companyValues, setCompanyValues] = useState<{
    values: Array<{
      name: string;
      description: string;
      evidence: string;
      discussion_tips: string[];
    }>;
    culture_keywords: string[];
    how_to_demonstrate: string[];
  } | null>(null)
  const [certifications, setCertifications] = useState<any>(null)
  const [loadingRealData, setLoadingRealData] = useState(false)
  const [loadingCertifications, setLoadingCertifications] = useState(false)
  const [generationStages, setGenerationStages] = useState<string[]>([])
  const isTrackingProgressRef = useRef(false)

  // Enhancement states
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`interview-prep-checks-${tailoredResumeId}`)
    return saved ? JSON.parse(saved) : {}
  })

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`interview-prep-expanded-${tailoredResumeId}`)
    return saved ? JSON.parse(saved) : {
      companyProfile: true,
      roleAnalysis: true,
      valuesAndCulture: true,
      strategy: true,
      preparation: true,
      questions: true,
      commonQuestions: true,
      behavioralTechnical: true,
      positioning: true,
      certifications: true
    }
  })

  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(`interview-prep-notes-${tailoredResumeId}`)
    return saved ? JSON.parse(saved) : {}
  })

  const [showNotesFor, setShowNotesFor] = useState<string | null>(null)

  const [customQuestions, setCustomQuestions] = useState<Array<{id: string, question: string, category: string}>>(() => {
    const saved = localStorage.getItem(`interview-prep-custom-questions-${tailoredResumeId}`)
    return saved ? JSON.parse(saved) : []
  })

  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newQuestionCategory, setNewQuestionCategory] = useState('product')

  const [starStories, setStarStories] = useState<Record<string, {situation: string, task: string, action: string, result: string}>>(() => {
    const saved = localStorage.getItem(`interview-prep-star-stories-${tailoredResumeId}`)
    return saved ? JSON.parse(saved) : {}
  })

  const [editingStory, setEditingStory] = useState<string | null>(null)

  const [interviewDate, setInterviewDate] = useState<string>(() => {
    const saved = localStorage.getItem(`interview-date-${tailoredResumeId}`)
    return saved || ''
  })

  const [showExportMenu, setShowExportMenu] = useState(false)

  // Cached data from DB for child components
  const [cachedBehavioralTechnical, setCachedBehavioralTechnical] = useState<any>(null)
  const [cachedCommonQuestions, setCachedCommonQuestions] = useState<any>(null)
  const [cachedCertificationRecs, setCachedCertificationRecs] = useState<any>(null)

  // Debounced save to DB - fire-and-forget
  const saveTimerRef = useRef<Record<string, NodeJS.Timeout>>({})
  const interviewPrepIdRef = useRef<number | null>(null)
  useEffect(() => { interviewPrepIdRef.current = interviewPrepId }, [interviewPrepId])

  const debouncedSaveUserData = useCallback((field: string, value: any) => {
    const prepId = interviewPrepIdRef.current
    if (!prepId) return

    // Clear any existing timer for this field
    if (saveTimerRef.current[field]) {
      clearTimeout(saveTimerRef.current[field])
    }

    saveTimerRef.current[field] = setTimeout(() => {
      fetch(`${API_BASE_URL}/api/interview-prep/${prepId}/cache`, {
        method: 'PATCH',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ user_data: { [field]: value } }),
      })
    }, 500)
  }, [])

  // Modal state for grid card view
  const [activeModal, setActiveModal] = useState<string | null>(null)

  const openModal = (sectionId: string) => {
    setActiveModal(sectionId)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setActiveModal(null)
    document.body.style.overflow = 'auto'
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  useEffect(() => {
    loadInterviewPrep()
  }, [tailoredResumeId])

  useEffect(() => {
    if (interviewPrepId) {
      loadCertifications()
    }
  }, [interviewPrepId])

  const loadInterviewPrep = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to get existing interview prep
      const result = await api.getInterviewPrep(Number(tailoredResumeId))

      if (!result.success) {
        // No existing interview prep (404) - auto-generate instead of showing empty state
        setLoading(false)
        await generateInterviewPrep()
        return
      }

      setPrepData(result.data.prep_data)
      setInterviewPrepId(result.data.interview_prep_id)

      // Check for cached data from database (permanent storage)
      const cachedData = result.data.cached_data
      const hasCachedData = cachedData && (
        cachedData.company_research ||
        cachedData.strategic_news ||
        cachedData.values_alignment ||
        cachedData.competitive_intelligence
      )

      console.log('[InterviewPrep] Cache check:', {
        hasCachedData,
        hasCompanyResearch: !!cachedData?.company_research,
        hasStrategicNews: !!cachedData?.strategic_news,
        hasValuesAlignment: !!cachedData?.values_alignment,
        hasCompetitiveIntelligence: !!cachedData?.competitive_intelligence,
        hasBehavioralTechnical: !!cachedData?.behavioral_technical_questions,
        hasCommonQuestions: !!cachedData?.common_questions,
      })

      if (hasCachedData) {
        console.log('[InterviewPrep] Loading from cache - skipping AI generation')
        if (cachedData.company_research) setCompanyResearch(cachedData.company_research)
        if (cachedData.strategic_news) setCompanyNews(cachedData.strategic_news)
        if (cachedData.values_alignment) setCompanyValues(cachedData.values_alignment)
        if (cachedData.competitive_intelligence) setInterviewQuestions(cachedData.competitive_intelligence)
      } else {
        console.log('[InterviewPrep] No cache found - will fetch from AI services')
      }

      // Hydrate cached AI-generated child component data
      if (cachedData?.behavioral_technical_questions) {
        setCachedBehavioralTechnical(cachedData.behavioral_technical_questions)
      }
      if (cachedData?.common_questions) {
        setCachedCommonQuestions(cachedData.common_questions)
      }
      if (cachedData?.certification_recommendations) {
        setCachedCertificationRecs(cachedData.certification_recommendations)
      }

      // Hydrate user interaction state from DB (overrides localStorage defaults)
      if (cachedData?.user_data) {
        const ud = cachedData.user_data
        if (ud.checklist_checks) setCheckedItems(ud.checklist_checks)
        if (ud.notes) setNotes(ud.notes)
        if (ud.custom_questions) setCustomQuestions(ud.custom_questions)
        if (ud.star_story_drafts) setStarStories(ud.star_story_drafts)
        if (ud.interview_date) setInterviewDate(ud.interview_date)
      }

      // Also fetch the tailored resume to get base resume ID
      const tailoredResponse = await fetch(`${API_BASE_URL}/api/tailor/tailored/${tailoredResumeId}`, {
        headers: getApiHeaders(),
      })

      if (!tailoredResponse.ok) {
        if (tailoredResponse.status === 404) {
          const errorData = await tailoredResponse.json()
          // Interview prep exists but tailored resume is deleted - show warning
          setWarning(`The original resume for this interview prep has been deleted. Some features like STAR Story Builder may not work.`)
          // Only fetch real data if not already cached
          if (!hasCachedData) {
            await fetchRealData(result.data.prep_data, false, result.data.interview_prep_id)
          }
        } else {
          throw new Error(`Failed to fetch tailored resume: ${tailoredResponse.status}`)
        }
      } else {
        const tailoredData = await tailoredResponse.json()
        setTailoredResumeData(tailoredData)

        // Fetch base resume to get experiences
        const baseResponse = await fetch(`${API_BASE_URL}/api/resumes/${tailoredData.base_resume_id}`, {
          headers: getApiHeaders(),
        })

        if (baseResponse.ok) {
          const baseData = await baseResponse.json()
          const experiences = typeof baseData.experience === 'string'
            ? JSON.parse(baseData.experience)
            : baseData.experience
          setBaseResumeExperiences(experiences || [])
        }

        // Only fetch real data from AI if not already cached in database
        if (!hasCachedData) {
          await fetchRealData(result.data.prep_data, false, result.data.interview_prep_id)
        }
      }

      // Signal completion so progress bar reaches 100% before unmount
      setLoadingComplete(true)
      await new Promise(r => setTimeout(r, 600))
      setLoadingComplete(false)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load interview prep')
      setLoading(false)
    }
  }

  const fetchRelatedData = async (interviewPrepData: InterviewPrepData, prepId?: number) => {
    try {
      // Fetch the tailored resume to get base resume ID
      const tailoredResponse = await fetch(`${API_BASE_URL}/api/tailor/tailored/${tailoredResumeId}`, {
        headers: getApiHeaders(),
      })

      if (tailoredResponse.ok) {
        const tailoredData = await tailoredResponse.json()
        setTailoredResumeData(tailoredData)

        // Fetch base resume to get experiences
        const baseResponse = await fetch(`${API_BASE_URL}/api/resumes/${tailoredData.base_resume_id}`, {
          headers: getApiHeaders(),
        })

        if (baseResponse.ok) {
          const baseData = await baseResponse.json()
          const experiences = typeof baseData.experience === 'string'
            ? JSON.parse(baseData.experience)
            : baseData.experience
          setBaseResumeExperiences(experiences || [])
        }

        // Fetch real data from backend services
        await fetchRealData(interviewPrepData, false, prepId)
      }
    } catch (err) {
    }
  }

  const generateInterviewPrep = async () => {
    try {
      setGenerating(true)
      setError(null)
      setGenerationStages([])
      isTrackingProgressRef.current = true

      const result = await api.generateInterviewPrep(Number(tailoredResumeId))

      if (result.success) {
        setGenerationStages(prev => [...prev, 'generate'])
        setPrepData(result.data.prep_data)
        setInterviewPrepId(result.data.interview_prep_id)
        // After setting prep data, fetch related resume data and real data
        await fetchRelatedData(result.data.prep_data, result.data.interview_prep_id)
        return result.data.prep_data
      } else {
        throw new Error(result.error || 'Failed to generate interview prep')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview prep')
      throw err
    } finally {
      setGenerating(false)
      isTrackingProgressRef.current = false
    }
  }

  const fetchRealData = async (prepData: InterviewPrepData, forceRefresh: boolean = false, prepId?: number) => {
    try {
      setLoadingRealData(true)

      const companyName = prepData.company_profile?.name
      const industry = prepData.company_profile?.industry
      const jobTitle = prepData.role_analysis?.job_title
      const currentPrepId = prepId || interviewPrepId

      if (!companyName) {
        return
      }


      const trackStage = (stageId: string) => {
        if (isTrackingProgressRef.current) {
          setGenerationStages(prev => prev.includes(stageId) ? prev : [...prev, stageId])
        }
      }

      // Fetch all four data sources in parallel using centralized API client
      const [researchResult, newsResult, questionsResult, valuesResult] = await Promise.allSettled([
        // Company research
        api.getCompanyResearch(companyName, industry || undefined, jobTitle || undefined)
          .then(r => { trackStage('research'); return r }),
        // Company news
        api.getCompanyNews(companyName, industry || undefined, jobTitle || undefined, 90)
          .then(r => { trackStage('news'); return r }),
        // Interview questions
        api.getInterviewQuestions(companyName, jobTitle || undefined, 30)
          .then(r => { trackStage('questions'); return r }),
        // Company values (new endpoint)
        api.getCompanyValues(companyName)
          .then(r => { trackStage('values'); return r }),
      ])

      // Prepare cache object
      const cacheData: any = { timestamp: Date.now() }

      // Handle company research result
      if (researchResult.status === 'fulfilled' && researchResult.value?.success) {
        setCompanyResearch(researchResult.value.data)
        cacheData.companyResearch = researchResult.value.data
        console.log('[InterviewPrep] Company research fetched successfully')
      } else {
        console.warn('[InterviewPrep] Company research failed:', researchResult.status === 'rejected' ? researchResult.reason : 'API returned failure')
      }

      // Handle news result
      if (newsResult.status === 'fulfilled' && newsResult.value?.success) {
        setCompanyNews(newsResult.value.data)
        cacheData.companyNews = newsResult.value.data
        console.log('[InterviewPrep] Company news fetched successfully')
      } else {
        console.warn('[InterviewPrep] Company news failed:', newsResult.status === 'rejected' ? newsResult.reason : 'API returned failure')
      }

      // Handle interview questions result
      if (questionsResult.status === 'fulfilled' && questionsResult.value?.success) {
        setInterviewQuestions(questionsResult.value.data)
        cacheData.interviewQuestions = questionsResult.value.data
        console.log('[InterviewPrep] Interview questions fetched successfully')
      } else {
        console.warn('[InterviewPrep] Interview questions failed:', questionsResult.status === 'rejected' ? questionsResult.reason : 'API returned failure')
      }

      // Handle company values result - merge with prep data if available
      if (valuesResult.status === 'fulfilled' && valuesResult.value?.success) {
        setCompanyValues(valuesResult.value.data)
        cacheData.companyValues = valuesResult.value.data
        console.log('[InterviewPrep] Company values fetched successfully')
      } else {
        console.warn('[InterviewPrep] Company values failed:', valuesResult.status === 'rejected' ? valuesResult.reason : 'API returned failure')
      }

      // Save to database for permanent caching (instead of just localStorage)
      if (currentPrepId) {
        console.log('[InterviewPrep] Saving fetched data to cache, prepId:', currentPrepId)
        try {
          const savePayload = {
            company_research: cacheData.companyResearch || null,
            strategic_news: cacheData.companyNews || null,
            values_alignment: cacheData.companyValues || null,
            interview_questions: cacheData.interviewQuestions || null,
          }
          console.log('[InterviewPrep] PATCH /cache payload keys:', Object.keys(savePayload).filter(k => savePayload[k as keyof typeof savePayload] !== null))
          const saveResponse = await fetch(`${API_BASE_URL}/api/interview-prep/${currentPrepId}/cache`, {
            method: 'PATCH',
            headers: getApiHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify(savePayload),
          })

          if (saveResponse.ok) {
            console.log('[InterviewPrep] Cache saved to database successfully')
          } else {
            const errBody = await saveResponse.text()
            console.error('[InterviewPrep] Cache save FAILED - status:', saveResponse.status, 'body:', errBody)
          }
        } catch (saveErr) {
          console.error('[InterviewPrep] Cache save threw an exception:', saveErr)
        }
      } else {
        console.warn('[InterviewPrep] No prepId available - cannot save cache to database')
      }
    } catch (err: any) {
      console.error('[InterviewPrep] fetchRealData error:', err)
    } finally {
      setLoadingRealData(false)
    }
  }

  // Utility functions for enhancements
  const toggleCheck = (itemId: string) => {
    const newState = { ...checkedItems, [itemId]: !checkedItems[itemId] }
    setCheckedItems(newState)
    localStorage.setItem(`interview-prep-checks-${tailoredResumeId}`, JSON.stringify(newState))
    debouncedSaveUserData('checklist_checks', newState)
  }

  const toggleSection = (sectionId: string) => {
    const newState = { ...expandedSections, [sectionId]: !expandedSections[sectionId] }
    setExpandedSections(newState)
    localStorage.setItem(`interview-prep-expanded-${tailoredResumeId}`, JSON.stringify(newState))
  }

  const expandAll = () => {
    const allExpanded = Object.keys(expandedSections).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    setExpandedSections(allExpanded)
    localStorage.setItem(`interview-prep-expanded-${tailoredResumeId}`, JSON.stringify(allExpanded))
  }

  const collapseAll = () => {
    const allCollapsed = Object.keys(expandedSections).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    setExpandedSections(allCollapsed)
    localStorage.setItem(`interview-prep-expanded-${tailoredResumeId}`, JSON.stringify(allCollapsed))
  }

  const updateNote = (sectionId: string, content: string) => {
    const newNotes = { ...notes, [sectionId]: content }
    setNotes(newNotes)
    localStorage.setItem(`interview-prep-notes-${tailoredResumeId}`, JSON.stringify(newNotes))
    debouncedSaveUserData('notes', newNotes)
  }

  const addCustomQuestion = () => {
    if (!newQuestion.trim()) return

    const question = {
      id: Date.now().toString(),
      question: newQuestion,
      category: newQuestionCategory
    }

    const updated = [...customQuestions, question]
    setCustomQuestions(updated)
    localStorage.setItem(`interview-prep-custom-questions-${tailoredResumeId}`, JSON.stringify(updated))
    debouncedSaveUserData('custom_questions', updated)

    setNewQuestion('')
    setShowAddQuestion(false)
  }

  const deleteCustomQuestion = (id: string) => {
    const updated = customQuestions.filter(q => q.id !== id)
    setCustomQuestions(updated)
    localStorage.setItem(`interview-prep-custom-questions-${tailoredResumeId}`, JSON.stringify(updated))
    debouncedSaveUserData('custom_questions', updated)
  }

  const updateStarStory = (storyId: string, field: string, value: string) => {
    const story = starStories[storyId] || { situation: '', task: '', action: '', result: '' }
    const updated = {
      ...starStories,
      [storyId]: { ...story, [field]: value }
    }
    setStarStories(updated)
    localStorage.setItem(`interview-prep-star-stories-${tailoredResumeId}`, JSON.stringify(updated))
    debouncedSaveUserData('star_story_drafts', updated)
  }

  // Load certifications using centralized API client (or from cache)
  const loadCertifications = async () => {
    if (!interviewPrepId) {
      return
    }

    // Use cached certification recommendations if available
    if (cachedCertificationRecs?.certifications) {
      setCertifications(cachedCertificationRecs.certifications)
      return
    }

    setLoadingCertifications(true)

    try {
      const result = await api.getCertificationRecommendations(interviewPrepId)


      if (result.success && result.data) {
        setCertifications(result.data)
      } else {
      }
    } catch (error) {
    } finally {
      setLoadingCertifications(false)
    }
  }

  const saveInterviewDate = (date: string) => {
    setInterviewDate(date)
    localStorage.setItem(`interview-date-${tailoredResumeId}`, date)
    debouncedSaveUserData('interview_date', date)
  }

  const getDaysUntilInterview = () => {
    if (!interviewDate) return null
    const today = new Date()
    const interview = new Date(interviewDate)
    const diff = Math.ceil((interview.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const exportToPDF = () => {
    window.print()
  }

  const handlePrintModal = () => {
    document.body.classList.add('printing-modal')
    window.print()
    setTimeout(() => document.body.classList.remove('printing-modal'), 500)
  }

  const handleSaveBookmarkedCerts = useCallback((certs: string[]) => {
    debouncedSaveUserData('bookmarked_certifications', certs)
  }, [debouncedSaveUserData])

  const sendEmail = () => {
    const subject = encodeURIComponent(`Interview Prep for ${prepData?.role_analysis.job_title} at ${prepData?.company_profile.name}`)
    const body = encodeURIComponent('Your interview preparation guide is attached.')
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const getProgressStats = () => {
    if (!prepData) return { researchCompleted: 0, researchTotal: 0, checklistCompleted: 0, checklistTotal: 0 }

    const researchTasks = prepData.interview_preparation.research_tasks
    const researchCompleted = researchTasks.filter((_, idx) => checkedItems[`research-${idx}`]).length

    const checklistItems = prepData.interview_preparation.day_of_checklist
    const checklistCompleted = checklistItems.filter((_, idx) => checkedItems[`checklist-${idx}`]).length

    return {
      researchCompleted,
      researchTotal: researchTasks.length,
      checklistCompleted,
      checklistTotal: checklistItems.length
    }
  }

  if (generating) {
    return (
      <AILoadingScreen
        title="Generating Interview Prep with AI"
        subtitle="Researching the company and building your personalized prep guide"
        footnote="This typically takes 45-90 seconds"
        steps={[
          { id: 'generate', label: 'Generate interview prep', description: 'Creating your personalized prep guide...' },
          { id: 'research', label: 'Research company background', description: 'Analyzing strategic initiatives and culture...' },
          { id: 'news', label: 'Fetch recent company news', description: 'Finding relevant news from the last 90 days...' },
          { id: 'questions', label: 'Build tailored interview questions', description: 'Creating role-specific practice questions...' },
          { id: 'values', label: 'Analyze company values & culture', description: 'Identifying cultural fit talking points...' },
        ]}
        progress={{ type: 'multi-stage', completedSteps: generationStages }}
      />
    )
  }

  if (loading) {
    return (
      <AILoadingScreen
        title="Loading Interview Prep"
        subtitle="Retrieving your saved prep data"
        steps={[
          { id: 'load', label: 'Loading saved data' },
        ]}
        progress={{ type: 'estimated', estimatedDurationMs: 3000, isComplete: loadingComplete }}
      />
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-6 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme mb-2">Error Loading Interview Prep</h2>
          <p className="text-theme-secondary mb-6">{error}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                setError(null)
                await generateInterviewPrep()
              }}
              className="btn-primary"
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Try Generating Again'}
            </button>
            <button onClick={() => navigate('/tailor')} className="btn-secondary">
              Back to Resumes
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!prepData) {
    return (
      <div className="min-h-screen bg-theme flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-6 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme mb-2">No Interview Prep Available</h2>
          <p className="text-theme-secondary mb-6">Generate interview prep to get started.</p>
          <button onClick={generateInterviewPrep} className="btn-primary">
            Generate Interview Prep
          </button>
        </div>
      </div>
    )
  }

  const progressStats = getProgressStats()
  const daysUntilInterview = getDaysUntilInterview()

  return (
    <div className="min-h-screen bg-theme">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/tailor')}
            className="flex items-center gap-2 text-theme-secondary hover:text-theme mb-4 transition-colors min-h-[48px]"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Resume
          </button>

          {/* Warning Banner */}
          {warning && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-400 text-sm font-medium mb-1">Warning</p>
                <p className="text-theme-secondary text-sm">{warning}</p>
              </div>
              <button
                onClick={() => setWarning(null)}
                className="text-theme-secondary hover:text-theme transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-theme mb-2">Interview Preparation</h1>
              <p className="text-base text-theme-secondary">
                AI-generated interview prep for {prepData.role_analysis.job_title} at{' '}
                {prepData.company_profile.name}
              </p>
            </div>

            {/* Control Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <button
                onClick={expandAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 transition-all min-h-[48px]"
              >
                <ChevronDown size={18} />
                <span className="text-sm font-medium">Expand All</span>
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 transition-all min-h-[48px]"
              >
                <ChevronUp size={18} />
                <span className="text-sm font-medium">Collapse All</span>
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 transition-all min-h-[48px]"
              >
                <Printer size={18} />
                <span className="text-sm font-medium">Print</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-theme-glass-5 text-theme-secondary hover:bg-theme-glass-10 transition-all min-h-[48px]"
                >
                  <FileDown size={18} />
                  <span className="text-sm font-medium">Export</span>
                  <ChevronDown size={16} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-theme rounded-xl shadow-2xl border border-theme-subtle py-2 min-w-[200px] z-10">
                    <button
                      onClick={() => {
                        exportToPDF()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-theme hover:bg-theme-glass-10 transition-colors flex items-center gap-3"
                    >
                      <FileDown size={16} />
                      PDF Document
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
        </div>

        {/* Interview Date & Progress Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Interview Date Countdown */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-theme" strokeWidth={2} />
              <h3 className="text-xl font-bold text-theme">Interview Date</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => saveInterviewDate(e.target.value)}
                className="bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme flex-1 text-[16px] min-h-[44px]"
                style={{ colorScheme: 'dark' }}
              />
              {daysUntilInterview !== null && (
                <div className="text-center">
                  <div className={`text-4xl font-bold ${daysUntilInterview <= 3 ? 'text-red-500' : daysUntilInterview <= 7 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {daysUntilInterview}
                  </div>
                  <div className="text-sm text-theme-secondary">days until</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Dashboard */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-theme mb-4">Preparation Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-theme-secondary">Research Tasks</span>
                  <span className="text-theme font-medium">{progressStats.researchCompleted}/{progressStats.researchTotal}</span>
                </div>
                <div className="w-full h-2 bg-theme-glass-10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(progressStats.researchCompleted / progressStats.researchTotal) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-theme-secondary">Day-Of Checklist</span>
                  <span className="text-theme font-medium">{progressStats.checklistCompleted}/{progressStats.checklistTotal}</span>
                </div>
                <div className="w-full h-2 bg-theme-glass-10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(progressStats.checklistCompleted / progressStats.checklistTotal) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sectioned Card Layout */}
        <div className="space-y-6 sm:space-y-8 mb-6 sm:mb-8">

          {/* Section 1: Company Research */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Building2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider">Company Research</h2>
              <div className="flex-1 h-px bg-theme-glass-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Company Profile Card */}
              <button
                onClick={() => openModal('companyProfile')}
                className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-theme">Company Profile</h3>
                </div>
                <p className="text-theme-secondary text-sm line-clamp-2">{prepData.company_profile.name} - {prepData.company_profile.industry}</p>
                <div className="mt-3 text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Values & Culture Card */}
              {prepData.values_and_culture.stated_values.length > 0 && (
                <button
                  onClick={() => openModal('valuesAndCulture')}
                  className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                      <Star className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-bold text-theme">Values & Culture</h3>
                  </div>
                  <p className="text-theme-secondary text-sm line-clamp-2">{prepData.values_and_culture.stated_values.length} core values identified</p>
                  <div className="mt-3 text-yellow-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              )}

              {/* Strategy & News Card */}
              {(prepData.strategy_and_news.recent_events.length > 0 || prepData.strategy_and_news.strategic_themes.length > 0) && (
                <button
                  onClick={() => openModal('strategy')}
                  className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <TrendingUp className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-theme">Strategy & News</h3>
                  </div>
                  <p className="text-theme-secondary text-sm line-clamp-2">
                    {companyNews?.news_articles?.length || prepData.strategy_and_news.recent_events.length} recent updates
                  </p>
                  <div className="mt-3 text-purple-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Section 2: Role & Positioning */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Target className="w-4 h-4 text-green-400" />
              <h2 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider">Role & Positioning</h2>
              <div className="flex-1 h-px bg-theme-glass-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Role Analysis Card */}
              <button
                onClick={() => openModal('roleAnalysis')}
                className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold text-theme">Role Analysis</h3>
                </div>
                <p className="text-theme-secondary text-sm line-clamp-2">{prepData.role_analysis.job_title} - {prepData.role_analysis.seniority_level}</p>
                <div className="mt-3 text-green-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Candidate Positioning Card */}
              <button
                onClick={() => openModal('positioning')}
                className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-theme">Candidate Positioning</h3>
                  <span className="text-xs bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">STAR Builder</span>
                </div>
                <p className="text-theme-secondary text-sm line-clamp-2">Resume focus areas & keyword mapping</p>
                <div className="mt-3 text-emerald-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Practice Questions */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider">Practice Questions</h2>
              <div className="flex-1 h-px bg-theme-glass-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Behavioral & Technical Card */}
              {interviewPrepId && (
                <button
                  onClick={() => openModal('behavioralTechnical')}
                  className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                      <Target className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-theme">Behavioral & Technical</h3>
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded">AI</span>
                  </div>
                  <p className="text-theme-secondary text-sm line-clamp-2">Practice questions with STAR story builder</p>
                  <div className="mt-3 text-purple-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              )}

              {/* Common Questions Card */}
              {interviewPrepId && (
                <button
                  onClick={() => openModal('commonQuestions')}
                  className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-pink-500/20">
                      <MessageSquare className="w-6 h-6 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-bold text-theme">Common Questions</h3>
                  </div>
                  <p className="text-theme-secondary text-sm line-clamp-2">Questions people commonly struggle with</p>
                  <div className="mt-3 text-pink-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Details <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              )}

              {/* Questions to Ask Card */}
              <button
                onClick={() => openModal('questions')}
                className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-orange-500/20">
                    <MessageSquare className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-bold text-theme">Questions to Ask</h3>
                </div>
                <p className="text-theme-secondary text-sm line-clamp-2">
                  {Object.values(prepData.questions_to_ask_interviewer).flat().length + customQuestions.length} questions prepared
                </p>
                <div className="mt-3 text-orange-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

          {/* Section 4: Preparation & Growth */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider">Preparation & Growth</h2>
              <div className="flex-1 h-px bg-theme-glass-10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Interview Preparation Card */}
              <button
                onClick={() => openModal('preparation')}
                className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-cyan-500/20">
                    <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-theme">Preparation Checklist</h3>
                </div>
                <p className="text-theme-secondary text-sm line-clamp-2">
                  {progressStats.researchCompleted}/{progressStats.researchTotal} tasks completed
                </p>
                <div className="mt-3 text-cyan-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              {/* Certifications Card */}
              <button
                onClick={() => openModal('certifications')}
                className="glass rounded-2xl p-6 text-left hover:bg-theme-glass-10 transition-all hover:scale-[1.02] group cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Award className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-theme">Certifications</h3>
                </div>
                <p className="text-theme-secondary text-sm line-clamp-2">Recommended certifications for this role</p>
                <div className="mt-3 text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  View Details <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Backdrop & Content */}
        {activeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            {/* Blurred Backdrop */}
            <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-md" />

            {/* Modal Content */}
            <div
              className="relative w-full max-w-4xl max-h-[90vh] sm:max-h-[90vh] h-full sm:h-auto overflow-y-auto bg-theme sm:rounded-3xl border-0 sm:border border-theme-subtle shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-theme p-4 sm:p-6 flex items-center justify-between z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-theme">
                  {activeModal === 'companyProfile' && 'Company Profile'}
                  {activeModal === 'roleAnalysis' && 'Role Analysis'}
                  {activeModal === 'valuesAndCulture' && 'Values & Culture'}
                  {activeModal === 'strategy' && 'Strategy & Recent News'}
                  {activeModal === 'preparation' && 'Interview Preparation'}
                  {activeModal === 'questions' && 'Questions to Ask'}
                  {activeModal === 'behavioralTechnical' && 'Behavioral & Technical Questions'}
                  {activeModal === 'commonQuestions' && 'Common Interview Questions'}
                  {activeModal === 'certifications' && 'Recommended Certifications'}
                  {activeModal === 'positioning' && 'Candidate Positioning'}
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintModal}
                    className="no-print p-2 rounded-lg hover:bg-theme-glass-10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Print this section"
                  >
                    <Printer className="w-5 h-5 text-theme-secondary" />
                  </button>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg hover:bg-theme-glass-10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-6 h-6 text-theme-secondary" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 modal-print-target">
                {/* Company Profile Modal Content */}
                {activeModal === 'companyProfile' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-theme mb-2">{prepData.company_profile.name}</h3>
                      <div className="flex flex-wrap gap-4 text-sm text-theme-secondary mb-4">
                        <span className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          {prepData.company_profile.industry}
                        </span>
                        {prepData.company_profile.locations.length > 0 && (
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {prepData.company_profile.locations.join(', ')}
                          </span>
                        )}
                        {prepData.company_profile.size_estimate && (
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {prepData.company_profile.size_estimate}
                          </span>
                        )}
                      </div>
                      <p className="text-theme-secondary leading-relaxed">{prepData.company_profile.overview_paragraph}</p>
                    </div>

                    {/* Notes Section */}
                    <div className="mt-6 pt-6">
                      <button
                        onClick={() => setShowNotesFor(showNotesFor === 'companyProfile' ? null : 'companyProfile')}
                        className="flex items-center gap-2 text-sm text-theme-secondary hover:text-theme transition-colors"
                      >
                        <FileText size={16} />
                        {notes.companyProfile ? 'Edit Notes' : 'Add Notes'}
                      </button>
                      {showNotesFor === 'companyProfile' && (
                        <textarea
                          value={notes.companyProfile || ''}
                          onChange={(e) => updateNote('companyProfile', e.target.value)}
                          placeholder="Add your notes about the company here..."
                          className="w-full mt-3 bg-theme-glass-5 border border-theme-muted rounded-lg p-4 text-theme-secondary min-h-[100px]"
                        />
                      )}
                      {notes.companyProfile && showNotesFor !== 'companyProfile' && (
                        <div className="mt-3 p-4 bg-theme-glass-5 rounded-lg border border-theme-subtle">
                          <p className="text-theme-secondary text-sm whitespace-pre-wrap">{notes.companyProfile}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Role Analysis Modal Content */}
                {activeModal === 'roleAnalysis' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-theme mb-2">{prepData.role_analysis.job_title}</h3>
                      <p className="text-theme-secondary text-sm mb-4">{prepData.role_analysis.seniority_level}</p>
                    </div>

                    <div>
                      <h4 className="text-theme font-semibold mb-3">Core Responsibilities</h4>
                      <ul className="space-y-2">
                        {prepData.role_analysis.core_responsibilities.map((resp, idx) => (
                          <li key={idx} className="text-theme-secondary flex gap-2">
                            <span className="text-theme-faint">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-theme font-semibold mb-3">Must-Have Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {prepData.role_analysis.must_have_skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-theme font-semibold mb-3">Nice-to-Have Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {prepData.role_analysis.nice_to_have_skills.map((skill, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {prepData.role_analysis.success_signals_6_12_months && (
                      <div className="bg-theme-glass-5 p-4 rounded-lg">
                        <h4 className="text-theme font-semibold mb-2">Success in 6-12 Months</h4>
                        <p className="text-theme-secondary text-sm">{prepData.role_analysis.success_signals_6_12_months}</p>
                      </div>
                    )}

                    {/* Notes Section */}
                    <div className="mt-6 pt-6">
                      <button
                        onClick={() => setShowNotesFor(showNotesFor === 'roleAnalysis' ? null : 'roleAnalysis')}
                        className="flex items-center gap-2 text-sm text-theme-secondary hover:text-theme transition-colors"
                      >
                        <FileText size={16} />
                        {notes.roleAnalysis ? 'Edit Notes' : 'Add Notes'}
                      </button>
                      {showNotesFor === 'roleAnalysis' && (
                        <textarea
                          value={notes.roleAnalysis || ''}
                          onChange={(e) => updateNote('roleAnalysis', e.target.value)}
                          placeholder="Add your notes about the role requirements..."
                          className="w-full mt-3 bg-theme-glass-5 border border-theme-muted rounded-lg p-4 text-theme-secondary min-h-[100px]"
                        />
                      )}
                      {notes.roleAnalysis && showNotesFor !== 'roleAnalysis' && (
                        <div className="mt-3 p-4 bg-theme-glass-5 rounded-lg border border-theme-subtle">
                          <p className="text-theme-secondary text-sm whitespace-pre-wrap">{notes.roleAnalysis}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Values & Culture Modal Content */}
                {activeModal === 'valuesAndCulture' && (
                  <div className="space-y-6">
                    {/* Enhanced Company Values from API */}
                    {companyValues && companyValues.values && companyValues.values.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-4">
                          <h4 className="text-theme font-semibold">Company Values</h4>
                          <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">Deep Research</span>
                        </div>
                        <div className="space-y-4">
                          {companyValues.values.map((value, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-4 rounded-lg border border-purple-500/20">
                              <h5 className="text-theme font-semibold mb-2 flex items-center gap-2">
                                <Star className="w-4 h-4 text-purple-400" />
                                {value.name}
                              </h5>
                              <p className="text-theme-secondary text-sm mb-3">{value.description}</p>
                              {value.evidence && (
                                <div className="mb-3 pl-3 border-l-2 border-purple-500/30">
                                  <p className="text-theme-secondary text-xs italic">{value.evidence}</p>
                                </div>
                              )}
                              {value.discussion_tips && value.discussion_tips.length > 0 && (
                                <div>
                                  <p className="text-xs text-theme-tertiary uppercase mb-2">How to Discuss in Interview:</p>
                                  <ul className="space-y-1">
                                    {value.discussion_tips.map((tip, tipIdx) => (
                                      <li key={tipIdx} className="text-green-300 text-sm flex gap-2">
                                        <span className="text-green-500">•</span>
                                        <span>{tip}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Culture Keywords */}
                        {companyValues.culture_keywords && companyValues.culture_keywords.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs text-theme-tertiary uppercase mb-2">Culture Keywords to Use:</p>
                            <div className="flex flex-wrap gap-2">
                              {companyValues.culture_keywords.map((keyword, idx) => (
                                <span key={idx} className="px-3 py-1 bg-theme-glass-10 text-theme-secondary rounded-full text-sm">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* How to Demonstrate */}
                        {companyValues.how_to_demonstrate && companyValues.how_to_demonstrate.length > 0 && (
                          <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <p className="text-blue-400 font-medium text-sm mb-2">How to Demonstrate These Values:</p>
                            <ul className="space-y-2">
                              {companyValues.how_to_demonstrate.map((item, idx) => (
                                <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                                  <span className="text-blue-400">→</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Original Stated Values */}
                    <div className="space-y-4">
                      {prepData.values_and_culture.stated_values.map((value, idx) => (
                        <div key={idx} className="bg-theme-glass-5 p-4 rounded-lg">
                          <h4 className="text-theme font-semibold mb-2">{value.name}</h4>
                          <p className="text-theme-secondary text-sm mb-2">{value.source_snippet}</p>
                          {value.url && (
                            <a
                              href={value.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 text-xs hover:underline"
                            >
                              Source
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {prepData.values_and_culture.practical_implications.length > 0 && (
                      <div>
                        <h4 className="text-theme font-semibold mb-3">Practical Implications</h4>
                        <ul className="space-y-2">
                          {prepData.values_and_culture.practical_implications.map((impl, idx) => (
                            <li key={idx} className="text-theme-secondary flex gap-2 text-sm">
                              <span className="text-theme-faint">→</span>
                              <span>{impl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notes Section */}
                    <div className="mt-6 pt-6">
                      <button
                        onClick={() => setShowNotesFor(showNotesFor === 'valuesAndCulture' ? null : 'valuesAndCulture')}
                        className="flex items-center gap-2 text-sm text-theme-secondary hover:text-theme transition-colors"
                      >
                        <FileText size={16} />
                        {notes.valuesAndCulture ? 'Edit Notes' : 'Add Notes'}
                      </button>
                      {showNotesFor === 'valuesAndCulture' && (
                        <textarea
                          value={notes.valuesAndCulture || ''}
                          onChange={(e) => updateNote('valuesAndCulture', e.target.value)}
                          placeholder="Add your notes about company values and culture..."
                          className="w-full mt-3 bg-theme-glass-5 border border-theme-muted rounded-lg p-4 text-theme-secondary min-h-[100px]"
                        />
                      )}
                      {notes.valuesAndCulture && showNotesFor !== 'valuesAndCulture' && (
                        <div className="mt-3 p-4 bg-theme-glass-5 rounded-lg border border-theme-subtle">
                          <p className="text-theme-secondary text-sm whitespace-pre-wrap">{notes.valuesAndCulture}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Strategy & News Modal Content */}
                {activeModal === 'strategy' && (
                  <div className="space-y-6">
                    {/* Loading State */}
                    {loadingRealData && (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-theme animate-spin mr-2" />
                        <span className="text-theme-secondary">Fetching latest company data...</span>
                      </div>
                    )}

                    {/* Real Company Strategies */}
                    {companyResearch && companyResearch.strategic_initiatives && companyResearch.strategic_initiatives.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-theme font-semibold">Strategic Initiatives</h4>
                          <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">Real Data</span>
                        </div>
                        <div className="space-y-4">
                          {companyResearch.strategic_initiatives.map((initiative, idx) => (
                            <div key={idx} className="bg-theme-glass-5 p-4 rounded-lg border border-theme-subtle">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="text-theme font-medium">{initiative.title}</h5>
                                {initiative.date && <span className="text-theme-tertiary text-sm">{initiative.date}</span>}
                              </div>
                              <p className="text-theme-secondary text-sm mb-2">{initiative.description}</p>
                              {initiative.relevance_to_role && (
                                <p className="text-blue-300 text-sm italic mb-2">→ {initiative.relevance_to_role}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-theme-tertiary text-xs">Source: {initiative.source}</span>
                                {initiative.url && (
                                  <a
                                    href={initiative.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-xs hover:underline"
                                  >
                                    View Source →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recent Developments */}
                    {companyResearch && companyResearch.recent_developments && companyResearch.recent_developments.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-theme font-semibold mb-3">Recent Developments</h4>
                        <ul className="space-y-2">
                          {companyResearch.recent_developments.map((dev, idx) => (
                            <li key={idx} className="text-theme-secondary flex gap-2 text-sm">
                              <span className="text-theme-faint">→</span>
                              <span>{dev}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Technology Focus */}
                    {companyResearch && companyResearch.technology_focus && companyResearch.technology_focus.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-theme font-semibold mb-3">Technology Focus Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {companyResearch.technology_focus.map((tech, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Real Company News */}
                    {companyNews && companyNews.news_articles && companyNews.news_articles.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-theme font-semibold">Recent News ({companyNews.date_range})</h4>
                          <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">Real Data</span>
                        </div>
                        <div className="space-y-3">
                          {companyNews.news_articles.slice(0, 10).map((article, idx) => (
                            <div key={idx} className="bg-theme-glass-5 p-4 rounded-lg border border-theme-subtle">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="text-theme font-medium">{article.title}</h5>
                                <span className="text-theme-tertiary text-sm whitespace-nowrap ml-2">{article.published_date}</span>
                              </div>
                              <p className="text-theme-secondary text-sm mb-2">{article.summary}</p>
                              {article.impact_summary && (
                                <p className="text-blue-300 text-sm italic mb-2">→ {article.impact_summary}</p>
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-theme-tertiary text-xs">Source: {article.source}</span>
                                {article.category && (
                                  <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-0.5 rounded">{article.category}</span>
                                )}
                                {article.url && (
                                  <a
                                    href={article.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 text-xs hover:underline ml-auto"
                                  >
                                    Read Article →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fallback to AI-generated data if no real data */}
                    {!loadingRealData && (
                      !companyResearch?.strategic_initiatives?.length &&
                      !companyNews?.news_articles?.length
                    ) && (
                      <>
                        {prepData.strategy_and_news.recent_events.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="text-theme font-semibold">Recent Events</h4>
                              <span className="text-xs text-theme-secondary bg-theme-glass-10 px-2 py-0.5 rounded">AI Analysis</span>
                            </div>
                            <div className="space-y-3">
                              {prepData.strategy_and_news.recent_events.map((event, idx) => (
                                <div key={idx} className="bg-theme-glass-5 p-4 rounded-lg border border-theme-subtle">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-theme font-medium">{event.title}</h5>
                                    {event.date && <span className="text-theme-tertiary text-sm whitespace-nowrap ml-2">{event.date}</span>}
                                  </div>
                                  {event.summary && (
                                    <p className="text-theme-secondary text-sm mb-2">{event.summary}</p>
                                  )}
                                  <p className="text-blue-300 text-sm italic mb-2">→ {event.impact_summary}</p>
                                  <div className="flex items-center gap-4 mt-2">
                                    {event.source && (
                                      <span className="text-theme-tertiary text-xs">Source: {event.source}</span>
                                    )}
                                    {event.url && (
                                      <a
                                        href={event.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 text-xs hover:underline ml-auto"
                                      >
                                        Read Article →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {prepData.strategy_and_news.strategic_themes.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="text-theme font-semibold">Strategic Themes</h4>
                              <span className="text-xs text-theme-secondary bg-theme-glass-10 px-2 py-0.5 rounded">AI Analysis</span>
                            </div>
                            <div className="space-y-3">
                              {prepData.strategy_and_news.strategic_themes.map((theme, idx) => (
                                <div key={idx} className="bg-theme-glass-5 p-4 rounded-lg">
                                  <h5 className="text-theme font-medium mb-2">{theme.theme}</h5>
                                  <p className="text-theme-secondary text-sm">{theme.rationale}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Technology Focus from AI */}
                        {prepData.strategy_and_news.technology_focus && prepData.strategy_and_news.technology_focus.length > 0 && (
                          <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                              <h4 className="text-theme font-semibold">Technology Focus Areas</h4>
                              <span className="text-xs text-theme-secondary bg-theme-glass-10 px-2 py-0.5 rounded">AI Analysis</span>
                            </div>
                            <div className="space-y-3">
                              {prepData.strategy_and_news.technology_focus.map((tech, idx) => (
                                <div key={idx} className="bg-theme-glass-5 p-4 rounded-lg border border-theme-subtle">
                                  <h5 className="text-purple-300 font-medium mb-2">{tech.technology}</h5>
                                  <p className="text-theme-secondary text-sm mb-2">{tech.description}</p>
                                  <p className="text-blue-300 text-sm italic">
                                    <span className="text-theme-tertiary">Relevance to your role:</span> {tech.relevance_to_role}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Sources Consulted */}
                    {companyResearch && companyResearch.sources_consulted && companyResearch.sources_consulted.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-theme font-semibold mb-3">Sources Consulted</h4>
                        <div className="space-y-2">
                          {companyResearch.sources_consulted.map((source, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <FileText className="w-4 h-4 text-theme-secondary" />
                              <span className="text-theme-secondary">{source.type.replace('_', ' ').toUpperCase()}:</span>
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                              >
                                {source.title || source.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes Section */}
                    <div className="mt-6 pt-6">
                      <button
                        onClick={() => setShowNotesFor(showNotesFor === 'strategy' ? null : 'strategy')}
                        className="flex items-center gap-2 text-sm text-theme-secondary hover:text-theme transition-colors"
                      >
                        <FileText size={16} />
                        {notes.strategy ? 'Edit Notes' : 'Add Notes'}
                      </button>
                      {showNotesFor === 'strategy' && (
                        <textarea
                          value={notes.strategy || ''}
                          onChange={(e) => updateNote('strategy', e.target.value)}
                          placeholder="Add your notes about company strategy and news..."
                          className="w-full mt-3 bg-theme-glass-5 border border-theme-muted rounded-lg p-4 text-theme-secondary min-h-[100px]"
                        />
                      )}
                      {notes.strategy && showNotesFor !== 'strategy' && (
                        <div className="mt-3 p-4 bg-theme-glass-5 rounded-lg border border-theme-subtle">
                          <p className="text-theme-secondary text-sm whitespace-pre-wrap">{notes.strategy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Preparation Checklist Modal Content */}
                {activeModal === 'preparation' && (
                  <div className="space-y-6">
                    {prepData.interview_preparation.research_tasks.length > 0 && (
                      <div>
                        <h4 className="text-theme font-semibold mb-3">Research Tasks</h4>
                        <ul className="space-y-2">
                          {prepData.interview_preparation.research_tasks.map((task, idx) => {
                            const itemId = `research-${idx}`
                            const isChecked = checkedItems[itemId] || false
                            return (
                              <li key={idx} className="flex items-start gap-3 group">
                                <button
                                  onClick={() => toggleCheck(itemId)}
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <Square className="w-5 h-5 text-theme-secondary group-hover:text-theme transition-colors" />
                                  )}
                                </button>
                                <span className={`text-sm ${isChecked ? 'text-theme-tertiary line-through' : 'text-theme-secondary'}`}>
                                  {task}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}

                    {prepData.interview_preparation.day_of_checklist.length > 0 && (
                      <div>
                        <h4 className="text-theme font-semibold mb-3">Day-Of Checklist</h4>
                        <ul className="space-y-2">
                          {prepData.interview_preparation.day_of_checklist.map((item, idx) => {
                            const itemId = `checklist-${idx}`
                            const isChecked = checkedItems[itemId] || false
                            return (
                              <li key={idx} className="flex items-start gap-3 group">
                                <button
                                  onClick={() => toggleCheck(itemId)}
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-5 h-5 text-green-500" />
                                  ) : (
                                    <Square className="w-5 h-5 text-theme-secondary group-hover:text-theme transition-colors" />
                                  )}
                                </button>
                                <span className={`text-sm ${isChecked ? 'text-theme-tertiary line-through' : 'text-theme-secondary'}`}>
                                  {item}
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Questions to Ask Modal Content */}
                {activeModal === 'questions' && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {Object.entries(prepData.questions_to_ask_interviewer).map(([category, questions]) => (
                        questions.length > 0 && (
                          <div key={category}>
                            <h4 className="text-theme font-semibold mb-2 capitalize">{category}</h4>
                            <ul className="space-y-1">
                              {questions.map((q, idx) => (
                                <li key={idx} className="text-theme-secondary text-sm">
                                  {q}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      ))}

                      {/* Custom Questions */}
                      {customQuestions.length > 0 && (
                        <div>
                          <h4 className="text-theme font-semibold mb-2">Your Questions</h4>
                          <ul className="space-y-2">
                            {customQuestions.map((q) => (
                              <li key={q.id} className="flex items-start justify-between gap-2 bg-theme-glass-5 p-3 rounded-lg">
                                <span className="text-theme-secondary text-sm flex-1">{q.question}</span>
                                <button
                                  onClick={() => deleteCustomQuestion(q.id)}
                                  className="text-red-400 hover:text-red-300 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Add Custom Question */}
                    {!showAddQuestion ? (
                      <button
                        onClick={() => setShowAddQuestion(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-theme-glass-5 hover:bg-theme-glass-10 rounded-lg transition-colors text-theme text-sm"
                      >
                        <Plus size={16} />
                        Add Your Question
                      </button>
                    ) : (
                      <div className="p-4 bg-theme-glass-5 rounded-xl border border-theme-subtle">
                        <input
                          type="text"
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="What's your question?"
                          className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 mb-3 text-theme"
                        />
                        <select
                          value={newQuestionCategory}
                          onChange={(e) => setNewQuestionCategory(e.target.value)}
                          className="w-full bg-theme-secondary border border-theme-muted rounded-lg p-3 mb-3 text-theme"
                        >
                          <option value="product" className="bg-theme-secondary text-theme">Product</option>
                          <option value="team" className="bg-theme-secondary text-theme">Team</option>
                          <option value="culture" className="bg-theme-secondary text-theme">Culture</option>
                          <option value="performance" className="bg-theme-secondary text-theme">Performance</option>
                          <option value="strategy" className="bg-theme-secondary text-theme">Strategy</option>
                        </select>
                        <div className="flex gap-2">
                          <button
                            onClick={addCustomQuestion}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm"
                          >
                            <Save size={16} />
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setShowAddQuestion(false)
                              setNewQuestion('')
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-theme-glass-5 hover:bg-theme-glass-10 text-theme-secondary rounded-lg transition-colors text-sm"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Behavioral & Technical Modal Content */}
                {activeModal === 'behavioralTechnical' && interviewPrepId && prepData && (
                  <div>
                    <BehavioralTechnicalQuestions
                      interviewPrepId={interviewPrepId}
                      companyName={prepData.company_profile.name}
                      jobTitle={prepData.role_analysis.job_title}
                      cachedQuestionsData={cachedBehavioralTechnical}
                    />
                  </div>
                )}

                {/* Common Questions Modal Content */}
                {activeModal === 'commonQuestions' && interviewPrepId && (
                  <div>
                    <CommonInterviewQuestions
                      interviewPrepId={interviewPrepId}
                      companyName={prepData?.company_profile.name || ''}
                      jobTitle={prepData?.role_analysis.job_title || ''}
                      cachedData={cachedCommonQuestions}
                    />
                  </div>
                )}

                {/* Certifications Modal Content */}
                {activeModal === 'certifications' && (
                  <div>
                    <CertificationRecommendations
                      certifications={certifications}
                      loading={loadingCertifications}
                      savedCerts={cachedCertificationRecs?.bookmarked_certifications}
                      onSaveCerts={handleSaveBookmarkedCerts}
                    />
                  </div>
                )}

                {/* Candidate Positioning Modal Content */}
                {activeModal === 'positioning' && (
                  <div className="space-y-6">
                    {prepData.candidate_positioning.resume_focus_areas.length > 0 && (
                      <div>
                        <h4 className="text-theme font-semibold mb-3">Resume Focus Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {prepData.candidate_positioning.resume_focus_areas.map((area, idx) => (
                            <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STAR Story Builder */}
                    <div>
                      <STARStoryBuilder
                        tailoredResumeId={Number(tailoredResumeId)}
                        experiences={(() => {
                          // Parse tailored resume experience if it's a string
                          if (tailoredResumeData?.experience) {
                            const exp = tailoredResumeData.experience
                            if (typeof exp === 'string') {
                              try {
                                return JSON.parse(exp)
                              } catch {
                                return baseResumeExperiences
                              }
                            }
                            return exp
                          }
                          return baseResumeExperiences
                        })()}
                        companyContext={`${prepData.company_profile.name} - ${prepData.role_analysis.job_title}`}
                        storyThemes={
                          prepData.role_analysis.core_responsibilities && prepData.role_analysis.core_responsibilities.length > 0
                            ? prepData.role_analysis.core_responsibilities
                            : ['Leadership Challenge', 'Problem Solving', 'Team Collaboration', 'Handling Ambiguity', 'Delivering Under Pressure']
                        }
                      />
                    </div>

                    {prepData.candidate_positioning.keyword_map.length > 0 && (
                      <div>
                        <h4 className="text-theme font-semibold mb-3">Keyword Mapping</h4>
                        <div className="space-y-2">
                          {prepData.candidate_positioning.keyword_map.map((mapping, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-sm">
                              <span className="text-blue-400 font-medium">{mapping.company_term}</span>
                              <span className="text-theme-tertiary">→</span>
                              <span className="text-green-400">{mapping.candidate_equivalent}</span>
                              <span className="text-theme-tertiary flex-1">({mapping.context})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Print-Only Interview Prep View */}
        {prepData && (
          <div className="print-content">
            <div className="max-w-4xl mx-auto bg-white p-8">
              {/* Header */}
              <div className="text-center mb-8 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Interview Preparation Guide
                </h1>
                <h2 className="text-xl text-gray-700">
                  {prepData.role_analysis.job_title} at {prepData.company_profile.name}
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  {prepData.company_profile.industry} | {prepData.company_profile.locations?.join(', ')}
                </p>
              </div>

              {/* Company Overview */}
              <div className="mb-6 print-avoid-break">
                <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1">
                  COMPANY OVERVIEW
                </h3>
                <p className="text-gray-800 text-sm leading-relaxed">
                  {prepData.company_profile.overview_paragraph}
                </p>
              </div>

              {/* Role Analysis */}
              <div className="mb-6 print-avoid-break">
                <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1">
                  ROLE ANALYSIS
                </h3>
                <p className="text-gray-700 text-sm mb-2">
                  <strong>Seniority:</strong> {prepData.role_analysis.seniority_level}
                </p>
                <div className="mb-3">
                  <p className="text-gray-800 text-sm font-semibold mb-1">Core Responsibilities:</p>
                  <ul className="text-sm text-gray-800 space-y-1">
                    {prepData.role_analysis.core_responsibilities.map((r, i) => (
                      <li key={i} className="ml-4">&#8226; {r}</li>
                    ))}
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-800 text-sm font-semibold mb-1">Must-Have Skills:</p>
                    <ul className="text-sm text-gray-800 space-y-1">
                      {prepData.role_analysis.must_have_skills.map((s, i) => (
                        <li key={i} className="ml-4">&#8226; {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm font-semibold mb-1">Nice-to-Have Skills:</p>
                    <ul className="text-sm text-gray-800 space-y-1">
                      {prepData.role_analysis.nice_to_have_skills.map((s, i) => (
                        <li key={i} className="ml-4">&#8226; {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Values & Culture */}
              {prepData.values_and_culture?.stated_values?.length > 0 && (
                <div className="mb-6 print-avoid-break">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1">
                    VALUES & CULTURE
                  </h3>
                  {prepData.values_and_culture.stated_values.map((v, i) => (
                    <div key={i} className="mb-2">
                      <p className="text-sm text-gray-800">
                        <strong>{v.name}:</strong> {v.source_snippet}
                      </p>
                    </div>
                  ))}
                  {prepData.values_and_culture.practical_implications?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-gray-800 text-sm font-semibold mb-1">Practical Implications:</p>
                      <ul className="text-sm text-gray-800 space-y-1">
                        {prepData.values_and_culture.practical_implications.map((p, i) => (
                          <li key={i} className="ml-4">&#8226; {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Strategy & News */}
              {prepData.strategy_and_news?.strategic_themes?.length > 0 && (
                <div className="mb-6 print-avoid-break">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1">
                    STRATEGIC THEMES
                  </h3>
                  {prepData.strategy_and_news.strategic_themes.map((t, i) => (
                    <div key={i} className="mb-2">
                      <p className="text-sm text-gray-800">
                        <strong>{t.theme}:</strong> {t.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Practice Questions */}
              <div className="mb-6 page-break">
                <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1">
                  PRACTICE QUESTIONS
                </h3>
                <ol className="text-sm text-gray-800 space-y-2">
                  {prepData.interview_preparation.practice_questions_for_candidate.map((q, i) => (
                    <li key={i} className="ml-4">{i + 1}. {q}</li>
                  ))}
                </ol>
              </div>

              {/* Questions to Ask Interviewer */}
              <div className="mb-6 print-avoid-break">
                <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1">
                  QUESTIONS TO ASK INTERVIEWER
                </h3>
                {Object.entries(prepData.questions_to_ask_interviewer).map(([category, questions]) => (
                  <div key={category} className="mb-3">
                    <p className="text-sm font-semibold text-gray-800 capitalize mb-1">{category}:</p>
                    <ul className="text-sm text-gray-800 space-y-1">
                      {(questions as string[]).map((q, i) => (
                        <li key={i} className="ml-4">&#8226; {q}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Research Tasks */}
              <div className="mb-6 print-avoid-break">
                <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1">
                  RESEARCH TASKS
                </h3>
                <ul className="text-sm text-gray-800 space-y-1">
                  {prepData.interview_preparation.research_tasks.map((t, i) => (
                    <li key={i} className="ml-4">
                      <span className="inline-block w-4 h-4 border border-gray-400 mr-2 align-middle" /> {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Day-of Checklist */}
              <div className="mb-6 print-avoid-break">
                <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1">
                  DAY-OF CHECKLIST
                </h3>
                <ul className="text-sm text-gray-800 space-y-1">
                  {prepData.interview_preparation.day_of_checklist.map((item, i) => (
                    <li key={i} className="ml-4">
                      <span className="inline-block w-4 h-4 border border-gray-400 mr-2 align-middle" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keyword Mapping */}
              {prepData.candidate_positioning?.keyword_map?.length > 0 && (
                <div className="mb-6 print-avoid-break">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 pb-1">
                    KEYWORD MAPPING
                  </h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Company Term</th>
                        <th>Your Equivalent</th>
                        <th>Context</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prepData.candidate_positioning.keyword_map.map((m, i) => (
                        <tr key={i}>
                          <td>{m.company_term}</td>
                          <td>{m.candidate_equivalent}</td>
                          <td>{m.context}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-4 text-center">
                <p className="text-xs text-gray-500">
                  Generated by TalorMe | talorme.com
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
