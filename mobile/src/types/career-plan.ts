/**
 * TypeScript types for Career Path Designer
 * Mirrors backend Pydantic schemas with enhanced detail fields
 */

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

// ========== Skills Guidance Types ==========
export interface SkillGuidanceItem {
  skillName: string
  whyNeeded: string
  howToImprove: string
  importance: 'critical' | 'high' | 'medium'
  estimatedTime: string
  resources: string[]
  realWorldApplication: string
}

export interface SkillsGuidance {
  softSkills: SkillGuidanceItem[]
  hardSkills: SkillGuidanceItem[]
  skillDevelopmentStrategy: string
}

// ========== Certification Types ==========
export interface StudyMaterial {
  type: string
  title: string
  provider: string
  url: string
  cost: string
  duration: string
  description: string
  recommendedOrder: number
}

export interface Certification {
  name: string
  certifyingBody: string
  level: 'foundation' | 'intermediate' | 'advanced'
  prerequisites: string[]
  estStudyWeeks: number
  estCostRange: string
  examDetails: {
    examCode?: string
    passingScore?: string
    durationMinutes?: number
    numQuestions?: number
    questionTypes?: string
  }
  officialLinks: string[]
  whatItUnlocks: string
  alternatives: string[]
  studyMaterials: StudyMaterial[]
  studyPlanWeeks: Array<{
    week?: number
    focus?: string
    resources?: string
    practice?: string
  }>
  sourceCitations: string[]
  priority?: 'high' | 'medium' | 'low'
  roiRating?: string
  difficulty?: string
  skillsGained?: string[]
  whyRecommended?: string
  journeyOrder?: number
  tier?: 'foundation' | 'intermediate' | 'advanced'
  unlocksNext?: string
  beginnerEntryPoint?: boolean
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
  description?: string
  whoItsBestFor?: string
  financingOptions?: string
  employmentOutcomes?: string
  timeCommitmentWeekly?: string
  comparisonRank?: number
}

// ========== Experience Types ==========
export interface TechStackDetail {
  name: string
  category: string
  whyThisTech: string
  learningResources: string[]
}

export interface ExperienceProject {
  type: 'portfolio' | 'volunteer' | 'lab' | 'side-project' | 'freelance'
  title: string
  description: string
  skillsDemonstrated: string[]
  detailedTechStack: TechStackDetail[]
  architectureOverview: string
  timeCommitment: string
  difficultyLevel: string
  stepByStepGuide: string[]
  howToShowcase: string
  exampleResources: string[]
  githubExampleRepos: string[]
}

// ========== Event Types ==========
export interface Event {
  name: string
  organizer: string
  type: 'conference' | 'meetup' | 'virtual' | 'career-fair' | 'workshop'
  dateOrSeason: string
  location: string
  scope: string
  priceRange: string
  attendeeCount?: string
  beginnerFriendly: boolean
  targetAudience: string
  whyAttend: string
  keyTopics: string[]
  notableSpeakers: string[]
  registrationLink?: string
  recurring: boolean
  virtualOptionAvailable: boolean
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
export interface ResumeBullet {
  bulletText: string
  whyThisWorks: string
  whatToEmphasize: string
  keywordsIncluded: string[]
  structureExplanation: string
}

export interface SkillGrouping {
  category: string
  skills: string[]
  whyGroupThese: string
  priority: string
}

export interface ResumeAssets {
  headline: string
  headlineExplanation: string
  summary: string
  summaryBreakdown: string
  summaryStrategy: string
  skillsGrouped: SkillGrouping[]
  skillsOrderingRationale: string
  targetRoleBullets: ResumeBullet[]
  bulletsOverallStrategy: string
  howToReframeCurrentRole: string
  experienceGapsToAddress: string[]
  keywordsForAts: string[]
  keywordPlacementStrategy: string
  linkedinHeadline: string
  linkedinAboutSection: string
  linkedinStrategy: string
  coverLetterTemplate: string
  coverLetterGuidance: string
}

// ========== Complete Career Plan Type ==========
export interface CareerPlan {
  generatedAt: string
  version: string
  profileSummary: string
  targetRoles: TargetRole[]
  skillsAnalysis: SkillsAnalysis
  skillsGuidance: SkillsGuidance
  certificationPath: Certification[]
  educationOptions: EducationOption[]
  experiencePlan: ExperienceProject[]
  events: Event[]
  timeline: Timeline
  resumeAssets: ResumeAssets
  researchSources: string[]
  certificationJourneySummary?: string
  educationRecommendation?: string
}
