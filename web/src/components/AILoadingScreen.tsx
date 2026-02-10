import React, { useState, useEffect, useRef } from 'react'
import { Loader2, Check, AlertCircle, X } from 'lucide-react'
import { useEstimatedProgress } from '../hooks/useEstimatedProgress'

export interface AILoadingStep {
  id: string
  label: string
  description?: string
}

export type ProgressMode =
  | { type: 'polled'; progress: number }
  | { type: 'multi-stage'; completedSteps: string[] }
  | { type: 'estimated'; estimatedDurationMs: number; isComplete: boolean }

interface AILoadingScreenProps {
  title: string
  subtitle?: string
  footnote?: string
  steps: AILoadingStep[]
  progress: ProgressMode
  isComplete?: boolean
  error?: string | null
  onRetry?: () => void
  onCancel?: () => void
  fullScreen?: boolean
}

function computeProgress(mode: ProgressMode, estimatedProgress: number, stepCount: number): number {
  switch (mode.type) {
    case 'polled':
      return mode.progress
    case 'multi-stage':
      return stepCount > 0 ? (mode.completedSteps.length / stepCount) * 100 : 0
    case 'estimated':
      return mode.isComplete ? 100 : estimatedProgress
  }
}

function getStepState(
  step: AILoadingStep,
  index: number,
  mode: ProgressMode,
  overallProgress: number,
  stepCount: number
): 'done' | 'active' | 'pending' {
  switch (mode.type) {
    case 'polled': {
      const threshold = ((index + 1) / stepCount) * 100
      const prevThreshold = (index / stepCount) * 100
      if (overallProgress >= threshold) return 'done'
      if (overallProgress >= prevThreshold) return 'active'
      return 'pending'
    }
    case 'multi-stage': {
      if (mode.completedSteps.includes(step.id)) return 'done'
      // First non-completed step is active
      const firstIncomplete = mode.completedSteps.length
      if (index === firstIncomplete) return 'active'
      return 'pending'
    }
    case 'estimated': {
      if (mode.isComplete) return 'done'
      const threshold = ((index + 1) / stepCount) * 100
      const prevThreshold = (index / stepCount) * 100
      if (overallProgress >= threshold) return 'done'
      if (overallProgress >= prevThreshold) return 'active'
      return 'pending'
    }
  }
}

function ElapsedTimer({ estimatedDurationMs }: { estimatedDurationMs?: number }) {
  const [elapsed, setElapsed] = useState(0)
  const startRef = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60

  let remaining = ''
  if (estimatedDurationMs) {
    const estimatedSecs = Math.floor(estimatedDurationMs / 1000)
    const left = Math.max(0, estimatedSecs - elapsed)
    if (left > 0) {
      const rMins = Math.floor(left / 60)
      const rSecs = left % 60
      remaining = rMins > 0 ? `~${rMins}m ${rSecs}s remaining` : `~${rSecs}s remaining`
    } else {
      remaining = 'Almost done...'
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-theme-tertiary text-sm tabular-nums">
        {mins}:{secs.toString().padStart(2, '0')}
      </span>
      {remaining && (
        <span className="text-theme-tertiary text-xs">{remaining}</span>
      )}
    </div>
  )
}

export default function AILoadingScreen({
  title,
  subtitle,
  footnote,
  steps,
  progress: mode,
  isComplete: forceComplete,
  error,
  onRetry,
  onCancel,
  fullScreen = true,
}: AILoadingScreenProps) {
  const estimatedProgress = useEstimatedProgress(
    mode.type === 'estimated' ? mode.estimatedDurationMs : 30000,
    mode.type === 'estimated' ? mode.isComplete : false
  )

  const overallProgress = forceComplete
    ? 100
    : computeProgress(mode, estimatedProgress, steps.length)

  const activeStep = steps.find(
    (s, i) => getStepState(s, i, mode, overallProgress, steps.length) === 'active'
  )

  const content = (
    <div className="max-w-2xl w-full glass rounded-3xl p-10 sm:p-12">
      <div className="text-center">
        {/* Header icon */}
        <div className="w-20 h-20 rounded-full bg-theme-glass-10 flex items-center justify-center mx-auto mb-6">
          {error ? (
            <AlertCircle className="w-10 h-10 text-red-400" />
          ) : forceComplete || overallProgress >= 100 ? (
            <Check className="w-10 h-10 text-green-400" />
          ) : (
            <Loader2 className="w-10 h-10 text-theme animate-spin" />
          )}
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-theme mb-2">{title}</h2>
        {subtitle && <p className="text-theme-secondary mb-1">{subtitle}</p>}
        {activeStep?.description && (
          <p className="text-sm text-theme-tertiary mb-6">{activeStep.description}</p>
        )}
        {!activeStep?.description && <div className="mb-6" />}

        {/* Error state */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-left">
            <p className="text-red-400 text-sm">{error}</p>
            <div className="flex gap-3 mt-3">
              {onRetry && (
                <button onClick={onRetry} className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg text-sm hover:bg-red-500/30 transition-colors">
                  Retry
                </button>
              )}
              {onCancel && (
                <button onClick={onCancel} className="px-4 py-2 bg-theme-glass-10 text-theme-secondary rounded-lg text-sm hover:bg-theme-glass-20 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step checklist */}
        {!error && (
          <div className="space-y-3 mb-8 text-left">
            {steps.map((step, i) => {
              const state = getStepState(step, i, mode, overallProgress, steps.length)
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-theme-glass-10 flex items-center justify-center flex-shrink-0">
                    {state === 'done' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : state === 'active' ? (
                      <Loader2 className="w-4 h-4 text-theme animate-spin" />
                    ) : (
                      <div className="w-2 h-2 bg-white/30 rounded-full" />
                    )}
                  </div>
                  <span className={state === 'pending' ? 'text-theme-tertiary' : 'text-theme'}>
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Progress bar */}
        {!error && (
          <div className="h-2 bg-theme-glass-10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(overallProgress, 100)}%` }}
            />
          </div>
        )}

        {/* Footer: elapsed time + footnote */}
        {!error && (
          <div className="flex items-center justify-between">
            <ElapsedTimer estimatedDurationMs={mode.type === 'estimated' ? mode.estimatedDurationMs : undefined} />
            {footnote && <span className="text-theme-tertiary text-sm">{footnote}</span>}
          </div>
        )}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-theme">
        {content}
      </div>
    )
  }

  return content
}
