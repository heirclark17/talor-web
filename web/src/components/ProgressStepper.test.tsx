import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { renderHook, act } from '@testing-library/react'
import ProgressStepper, { useStepNavigation } from './ProgressStepper'

const mockSteps = [
  {
    id: 'step-1',
    label: 'Personal Information',
    description: 'Enter your basic details',
  },
  {
    id: 'step-2',
    label: 'Experience',
    description: 'Add your work history',
  },
  {
    id: 'step-3',
    label: 'Skills',
    description: 'List your competencies',
  },
  {
    id: 'step-4',
    label: 'Review',
    description: 'Confirm your information',
  },
]

describe('ProgressStepper Component', () => {
  describe('Default Variant', () => {
    it('should render all steps', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={0}
        />
      )

      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Skills')).toBeInTheDocument()
      expect(screen.getByText('Review')).toBeInTheDocument()
    })

    it('should render step descriptions', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={0}
        />
      )

      expect(screen.getByText('Enter your basic details')).toBeInTheDocument()
      expect(screen.getByText('Add your work history')).toBeInTheDocument()
    })

    it('should render step numbers', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={0}
        />
      )

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('should highlight current step', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
        />
      )

      const currentStepButton = screen.getAllByRole('button')[1]
      expect(currentStepButton).toHaveClass('bg-blue-500')
      expect(currentStepButton).toHaveClass('ring-4')
    })

    it('should show checkmark for completed steps', () => {
      const { container } = render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={2}
        />
      )

      const checkIcons = container.querySelectorAll('.lucide-check')
      expect(checkIcons.length).toBe(2)
    })

    it('should apply green styling to completed steps', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={2}
        />
      )

      const completedStepButton = screen.getAllByRole('button')[0]
      expect(completedStepButton).toHaveClass('bg-green-500')
    })

    it('should apply gray styling to upcoming steps', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
        />
      )

      const upcomingStepButton = screen.getAllByRole('button')[2]
      expect(upcomingStepButton).toHaveClass('bg-theme-glass-10')
    })
  })

  describe('Compact Variant', () => {
    it('should render compact step indicators', () => {
      const { container } = render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          variant="compact"
        />
      )

      // Compact variant uses w-3 h-3 dots
      const dots = container.querySelectorAll('.w-3')
      expect(dots.length).toBe(4) // One for each step
    })

    it('should not render step labels in compact mode', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          variant="compact"
        />
      )

      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
      expect(screen.queryByText('Experience')).not.toBeInTheDocument()
    })

    it('should not render step descriptions in compact mode', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          variant="compact"
        />
      )

      expect(screen.queryByText('Enter your basic details')).not.toBeInTheDocument()
    })

    it('should highlight current step in compact mode', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          variant="compact"
        />
      )

      const currentStepButton = screen.getAllByRole('button')[1]
      expect(currentStepButton).toHaveClass('bg-blue-500')
      expect(currentStepButton).toHaveClass('ring-2')
    })
  })

  describe('Vertical Variant', () => {
    it('should render vertical layout', () => {
      const { container } = render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          variant="vertical"
        />
      )

      const navDiv = container.querySelector('[role="navigation"]')
      expect(navDiv).toHaveClass('flex-col')
    })

    it('should render step labels in vertical mode', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          variant="vertical"
        />
      )

      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.getByText('Experience')).toBeInTheDocument()
    })

    it('should render connecting lines between steps', () => {
      const { container } = render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          variant="vertical"
        />
      )

      // Vertical variant has connecting lines (w-0.5 is a Tailwind class but invalid CSS selector)
      // Check for h-16 instead which is on the connecting line
      const lines = container.querySelectorAll('.h-16')
      expect(lines.length).toBe(mockSteps.length - 1)
    })
  })

  describe('Step Click Navigation', () => {
    it('should call onStepClick when completed step is clicked', () => {
      const handleStepClick = vi.fn()

      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={2}
          onStepClick={handleStepClick}
          allowStepClick={true}
        />
      )

      const completedStepButton = screen.getAllByRole('button')[0]
      fireEvent.click(completedStepButton)

      expect(handleStepClick).toHaveBeenCalledWith(0)
    })

    it('should not call onStepClick when current step is clicked', () => {
      const handleStepClick = vi.fn()

      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          onStepClick={handleStepClick}
          allowStepClick={true}
        />
      )

      const currentStepButton = screen.getAllByRole('button')[1]
      fireEvent.click(currentStepButton)

      expect(handleStepClick).not.toHaveBeenCalled()
    })

    it('should not call onStepClick when upcoming step is clicked', () => {
      const handleStepClick = vi.fn()

      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          onStepClick={handleStepClick}
          allowStepClick={true}
        />
      )

      const upcomingStepButton = screen.getAllByRole('button')[2]
      fireEvent.click(upcomingStepButton)

      expect(handleStepClick).not.toHaveBeenCalled()
    })

    it('should not call onStepClick when allowStepClick is false', () => {
      const handleStepClick = vi.fn()

      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={2}
          onStepClick={handleStepClick}
          allowStepClick={false}
        />
      )

      const completedStepButton = screen.getAllByRole('button')[0]
      fireEvent.click(completedStepButton)

      expect(handleStepClick).not.toHaveBeenCalled()
    })

    it('should apply cursor-pointer to completed steps when allowStepClick is true', () => {
      const handleStepClick = vi.fn()

      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={2}
          onStepClick={handleStepClick}
          allowStepClick={true}
        />
      )

      const completedStepButton = screen.getAllByRole('button')[0]
      expect(completedStepButton).toHaveClass('cursor-pointer')
    })

    it('should apply cursor-default to upcoming steps', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
          allowStepClick={true}
        />
      )

      const upcomingStepButton = screen.getAllByRole('button')[2]
      expect(upcomingStepButton).toHaveClass('cursor-default')
    })
  })

  describe('Accessibility', () => {
    it('should have role="navigation"', () => {
      const { container } = render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
        />
      )

      const navDiv = container.querySelector('[role="navigation"]')
      expect(navDiv).toBeInTheDocument()
      expect(navDiv).toHaveAttribute('role', 'navigation')
    })

    it('should have aria-label', () => {
      const { container } = render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
        />
      )

      const navDiv = container.querySelector('[role="navigation"]')
      expect(navDiv).toHaveAttribute('aria-label', 'Progress steps')
    })

    it('should have aria-current="step" on current step', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
        />
      )

      const currentStepButton = screen.getAllByRole('button')[1]
      expect(currentStepButton).toHaveAttribute('aria-current', 'step')
    })

    it('should not have aria-current on completed steps', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={2}
        />
      )

      const completedStepButton = screen.getAllByRole('button')[0]
      expect(completedStepButton).not.toHaveAttribute('aria-current')
    })

    it('should not have aria-current on upcoming steps', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={1}
        />
      )

      const upcomingStepButton = screen.getAllByRole('button')[2]
      expect(upcomingStepButton).not.toHaveAttribute('aria-current')
    })
  })

  describe('Edge Cases', () => {
    it('should handle single step', () => {
      const singleStep = [mockSteps[0]]

      render(
        <ProgressStepper
          steps={singleStep}
          currentStep={0}
        />
      )

      expect(screen.getByText('Personal Information')).toBeInTheDocument()
    })

    it('should handle all steps completed', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={4}
        />
      )

      // When currentStep is beyond last step, all are completed
      const allButtons = screen.getAllByRole('button')
      allButtons.forEach(button => {
        expect(button).toHaveClass('bg-green-500')
      })
    })

    it('should handle no steps completed', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={0}
        />
      )

      const currentStepButton = screen.getAllByRole('button')[0]
      expect(currentStepButton).toHaveClass('bg-blue-500')
    })

    it('should handle missing onStepClick callback', () => {
      render(
        <ProgressStepper
          steps={mockSteps}
          currentStep={2}
          allowStepClick={true}
        />
      )

      const completedStepButton = screen.getAllByRole('button')[0]
      expect(() => fireEvent.click(completedStepButton)).not.toThrow()
    })
  })
})

