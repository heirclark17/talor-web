import React from 'react'
import { Link } from 'react-router-dom'
import { Upload, FileText, Sparkles, Mail, CheckCircle, X, ChevronRight } from 'lucide-react'
import { useOnboardingStore } from '../../stores/onboardingStore'

interface ChecklistStep {
  id: keyof ReturnType<typeof useOnboardingStore>['activationSteps']
  label: string
  description: string
  href: string
  icon: typeof Upload
}

const ACTIVATION_STEPS: ChecklistStep[] = [
  {
    id: 'upload_resume',
    label: 'Upload Your Resume',
    description: 'Start by uploading your existing resume (PDF or Word)',
    href: '/upload',
    icon: Upload,
  },
  {
    id: 'select_template',
    label: 'Pick a Template',
    description: 'Choose a professional, ATS-friendly template',
    href: '/templates',
    icon: FileText,
  },
  {
    id: 'tailor_resume',
    label: 'Tailor Your First Resume',
    description: 'Customize your resume for a specific job posting',
    href: '/tailor',
    icon: Sparkles,
  },
  {
    id: 'generate_cover_letter',
    label: 'Generate Cover Letter',
    description: 'Create a matching cover letter in 60 seconds',
    href: '/cover-letter',
    icon: Mail,
  },
]

export default function ActivationChecklist() {
  const { activationSteps, checklistDismissed, dismissChecklist } = useOnboardingStore()

  // Calculate progress
  const completedSteps = Object.values(activationSteps).filter(Boolean).length
  const totalSteps = Object.keys(activationSteps).length
  const progress = (completedSteps / totalSteps) * 100
  const isComplete = completedSteps === totalSteps

  // Don't show if dismissed
  if (checklistDismissed) {
    return null
  }

  return (
    <div className="glass rounded-xl border border-theme-subtle overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-theme-subtle flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-theme mb-1">
            {isComplete ? 'All Set!' : 'Getting Started'}
          </h3>
          <p className="text-sm text-theme-secondary">
            {isComplete
              ? "You're ready to land your dream job!"
              : `${completedSteps}/${totalSteps} Complete - You're ${Math.round(progress)}% there!`}
          </p>
        </div>
        <button
          onClick={dismissChecklist}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-theme-tertiary hover:text-theme transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-theme-glass-5">
        <div className="w-full bg-theme-glass-20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-theme-subtle">
        {ACTIVATION_STEPS.map((step) => {
          const completed = activationSteps[step.id]
          const Icon = step.icon

          return (
            <Link
              key={step.id}
              to={step.href}
              className="flex items-center px-6 py-4 hover:bg-theme-glass-5 transition-colors group"
            >
              {/* Icon/Status */}
              <div className="flex-shrink-0 mr-4">
                {completed ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-theme-glass-10 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors">
                    <Icon className="w-5 h-5 text-theme-tertiary group-hover:text-blue-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${completed ? 'text-theme' : 'text-theme-secondary'}`}>
                  {step.label}
                </h4>
                <p className="text-xs text-theme-tertiary mt-0.5">
                  {step.description}
                </p>
              </div>

              {/* Arrow */}
              {!completed && (
                <div className="flex-shrink-0 ml-4">
                  <ChevronRight className="w-5 h-5 text-theme-tertiary group-hover:text-blue-400 transition-colors" />
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Complete Message */}
      {isComplete && (
        <div className="px-6 py-4 bg-green-500/10 border-t border-green-500/20">
          <p className="text-sm text-green-400">
            You're all set! Time to apply and land your dream job.
          </p>
        </div>
      )}
    </div>
  )
}
