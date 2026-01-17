import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { CareerPlan as CareerPlanType } from '../types/career-plan'
import {
  Sparkles, TrendingUp, BookOpen, Award, Briefcase, Calendar,
  FileText, Download, RefreshCw, ArrowLeft, Loader2, Upload,
  Check, ChevronRight, Target, Clock, DollarSign, MapPin, X
} from 'lucide-react'

type WizardStep = 'welcome' | 'upload' | 'questions' | 'generating' | 'results'

export default function CareerPathDesigner() {
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>('welcome')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [plan, setPlan] = useState<CareerPlanType>()
  const [planId, setPlanId] = useState<number>()

  // Resume upload
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeId, setResumeId] = useState<number | null>(null)
  const [resumeData, setResumeData] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Simplified intake
  const [dreamRole, setDreamRole] = useState('')
  const [timeline, setTimeline] = useState('6months')
  const [budget, setBudget] = useState('medium')
  const [location, setLocation] = useState('')
  const [timePerWeek, setTimePerWeek] = useState(10)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setResumeFile(file)
    setError(undefined)
    setUploadProgress(10)

    try {
      // Upload and parse resume
      const uploadResult = await api.uploadResume(file)
      setUploadProgress(50)

      if (!uploadResult.success || !uploadResult.data) {
        setError('Failed to upload resume. Please try again.')
        setResumeFile(null)
        setUploadProgress(0)
        return
      }

      setResumeId(uploadResult.data.resume_id)

      // Upload response already includes parsed data
      setUploadProgress(100)

      if (!uploadResult.data.parsed_data) {
        setError('Failed to parse resume. Please try again.')
        setResumeFile(null)
        setUploadProgress(0)
        return
      }

      setResumeData(uploadResult.data.parsed_data)

      // Auto-advance to questions after successful upload
      setTimeout(() => setStep('questions'), 500)

    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setResumeFile(null)
      setUploadProgress(0)
    }
  }

  const handleGenerate = async () => {
    if (!dreamRole.trim()) {
      setError('Please tell us your dream role or career goal')
      return
    }

    setLoading(true)
    setError(undefined)
    setStep('generating')

    try {
      // Extract data from parsed resume (if available)
      const experience = resumeData?.experience || []
      const skills = resumeData?.skills || []
      const education = resumeData?.education || []

      // Determine current role from resume or use defaults
      const currentRole = experience[0]?.title || dreamRole || 'Professional'
      const currentIndustry = experience[0]?.company || 'General'
      const yearsExp = experience.reduce((total: number, exp: any) => {
        const years = exp.duration_years || 0
        return total + years
      }, 0) || 5

      // Extract top tasks from experience bullets or use defaults
      const topTasks: string[] = []
      if (experience.length > 0) {
        experience.slice(0, 2).forEach((exp: any) => {
          const bullets = exp.responsibilities || []
          bullets.slice(0, 2).forEach((bullet: string) => {
            if (bullet && topTasks.length < 5) {
              topTasks.push(bullet.substring(0, 100))
            }
          })
        })
      }

      // Ensure minimum tasks with fallback
      while (topTasks.length < 3) {
        topTasks.push(`Relevant professional experience transitioning to ${dreamRole}`)
      }

      // Extract tools/technologies or use defaults
      const tools = skills.length > 0 ? skills.slice(0, 10) : ['General professional tools']

      // Determine education level from resume or use default
      let educationLevel = 'bachelors'
      if (education.some((e: any) => e.degree?.toLowerCase().includes('phd'))) {
        educationLevel = 'phd'
      } else if (education.some((e: any) => e.degree?.toLowerCase().includes('master'))) {
        educationLevel = 'masters'
      } else if (education.some((e: any) => e.degree?.toLowerCase().includes('bachelor'))) {
        educationLevel = 'bachelors'
      } else if (education.some((e: any) => e.degree?.toLowerCase().includes('associate'))) {
        educationLevel = 'associates'
      }

      const result = await api.generateCareerPlan({
        current_role_title: currentRole,
        current_industry: currentIndustry,
        years_experience: yearsExp,
        top_tasks: topTasks,
        tools: tools,
        strengths: ['Career transition planning', 'Adaptability'],
        likes: [],
        dislikes: [],
        target_role_interest: dreamRole,
        time_per_week: timePerWeek,
        budget: budget,
        timeline: timeline,
        education_level: educationLevel,
        location: location || 'Remote',
        in_person_vs_remote: 'hybrid'
      })

      if (result.success && result.data) {
        setPlan(result.data.plan)
        setPlanId(result.data.plan_id)
        setStep('results')
      } else {
        setError(result.error || 'Failed to generate career plan')
        setStep('questions')
      }
    } catch (err: any) {
      setError(err.message)
      setStep('questions')
    } finally {
      setLoading(false)
    }
  }

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-semibold text-sm">1</div>
              <span className="text-white font-medium">Welcome</span>
            </div>
            <div className="w-16 h-0.5 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white/40 flex items-center justify-center font-semibold text-sm">2</div>
              <span className="text-white/40">Upload</span>
            </div>
            <div className="w-16 h-0.5 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white/40 flex items-center justify-center font-semibold text-sm">3</div>
              <span className="text-white/40">Goals</span>
            </div>
          </div>

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white">AI-Powered Career Planning</span>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Design Your Career <br />Transition Path
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload your resume and tell us your dream role. We'll create a personalized roadmap with certifications, skills to build, and a week-by-week action plan.
            </p>

            {/* Feature highlights */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
              <div className="glass rounded-lg p-8 text-center">
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center mb-4 mx-auto">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Upload Resume</h3>
                <p className="text-sm text-gray-400">We analyze your experience automatically</p>
              </div>
              <div className="glass rounded-lg p-8 text-center">
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center mb-4 mx-auto">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Set Your Goal</h3>
                <p className="text-sm text-gray-400">Tell us your dream role or industry</p>
              </div>
              <div className="glass rounded-lg p-8 text-center">
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Get Your Plan</h3>
                <p className="text-sm text-gray-400">Personalized roadmap in 60 seconds</p>
              </div>
            </div>

            <button
              onClick={() => setStep('upload')}
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-500 mt-4">Takes less than 5 minutes</p>
          </div>
        </div>
      </div>
    )
  }

  // Upload Resume Screen
  if (step === 'upload') {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white/60 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-white/60">Welcome</span>
            </div>
            <div className="w-16 h-0.5 bg-white"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-semibold text-sm">2</div>
              <span className="text-white font-medium">Upload</span>
            </div>
            <div className="w-16 h-0.5 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white/40 flex items-center justify-center font-semibold text-sm">3</div>
              <span className="text-white/40">Goals</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">Upload Your Resume</h2>
              <p className="text-lg text-gray-400">
                We'll automatically extract your skills, experience, and background
              </p>
            </div>

            {/* Upload zone */}
            <div className="glass rounded-3xl p-16 mb-8">
              <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center transition-all hover:border-white/40">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="resume-upload"
                  data-testid="resume-upload-input"
                />

                {!resumeFile ? (
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    <Upload className="w-16 h-16 text-white mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Click to select your resume
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Supports PDF, DOC, and DOCX files
                    </p>
                    <div className="inline-flex items-center gap-2 btn-primary">
                      <Upload className="w-5 h-5" />
                      Select File
                    </div>
                  </label>
                ) : (
                  <div>
                    {uploadProgress < 100 ? (
                      <div>
                        <Loader2 className="w-16 h-16 text-white mx-auto mb-4 animate-spin" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Analyzing your resume...
                        </h3>
                        <div className="max-w-md mx-auto">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                            <div
                              className="h-full bg-white transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-400">{uploadProgress}% complete</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Resume uploaded successfully!
                        </h3>
                        <p className="text-gray-400 mb-4">
                          {resumeFile.name}
                        </p>
                        <button
                          onClick={() => {
                            setResumeFile(null)
                            setResumeId(null)
                            setResumeData(null)
                            setUploadProgress(0)
                          }}
                          className="text-white/60 hover:text-white font-medium"
                        >
                          Upload different file
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-8 glass rounded-lg p-4 border-2 border-red-500/50 flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('welcome')}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              {resumeData ? (
                <button
                  onClick={() => setStep('questions')}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setStep('questions')}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  Skip & Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Questions Screen
  if (step === 'questions') {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white/60 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-white/60">Welcome</span>
            </div>
            <div className="w-16 h-0.5 bg-white"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 text-white/60 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-white/60">Upload</span>
            </div>
            <div className="w-16 h-0.5 bg-white"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-semibold text-sm">3</div>
              <span className="text-white font-medium">Goals</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">Tell Us Your Goals</h2>
              <p className="text-lg text-gray-400">
                Just a few questions to personalize your career roadmap
              </p>
            </div>

            <div className="glass rounded-3xl p-8 space-y-8 mb-8">
              {/* Dream Role */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Target className="w-5 h-5" />
                  What's your dream role or career goal?
                </label>
                <input
                  type="text"
                  value={dreamRole}
                  onChange={(e) => setDreamRole(e.target.value)}
                  placeholder="e.g., Product Manager, Data Scientist, UX Designer"
                  className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500"
                  data-testid="dream-role-input"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Not sure? That's okay! Tell us the industry or type of work that interests you.
                </p>
              </div>

              {/* Timeline */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Clock className="w-5 h-5" />
                  What's your timeline for this transition?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: '3months', label: '3 Months', desc: 'Fast track' },
                    { value: '6months', label: '6 Months', desc: 'Balanced' },
                    { value: '12months', label: '12 Months', desc: 'Thorough' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeline(option.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        timeline === option.value
                          ? 'border-white bg-white/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      data-testid={`timeline-${option.value}`}
                    >
                      <div className="font-semibold text-white text-sm">{option.label}</div>
                      <div className="text-xs text-gray-400">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <DollarSign className="w-5 h-5" />
                  What's your budget for this transition?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'low', label: 'Under $1K', desc: 'Free resources' },
                    { value: 'medium', label: '$1K - $5K', desc: 'Courses & certs' },
                    { value: 'high', label: '$5K+', desc: 'Bootcamp ready' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setBudget(option.value)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        budget === option.value
                          ? 'border-white bg-white/10'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                      data-testid={`budget-${option.value}`}
                    >
                      <div className="font-semibold text-white text-sm">{option.label}</div>
                      <div className="text-xs text-gray-400">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time per week */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <Calendar className="w-5 h-5" />
                  How many hours per week can you dedicate?
                </label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  step="5"
                  value={timePerWeek}
                  onChange={(e) => setTimePerWeek(parseInt(e.target.value))}
                  className="w-full accent-white"
                  data-testid="time-per-week-slider"
                />
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>5 hrs/week</span>
                  <span className="font-semibold text-white">{timePerWeek} hrs/week</span>
                  <span>40 hrs/week</span>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="flex items-center gap-2 text-white font-semibold mb-3">
                  <MapPin className="w-5 h-5" />
                  Where are you located? (Optional)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Austin, TX or Remote"
                  className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500"
                  data-testid="location-input"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Helps us find local networking events and opportunities
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-8 glass rounded-lg p-4 border-2 border-red-500/50 flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep('upload')}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2 text-lg disabled:opacity-50"
                data-testid="generate-plan-button"
              >
                <Sparkles className="w-5 h-5" />
                Generate My Career Path
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Generating Screen
  if (step === 'generating') {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full glass rounded-3xl p-12">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Crafting Your Personalized Career Roadmap
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Our AI is analyzing your experience, researching {dreamRole} opportunities, and creating your action plan...
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="text-white">Analyzing your transferable skills</div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
                <div className="text-white">Researching certifications and courses</div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                </div>
                <div className="text-gray-400">Finding networking events near you</div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                </div>
                <div className="text-gray-400">Creating your week-by-week timeline</div>
              </div>
            </div>

            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-pulse" style={{ width: '65%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">This typically takes 30-60 seconds</p>
          </div>
        </div>
      </div>
    )
  }

  // Results Screen
  if (step === 'results' && plan) {
    const [expandedSection, setExpandedSection] = useState<string | null>(null)

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setStep('welcome')
                  setPlan(undefined)
                  setPlanId(undefined)
                  setResumeFile(null)
                  setResumeData(null)
                  setDreamRole('')
                }}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                New Plan
              </button>
              <button className="btn-secondary inline-flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Plan
              </button>
            </div>

            <div className="glass rounded-lg p-8 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">Your Career Transition Plan</h1>
                  <p className="text-gray-400 mb-4">{plan.profileSummary}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">Generated {new Date(plan.generatedAt).toLocaleDateString()}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">Timeline: {timeline}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">Budget: {budget}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Sections */}
          <div className="space-y-4" data-testid="results-container">
            {/* Target Roles */}
            <div className="glass rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'roles' ? null : 'roles')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Target Roles</h2>
                  <span className="text-sm text-gray-400">({plan.targetRoles.length} recommendations)</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'roles' ? 'rotate-90' : ''}`} />
              </button>
              {expandedSection === 'roles' && (
                <div className="px-6 pb-6 space-y-4">
                  {plan.targetRoles.map((role, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-2">{role.title}</h3>
                      <p className="text-gray-400 mb-4">{role.whyAligned}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Growth Outlook:</span>
                          <p className="text-white">{role.growthOutlook}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Salary Range:</span>
                          <p className="text-white">{role.salaryRange}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills Analysis */}
            <div className="glass rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'skills' ? null : 'skills')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Skills Analysis</h2>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'skills' ? 'rotate-90' : ''}`} />
              </button>
              {expandedSection === 'skills' && (
                <div className="px-6 pb-6 space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Check className="w-5 h-5" />
                      Skills You Already Have
                    </h3>
                    <div className="space-y-3">
                      {plan.skillsAnalysis.alreadyHave.map((skill, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="font-semibold text-white">{skill.skillName}</div>
                          <div className="text-sm text-gray-400 mt-1">{skill.targetRoleMapping}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {plan.skillsAnalysis.needToBuild.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Skills to Build
                      </h3>
                      <div className="space-y-3">
                        {plan.skillsAnalysis.needToBuild.map((skill, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="font-semibold text-white">{skill.skillName}</div>
                            <div className="text-sm text-gray-400 mt-1">{skill.whyNeeded}</div>
                            <div className="text-sm text-gray-300 mt-2">{skill.howToBuild}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Certification Path */}
            <div className="glass rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'certs' ? null : 'certs')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Certification Path</h2>
                  <span className="text-sm text-gray-400">({plan.certificationPath.length} certifications)</span>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'certs' ? 'rotate-90' : ''}`} />
              </button>
              {expandedSection === 'certs' && (
                <div className="px-6 pb-6 space-y-4">
                  {plan.certificationPath.map((cert, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{cert.name}</h3>
                          <span className="text-sm text-gray-400 uppercase">{cert.level}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{cert.estCostRange}</div>
                          <div className="text-sm text-gray-400">{cert.estStudyWeeks} weeks</div>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{cert.whatItUnlocks}</p>
                      {cert.officialLinks.map((link, linkIdx) => (
                        <a
                          key={linkIdx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/60 hover:text-white text-sm underline block"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="glass rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'timeline' ? null : 'timeline')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Your Timeline</h2>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'timeline' ? 'rotate-90' : ''}`} />
              </button>
              {expandedSection === 'timeline' && (
                <div className="px-6 pb-6">
                  <div className="mb-6">
                    <h3 className="text-white font-semibold mb-4">12-Week Plan</h3>
                    <div className="space-y-3">
                      {plan.timeline.twelveWeekPlan.map((week, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {week.weekNumber}
                            </div>
                            <div className="text-white font-semibold">{week.milestone || `Week ${week.weekNumber}`}</div>
                          </div>
                          <ul className="space-y-1 ml-11">
                            {week.tasks.map((task, taskIdx) => (
                              <li key={taskIdx} className="text-gray-400 text-sm">• {task}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resume Assets */}
            <div className="glass rounded-lg border border-white/10 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === 'resume' ? null : 'resume')}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-white" />
                  <h2 className="text-xl font-semibold text-white">Resume Assets</h2>
                </div>
                <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'resume' ? 'rotate-90' : ''}`} />
              </button>
              {expandedSection === 'resume' && (
                <div className="px-6 pb-6 space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Headline</h3>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-gray-300">{plan.resumeAssets.headline}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">Professional Summary</h3>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <p className="text-gray-300">{plan.resumeAssets.summary}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">Achievement Bullets</h3>
                    <div className="space-y-2">
                      {plan.resumeAssets.targetRoleBullets.map((bullet, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <p className="text-gray-300 text-sm">• {bullet}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
