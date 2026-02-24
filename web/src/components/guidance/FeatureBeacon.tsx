import React, { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useOnboardingStore } from '../../stores/onboardingStore'

interface FeatureBeaconProps {
  featureId: string
  title: string
  description: string
  screenshot?: string
  buttonText?: string
  buttonHref?: string
}

/**
 * Feature Beacon Component
 *
 * Shows "New" badge with pulsing dot to highlight new features
 * Opens modal with feature explanation and screenshot
 *
 * @example
 * ```tsx
 * <FeatureBeacon
 *   featureId="batch-tailor"
 *   title="Introducing Batch Tailoring"
 *   description="Create tailored resumes for multiple jobs at once, saving hours of work."
 *   screenshot="/screenshots/batch-tailor.png"
 *   buttonText="Try Batch Tailor"
 *   buttonHref="/batch-tailor"
 * />
 * ```
 */
export default function FeatureBeacon({
  featureId,
  title,
  description,
  screenshot,
  buttonText = 'Try it now',
  buttonHref,
}: FeatureBeaconProps) {
  const { dismissedBeacons, dismissBeacon } = useOnboardingStore()
  const [showModal, setShowModal] = useState(false)

  // Don't render if user has dismissed this beacon
  if (dismissedBeacons.includes(featureId)) {
    return null
  }

  const handleDismiss = () => {
    dismissBeacon(featureId)
    setShowModal(false)
  }

  const handleClick = () => {
    setShowModal(true)
  }

  const handleTryNow = () => {
    if (buttonHref) {
      window.location.href = buttonHref
    }
    handleDismiss()
  }

  return (
    <>
      {/* Beacon Badge */}
      <button
        onClick={handleClick}
        className="relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-semibold rounded-full hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30 animate-pulse"
        aria-label={`New feature: ${title}`}
      >
        {/* Pulsing dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span>New</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={handleDismiss}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-2xl w-full overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">{title}</h2>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/20 rounded-full text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                New Feature
              </div>
            </div>

            {/* Screenshot (if provided) */}
            {screenshot && (
              <div className="bg-gray-100 dark:bg-gray-900">
                <img
                  src={screenshot}
                  alt={title}
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {description}
              </p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex items-center gap-3">
              {buttonHref && (
                <button
                  onClick={handleTryNow}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/30"
                >
                  {buttonText}
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
