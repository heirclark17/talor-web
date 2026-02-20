import React, { useState, useEffect, useCallback } from 'react'
import { getApiHeaders } from '../api/client'
import AILoadingScreen from './AILoadingScreen'
import {
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Brain,
  Code,
  CheckCircle2,
  Lightbulb,
  Target,
  AlertTriangle,
  Save,
  Edit,
  X,
  BookOpen,
  Zap,
  TrendingUp,
  Award,
  HelpCircle,
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app')

interface StarPrompt {
  situation_hint: string
  task_hint: string
  action_hint: string
  result_hint: string
}

interface BehavioralQuestion {
  id: number
  question: string
  category: string
  competency_tested: string
  why_asked: string
  difficulty: string
  star_prompt: StarPrompt
  key_themes: string[]
  common_mistakes: string[]
  job_alignment: string
}

interface SkillLeverage {
  relevant_experience: string
  talking_points: string[]
  skill_bridge: string
}

interface TechnicalQuestion {
  id: number
  question: string
  category: string
  technology_focus: string[]
  difficulty: string
  expected_answer_points: string[]
  candidate_skill_leverage: SkillLeverage
  follow_up_questions: string[]
  red_flags: string[]
  job_alignment: string
}

interface TransferableSkill {
  candidate_skill: string
  applies_to: string
  how_to_discuss: string
}

interface TechStackAnalysis {
  company_technologies: string[]
  candidate_matching_skills: string[]
  skill_gaps: string[]
  transferable_skills: TransferableSkill[]
}

interface QuestionsData {
  company_name: string
  job_title: string
  company_tech_stack: {
    tech_stack: string[]
    tools_and_platforms: string[]
    frameworks: string[]
    cloud_infrastructure: string[]
    security_tools: string[]
    methodologies: string[]
    sources?: Array<{ title: string; url: string }>
  }
  behavioral: {
    questions: BehavioralQuestion[]
    preparation_tips: string[]
    company_context: string
  }
  technical: {
    tech_stack_analysis: TechStackAnalysis
    questions: TechnicalQuestion[]
    preparation_strategy: {
      high_priority_topics: string[]
      recommended_study_areas: string[]
      hands_on_practice: string[]
    }
  }
  summary: {
    total_questions: number
    behavioral_count: number
    technical_count: number
    skill_matches: number
    skill_gaps: number
  }
}

interface StarStory {
  situation: string
  task: string
  action: string
  result: string
}

interface Props {
  interviewPrepId: number
  companyName: string
  jobTitle: string
}

export default function BehavioralTechnicalQuestions({ interviewPrepId, companyName, jobTitle }: Props) {
  const [loading, setLoading] = useState(false)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questionsData, setQuestionsData] = useState<QuestionsData | null>(null)
  const [activeTab, setActiveTab] = useState<'behavioral' | 'technical'>('behavioral')

  // STAR story editing state
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [starStories, setStarStories] = useState<Record<string, StarStory>>({})
  const [savingStory, setSavingStory] = useState(false)

  // AI-generated STAR stories state
  const [aiGeneratingStory, setAiGeneratingStory] = useState<Record<string, boolean>>({})
  const [aiGeneratedStories, setAiGeneratedStories] = useState<Record<string, StarStory>>({})

  // Expanded questions state
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  // Load saved stories from DB first, fallback to localStorage
  useEffect(() => {
    const loadSavedStories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/interview-prep/practice-responses/${interviewPrepId}`, {
          headers: getApiHeaders(),
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success && result.data?.responses?.length > 0) {
            const dbStories: Record<string, StarStory> = {}
            for (const r of result.data.responses) {
              const key = r.question_key || `${r.question_category}_${r.id}`
              if (r.star_story) {
                dbStories[key] = {
                  situation: r.star_story.situation || '',
                  task: r.star_story.task || '',
                  action: r.star_story.action || '',
                  result: r.star_story.result || '',
                }
              }
            }
            if (Object.keys(dbStories).length > 0) {
              setStarStories(dbStories)
              setAiGeneratedStories(dbStories)
              // Sync to localStorage as cache
              localStorage.setItem(`bt-questions-stories-${interviewPrepId}`, JSON.stringify(dbStories))
              return
            }
          }
        }
      } catch (err) {
        console.error('Failed to load stories from DB, falling back to localStorage:', err)
      }
      // Fallback to localStorage
      const saved = localStorage.getItem(`bt-questions-stories-${interviewPrepId}`)
      if (saved) {
        setStarStories(JSON.parse(saved))
      }
    }
    loadSavedStories()
  }, [interviewPrepId])

  const generateQuestions = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-prep/generate-behavioral-technical-questions`, {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ interview_prep_id: interviewPrepId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 404) {
          throw new Error('Interview prep not found. The tailored resume may have been deleted. Please go back and create a new tailored resume.')
        }
        throw new Error(errorData.detail || 'Failed to generate questions')
      }

      const result = await response.json()
      if (result.success) {
        setQuestionsData(result.data)
        // Signal completion so progress bar reaches 100% before unmount
        setLoadingComplete(true)
        await new Promise(r => setTimeout(r, 600))
        setLoadingComplete(false)
        setLoading(false)
      } else {
        throw new Error(result.error || 'Failed to generate questions')
      }
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  // Generate AI STAR story for a behavioral question
  const generateAiStarStory = useCallback(async (questionKey: string, questionText: string) => {
    // Don't regenerate if already exists or is being generated
    if (aiGeneratedStories[questionKey] || aiGeneratingStory[questionKey] || starStories[questionKey]) {
      return
    }

    setAiGeneratingStory(prev => ({ ...prev, [questionKey]: true }))

    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-prep/generate-practice-star-story`, {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          interview_prep_id: interviewPrepId,
          question: questionText,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.star_story) {
          const story = result.data.star_story
          const storyData: StarStory = {
            situation: story.situation || '',
            task: story.task || '',
            action: story.action || '',
            result: story.result || '',
          }
          setAiGeneratedStories(prev => ({
            ...prev,
            [questionKey]: storyData,
          }))
          // Fire-and-forget: persist AI story to DB immediately
          const questionType = questionKey.startsWith('behavioral_') ? 'behavioral' : 'technical'
          const questionId = parseInt(questionKey.split('_')[1]) || 0
          fetch(`${API_BASE_URL}/api/interview-prep/save-question-star-story`, {
            method: 'POST',
            headers: getApiHeaders({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({
              interview_prep_id: interviewPrepId,
              question_id: questionId,
              question_text: questionText,
              question_type: questionType,
              star_story: storyData,
              question_key: questionKey,
            }),
          }).catch(err => console.error('Failed to auto-save AI story to DB:', err))
        }
      }
    } catch (err) {
      console.error('Failed to generate AI STAR story:', err)
    } finally {
      setAiGeneratingStory(prev => ({ ...prev, [questionKey]: false }))
    }
  }, [interviewPrepId, aiGeneratedStories, aiGeneratingStory, starStories])

  const toggleQuestion = (questionKey: string, questionText?: string) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(questionKey)) {
      newExpanded.delete(questionKey)
    } else {
      newExpanded.add(questionKey)
      // Auto-generate AI STAR story when expanding any question
      if (questionText) {
        generateAiStarStory(questionKey, questionText)
      }
    }
    setExpandedQuestions(newExpanded)
  }

  const updateStarStory = (questionKey: string, field: keyof StarStory, value: string) => {
    const story = starStories[questionKey] || { situation: '', task: '', action: '', result: '' }
    const updated = { ...starStories, [questionKey]: { ...story, [field]: value } }
    setStarStories(updated)
    localStorage.setItem(`bt-questions-stories-${interviewPrepId}`, JSON.stringify(updated))
  }

  const saveStarStory = async (questionKey: string, questionText: string, questionType: 'behavioral' | 'technical') => {
    const story = starStories[questionKey]
    if (!story) return

    setSavingStory(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/interview-prep/save-question-star-story`, {
        method: 'POST',
        headers: getApiHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          interview_prep_id: interviewPrepId,
          question_id: parseInt(questionKey.split('_')[1]),
          question_text: questionText,
          question_type: questionType,
          star_story: story,
          question_key: questionKey,
        }),
      })

      if (response.ok) {
        setEditingQuestionId(null)
      }
    } catch (err) {
      console.error('Failed to save STAR story:', err)
    } finally {
      setSavingStory(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-400 bg-green-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'hard': return 'text-red-400 bg-red-500/20'
      default: return 'text-theme-secondary bg-gray-500/20'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      leadership: 'text-purple-400 bg-purple-500/20',
      teamwork: 'text-blue-400 bg-blue-500/20',
      problem_solving: 'text-green-400 bg-green-500/20',
      communication: 'text-cyan-400 bg-cyan-500/20',
      adaptability: 'text-orange-400 bg-orange-500/20',
      conflict_resolution: 'text-red-400 bg-red-500/20',
      initiative: 'text-yellow-400 bg-yellow-500/20',
      decision_making: 'text-pink-400 bg-pink-500/20',
      time_management: 'text-indigo-400 bg-indigo-500/20',
      customer_focus: 'text-emerald-400 bg-emerald-500/20',
      system_design: 'text-purple-400 bg-purple-500/20',
      coding: 'text-green-400 bg-green-500/20',
      debugging: 'text-red-400 bg-red-500/20',
      architecture: 'text-blue-400 bg-blue-500/20',
      security: 'text-orange-400 bg-orange-500/20',
      devops: 'text-cyan-400 bg-cyan-500/20',
      database: 'text-yellow-400 bg-yellow-500/20',
      api: 'text-pink-400 bg-pink-500/20',
      cloud: 'text-indigo-400 bg-indigo-500/20',
      performance: 'text-emerald-400 bg-emerald-500/20',
    }
    return colors[category.toLowerCase()] || 'text-theme-secondary bg-gray-500/20'
  }

  // Initial state - show generate button
  if (!questionsData && !loading) {
    return (
      <div className="bg-theme-glass-5 rounded-2xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            <Brain className="w-12 h-12 text-purple-400" />
            <Code className="w-12 h-12 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-theme">Behavioral & Technical Questions</h3>
          <p className="text-theme-secondary max-w-md">
            Generate 10 behavioral and 10 technical interview questions specifically aligned to this role at {companyName}.
            Includes STAR story prompts and tech stack analysis.
          </p>
          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          <button
            onClick={generateQuestions}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium transition-all"
          >
            <Zap className="w-5 h-5" />
            Generate Interview Questions
          </button>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <AILoadingScreen
        title="Generating Interview Questions"
        subtitle={`Researching ${companyName}'s tech stack and creating 20 tailored questions`}
        footnote="This may take 30-45 seconds"
        fullScreen={false}
        steps={[
          { id: 'research', label: 'Researching company tech stack', description: `Analyzing ${companyName}'s technology environment...` },
          { id: 'behavioral', label: 'Creating behavioral questions', description: 'Generating STAR-format questions from your experience...' },
          { id: 'technical', label: 'Building technical questions', description: 'Creating role-specific technical scenarios...' },
          { id: 'finalize', label: 'Finalizing question set', description: 'Organizing and prioritizing questions...' },
        ]}
        progress={{ type: 'estimated', estimatedDurationMs: 40000, isComplete: loadingComplete }}
      />
    )
  }

  if (!questionsData) return null

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-theme-glass-5 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-theme">{questionsData.summary.total_questions}</div>
          <div className="text-sm text-theme-secondary">Total Questions</div>
        </div>
        <div className="bg-purple-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{questionsData.summary.behavioral_count}</div>
          <div className="text-sm text-theme-secondary">Behavioral</div>
        </div>
        <div className="bg-blue-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{questionsData.summary.technical_count}</div>
          <div className="text-sm text-theme-secondary">Technical</div>
        </div>
        <div className="bg-green-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{questionsData.summary.skill_matches}</div>
          <div className="text-sm text-theme-secondary">Skill Matches</div>
        </div>
        <div className="bg-orange-500/20 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-orange-400">{questionsData.summary.skill_gaps}</div>
          <div className="text-sm text-theme-secondary">Skill Gaps</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-theme-glass-5 rounded-xl">
        <button
          onClick={() => setActiveTab('behavioral')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'behavioral'
              ? 'bg-purple-600 text-white'
              : 'text-theme-secondary hover:text-theme hover:bg-theme-glass-5'
          }`}
        >
          <Brain className="w-5 h-5" />
          Behavioral Questions
        </button>
        <button
          onClick={() => setActiveTab('technical')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
            activeTab === 'technical'
              ? 'bg-blue-600 text-white'
              : 'text-theme-secondary hover:text-theme hover:bg-theme-glass-5'
          }`}
        >
          <Code className="w-5 h-5" />
          Technical Questions
        </button>
      </div>

      {/* Behavioral Tab Content */}
      {activeTab === 'behavioral' && (
        <div className="space-y-6">
          {/* Preparation Tips */}
          {questionsData.behavioral.preparation_tips.length > 0 && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Preparation Tips
              </h4>
              <ul className="space-y-2">
                {questionsData.behavioral.preparation_tips.map((tip, idx) => (
                  <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                    <span className="text-purple-400">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Company Context */}
          {questionsData.behavioral.company_context && (
            <div className="bg-theme-glass-5 rounded-xl p-4">
              <h4 className="text-theme font-semibold mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                Company Context for Answers
              </h4>
              <p className="text-theme-secondary text-sm">{questionsData.behavioral.company_context}</p>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-4">
            {questionsData.behavioral.questions.map((question) => {
              const questionKey = `behavioral_${question.id}`
              const isExpanded = expandedQuestions.has(questionKey)
              const isEditing = editingQuestionId === questionKey
              const story = starStories[questionKey]
              const aiStory = aiGeneratedStories[questionKey]
              const isGeneratingAi = aiGeneratingStory[questionKey]
              const hasAnyStory = story || aiStory

              return (
                <div key={question.id} className="bg-theme-glass-5 rounded-xl overflow-hidden border border-theme-subtle">
                  {/* Question Header */}
                  <button
                    onClick={() => toggleQuestion(questionKey, question.question)}
                    className="w-full p-4 flex items-start gap-4 hover:bg-theme-glass-5 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                      {question.id}
                    </div>
                    <div className="flex-1">
                      <p className="text-theme font-medium mb-2">{question.question}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(question.category)}`}>
                          {question.category.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        {hasAnyStory && (
                          <span className="text-xs px-2 py-0.5 rounded text-green-400 bg-green-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {story ? 'Story Ready' : 'AI Story Generated'}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-theme-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-theme-secondary" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-4">
                      {/* Why Asked */}
                      <div>
                        <h5 className="text-theme-secondary text-sm font-medium mb-1 flex items-center gap-1">
                          <HelpCircle className="w-4 h-4" />
                          Why This Is Asked
                        </h5>
                        <p className="text-theme-secondary text-sm">{question.why_asked}</p>
                      </div>

                      {/* Competency & Job Alignment */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-theme-secondary text-sm font-medium mb-1">Competency Tested</h5>
                          <p className="text-purple-300 text-sm">{question.competency_tested}</p>
                        </div>
                        <div>
                          <h5 className="text-theme-secondary text-sm font-medium mb-1">Job Alignment</h5>
                          <p className="text-blue-300 text-sm">{question.job_alignment}</p>
                        </div>
                      </div>

                      {/* Key Themes */}
                      <div>
                        <h5 className="text-theme-secondary text-sm font-medium mb-2">Key Themes to Address</h5>
                        <div className="flex flex-wrap gap-2">
                          {question.key_themes.map((theme, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 rounded bg-theme-glass-10 text-theme-secondary">
                              {theme}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Common Mistakes */}
                      <div className="bg-red-500/10 rounded-lg p-3">
                        <h5 className="text-red-400 text-sm font-medium mb-2 flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          Common Mistakes to Avoid
                        </h5>
                        <ul className="space-y-1">
                          {question.common_mistakes.map((mistake, idx) => (
                            <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                              <span className="text-red-400">×</span>
                              {mistake}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* STAR Story Section */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-theme font-semibold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                            Your STAR Story
                            {aiStory && !story && (
                              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/30 text-purple-300 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Generated
                              </span>
                            )}
                          </h5>
                          {!isEditing && !isGeneratingAi && (
                            <div className="flex items-center gap-2">
                              {aiStory && !story && (
                                <button
                                  onClick={() => {
                                    // Clear AI story and regenerate
                                    setAiGeneratedStories(prev => {
                                      const updated = { ...prev }
                                      delete updated[questionKey]
                                      return updated
                                    })
                                    generateAiStarStory(questionKey, question.question)
                                  }}
                                  className="flex items-center gap-1 text-sm text-theme-secondary hover:text-theme"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Regenerate
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  // If AI story exists but no user story, copy AI story to user story for editing
                                  if (aiStory && !story) {
                                    setStarStories(prev => ({
                                      ...prev,
                                      [questionKey]: { ...aiStory }
                                    }))
                                  }
                                  setEditingQuestionId(questionKey)
                                }}
                                className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300"
                              >
                                <Edit className="w-4 h-4" />
                                {story ? 'Edit' : aiStory ? 'Edit AI Story' : 'Create'} Story
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Loading state for AI generation */}
                        {isGeneratingAi && (
                          <div className="text-center py-6">
                            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-3" />
                            <p className="text-theme-secondary text-sm">Generating AI STAR story based on your resume...</p>
                            <p className="text-theme-tertiary text-xs mt-1">This uses your experience to craft a compelling answer</p>
                          </div>
                        )}

                        {!isGeneratingAi && isEditing ? (
                          <div className="space-y-4">
                            {/* STAR Prompts */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="text-sm">
                                <span className="text-green-400 font-medium">Situation Hint:</span>
                                <p className="text-theme-secondary">{question.star_prompt.situation_hint}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-blue-400 font-medium">Task Hint:</span>
                                <p className="text-theme-secondary">{question.star_prompt.task_hint}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-purple-400 font-medium">Action Hint:</span>
                                <p className="text-theme-secondary">{question.star_prompt.action_hint}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-yellow-400 font-medium">Result Hint:</span>
                                <p className="text-theme-secondary">{question.star_prompt.result_hint}</p>
                              </div>
                            </div>

                            {/* STAR Story Inputs */}
                            <div className="space-y-3">
                              <div>
                                <label className="block text-green-400 text-sm font-medium mb-1">Situation (15%)</label>
                                <textarea
                                  value={story?.situation || ''}
                                  onChange={(e) => updateStarStory(questionKey, 'situation', e.target.value)}
                                  placeholder="Set the scene: What was the context? When and where did this happen?"
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme-secondary text-sm min-h-[80px]"
                                />
                              </div>
                              <div>
                                <label className="block text-blue-400 text-sm font-medium mb-1">Task (10%)</label>
                                <textarea
                                  value={story?.task || ''}
                                  onChange={(e) => updateStarStory(questionKey, 'task', e.target.value)}
                                  placeholder="What was your responsibility? What needed to be accomplished?"
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme-secondary text-sm min-h-[60px]"
                                />
                              </div>
                              <div>
                                <label className="block text-purple-400 text-sm font-medium mb-1">Action (60%) - Most Important!</label>
                                <textarea
                                  value={story?.action || ''}
                                  onChange={(e) => updateStarStory(questionKey, 'action', e.target.value)}
                                  placeholder="What specific steps did YOU take? Be detailed about your personal contribution."
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme-secondary text-sm min-h-[120px]"
                                />
                              </div>
                              <div>
                                <label className="block text-yellow-400 text-sm font-medium mb-1">Result (15%)</label>
                                <textarea
                                  value={story?.result || ''}
                                  onChange={(e) => updateStarStory(questionKey, 'result', e.target.value)}
                                  placeholder="What was the outcome? Include specific metrics and impact."
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme-secondary text-sm min-h-[80px]"
                                />
                              </div>
                            </div>

                            {/* Save/Cancel Buttons */}
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingQuestionId(null)}
                                className="flex items-center gap-1 px-4 py-2 text-theme-secondary hover:text-theme"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                              <button
                                onClick={() => saveStarStory(questionKey, question.question, 'behavioral')}
                                disabled={savingStory}
                                className="flex items-center gap-1 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg"
                              >
                                {savingStory ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                Save Story
                              </button>
                            </div>
                          </div>
                        ) : !isGeneratingAi && story ? (
                          /* User-edited story takes priority */
                          <div className="space-y-3">
                            <div>
                              <span className="text-green-400 text-xs font-medium">SITUATION</span>
                              <p className="text-theme-secondary text-sm">{story.situation}</p>
                            </div>
                            <div>
                              <span className="text-blue-400 text-xs font-medium">TASK</span>
                              <p className="text-theme-secondary text-sm">{story.task}</p>
                            </div>
                            <div>
                              <span className="text-purple-400 text-xs font-medium">ACTION</span>
                              <p className="text-theme-secondary text-sm">{story.action}</p>
                            </div>
                            <div>
                              <span className="text-yellow-400 text-xs font-medium">RESULT</span>
                              <p className="text-theme-secondary text-sm">{story.result}</p>
                            </div>
                          </div>
                        ) : !isGeneratingAi && aiStory ? (
                          /* AI-generated story display */
                          <div className="space-y-3">
                            <div>
                              <span className="text-green-400 text-xs font-medium">SITUATION</span>
                              <p className="text-theme-secondary text-sm">{aiStory.situation}</p>
                            </div>
                            <div>
                              <span className="text-blue-400 text-xs font-medium">TASK</span>
                              <p className="text-theme-secondary text-sm">{aiStory.task}</p>
                            </div>
                            <div>
                              <span className="text-purple-400 text-xs font-medium">ACTION</span>
                              <p className="text-theme-secondary text-sm">{aiStory.action}</p>
                            </div>
                            <div>
                              <span className="text-yellow-400 text-xs font-medium">RESULT</span>
                              <p className="text-theme-secondary text-sm">{aiStory.result}</p>
                            </div>
                            <div className="pt-2 text-center">
                              <p className="text-theme-tertiary text-xs">Click "Edit AI Story" above to customize this response</p>
                            </div>
                          </div>
                        ) : !isGeneratingAi ? (
                          <div className="text-center py-4">
                            <p className="text-theme-secondary text-sm mb-2">AI story generation failed</p>
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => generateAiStarStory(questionKey, question.question)}
                                className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                              </button>
                              <button
                                onClick={() => setEditingQuestionId(questionKey)}
                                className="text-theme-secondary hover:text-theme text-sm flex items-center gap-1"
                              >
                                <Edit className="w-4 h-4" />
                                Write Manually
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Technical Tab Content */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          {/* Tech Stack Analysis */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <h4 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Tech Stack Analysis
            </h4>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Company Tech Stack */}
              <div>
                <h5 className="text-theme text-sm font-medium mb-2">Company's Tech Stack</h5>
                <div className="flex flex-wrap gap-2">
                  {[
                    ...questionsData.company_tech_stack.tech_stack,
                    ...questionsData.company_tech_stack.frameworks,
                    ...questionsData.company_tech_stack.tools_and_platforms.slice(0, 5),
                  ].slice(0, 12).map((tech, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Your Matching Skills */}
              <div>
                <h5 className="text-theme text-sm font-medium mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  Your Matching Skills
                </h5>
                <div className="flex flex-wrap gap-2">
                  {questionsData.technical.tech_stack_analysis.candidate_matching_skills.map((skill, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skill Gaps */}
              {questionsData.technical.tech_stack_analysis.skill_gaps.length > 0 && (
                <div>
                  <h5 className="text-theme text-sm font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Skills to Study
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {questionsData.technical.tech_stack_analysis.skill_gaps.map((gap, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-300">
                        {gap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Transferable Skills */}
              {questionsData.technical.tech_stack_analysis.transferable_skills.length > 0 && (
                <div>
                  <h5 className="text-theme text-sm font-medium mb-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    Transferable Skills
                  </h5>
                  <div className="space-y-2">
                    {questionsData.technical.tech_stack_analysis.transferable_skills.slice(0, 3).map((skill, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-purple-300">{skill.candidate_skill}</span>
                        <span className="text-theme-tertiary"> → </span>
                        <span className="text-blue-300">{skill.applies_to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preparation Strategy */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-theme-glass-5 rounded-xl p-4">
              <h5 className="text-theme font-medium mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-red-400" />
                High Priority Topics
              </h5>
              <ul className="space-y-1">
                {questionsData.technical.preparation_strategy.high_priority_topics.slice(0, 5).map((topic, idx) => (
                  <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                    <span className="text-red-400">•</span>
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-theme-glass-5 rounded-xl p-4">
              <h5 className="text-theme font-medium mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                Study Areas
              </h5>
              <ul className="space-y-1">
                {questionsData.technical.preparation_strategy.recommended_study_areas.slice(0, 5).map((area, idx) => (
                  <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                    <span className="text-blue-400">•</span>
                    {area}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-theme-glass-5 rounded-xl p-4">
              <h5 className="text-theme font-medium mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Hands-On Practice
              </h5>
              <ul className="space-y-1">
                {questionsData.technical.preparation_strategy.hands_on_practice.slice(0, 3).map((practice, idx) => (
                  <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                    <span className="text-yellow-400">•</span>
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questionsData.technical.questions.map((question) => {
              const questionKey = `technical_${question.id}`
              const isExpanded = expandedQuestions.has(questionKey)
              const isEditing = editingQuestionId === questionKey
              const story = starStories[questionKey]
              const aiStory = aiGeneratedStories[questionKey]
              const isGeneratingAi = aiGeneratingStory[questionKey]

              return (
                <div key={question.id} className="bg-theme-glass-5 rounded-xl overflow-hidden border border-theme-subtle">
                  {/* Question Header */}
                  <button
                    onClick={() => toggleQuestion(questionKey, question.question)}
                    className="w-full p-4 flex items-start gap-4 hover:bg-theme-glass-5 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {question.id}
                    </div>
                    <div className="flex-1">
                      <p className="text-theme font-medium mb-2">{question.question}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(question.category)}`}>
                          {question.category.replace('_', ' ')}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </span>
                        {question.technology_focus.slice(0, 2).map((tech, idx) => (
                          <span key={idx} className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            {tech}
                          </span>
                        ))}
                        {(starStories[questionKey] || aiGeneratedStories[questionKey]) && (
                          <span className="text-xs px-2 py-0.5 rounded text-green-400 bg-green-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {starStories[questionKey] ? 'Story Ready' : 'AI Story Generated'}
                          </span>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-theme-secondary" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-theme-secondary" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="p-4 pt-0 space-y-4">
                      {/* Expected Answer Points */}
                      <div>
                        <h5 className="text-theme text-sm font-medium mb-2 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          Expected Answer Points
                        </h5>
                        <ul className="space-y-1">
                          {question.expected_answer_points.map((point, idx) => (
                            <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                              <span className="text-green-400">{idx + 1}.</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Your Skill Leverage */}
                      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-4">
                        <h5 className="text-theme font-semibold mb-3 flex items-center gap-2">
                          <Award className="w-5 h-5 text-green-400" />
                          How to Leverage Your Experience
                        </h5>
                        <div className="space-y-3">
                          <div>
                            <span className="text-green-400 text-sm font-medium">Your Relevant Experience:</span>
                            <p className="text-theme-secondary text-sm">{question.candidate_skill_leverage.relevant_experience}</p>
                          </div>
                          {question.candidate_skill_leverage.talking_points.length > 0 && (
                            <div>
                              <span className="text-blue-400 text-sm font-medium">Talking Points:</span>
                              <ul className="mt-1 space-y-1">
                                {question.candidate_skill_leverage.talking_points.map((point, idx) => (
                                  <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                                    <span className="text-blue-400">•</span>
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {question.candidate_skill_leverage.skill_bridge && (
                            <div>
                              <span className="text-purple-400 text-sm font-medium">Skill Bridge:</span>
                              <p className="text-theme-secondary text-sm">{question.candidate_skill_leverage.skill_bridge}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Follow-up Questions */}
                      {question.follow_up_questions.length > 0 && (
                        <div>
                          <h5 className="text-theme-secondary text-sm font-medium mb-2">Likely Follow-up Questions</h5>
                          <ul className="space-y-1">
                            {question.follow_up_questions.map((fq, idx) => (
                              <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                                <span className="text-yellow-400">?</span>
                                {fq}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Red Flags */}
                      {question.red_flags.length > 0 && (
                        <div className="bg-red-500/10 rounded-lg p-3">
                          <h5 className="text-red-400 text-sm font-medium mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            Red Flags to Avoid
                          </h5>
                          <ul className="space-y-1">
                            {question.red_flags.map((flag, idx) => (
                              <li key={idx} className="text-theme-secondary text-sm flex gap-2">
                                <span className="text-red-400">×</span>
                                {flag}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Job Alignment */}
                      <div>
                        <h5 className="text-theme-secondary text-sm font-medium mb-1">Why This Matters for the Role</h5>
                        <p className="text-blue-300 text-sm">{question.job_alignment}</p>
                      </div>

                      {/* STAR Story Section for Technical Questions */}
                      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h5 className="text-theme font-semibold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                            Your STAR Story
                            {aiStory && !story && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Generated
                              </span>
                            )}
                          </h5>
                          {!isEditing && !isGeneratingAi && (
                            <div className="flex items-center gap-2">
                              {aiStory && !story && (
                                <button
                                  onClick={() => {
                                    setAiGeneratedStories(prev => {
                                      const updated = { ...prev }
                                      delete updated[questionKey]
                                      return updated
                                    })
                                    generateAiStarStory(questionKey, question.question)
                                  }}
                                  className="flex items-center gap-1 text-sm text-theme-secondary hover:text-theme"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Regenerate
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  if (aiStory && !story) {
                                    setStarStories(prev => ({
                                      ...prev,
                                      [questionKey]: { ...aiStory }
                                    }))
                                  }
                                  setEditingQuestionId(questionKey)
                                }}
                                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                              >
                                <Edit className="w-4 h-4" />
                                {story ? 'Edit' : aiStory ? 'Edit AI Story' : 'Create'} Story
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Loading state for AI generation */}
                        {isGeneratingAi && (
                          <div className="text-center py-6">
                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
                            <p className="text-theme-secondary text-sm">Generating AI STAR story based on your resume...</p>
                            <p className="text-theme-tertiary text-xs mt-1">This uses your experience to craft a compelling answer</p>
                          </div>
                        )}

                        {!isGeneratingAi && isEditing ? (
                          <div className="space-y-4">
                            {/* Hints from candidate_skill_leverage */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div className="text-sm">
                                <span className="text-green-400 font-medium">Situation Hint:</span>
                                <p className="text-theme-secondary">Think about: {question.candidate_skill_leverage.relevant_experience}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-blue-400 font-medium">Task/Action Hint:</span>
                                <p className="text-theme-secondary">{question.candidate_skill_leverage.talking_points?.[0] || 'Describe the specific steps you took'}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-cyan-400 font-medium">Action Detail:</span>
                                <p className="text-theme-secondary">{question.candidate_skill_leverage.skill_bridge || 'Bridge your experience to this technical domain'}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-yellow-400 font-medium">Result Hint:</span>
                                <p className="text-theme-secondary">Quantify impact related to: {question.job_alignment}</p>
                              </div>
                            </div>

                            {/* STAR Story Inputs */}
                            <div className="space-y-3">
                              <div>
                                <label className="block text-green-400 text-sm font-medium mb-1">Situation (15%)</label>
                                <textarea
                                  value={story?.situation || ''}
                                  onChange={(e) => updateStarStory(questionKey, 'situation', e.target.value)}
                                  placeholder="Set the scene: What was the technical challenge or context?"
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme-secondary text-sm min-h-[80px]"
                                />
                              </div>
                              <div>
                                <label className="block text-blue-400 text-sm font-medium mb-1">Task (10%)</label>
                                <textarea
                                  value={story?.task || ''}
                                  onChange={(e) => updateStarStory(questionKey, 'task', e.target.value)}
                                  placeholder="What technical problem needed to be solved?"
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme-secondary text-sm min-h-[60px]"
                                />
                              </div>
                              <div>
                                <label className="block text-cyan-400 text-sm font-medium mb-1">Action (60%) - Most Important!</label>
                                <textarea
                                  value={story?.action || ''}
                                  onChange={(e) => updateStarStory(questionKey, 'action', e.target.value)}
                                  placeholder="What technical approach did YOU take? Include specific technologies, methods, and decisions."
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme-secondary text-sm min-h-[120px]"
                                />
                              </div>
                              <div>
                                <label className="block text-yellow-400 text-sm font-medium mb-1">Result (15%)</label>
                                <textarea
                                  value={story?.result || ''}
                                  onChange={(e) => updateStarStory(questionKey, 'result', e.target.value)}
                                  placeholder="What was the measurable outcome? Performance gains, cost savings, etc."
                                  className="w-full bg-theme-glass-5 border border-theme-muted rounded-lg p-3 text-theme-secondary text-sm min-h-[80px]"
                                />
                              </div>
                            </div>

                            {/* Save/Cancel Buttons */}
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingQuestionId(null)}
                                className="flex items-center gap-1 px-4 py-2 text-theme-secondary hover:text-theme"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                              <button
                                onClick={() => saveStarStory(questionKey, question.question, 'technical')}
                                disabled={savingStory}
                                className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                              >
                                {savingStory ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                                Save Story
                              </button>
                            </div>
                          </div>
                        ) : !isGeneratingAi && story ? (
                          <div className="space-y-3">
                            <div>
                              <span className="text-green-400 text-xs font-medium">SITUATION</span>
                              <p className="text-theme-secondary text-sm">{story.situation}</p>
                            </div>
                            <div>
                              <span className="text-blue-400 text-xs font-medium">TASK</span>
                              <p className="text-theme-secondary text-sm">{story.task}</p>
                            </div>
                            <div>
                              <span className="text-cyan-400 text-xs font-medium">ACTION</span>
                              <p className="text-theme-secondary text-sm">{story.action}</p>
                            </div>
                            <div>
                              <span className="text-yellow-400 text-xs font-medium">RESULT</span>
                              <p className="text-theme-secondary text-sm">{story.result}</p>
                            </div>
                          </div>
                        ) : !isGeneratingAi && aiStory ? (
                          <div className="space-y-3">
                            <div>
                              <span className="text-green-400 text-xs font-medium">SITUATION</span>
                              <p className="text-theme-secondary text-sm">{aiStory.situation}</p>
                            </div>
                            <div>
                              <span className="text-blue-400 text-xs font-medium">TASK</span>
                              <p className="text-theme-secondary text-sm">{aiStory.task}</p>
                            </div>
                            <div>
                              <span className="text-cyan-400 text-xs font-medium">ACTION</span>
                              <p className="text-theme-secondary text-sm">{aiStory.action}</p>
                            </div>
                            <div>
                              <span className="text-yellow-400 text-xs font-medium">RESULT</span>
                              <p className="text-theme-secondary text-sm">{aiStory.result}</p>
                            </div>
                            <div className="pt-2 text-center">
                              <p className="text-theme-tertiary text-xs">Click "Edit AI Story" above to customize this response</p>
                            </div>
                          </div>
                        ) : !isGeneratingAi ? (
                          <div className="text-center py-4">
                            <p className="text-theme-secondary text-sm mb-2">AI story generation failed</p>
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => generateAiStarStory(questionKey, question.question)}
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                              </button>
                              <button
                                onClick={() => setEditingQuestionId(questionKey)}
                                className="text-theme-secondary hover:text-theme text-sm flex items-center gap-1"
                              >
                                <Edit className="w-4 h-4" />
                                Write Manually
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Regenerate Button */}
      <div className="text-center">
        <button
          onClick={generateQuestions}
          disabled={loading}
          className="text-theme-secondary hover:text-theme text-sm flex items-center gap-1 mx-auto"
        >
          <Zap className="w-4 h-4" />
          Regenerate Questions
        </button>
      </div>
    </div>
  )
}
