import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { CareerPlan as CareerPlanType } from '../types/career-plan'
import {
  Sparkles, TrendingUp, BookOpen, Award, Briefcase, Calendar,
  FileText, Download, RefreshCw, ArrowLeft, Loader2, Upload,
  Check, ChevronRight, Target, Clock, MapPin, X, ChevronDown,
  Users, GraduationCap, Heart, Lightbulb, Building, Globe,
  Zap, Code, Shield, TrendingDown
} from 'lucide-react'

type WizardStep = 'welcome' | 'upload' | 'questions' | 'generating' | 'results'
type QuestionStep = 1 | 2 | 3 | 4 | 5

export default function CareerPathDesigner() {
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>('welcome')
  const [questionStep, setQuestionStep] = useState<QuestionStep>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [plan, setPlan] = useState<CareerPlanType>()
  const [planId, setPlanId] = useState<number>()

  // Resume upload
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeId, setResumeId] = useState<number | null>(null)
  const [resumeData, setResumeData] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Basic Profile (Step 1)
  const [dreamRole, setDreamRole] = useState('')
  const [currentRole, setCurrentRole] = useState('')
  const [currentIndustry, setCurrentIndustry] = useState('')
  const [yearsExperience, setYearsExperience] = useState(5)
  const [educationLevel, setEducationLevel] = useState('bachelors')
  const [topTasks, setTopTasks] = useState<string[]>(['', '', ''])
  const [tools, setTools] = useState<string[]>([])
  const [strengths, setStrengths] = useState<string[]>(['', ''])
  const [likes, setLikes] = useState<string[]>([])
  const [dislikes, setDislikes] = useState<string[]>([])

  // Target Role Details (Step 2)
  const [targetRoleLevel, setTargetRoleLevel] = useState('mid-level')
  const [targetIndustries, setTargetIndustries] = useState<string[]>([])
  const [specificCompanies, setSpecificCompanies] = useState<string[]>([])

  // Work Preferences (Step 3)
  const [timeline, setTimeline] = useState('6months')
  const [timePerWeek, setTimePerWeek] = useState(10)
  const [currentEmploymentStatus, setCurrentEmploymentStatus] = useState('employed-full-time')
  const [location, setLocation] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState(false)
  const [inPersonVsRemote, setInPersonVsRemote] = useState('hybrid')

  // Learning Preferences (Step 4)
  const [learningStyle, setLearningStyle] = useState<string[]>([])
  const [preferredPlatforms, setPreferredPlatforms] = useState<string[]>([])
  const [technicalBackground, setTechnicalBackground] = useState('some-technical')

  // Motivation & Goals (Step 5)
  const [transitionMotivation, setTransitionMotivation] = useState<string[]>([])
  const [specificTechnologiesInterest, setSpecificTechnologiesInterest] = useState<string[]>([])
  const [certificationAreasInterest, setCertificationAreasInterest] = useState<string[]>([])

  // Results screen
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [expandedCert, setExpandedCert] = useState<number | null>(null)
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [expandedBullet, setExpandedBullet] = useState<number | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setResumeFile(file)
    setError(undefined)
    setUploadProgress(10)

    try {
      const uploadResult = await api.uploadResume(file)
      setUploadProgress(50)

      if (!uploadResult.success || !uploadResult.data) {
        setError('Failed to upload resume. Please try again.')
        setResumeFile(null)
        setUploadProgress(0)
        return
      }

      setResumeId(uploadResult.data.resume_id)
      setUploadProgress(100)

      if (!uploadResult.data.parsed_data) {
        setError('Failed to parse resume. Please try again.')
        setResumeFile(null)
        setUploadProgress(0)
        return
      }

      setResumeData(uploadResult.data.parsed_data)

      // Auto-fill fields from resume
      if (uploadResult.data.parsed_data) {
        const data = uploadResult.data.parsed_data

        // Parse arrays if they're stringified JSON
        let experience = data.experience || []
        let skills = data.skills || []
        let education = data.education || []

        if (typeof experience === 'string') {
          try { experience = JSON.parse(experience) } catch { experience = [] }
        }
        if (typeof skills === 'string') {
          try { skills = JSON.parse(skills) } catch { skills = [] }
        }
        if (typeof education === 'string') {
          try { education = JSON.parse(education) } catch { education = [] }
        }

        if (!Array.isArray(experience)) experience = []
        if (!Array.isArray(skills)) skills = []
        if (!Array.isArray(education)) education = []

        // Set current role and industry
        if (experience[0]?.title) setCurrentRole(experience[0].title)
        if (experience[0]?.company) setCurrentIndustry(experience[0].company)

        // Calculate years of experience
        const years = experience.reduce((total: number, exp: any) => {
          return total + (exp.duration_years || 0)
        }, 0)
        if (years > 0) setYearsExperience(years)

        // Set tools/skills
        if (skills.length > 0) setTools(skills.slice(0, 15))

        // Extract strengths from summary
        const strengthsList: string[] = []
        if (data.summary && typeof data.summary === 'string') {
          const summaryLower = data.summary.toLowerCase()
          const indicators = [
            { keywords: ['leadership', 'lead', 'led', 'manage'], strength: 'Leadership & Team Management' },
            { keywords: ['communication', 'stakeholder', 'present'], strength: 'Communication & Stakeholder Management' },
            { keywords: ['problem-solving', 'troubleshoot', 'resolve'], strength: 'Problem Solving' },
            { keywords: ['strategic', 'planning', 'roadmap'], strength: 'Strategic Planning' },
            { keywords: ['technical', 'engineering', 'development'], strength: 'Technical Expertise' }
          ]
          indicators.forEach(({ keywords, strength }) => {
            if (keywords.some(kw => summaryLower.includes(kw)) && !strengthsList.includes(strength)) {
              strengthsList.push(strength)
            }
          })
        }
        if (strengthsList.length >= 2) setStrengths(strengthsList.slice(0, 5))

        // Determine education level
        if (education.some((e: any) => e.degree?.toLowerCase().includes('phd'))) {
          setEducationLevel('phd')
        } else if (education.some((e: any) => e.degree?.toLowerCase().includes('master'))) {
          setEducationLevel('masters')
        } else if (education.some((e: any) => e.degree?.toLowerCase().includes('bachelor'))) {
          setEducationLevel('bachelors')
        } else if (education.some((e: any) => e.degree?.toLowerCase().includes('associate'))) {
          setEducationLevel('associates')
        }
      }

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

    // Validate required fields
    const validTopTasks = topTasks.filter(t => t.trim()).length >= 3
    const validStrengths = strengths.filter(s => s.trim()).length >= 2

    if (!validTopTasks) {
      setError('Please provide at least 3 top tasks from your current role')
      return
    }

    if (!validStrengths) {
      setError('Please provide at least 2 strengths')
      return
    }

    setLoading(true)
    setError(undefined)
    setStep('generating')

    try {
      const intake = {
        // Basic Profile
        current_role_title: currentRole || dreamRole,
        current_industry: currentIndustry || 'General',
        years_experience: yearsExperience,
        education_level: educationLevel,
        top_tasks: topTasks.filter(t => t.trim()),
        tools: tools,
        strengths: strengths.filter(s => s.trim()),
        likes: likes,
        dislikes: dislikes,

        // Target Role
        target_role_interest: dreamRole,
        target_role_level: targetRoleLevel,
        target_industries: targetIndustries,
        specific_companies: specificCompanies,

        // Timeline & Availability
        time_per_week: timePerWeek,
        timeline: timeline,
        current_employment_status: currentEmploymentStatus,

        // Location & Work Preferences
        location: location || 'Remote',
        willing_to_relocate: willingToRelocate,
        in_person_vs_remote: inPersonVsRemote,

        // Learning Preferences
        learning_style: learningStyle,
        preferred_platforms: preferredPlatforms,
        technical_background: technicalBackground,

        // Motivation & Goals
        transition_motivation: transitionMotivation,
        specific_technologies_interest: specificTechnologiesInterest,
        certification_areas_interest: certificationAreasInterest
      }

      console.log('Generating career plan with intake:', intake)

      const result = await api.generateCareerPlan(intake)

      console.log('Career plan result:', result)

      if (result.success && result.data) {
        if (result.data.success && result.data.plan) {
          setPlan(result.data.plan)
          setPlanId(result.data.plan_id)
          setStep('results')
        } else {
          const errorMsg = result.data.error || 'Failed to generate career plan. Please try again.'
          console.error('Career plan generation failed:', errorMsg)

          if (result.data.validation_errors) {
            console.error('Validation errors:', result.data.validation_errors)
          }

          setError(errorMsg)
          setStep('questions')
        }
      } else {
        const errorMsg = result.error || 'Failed to generate career plan. Please try again.'
        console.error('Career plan generation failed:', errorMsg)
        setError(errorMsg)
        setStep('questions')
      }
    } catch (err: any) {
      setError(err.message)
      setStep('questions')
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestionStep = () => {
    // Validate current step before advancing
    if (questionStep === 1) {
      const validTopTasks = topTasks.filter(t => t.trim()).length >= 3
      const validStrengths = strengths.filter(s => s.trim()).length >= 2

      if (!dreamRole.trim()) {
        setError('Please provide your dream role')
        return
      }
      if (!validTopTasks) {
        setError('Please provide at least 3 top tasks')
        return
      }
      if (!validStrengths) {
        setError('Please provide at least 2 strengths')
        return
      }
    }

    if (questionStep === 4) {
      if (learningStyle.length === 0) {
        setError('Please select at least one learning style')
        return
      }
    }

    if (questionStep === 5) {
      if (transitionMotivation.length === 0) {
        setError('Please select at least one motivation for transitioning')
        return
      }
    }

    setError(undefined)
    if (questionStep < 5) {
      setQuestionStep((questionStep + 1) as QuestionStep)
    }
  }

  const handlePrevQuestionStep = () => {
    setError(undefined)
    if (questionStep > 1) {
      setQuestionStep((questionStep - 1) as QuestionStep)
    }
  }

  const toggleArrayItem = (arr: string[], setArr: (val: string[]) => void, item: string) => {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item))
    } else {
      setArr([...arr, item])
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
              <span className="text-white/40">Assessment</span>
            </div>
          </div>

          {/* Hero */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white">AI-Powered Career Planning with Real-World Data</span>
            </div>
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Design Your Career <br />Transition Path
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              Upload your resume and complete our comprehensive assessment. Get a personalized roadmap with ACTUAL certifications, study materials, tech stacks, and networking events.
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
                <h3 className="font-semibold text-white mb-2 text-lg">Detailed Assessment</h3>
                <p className="text-sm text-gray-400">Comprehensive questionnaire for best fit</p>
              </div>
              <div className="glass rounded-lg p-8 text-center">
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-lg">Actionable Plan</h3>
                <p className="text-sm text-gray-400">Real certifications, events, and resources</p>
              </div>
            </div>

            <button
              onClick={() => setStep('upload')}
              className="btn-primary inline-flex items-center gap-2 text-lg"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-500 mt-4">Takes 10-15 minutes for comprehensive assessment</p>
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
              <span className="text-white/40">Assessment</span>
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
                  Continue to Assessment
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

  // Questions Screen (Multi-Step)
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
              <span className="text-white font-medium">Assessment</span>
            </div>
          </div>

          {/* Question step indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((num) => (
              <React.Fragment key={num}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                  questionStep === num
                    ? 'bg-white text-black scale-110'
                    : questionStep > num
                    ? 'bg-white/20 text-white/60'
                    : 'bg-white/10 text-white/40'
                }`}>
                  {questionStep > num ? <Check className="w-5 h-5" /> : num}
                </div>
                {num < 5 && <div className={`w-12 h-0.5 ${questionStep > num ? 'bg-white/40' : 'bg-white/20'}`}></div>}
              </React.Fragment>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Step 1: Basic Profile */}
            {questionStep === 1 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Basic Profile</h2>
                  <p className="text-gray-400">Tell us about your current role and dream career</p>
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  {/* Dream Role */}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Dream Role or Career Goal *</label>
                    <input
                      type="text"
                      value={dreamRole}
                      onChange={(e) => setDreamRole(e.target.value)}
                      placeholder="e.g., Senior Cloud Security Architect, Product Manager"
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500"
                      data-testid="dream-role-input"
                    />
                  </div>

                  {/* Current Role */}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Current Role Title</label>
                    <input
                      type="text"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="e.g., IT Manager, Software Developer"
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500"
                    />
                  </div>

                  {/* Current Industry */}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Current Industry</label>
                    <input
                      type="text"
                      value={currentIndustry}
                      onChange={(e) => setCurrentIndustry(e.target.value)}
                      placeholder="e.g., Healthcare, Finance, Technology"
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500"
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Years of Experience: {yearsExperience}</label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(parseInt(e.target.value))}
                      className="w-full accent-white"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>0 years</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  {/* Education Level */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Education Level</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'high school', label: 'High School' },
                        { value: 'associates', label: 'Associates' },
                        { value: 'bachelors', label: 'Bachelors' },
                        { value: 'masters', label: 'Masters' },
                        { value: 'phd', label: 'PhD' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setEducationLevel(option.value)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            educationLevel === option.value
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Top Tasks */}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Top 3-5 Tasks in Current Role *</label>
                    {topTasks.map((task, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={task}
                        onChange={(e) => {
                          const newTasks = [...topTasks]
                          newTasks[idx] = e.target.value
                          setTopTasks(newTasks)
                        }}
                        placeholder={`Task ${idx + 1}`}
                        className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500 mb-2"
                      />
                    ))}
                    <button
                      onClick={() => setTopTasks([...topTasks, ''])}
                      className="text-white/60 hover:text-white text-sm"
                    >
                      + Add another task
                    </button>
                  </div>

                  {/* Strengths */}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Your Top Strengths (2-5) *</label>
                    {strengths.map((strength, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={strength}
                        onChange={(e) => {
                          const newStrengths = [...strengths]
                          newStrengths[idx] = e.target.value
                          setStrengths(newStrengths)
                        }}
                        placeholder={`Strength ${idx + 1} (e.g., Leadership, Problem Solving)`}
                        className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500 mb-2"
                      />
                    ))}
                    {strengths.length < 5 && (
                      <button
                        onClick={() => setStrengths([...strengths, ''])}
                        className="text-white/60 hover:text-white text-sm"
                      >
                        + Add another strength
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Target Role Details */}
            {questionStep === 2 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Target Role Details</h2>
                  <p className="text-gray-400">Help us understand your career aspirations</p>
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  {/* Target Role Level */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Desired Career Level</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { value: 'entry-level', label: 'Entry Level' },
                        { value: 'mid-level', label: 'Mid Level' },
                        { value: 'senior', label: 'Senior' },
                        { value: 'lead', label: 'Lead' },
                        { value: 'executive', label: 'Executive' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTargetRoleLevel(option.value)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            targetRoleLevel === option.value
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Industries */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Target Industries (Select all that apply)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
                        'Manufacturing', 'Government', 'Consulting', 'Non-Profit', 'Other'
                      ].map((industry) => (
                        <button
                          key={industry}
                          onClick={() => toggleArrayItem(targetIndustries, setTargetIndustries, industry)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            targetIndustries.includes(industry)
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{industry}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Companies */}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Specific Companies of Interest (Optional)</label>
                    <p className="text-sm text-gray-400 mb-3">List companies you'd like to work for</p>
                    <input
                      type="text"
                      placeholder="e.g., Google, Amazon, Microsoft (comma-separated)"
                      onChange={(e) => setSpecificCompanies(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Work Preferences */}
            {questionStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Work Preferences</h2>
                  <p className="text-gray-400">Your availability and work style</p>
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  {/* Timeline */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Transition Timeline</label>
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

                  {/* Time per week */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">
                      Hours per Week Available: {timePerWeek} hrs/week
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
                      <span>40 hrs/week</span>
                    </div>
                  </div>

                  {/* Current Employment Status */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Current Employment Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'employed-full-time', label: 'Full-Time' },
                        { value: 'employed-part-time', label: 'Part-Time' },
                        { value: 'unemployed', label: 'Unemployed' },
                        { value: 'student', label: 'Student' },
                        { value: 'freelance', label: 'Freelance' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setCurrentEmploymentStatus(option.value)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            currentEmploymentStatus === option.value
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Your Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Austin, TX or Remote"
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500"
                      data-testid="location-input"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Helps us find local networking events
                    </p>
                  </div>

                  {/* Willing to Relocate */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={willingToRelocate}
                        onChange={(e) => setWillingToRelocate(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-white/20 bg-white/5 checked:bg-white checked:border-white"
                      />
                      <span className="text-white font-semibold">Willing to relocate for opportunities</span>
                    </label>
                  </div>

                  {/* Work Preference */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Work Preference</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'in-person', label: 'In-Person' },
                        { value: 'remote', label: 'Remote' },
                        { value: 'hybrid', label: 'Hybrid' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setInPersonVsRemote(option.value)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            inPersonVsRemote === option.value
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Learning Preferences */}
            {questionStep === 4 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Learning Preferences</h2>
                  <p className="text-gray-400">How you learn best</p>
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  {/* Learning Style */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Preferred Learning Styles (Select all that apply) *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'video-courses', label: 'Video Courses', icon: '📹' },
                        { value: 'reading-books', label: 'Reading Books', icon: '📚' },
                        { value: 'hands-on-projects', label: 'Hands-On Projects', icon: '🛠️' },
                        { value: 'bootcamp', label: 'Bootcamp', icon: '🎓' },
                        { value: 'mentorship', label: 'Mentorship', icon: '👥' },
                        { value: 'self-paced', label: 'Self-Paced', icon: '⏰' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleArrayItem(learningStyle, setLearningStyle, option.value)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            learningStyle.includes(option.value)
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{option.icon}</span>
                            <div className="font-semibold text-white text-sm">{option.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Platforms */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Preferred Learning Platforms (Optional)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Coursera', 'Udemy', 'Pluralsight', 'LinkedIn Learning',
                        'edX', 'Udacity', 'Khan Academy', 'YouTube'
                      ].map((platform) => (
                        <button
                          key={platform}
                          onClick={() => toggleArrayItem(preferredPlatforms, setPreferredPlatforms, platform)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            preferredPlatforms.includes(platform)
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{platform}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Technical Background */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Technical Background</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'non-technical', label: 'Non-Technical', desc: 'Little to no tech experience' },
                        { value: 'some-technical', label: 'Some Technical', desc: 'Basic tech knowledge' },
                        { value: 'technical', label: 'Technical', desc: 'Solid tech background' },
                        { value: 'highly-technical', label: 'Highly Technical', desc: 'Expert level' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTechnicalBackground(option.value)}
                          className={`p-3 rounded-lg border-2 text-left transition-all ${
                            technicalBackground === option.value
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{option.label}</div>
                          <div className="text-xs text-gray-400">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Motivation & Goals */}
            {questionStep === 5 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Motivation & Goals</h2>
                  <p className="text-gray-400">What drives this career change</p>
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  {/* Transition Motivation */}
                  <div>
                    <label className="text-white font-semibold mb-3 block">Why are you transitioning? (Select all that apply) *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'better-pay', label: 'Better Pay', icon: '💰' },
                        { value: 'work-life-balance', label: 'Work-Life Balance', icon: '⚖️' },
                        { value: 'interesting-work', label: 'More Interesting Work', icon: '✨' },
                        { value: 'remote-work', label: 'Remote Work', icon: '🏠' },
                        { value: 'career-growth', label: 'Career Growth', icon: '📈' },
                        { value: 'passion', label: 'Follow Passion', icon: '❤️' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => toggleArrayItem(transitionMotivation, setTransitionMotivation, option.value)}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            transitionMotivation.includes(option.value)
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{option.icon}</span>
                            <div className="font-semibold text-white text-sm">{option.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Technologies Interest */}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Technologies You Want to Learn (Optional)</label>
                    <p className="text-sm text-gray-400 mb-3">List specific technologies, frameworks, or tools</p>
                    <input
                      type="text"
                      placeholder="e.g., React, AWS, Python, Kubernetes (comma-separated)"
                      onChange={(e) => setSpecificTechnologiesInterest(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-lg focus:border-white/40 focus:ring-0 text-white placeholder-gray-500"
                    />
                  </div>

                  {/* Certification Areas Interest */}
                  <div>
                    <label className="text-white font-semibold mb-2 block">Certification Areas of Interest (Optional)</label>
                    <p className="text-sm text-gray-400 mb-3">Areas you'd like to get certified in</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        'Cloud (AWS/Azure/GCP)', 'Cybersecurity', 'Data Science',
                        'Project Management (PMP)', 'Agile/Scrum', 'DevOps',
                        'Networking (Cisco)', 'Database', 'AI/Machine Learning'
                      ].map((area) => (
                        <button
                          key={area}
                          onClick={() => toggleArrayItem(certificationAreasInterest, setCertificationAreasInterest, area)}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${
                            certificationAreasInterest.includes(area)
                              ? 'border-white bg-white/10'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          <div className="font-semibold text-white text-sm">{area}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 glass rounded-lg p-4 border-2 border-red-500/50 flex items-start gap-3">
                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-400">{error}</p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {questionStep > 1 ? (
                <button
                  onClick={handlePrevQuestionStep}
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>
              ) : (
                <button
                  onClick={() => setStep('upload')}
                  className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              )}

              {questionStep < 5 ? (
                <button
                  onClick={handleNextQuestionStep}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="btn-primary inline-flex items-center gap-2 text-lg disabled:opacity-50"
                  data-testid="generate-plan-button"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate My Career Path
                </button>
              )}
            </div>

            {/* Step labels */}
            <div className="mt-6 text-center text-sm text-gray-400">
              Step {questionStep} of 5: {
                questionStep === 1 ? 'Basic Profile' :
                questionStep === 2 ? 'Target Role Details' :
                questionStep === 3 ? 'Work Preferences' :
                questionStep === 4 ? 'Learning Preferences' :
                'Motivation & Goals'
              }
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
              Our AI is researching {dreamRole} opportunities with real-world data from certifications, events, and job markets...
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
                <div className="text-white">Researching actual certifications with study materials</div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                </div>
                <div className="text-gray-400">Finding real networking events in your location</div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                </div>
                <div className="text-gray-400">Creating detailed project roadmaps with tech stacks</div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                </div>
                <div className="text-gray-400">Building your resume transformation guide</div>
              </div>
            </div>

            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white animate-pulse" style={{ width: '65%' }}></div>
            </div>
            <p className="text-sm text-gray-500 mt-4">This typically takes 30-90 seconds (web research takes time)</p>
          </div>
        </div>
      </div>
    )
  }

  // Results Screen - WILL BE COMPLETELY REDESIGNED NEXT
  if (step === 'results') {
    if (!plan) {
      return (
        <div className="min-h-screen p-8 flex items-center justify-center">
          <div className="glass rounded-lg p-8 max-w-md text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Failed to Generate Plan</h2>
            <p className="text-gray-400 mb-6">
              We couldn't generate your career plan. Please try again.
            </p>
            <button
              onClick={() => {
                setStep('questions')
                setError(undefined)
              }}
              className="btn-primary"
            >
              Back to Assessment
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
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
                  setQuestionStep(1)
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
                  <p className="text-gray-400 mb-4">{plan.profileSummary || 'Your personalized career transition roadmap'}</p>
                  <div className="flex items-center gap-4 text-sm">
                    {plan.generatedAt && (
                      <>
                        <span className="text-gray-500">Generated {new Date(plan.generatedAt).toLocaleDateString()}</span>
                        <span className="text-gray-500">•</span>
                      </>
                    )}
                    <span className="text-gray-500">Timeline: {timeline}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Timeline Results - TO BE REDESIGNED WITH DETAILED COMPONENTS */}
          <div className="space-y-4" data-testid="results-container">
            {/* NOTE: The results sections below will be completely redesigned
                 with vertical timeline, detailed certification displays (interview-prep style),
                 tech stack details, comprehensive event info, and detailed resume guidance.
                 For now, keeping simplified versions to maintain functionality. */}

            {/* Target Roles */}
            {plan.targetRoles && plan.targetRoles.length > 0 && (
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
                        {role.typicalRequirements && role.typicalRequirements.length > 0 && (
                          <div className="mt-4">
                            <span className="text-gray-500 text-sm">Typical Requirements:</span>
                            <ul className="mt-2 space-y-1">
                              {role.typicalRequirements.map((req, reqIdx) => (
                                <li key={reqIdx} className="text-white text-sm">• {req}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* More sections to be implemented... will continue in next update */}
            {/* This is placeholder - full implementation coming */}

          </div>
        </div>
      </div>
    )
  }

  return null
}
