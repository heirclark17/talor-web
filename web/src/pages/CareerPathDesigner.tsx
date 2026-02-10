import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { CareerPlan as CareerPlanType } from '../types/career-plan'
import CareerPlanResults from '../components/CareerPlanResults'
import AILoadingScreen from '../components/AILoadingScreen'
import {
  Sparkles, TrendingUp, BookOpen, Award, Briefcase, Calendar,
  FileText, Download, RefreshCw, ArrowLeft, Loader2, Upload,
  Check, ChevronRight, Target, Clock, MapPin, X, ChevronDown,
  Users, GraduationCap, Heart, Lightbulb, Building, Globe,
  Zap, Code, Shield, TrendingDown, FolderOpen, Trash2, Link2
} from 'lucide-react'

type WizardStep = 'welcome' | 'upload' | 'questions' | 'generating' | 'results'
type QuestionStep = 1 | 2 | 3 | 4 | 5

function inferStrengths(experience: any[], skills: string[], summary: string): string[] {
  const allText = [
    summary || '',
    ...experience.map((e: any) => [
      e.title || '',
      e.company || '',
      ...(Array.isArray(e.responsibilities) ? e.responsibilities : []),
      ...(Array.isArray(e.bullets) ? e.bullets : []),
      e.description || '',
    ].join(' ')),
    ...skills,
  ].join(' ').toLowerCase()

  const strengthPatterns: [RegExp, string, number][] = [
    // Leadership & Management
    [/\b(led|lead|managed|directed|supervised|oversaw|coordinated|spearheaded|headed|mentored|coached)\b/g, 'Leadership & Team Management', 0],
    [/\b(stakeholder|executive|c-suite|board|cross-functional|cross functional|collaborate|collaboration|partner)\b/g, 'Stakeholder & Executive Communication', 0],
    [/\b(project manag|program manag|pmo|portfolio|agile|scrum|kanban|sprint|roadmap|milestone)\b/g, 'Program & Project Management', 0],
    // Strategic
    [/\b(strateg|vision|roadmap|transform|moderniz|initiative|innovation|architect)\b/g, 'Strategic Planning & Vision', 0],
    [/\b(budget|cost|financial|roi|revenue|savings|p&l|forecast|resource allocation)\b/g, 'Budget & Financial Management', 0],
    // Technical
    [/\b(security|cyber|vulnerability|threat|incident|soc |siem|firewall|penetration|compliance)\b/g, 'Cybersecurity & Risk Management', 0],
    [/\b(cloud|aws|azure|gcp|infrastructure|devops|ci\/cd|kubernetes|docker|terraform)\b/g, 'Cloud & Infrastructure', 0],
    [/\b(develop|engineer|code|software|application|api|database|full.?stack|backend|frontend)\b/g, 'Software Development & Engineering', 0],
    [/\b(data|analytics|reporting|dashboard|metrics|kpi|insight|visualization|tableau|power bi)\b/g, 'Data Analysis & Reporting', 0],
    // Process & Operations
    [/\b(process|improv|optimi|efficien|automat|streamlin|workflow|operational excellence)\b/g, 'Process Improvement & Optimization', 0],
    [/\b(vendor|third.?party|contract|procurement|negotiat|supplier|outsourc)\b/g, 'Vendor & Contract Management', 0],
    [/\b(risk|governance|audit|compliance|regulat|framework|nist|iso|sox|hipaa|pci|gdpr)\b/g, 'Risk & Compliance Management', 0],
    // People & Communication
    [/\b(train|mentor|develop talent|onboard|team building|culture|retention|hiring|recruit)\b/g, 'Talent Development & Mentoring', 0],
    [/\b(present|communicat|report|document|brief|written|verbal|public speak)\b/g, 'Communication & Presentation', 0],
    [/\b(problem.?solv|troubleshoot|root cause|diagnos|resolv|debug|investigat)\b/g, 'Problem Solving & Troubleshooting', 0],
    // Delivery
    [/\b(deliver|implement|deploy|launch|execut|ship|release|go.?live|migration)\b/g, 'Execution & Delivery', 0],
    [/\b(client|customer|account|relationship|satisfaction|nps|retention|success)\b/g, 'Client Relationship Management', 0],
  ]

  // Count matches for each strength
  const scored = strengthPatterns.map(([regex, label]) => {
    const matches = allText.match(regex)
    return { label, count: matches ? matches.length : 0 }
  })

  // Sort by match count descending, take top 3 with at least 1 match
  return scored
    .filter(s => s.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(s => s.label)
}

function inferIndustry(company: string, title: string, skills: string[]): string {
  const all = `${company} ${title} ${skills.join(' ')}`.toLowerCase()

  const patterns: [RegExp, string][] = [
    [/\b(bank|financ|capital|invest|trading|hedge fund|mortgage|credit|jpmorgan|goldman|citi|wells fargo|fidelity|schwab|merrill|morgan stanley)\b/, 'Financial Services & Banking'],
    [/\b(hospital|health|medical|pharma|biotech|clinical|patient|hipaa|epic|cerner|unitedhealth|anthem|aetna|humana|cvs health)\b/, 'Healthcare & Life Sciences'],
    [/\b(defense|military|dod|army|navy|air force|lockheed|raytheon|northrop|boeing|clearance|classified|fedramp|disa)\b/, 'Defense & Aerospace'],
    [/\b(federal|government|govt|public sector|state agency|gsa|va |usda|fbi|cia|nsa|homeland)\b/, 'Government & Public Sector'],
    [/\b(school|university|college|education|edtech|academic|campus|student|coursera|udemy)\b/, 'Education & EdTech'],
    [/\b(retail|ecommerce|e-commerce|shopping|merchant|walmart|amazon|target|costco|shopify)\b/, 'Retail & E-Commerce'],
    [/\b(energy|oil|gas|petroleum|utility|utilities|solar|wind|renewable|power grid|exxon|chevron|shell|bp)\b/, 'Energy & Utilities'],
    [/\b(telecom|wireless|5g|spectrum|at&t|verizon|t-mobile|comcast|charter)\b/, 'Telecommunications'],
    [/\b(insurance|underwriting|actuari|claims|allstate|geico|progressive|state farm|liberty mutual)\b/, 'Insurance'],
    [/\b(manufactur|automotive|vehicle|factory|assembly|ford|gm|toyota|tesla|caterpillar)\b/, 'Manufacturing & Automotive'],
    [/\b(real estate|property|mortgage|reit|construction|building|housing)\b/, 'Real Estate & Construction'],
    [/\b(media|entertainment|streaming|broadcast|publish|news|disney|netflix|warner|spotify)\b/, 'Media & Entertainment'],
    [/\b(transport|logistics|shipping|freight|supply chain|fedex|ups|maersk|warehouse)\b/, 'Transportation & Logistics'],
    [/\b(consult|advisory|deloitte|accenture|mckinsey|kpmg|pwc|ernst|ey |bain|bcg)\b/, 'Consulting & Professional Services'],
    [/\b(saas|software|cloud|platform|devops|api|microsoft|google|apple|meta|oracle|salesforce|adobe|sap|ibm|cisco|intel|nvidia|aws|azure|gcp)\b/, 'Technology & Software'],
    [/\b(cyber|security|infosec|soc |siem|penetration|vulnerability|threat|firewall|endpoint)\b/, 'Cybersecurity'],
    [/\b(data|analytics|machine learning|artificial intelligence| ai |ml |deep learning|nlp)\b/, 'Data Science & AI'],
  ]

  for (const [regex, industry] of patterns) {
    if (regex.test(all)) return industry
  }

  return 'Technology'
}

/**
 * Extract role title and company from experience entry.
 * API may return { title, company } OR { header: "Title, Company" }
 */
/** Extract bullet strings from the most recent experience entry (or first N entries) */
function extractExperienceBullets(experience: any[], maxEntries: number = 1): string[] {
  const bullets: string[] = []
  for (const exp of experience.slice(0, maxEntries)) {
    if (Array.isArray(exp.responsibilities)) bullets.push(...exp.responsibilities)
    if (Array.isArray(exp.bullets)) bullets.push(...exp.bullets)
    if (typeof exp.description === 'string' && exp.description.trim()) {
      // Split multi-sentence descriptions into individual bullets
      exp.description.split(/[.;]\s+/).forEach((s: string) => {
        const trimmed = s.trim()
        if (trimmed.length > 15) bullets.push(trimmed)
      })
    }
  }
  return bullets.filter(b => typeof b === 'string' && b.trim().length > 10)
}

function parseExperienceEntry(exp: any): { title: string; company: string } {
  if (exp.title) return { title: exp.title, company: exp.company || '' }
  if (exp.header) {
    // Format: "Role Title, Company Name" or "Role Title (Details), Company"
    const parts = exp.header.split(',')
    if (parts.length >= 2) {
      return { title: parts.slice(0, -1).join(',').trim(), company: parts[parts.length - 1].trim() }
    }
    return { title: exp.header.trim(), company: '' }
  }
  return { title: '', company: '' }
}

/**
 * Parse education which may be a string or an array
 */
function parseEducationLevel(education: any): string | null {
  let text = ''
  if (typeof education === 'string') {
    text = education.toLowerCase()
  } else if (Array.isArray(education) && education.length > 0) {
    text = (education[0]?.degree || education[0] || '').toString().toLowerCase()
  }
  if (!text) return null
  if (text.includes('phd') || text.includes('doctor')) return 'phd'
  if (text.includes('master')) return 'masters'
  if (text.includes('bachelor') || text.includes('b.a.') || text.includes('b.s.') || text.includes('b.a ') || text.includes('b.s ')) return 'bachelors'
  if (text.includes('associate')) return 'associates'
  return null
}

/**
 * Estimate years of experience from dates strings like "2018 – 2024"
 */
function estimateYearsFromDates(experience: any[]): number {
  let totalYears = 0
  for (const exp of experience) {
    if (exp.duration_years) { totalYears += exp.duration_years; continue }
    if (exp.start_date && exp.end_date) {
      try {
        const start = new Date(exp.start_date)
        const end = exp.end_date.toLowerCase?.().includes('present') ? new Date() : new Date(exp.end_date)
        totalYears += Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365))
      } catch { /* skip */ }
      continue
    }
    // Parse "dates" field like "2018 – 2024" or "2024 – Present"
    const dates = exp.dates || ''
    const yearMatches = dates.match(/(\d{4})/g)
    if (yearMatches && yearMatches.length >= 2) {
      const startYear = parseInt(yearMatches[0])
      const endYear = parseInt(yearMatches[yearMatches.length - 1])
      totalYears += Math.max(0, endYear - startYear)
    } else if (yearMatches && yearMatches.length === 1 && /present/i.test(dates)) {
      totalYears += Math.max(0, new Date().getFullYear() - parseInt(yearMatches[0]))
    }
  }
  return Math.round(totalYears)
}

