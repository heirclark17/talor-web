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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Step {currentStep} of {steps.length}
        </h3>
        {estimatedTime && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
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
                        ? 'border-green-500 bg-green-500'
                        : isCurrent
                        ? 'border-blue-600 bg-blue-600'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                    }
                  `}
                  title={step.tooltip}
                >
                  {isComplete ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        isCurrent ? 'text-white' : 'text-gray-500 dark:text-gray-400'
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
                        ? 'text-blue-600 dark:text-blue-400'
                        : isComplete
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.tooltip && isCurrent && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[150px]">
                      {step.tooltip}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 px-2">
                  <div
                    className={`h-0.5 ${
                      isComplete ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
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
                      ? 'border-green-500 bg-green-500'
                      : isCurrent
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                  }
                `}
              >
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent ? 'text-white' : 'text-gray-500 dark:text-gray-400'
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
                      ? 'text-blue-600 dark:text-blue-400'
                      : isComplete
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {step.tooltip && isCurrent && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
