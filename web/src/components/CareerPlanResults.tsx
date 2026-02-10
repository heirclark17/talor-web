import React, { useState, useMemo, useEffect } from 'react'
import type { CareerPlan } from '../types/career-plan'
import CareerPathCertifications from './CareerPathCertifications'
import {
  Target, Award, BookOpen, Briefcase, Calendar, FileText,
  ChevronRight, ChevronDown, ExternalLink, Check, Clock,
  DollarSign, MapPin, Users, TrendingUp, Code, Lightbulb,
  Download, Shield, Zap, Book, Video, FileQuestion, Globe,
  Building, Heart, Sparkles, Play, Star, ArrowRight, Info,
  CheckCircle2, Circle, BarChart3, X
} from 'lucide-react'

// Tooltip component for jargon terms
const Tooltip = ({ term, definition, children }: { term: string; definition: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="border-b border-dotted border-blue-400 cursor-help"
      >
        {children}
      </span>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap max-w-xs">
          <span className="font-semibold text-blue-300">{term}:</span> {definition}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
        </span>
      )}
    </span>
  )
}

// Jargon definitions for tooltips
const jargonDefinitions: Record<string, string> = {
  'ATS': 'Applicant Tracking System - software that screens resumes before human review',
  'CAR': 'Challenge-Action-Result - a framework for writing achievement bullets',
  'STAR': 'Situation-Task-Action-Result - interview response framework',
  'Bridge Role': 'An intermediate position that helps you transition to your target role',
  'Soft Skills': 'Interpersonal abilities like communication and leadership',
  'Hard Skills': 'Technical abilities specific to a job or industry',
  'CVSS': 'Common Vulnerability Scoring System - rates security vulnerabilities',
  'NIST': 'National Institute of Standards and Technology - sets security frameworks',
  'DevSecOps': 'Development-Security-Operations - integrating security into development',
}

interface CareerPlanResultsProps {
  plan: CareerPlan
  timeline: string
  onExportPDF?: () => void
}

// Card color mapping for grid cards
const cardColors = {
  roles: { iconBg: 'bg-blue-500/20', iconText: 'text-blue-400', linkText: 'text-blue-400' },
  skills: { iconBg: 'bg-green-500/20', iconText: 'text-green-400', linkText: 'text-green-400' },
  skillsGuidance: { iconBg: 'bg-emerald-500/20', iconText: 'text-emerald-400', linkText: 'text-emerald-400' },
  certs: { iconBg: 'bg-yellow-500/20', iconText: 'text-yellow-400', linkText: 'text-yellow-400' },
  experience: { iconBg: 'bg-purple-500/20', iconText: 'text-purple-400', linkText: 'text-purple-400' },
  events: { iconBg: 'bg-pink-500/20', iconText: 'text-pink-400', linkText: 'text-pink-400' },
  timeline: { iconBg: 'bg-orange-500/20', iconText: 'text-orange-400', linkText: 'text-orange-400' },
  resume: { iconBg: 'bg-cyan-500/20', iconText: 'text-cyan-400', linkText: 'text-cyan-400' },
  education: { iconBg: 'bg-indigo-500/20', iconText: 'text-indigo-400', linkText: 'text-indigo-400' },
  sources: { iconBg: 'bg-gray-500/20', iconText: 'text-gray-400', linkText: 'text-gray-400' },
}

