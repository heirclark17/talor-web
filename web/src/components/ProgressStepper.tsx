import React from 'react'
import { Check } from 'lucide-react'

interface Step {
  id: string | number
  label: string
  description?: string
  icon?: React.ReactNode
}

interface ProgressStepperProps {
  /** Array of step definitions */
  steps: Step[]
  /** Current active step index (0-based) */
  currentStep: number
  /** Callback when a completed step is clicked */
  onStepClick?: (stepIndex: number) => void
  /** Visual style variant */
  variant?: 'default' | 'compact' | 'vertical'
  /** Additional class names */
  className?: string
  /** Whether to allow clicking on completed steps */
  allowStepClick?: boolean
}

/**
 * Progress stepper component for multi-step workflows
 * Shows visual progress through a series of steps
 */
export default function ProgressStepper({
  steps,
  currentStep,
  onStepClick,
  variant = 'default',
  className = '',
  allowStepClick = true,
}: ProgressStepperProps) {
  const handleStepClick = (index: number) => {
    if (allowStepClick && index < currentStep && onStepClick) {
      onStepClick(index)
    }
  }

  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col ${className}`} role="navigation" aria-label="Progress steps">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = allowStepClick && isCompleted && onStepClick

          return (
            <div key={step.id} className="flex">
              {/* Step indicator and line */}
              <div className="flex flex-col items-center mr-4">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-200
                    ${isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                        : 'bg-theme-glass-10 text-theme-tertiary'
                    }
                    ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                  `}
                  aria-label={`Step ${index + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" aria-hidden="true" />
                  ) : (
                    step.icon || index + 1
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-16 my-2 transition-colors duration-200 ${
                      isCompleted ? 'bg-green-500' : 'bg-theme-glass-10'
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Step content */}
              <div className="pb-8 pt-1.5">
                <h4
                  className={`font-semibold ${
                    isCurrent ? 'text-theme' : isCompleted ? 'text-green-400' : 'text-theme-tertiary'
                  }`}
                >
                  {step.label}
                </h4>
                {step.description && (
                  <p className="text-sm text-theme-tertiary mt-1">{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`} role="navigation" aria-label="Progress steps">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => handleStepClick(index)}
                disabled={!(allowStepClick && isCompleted && onStepClick)}
                className={`
                  w-3 h-3 rounded-full transition-all duration-200
                  ${isCompleted
                    ? 'bg-green-500'
                    : isCurrent
                      ? 'bg-blue-500 ring-2 ring-blue-500/50'
                      : 'bg-theme-glass-20'
                  }
                  ${allowStepClick && isCompleted && onStepClick ? 'cursor-pointer hover:scale-125' : 'cursor-default'}
                `}
                aria-label={`Step ${index + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
              />
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  // Default variant
  return (
    <div className={`w-full ${className}`} role="navigation" aria-label="Progress steps">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isClickable = allowStepClick && isCompleted && onStepClick

          return (
            <React.Fragment key={step.id}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                    text-sm sm:text-base font-semibold transition-all duration-200
                    ${isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-blue-500 text-white ring-4 ring-blue-500/30'
                        : 'bg-theme-glass-10 text-theme-tertiary border-2 border-theme-muted'
                    }
                    ${isClickable ? 'cursor-pointer hover:scale-110 hover:shadow-lg' : 'cursor-default'}
                  `}
                  aria-label={`Step ${index + 1}: ${step.label}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
                  ) : (
                    step.icon || index + 1
                  )}
                </button>

                {/* Step label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isCurrent ? 'text-theme' : isCompleted ? 'text-green-400' : 'text-theme-tertiary'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.description && (
                    <p className="text-xs text-theme-tertiary mt-0.5 hidden sm:block max-w-[100px]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 sm:mx-4 rounded-full transition-colors duration-200 ${
                    isCompleted ? 'bg-green-500' : 'bg-theme-glass-10'
                  }`}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Hook for managing step navigation state
 */
export function useStepNavigation(totalSteps: number, initialStep = 0) {
  const [currentStep, setCurrentStep] = React.useState(initialStep)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())

  const goToStep = React.useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step)
      }
    },
    [totalSteps]
  )

  const nextStep = React.useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      setCurrentStep((prev) => prev + 1)
    }
  }, [currentStep, totalSteps])

  const prevStep = React.useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const completeStep = React.useCallback((step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]))
  }, [])

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1
  const isStepCompleted = (step: number) => completedSteps.has(step)

  return {
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    completeStep,
    isFirstStep,
    isLastStep,
    isStepCompleted,
    completedSteps,
  }
}
