/**
 * TypeScript types for Career Path Designer
 * Mirrors backend Pydantic schemas
 */

// ========== Intake Types ==========
export interface IntakeForm {
  currentRoleTitle: string
  currentIndustry: string
  yearsExperience: number
  topTasks: string[]
  tools: string[]
  strengths: string[]
  likes: string[]
  dislikes: string[]
  targetRoleInterest?: string
  timePerWeek: number
  budget: string
  timeline: string
  educationLevel: string
  location: string
  inPersonVsRemote: string
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

// ========== Certification Types ==========
export interface Certification {
  name: string
  level: 'foundation' | 'intermediate' | 'advanced'
  prerequisites: string[]
  estStudyWeeks: number
  estCostRange: string
  officialLinks: string[]
  whatItUnlocks: string
  alternatives: string[]
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

// ========== Experience Types ==========
export interface ExperienceProject {
  type: 'portfolio' | 'volunteer' | 'lab' | 'side-project' | 'freelance'
  title: string
  description: string
  skillsDemonstrated: string[]
  timeCommitment: string
  howToShowcase: string
  exampleResources: string[]
}

// ========== Event Types ==========
export interface Event {
  name: string
  type: 'conference' | 'meetup' | 'virtual' | 'career-fair' | 'workshop'
  dateOrSeason: string
  location: string
  priceRange: string
  beginnerFriendly: boolean
  whyAttend: string
  registrationLink: string
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

// ========== Resume Assets Types ==========
export interface ResumeAssets {
  headline: string
  summary: string
  skillsSection: string[]
  targetRoleBullets: string[]
  keywordsForAts: string[]
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
  budget: string
}

export interface GenerateCareerPlanRequest {
  intake: IntakeForm
}

export interface CareerPlanResponse {
  success: boolean
  plan?: CareerPlan
  planId?: number
  error?: string
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
