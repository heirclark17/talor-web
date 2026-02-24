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
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {isComplete ? '🎉 All Set!' : 'Getting Started'}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isComplete
              ? "You're ready to land your dream job!"
              : `${completedSteps}/${totalSteps} Complete - You're ${Math.round(progress)}% there!`}
          </p>
        </div>
        <button
          onClick={dismissChecklist}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Dismiss checklist"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/50">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {ACTIVATION_STEPS.map((step) => {
          const completed = activationSteps[step.id]
          const Icon = step.icon

          return (
            <Link
              key={step.id}
              to={step.href}
              className="flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group"
            >
              {/* Icon/Status */}
              <div className="flex-shrink-0 mr-4">
                {completed ? (
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30 transition-colors">
                    <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-medium ${completed ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {step.label}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  {step.description}
                </p>
              </div>

              {/* Arrow */}
              {!completed && (
                <div className="flex-shrink-0 ml-4">
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* Complete Message */}
      {isComplete && (
        <div className="px-6 py-4 bg-green-50 dark:bg-green-950/20 border-t border-green-200 dark:border-green-900/30">
          <p className="text-sm text-green-800 dark:text-green-300">
            🎉 You're all set! Time to apply and land your dream job.
          </p>
        </div>
      )}
    </div>
  )
}
