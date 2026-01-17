import React, { useState, useEffect, useRef } from 'react'
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
  CheckSquare
} from 'lucide-react'
import { api } from '../api/client'
import STARStoryBuilder from '../components/STARStoryBuilder'
import VideoRecorder from '../components/VideoRecorder'
import CommonInterviewQuestions from '../components/CommonInterviewQuestions'
import CertificationRecommendations from '../components/CertificationRecommendations'
import ThemeToggle from '../components/ThemeToggle'

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
      impact_summary: string
    }>
    strategic_themes: Array<{
      theme: string
      rationale: string
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
  const [certifications, setCertifications] = useState<any>(null)
  const [loadingRealData, setLoadingRealData] = useState(false)
  const [loadingCertifications, setLoadingCertifications] = useState(false)

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
      practice: true,
      commonQuestions: true,
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

  const [practiceMode, setPracticeMode] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(120)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [interviewDate, setInterviewDate] = useState<string>(() => {
    const saved = localStorage.getItem(`interview-date-${tailoredResumeId}`)
    return saved || ''
  })

  const [showExportMenu, setShowExportMenu] = useState(false)

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

      if (result.success) {
        setPrepData(result.data.prep_data)
        setInterviewPrepId(result.data.interview_prep_id)

        // Also fetch the tailored resume to get base resume ID
        const tailoredResponse = await fetch(`${API_BASE_URL}/api/tailor/tailored/${tailoredResumeId}`, {
          headers: {
            'X-User-ID': localStorage.getItem('talor_user_id') || '',
          },
        })

        if (!tailoredResponse.ok) {
          if (tailoredResponse.status === 404) {
            const errorData = await tailoredResponse.json()
            console.warn('Tailored resume not found:', errorData)
            // Interview prep exists but tailored resume is deleted - show warning
            setWarning(`The original resume for this interview prep has been deleted. Some features like STAR Story Builder may not work.`)
            // Still show the interview prep data we have
            await fetchRealData(result.data.prep_data)
          } else {
            throw new Error(`Failed to fetch tailored resume: ${tailoredResponse.status}`)
          }
        } else {
          const tailoredData = await tailoredResponse.json()
          setTailoredResumeData(tailoredData)

          // Fetch base resume to get experiences
          const baseResponse = await fetch(`${API_BASE_URL}/api/resumes/${tailoredData.base_resume_id}`, {
            headers: {
              'X-User-ID': localStorage.getItem('talor_user_id') || '',
            },
          })

          if (baseResponse.ok) {
            const baseData = await baseResponse.json()
            const experiences = typeof baseData.experience === 'string'
              ? JSON.parse(baseData.experience)
              : baseData.experience
            setBaseResumeExperiences(experiences || [])
          }

          // Fetch real data from backend services
          await fetchRealData(result.data.prep_data)
        }
      }
    } catch (err: any) {
      console.error('Error loading interview prep:', err)
      // If not found, try to generate automatically
      if (err.message?.includes('not found') || err.message?.includes('404')) {
        console.log('Interview prep not found, generating new one...')
        setLoading(false)
        try {
          await generateInterviewPrep()
          // Generation success - related data is already fetched in generateInterviewPrep
        } catch (genErr: any) {
          console.error('Auto-generation failed:', genErr)
          setError(`Failed to generate interview prep. ${genErr.message}`)
        }
      } else {
        setError(err.message || 'Failed to load interview prep')
        setLoading(false)
      }
    } finally {
      if (!error && !generating) {
        setLoading(false)
      }
    }
  }

  const fetchRelatedData = async (interviewPrepData: InterviewPrepData) => {
    try {
      // Fetch the tailored resume to get base resume ID
      const tailoredResponse = await fetch(`${API_BASE_URL}/api/tailor/tailored/${tailoredResumeId}`, {
        headers: {
          'X-User-ID': localStorage.getItem('talor_user_id') || '',
        },
      })

      if (tailoredResponse.ok) {
        const tailoredData = await tailoredResponse.json()
        setTailoredResumeData(tailoredData)

        // Fetch base resume to get experiences
        const baseResponse = await fetch(`${API_BASE_URL}/api/resumes/${tailoredData.base_resume_id}`, {
          headers: {
            'X-User-ID': localStorage.getItem('talor_user_id') || '',
          },
        })

        if (baseResponse.ok) {
          const baseData = await baseResponse.json()
          const experiences = typeof baseData.experience === 'string'
            ? JSON.parse(baseData.experience)
            : baseData.experience
          setBaseResumeExperiences(experiences || [])
        }

        // Fetch real data from backend services
        await fetchRealData(interviewPrepData)
      }
    } catch (err) {
      console.error('Error fetching related data:', err)
    }
  }

  const generateInterviewPrep = async () => {
    try {
      setGenerating(true)
      setError(null)

      const result = await api.generateInterviewPrep(Number(tailoredResumeId))

      if (result.success) {
        setPrepData(result.data.prep_data)
        setInterviewPrepId(result.data.interview_prep_id)
        // After setting prep data, fetch related resume data and real data
        await fetchRelatedData(result.data.prep_data)
        return result.data.prep_data
      } else {
        throw new Error(result.error || 'Failed to generate interview prep')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview prep')
      throw err
    } finally {
      setGenerating(false)
    }
  }

  const fetchRealData = async (prepData: InterviewPrepData) => {
    try {
      setLoadingRealData(true)

      const companyName = prepData.company_profile?.name
      const industry = prepData.company_profile?.industry
      const jobTitle = prepData.role_analysis?.job_title

      if (!companyName) {
        console.log('No company name found, skipping real data fetch')
        return
      }

      // Fetch all three data sources in parallel
      const [researchResult, newsResult, questionsResult] = await Promise.allSettled([
        // Company research
        fetch(`${API_BASE_URL}/api/interview-prep/company-research`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': localStorage.getItem('talor_user_id') || '',
          },
          body: JSON.stringify({
            company_name: companyName,
            industry: industry || null,
            job_title: jobTitle || null,
          }),
        }).then(res => res.json()),

        // Company news
        fetch(`${API_BASE_URL}/api/interview-prep/company-news`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': localStorage.getItem('talor_user_id') || '',
          },
          body: JSON.stringify({
            company_name: companyName,
            industry: industry || null,
            job_title: jobTitle || null,
            days_back: 90,
          }),
        }).then(res => res.json()),

        // Interview questions
        fetch(`${API_BASE_URL}/api/interview-prep/interview-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': localStorage.getItem('talor_user_id') || '',
          },
          body: JSON.stringify({
            company_name: companyName,
            job_title: jobTitle || null,
            role_category: null,
            max_questions: 30,
          }),
        }).then(res => res.json()),
      ])

      // Handle company research result
      if (researchResult.status === 'fulfilled' && researchResult.value?.success) {
        setCompanyResearch(researchResult.value.data)
        console.log('✓ Company research loaded:', researchResult.value.data.strategic_initiatives?.length, 'initiatives')
      } else {
        console.error('Failed to load company research:', researchResult)
      }

      // Handle news result
      if (newsResult.status === 'fulfilled' && newsResult.value?.success) {
        setCompanyNews(newsResult.value.data)
        console.log('✓ Company news loaded:', newsResult.value.data.news_articles?.length, 'articles')
      } else {
        console.error('Failed to load company news:', newsResult)
      }

      // Handle interview questions result
      if (questionsResult.status === 'fulfilled' && questionsResult.value?.success) {
        setInterviewQuestions(questionsResult.value.data)
        console.log('✓ Interview questions loaded:', questionsResult.value.data.questions?.length, 'questions')
      } else {
        console.error('Failed to load interview questions:', questionsResult)
      }
    } catch (err: any) {
      console.error('Error fetching real data:', err)
    } finally {
      setLoadingRealData(false)
    }
  }

  // Utility functions for enhancements
  const toggleCheck = (itemId: string) => {
    const newState = { ...checkedItems, [itemId]: !checkedItems[itemId] }
    setCheckedItems(newState)
    localStorage.setItem(`interview-prep-checks-${tailoredResumeId}`, JSON.stringify(newState))
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

    setNewQuestion('')
    setShowAddQuestion(false)
  }

  const deleteCustomQuestion = (id: string) => {
    const updated = customQuestions.filter(q => q.id !== id)
    setCustomQuestions(updated)
    localStorage.setItem(`interview-prep-custom-questions-${tailoredResumeId}`, JSON.stringify(updated))
  }

  const updateStarStory = (storyId: string, field: string, value: string) => {
    const story = starStories[storyId] || { situation: '', task: '', action: '', result: '' }
    const updated = {
      ...starStories,
      [storyId]: { ...story, [field]: value }
    }
    setStarStories(updated)
    localStorage.setItem(`interview-prep-star-stories-${tailoredResumeId}`, JSON.stringify(updated))
  }

  // Load certifications
  const loadCertifications = async () => {
    if (!interviewPrepId) {
      console.log('No interview prep ID, cannot load certifications')
      return
    }

    console.log('Loading certifications for interview prep ID:', interviewPrepId)
    setLoadingCertifications(true)
    const userId = localStorage.getItem('talor_user_id')

    try {
      const response = await fetch(`${API_BASE_URL}/api/certifications/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId || ''
        },
        body: JSON.stringify({ interview_prep_id: interviewPrepId })
      })

      console.log('Certifications API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Certifications data received:', data)
        console.log('Setting certifications to:', data.certifications)
        setCertifications(data.certifications)
      } else {
        const errorText = await response.text()
        console.error('Certifications API error:', response.status, errorText)
      }
    } catch (error) {
      console.error('Error loading certifications:', error)
    } finally {
      setLoadingCertifications(false)
    }
  }

  const startPracticeMode = () => {
    setPracticeMode(true)
    setCurrentQuestionIndex(0)
    setTimeRemaining(120)
    setIsPaused(false)
  }

  const nextQuestion = () => {
    if (!prepData) return
    const totalQuestions = interviewQuestions && interviewQuestions.questions.length > 0
      ? interviewQuestions.questions.length
      : prepData.interview_preparation.practice_questions_for_candidate.length
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setTimeRemaining(120)
    } else {
      exitPractice()
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const exitPractice = () => {
    setPracticeMode(false)
    setCurrentQuestionIndex(0)
    setTimeRemaining(120)
    setIsPaused(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const saveInterviewDate = (date: string) => {
    setInterviewDate(date)
    localStorage.setItem(`interview-date-${tailoredResumeId}`, date)
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

  const sendEmail = () => {
    const subject = encodeURIComponent(`Interview Prep for ${prepData?.role_analysis.job_title} at ${prepData?.company_profile.name}`)
    const body = encodeURIComponent('Your interview preparation guide is attached.')
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const getProgressStats = () => {
    if (!prepData) return { researchCompleted: 0, researchTotal: 0, checklistCompleted: 0, checklistTotal: 0, practiceCompleted: 0, practiceTotal: 0 }

    const researchTasks = prepData.interview_preparation.research_tasks
    const researchCompleted = researchTasks.filter((_, idx) => checkedItems[`research-${idx}`]).length

    const checklistItems = prepData.interview_preparation.day_of_checklist
    const checklistCompleted = checklistItems.filter((_, idx) => checkedItems[`checklist-${idx}`]).length

    // Use real interview questions if available
    const practiceQuestions = interviewQuestions && interviewQuestions.questions.length > 0
      ? interviewQuestions.questions
      : prepData.interview_preparation.practice_questions_for_candidate
    const practiceCompleted = practiceQuestions.filter((_, idx) =>
      checkedItems[interviewQuestions && interviewQuestions.questions.length > 0 ? `real-practice-${idx}` : `practice-${idx}`]
    ).length

    return {
      researchCompleted,
      researchTotal: researchTasks.length,
      checklistCompleted,
      checklistTotal: checklistItems.length,
      practiceCompleted,
      practiceTotal: practiceQuestions.length
    }
  }

  // Practice timer effect
  useEffect(() => {
    if (practiceMode && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) clearInterval(timerRef.current)
      }
    }
  }, [practiceMode, isPaused, timeRemaining])

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-xl text-white font-medium">
            {generating ? 'Generating Interview Prep with AI...' : 'Loading Interview Prep...'}
          </p>
          <p className="text-gray-400 mt-2">This may take 20-30 seconds</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="glass rounded-3xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Interview Prep</h2>
          <p className="text-gray-400 mb-6">{error}</p>
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
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="glass rounded-3xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Interview Prep Available</h2>
          <p className="text-gray-400 mb-6">Generate interview prep to get started.</p>
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
    <div className="min-h-screen bg-black">
      <ThemeToggle />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/tailor')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
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
                <p className="text-gray-300 text-sm">{warning}</p>
              </div>
              <button
                onClick={() => setWarning(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Interview Preparation</h1>
              <p className="text-gray-400">
                AI-generated interview prep for {prepData.role_analysis.job_title} at{' '}
                {prepData.company_profile.name}
              </p>
            </div>

            {/* Control Bar */}
            <div className="flex items-center gap-4">
              <button
                onClick={expandAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
              >
                <ChevronDown size={18} />
                <span className="text-sm font-medium">Expand All</span>
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
              >
                <ChevronUp size={18} />
                <span className="text-sm font-medium">Collapse All</span>
              </button>
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
                >
                  <FileDown size={18} />
                  <span className="text-sm font-medium">Export</span>
                  <ChevronDown size={16} />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-gray-900 rounded-xl shadow-2xl border border-white/10 py-2 min-w-[200px] z-10">
                    <button
                      onClick={() => {
                        exportToPDF()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
                    >
                      <FileDown size={16} />
                      PDF Document
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
        </div>

        {/* Interview Date & Progress Dashboard */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Interview Date Countdown */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-white" strokeWidth={2} />
              <h3 className="text-xl font-bold text-white">Interview Date</h3>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => saveInterviewDate(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-lg p-3 text-white flex-1"
              />
              {daysUntilInterview !== null && (
                <div className="text-center">
                  <div className={`text-4xl font-bold ${daysUntilInterview <= 3 ? 'text-red-500' : daysUntilInterview <= 7 ? 'text-yellow-500' : 'text-green-500'}`}>
                    {daysUntilInterview}
                  </div>
                  <div className="text-sm text-gray-400">days until</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress Dashboard */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Preparation Progress</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Research Tasks</span>
                  <span className="text-white font-medium">{progressStats.researchCompleted}/{progressStats.researchTotal}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(progressStats.researchCompleted / progressStats.researchTotal) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Day-Of Checklist</span>
                  <span className="text-white font-medium">{progressStats.checklistCompleted}/{progressStats.checklistTotal}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${(progressStats.checklistCompleted / progressStats.checklistTotal) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Practice Questions</span>
                  <span className="text-white font-medium">{progressStats.practiceCompleted}/{progressStats.practiceTotal}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${(progressStats.practiceCompleted / progressStats.practiceTotal) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Profile */}
        <section className="glass rounded-3xl mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('companyProfile')}
            className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Company Profile</h2>
            </div>
            {expandedSections.companyProfile ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
          </button>

          {expandedSections.companyProfile && (
            <div className="px-8 pb-8">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{prepData.company_profile.name}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
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
                  <p className="text-gray-300 leading-relaxed">{prepData.company_profile.overview_paragraph}</p>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mt-6">
                <button
                  onClick={() => setShowNotesFor(showNotesFor === 'companyProfile' ? null : 'companyProfile')}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <FileText size={16} />
                  {notes.companyProfile ? 'Edit Notes' : 'Add Notes'}
                </button>
                {showNotesFor === 'companyProfile' && (
                  <textarea
                    value={notes.companyProfile || ''}
                    onChange={(e) => updateNote('companyProfile', e.target.value)}
                    placeholder="Add your notes about the company here..."
                    className="w-full mt-3 bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 min-h-[100px]"
                  />
                )}
                {notes.companyProfile && showNotesFor !== 'companyProfile' && (
                  <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{notes.companyProfile}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Role Analysis */}
        <section className="glass rounded-3xl mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection('roleAnalysis')}
            className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Role Analysis</h2>
            </div>
            {expandedSections.roleAnalysis ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
          </button>

          {expandedSections.roleAnalysis && (
            <div className="px-8 pb-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{prepData.role_analysis.job_title}</h3>
                  <p className="text-gray-400 text-sm mb-4">{prepData.role_analysis.seniority_level}</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3">Core Responsibilities</h4>
                  <ul className="space-y-2">
                    {prepData.role_analysis.core_responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-gray-300 flex gap-2">
                        <span className="text-white/40">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3">Must-Have Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {prepData.role_analysis.must_have_skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3">Nice-to-Have Skills</h4>
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
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Success in 6-12 Months</h4>
                    <p className="text-gray-300 text-sm">{prepData.role_analysis.success_signals_6_12_months}</p>
                  </div>
                )}
              </div>

              {/* Notes Section */}
              <div className="mt-6">
                <button
                  onClick={() => setShowNotesFor(showNotesFor === 'roleAnalysis' ? null : 'roleAnalysis')}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <FileText size={16} />
                  {notes.roleAnalysis ? 'Edit Notes' : 'Add Notes'}
                </button>
                {showNotesFor === 'roleAnalysis' && (
                  <textarea
                    value={notes.roleAnalysis || ''}
                    onChange={(e) => updateNote('roleAnalysis', e.target.value)}
                    placeholder="Add your notes about the role requirements..."
                    className="w-full mt-3 bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 min-h-[100px]"
                  />
                )}
                {notes.roleAnalysis && showNotesFor !== 'roleAnalysis' && (
                  <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
                    <p className="text-gray-300 text-sm whitespace-pre-wrap">{notes.roleAnalysis}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Values & Culture */}
        {prepData.values_and_culture.stated_values.length > 0 && (
          <section className="glass rounded-3xl mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('valuesAndCulture')}
              className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Star className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Values & Culture</h2>
              </div>
              {expandedSections.valuesAndCulture ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
            </button>

            {expandedSections.valuesAndCulture && (
              <div className="px-8 pb-8">
                <div className="space-y-4 mb-6">
                  {prepData.values_and_culture.stated_values.map((value, idx) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-lg">
                      <h4 className="text-white font-semibold mb-2">{value.name}</h4>
                      <p className="text-gray-300 text-sm mb-2">{value.source_snippet}</p>
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
                    <h4 className="text-white font-semibold mb-3">Practical Implications</h4>
                    <ul className="space-y-2">
                      {prepData.values_and_culture.practical_implications.map((impl, idx) => (
                        <li key={idx} className="text-gray-300 flex gap-2 text-sm">
                          <span className="text-white/40">→</span>
                          <span>{impl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notes Section */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowNotesFor(showNotesFor === 'valuesAndCulture' ? null : 'valuesAndCulture')}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <FileText size={16} />
                    {notes.valuesAndCulture ? 'Edit Notes' : 'Add Notes'}
                  </button>
                  {showNotesFor === 'valuesAndCulture' && (
                    <textarea
                      value={notes.valuesAndCulture || ''}
                      onChange={(e) => updateNote('valuesAndCulture', e.target.value)}
                      placeholder="Add your notes about company values and culture..."
                      className="w-full mt-3 bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 min-h-[100px]"
                    />
                  )}
                  {notes.valuesAndCulture && showNotesFor !== 'valuesAndCulture' && (
                    <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{notes.valuesAndCulture}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Strategy & News */}
        {(prepData.strategy_and_news.recent_events.length > 0 ||
          prepData.strategy_and_news.strategic_themes.length > 0) && (
          <section className="glass rounded-3xl mb-6 overflow-hidden">
            <button
              onClick={() => toggleSection('strategy')}
              className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Strategy & Recent News</h2>
              </div>
              {expandedSections.strategy ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
            </button>

            {expandedSections.strategy && (
              <div className="px-8 pb-8">
                {/* Loading State */}
                {loadingRealData && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-white animate-spin mr-2" />
                    <span className="text-gray-300">Fetching latest company data...</span>
                  </div>
                )}

                {/* Real Company Strategies */}
                {companyResearch && companyResearch.strategic_initiatives && companyResearch.strategic_initiatives.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="text-white font-semibold">Strategic Initiatives</h4>
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">Real Data</span>
                    </div>
                    <div className="space-y-4">
                      {companyResearch.strategic_initiatives.map((initiative, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-white font-medium">{initiative.title}</h5>
                            {initiative.date && <span className="text-gray-500 text-sm">{initiative.date}</span>}
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{initiative.description}</p>
                          {initiative.relevance_to_role && (
                            <p className="text-blue-300 text-sm italic mb-2">→ {initiative.relevance_to_role}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-gray-500 text-xs">Source: {initiative.source}</span>
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
                    <h4 className="text-white font-semibold mb-3">Recent Developments</h4>
                    <ul className="space-y-2">
                      {companyResearch.recent_developments.map((dev, idx) => (
                        <li key={idx} className="text-gray-300 flex gap-2 text-sm">
                          <span className="text-white/40">→</span>
                          <span>{dev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technology Focus */}
                {companyResearch && companyResearch.technology_focus && companyResearch.technology_focus.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-3">Technology Focus Areas</h4>
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
                      <h4 className="text-white font-semibold">Recent News ({companyNews.date_range})</h4>
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">Real Data</span>
                    </div>
                    <div className="space-y-3">
                      {companyNews.news_articles.slice(0, 10).map((article, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-white font-medium">{article.title}</h5>
                            <span className="text-gray-500 text-sm whitespace-nowrap ml-2">{article.published_date}</span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{article.summary}</p>
                          {article.impact_summary && (
                            <p className="text-blue-300 text-sm italic mb-2">→ {article.impact_summary}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-gray-500 text-xs">Source: {article.source}</span>
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
                          <h4 className="text-white font-semibold">Recent Events</h4>
                          <span className="text-xs text-gray-400 bg-gray-500/20 px-2 py-0.5 rounded">AI Analysis</span>
                        </div>
                        <div className="space-y-3">
                          {prepData.strategy_and_news.recent_events.map((event, idx) => (
                            <div key={idx} className="bg-white/5 p-4 rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="text-white font-medium">{event.title}</h5>
                                {event.date && <span className="text-gray-500 text-sm">{event.date}</span>}
                              </div>
                              <p className="text-gray-300 text-sm">{event.impact_summary}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {prepData.strategy_and_news.strategic_themes.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <h4 className="text-white font-semibold">Strategic Themes</h4>
                          <span className="text-xs text-gray-400 bg-gray-500/20 px-2 py-0.5 rounded">AI Analysis</span>
                        </div>
                        <div className="space-y-3">
                          {prepData.strategy_and_news.strategic_themes.map((theme, idx) => (
                            <div key={idx} className="bg-white/5 p-4 rounded-lg">
                              <h5 className="text-white font-medium mb-2">{theme.theme}</h5>
                              <p className="text-gray-300 text-sm">{theme.rationale}</p>
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
                    <h4 className="text-white font-semibold mb-3">Sources Consulted</h4>
                    <div className="space-y-2">
                      {companyResearch.sources_consulted.map((source, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-400">{source.type.replace('_', ' ').toUpperCase()}:</span>
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
                <div className="mt-6">
                  <button
                    onClick={() => setShowNotesFor(showNotesFor === 'strategy' ? null : 'strategy')}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    <FileText size={16} />
                    {notes.strategy ? 'Edit Notes' : 'Add Notes'}
                  </button>
                  {showNotesFor === 'strategy' && (
                    <textarea
                      value={notes.strategy || ''}
                      onChange={(e) => updateNote('strategy', e.target.value)}
                      placeholder="Add your notes about company strategy and news..."
                      className="w-full mt-3 bg-white/5 border border-white/20 rounded-lg p-4 text-gray-300 min-h-[100px]"
                    />
                  )}
                  {notes.strategy && showNotesFor !== 'strategy' && (
                    <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{notes.strategy}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Interview Preparation */}
          <section className="glass rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('preparation')}
              className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Interview Preparation</h2>
              </div>
              {expandedSections.preparation ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
            </button>

            {expandedSections.preparation && (
              <div className="px-8 pb-8">
                <div className="space-y-6">
                  {prepData.interview_preparation.research_tasks.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-3">Research Tasks</h4>
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
                                  <Square className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                )}
                              </button>
                              <span className={`text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
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
                      <h4 className="text-white font-semibold mb-3">Day-Of Checklist</h4>
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
                                  <Square className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                )}
                              </button>
                              <span className={`text-sm ${isChecked ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                                {item}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Questions to Ask */}
          <section className="glass rounded-3xl overflow-hidden">
            <button
              onClick={() => toggleSection('questions')}
              className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Questions to Ask</h2>
              </div>
              {expandedSections.questions ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
            </button>

            {expandedSections.questions && (
              <div className="px-8 pb-8">
                <div className="space-y-4 mb-6">
                  {Object.entries(prepData.questions_to_ask_interviewer).map(([category, questions]) => (
                    questions.length > 0 && (
                      <div key={category}>
                        <h4 className="text-white font-semibold mb-2 capitalize">{category}</h4>
                        <ul className="space-y-1">
                          {questions.map((q, idx) => (
                            <li key={idx} className="text-gray-300 text-sm flex gap-2">
                              <span className="text-white/40">?</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}

                  {/* Custom Questions */}
                  {customQuestions.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold mb-2">Your Questions</h4>
                      <ul className="space-y-2">
                        {customQuestions.map((q) => (
                          <li key={q.id} className="flex items-start justify-between gap-2 bg-white/5 p-3 rounded-lg">
                            <div className="flex gap-2 flex-1">
                              <span className="text-white/40">?</span>
                              <span className="text-gray-300 text-sm">{q.question}</span>
                            </div>
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
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-white text-sm"
                  >
                    <Plus size={16} />
                    Add Your Question
                  </button>
                ) : (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="What's your question?"
                      className="w-full bg-white/5 border border-white/20 rounded-lg p-3 mb-3 text-white"
                    />
                    <select
                      value={newQuestionCategory}
                      onChange={(e) => setNewQuestionCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/20 rounded-lg p-3 mb-3 text-white"
                    >
                      <option value="product">Product</option>
                      <option value="team">Team</option>
                      <option value="culture">Culture</option>
                      <option value="performance">Performance</option>
                      <option value="strategy">Strategy</option>
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
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors text-sm"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Practice Questions */}
        {(prepData.interview_preparation.practice_questions_for_candidate.length > 0 || (interviewQuestions && interviewQuestions.questions.length > 0)) && (
          <section className="glass rounded-3xl mt-6 overflow-hidden">
            <button
              onClick={() => toggleSection('practice')}
              className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Practice Questions</h2>
                {interviewQuestions && interviewQuestions.total_questions > 0 && (
                  <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">
                    {interviewQuestions.total_questions} Real Questions
                  </span>
                )}
              </div>
              {expandedSections.practice ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
            </button>

            {expandedSections.practice && (
              <div className="px-8 pb-8">
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={startPracticeMode}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                  >
                    <PlayCircle size={18} />
                    Start Practice Session
                  </button>
                </div>

                {/* Real Interview Questions */}
                {interviewQuestions && interviewQuestions.questions && interviewQuestions.questions.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="text-white font-semibold">Real Interview Questions from {interviewQuestions.company_name}</h4>
                      <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">From {interviewQuestions.sources.join(', ')}</span>
                    </div>

                    {/* Question Type Breakdown */}
                    {interviewQuestions.question_types && Object.keys(interviewQuestions.question_types).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(interviewQuestions.question_types).map(([type, count]) => (
                          <span key={type} className="text-xs text-gray-300 bg-white/10 px-2 py-1 rounded">
                            {type}: {count}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-4">
                      {interviewQuestions.questions.map((q, idx) => {
                        const itemId = `real-practice-${idx}`
                        const isChecked = checkedItems[itemId] || false

                        // Difficulty color coding
                        const difficultyColors = {
                          easy: 'text-green-400 bg-green-500/20',
                          medium: 'text-yellow-400 bg-yellow-500/20',
                          hard: 'text-red-400 bg-red-500/20'
                        }

                        // Type color coding
                        const typeColors = {
                          behavioral: 'text-purple-400 bg-purple-500/20',
                          technical: 'text-blue-400 bg-blue-500/20',
                          situational: 'text-cyan-400 bg-cyan-500/20',
                          case_study: 'text-pink-400 bg-pink-500/20',
                          general: 'text-gray-400 bg-gray-500/20'
                        }

                        return (
                          <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="flex items-start gap-3 mb-3">
                              <button
                                onClick={() => toggleCheck(itemId)}
                                className="mt-0.5 flex-shrink-0"
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-5 h-5 text-green-500" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
                                )}
                              </button>
                              <div className="flex-1">
                                <p className={`font-medium mb-2 ${isChecked ? 'text-gray-500 line-through' : 'text-white'}`}>
                                  {q.question}
                                </p>

                                {/* Metadata */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                  <span className={`text-xs px-2 py-0.5 rounded ${typeColors[q.type as keyof typeof typeColors] || typeColors.general}`}>
                                    {q.type}
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded ${difficultyColors[q.difficulty as keyof typeof difficultyColors] || difficultyColors.medium}`}>
                                    {q.difficulty}
                                  </span>
                                  {q.frequency && (
                                    <span className="text-xs text-orange-400 bg-orange-500/20 px-2 py-0.5 rounded">
                                      {q.frequency} frequency
                                    </span>
                                  )}
                                </div>

                                {/* Context & Tips */}
                                {q.context && (
                                  <p className="text-gray-400 text-sm mb-1">
                                    <span className="text-gray-500">Context:</span> {q.context}
                                  </p>
                                )}
                                {q.tips && (
                                  <p className="text-blue-300 text-sm italic mb-2">
                                    💡 {q.tips}
                                  </p>
                                )}

                                {/* Source */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>Source: {q.source}</span>
                                  {q.source_url && (
                                    <a
                                      href={q.source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:underline"
                                    >
                                      View →
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* AI-Generated Questions (Fallback) */}
                {(!interviewQuestions || interviewQuestions.questions.length === 0) && prepData.interview_preparation.practice_questions_for_candidate.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <h4 className="text-white font-semibold">AI-Generated Practice Questions</h4>
                      <span className="text-xs text-gray-400 bg-gray-500/20 px-2 py-0.5 rounded">AI Analysis</span>
                    </div>
                    <div className="space-y-3">
                      {prepData.interview_preparation.practice_questions_for_candidate.map((q, idx) => {
                        const itemId = `practice-${idx}`
                        const isChecked = checkedItems[itemId] || false
                        return (
                          <div key={idx} className="flex items-start gap-3 bg-white/5 p-4 rounded-lg group">
                            <button
                              onClick={() => toggleCheck(itemId)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-green-500" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                              )}
                            </button>
                            <p className={`font-medium flex-1 ${isChecked ? 'text-gray-500 line-through' : 'text-white'}`}>{q}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Common Interview Questions People Struggle With */}
        {interviewPrepId && (
          <section className="glass rounded-3xl mt-6 overflow-hidden">
            <button
              onClick={() => toggleSection('commonQuestions')}
              className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Common Interview Questions People Struggle With</h2>
              </div>
              {expandedSections.commonQuestions ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
            </button>

            {expandedSections.commonQuestions && (
              <div className="px-8 pb-8">
                <CommonInterviewQuestions
                  interviewPrepId={interviewPrepId}
                  companyName={prepData?.company_profile.name || ''}
                  jobTitle={prepData?.role_analysis.job_title || ''}
                />
              </div>
            )}
          </section>
        )}

        {/* Recommended Certifications */}
        {prepData && (
          <section className="glass rounded-3xl mt-6 overflow-hidden">
            <button
              onClick={() => toggleSection('certifications')}
              className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">Recommended Certifications for This Career Path</h2>
              </div>
              {expandedSections.certifications ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
            </button>

            {expandedSections.certifications && (
              <div className="px-8 pb-8">
                <CertificationRecommendations
                  certifications={certifications}
                  loading={loadingCertifications}
                />
              </div>
            )}
          </section>
        )}

        {/* Candidate Positioning */}
        <section className="glass rounded-3xl mt-6 overflow-hidden">
          <button
            onClick={() => toggleSection('positioning')}
            className="w-full p-8 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Candidate Positioning</h2>
            </div>
            {expandedSections.positioning ? <ChevronDown className="w-6 h-6 text-white" /> : <ChevronRight className="w-6 h-6 text-white" />}
          </button>

          {expandedSections.positioning && (
            <div className="px-8 pb-8">
              <div className="space-y-6">
                {prepData.candidate_positioning.resume_focus_areas.length > 0 && (
                  <div>
                    <h4 className="text-white font-semibold mb-3">Resume Focus Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {prepData.candidate_positioning.resume_focus_areas.map((area, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI-Generated STAR Stories Builder - Always visible */}
                <div>
                  <STARStoryBuilder
                    tailoredResumeId={Number(tailoredResumeId)}
                    experiences={baseResumeExperiences}
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
                    <h4 className="text-white font-semibold mb-3">Keyword Mapping</h4>
                    <div className="space-y-2">
                      {prepData.candidate_positioning.keyword_map.map((mapping, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <span className="text-blue-400 font-medium">{mapping.company_term}</span>
                          <span className="text-gray-500">→</span>
                          <span className="text-green-400">{mapping.candidate_equivalent}</span>
                          <span className="text-gray-500 flex-1">({mapping.context})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Practice Mode Modal with Video Recording */}
        {practiceMode && (
          <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
            <div className="container mx-auto px-6 py-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-white">Practice Session</h2>
                  <button
                    onClick={exitPractice}
                    className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium"
                  >
                    Exit Practice
                  </button>
                </div>

                <VideoRecorder
                  questions={
                    interviewQuestions && interviewQuestions.questions.length > 0
                      ? interviewQuestions.questions.map(q => q.question)
                      : prepData.interview_preparation.practice_questions_for_candidate
                  }
                  onRecordingComplete={(recording) => {
                    console.log('Recording saved:', recording)
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
