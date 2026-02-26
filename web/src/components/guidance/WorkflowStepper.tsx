import React from 'react'
import { CheckCircle, Circle, Clock } from 'lucide-react'

interface Step {
  label: string
  status: 'complete' | 'current' | 'upcoming'
  tooltip?: string
}

interface WorkflowStepperProps {
  steps: Step[]
  currentStep: number
  estimatedTime?: string
}

export default function WorkflowStepper({ steps, currentStep, estimatedTime }: WorkflowStepperProps) {
  return (
    <div className="bg-theme-glass-10 border border-theme-muted rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-theme-secondary">
          Step {currentStep} of {steps.length}
        </h3>
        {estimatedTime && (
          <div className="flex items-center text-sm text-theme-tertiary">
            <Clock className="w-4 h-4 mr-1.5" />
            <span>{estimatedTime} remaining</span>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isComplete = step.status === 'complete'
          const isCurrent = step.status === 'current'
          const isLast = index === steps.length - 1

          return (
            <React.Fragment key={index}>
              {/* Step */}
              <div className="flex flex-col items-center flex-1">
                {/* Circle */}
                <div
                  className={`
                    relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${
                      isComplete
                        ? 'border-[#10b981] bg-success'
                        : isCurrent
                        ? 'border-[var(--accent-color)] bg-accent'
                        : 'border-theme-muted bg-theme-glass-5'
                    }
                  `}
                  title={step.tooltip}
                >
                  {isComplete ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent ? 'text-white' : 'text-theme-secondary'
                      }`}
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-accent'
                        : isComplete
                        ? 'text-theme'
                        : 'text-theme-secondary'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.tooltip && isCurrent && (
                    <p className="text-xs text-theme-tertiary mt-1 max-w-[150px]">
                      {step.tooltip}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 px-2 min-w-[16px]">
                  <div
                    className={`h-0.5 ${
                      isComplete ? 'bg-success' : 'bg-theme-glass-20'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isComplete = step.status === 'complete'
          const isCurrent = step.status === 'current'

          return (
            <div key={index} className="flex items-start gap-3">
              {/* Circle */}
              <div
                className={`
                  flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all
                  ${
                    isComplete
                      ? 'border-[#10b981] bg-success'
                      : isCurrent
                      ? 'border-[var(--accent-color)] bg-accent'
                      : 'border-theme-muted bg-theme-glass-5'
                  }
                `}
              >
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-white' : 'text-theme-secondary'
                    }`}
                  >
                    {stepNumber}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-accent'
                      : isComplete
                      ? 'text-theme'
                      : 'text-theme-secondary'
                  }`}
                >
                  {step.label}
                </p>
                {step.tooltip && isCurrent && (
                  <p className="text-xs text-theme-tertiary mt-1">
                    {step.tooltip}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