export default function CareerPathDesigner() {
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>('welcome')
  const [questionStep, setQuestionStep] = useState<QuestionStep>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [plan, setPlan] = useState<CareerPlanType>()
  const [planId, setPlanId] = useState<number>()

  // Saved career plans
  const [savedPlans, setSavedPlans] = useState<any[]>([])
  const [loadingSavedPlans, setLoadingSavedPlans] = useState(false)

  // Async job status
  const [jobId, setJobId] = useState<string>()
  const [jobStatus, setJobStatus] = useState<string>('pending')
  const [jobProgress, setJobProgress] = useState<number>(0)
  const [jobMessage, setJobMessage] = useState<string>('')

  // Export menu
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Resume upload
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeId, setResumeId] = useState<number | null>(null)
  const [resumeData, setResumeData] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Existing resumes
  const [existingResumes, setExistingResumes] = useState<any[]>([])
  const [selectedExistingResumeId, setSelectedExistingResumeId] = useState<number | null>(null)
  const [loadingResumes, setLoadingResumes] = useState(false)
  const [deletingResumeId, setDeletingResumeId] = useState<number | null>(null)
  const [extractingJob, setExtractingJob] = useState(false)

  // Basic Profile (Step 1)
  const [dreamRoleMethod, setDreamRoleMethod] = useState<'type' | 'url' | null>(null)
  const [dreamRole, setDreamRole] = useState('')
  const [jobUrl, setJobUrl] = useState('')
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

  // Load saved intake data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('careerPathIntake')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        setCurrentRole(data.currentRole || '')
        setCurrentIndustry(data.currentIndustry || '')
        setYearsExperience(data.yearsExperience || 5)
        setEducationLevel(data.education || 'bachelors')
        setTopTasks(data.topTasks || ['', '', ''])
        setTools(data.tools || ['', '', '', '', ''])
        setStrengths(data.strengths || ['', ''])
        setLikes(data.likes || [])
        setDislikes(data.dislikes || [])
        setDreamRole(data.dreamRole || '')
        setJobUrl(data.jobUrl || '')
        setTargetRoleLevel(data.targetLevel || 'senior')
        setTargetIndustries(data.targetIndustries || [])
        setSpecificCompanies(data.specificCompanies || [])
        setTimePerWeek(data.timePerWeek || 10)
        setTimeline(data.timeline || '6months')
        setCurrentEmploymentStatus(data.employmentStatus || 'employed-full-time')
        setLocation(data.location || '')
        setWillingToRelocate(data.willingToRelocate || false)
        setInPersonVsRemote(data.inPersonVsRemote || 'remote')
        setLearningStyle(data.learningStyle || [])
        setPreferredPlatforms(data.preferredPlatforms || [])
        setTechnicalBackground(data.technicalBackground || 'some-technical')
        setTransitionMotivation(data.transitionMotivation || [])
        setSpecificTechnologiesInterest(data.specificTechnologiesInterest || [])
        setCertificationAreasInterest(data.certificationAreasInterest || [])
      } catch (err) {
        console.error('Failed to load saved data:', err)
      }
    }
  }, [])

  // Reusable function to refresh saved plans list
  const refreshSavedPlans = async () => {
    setLoadingSavedPlans(true)
    try {
      const result = await api.listCareerPlans()
      if (result.success && Array.isArray(result.data)) {
        setSavedPlans(result.data)
      }
    } catch (err) {
      console.error('Failed to load saved career plans:', err)
    } finally {
      setLoadingSavedPlans(false)
    }
  }

  // Load saved career plans on mount
  useEffect(() => {
    refreshSavedPlans()
  }, [])

  // Delete saved career plans
  const [deletingPlanId, setDeletingPlanId] = useState<number | null>(null)
  const [deletingAll, setDeletingAll] = useState(false)

  const handleDeleteAllPlans = async () => {
    if (!confirm(`Delete all ${savedPlans.length} saved career plans? This cannot be undone.`)) return

    setDeletingAll(true)
    try {
      const result = await api.deleteAllCareerPlans()
      if (result.success) {
        setSavedPlans([])
      } else {
        setError('Failed to delete all plans')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete all plans')
    } finally {
      setDeletingAll(false)
    }
  }

  const handleDeletePlan = async (e: React.MouseEvent, planId: number) => {
    e.stopPropagation() // Prevent triggering the load action
    if (!confirm('Are you sure you want to delete this career plan?')) return

    setDeletingPlanId(planId)
    try {
      const result = await api.deleteCareerPlan(planId)
      if (result.success) {
        setSavedPlans(prev => prev.filter(p => p.id !== planId))
      } else {
        setError('Failed to delete career plan')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete career plan')
    } finally {
      setDeletingPlanId(null)
    }
  }

  // Load a saved career plan
  const handleLoadSavedPlan = async (savedPlanId: number) => {
    setLoading(true)
    setError(undefined)
    try {
      const result = await api.getCareerPlan(savedPlanId)
      if (result.success && result.data) {
        const planData = result.data.plan || result.data
        setPlan(planData)
        setPlanId(savedPlanId)
        // Set context from saved plan if available
        if (result.data.intake_json) {
          const intake = result.data.intake_json
          if (intake.current_role_title) setCurrentRole(intake.current_role_title)
          if (intake.target_role_interest) setDreamRole(intake.target_role_interest)
          if (intake.timeline) setTimeline(intake.timeline)
        }
        setStep('results')
      } else {
        setError('Failed to load career plan')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load career plan')
    } finally {
      setLoading(false)
    }
  }

  // Save intake data whenever it changes
  useEffect(() => {
    const data = {
      currentRole,
      currentIndustry,
      yearsExperience,
      educationLevel,
      topTasks,
      tools,
      strengths,
      likes,
      dislikes,
      dreamRole,
      jobUrl,
      targetRoleLevel,
      targetIndustries,
      specificCompanies,
      timePerWeek,
      timeline,
      currentEmploymentStatus,
      location,
      willingToRelocate,
      inPersonVsRemote,
      learningStyle,
      preferredPlatforms,
      technicalBackground,
      transitionMotivation,
      specificTechnologiesInterest,
      certificationAreasInterest
    }
    localStorage.setItem('careerPathIntake', JSON.stringify(data))
  }, [currentRole, currentIndustry, yearsExperience, educationLevel, topTasks, tools, strengths, likes, dislikes, dreamRole, jobUrl, targetRoleLevel, targetIndustries, specificCompanies, timePerWeek, timeline, currentEmploymentStatus, location, willingToRelocate, inPersonVsRemote, learningStyle, preferredPlatforms, technicalBackground, transitionMotivation, specificTechnologiesInterest, certificationAreasInterest])

  // Auto-generate tasks when currentRole changes
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  useEffect(() => {
    // Only auto-generate if user has entered a role and tasks are empty
    const hasRole = currentRole.trim().length > 2
    const hasEmptyTasks = topTasks.filter(t => t.trim()).length === 0

    if (hasRole && hasEmptyTasks && !isGeneratingTasks) {
      setIsGeneratingTasks(true)

      // Extract bullets from resume if available
      let bullets: string[] | undefined
      if (resumeData) {
        let experience = resumeData.experience || []
        if (typeof experience === 'string') {
          try { experience = JSON.parse(experience) } catch { experience = [] }
        }
        if (Array.isArray(experience)) {
          bullets = extractExperienceBullets(experience)
          if (bullets.length === 0) bullets = undefined
        }
      }

      api.generateTasksForRole(currentRole, currentIndustry || undefined, bullets)
        .then(response => {
          if (response.success && response.data?.tasks) {
            console.log('✓ Auto-generated tasks:', response.data.tasks, response.data.source)
            setTopTasks(response.data.tasks)
          } else {
            console.warn('✗ Task generation failed:', response.error)
            // Keep default empty tasks
          }
        })
        .catch(err => {
          console.error('✗ Task generation error:', err)
          // Keep default empty tasks
        })
        .finally(() => {
          setIsGeneratingTasks(false)
        })
    }
  }, [currentRole, currentIndustry]) // Only trigger when role or industry changes

  const resetIntakeData = () => {
    localStorage.removeItem('careerPathIntake')
    setCurrentRole('')
    setCurrentIndustry('')
    setYearsExperience(5)
    setEducationLevel('bachelors')
    setTopTasks(['', '', ''])
    setTools(['', '', '', '', ''])
    setStrengths(['', ''])
    setLikes([])
    setDislikes([])
    setDreamRole('')
    setTargetRoleLevel('senior')
    setTargetIndustries([])
    setSpecificCompanies([])
    setTimePerWeek(10)
    setTimeline('6months')
    setCurrentEmploymentStatus('employed-full-time')
    setLocation('')
    setWillingToRelocate(false)
    setInPersonVsRemote('remote')
    setLearningStyle([])
    setPreferredPlatforms([])
    setTechnicalBackground('some-technical')
    setTransitionMotivation([])
    setSpecificTechnologiesInterest([])
    setCertificationAreasInterest([])
  }

  // Fetch existing resumes when on upload step
  useEffect(() => {
    if (step === 'upload' && existingResumes.length === 0) {
      setLoadingResumes(true)
      api.listResumes()
        .then(response => {
          if (response.success && response.data?.resumes) {
            setExistingResumes(response.data.resumes)
          }
        })
        .catch(err => {
          console.error('Failed to load resumes:', err)
        })
        .finally(() => {
          setLoadingResumes(false)
        })
    }
  }, [step])

  // Handle selecting an existing resume
  const handleSelectExistingResume = async (resumeId: number) => {
    setSelectedExistingResumeId(resumeId)
    setError(undefined)
    setUploadProgress(10)

    try {
      const resumeResult = await api.getResume(resumeId)
      setUploadProgress(50)

      if (!resumeResult.success || !resumeResult.data) {
        setError('Failed to load resume. Please try again.')
        setSelectedExistingResumeId(null)
        setUploadProgress(0)
        return
      }

      setResumeId(resumeId)
      setUploadProgress(100)

      // getResume returns parsed fields directly on the object (skills, experience, etc.)
      // unlike uploadResume which nests them under parsed_data
      const parsedData = resumeResult.data.parsed_data || resumeResult.data

      setResumeData(parsedData)

      // Auto-fill fields from resume
      {
        const data = parsedData

        // Parse arrays if they're stringified JSON
        let experience = data.experience || []
        let skills = data.skills || []

        if (typeof experience === 'string') {
          try { experience = JSON.parse(experience) } catch { experience = [] }
        }
        if (typeof skills === 'string') {
          try { skills = JSON.parse(skills) } catch { skills = [] }
        }

        if (!Array.isArray(experience)) experience = []
        if (!Array.isArray(skills)) skills = []

        // Set current role from latest position (handles both .title and .header formats)
        if (experience.length > 0) {
          const { title, company } = parseExperienceEntry(experience[0])
          if (title) setCurrentRole(title)
          setCurrentIndustry(inferIndustry(company, title, skills))
        }

        // Calculate years of experience
        const years = estimateYearsFromDates(experience)
        if (years > 0) setYearsExperience(years)

        // Set skills/tools
        if (Array.isArray(skills) && skills.length > 0) {
          setTools(skills.slice(0, 20))
        }

        // Determine education level (handles string or array)
        const eduLevel = parseEducationLevel(data.education)
        if (eduLevel) setEducationLevel(eduLevel)

        // Infer top strengths from resume content
        const inferredStrengths = inferStrengths(experience, skills, data.summary || '')
        if (inferredStrengths.length > 0) setStrengths(inferredStrengths)
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load resume')
      setSelectedExistingResumeId(null)
      setUploadProgress(0)
    }
  }

  const handleDeleteExistingResume = async (resumeId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) return

    try {
      setDeletingResumeId(resumeId)
      const result = await api.deleteResume(resumeId)
      if (!result.success) {
        setError(result.error || 'Failed to delete resume')
        return
      }
      setExistingResumes(prev => prev.filter(r => r.id !== resumeId))
      if (selectedExistingResumeId === resumeId) {
        setSelectedExistingResumeId(null)
        setResumeId(null)
        setResumeData(null)
        setUploadProgress(0)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume')
    } finally {
      setDeletingResumeId(null)
    }
  }

  const handleExtractJobDetails = async () => {
    const trimmedUrl = jobUrl.trim()
    if (!trimmedUrl) return

    setExtractingJob(true)
    try {
      const result = await api.extractJobDetails(trimmedUrl)
      if (result.success && result.data) {
        const extractedTitle = result.data.job_title || result.data.title || result.data.Title || ''
        if (extractedTitle) {
          setDreamRole(extractedTitle)
        }
      }
    } catch (err) {
      console.error('Failed to extract job details:', err)
    } finally {
      setExtractingJob(false)
    }
  }

  const handleContinueWithAI = async () => {
    setExtractingJob(true)
    try {
      // Re-apply resume data to any empty fields (guards against localStorage conflicts)
      if (resumeData) {
        const data = resumeData
        let experience = data.experience || []
        let skills = data.skills || []

        if (typeof experience === 'string') {
          try { experience = JSON.parse(experience) } catch { experience = [] }
        }
        if (typeof skills === 'string') {
          try { skills = JSON.parse(skills) } catch { skills = [] }
        }
        if (!Array.isArray(experience)) experience = []
        if (!Array.isArray(skills)) skills = []

        // Fill current role if empty (handles both .title and .header formats)
        let latestTitle = ''
        let latestCompany = ''
        if (experience.length > 0) {
          const parsed = parseExperienceEntry(experience[0])
          latestTitle = parsed.title
          latestCompany = parsed.company
        }

        if (!currentRole.trim() && latestTitle) {
          setCurrentRole(latestTitle)
        }

        // Fill industry if empty
        if (!currentIndustry.trim() && experience.length > 0) {
          setCurrentIndustry(inferIndustry(latestCompany, latestTitle, skills))
        }

        // Fill years if still default
        if (yearsExperience <= 5) {
          const years = estimateYearsFromDates(experience)
          if (years > 0) setYearsExperience(years)
        }

        // Fill tools/skills if empty
        if (tools.length === 0 && skills.length > 0) {
          setTools(skills.slice(0, 15))
        }

        // Fill strengths if empty
        if (!strengths.some(s => s.trim())) {
          const inferredStrengths = inferStrengths(experience, skills, data.summary || '')
          if (inferredStrengths.length > 0) setStrengths(inferredStrengths)
        }

        // Fill education
        const eduLevel = parseEducationLevel(data.education)
        if (eduLevel) setEducationLevel(eduLevel)

        // Generate tasks from resume bullets if tasks are empty
        const roleForTasks = currentRole.trim() || latestTitle
        const industryForTasks = currentIndustry.trim() || (experience.length > 0 ? inferIndustry(latestCompany, latestTitle, skills) : '')
        const tasksEmpty = topTasks.filter(t => t.trim()).length === 0

        if (roleForTasks.length > 2 && tasksEmpty) {
          try {
            const bullets = extractExperienceBullets(experience)
            const taskResponse = await api.generateTasksForRole(roleForTasks, industryForTasks || undefined, bullets.length > 0 ? bullets : undefined)
            if (taskResponse.success && taskResponse.data?.tasks) {
              setTopTasks(taskResponse.data.tasks)
            }
          } catch (err) {
            console.error('Failed to generate tasks:', err)
          }
        }
      }

      // Extract job details if URL provided but dream role not yet filled
      if (jobUrl.trim() && !dreamRole.trim()) {
        try {
          const result = await api.extractJobDetails(jobUrl.trim())
          if (result.success && result.data) {
            const title = result.data.job_title || result.data.title || result.data.Title || ''
            if (title) setDreamRole(title)
          }
        } catch (err) {
          console.error('Failed to extract job details:', err)
        }
      }
    } finally {
      setExtractingJob(false)
    }
    setStep('questions')
  }

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

        if (typeof experience === 'string') {
          try { experience = JSON.parse(experience) } catch { experience = [] }
        }
        if (typeof skills === 'string') {
          try { skills = JSON.parse(skills) } catch { skills = [] }
        }

        if (!Array.isArray(experience)) experience = []
        if (!Array.isArray(skills)) skills = []

        // Set current role from latest position (handles both .title and .header formats)
        if (experience.length > 0) {
          const { title, company } = parseExperienceEntry(experience[0])
          if (title) setCurrentRole(title)
          setCurrentIndustry(inferIndustry(company, title, skills))
        }

        // Calculate years of experience
        const years = estimateYearsFromDates(experience)
        if (years > 0) setYearsExperience(years)

        // Set tools/skills
        if (skills.length > 0) setTools(skills.slice(0, 15))

        // Infer top strengths from resume content
        const inferredStrengths = inferStrengths(experience, skills, data.summary || '')
        if (inferredStrengths.length > 0) setStrengths(inferredStrengths)

        // Determine education level (handles string or array)
        const eduLevel = parseEducationLevel(data.education)
        if (eduLevel) setEducationLevel(eduLevel)
      }

    } catch (err: any) {
      setError(err.message || 'Upload failed')
      setResumeFile(null)
      setUploadProgress(0)
    }
  }

  const exportToPDF = () => {
    window.print()
  }

  const exportToJSON = () => {
    if (!plan) return

    const dataStr = JSON.stringify(plan, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

    const exportFileDefaultName = `career-plan-${new Date().toISOString().split('T')[0]}.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
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
    setJobStatus('pending')
    setJobProgress(0)
    setJobMessage('Creating your personalized career plan...')

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
        job_url: jobUrl.trim() || undefined,

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

      console.log('🚀 Starting async career plan generation with intake:', intake)

      // Step 1: Create async job
      const createJobResult = await api.generateCareerPlanAsync(intake)

      console.log('Create job result:', createJobResult)

      if (!createJobResult.success || !createJobResult.data?.job_id) {
        const errorMsg = createJobResult.error || 'Failed to start career plan generation'
        console.error('❌ Job creation failed:', errorMsg)
        console.error('Full result:', JSON.stringify(createJobResult, null, 2))
        setError(`Generation failed: ${errorMsg}`)
        setStep('questions')
        setLoading(false)
        return
      }

      const currentJobId = createJobResult.data.job_id
      setJobId(currentJobId)
      console.log('✅ Job created:', currentJobId)

      // Step 2: Poll for job status
      let attempts = 0
      const maxAttempts = 120 // 10 minutes with 5-second polling
      const pollInterval = 5000 // 5 seconds

      const poll = async () => {
        attempts++

        if (attempts > maxAttempts) {
          setError('Career plan generation timed out. Please try again.')
          setStep('questions')
          setLoading(false)
          return
        }

        const statusResult = await api.getCareerPlanJobStatus(currentJobId)

        if (!statusResult.success) {
          console.error('❌ Failed to get job status:', statusResult.error)
          // Continue polling on status check errors
          setTimeout(poll, pollInterval)
          return
        }

        const jobData = statusResult.data
        console.log(`📊 Job status [${attempts}]:`, jobData.status, `${jobData.progress}%`, jobData.message)

        // Update UI
        setJobStatus(jobData.status)
        setJobProgress(jobData.progress || 0)
        setJobMessage(jobData.message || 'Processing...')

        if (jobData.status === 'completed' && jobData.plan) {
          console.log('✅ Career plan generation completed!')
          setPlan(jobData.plan)
          setPlanId(jobData.planId || jobData.plan_id)
          setStep('results')
          setLoading(false)
          // Refresh saved plans list so new plan appears
          refreshSavedPlans()
        } else if (jobData.status === 'failed') {
          const errorMsg = jobData.error || 'Career plan generation failed'
          console.error('❌ Job failed:', errorMsg)
          setError(errorMsg)
          setStep('questions')
          setLoading(false)
        } else {
          // Still processing, continue polling
          setTimeout(poll, pollInterval)
        }
      }

      // Start polling
      poll()

    } catch (err: any) {
      console.error('❌ Unexpected error:', err)
      setError(err.message || 'An unexpected error occurred')
      setStep('questions')
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
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-12 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-theme-inverse text-theme-inverse flex items-center justify-center font-semibold text-sm">1</div>
              <span className="text-theme font-medium">Welcome</span>
            </div>
            <div className="w-16 h-0.5 bg-theme-glass-20"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-theme-glass-10 text-theme-faint flex items-center justify-center font-semibold text-sm">2</div>
              <span className="text-theme-faint">Upload</span>
            </div>
            <div className="w-16 h-0.5 bg-theme-glass-20"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-theme-glass-10 text-theme-faint flex items-center justify-center font-semibold text-sm">3</div>
              <span className="text-theme-faint">Assessment</span>
            </div>
          </div>

          {/* Hero */}
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 glass px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <Sparkles className="w-4 h-4 text-theme" />
              <span className="text-theme">AI-Powered Career Planning</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-theme mb-4 sm:mb-6 leading-tight px-2">
              Design Your Career Transition Path
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-theme-secondary mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              Upload your resume and complete our comprehensive assessment. Get a personalized roadmap with ACTUAL certifications, study materials, tech stacks, and networking events.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-4xl mx-auto mb-10 sm:mb-16">
              <div className="glass rounded-lg p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-theme-glass-10 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-theme" />
                </div>
                <h3 className="font-semibold text-theme mb-2 text-base sm:text-lg">Upload Resume</h3>
                <p className="text-xs sm:text-sm text-theme-secondary">We analyze your experience automatically</p>
              </div>
              <div className="glass rounded-lg p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-theme-glass-10 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8 text-theme" />
                </div>
                <h3 className="font-semibold text-theme mb-2 text-base sm:text-lg">Detailed Assessment</h3>
                <p className="text-xs sm:text-sm text-theme-secondary">Comprehensive questionnaire for best fit</p>
              </div>
              <div className="glass rounded-lg p-6 sm:p-8 text-center sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-theme-glass-10 flex items-center justify-center mb-3 sm:mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-theme" />
                </div>
                <h3 className="font-semibold text-theme mb-2 text-base sm:text-lg">Actionable Plan</h3>
                <p className="text-xs sm:text-sm text-theme-secondary">Real certifications, events, and resources</p>
              </div>
            </div>

            {/* Saved Career Plans */}
            {loadingSavedPlans ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-theme animate-spin" />
                <span className="ml-3 text-theme-secondary">Loading saved plans...</span>
              </div>
            ) : savedPlans.length > 0 && (
              <div className="max-w-2xl mx-auto mb-10 px-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-theme-muted" />
                    <h3 className="text-lg font-semibold text-theme">Your Saved Career Plans</h3>
                  </div>
                  {savedPlans.length > 1 && (
                    <button
                      onClick={handleDeleteAllPlans}
                      disabled={deletingAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-theme-secondary hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    >
                      {deletingAll ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete All
                    </button>
                  )}
                </div>
                <div className="glass rounded-2xl p-4 border border-theme-subtle space-y-3">
                  {savedPlans.slice(0, 5).map((savedPlan: any) => (
                    <div
                      key={savedPlan.id}
                      className="w-full glass rounded-lg p-4 border border-theme-subtle hover:border-theme-muted transition-all flex items-center justify-between group"
                    >
                      <button
                        onClick={() => handleLoadSavedPlan(savedPlan.id)}
                        disabled={loading || deletingPlanId === savedPlan.id}
                        className="flex items-center gap-3 flex-1 text-left disabled:opacity-50"
                      >
                        <div className="w-10 h-10 rounded-lg bg-theme-glass-10 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-5 h-5 text-theme-muted" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-theme font-medium truncate">
                            {savedPlan.dream_role || savedPlan.target_roles?.[0] || 'Career Plan'}
                          </div>
                          <div className="text-sm text-theme-secondary">
                            Created {new Date(savedPlan.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <button
                          onClick={(e) => handleDeletePlan(e, savedPlan.id)}
                          disabled={deletingPlanId === savedPlan.id}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-theme-secondary hover:text-red-400 transition-all disabled:opacity-50"
                          title="Delete plan"
                        >
                          {deletingPlanId === savedPlan.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        <ChevronRight className="w-5 h-5 text-theme-secondary group-hover:text-theme transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
                {savedPlans.length > 5 && (
                  <p className="text-sm text-theme-tertiary text-center mt-2">
                    Showing 5 of {savedPlans.length} saved plans
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col items-center gap-4 px-4">
              <button
                onClick={() => setStep('upload')}
                className="btn-primary inline-flex items-center gap-2 text-base sm:text-lg w-full sm:w-auto justify-center"
              >
                {savedPlans.length > 0 ? 'Create New Plan' : 'Get Started'}
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={resetIntakeData}
                className="text-theme-secondary hover:text-theme transition-colors text-sm"
              >
                Reset Saved Data
              </button>
            </div>
            <p className="text-xs sm:text-sm text-theme-tertiary mt-4">Takes 10-15 minutes for comprehensive assessment</p>
          </div>
        </div>
      </div>
    )
  }

  // Upload Resume Screen
  if (step === 'upload') {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-12 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-theme-glass-10 text-theme-muted flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-theme-muted">Welcome</span>
            </div>
            <div className="w-16 h-0.5 bg-theme-inverse"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-theme-inverse text-theme-inverse flex items-center justify-center font-semibold text-sm">2</div>
              <span className="text-theme font-medium">Upload</span>
            </div>
            <div className="w-16 h-0.5 bg-theme-glass-20"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-theme-glass-10 text-theme-faint flex items-center justify-center font-semibold text-sm">3</div>
              <span className="text-theme-faint">Assessment</span>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-theme mb-3 sm:mb-4">Upload Your Resume</h2>
              <p className="text-base sm:text-lg text-theme-secondary px-2">
                We'll automatically extract your skills, experience, and background
              </p>
            </div>

            {/* Selected existing resume confirmation */}
            {selectedExistingResumeId && !resumeFile && (
              <div className="glass rounded-3xl p-8 mb-6">
                {uploadProgress < 100 ? (
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-theme mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-theme mb-2">Loading resume...</h3>
                    <div className="max-w-md mx-auto">
                      <div className="h-2 bg-theme-glass-10 rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-theme-inverse transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-theme-secondary">{uploadProgress}% complete</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-7 h-7 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-theme mb-1">Resume Selected</h3>
                    <p className="text-theme-secondary mb-4">
                      {existingResumes.find(r => r.id === selectedExistingResumeId)?.filename || `Resume ${selectedExistingResumeId}`}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedExistingResumeId(null)
                        setResumeId(null)
                        setResumeData(null)
                        setUploadProgress(0)
                      }}
                      className="text-theme-muted hover:text-theme font-medium text-sm transition-colors"
                    >
                      Choose a different resume
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Select from existing resumes */}
            {existingResumes.length > 0 && !resumeFile && !selectedExistingResumeId && (
              <div className="glass rounded-3xl p-8 mb-6">
                <h3 className="text-lg font-semibold text-theme mb-4 text-center">
                  Select from Your Previous Resumes
                </h3>
                {loadingResumes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-theme animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {existingResumes.map((resume: any) => (
                      <div
                        key={resume.id}
                        className="w-full glass rounded-lg p-4 border border-theme-subtle hover:border-theme-muted transition-all flex items-center justify-between group"
                      >
                        <button
                          onClick={() => handleSelectExistingResume(resume.id)}
                          className="flex items-center gap-3 min-w-0 flex-1 text-left"
                        >
                          <FileText className="w-5 h-5 text-theme-muted shrink-0" />
                          <div className="min-w-0">
                            <div className="text-theme font-medium break-words">{resume.filename || `Resume ${resume.id}`}</div>
                            <div className="text-sm text-theme-secondary">
                              Uploaded {new Date(resume.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </button>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <button
                            onClick={(e) => handleDeleteExistingResume(resume.id, e)}
                            disabled={deletingResumeId === resume.id}
                            className="p-2 rounded-lg text-theme-tertiary hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Delete resume"
                          >
                            {deletingResumeId === resume.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          <ChevronRight className="w-5 h-5 text-theme-secondary group-hover:text-theme transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* OR divider */}
            {existingResumes.length > 0 && !resumeFile && !selectedExistingResumeId && (
              <div className="flex justify-center mb-6">
                <span className="px-4 glass rounded-full text-theme-secondary text-sm">OR</span>
              </div>
            )}

            {/* Upload zone - hidden when existing resume is selected */}
            {!selectedExistingResumeId && <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-16 mb-6 sm:mb-8">
              <div className="border-2 border-dashed border-theme-muted rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center transition-all hover:border-theme">
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
                    <Upload className="w-12 h-12 sm:w-16 sm:h-16 text-theme mx-auto mb-4 sm:mb-6" />
                    <h3 className="text-lg sm:text-xl font-semibold text-theme mb-2">
                      Click to select your resume
                    </h3>
                    <p className="text-sm sm:text-base text-theme-secondary mb-4 sm:mb-6">
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
                        <Loader2 className="w-16 h-16 text-theme mx-auto mb-4 animate-spin" />
                        <h3 className="text-xl font-semibold text-theme mb-2">
                          Analyzing your resume...
                        </h3>
                        <div className="max-w-md mx-auto">
                          <div className="h-2 bg-theme-glass-10 rounded-full overflow-hidden mb-2">
                            <div
                              className="h-full bg-theme-inverse transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-theme-secondary">{uploadProgress}% complete</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 rounded-full bg-theme-glass-10 flex items-center justify-center mx-auto mb-4">
                          <Check className="w-8 h-8 text-theme" />
                        </div>
                        <h3 className="text-xl font-semibold text-theme mb-2">
                          Resume uploaded successfully!
                        </h3>
                        <p className="text-theme-secondary mb-4 truncate px-4">
                          {resumeFile.name}
                        </p>
                        <button
                          onClick={() => {
                            setResumeFile(null)
                            setResumeId(null)
                            setResumeData(null)
                            setUploadProgress(0)
                          }}
                          className="text-theme-muted hover:text-theme font-medium"
                        >
                          Upload different file
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>}

            {/* Dream Role Method Toggle */}
            <div className="glass rounded-2xl sm:rounded-3xl p-6 sm:p-8 mb-6 space-y-5">
              <div>
                <label className="text-theme font-semibold mb-3 block text-sm sm:text-base">
                  How would you like to target your next role?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setDreamRoleMethod(dreamRoleMethod === 'type' ? null : 'type')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                      dreamRoleMethod === 'type'
                        ? 'border-theme bg-theme-glass-10 text-theme'
                        : 'border-theme-muted bg-theme-glass-5 text-theme-secondary hover:border-theme hover:bg-theme-glass-10'
                    }`}
                  >
                    <Lightbulb className={`w-5 h-5 flex-shrink-0 ${dreamRoleMethod === 'type' ? 'text-theme' : 'text-theme-secondary'}`} />
                    <span className="font-medium text-sm sm:text-base">I know my dream role</span>
                  </button>
                  <button
                    onClick={() => setDreamRoleMethod(dreamRoleMethod === 'url' ? null : 'url')}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                      dreamRoleMethod === 'url'
                        ? 'border-theme bg-theme-glass-10 text-theme'
                        : 'border-theme-muted bg-theme-glass-5 text-theme-secondary hover:border-theme hover:bg-theme-glass-10'
                    }`}
                  >
                    <Link2 className={`w-5 h-5 flex-shrink-0 ${dreamRoleMethod === 'url' ? 'text-theme' : 'text-theme-secondary'}`} />
                    <span className="font-medium text-sm sm:text-base">I have a job posting</span>
                  </button>
                </div>
              </div>

              {dreamRoleMethod === 'type' && (
                <div>
                  <label className="text-theme font-semibold mb-2 block text-sm sm:text-base">
                    Dream Role or Career Goal
                    {extractingJob && <span className="text-theme-secondary font-normal text-xs ml-2">extracting...</span>}
                  </label>
                  <input
                    type="text"
                    value={dreamRole}
                    onChange={(e) => setDreamRole(e.target.value)}
                    placeholder="e.g., Senior Cloud Security Architect, Product Manager"
                    className="w-full px-3 sm:px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary text-[16px]"
                    data-testid="dream-role-input"
                  />
                </div>
              )}

              {dreamRoleMethod === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-theme font-semibold mb-2 block text-sm sm:text-base">
                      Job Posting URL
                    </label>
                    <input
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="https://linkedin.com/jobs/... or any job posting URL"
                      className="w-full px-3 sm:px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary text-[16px]"
                    />
                    <p className="text-theme-tertiary text-xs mt-1">Job details will be extracted when you continue</p>
                  </div>
                  <div>
                    <label className="text-theme font-semibold mb-2 block text-sm sm:text-base">
                      Dream Role <span className="text-theme-secondary font-normal text-xs">(auto-filled from URL or enter manually)</span>
                      {extractingJob && <span className="text-theme-secondary font-normal text-xs ml-2">extracting...</span>}
                    </label>
                    <input
                      type="text"
                      value={dreamRole}
                      onChange={(e) => setDreamRole(e.target.value)}
                      placeholder="e.g., Senior Cloud Security Architect, Product Manager"
                      className="w-full px-3 sm:px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary text-[16px]"
                      data-testid="dream-role-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-8 glass rounded-lg p-4 border-2 border-red-500/50">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 mb-3 break-words">{error}</p>
                    {(error.toLowerCase().includes('failed') || error.toLowerCase().includes('network') || error.toLowerCase().includes('timeout')) && (
                      <button
                        onClick={() => setError(undefined)}
                        className="text-sm text-red-400 hover:text-red-300 underline transition-colors"
                      >
                        Dismiss and try again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                onClick={() => setStep('welcome')}
                className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme font-medium transition-colors order-3 sm:order-1"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                {(resumeFile || selectedExistingResumeId || jobUrl.trim() || dreamRole.trim()) && (
                  <button
                    onClick={handleContinueWithAI}
                    disabled={extractingJob}
                    className="btn-primary inline-flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {extractingJob ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Continue with AI
                        <ChevronRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setStep('questions')}
                  className="btn-secondary inline-flex items-center gap-2 w-full sm:w-auto justify-center order-2"
                >
                  Skip & Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Questions Screen (Multi-Step)
  if (step === 'questions') {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8 sm:mb-12 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-theme-glass-10 text-theme-muted flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-theme-muted">Welcome</span>
            </div>
            <div className="w-16 h-0.5 bg-theme-inverse"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-theme-glass-10 text-theme-muted flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>
              <span className="text-theme-muted">Upload</span>
            </div>
            <div className="w-16 h-0.5 bg-theme-inverse"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-theme-inverse text-theme-inverse flex items-center justify-center font-semibold text-sm">3</div>
              <span className="text-theme font-medium">Assessment</span>
            </div>
          </div>

          {/* Question step indicator */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6 sm:mb-8 flex-wrap">
            {[1, 2, 3, 4, 5].map((num) => (
              <React.Fragment key={num}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-sm transition-all ${
                  questionStep === num
                    ? 'bg-theme-inverse text-theme-inverse scale-110'
                    : questionStep > num
                    ? 'bg-theme-glass-20 text-theme-muted'
                    : 'bg-theme-glass-10 text-theme-faint'
                }`}>
                  {questionStep > num ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : num}
                </div>
                {num < 5 && <div className={`w-6 sm:w-12 h-0.5 ${questionStep > num ? 'bg-theme-glass-20' : 'bg-theme-glass-20'}`}></div>}
              </React.Fragment>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Step 1: Basic Profile */}
            {questionStep === 1 && (
              <div>
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-theme-glass-10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Target className="w-6 h-6 sm:w-8 sm:h-8 text-theme" />
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-theme mb-2">Basic Profile</h2>
                  <p className="text-sm sm:text-base text-theme-secondary">Tell us about your current role and dream career</p>
                </div>

                <div className="glass rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                  {/* Current Role */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-theme font-semibold text-sm sm:text-base">Current Role Title</label>
                      {currentRole.trim() && resumeData && (
                        <span className="text-xs text-blue-400">
                          ✨ AI-inferred from resume
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={currentRole}
                      onChange={(e) => setCurrentRole(e.target.value)}
                      placeholder="e.g., IT Manager, Software Developer"
                      className="w-full px-3 sm:px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary text-[16px]"
                    />
                  </div>

                  {/* Current Industry */}
                  <div>
                    <label className="text-theme font-semibold mb-2 block text-sm sm:text-base">Current Industry</label>
                    <input
                      type="text"
                      value={currentIndustry}
                      onChange={(e) => setCurrentIndustry(e.target.value)}
                      placeholder="e.g., Healthcare, Finance, Technology"
                      className="w-full px-3 sm:px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary text-[16px]"
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Years of Experience: {yearsExperience}</label>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="1"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(parseInt(e.target.value))}
                      className="w-full accent-current"
                    />
                    <div className="flex justify-between text-sm text-theme-secondary mt-2">
                      <span>0 years</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  {/* Education Level */}
                  <div>
                    <label className="text-theme font-semibold mb-2 sm:mb-3 block text-sm sm:text-base">Education Level</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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
                          className={`p-3 min-h-[44px] rounded-lg border-2 text-center transition-all ${
                            educationLevel === option.value
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="font-semibold text-theme text-xs sm:text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Top Tasks */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-theme font-semibold">Top 3-5 Tasks in Current Role *</label>
                      {isGeneratingTasks ? (
                        <span className="text-xs text-blue-400 animate-pulse">
                          ✨ AI is inferring from resume...
                        </span>
                      ) : topTasks.some(t => t.trim()) && resumeData ? (
                        <span className="text-xs text-blue-400">
                          ✨ AI-inferred from resume
                        </span>
                      ) : null}
                    </div>
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
                        className="w-full px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary mb-2"
                      />
                    ))}
                    <button
                      onClick={() => setTopTasks([...topTasks, ''])}
                      className="text-theme-muted hover:text-theme text-sm"
                    >
                      + Add another task
                    </button>
                  </div>

                  {/* Strengths */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-theme font-semibold">Your Top Strengths (2-5) *</label>
                      {strengths.some(s => s.trim()) && resumeData && (
                        <span className="text-xs text-blue-400">
                          ✨ AI-inferred from resume
                        </span>
                      )}
                    </div>
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
                        className="w-full px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary mb-2"
                      />
                    ))}
                    {strengths.length < 5 && (
                      <button
                        onClick={() => setStrengths([...strengths, ''])}
                        className="text-theme-muted hover:text-theme text-sm"
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
                  <div className="w-16 h-16 rounded-full bg-theme-glass-10 flex items-center justify-center mx-auto mb-4">
                    <Building className="w-8 h-8 text-theme" />
                  </div>
                  <h2 className="text-3xl font-bold text-theme mb-2">Target Role Details</h2>
                  <p className="text-theme-secondary">Help us understand your career aspirations</p>
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  {/* Target Role Level */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Desired Career Level</label>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="font-semibold text-theme text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Industries */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Target Industries (Select all that apply)</label>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="font-semibold text-theme text-sm">{industry}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Companies */}
                  <div>
                    <label className="text-theme font-semibold mb-2 block">Specific Companies of Interest (Optional)</label>
                    <p className="text-sm text-theme-secondary mb-3">List companies you'd like to work for</p>
                    <input
                      type="text"
                      placeholder="e.g., Google, Amazon, Microsoft (comma-separated)"
                      onChange={(e) => setSpecificCompanies(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Work Preferences */}
            {questionStep === 3 && (
              <div>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-theme-glass-10 flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-theme" />
                  </div>
                  <h2 className="text-3xl font-bold text-theme mb-2">Work Preferences</h2>
                  <p className="text-theme-secondary">Your availability and work style</p>
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  {/* Timeline */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Transition Timeline</label>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                          data-testid={`timeline-${option.value}`}
                        >
                          <div className="font-semibold text-theme text-sm">{option.label}</div>
                          <div className="text-xs text-theme-secondary">{option.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time per week */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">
                      Hours per Week Available: {timePerWeek} hrs/week
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="40"
                      step="5"
                      value={timePerWeek}
                      onChange={(e) => setTimePerWeek(parseInt(e.target.value))}
                      className="w-full accent-current"
                      data-testid="time-per-week-slider"
                    />
                    <div className="flex justify-between text-sm text-theme-secondary mt-2">
                      <span>5 hrs/week</span>
                      <span>40 hrs/week</span>
                    </div>
                  </div>

                  {/* Current Employment Status */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Current Employment Status</label>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="font-semibold text-theme text-sm">{option.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-theme font-semibold mb-2 block">Your Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g., Austin, TX or Remote"
                      className="w-full px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary"
                      data-testid="location-input"
                    />
                    <p className="text-sm text-theme-secondary mt-2">
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
                        className="w-5 h-5 rounded border-2 border-theme-muted bg-theme-glass-5 checked:bg-theme-inverse checked:border-theme-inverse"
                      />
                      <span className="text-theme font-semibold">Willing to relocate for opportunities</span>
                    </label>
                  </div>

                  {/* Work Preference */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Work Preference</label>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="font-semibold text-theme text-sm">{option.label}</div>
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
                  <div className="w-16 h-16 rounded-full bg-theme-glass-10 flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-theme" />
                  </div>
                  <h2 className="text-3xl font-bold text-theme mb-2">Learning Preferences</h2>
                  <p className="text-theme-secondary">How you learn best</p>
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  {/* Learning Style */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Preferred Learning Styles (Select all that apply) *</label>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{option.icon}</span>
                            <div className="font-semibold text-theme text-sm">{option.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Platforms */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Preferred Learning Platforms (Optional)</label>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="font-semibold text-theme text-sm">{platform}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Technical Background */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Technical Background</label>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="font-semibold text-theme text-sm">{option.label}</div>
                          <div className="text-xs text-theme-secondary">{option.desc}</div>
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
                  <div className="w-16 h-16 rounded-full bg-theme-glass-10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-theme" />
                  </div>
                  <h2 className="text-3xl font-bold text-theme mb-2">Motivation & Goals</h2>
                  <p className="text-theme-secondary">What drives this career change</p>
                </div>

                <div className="glass rounded-3xl p-8 space-y-6">
                  {/* Transition Motivation */}
                  <div>
                    <label className="text-theme font-semibold mb-3 block">Why are you transitioning? (Select all that apply) *</label>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{option.icon}</span>
                            <div className="font-semibold text-theme text-sm">{option.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Specific Technologies Interest */}
                  <div>
                    <label className="text-theme font-semibold mb-2 block">Technologies You Want to Learn (Optional)</label>
                    <p className="text-sm text-theme-secondary mb-3">List specific technologies, frameworks, or tools</p>
                    <input
                      type="text"
                      placeholder="e.g., React, AWS, Python, Kubernetes (comma-separated)"
                      onChange={(e) => setSpecificTechnologiesInterest(e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                      className="w-full px-4 py-3 bg-theme-glass-5 border-2 border-theme-subtle rounded-lg focus:border-theme focus:ring-0 text-theme placeholder-theme-tertiary"
                    />
                  </div>

                  {/* Certification Areas Interest */}
                  <div>
                    <label className="text-theme font-semibold mb-2 block">Certification Areas of Interest (Optional)</label>
                    <p className="text-sm text-theme-secondary mb-3">Areas you'd like to get certified in</p>
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
                              ? 'border-theme bg-theme-glass-10'
                              : 'border-theme-muted hover:border-theme'
                          }`}
                        >
                          <div className="font-semibold text-theme text-sm">{area}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 glass rounded-lg p-4 border-2 border-red-500/50">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-400 mb-3 break-words">{error}</p>
                    {(error.toLowerCase().includes('failed') || error.toLowerCase().includes('network') || error.toLowerCase().includes('timeout')) && (
                      <button
                        onClick={() => setError(undefined)}
                        className="text-sm text-red-400 hover:text-red-300 underline transition-colors"
                      >
                        Dismiss and try again
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {questionStep > 1 ? (
                <button
                  onClick={handlePrevQuestionStep}
                  className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme font-medium transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>
              ) : (
                <button
                  onClick={() => setStep('upload')}
                  className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme font-medium transition-colors"
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
            <div className="mt-6 text-center text-sm text-theme-secondary">
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
      <AILoadingScreen
        title="Crafting Your Personalized Career Roadmap"
        subtitle={jobMessage || `Our AI is researching ${dreamRole} opportunities with real-world data...`}
        footnote="This typically takes 30-90 seconds"
        steps={[
          { id: 'research', label: 'Researching certifications, events, and job market data', description: 'Searching with Perplexity AI...' },
          { id: 'analyze', label: 'Analyzing your transferable skills', description: 'Matching your experience to target roles...' },
          { id: 'roadmaps', label: 'Creating detailed project roadmaps with tech stacks', description: 'Building personalized learning paths...' },
          { id: 'finalize', label: 'Finalizing your resume transformation guide', description: 'Generating actionable recommendations...' },
        ]}
        progress={{ type: 'polled', progress: jobProgress }}
      />
    )
  }

  // Results Screen - WILL BE COMPLETELY REDESIGNED NEXT
  if (step === 'results') {
    if (!plan) {
      return (
        <div className="min-h-screen p-8 flex items-center justify-center">
          <div className="glass rounded-lg p-8 max-w-md text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-theme mb-2">Failed to Generate Plan</h2>
            <p className="text-theme-secondary mb-6">
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
                className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                New Plan
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export Plan
                  <ChevronDown className="w-4 h-4" />
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
                      <FileText size={16} />
                      <span>Export as PDF</span>
                    </button>
                    <button
                      onClick={() => {
                        exportToJSON()
                        setShowExportMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-theme hover:bg-theme-glass-10 transition-colors flex items-center gap-3"
                    >
                      <Download size={16} />
                      <span>Export as JSON</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="glass rounded-lg p-8 border border-theme-subtle">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-theme-glass-10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-theme" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-theme mb-2">Your Career Transition Plan</h1>
                  <p className="text-theme-secondary mb-4 break-words">{plan.profileSummary || 'Your personalized career transition roadmap'}</p>
                  <div className="flex items-center gap-4 text-sm">
                    {plan.generatedAt && (
                      <>
                        <span className="text-theme-tertiary">Generated {new Date(plan.generatedAt).toLocaleDateString()}</span>
                        <span className="text-theme-tertiary">•</span>
                      </>
                    )}
                    <span className="text-theme-tertiary">Timeline: {timeline}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Career Plan Results */}
          <CareerPlanResults plan={plan} timeline={timeline} onExportPDF={exportToPDF} />

          {/* Print-Only Career Plan View */}
          <div className="print-content">
            <div className="max-w-4xl mx-auto bg-white p-8">
              {/* Header */}
              <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Career Transition Plan
                </h1>
                <p className="text-gray-700">{plan.profileSummary}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Timeline: {timeline}
                  {plan.generatedAt && ` | Generated ${new Date(plan.generatedAt).toLocaleDateString()}`}
                </p>
              </div>

              {/* Target Roles */}
              {plan.targetRoles?.length > 0 && (
                <div className="mb-6 print-avoid-break">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    TARGET ROLES
                  </h3>
                  {plan.targetRoles.map((role, i) => (
                    <div key={i} className="mb-4">
                      <h4 className="font-bold text-gray-900">{role.title}</h4>
                      <p className="text-sm text-gray-700 mb-1">{role.whyAligned}</p>
                      <p className="text-sm text-gray-600">
                        <strong>Salary:</strong> {role.salaryRange} | <strong>Growth:</strong> {role.growthOutlook}
                      </p>
                      {role.typicalRequirements?.length > 0 && (
                        <ul className="text-sm text-gray-800 mt-1 space-y-0.5">
                          {role.typicalRequirements.map((r, j) => (
                            <li key={j} className="ml-4">&#8226; {r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Skills Analysis */}
              {plan.skillsAnalysis && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    SKILLS ANALYSIS
                  </h3>
                  {plan.skillsAnalysis.alreadyHave?.length > 0 && (
                    <div className="mb-3 print-avoid-break">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Transferable Skills:</p>
                      {plan.skillsAnalysis.alreadyHave.map((s, i) => (
                        <p key={i} className="text-sm text-gray-800 ml-4 mb-1">
                          &#8226; <strong>{s.skillName}:</strong> {s.targetRoleMapping}
                        </p>
                      ))}
                    </div>
                  )}
                  {plan.skillsAnalysis.needToBuild?.length > 0 && (
                    <div className="mb-3 print-avoid-break">
                      <p className="text-sm font-semibold text-gray-800 mb-1">Skills to Build:</p>
                      {plan.skillsAnalysis.needToBuild.map((s, i) => (
                        <p key={i} className="text-sm text-gray-800 ml-4 mb-1">
                          &#8226; <strong>{s.skillName}</strong> ({s.priority}): {s.howToBuild} — Est. {s.estimatedTime}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Certifications */}
              {plan.certificationPath?.length > 0 && (
                <div className="mb-6 page-break">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    CERTIFICATION PATH
                  </h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Certification</th>
                        <th>Body</th>
                        <th>Level</th>
                        <th>Study Time</th>
                        <th>Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.certificationPath.map((c, i) => (
                        <tr key={i}>
                          <td className="font-medium">{c.name}</td>
                          <td>{c.certifyingBody}</td>
                          <td className="capitalize">{c.level}</td>
                          <td>{c.estStudyWeeks} weeks</td>
                          <td>{c.estCostRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Experience Plan */}
              {plan.experiencePlan?.length > 0 && (
                <div className="mb-6 print-avoid-break">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    EXPERIENCE BUILDING PLAN
                  </h3>
                  {plan.experiencePlan.map((p, i) => (
                    <div key={i} className="mb-3">
                      <p className="text-sm text-gray-800">
                        <strong>{p.title}</strong> ({p.type}) — {p.timeCommitment}
                      </p>
                      <p className="text-sm text-gray-700 ml-4">{p.description}</p>
                      {p.skillsDemonstrated?.length > 0 && (
                        <p className="text-xs text-gray-600 ml-4 mt-1">
                          Skills: {p.skillsDemonstrated.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Timeline */}
              {plan.timeline?.twelveWeekPlan?.length > 0 && (
                <div className="mb-6 page-break">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    12-WEEK ACTION PLAN
                  </h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Week</th>
                        <th>Tasks</th>
                        <th>Milestone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.timeline.twelveWeekPlan.map((w, i) => (
                        <tr key={i}>
                          <td className="font-medium">Week {w.weekNumber}</td>
                          <td>{w.tasks.join('; ')}</td>
                          <td>{w.milestone || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Resume Assets */}
              {plan.resumeAssets && (
                <div className="mb-6 print-avoid-break">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                    RESUME ASSETS
                  </h3>
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-800">Headline:</p>
                    <p className="text-sm text-gray-800 ml-4">{plan.resumeAssets.headline}</p>
                  </div>
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-gray-800">Summary:</p>
                    <p className="text-sm text-gray-800 ml-4">{plan.resumeAssets.summary}</p>
                  </div>
                  {plan.resumeAssets.keywordsForAts?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-800">ATS Keywords:</p>
                      <p className="text-sm text-gray-800 ml-4">{plan.resumeAssets.keywordsForAts.join(', ')}</p>
                    </div>
                  )}
                  {plan.resumeAssets.targetRoleBullets?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-800">Achievement Bullets:</p>
                      <ul className="text-sm text-gray-800 space-y-1">
                        {plan.resumeAssets.targetRoleBullets.map((b, i) => (
                          <li key={i} className="ml-4">&#8226; {b.bulletText}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-300 text-center">
                <p className="text-xs text-gray-500">
                  Generated by TalorMe | talorme.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