describe('useStepNavigation Hook', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    expect(result.current.currentStep).toBe(0)
    expect(result.current.completedSteps).toEqual(new Set())
    expect(result.current.isFirstStep).toBe(true)
    expect(result.current.isLastStep).toBe(false)
  })

  it('should initialize with custom initial step', () => {
    const { result } = renderHook(() => useStepNavigation(4, 2))

    expect(result.current.currentStep).toBe(2)
  })

  it('should go to specific step', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.goToStep(2)
    })

    expect(result.current.currentStep).toBe(2)
  })

  it('should not go to step beyond total steps', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.goToStep(10)
    })

    expect(result.current.currentStep).toBe(0) // Should remain at initial
  })

  it('should not go to negative step', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.goToStep(-1)
    })

    expect(result.current.currentStep).toBe(0)
  })

  it('should advance to next step', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(1)
  })

  it('should not advance beyond last step', () => {
    const { result } = renderHook(() => useStepNavigation(4, 3))

    act(() => {
      result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(3)
  })

  it('should go to previous step', () => {
    const { result } = renderHook(() => useStepNavigation(4, 2))

    act(() => {
      result.current.prevStep()
    })

    expect(result.current.currentStep).toBe(1)
  })

  it('should not go before first step', () => {
    const { result } = renderHook(() => useStepNavigation(4, 0))

    act(() => {
      result.current.prevStep()
    })

    expect(result.current.currentStep).toBe(0)
  })

  it('should mark step as completed', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.completeStep(0)
    })

    expect(result.current.completedSteps.has(0)).toBe(true)
  })

  it('should mark multiple steps as completed', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.completeStep(0)
      result.current.completeStep(1)
      result.current.completeStep(2)
    })

    expect(result.current.completedSteps).toEqual(new Set([0, 1, 2]))
  })

  it('should not duplicate completed step', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.completeStep(0)
      result.current.completeStep(0)
    })

    expect(result.current.completedSteps).toEqual(new Set([0]))
    expect(result.current.completedSteps.size).toBe(1)
  })

  it('should correctly identify first step', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    expect(result.current.isFirstStep).toBe(true)

    act(() => {
      result.current.nextStep()
    })

    expect(result.current.isFirstStep).toBe(false)
  })

  it('should correctly identify last step', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    expect(result.current.isLastStep).toBe(false)

    act(() => {
      result.current.goToStep(3)
    })

    expect(result.current.isLastStep).toBe(true)
  })

  it('should check if step is completed', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.completeStep(0)
      result.current.completeStep(2)
    })

    expect(result.current.isStepCompleted(0)).toBe(true)
    expect(result.current.isStepCompleted(1)).toBe(false)
    expect(result.current.isStepCompleted(2)).toBe(true)
  })

  it('should handle workflow: complete and advance', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.completeStep(0)
      result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.completedSteps.has(0)).toBe(true)
  })

  it('should automatically mark step as completed when advancing with nextStep', () => {
    const { result } = renderHook(() => useStepNavigation(4))

    act(() => {
      result.current.nextStep()
    })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.completedSteps.has(0)).toBe(true)
  })
})
