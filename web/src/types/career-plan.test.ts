import { describe, it, expect } from 'vitest'
import type {
  IntakeForm,
  TargetRole,
  SkillsAnalysis,
  Certification,
  CareerPlan,
  CareerPlanResponse
} from './career-plan'

describe('Career Plan Types', () => {
  it('should allow valid IntakeForm object', () => {
    const intake: IntakeForm = {
      currentRoleTitle: 'Software Engineer',
      currentIndustry: 'Technology',
      yearsExperience: 5,
      educationLevel: 'Bachelor',
      topTasks: ['Coding', 'Design'],
      tools: ['React', 'Node.js'],
      strengths: ['Problem solving'],
      likes: ['Building'],
      dislikes: ['Meetings'],
      targetRoleLevel: 'Senior',
      targetIndustries: ['Tech'],
      specificCompanies: ['Google'],
      timePerWeek: 10,
      timeline: '6 months',
      currentEmploymentStatus: 'Employed',
      location: 'SF',
      willingToRelocate: false,
      inPersonVsRemote: 'Remote',
      learningStyle: ['Self-paced'],
      preferredPlatforms: ['Online'],
      technicalBackground: 'Strong',
      transitionMotivation: ['Growth'],
      specificTechnologiesInterest: ['AI'],
      certificationAreasInterest: ['Cloud']
    }

    expect(intake.currentRoleTitle).toBe('Software Engineer')
  })

  it('should allow valid TargetRole object', () => {
    const role: TargetRole = {
      title: 'Senior Engineer',
      whyAligned: 'Good fit',
      growthOutlook: 'Strong',
      salaryRange: '$150k-$200k',
      typicalRequirements: ['5+ years'],
      bridgeRoles: [],
      sourceCitations: []
    }

    expect(role.title).toBe('Senior Engineer')
  })

  it('should allow valid Certification object', () => {
    const cert: Certification = {
      name: 'AWS Certified',
      certifyingBody: 'AWS',
      level: 'intermediate',
      prerequisites: [],
      estStudyWeeks: 8,
      estCostRange: '$300',
      examDetails: {},
      officialLinks: [],
      whatItUnlocks: 'Cloud jobs',
      alternatives: [],
      studyMaterials: [],
      studyPlanWeeks: [],
      sourceCitations: []
    }

    expect(cert.name).toBe('AWS Certified')
  })

  it('should allow valid CareerPlanResponse object', () => {
    const response: CareerPlanResponse = {
      success: true,
      planId: 1
    }

    expect(response.success).toBe(true)
  })
})