export default function CareerPlanResults({ plan, timeline, onExportPDF }: CareerPlanResultsProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const [expandedCert, setExpandedCert] = useState<number | null>(null)
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const [expandedBullet, setExpandedBullet] = useState<number | null>(null)

  const openModal = (sectionId: string) => {
    setActiveModal(sectionId)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setActiveModal(null)
    document.body.style.overflow = 'auto'
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  // Restore scroll on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = 'auto' }
  }, [])

  // Calculate plan completion stats
  const stats = useMemo(() => {
    const targetRolesCount = plan.targetRoles?.length || 0
    const certsCount = plan.certificationPath?.length || 0
    const projectsCount = plan.experiencePlan?.length || 0
    const eventsCount = plan.events?.length || 0
    const weeksInPlan = plan.timeline?.twelveWeekPlan?.length || 0
    const skillsToLearn = plan.skillsAnalysis?.needToBuild?.length || 0
    const skillsHave = plan.skillsAnalysis?.alreadyHave?.length || 0

    // Calculate estimated salary range from first target role
    const salaryRange = plan.targetRoles?.[0]?.salaryRange || 'Competitive'

    return {
      targetRolesCount,
      certsCount,
      projectsCount,
      eventsCount,
      weeksInPlan,
      skillsToLearn,
      skillsHave,
      salaryRange,
      totalItems: targetRolesCount + certsCount + projectsCount + eventsCount
    }
  }, [plan])

  // Get quick start data
  const quickStart = useMemo(() => {
    const primaryRole = plan.targetRoles?.[0]
    const firstWeekTask = plan.timeline?.twelveWeekPlan?.[0]
    const topCert = plan.certificationPath?.[0]
    const topSkill = plan.skillsAnalysis?.needToBuild?.[0]

    return { primaryRole, firstWeekTask, topCert, topSkill }
  }, [plan])

  const skillsGuidanceCount = (plan.skillsGuidance?.softSkills?.length || 0) + (plan.skillsGuidance?.hardSkills?.length || 0)

  return (
    <div className="space-y-4 break-words">
      {/* ===== QUICK START SECTION ===== */}
      <div className="glass rounded-xl border-2 border-blue-500/30 overflow-hidden bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Quick Start</h2>
            <p className="text-sm text-gray-400">Your 3 most important next steps</p>
          </div>
          <div className="ml-auto px-3 py-1 bg-green-500/20 text-green-300 text-xs font-semibold rounded-full">
            START HERE
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-3 gap-4">
          {/* Card 1: Target Role */}
          {quickStart.primaryRole && (
            <button
              onClick={() => openModal('roles')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all hover:border-blue-500/50 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-semibold text-blue-400 uppercase">Step 1</span>
              </div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-blue-300 transition-colors">
                {quickStart.primaryRole.title}
              </h3>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                {quickStart.primaryRole.whyAligned}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-green-400">{quickStart.primaryRole.salaryRange}</span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
              </div>
            </button>
          )}

          {/* Card 2: First Week Task */}
          {quickStart.firstWeekTask && (
            <button
              onClick={() => openModal('timeline')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all hover:border-orange-500/50 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-xs font-semibold text-orange-400 uppercase">Week 1</span>
              </div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-orange-300 transition-colors">
                {quickStart.firstWeekTask.milestone || 'First Week Goals'}
              </h3>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                {quickStart.firstWeekTask.tasks?.[0] || 'Start your career transition'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-orange-400">{quickStart.firstWeekTask.tasks?.length || 0} tasks</span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-orange-400 transition-colors" />
              </div>
            </button>
          )}

          {/* Card 3: Top Certification */}
          {quickStart.topCert && (
            <button
              onClick={() => openModal('certs')}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 text-left transition-all hover:border-yellow-500/50 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Award className="w-4 h-4 text-yellow-400" />
                </div>
                <span className="text-xs font-semibold text-yellow-400 uppercase">Priority Cert</span>
              </div>
              <h3 className="text-white font-semibold mb-1 group-hover:text-yellow-300 transition-colors line-clamp-1">
                {quickStart.topCert.name}
              </h3>
              <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                {quickStart.topCert.whatItUnlocks || 'Recommended for your target role'}
              </p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  quickStart.topCert.level === 'foundation' ? 'bg-green-500/20 text-green-300' :
                  quickStart.topCert.level === 'intermediate' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {quickStart.topCert.level}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 transition-colors" />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ===== STATS SUMMARY BAR ===== */}
      <div className="glass rounded-lg border border-white/10 p-4">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-white" />
          <h3 className="text-white font-semibold">Your Plan at a Glance</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.targetRolesCount}</div>
            <div className="text-xs text-gray-400">Target Roles</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.certsCount}</div>
            <div className="text-xs text-gray-400">Certifications</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.projectsCount}</div>
            <div className="text-xs text-gray-400">Projects</div>
          </div>
          <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-pink-400">{stats.eventsCount}</div>
            <div className="text-xs text-gray-400">Events</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.skillsHave}</div>
            <div className="text-xs text-gray-400">Skills You Have</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.weeksInPlan}</div>
            <div className="text-xs text-gray-400">Week Plan</div>
          </div>
        </div>
        {/* Salary indicator */}
        <div className="mt-3 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-lg border border-green-500/20">
          <DollarSign className="w-4 h-4 text-green-400" />
          <span className="text-sm text-gray-300">Target Salary Range:</span>
          <span className="text-sm font-semibold text-green-400">{stats.salaryRange}</span>
        </div>
      </div>

      {/* ===== VISUAL TIMELINE PROGRESS ===== */}
      {plan.timeline?.twelveWeekPlan && plan.timeline.twelveWeekPlan.length > 0 && (
        <div className="glass rounded-lg border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              <h3 className="text-white font-semibold">12-Week Journey</h3>
            </div>
            <button
              onClick={() => openModal('timeline')}
              className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              View Full Timeline <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="relative">
            {/* Progress bar background */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500 rounded-full w-0 transition-all duration-1000" style={{ width: '0%' }} />
            </div>
            {/* Week markers */}
            <div className="flex justify-between mt-2">
              {plan.timeline.twelveWeekPlan.slice(0, 6).map((week, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-orange-500 ring-2 ring-orange-500/30' : 'bg-white/20'} mb-1`} />
                  <span className="text-xs text-gray-500">W{week.weekNumber}</span>
                </div>
              ))}
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-green-500/30 mb-1" />
                <span className="text-xs text-green-400">Goal</span>
              </div>
            </div>
          </div>
          {/* Current milestone */}
          <div className="mt-3 flex items-center gap-2 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <Star className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-gray-300">
              <span className="text-orange-400 font-semibold">This week:</span> {plan.timeline.twelveWeekPlan[0]?.milestone || plan.timeline.twelveWeekPlan[0]?.tasks?.[0] || 'Start your journey'}
            </span>
          </div>
        </div>
      )}

      {/* ===== SECTION GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Target Roles Card */}
        {plan.targetRoles && plan.targetRoles.length > 0 && (
          <button
            onClick={() => openModal('roles')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.roles.iconBg}`}>
                <Target className={`w-6 h-6 ${cardColors.roles.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Target Roles</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{plan.targetRoles.length} roles identified</p>
            <div className={`mt-3 ${cardColors.roles.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Skills Analysis Card */}
        {plan.skillsAnalysis && (
          <button
            onClick={() => openModal('skills')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.skills.iconBg}`}>
                <Award className={`w-6 h-6 ${cardColors.skills.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Skills Analysis</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{stats.skillsHave} skills you have, {stats.skillsToLearn} to build</p>
            <div className={`mt-3 ${cardColors.skills.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Skills Guidance Card */}
        {plan.skillsGuidance && (
          <button
            onClick={() => openModal('skillsGuidance')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.skillsGuidance.iconBg}`}>
                <Lightbulb className={`w-6 h-6 ${cardColors.skillsGuidance.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Skills Guidance</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{skillsGuidanceCount} skills with development plans</p>
            <div className={`mt-3 ${cardColors.skillsGuidance.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Certifications Card */}
        {plan.certificationPath && plan.certificationPath.length > 0 && (
          <button
            onClick={() => openModal('certs')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.certs.iconBg}`}>
                <Award className={`w-6 h-6 ${cardColors.certs.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Certifications</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{stats.certsCount} recommended certifications</p>
            <div className={`mt-3 ${cardColors.certs.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Experience Plan Card */}
        {plan.experiencePlan && plan.experiencePlan.length > 0 && (
          <button
            onClick={() => openModal('experience')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.experience.iconBg}`}>
                <Briefcase className={`w-6 h-6 ${cardColors.experience.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Experience Plan</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{stats.projectsCount} hands-on projects</p>
            <div className={`mt-3 ${cardColors.experience.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Networking Events Card */}
        {plan.events && plan.events.length > 0 && (
          <button
            onClick={() => openModal('events')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.events.iconBg}`}>
                <Calendar className={`w-6 h-6 ${cardColors.events.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Networking Events</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{stats.eventsCount} events & conferences</p>
            <div className={`mt-3 ${cardColors.events.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Action Timeline Card */}
        {plan.timeline && (
          <button
            onClick={() => openModal('timeline')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.timeline.iconBg}`}>
                <Calendar className={`w-6 h-6 ${cardColors.timeline.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Action Timeline</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{stats.weeksInPlan}-week plan with milestones</p>
            <div className={`mt-3 ${cardColors.timeline.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Resume & LinkedIn Card */}
        {plan.resumeAssets && (
          <button
            onClick={() => openModal('resume')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.resume.iconBg}`}>
                <FileText className={`w-6 h-6 ${cardColors.resume.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Resume & LinkedIn</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">Headlines, summaries, bullets & ATS keywords</p>
            <div className={`mt-3 ${cardColors.resume.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Education Options Card */}
        {plan.educationOptions && plan.educationOptions.length > 0 && (
          <button
            onClick={() => openModal('education')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.education.iconBg}`}>
                <BookOpen className={`w-6 h-6 ${cardColors.education.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Education Options</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{plan.educationOptions.length} training options</p>
            <div className={`mt-3 ${cardColors.education.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}

        {/* Research Sources Card */}
        {plan.researchSources && plan.researchSources.length > 0 && (
          <button
            onClick={() => openModal('sources')}
            className="glass rounded-2xl p-6 text-left hover:bg-white/10 transition-all hover:scale-[1.02] group cursor-pointer"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${cardColors.sources.iconBg}`}>
                <ExternalLink className={`w-6 h-6 ${cardColors.sources.iconText}`} />
              </div>
              <h3 className="text-lg font-bold text-white">Research Sources</h3>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">{plan.researchSources.length} citations</p>
            <div className={`mt-3 ${cardColors.sources.linkText} text-sm flex items-center gap-1 group-hover:gap-2 transition-all`}>
              View Details <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        )}
      </div>

      {/* Download/Export Actions */}
      <div className="glass rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold mb-1">Export Your Plan</h3>
            <p className="text-sm text-gray-400">Download this career plan for offline access</p>
          </div>
          <button
            onClick={onExportPDF || (() => window.print())}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* ===== MODAL OVERLAY ===== */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Blurred Backdrop */}
          <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-md" />

          {/* Modal Content */}
          <div
            className="relative w-full max-w-4xl max-h-[90vh] h-full sm:h-auto overflow-y-auto bg-black sm:rounded-3xl border-0 sm:border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-black p-4 sm:p-6 border-b border-white/10 flex items-center justify-between z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {activeModal === 'roles' && 'Target Roles'}
                {activeModal === 'skills' && 'Skills Analysis'}
                {activeModal === 'skillsGuidance' && 'Skills Development Guidance'}
                {activeModal === 'certs' && 'Recommended Certifications'}
                {activeModal === 'experience' && 'Experience Building Plan'}
                {activeModal === 'events' && 'Networking Events'}
                {activeModal === 'timeline' && 'Your Action Timeline'}
                {activeModal === 'resume' && 'Resume & LinkedIn Assets'}
                {activeModal === 'education' && 'Education & Training Options'}
                {activeModal === 'sources' && 'Research Sources'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6">

              {/* ===== TARGET ROLES MODAL ===== */}
              {activeModal === 'roles' && plan.targetRoles && (
                <div className="space-y-4">
                  {plan.targetRoles.map((role, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-2">{role.title}</h3>
                      <p className="text-gray-400 mb-4">{role.whyAligned}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Growth Outlook:</span>
                          <p className="text-white mt-1">{role.growthOutlook}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Salary Range:</span>
                          <p className="text-white mt-1">{role.salaryRange}</p>
                        </div>
                      </div>

                      {role.typicalRequirements && role.typicalRequirements.length > 0 && (
                        <div className="mb-4">
                          <span className="text-gray-500 text-sm">Typical Requirements:</span>
                          <ul className="mt-2 space-y-1">
                            {role.typicalRequirements.map((req, reqIdx) => (
                              <li key={reqIdx} className="text-white text-sm flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {role.bridgeRoles && role.bridgeRoles.length > 0 && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            <Tooltip term="Bridge Role" definition={jargonDefinitions['Bridge Role']}>Bridge Roles</Tooltip> (Stepping Stones)
                          </h4>
                          <div className="space-y-3">
                            {role.bridgeRoles.map((bridge, bridgeIdx) => (
                              <div key={bridgeIdx} className="bg-white/5 rounded p-3">
                                <div className="font-semibold text-white mb-1">{bridge.title}</div>
                                <div className="text-sm text-gray-400 mb-2">{bridge.whyGoodFit}</div>
                                <div className="text-xs text-gray-500">Time to qualify: {bridge.timeToQualify}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {role.sourceCitations && role.sourceCitations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <span className="text-xs text-gray-500 font-semibold mb-2 block">Research Sources:</span>
                          <div className="space-y-1">
                            {role.sourceCitations.map((url, urlIdx) => (
                              <a
                                key={urlIdx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-400 hover:text-blue-300 underline flex items-start gap-1 break-all"
                              >
                                <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                <span>{url}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ===== SKILLS ANALYSIS MODAL ===== */}
              {activeModal === 'skills' && plan.skillsAnalysis && (
                <div className="space-y-6">
                  {plan.skillsAnalysis.alreadyHave && plan.skillsAnalysis.alreadyHave.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-400" />
                        Skills You Already Have
                      </h3>
                      <div className="space-y-3">
                        {plan.skillsAnalysis.alreadyHave.map((skill, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="font-semibold text-white mb-2">{skill.skillName}</div>
                            <div className="text-sm text-gray-400 mb-2">
                              <span className="text-gray-500">How you have this:</span> {skill.evidenceFromInput}
                            </div>
                            <div className="text-sm text-gray-300 mb-3">
                              <span className="text-gray-500">Maps to target role:</span> {skill.targetRoleMapping}
                            </div>
                            {skill.resumeBullets && skill.resumeBullets.length > 0 && (
                              <div className="bg-white/5 rounded p-3">
                                <div className="text-xs text-gray-500 mb-2">Resume bullets:</div>
                                {skill.resumeBullets.map((bullet, bIdx) => (
                                  <div key={bIdx} className="text-sm text-gray-300 mb-1">• {bullet}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.skillsAnalysis.canReframe && plan.skillsAnalysis.canReframe.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        Skills You Can Reframe
                      </h3>
                      <div className="space-y-3">
                        {plan.skillsAnalysis.canReframe.map((skill, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="font-semibold text-white mb-2">{skill.skillName}</div>
                            <div className="grid md:grid-cols-2 gap-3 mb-3">
                              <div className="text-sm">
                                <span className="text-gray-500">Current context:</span>
                                <p className="text-gray-400 mt-1">{skill.currentContext}</p>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-500">Target context:</span>
                                <p className="text-gray-300 mt-1">{skill.targetContext}</p>
                              </div>
                            </div>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mb-3">
                              <div className="text-xs text-yellow-300 mb-1">How to reframe:</div>
                              <div className="text-sm text-gray-300">{skill.howToReframe}</div>
                            </div>
                            {skill.resumeBullets && skill.resumeBullets.length > 0 && (
                              <div className="bg-white/5 rounded p-3">
                                <div className="text-xs text-gray-500 mb-2">Reframed resume bullets:</div>
                                {skill.resumeBullets.map((bullet, bIdx) => (
                                  <div key={bIdx} className="text-sm text-gray-300 mb-1">• {bullet}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {plan.skillsAnalysis.needToBuild && plan.skillsAnalysis.needToBuild.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        Skills You Need to Build
                      </h3>
                      <div className="space-y-3">
                        {plan.skillsAnalysis.needToBuild.map((skill, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-start justify-between mb-2">
                              <div className="font-semibold text-white">{skill.skillName}</div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                skill.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                                skill.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {skill.priority.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-400 mb-3">
                              <span className="text-gray-500">Why needed:</span> {skill.whyNeeded}
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mb-2">
                              <div className="text-xs text-blue-300 mb-1">How to build:</div>
                              <div className="text-sm text-gray-300">{skill.howToBuild}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              <Clock className="w-3 h-3 inline mr-1" />
                              Estimated time: {skill.estimatedTime}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== SKILLS GUIDANCE MODAL ===== */}
              {activeModal === 'skillsGuidance' && plan.skillsGuidance && (
                <div className="space-y-6">
                  {/* Overall Strategy */}
                  {plan.skillsGuidance.skillDevelopmentStrategy && (
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 rounded-lg p-6">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        Your Skills Development Strategy
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{plan.skillsGuidance.skillDevelopmentStrategy}</p>
                    </div>
                  )}

                  {/* Soft Skills */}
                  {plan.skillsGuidance.softSkills && plan.skillsGuidance.softSkills.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        Essential <Tooltip term="Soft Skills" definition={jargonDefinitions['Soft Skills']}>Soft Skills</Tooltip> ({plan.skillsGuidance.softSkills.length} skills)
                      </h3>
                      <div className="space-y-4">
                        {plan.skillsGuidance.softSkills.map((skill, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-5 border border-white/10">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-lg font-semibold text-white">{skill.skillName}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-3 py-1 rounded-full ${
                                  skill.importance === 'critical' ? 'bg-red-500/20 text-red-300' :
                                  skill.importance === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                  'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {skill.importance.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {skill.estimatedTime}
                                </span>
                              </div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                              <h5 className="text-blue-300 font-semibold text-sm mb-2">Why This Skill Matters</h5>
                              <p className="text-sm text-gray-300">{skill.whyNeeded}</p>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                              <h5 className="text-green-300 font-semibold text-sm mb-2">How to Develop This Skill</h5>
                              <p className="text-sm text-gray-300">{skill.howToImprove}</p>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                              <h5 className="text-purple-300 font-semibold text-sm mb-2">Real-World Application</h5>
                              <p className="text-sm text-gray-300">{skill.realWorldApplication}</p>
                            </div>
                            {skill.resources && skill.resources.length > 0 && (
                              <div>
                                <h5 className="text-white font-semibold text-sm mb-2">Learning Resources</h5>
                                <div className="space-y-1">
                                  {skill.resources.map((resource, rIdx) => (
                                    <a
                                      key={rIdx}
                                      href={resource}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-start gap-2 text-xs text-blue-400 hover:text-blue-300 underline break-all"
                                    >
                                      <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                      <span>{resource}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hard Skills */}
                  {plan.skillsGuidance.hardSkills && plan.skillsGuidance.hardSkills.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Code className="w-5 h-5 text-green-400" />
                        Essential <Tooltip term="Hard Skills" definition={jargonDefinitions['Hard Skills']}>Hard Skills</Tooltip> ({plan.skillsGuidance.hardSkills.length} skills)
                      </h3>
                      <div className="space-y-4">
                        {plan.skillsGuidance.hardSkills.map((skill, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-5 border border-white/10">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="text-lg font-semibold text-white">{skill.skillName}</h4>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-3 py-1 rounded-full ${
                                  skill.importance === 'critical' ? 'bg-red-500/20 text-red-300' :
                                  skill.importance === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                  'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {skill.importance.toUpperCase()}
                                </span>
                                <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {skill.estimatedTime}
                                </span>
                              </div>
                            </div>
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                              <h5 className="text-blue-300 font-semibold text-sm mb-2">Why This Skill Matters</h5>
                              <p className="text-sm text-gray-300">{skill.whyNeeded}</p>
                            </div>
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                              <h5 className="text-green-300 font-semibold text-sm mb-2">How to Develop This Skill</h5>
                              <p className="text-sm text-gray-300">{skill.howToImprove}</p>
                            </div>
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                              <h5 className="text-purple-300 font-semibold text-sm mb-2">Real-World Application</h5>
                              <p className="text-sm text-gray-300">{skill.realWorldApplication}</p>
                            </div>
                            {skill.resources && skill.resources.length > 0 && (
                              <div>
                                <h5 className="text-white font-semibold text-sm mb-2">Learning Resources</h5>
                                <div className="space-y-1">
                                  {skill.resources.map((resource, rIdx) => (
                                    <a
                                      key={rIdx}
                                      href={resource}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-start gap-2 text-xs text-blue-400 hover:text-blue-300 underline break-all"
                                    >
                                      <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                      <span>{resource}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== CERTIFICATIONS MODAL ===== */}
              {activeModal === 'certs' && plan.certificationPath && (
                <div>
                  <CareerPathCertifications certifications={plan.certificationPath} />
                </div>
              )}

              {/* ===== EXPERIENCE PLAN MODAL ===== */}
              {activeModal === 'experience' && plan.experiencePlan && (
                <div className="space-y-4">
                  {plan.experiencePlan.map((project, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                      {/* Project Header */}
                      <button
                        onClick={() => setExpandedProject(expandedProject === idx ? null : idx)}
                        className="w-full p-6 flex items-start justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{project.type}</span>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{project.difficultyLevel}</span>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                          <div className="text-sm text-gray-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {project.timeCommitment}
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ml-4 flex-shrink-0 mt-1 ${expandedProject === idx ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Project Details */}
                      {expandedProject === idx && (
                        <div className="px-6 pb-6 space-y-6 border-t border-white/10">
                          {/* Skills Demonstrated */}
                          {project.skillsDemonstrated && project.skillsDemonstrated.length > 0 && (
                            <div>
                              <h4 className="text-white font-semibold mb-3">Skills Demonstrated</h4>
                              <div className="flex flex-wrap gap-2">
                                {project.skillsDemonstrated.map((skill, sIdx) => (
                                  <span key={sIdx} className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Detailed Tech Stack */}
                          {project.detailedTechStack && project.detailedTechStack.length > 0 && (
                            <div>
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Code className="w-4 h-4" />
                                Detailed Tech Stack ({project.detailedTechStack.length} technologies)
                              </h4>
                              <div className="space-y-3">
                                {project.detailedTechStack.map((tech, tIdx) => (
                                  <div key={tIdx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h5 className="text-white font-semibold">{tech.name}</h5>
                                        <div className="text-xs text-gray-400 uppercase">{tech.category}</div>
                                      </div>
                                    </div>
                                    <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mb-3">
                                      <div className="text-xs text-blue-300 mb-1">Why this technology:</div>
                                      <div className="text-sm text-gray-300">{tech.whyThisTech}</div>
                                    </div>
                                    {tech.learningResources && tech.learningResources.length > 0 && (
                                      <div>
                                        <div className="text-xs text-gray-500 mb-2">Learning resources:</div>
                                        <div className="space-y-1">
                                          {tech.learningResources.map((url, uIdx) => (
                                            <a
                                              key={uIdx}
                                              href={url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-xs text-white/60 hover:text-white underline flex items-center gap-1"
                                            >
                                              <ExternalLink className="w-3 h-3" />
                                              Resource {uIdx + 1}
                                            </a>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Architecture Overview */}
                          {project.architectureOverview && (
                            <div className="bg-white/5 rounded-lg p-4">
                              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Architecture Overview
                              </h4>
                              <p className="text-sm text-gray-300">{project.architectureOverview}</p>
                            </div>
                          )}

                          {/* Step-by-Step Guide */}
                          {project.stepByStepGuide && project.stepByStepGuide.length > 0 && (
                            <div>
                              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" />
                                Step-by-Step Implementation Guide
                              </h4>
                              <div className="space-y-2">
                                {project.stepByStepGuide.map((step, sIdx) => (
                                  <div key={sIdx} className="flex items-start gap-3 bg-white/5 rounded p-3">
                                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                      <span className="text-white text-xs font-semibold">{sIdx + 1}</span>
                                    </div>
                                    <div className="text-sm text-gray-300">{step}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* How to Showcase */}
                          {project.howToShowcase && (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                              <h4 className="text-green-300 font-semibold mb-2">How to Showcase on Resume/LinkedIn</h4>
                              <p className="text-sm text-gray-300">{project.howToShowcase}</p>
                            </div>
                          )}

                          {/* GitHub Examples */}
                          {project.githubExampleRepos && project.githubExampleRepos.length > 0 && (
                            <div>
                              <h5 className="text-white font-semibold text-sm mb-2">Similar Projects on GitHub</h5>
                              <div className="flex flex-wrap gap-2">
                                {project.githubExampleRepos.map((repo, rIdx) => (
                                  <a
                                    key={rIdx}
                                    href={repo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white underline"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    Example {rIdx + 1}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ===== NETWORKING EVENTS MODAL ===== */}
              {activeModal === 'events' && plan.events && (
                <div className="space-y-4">
                  {plan.events.map((event, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                      {/* Event Header */}
                      <button
                        onClick={() => setExpandedEvent(expandedEvent === idx ? null : idx)}
                        className="w-full p-6 flex items-start justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{event.type}</span>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{event.scope}</span>
                            {event.beginnerFriendly && (
                              <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                                Beginner Friendly
                              </span>
                            )}
                            {event.virtualOptionAvailable && (
                              <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                Virtual Option
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              <span>{event.organizer}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{event.dateOrSeason}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                            {event.attendeeCount && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{event.attendeeCount}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              <span>{event.priceRange}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ml-4 flex-shrink-0 mt-1 ${expandedEvent === idx ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Event Details */}
                      {expandedEvent === idx && (
                        <div className="px-6 pb-6 space-y-4 border-t border-white/10">
                          {/* Target Audience */}
                          {event.targetAudience && (
                            <div className="bg-white/5 rounded-lg p-3">
                              <div className="text-xs text-gray-500 mb-1">Target Audience:</div>
                              <div className="text-sm text-white">{event.targetAudience}</div>
                            </div>
                          )}

                          {/* Why Attend */}
                          {event.whyAttend && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                              <h4 className="text-blue-300 font-semibold mb-2">Why Attend This Event</h4>
                              <p className="text-sm text-gray-300">{event.whyAttend}</p>
                            </div>
                          )}

                          {/* Key Topics */}
                          {event.keyTopics && event.keyTopics.length > 0 && (
                            <div>
                              <h4 className="text-white font-semibold text-sm mb-2">Key Topics Covered</h4>
                              <div className="flex flex-wrap gap-2">
                                {event.keyTopics.map((topic, tIdx) => (
                                  <span key={tIdx} className="bg-white/10 px-3 py-1 rounded-full text-xs text-white">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notable Speakers */}
                          {event.notableSpeakers && event.notableSpeakers.length > 0 && (
                            <div>
                              <h4 className="text-white font-semibold text-sm mb-2">Notable Speakers/Companies</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {event.notableSpeakers.map((speaker, sIdx) => (
                                  <div key={sIdx} className="text-sm text-gray-300 flex items-center gap-2">
                                    <Check className="w-3 h-3 text-green-400" />
                                    {speaker}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Registration Link */}
                          {event.registrationLink && (
                            <a
                              href={event.registrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Register for Event
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ===== TIMELINE MODAL ===== */}
              {activeModal === 'timeline' && plan.timeline && (
                <div className="space-y-6">
                  {/* 12-Week Plan */}
                  {plan.timeline.twelveWeekPlan && plan.timeline.twelveWeekPlan.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-4">12-Week Tactical Plan</h3>
                      <div className="space-y-3">
                        {plan.timeline.twelveWeekPlan.map((week, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {week.weekNumber}
                              </div>
                              <div className="text-white font-semibold">{week.milestone || `Week ${week.weekNumber}`}</div>
                            </div>
                            {week.tasks && week.tasks.length > 0 && (
                              <ul className="space-y-1 ml-11">
                                {week.tasks.map((task, taskIdx) => (
                                  <li key={taskIdx} className="text-gray-300 text-sm flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {week.checkpoint && (
                              <div className="ml-11 mt-3 text-xs bg-green-500/20 text-green-300 px-3 py-2 rounded-lg inline-block">
                                Checkpoint: {week.checkpoint}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 6-Month Plan */}
                  {plan.timeline.sixMonthPlan && plan.timeline.sixMonthPlan.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-4">6-Month Strategic Phases</h3>
                      <div className="space-y-3">
                        {plan.timeline.sixMonthPlan.map((month, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-semibold">
                                M{month.monthNumber}
                              </div>
                              <div>
                                <div className="text-white font-semibold">{month.phaseName}</div>
                                <div className="text-xs text-gray-400">Month {month.monthNumber}</div>
                              </div>
                            </div>
                            <div className="space-y-3 ml-13">
                              {month.goals && month.goals.length > 0 && (
                                <div>
                                  <div className="text-sm text-gray-500 mb-1">Goals:</div>
                                  <ul className="space-y-1">
                                    {month.goals.map((goal, gIdx) => (
                                      <li key={gIdx} className="text-gray-300 text-sm flex items-start gap-2">
                                        <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                        {goal}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {month.deliverables && month.deliverables.length > 0 && (
                                <div>
                                  <div className="text-sm text-gray-500 mb-1">Deliverables:</div>
                                  <ul className="space-y-1">
                                    {month.deliverables.map((deliverable, dIdx) => (
                                      <li key={dIdx} className="text-gray-300 text-sm flex items-start gap-2">
                                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                        {deliverable}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Apply-Ready Checkpoint */}
                  {plan.timeline.applyReadyCheckpoint && (
                    <div className="bg-green-500/20 border-2 border-green-500/50 rounded-lg p-6 text-center">
                      <h3 className="text-green-300 font-semibold text-lg mb-2">Apply-Ready Checkpoint</h3>
                      <p className="text-white">{plan.timeline.applyReadyCheckpoint}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== RESUME & LINKEDIN MODAL ===== */}
              {activeModal === 'resume' && plan.resumeAssets && (
                <div className="space-y-6">
                  {/* Headline with Explanation */}
                  {plan.resumeAssets.headline && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-3">Professional Headline</h3>
                      <div className="bg-white/10 rounded-lg p-4 mb-4">
                        <p className="text-white text-lg font-semibold">{plan.resumeAssets.headline}</p>
                      </div>
                      {plan.resumeAssets.headlineExplanation && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <h4 className="text-blue-300 font-semibold text-sm mb-2">Why This Headline Works</h4>
                          <p className="text-sm text-gray-300">{plan.resumeAssets.headlineExplanation}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Summary with Breakdown */}
                  {plan.resumeAssets.summary && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-3">Professional Summary</h3>
                      <div className="bg-white/10 rounded-lg p-4 mb-4">
                        <p className="text-white leading-relaxed">{plan.resumeAssets.summary}</p>
                      </div>

                      {plan.resumeAssets.summaryBreakdown && (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-3">
                          <h4 className="text-purple-300 font-semibold text-sm mb-2">Sentence-by-Sentence Breakdown</h4>
                          <p className="text-sm text-gray-300 whitespace-pre-line">{plan.resumeAssets.summaryBreakdown}</p>
                        </div>
                      )}

                      {plan.resumeAssets.summaryStrategy && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <h4 className="text-blue-300 font-semibold text-sm mb-2">Overall Strategy</h4>
                          <p className="text-sm text-gray-300">{plan.resumeAssets.summaryStrategy}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills Grouped */}
                  {plan.resumeAssets.skillsGrouped && plan.resumeAssets.skillsGrouped.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-3">Skills Section (Organized by Category)</h3>
                      <div className="space-y-4">
                        {plan.resumeAssets.skillsGrouped.map((group, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-white font-semibold">{group.category}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${
                                group.priority === 'core' ? 'bg-red-500/20 text-red-300' :
                                group.priority === 'important' ? 'bg-orange-500/20 text-orange-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {group.priority.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {group.skills.map((skill, sIdx) => (
                                <span key={sIdx} className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                                  {skill}
                                </span>
                              ))}
                            </div>
                            <div className="text-xs text-gray-400 bg-white/5 rounded p-2">
                              <strong>Why grouped:</strong> {group.whyGroupThese}
                            </div>
                          </div>
                        ))}
                      </div>

                      {plan.resumeAssets.skillsOrderingRationale && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                          <h4 className="text-blue-300 font-semibold text-sm mb-2">Ordering Strategy</h4>
                          <p className="text-sm text-gray-300">{plan.resumeAssets.skillsOrderingRationale}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Target Role Bullets */}
                  {plan.resumeAssets.targetRoleBullets && plan.resumeAssets.targetRoleBullets.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-3">Achievement Bullets for Resume</h3>
                      <div className="space-y-3">
                        {plan.resumeAssets.targetRoleBullets.map((bullet, idx) => (
                          <div key={idx} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                            {/* Bullet Header */}
                            <button
                              onClick={() => setExpandedBullet(expandedBullet === idx ? null : idx)}
                              className="w-full p-4 hover:bg-white/5 transition-colors text-left"
                            >
                              <div className="flex items-start justify-between">
                                <p className="text-gray-300 text-sm flex-1 pr-4">{bullet.bulletText}</p>
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedBullet === idx ? 'rotate-180' : ''}`} />
                              </div>
                            </button>

                            {/* Bullet Details */}
                            {expandedBullet === idx && (
                              <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                                {bullet.whyThisWorks && (
                                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                    <h5 className="text-green-300 font-semibold text-sm mb-1">Why This Works</h5>
                                    <p className="text-xs text-gray-300">{bullet.whyThisWorks}</p>
                                  </div>
                                )}
                                {bullet.whatToEmphasize && (
                                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                    <h5 className="text-purple-300 font-semibold text-sm mb-1">Interview Talking Points</h5>
                                    <p className="text-xs text-gray-300">{bullet.whatToEmphasize}</p>
                                  </div>
                                )}
                                {bullet.keywordsIncluded && bullet.keywordsIncluded.length > 0 && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-2">ATS Keywords Included:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {bullet.keywordsIncluded.map((keyword, kIdx) => (
                                        <span key={kIdx} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                          {keyword}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {bullet.structureExplanation && (
                                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                    <h5 className="text-blue-300 font-semibold text-sm mb-1"><Tooltip term="CAR" definition={jargonDefinitions['CAR']}>CAR</Tooltip>/<Tooltip term="STAR" definition={jargonDefinitions['STAR']}>STAR</Tooltip> Structure</h5>
                                    <p className="text-xs text-gray-300">{bullet.structureExplanation}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {plan.resumeAssets.bulletsOverallStrategy && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                          <h4 className="text-yellow-300 font-semibold text-sm mb-2">How These Bullets Position You</h4>
                          <p className="text-sm text-gray-300">{plan.resumeAssets.bulletsOverallStrategy}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Experience Reframing Guide */}
                  {plan.resumeAssets.howToReframeCurrentRole && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-3">How to Reframe Your Current Experience</h3>
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-300 whitespace-pre-line">{plan.resumeAssets.howToReframeCurrentRole}</p>
                      </div>

                      {plan.resumeAssets.experienceGapsToAddress && plan.resumeAssets.experienceGapsToAddress.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold text-sm mb-2">Addressing Experience Gaps</h4>
                          <ul className="space-y-1">
                            {plan.resumeAssets.experienceGapsToAddress.map((gap, idx) => (
                              <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Keywords & ATS */}
                  {plan.resumeAssets.keywordsForAts && plan.resumeAssets.keywordsForAts.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-3">Keywords for <Tooltip term="ATS" definition={jargonDefinitions['ATS']}>ATS</Tooltip> (Applicant Tracking Systems)</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {plan.resumeAssets.keywordsForAts.map((keyword, idx) => (
                          <span key={idx} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-mono">
                            {keyword}
                          </span>
                        ))}
                      </div>

                      {plan.resumeAssets.keywordPlacementStrategy && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <h4 className="text-green-300 font-semibold text-sm mb-2">Keyword Placement Strategy</h4>
                          <p className="text-sm text-gray-300">{plan.resumeAssets.keywordPlacementStrategy}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* LinkedIn Guidance */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      LinkedIn Optimization
                    </h3>

                    {plan.resumeAssets.linkedinHeadline && (
                      <div className="mb-4">
                        <h4 className="text-white font-semibold text-sm mb-2">LinkedIn Headline</h4>
                        <div className="bg-white/10 rounded-lg p-3">
                          <p className="text-white">{plan.resumeAssets.linkedinHeadline}</p>
                        </div>
                      </div>
                    )}

                    {plan.resumeAssets.linkedinAboutSection && (
                      <div className="mb-4">
                        <h4 className="text-white font-semibold text-sm mb-2">LinkedIn About Section</h4>
                        <div className="bg-white/10 rounded-lg p-3 max-h-60 overflow-y-auto">
                          <p className="text-gray-300 text-sm whitespace-pre-line">{plan.resumeAssets.linkedinAboutSection}</p>
                        </div>
                      </div>
                    )}

                    {plan.resumeAssets.linkedinStrategy && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="text-blue-300 font-semibold text-sm mb-2">LinkedIn Optimization Strategy</h4>
                        <p className="text-sm text-gray-300">{plan.resumeAssets.linkedinStrategy}</p>
                      </div>
                    )}
                  </div>

                  {/* Cover Letter Template */}
                  {plan.resumeAssets.coverLetterTemplate && (
                    <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <h3 className="text-white font-semibold mb-3">Cover Letter Framework</h3>
                      <div className="bg-white/10 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto">
                        <p className="text-gray-300 text-sm whitespace-pre-line">{plan.resumeAssets.coverLetterTemplate}</p>
                      </div>

                      {plan.resumeAssets.coverLetterGuidance && (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                          <h4 className="text-purple-300 font-semibold text-sm mb-2">How to Adapt This Template</h4>
                          <p className="text-sm text-gray-300">{plan.resumeAssets.coverLetterGuidance}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ===== EDUCATION OPTIONS MODAL ===== */}
              {activeModal === 'education' && plan.educationOptions && (
                <div className="space-y-4">
                  {plan.educationOptions.map((option, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-white">{option.name}</h3>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{option.type}</span>
                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{option.format}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {option.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {option.costRange}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {option.pros && option.pros.length > 0 && (
                          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                            <h4 className="text-green-300 font-semibold text-sm mb-2">Pros</h4>
                            <ul className="space-y-1">
                              {option.pros.map((pro, pIdx) => (
                                <li key={pIdx} className="text-sm text-gray-300 flex items-start gap-2">
                                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {option.cons && option.cons.length > 0 && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                            <h4 className="text-red-300 font-semibold text-sm mb-2">Cons</h4>
                            <ul className="space-y-1">
                              {option.cons.map((con, cIdx) => (
                                <li key={cIdx} className="text-sm text-gray-300 flex items-start gap-2">
                                  <span className="text-red-400 flex-shrink-0">x</span>
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {option.officialLink && (
                        <a
                          href={option.officialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Program Details
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ===== RESEARCH SOURCES MODAL ===== */}
              {activeModal === 'sources' && plan.researchSources && (
                <div>
                  <div className="grid md:grid-cols-2 gap-2">
                    {plan.researchSources.map((source, idx) => (
                      <a
                        key={idx}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/60 hover:text-white underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{source}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
