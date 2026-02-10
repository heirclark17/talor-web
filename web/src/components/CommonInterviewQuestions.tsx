import React, { useState } from 'react'
import { getUserId } from '../utils/userSession'
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Sparkles,
  AlertCircle,
  Edit3,
  BookOpen,
  MessageSquare,
  CheckCircle
} from 'lucide-react'
import AILoadingScreen from './AILoadingScreen'
import { CommonInterviewQuestion, CommonQuestionsData } from '../types/commonQuestions'
import { api } from '../api/client'

interface CommonInterviewQuestionsProps {
  interviewPrepId: number
  companyName: string
  jobTitle: string
}

type ActiveTab = 'why-hard' | 'mistakes' | 'builder' | 'answer'

export default function CommonInterviewQuestions({
  interviewPrepId,
  companyName,
  jobTitle
}: CommonInterviewQuestionsProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<CommonQuestionsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<Record<string, ActiveTab>>({})
  const [copiedAnswers, setCopiedAnswers] = useState<Set<string>>(new Set())
  const [regenerating, setRegenerating] = useState<Set<string>>(new Set())
  const [editingAnswers, setEditingAnswers] = useState<Record<string, string>>({})

  // Generate all 10 questions
  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${api['baseUrl']}/api/interview-prep/common-questions/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': getUserId()
        },
        body: JSON.stringify({
          interview_prep_id: interviewPrepId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate questions')
      }

      const result = await response.json()
      setData(result.data)
      // Auto-expand first question
      setExpandedQuestions(new Set(['q1']))
      // Set default tab for all questions
      const defaultTabs: Record<string, ActiveTab> = {}
      result.data.questions.forEach((q: CommonInterviewQuestion) => {
        defaultTabs[q.id] = 'why-hard'
      })
      setActiveTab(defaultTabs)
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  // Regenerate single question
  const handleRegenerate = async (questionId: string) => {
    setRegenerating(prev => new Set(prev).add(questionId))
    setError(null)

    try {
      const response = await fetch(`${api['baseUrl']}/api/interview-prep/common-questions/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': getUserId()
        },
        body: JSON.stringify({
          interview_prep_id: interviewPrepId,
          question_id: questionId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to regenerate question')
      }

      const result = await response.json()

      // Update the specific question in data
      if (data) {
        const updatedQuestions = data.questions.map(q =>
          q.id === questionId ? result.data : q
        )
        setData({ ...data, questions: updatedQuestions })
      }
    } catch (err: any) {
      setError(`Failed to regenerate: ${err.message}`)
    } finally {
      setRegenerating(prev => {
        const newSet = new Set(prev)
        newSet.delete(questionId)
        return newSet
      })
    }
  }

  // Toggle question expansion
  const toggleExpand = (questionId: string) => {
    const newSet = new Set(expandedQuestions)
    if (newSet.has(questionId)) {
      newSet.delete(questionId)
    } else {
      newSet.add(questionId)
    }
    setExpandedQuestions(newSet)
  }

  // Copy answer to clipboard
  const copyAnswer = async (questionId: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedAnswers(prev => new Set(prev).add(questionId))
      setTimeout(() => {
        setCopiedAnswers(prev => {
          const newSet = new Set(prev)
          newSet.delete(questionId)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Toggle edit mode for answer
  const toggleEdit = (questionId: string, currentText: string) => {
    if (editingAnswers[questionId]) {
      // Save and exit edit mode
      const newAnswers = { ...editingAnswers }
      delete newAnswers[questionId]
      setEditingAnswers(newAnswers)
    } else {
      // Enter edit mode
      setEditingAnswers({ ...editingAnswers, [questionId]: currentText })
    }
  }

  if (!data && !loading) {
    return (
      <div className="glass p-8 rounded-2xl">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            Common Interview Questions People Struggle With
          </h3>
          <p className="text-gray-400 mb-6">
            Get tailored answers for the 10 most challenging interview questions, customized to your resume and this specific role at {companyName}.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Each question includes detailed guidance, common mistakes to avoid, and ready-to-use answers you can practice and customize.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating tailored guidance...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Tailored Guidance
              </>
            )}
          </button>
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm text-left">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading && !data) {
    return (
      <AILoadingScreen
        title="Generating Interview Guidance"
        subtitle="Creating tailored questions and sample answers"
        footnote="This may take 30-60 seconds"
        fullScreen={false}
        steps={[
          { id: 'analyze', label: 'Analyzing role requirements', description: 'Reviewing job description and company context...' },
          { id: 'generate', label: 'Generating tailored questions', description: 'Creating role-specific interview questions...' },
          { id: 'answers', label: 'Building sample answers', description: 'Crafting answers using your experience...' },
        ]}
        progress={{ type: 'estimated', estimatedDurationMs: 45000, isComplete: false }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-400" />
              Common Interview Questions
            </h3>
            <p className="text-gray-400">
              Tailored for <span className="text-white font-semibold">{jobTitle}</span> at{' '}
              <span className="text-white font-semibold">{companyName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate All
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Built using STAR / Present-Past-Future best practices from Indeed, HBR, The Muse, and Big Interview
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {data?.questions.map((question, index) => {
          const isExpanded = expandedQuestions.has(question.id)
          const currentTab = activeTab[question.id] || 'why-hard'
          const isCopied = copiedAnswers.has(question.id)
          const isRegenerating = regenerating.has(question.id)
          const isEditing = editingAnswers.hasOwnProperty(question.id)
          const editedText = editingAnswers[question.id] || ''

          return (
            <div key={question.id} className="glass rounded-2xl overflow-hidden">
              {/* Question Header */}
              <button
                onClick={() => toggleExpand(question.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-4 text-left flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-purple-400">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">
                      {question.question}
                    </h4>
                    {!isExpanded && (
                      <p className="text-sm text-gray-400">Click to view guidance</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isExpanded && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRegenerate(question.id)
                      }}
                      disabled={isRegenerating}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      {isRegenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span className="text-white">Regenerate</span>
                    </button>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-white/10">
                  {/* Tabs */}
                  <div className="flex border-b border-white/10 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab({ ...activeTab, [question.id]: 'why-hard' })}
                      className={`px-6 py-3 text-sm font-medium transition-colors flex-shrink-0 ${
                        currentTab === 'why-hard'
                          ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Why It's Hard
                    </button>
                    <button
                      onClick={() => setActiveTab({ ...activeTab, [question.id]: 'mistakes' })}
                      className={`px-6 py-3 text-sm font-medium transition-colors flex-shrink-0 ${
                        currentTab === 'mistakes'
                          ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Common Mistakes
                    </button>
                    <button
                      onClick={() => setActiveTab({ ...activeTab, [question.id]: 'builder' })}
                      className={`px-6 py-3 text-sm font-medium transition-colors flex-shrink-0 ${
                        currentTab === 'builder'
                          ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      Answer Builder
                    </button>
                    <button
                      onClick={() => setActiveTab({ ...activeTab, [question.id]: 'answer' })}
                      className={`px-6 py-3 text-sm font-medium transition-colors flex-shrink-0 ${
                        currentTab === 'answer'
                          ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/5'
                          : 'text-gray-400 hover:text-gray-300'
                      }`}
                    >
                      What to Say
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {currentTab === 'why-hard' && (
                      <div>
                        <h5 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide">
                          Why This Question Is Challenging
                        </h5>
                        <p className="text-gray-300 leading-relaxed">
                          {question.why_hard}
                        </p>
                      </div>
                    )}

                    {currentTab === 'mistakes' && (
                      <div>
                        <h5 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide">
                          Common Mistakes to Avoid
                        </h5>
                        <ul className="space-y-2">
                          {question.common_mistakes.map((mistake, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-300">{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentTab === 'builder' && (
                      <div className="space-y-6">
                        {/* Structure */}
                        <div>
                          <h5 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Structure Your Answer
                          </h5>
                          <ol className="space-y-2">
                            {question.exceptional_answer_builder.structure.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-bold text-purple-400">{idx + 1}</span>
                                </div>
                                <span className="text-gray-300">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Customization Checklist */}
                        <div>
                          <h5 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <Edit3 className="w-4 h-4" />
                            Customization Checklist
                          </h5>
                          <ul className="space-y-2">
                            {question.exceptional_answer_builder.customization_checklist.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-300">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Strong Phrases */}
                        <div>
                          <h5 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                            <Sparkles className="w-4 h-4" />
                            Strong Phrases to Use
                          </h5>
                          <div className="space-y-2">
                            {question.exceptional_answer_builder.strong_phrases.map((phrase, idx) => (
                              <div key={idx} className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <p className="text-gray-200 italic">"{phrase}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {currentTab === 'answer' && (
                      <div className="space-y-6">
                        {/* Short Version */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
                              Short Version (60-120 words)
                            </h5>
                            <button
                              onClick={() => copyAnswer(`${question.id}-short`, question.what_to_say.short)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-4 h-4 text-green-400" />
                                  <span className="text-green-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span className="text-white">Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-gray-200 leading-relaxed">
                              {question.what_to_say.short}
                            </p>
                          </div>
                        </div>

                        {/* Long Version */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
                              Full Version (150-250 words)
                            </h5>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => toggleEdit(question.id, question.what_to_say.long)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm"
                              >
                                <Edit3 className="w-4 h-4" />
                                <span className="text-white">{isEditing ? 'Save' : 'Edit'}</span>
                              </button>
                              <button
                                onClick={() => copyAnswer(`${question.id}-long`, isEditing ? editedText : question.what_to_say.long)}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-sm"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4" />
                                    <span className="text-white">Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                            {isEditing ? (
                              <textarea
                                value={editedText}
                                onChange={(e) => setEditingAnswers({ ...editingAnswers, [question.id]: e.target.value })}
                                className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-gray-200 leading-relaxed resize-y min-h-[200px] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                              />
                            ) : (
                              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
                                {question.what_to_say.long}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Placeholders Used */}
                        {question.what_to_say.placeholders_used.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-purple-400 mb-3 uppercase tracking-wide">
                              Key Details Included
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {question.what_to_say.placeholders_used.map((placeholder, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs border border-purple-500/20"
                                >
                                  {placeholder}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
