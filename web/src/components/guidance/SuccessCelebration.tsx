import React, { useEffect } from 'react'
import { CheckCircle, X, ArrowRight } from 'lucide-react'
import confetti from 'canvas-confetti'
import { useOnboardingStore } from '../../stores/onboardingStore'

interface SuccessCelebrationProps {
  eventId: string
  title: string
  message: string
  nextStep?: {
    label: string
    href: string
  }
  metric?: string
}

/**
 * Success Celebration Component
 *
 * Shows celebration modal with confetti animation
 * Only displays once per event (tracked in onboardingStore)
 *
 * @example
 * ```tsx
 * <SuccessCelebration
 *   eventId="first_resume_upload"
 *   title="Resume Uploaded Successfully!"
 *   message="Your resume has been analyzed and is ready to be tailored."
 *   nextStep={{
 *     label: "Pick a Template",
 *     href: "/templates"
 *   }}
 *   metric="You're ahead of 80% of job seekers who don't optimize their resumes"
 * />
 * ```
 */
export default function SuccessCelebration({
  eventId,
  title,
  message,
  nextStep,
  metric,
}: SuccessCelebrationProps) {
  const { celebratedEvents, celebrateEvent } = useOnboardingStore()

  // Don't render if user has already seen this celebration
  if (celebratedEvents.includes(eventId)) {
    return null
  }

  useEffect(() => {
    // Trigger confetti animation on mount
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (timeLeft / duration)

      // Fire confetti from different positions
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  const handleClose = () => {
    celebrateEvent(eventId)
  }

  const handleNextStep = () => {
    celebrateEvent(eventId)
    if (nextStep?.href) {
      window.location.href = nextStep.href
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-full">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{message}</p>

          {metric && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900 mb-4">
              <p className="text-sm text-blue-900 dark:text-blue-300 font-medium">{metric}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 space-y-3">
          {nextStep && (
            <button
              onClick={handleNextStep}
              className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/30"
            >
              <span>{nextStep.label}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Continue Exploring
          </button>
        </div>
      </div>
    </div>
  )
}
