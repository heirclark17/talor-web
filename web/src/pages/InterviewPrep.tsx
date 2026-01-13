import React, { useState, useEffect } from 'react'
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
  Lightbulb
} from 'lucide-react'
import { api } from '../api/client'

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

export default function InterviewPrep() {
  const { tailoredResumeId } = useParams<{ tailoredResumeId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [prepData, setPrepData] = useState<InterviewPrepData | null>(null)

  useEffect(() => {
    loadInterviewPrep()
  }, [tailoredResumeId])

  const loadInterviewPrep = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to get existing interview prep
      const result = await api.getInterviewPrep(Number(tailoredResumeId))

      if (result.success) {
        setPrepData(result.data.prep_data)
      }
    } catch (err: any) {
      // If not found, generate new one
      if (err.message?.includes('not found') || err.message?.includes('404')) {
        await generateInterviewPrep()
      } else {
        setError(err.message || 'Failed to load interview prep')
      }
    } finally {
      setLoading(false)
    }
  }

  const generateInterviewPrep = async () => {
    try {
      setGenerating(true)
      setError(null)

      const result = await api.generateInterviewPrep(Number(tailoredResumeId))

      if (result.success) {
        setPrepData(result.data.prep_data)
      } else {
        throw new Error(result.error || 'Failed to generate interview prep')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate interview prep')
    } finally {
      setGenerating(false)
    }
  }

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
          <button onClick={() => navigate('/tailor')} className="btn-secondary">
            Back to Resumes
          </button>
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

  return (
    <div className="min-h-screen bg-black">
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
          <h1 className="text-4xl font-bold text-white mb-2">Interview Preparation</h1>
          <p className="text-gray-400">
            AI-generated interview prep for {prepData.role_analysis.job_title} at{' '}
            {prepData.company_profile.name}
          </p>
        </div>

        {/* Company Profile */}
        <section className="glass rounded-3xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Company Profile</h2>
          </div>

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
        </section>

        {/* Role Analysis */}
        <section className="glass rounded-3xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Role Analysis</h2>
          </div>

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
        </section>

        {/* Values & Culture */}
        {prepData.values_and_culture.stated_values.length > 0 && (
          <section className="glass rounded-3xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Values & Culture</h2>
            </div>

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
          </section>
        )}

        {/* Strategy & News */}
        {(prepData.strategy_and_news.recent_events.length > 0 ||
          prepData.strategy_and_news.strategic_themes.length > 0) && (
          <section className="glass rounded-3xl p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Strategy & Recent News</h2>
            </div>

            {prepData.strategy_and_news.recent_events.length > 0 && (
              <div className="mb-6">
                <h4 className="text-white font-semibold mb-3">Recent Events</h4>
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
              <div>
                <h4 className="text-white font-semibold mb-3">Strategic Themes</h4>
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
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Interview Preparation */}
          <section className="glass rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Interview Preparation</h2>
            </div>

            <div className="space-y-6">
              {prepData.interview_preparation.research_tasks.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Research Tasks</h4>
                  <ul className="space-y-2">
                    {prepData.interview_preparation.research_tasks.map((task, idx) => (
                      <li key={idx} className="text-gray-300 flex gap-2 text-sm">
                        <span className="text-white/40">□</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prepData.interview_preparation.day_of_checklist.length > 0 && (
                <div>
                  <h4 className="text-white font-semibold mb-3">Day-Of Checklist</h4>
                  <ul className="space-y-2">
                    {prepData.interview_preparation.day_of_checklist.map((item, idx) => (
                      <li key={idx} className="text-gray-300 flex gap-2 text-sm">
                        <span className="text-white/40">☑</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Questions to Ask */}
          <section className="glass rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Questions to Ask</h2>
            </div>

            <div className="space-y-4">
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
            </div>
          </section>
        </div>

        {/* Practice Questions */}
        {prepData.interview_preparation.practice_questions_for_candidate.length > 0 && (
          <section className="glass rounded-3xl p-8 mt-6">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Practice Questions</h2>
            </div>

            <div className="space-y-3">
              {prepData.interview_preparation.practice_questions_for_candidate.map((q, idx) => (
                <div key={idx} className="bg-white/5 p-4 rounded-lg">
                  <p className="text-white font-medium">{q}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Candidate Positioning */}
        <section className="glass rounded-3xl p-8 mt-6">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Candidate Positioning</h2>
          </div>

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

            {prepData.candidate_positioning.story_prompts.length > 0 && (
              <div>
                <h4 className="text-white font-semibold mb-3">STAR Stories to Prepare</h4>
                <div className="space-y-4">
                  {prepData.candidate_positioning.story_prompts.map((story, idx) => (
                    <div key={idx} className="bg-white/5 p-4 rounded-lg">
                      <h5 className="text-white font-medium mb-2">{story.title}</h5>
                      <p className="text-gray-300 text-sm mb-3">{story.description}</p>
                      {story.star_hint && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500 font-semibold">Situation:</span>
                            <p className="text-gray-400">{story.star_hint.situation}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-semibold">Task:</span>
                            <p className="text-gray-400">{story.star_hint.task}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-semibold">Action:</span>
                            <p className="text-gray-400">{story.star_hint.action}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 font-semibold">Result:</span>
                            <p className="text-gray-400">{story.star_hint.result}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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
        </section>
      </div>
    </div>
  )
}
