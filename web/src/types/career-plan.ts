/**
 * TypeScript types for Career Path Designer
 * Mirrors backend Pydantic schemas with enhanced detail fields
 */

// ========== Intake Types ==========
export interface IntakeForm {
  // Basic Profile
  currentRoleTitle: string
  currentIndustry: string
  yearsExperience: number
  educationLevel: string
  topTasks: string[]
  tools: string[]
  strengths: string[]
  likes: string[]
  dislikes: string[]

  // Target Role
  targetRoleInterest?: string
  targetRoleLevel: string
  targetIndustries: string[]
  specificCompanies: string[]

  // Timeline & Availability
  timePerWeek: number
  timeline: string
  currentEmploymentStatus: string

  // Location & Work Preferences
  location: string
  willingToRelocate: boolean
  inPersonVsRemote: string

  // Learning Preferences
  learningStyle: string[]
  preferredPlatforms: string[]
  technicalBackground: string

  // Motivation & Goals
  transitionMotivation: string[]
  specificTechnologiesInterest: string[]
  certificationAreasInterest: string[]
}

// ========== Target Role Types ==========
export interface BridgeRole {
  title: string
  whyGoodFit: string
  timeToQualify: string
  keyGapsToClose: string[]
}

export interface TargetRole {
  title: string
  whyAligned: string
  growthOutlook: string
  salaryRange: string
  typicalRequirements: string[]
  bridgeRoles: BridgeRole[]
  sourceCitations: string[]
}

// ========== Skills Types ==========
export interface TransferableSkill {
  skillName: string
  evidenceFromInput: string
  targetRoleMapping: string
  resumeBullets: string[]
}

export interface ReframableSkill {
  skillName: string
  currentContext: string
  targetContext: string
  howToReframe: string
  resumeBullets: string[]
}

export interface GapSkill {
  skillName: string
  whyNeeded: string
  priority: 'critical' | 'high' | 'medium'
  howToBuild: string
  estimatedTime: string
}

export interface SkillsAnalysis {
  alreadyHave: TransferableSkill[]
  canReframe: ReframableSkill[]
  needToBuild: GapSkill[]
}

// ========== Certification Types (ENHANCED) ==========
export interface StudyMaterial {
  type: string  // official-course, book, video-series, practice-exams, hands-on-labs
  title: string
  provider: string  // e.g., Official body, Udemy, Pluralsight, O'Reilly
  url: string
  cost: string  // e.g., "Free", "$49.99", "Included in subscription"
  duration: string  // e.g., "40 hours", "350 pages", "12 practice exams"
  description: string  // 50-200 word description
  recommendedOrder: number  // 1-20
}

export interface Certification {
  name: string
  certifyingBody: string  // NEW: e.g., CompTIA, AWS, Microsoft, ISC2
  level: 'foundation' | 'intermediate' | 'advanced'
  prerequisites: string[]
  estStudyWeeks: number
  estCostRange: string
  examDetails: {  // NEW: Detailed exam information
    examCode?: string
    passingScore?: string
    durationMinutes?: number
    numQuestions?: number
    questionTypes?: string
  }
  officialLinks: string[]
  whatItUnlocks: string
  alternatives: string[]
  studyMaterials: StudyMaterial[]  // NEW: Detailed study resources
  studyPlanWeeks: Array<{  // NEW: Week-by-week study plan
    week?: number
    focus?: string
    resources?: string
    practice?: string
  }>
  sourceCitations: string[]
}

// ========== Education Types ==========
export interface EducationOption {
  type: 'degree' | 'bootcamp' | 'self-study' | 'online-course'
  name: string
  duration: string
  costRange: string
  format: 'online' | 'in-person' | 'hybrid'
  officialLink?: string
  pros: string[]
  cons: string[]
  sourceCitations: string[]
}

// ========== Experience Types (ENHANCED) ==========
export interface TechStackDetail {
  name: string  // e.g., "React 18", "PostgreSQL", "AWS Lambda"
  category: string  // e.g., "Frontend Framework", "Database", "Cloud Service"
  whyThisTech: string  // 50-150 words explaining value for target role
  learningResources: string[]  // URLs to learn this specific tech
}

export interface ExperienceProject {
  type: 'portfolio' | 'volunteer' | 'lab' | 'side-project' | 'freelance'
  title: string
  description: string
  skillsDemonstrated: string[]
  detailedTechStack: TechStackDetail[]  // NEW: Detailed tech stack with explanations
  architectureOverview: string  // NEW: 100-200 word architecture explanation
  timeCommitment: string
  difficultyLevel: string  // NEW: beginner, intermediate, advanced
  stepByStepGuide: string[]  // NEW: High-level steps to build
  howToShowcase: string
  exampleResources: string[]
  githubExampleRepos: string[]  // NEW: Similar projects on GitHub
}

