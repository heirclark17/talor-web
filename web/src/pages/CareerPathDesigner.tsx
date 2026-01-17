import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import type { IntakeForm, CareerPlan as CareerPlanType } from '../types/career-plan'
import { Sparkles, TrendingUp, BookOpen, Award, Briefcase, Calendar, FileText, Download, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react'

export default function CareerPathDesigner() {
  const navigate = useNavigate()
  const [step, setStep] = useState<'intake' | 'generating' | 'results'>('intake')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [plan, setPlan] = useState<CareerPlanType>()
  const [planId, setPlanId] = useState<number>()

  // Intake form state
  const [intake, setIntake] = useState<Partial<IntakeForm>>({
    topTasks: ['', '', ''],
    tools: [],
    strengths: ['', ''],
    likes: [],
    dislikes: [],
    timePerWeek: 10,
    timeline: '6months',
    inPersonVsRemote: 'hybrid'
  })

  const handleGenerate = async () => {
    // Validate required fields
    if (!intake.currentRoleTitle || !intake.currentIndustry || !intake.yearsExperience) {
      setError('Please fill in current role, industry, and years of experience')
      return
    }

    // Validate minimum array items
    const filledTasks = intake.topTasks?.filter(t => t.length > 0) || []
    const filledStrengths = intake.strengths?.filter(s => s.length > 0) || []

    if (filledTasks.length < 3) {
      setError('Please add at least 3 top tasks')
      return
    }

    if (filledStrengths.length < 2) {
      setError('Please add at least 2 strengths')
      return
    }

    setLoading(true)
    setError(undefined)
    setStep('generating')

    try {
      const result = await api.generateCareerPlan({
        current_role_title: intake.currentRoleTitle,
        current_industry: intake.currentIndustry,
        years_experience: intake.yearsExperience,
        top_tasks: filledTasks,
        tools: intake.tools || [],
        strengths: filledStrengths,
        likes: intake.likes || [],
        dislikes: intake.dislikes || [],
        target_role_interest: intake.targetRoleInterest || undefined,
        time_per_week: intake.timePerWeek || 10,
        budget: intake.budget || 'medium',
        timeline: intake.timeline || '6months',
        education_level: intake.educationLevel || 'bachelors',
        location: intake.location || 'Remote',
        in_person_vs_remote: intake.inPersonVsRemote || 'hybrid'
      })

      if (result.success && result.data) {
        setPlan(result.data.plan)
        setPlanId(result.data.plan_id)
        setStep('results')
      } else {
        setError(result.error || 'Failed to generate career plan')
        setStep('intake')
      }
    } catch (err: any) {
      setError(err.message)
      setStep('intake')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-8">
        <div className="glass rounded-lg p-12 max-w-2xl w-full text-center">
          <Loader2 className="w-20 h-20 text-white mx-auto mb-6 animate-spin" />
          <h2 className="text-3xl font-bold text-white mb-4">Designing Your Career Path</h2>
          <p className="text-gray-400 mb-8">
            Our AI is researching certifications, analyzing your skills, and creating a personalized roadmap...
          </p>
          <div className="space-y-3">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-white/50 animate-pulse" style={{ width: '60%' }}></div>
            </div>
            <p className="text-sm text-gray-500">This may take 30-60 seconds</p>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'results' && plan) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="glass rounded-lg p-8 mb-6">
            <h1 className="text-4xl font-bold text-white mb-4">Your Career Transition Plan</h1>
            <p className="text-gray-400 text-lg">{plan.profileSummary}</p>
          </div>

          {/* Target Roles */}
          <div className="glass rounded-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Target Roles</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {plan.targetRoles.map((role, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-gray-400 mb-3 text-sm">{role.whyAligned}</p>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-300">Salary: {role.salaryRange}</p>
                    <p className="text-gray-300">Growth: {role.growthOutlook}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="glass rounded-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Skills Analysis</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Already Have</h3>
                {plan.skillsAnalysis.alreadyHave.slice(0, 5).map((skill, idx) => (
                  <div key={idx} className="mb-2 text-sm text-gray-400">• {skill.skillName}</div>
                ))}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Can Reframe</h3>
                {plan.skillsAnalysis.canReframe.slice(0, 5).map((skill, idx) => (
                  <div key={idx} className="mb-2 text-sm text-gray-400">• {skill.skillName}</div>
                ))}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Need to Build</h3>
                {plan.skillsAnalysis.needToBuild.slice(0, 5).map((skill, idx) => (
                  <div key={idx} className="mb-2 text-sm text-gray-400">
                    • {skill.skillName}
                    <span className="ml-2 text-xs text-gray-500">
                      ({skill.priority})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="glass rounded-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Certification Path</h2>
            </div>
            <div className="space-y-4">
              {plan.certificationPath.map((cert, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{cert.name}</h3>
                      <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">
                        {cert.level}
                      </span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-400">{cert.estStudyWeeks} weeks</div>
                      <div className="text-gray-500">{cert.estCostRange}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{cert.whatItUnlocks}</p>
                  {cert.officialLinks.length > 0 && (
                    <a href={cert.officialLinks[0]} target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:underline">
                      Official Info →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="glass rounded-lg p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">12-Week Plan</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {plan.timeline.twelveWeekPlan.slice(0, 12).map((week, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm font-bold text-white mb-2">Week {week.weekNumber}</div>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {week.tasks.map((task, taskIdx) => (
                      <li key={taskIdx}>• {task}</li>
                    ))}
                  </ul>
                  {week.milestone && (
                    <div className="mt-2 text-xs text-gray-300">{week.milestone}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resume Assets */}
          <div className="glass rounded-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Resume Assets</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Headline</h3>
                <p className="text-gray-400">{plan.resumeAssets.headline}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Summary</h3>
                <p className="text-gray-400 text-sm">{plan.resumeAssets.summary}</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Achievement Bullets</h3>
                <ul className="space-y-2">
                  {plan.resumeAssets.targetRoleBullets.map((bullet, idx) => (
                    <li key={idx} className="text-gray-400 text-sm">• {bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button className="btn-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Plan
            </button>
            <button onClick={() => setStep('intake')} className="btn-secondary">
              Create New Plan
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Intake form
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="glass rounded-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-10 h-10 text-white" />
            <h1 className="text-4xl font-bold text-white">Career Path Designer</h1>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-white font-semibold mb-2 block">Current Role*</label>
                <input
                  type="text"
                  value={intake.currentRoleTitle || ''}
                  onChange={(e) => setIntake({ ...intake, currentRoleTitle: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Project Manager"
                  data-testid="current-role-input"
                />
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">Industry*</label>
                <input
                  type="text"
                  value={intake.currentIndustry || ''}
                  onChange={(e) => setIntake({ ...intake, currentIndustry: e.target.value })}
                  className="input w-full"
                  placeholder="e.g., Healthcare"
                  data-testid="industry-input"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-white font-semibold mb-2 block">Years Experience*</label>
                <input
                  type="number"
                  value={intake.yearsExperience || ''}
                  onChange={(e) => setIntake({ ...intake, yearsExperience: parseFloat(e.target.value) })}
                  className="input w-full"
                  min="0"
                  step="0.5"
                  data-testid="years-experience-input"
                />
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">Target Role (Optional)</label>
                <input
                  type="text"
                  value={intake.targetRoleInterest || ''}
                  onChange={(e) => setIntake({ ...intake, targetRoleInterest: e.target.value })}
                  className="input w-full"
                  placeholder="Leave blank for AI suggestions"
                  data-testid="target-role-input"
                />
              </div>
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block">Top Tasks (at least 3)</label>
              {[0, 1, 2].map(idx => (
                <input
                  key={idx}
                  type="text"
                  value={intake.topTasks?.[idx] || ''}
                  onChange={(e) => {
                    const tasks = [...(intake.topTasks || ['', '', ''])]
                    tasks[idx] = e.target.value
                    setIntake({ ...intake, topTasks: tasks })
                  }}
                  className="input w-full mb-2"
                  placeholder={`Task ${idx + 1}`}
                  data-testid={`task-input-${idx}`}
                />
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-white font-semibold mb-2 block">Hours/Week Available</label>
                <input
                  type="number"
                  value={intake.timePerWeek || 10}
                  onChange={(e) => setIntake({ ...intake, timePerWeek: parseInt(e.target.value) })}
                  className="input w-full"
                  min="1"
                  data-testid="hours-per-week-input"
                />
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">Budget</label>
                <select
                  value={intake.budget || 'medium'}
                  onChange={(e) => setIntake({ ...intake, budget: e.target.value })}
                  className="input w-full"
                  data-testid="budget-select"
                >
                  <option value="low">Low ($0-$1,000)</option>
                  <option value="medium">Medium ($1,000-$5,000)</option>
                  <option value="high">High ($5,000+)</option>
                </select>
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">Timeline</label>
                <select
                  value={intake.timeline || '6months'}
                  onChange={(e) => setIntake({ ...intake, timeline: e.target.value })}
                  className="input w-full"
                  data-testid="timeline-select"
                >
                  <option value="3months">3 Months</option>
                  <option value="6months">6 Months</option>
                  <option value="12months">12 Months</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-white font-semibold mb-2 block">Education Level</label>
                <select
                  value={intake.educationLevel || 'bachelors'}
                  onChange={(e) => setIntake({ ...intake, educationLevel: e.target.value })}
                  className="input w-full"
                  data-testid="education-select"
                >
                  <option value="high school">High School</option>
                  <option value="associates">Associates</option>
                  <option value="bachelors">Bachelors</option>
                  <option value="masters">Masters</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
              <div>
                <label className="text-white font-semibold mb-2 block">Location</label>
                <input
                  type="text"
                  value={intake.location || ''}
                  onChange={(e) => setIntake({ ...intake, location: e.target.value })}
                  className="input w-full"
                  placeholder="City, State or Remote"
                  data-testid="location-input"
                />
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
              data-testid="generate-plan-button"
            >
              <Sparkles className="w-6 h-6" />
              Generate My Career Path
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
