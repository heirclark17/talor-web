import React, { useState, useEffect } from 'react'
import Joyride, { CallBackProps, STATUS, Step, ACTIONS, EVENTS } from 'react-joyride'

const ONBOARDING_COMPLETE_KEY = 'talor_onboarding_complete'

interface OnboardingTourProps {
  /** Force show the tour even if previously completed */
  forceShow?: boolean
  /** Callback when tour completes */
  onComplete?: () => void
}

/**
 * Onboarding tour component for first-time users
 * Highlights the main workflow: Upload → Tailor → Interview Prep
 */
export default function OnboardingTour({ forceShow = false, onComplete }: OnboardingTourProps) {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompleted = localStorage.getItem(ONBOARDING_COMPLETE_KEY)
    if (!hasCompleted || forceShow) {
      // Delay tour start to let page render
      const timer = setTimeout(() => {
        setRun(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [forceShow])

  const steps: Step[] = [
    {
      target: 'body',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">Welcome to Talor!</h3>
          <p className="text-sm text-gray-600">
            Let us show you how to create job-winning resumes in minutes.
            This quick tour will guide you through the main features.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '[data-tour="upload"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Step 1: Upload Your Resume</h3>
          <p className="text-sm text-gray-600">
            Start by uploading your existing resume. We support PDF and Word documents.
            Our AI will parse and understand your experience.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="tailor"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Step 2: Tailor Your Resume</h3>
          <p className="text-sm text-gray-600">
            Paste any job URL and our AI will customize your resume to match
            the role perfectly. See a side-by-side comparison of changes.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="interview-prep"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Step 3: Prepare for Interviews</h3>
          <p className="text-sm text-gray-600">
            Get AI-generated interview prep materials including company research,
            practice questions, and STAR stories based on your tailored resume.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '[data-tour="career-path"]',
      content: (
        <div>
          <h3 className="text-lg font-bold mb-2">Bonus: Plan Your Career Path</h3>
          <p className="text-sm text-gray-600">
            Use our Career Path Designer to get personalized recommendations
            for transitioning to your dream role.
          </p>
        </div>
      ),
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: 'body',
      content: (
        <div className="text-center">
          <h3 className="text-lg font-bold mb-2">You're All Set!</h3>
          <p className="text-sm text-gray-600 mb-4">
            Ready to create your first tailored resume?
            Click "Create My Resume" to get started.
          </p>
          <p className="text-xs text-gray-400">
            You can restart this tour anytime from the help menu.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
  ]

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, index, type } = data

    // Handle step navigation
    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1))
    }

    // Handle tour completion or skip
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false)
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
      onComplete?.()
    }
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showSkipButton
      showProgress
      scrollToFirstStep
      disableOverlayClose
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#1f2937',
          backgroundColor: '#1f2937',
          overlayColor: 'rgba(0, 0, 0, 0.75)',
          primaryColor: '#3b82f6',
          textColor: '#f3f4f6',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '20px',
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipTitle: {
          fontSize: '16px',
          fontWeight: 600,
        },
        tooltipContent: {
          fontSize: '14px',
          padding: '10px 0',
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '14px',
          padding: '10px 20px',
        },
        buttonBack: {
          color: '#9ca3af',
          fontSize: '14px',
          marginRight: '10px',
        },
        buttonSkip: {
          color: '#6b7280',
          fontSize: '13px',
        },
        spotlight: {
          borderRadius: '12px',
        },
        beacon: {
          display: 'none',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Get Started',
        next: 'Next',
        skip: 'Skip Tour',
      }}
      floaterProps={{
        disableAnimation: true,
      }}
    />
  )
}

/**
 * Hook to manage onboarding tour state
 */
export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false)

  const startTour = () => {
    setShowTour(true)
  }

  const resetTour = () => {
    localStorage.removeItem(ONBOARDING_COMPLETE_KEY)
    setShowTour(true)
  }

  const hasCompletedTour = () => {
    return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true'
  }

  return {
    showTour,
    startTour,
    resetTour,
    hasCompletedTour,
  }
}
