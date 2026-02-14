import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import AILoadingScreen, { AILoadingStep, ProgressMode } from './AILoadingScreen'

// Mock useEstimatedProgress hook
vi.mock('../hooks/useEstimatedProgress', () => ({
  useEstimatedProgress: vi.fn((duration: number, isComplete: boolean) => {
    return isComplete ? 100 : 50
  }),
}))

const mockSteps: AILoadingStep[] = [
  { id: 'step1', label: 'Analyzing resume', description: 'Processing your resume...' },
  { id: 'step2', label: 'Extracting keywords', description: 'Finding relevant skills...' },
  { id: 'step3', label: 'Generating suggestions', description: 'Creating recommendations...' },
]

describe('AILoadingScreen Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Basic Rendering', () => {
    it('should render loading screen with title', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

      expect(screen.getByText('Processing')).toBeInTheDocument()
    })

    it('should render subtitle when provided', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Processing"
          subtitle="Please wait..."
          steps={mockSteps}
          progress={progress}
        />
      )

      expect(screen.getByText('Please wait...')).toBeInTheDocument()
    })

    it('should render footnote when provided', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Processing"
          footnote="This may take a moment"
          steps={mockSteps}
          progress={progress}
        />
      )

      expect(screen.getByText('This may take a moment')).toBeInTheDocument()
    })

    it('should render all step labels', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

      expect(screen.getByText('Analyzing resume')).toBeInTheDocument()
      expect(screen.getByText('Extracting keywords')).toBeInTheDocument()
      expect(screen.getByText('Generating suggestions')).toBeInTheDocument()
    })

    it('should render active step description', () => {
      const progress: ProgressMode = { type: 'polled', progress: 10 }
      render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

      expect(screen.getByText('Processing your resume...')).toBeInTheDocument()
    })

    it('should render in fullScreen mode by default', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      const { container } = render(
        <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
      )

      const fullScreenContainer = container.querySelector('.min-h-screen')
      expect(fullScreenContainer).toBeInTheDocument()
    })

    it('should render inline when fullScreen is false', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      const { container } = render(
        <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} fullScreen={false} />
      )

      const fullScreenContainer = container.querySelector('.min-h-screen')
      expect(fullScreenContainer).not.toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show spinner icon when loading', () => {
      const progress: ProgressMode = { type: 'polled', progress: 50 }
      const { container } = render(
        <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should show progress bar during loading', () => {
      const progress: ProgressMode = { type: 'polled', progress: 50 }
      const { container } = render(
        <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
      )

      const progressBar = container.querySelector('.bg-gradient-to-r')
      expect(progressBar).toBeInTheDocument()
    })

    it('should update progress bar width based on progress', () => {
      const progress: ProgressMode = { type: 'polled', progress: 75 }
      const { container } = render(
        <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
      )

      const progressBar = container.querySelector('.bg-gradient-to-r') as HTMLElement
      expect(progressBar).toHaveStyle({ width: '75%' })
    })
  })

  describe('Complete State', () => {
    it('should show check icon when complete', () => {
      const progress: ProgressMode = { type: 'polled', progress: 100 }
      const { container } = render(
        <AILoadingScreen title="Complete!" steps={mockSteps} progress={progress} isComplete={true} />
      )

      const checkIcon = container.querySelector('.text-green-400')
      expect(checkIcon).toBeInTheDocument()
    })

    it('should not show spinner when complete', () => {
      const progress: ProgressMode = { type: 'polled', progress: 100 }
      const { container } = render(
        <AILoadingScreen title="Complete!" steps={mockSteps} progress={progress} isComplete={true} />
      )

      const spinner = container.querySelector('.animate-spin')
      expect(spinner).not.toBeInTheDocument()
    })

    it('should show 100% progress when isComplete is true', () => {
      const progress: ProgressMode = { type: 'polled', progress: 50 }
      const { container } = render(
        <AILoadingScreen title="Complete!" steps={mockSteps} progress={progress} isComplete={true} />
      )

      const progressBar = container.querySelector('.bg-gradient-to-r') as HTMLElement
      expect(progressBar).toHaveStyle({ width: '100%' })
    })
  })

  describe('Error State', () => {
    it('should show error message when error prop is provided', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Something went wrong"
        />
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should show alert icon when error occurs', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      const { container } = render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Something went wrong"
        />
      )

      const alertIcon = container.querySelector('.text-red-400')
      expect(alertIcon).toBeInTheDocument()
    })

    it('should render Retry button when onRetry is provided', () => {
      const onRetry = vi.fn()
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Something went wrong"
          onRetry={onRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      expect(retryButton).toBeInTheDocument()
    })

    it('should render Cancel button when onCancel is provided', () => {
      const onCancel = vi.fn()
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Something went wrong"
          onCancel={onCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      expect(cancelButton).toBeInTheDocument()
    })

    it('should call onRetry when Retry button is clicked', () => {
      const onRetry = vi.fn()
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Something went wrong"
          onRetry={onRetry}
        />
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      fireEvent.click(retryButton)

      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when Cancel button is clicked', () => {
      const onCancel = vi.fn()
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Something went wrong"
          onCancel={onCancel}
        />
      )

      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      fireEvent.click(cancelButton)

      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('should hide steps when error is displayed', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Something went wrong"
        />
      )

      expect(screen.queryByText('Analyzing resume')).not.toBeInTheDocument()
    })

    it('should hide progress bar when error is displayed', () => {
      const progress: ProgressMode = { type: 'polled', progress: 50 }
      const { container } = render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Something went wrong"
        />
      )

      const progressBar = container.querySelector('.bg-gradient-to-r')
      expect(progressBar).not.toBeInTheDocument()
    })
  })

  describe('Progress Modes', () => {
    describe('Polled Mode', () => {
      it('should render with polled progress', () => {
        const progress: ProgressMode = { type: 'polled', progress: 33 }
        const { container } = render(
          <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
        )

        const progressBar = container.querySelector('.bg-gradient-to-r') as HTMLElement
        expect(progressBar).toHaveStyle({ width: '33%' })
      })

      it('should mark steps as done based on progress thresholds', () => {
        const progress: ProgressMode = { type: 'polled', progress: 70 }
        const { container } = render(
          <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
        )

        const checkIcons = container.querySelectorAll('.text-green-400')
        expect(checkIcons.length).toBeGreaterThan(0)
      })
    })

    describe('Multi-stage Mode', () => {
      it('should render with multi-stage progress', () => {
        const progress: ProgressMode = { type: 'multi-stage', completedSteps: ['step1'] }
        render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

        expect(screen.getByText('Analyzing resume')).toBeInTheDocument()
      })

      it('should calculate progress based on completed steps', () => {
        const progress: ProgressMode = { type: 'multi-stage', completedSteps: ['step1'] }
        const { container } = render(
          <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
        )

        const progressBar = container.querySelector('.bg-gradient-to-r') as HTMLElement
        const width = progressBar.style.width
        // 1 out of 3 steps = ~33.33%
        expect(parseFloat(width)).toBeCloseTo(33.33, 1)
      })

      it('should mark completed steps with check icon', () => {
        const progress: ProgressMode = { type: 'multi-stage', completedSteps: ['step1', 'step2'] }
        const { container } = render(
          <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
        )

        const checkIcons = container.querySelectorAll('.text-green-400')
        expect(checkIcons.length).toBe(2)
      })

      it('should show spinner on first incomplete step', () => {
        const progress: ProgressMode = { type: 'multi-stage', completedSteps: ['step1'] }
        const { container } = render(
          <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
        )

        const spinners = container.querySelectorAll('.animate-spin')
        // One in header, one on active step
        expect(spinners.length).toBeGreaterThanOrEqual(1)
      })
    })

    describe('Estimated Mode', () => {
      it('should render with estimated progress', () => {
        const progress: ProgressMode = { type: 'estimated', estimatedDurationMs: 30000, isComplete: false }
        render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

        expect(screen.getByText('Processing')).toBeInTheDocument()
      })

      it('should use estimated progress from hook', () => {
        const progress: ProgressMode = { type: 'estimated', estimatedDurationMs: 30000, isComplete: false }
        const { container } = render(
          <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
        )

        const progressBar = container.querySelector('.bg-gradient-to-r') as HTMLElement
        // Mock hook returns 50
        expect(progressBar).toHaveStyle({ width: '50%' })
      })

      it('should show 100% when estimated mode is complete', () => {
        const progress: ProgressMode = { type: 'estimated', estimatedDurationMs: 30000, isComplete: true }
        const { container } = render(
          <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
        )

        const progressBar = container.querySelector('.bg-gradient-to-r') as HTMLElement
        expect(progressBar).toHaveStyle({ width: '100%' })
      })
    })
  })

  describe('ElapsedTimer', () => {
    it('should display elapsed time', () => {
      const progress: ProgressMode = { type: 'polled', progress: 50 }
      render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

      // Initially shows 0:00
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })

    it('should update elapsed time every second', () => {
      const progress: ProgressMode = { type: 'polled', progress: 50 }
      render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

      // Advance timer by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000)
      })

      expect(screen.getByText('0:05')).toBeInTheDocument()
    })

    it('should format minutes correctly', () => {
      const progress: ProgressMode = { type: 'polled', progress: 50 }
      render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

      // Advance timer by 75 seconds (1 minute 15 seconds)
      act(() => {
        vi.advanceTimersByTime(75000)
      })

      expect(screen.getByText('1:15')).toBeInTheDocument()
    })

    it('should show remaining time estimate when estimatedDurationMs is provided', () => {
      const progress: ProgressMode = { type: 'estimated', estimatedDurationMs: 10000, isComplete: false }
      render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

      // Should show remaining time
      expect(screen.getByText(/remaining/i)).toBeInTheDocument()
    })

    it('should show "Almost done..." when time estimate exceeded', () => {
      const progress: ProgressMode = { type: 'estimated', estimatedDurationMs: 5000, isComplete: false }
      render(<AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />)

      // Advance past estimated duration
      act(() => {
        vi.advanceTimersByTime(10000)
      })

      expect(screen.getByText('Almost done...')).toBeInTheDocument()
    })
  })

  describe('Step States', () => {
    it('should show pending steps with small dot', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      const { container } = render(
        <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
      )

      const pendingDots = container.querySelectorAll('.bg-white\\/30')
      expect(pendingDots.length).toBeGreaterThan(0)
    })

    it('should apply tertiary text color to pending steps', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      const { container } = render(
        <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
      )

      const stepLabels = container.querySelectorAll('.text-theme-tertiary')
      expect(stepLabels.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(<AILoadingScreen title="Processing Resume" steps={mockSteps} progress={progress} />)

      const heading = screen.getByRole('heading', { name: /processing resume/i })
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible buttons in error state', () => {
      const onRetry = vi.fn()
      const onCancel = vi.fn()
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Error occurred"
          onRetry={onRetry}
          onCancel={onCancel}
        />
      )

      const retryButton = screen.getByRole('button', { name: /retry/i })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })

      expect(retryButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty steps array', () => {
      const progress: ProgressMode = { type: 'polled', progress: 50 }
      expect(() =>
        render(<AILoadingScreen title="Processing" steps={[]} progress={progress} />)
      ).not.toThrow()
    })

    it('should handle progress over 100%', () => {
      const progress: ProgressMode = { type: 'polled', progress: 150 }
      const { container } = render(
        <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
      )

      const progressBar = container.querySelector('.bg-gradient-to-r') as HTMLElement
      expect(progressBar).toHaveStyle({ width: '100%' })
    })

    it('should handle negative progress', () => {
      const progress: ProgressMode = { type: 'polled', progress: -10 }
      const { container } = render(
        <AILoadingScreen title="Processing" steps={mockSteps} progress={progress} />
      )

      const progressBar = container.querySelector('.bg-gradient-to-r') as HTMLElement
      expect(progressBar).toHaveStyle({ width: '-10%' })
    })

    it('should not render retry button when onRetry is not provided', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Error occurred"
        />
      )

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
    })

    it('should not render cancel button when onCancel is not provided', () => {
      const progress: ProgressMode = { type: 'polled', progress: 0 }
      render(
        <AILoadingScreen
          title="Error"
          steps={mockSteps}
          progress={progress}
          error="Error occurred"
        />
      )

      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
    })
  })
})
