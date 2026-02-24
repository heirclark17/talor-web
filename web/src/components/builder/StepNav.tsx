import {
  Layout,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  CheckCircle,
  Check,
} from 'lucide-react'

const STEPS = [
  { icon: Layout, label: 'Template' },
  { icon: User, label: 'Contact' },
  { icon: FileText, label: 'Summary' },
  { icon: Briefcase, label: 'Experience' },
  { icon: GraduationCap, label: 'Education' },
  { icon: Code, label: 'Skills' },
  { icon: CheckCircle, label: 'Review' },
]

interface StepNavProps {
  currentStep: number
  onStepClick: (step: number) => void
  completedSteps: Set<number>
}

export default function StepNav({ currentStep, onStepClick, completedSteps }: StepNavProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon
          const isCompleted = completedSteps.has(index)
          const isActive = index === currentStep
          const canClick = index <= currentStep || isCompleted || completedSteps.has(index - 1)

          return (
            <button
              key={index}
              onClick={() => canClick && onStepClick(index)}
              disabled={!canClick}
              className={`flex flex-col items-center gap-1 flex-1 transition-all ${
                canClick ? 'cursor-pointer' : 'cursor-not-allowed'
              } ${isActive ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-40'}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'border-green-500 bg-green-500/15'
                    : isActive
                      ? 'border-accent'
                      : 'border-theme bg-theme-glass-5'
                }`}
                style={
                  isActive
                    ? {
                        borderColor: 'var(--accent-color)',
                        background:
                          'color-mix(in srgb, var(--accent-color) 15%, transparent)',
                      }
                    : undefined
                }
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <StepIcon
                    className={`w-4 h-4 ${isActive ? 'text-accent' : 'text-theme-tertiary'}`}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-medium hidden sm:block ${
                  isActive ? 'text-accent' : 'text-theme-secondary'
                }`}
              >
                {step.label}
              </span>
            </button>
          )
        })}
      </div>
      <div className="w-full h-1.5 bg-theme-glass-10 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-300 rounded-full"
          style={{
            backgroundColor: 'var(--accent-color)',
            width: `${((currentStep + 1) / STEPS.length) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