// ========== Event Types (ENHANCED) ==========
export interface Event {
  name: string
  organizer: string  // NEW: Who runs this event
  type: 'conference' | 'meetup' | 'virtual' | 'career-fair' | 'workshop'
  dateOrSeason: string
  location: string
  scope: string  // NEW: local, regional, national, international
  priceRange: string
  attendeeCount?: string  // NEW: e.g., "500-1000 attendees"
  beginnerFriendly: boolean
  targetAudience: string  // NEW: Who this event is for
  whyAttend: string  // ENHANCED: 100-200 word detailed explanation
  keyTopics: string[]  // NEW: Main topics covered
  notableSpeakers: string[]  // NEW: Known speakers or companies
  registrationLink?: string
  recurring: boolean  // NEW: Annual/recurring event?
  virtualOptionAvailable: boolean  // NEW
  sourceCitations: string[]
}

// ========== Timeline Types ==========
export interface WeeklyTask {
  weekNumber: number
  tasks: string[]
  milestone?: string
  checkpoint?: string
}

export interface MonthlyPhase {
  monthNumber: number
  phaseName: string
  goals: string[]
  deliverables: string[]
  checkpoint?: string
}

export interface Timeline {
  twelveWeekPlan: WeeklyTask[]
  sixMonthPlan: MonthlyPhase[]
  applyReadyCheckpoint: string
}

// ========== Resume Assets Types (COMPLETELY REDESIGNED) ==========
export interface ResumeBullet {
  bulletText: string  // 50-300 char achievement bullet
  whyThisWorks: string  // NEW: 100-200 word detailed explanation
  whatToEmphasize: string  // NEW: Interview talking points
  keywordsIncluded: string[]  // NEW: ATS keywords
  structureExplanation: string  // NEW: CAR/STAR breakdown
}

export interface SkillGrouping {
  category: string  // e.g., "Technical Skills", "Cloud Platforms"
  skills: string[]
  whyGroupThese: string  // NEW: 50-100 word explanation
  priority: string  // NEW: core, important, supplementary
}

export interface ResumeAssets {
  // Headline & Summary
  headline: string
  headlineExplanation: string  // NEW: 100-200 word explanation

  summary: string
  summaryBreakdown: string  // NEW: 200-400 word sentence-by-sentence explanation
  summaryStrategy: string  // NEW: 100-200 word overall strategy

  // Skills Section
  skillsGrouped: SkillGrouping[]  // NEW: Organized by category
  skillsOrderingRationale: string  // NEW: 100-200 word ordering strategy

  // Achievement Bullets
  targetRoleBullets: ResumeBullet[]  // ENHANCED: Now with detailed explanations
  bulletsOverallStrategy: string  // NEW: 150-300 word collective positioning

  // Experience Reframing
  howToReframeCurrentRole: string  // NEW: 200-400 word detailed guide
  experienceGapsToAddress: string[]  // NEW: How to address gaps

  // Keywords & ATS
  keywordsForAts: string[]
  keywordPlacementStrategy: string  // NEW: 100-200 word strategy

  // LinkedIn Guidance
  linkedinHeadline: string  // NEW
  linkedinAboutSection: string  // NEW: 200-2000 char
  linkedinStrategy: string  // NEW: 100-200 word optimization guide

  // Cover Letter
  coverLetterTemplate: string  // NEW: 500-1000 char framework
  coverLetterGuidance: string  // NEW: 200-400 word adaptation guide
}

// ========== Complete Career Plan Type ==========
export interface CareerPlan {
  generatedAt: string
  version: string
  profileSummary: string
  targetRoles: TargetRole[]
  skillsAnalysis: SkillsAnalysis
  certificationPath: Certification[]
  educationOptions: EducationOption[]
  experiencePlan: ExperienceProject[]
  events: Event[]
  timeline: Timeline
  resumeAssets: ResumeAssets
  researchSources: string[]
}

// ========== API Types ==========
export interface ResearchRequest {
  targetRoles: string[]
  location: string
  educationLevel: string
}

export interface GenerateCareerPlanRequest {
  intake: IntakeForm
}

export interface CareerPlanResponse {
  success: boolean
  plan?: CareerPlan
  planId?: number
  error?: string
  validationErrors?: any[]
}

export interface CareerPlanListItem {
  id: number
  targetRoles: string[]
  createdAt: string
  updatedAt: string
  version: string
}

// ========== Wizard State Type ==========
export interface WizardState {
  currentStep: number
  intake?: IntakeForm
  plan?: CareerPlan
  loading: boolean
  error?: string
}
