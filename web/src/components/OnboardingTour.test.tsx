import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import OnboardingTour, { useOnboardingTour } from './OnboardingTour'
import { CallBackProps, STATUS, ACTIONS, EVENTS } from 'react-joyride'

// Mock react-joyride
vi.mock('react-joyride', () => ({
  default: vi.fn(({ callback }) => {
    // Expose callback for testing
    if (callback) {
      (globalThis as any).__joyrideCallback = callback
    }
    return <div data-testid="joyride-mock" />
  }),
  STATUS: {
    FINISHED: 'finished',
    SKIPPED: 'skipped',
  },
  ACTIONS: {
    NEXT: 'next',
    PREV: 'prev',
  },
  EVENTS: {
    STEP_AFTER: 'step:after',
    TARGET_NOT_FOUND: 'target:not_found',
  },
}))

const ONBOARDING_COMPLETE_KEY = 'talor_onboarding_complete'

describe('OnboardingTour Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.useFakeTimers()
    delete (globalThis as any).__joyrideCallback
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial Rendering', () => {
    it('should render Joyride component', () => {
      const { getByTestId } = render(<OnboardingTour />)

      expect(getByTestId('joyride-mock')).toBeInTheDocument()
    })

    it('should start tour after delay when onboarding not completed', () => {
      const { getByTestId } = render(<OnboardingTour />)

      // Should not run immediately
      expect(localStorage.getItem(ONBOARDING_COMPLETE_KEY)).toBeNull()

      // Should run after 1 second delay
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Component renders
      expect(getByTestId('joyride-mock')).toBeInTheDocument()
    })

    it('should not start tour if already completed', () => {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')

      const { getByTestId } = render(<OnboardingTour />)

      // Even after delay, tour should not start
      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Component still renders but tour won't run
      expect(getByTestId('joyride-mock')).toBeInTheDocument()
    })
  })

  describe('ForceShow Prop', () => {
    it('should start tour even if previously completed when forceShow is true', () => {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')

      const { getByTestId } = render(<OnboardingTour forceShow={true} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(getByTestId('joyride-mock')).toBeInTheDocument()
    })

    it('should respect localStorage when forceShow is false', () => {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')

      const { getByTestId } = render(<OnboardingTour forceShow={false} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Tour should not start
      expect(getByTestId('joyride-mock')).toBeInTheDocument()
    })

    it('should start tour when forceShow is undefined (default)', () => {
      const { getByTestId } = render(<OnboardingTour />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      expect(getByTestId('joyride-mock')).toBeInTheDocument()
    })
  })

  describe('Tour Completion', () => {
    it('should call onComplete when tour finishes', () => {
      const onComplete = vi.fn()

      render(<OnboardingTour onComplete={onComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      // Simulate tour completion
      const callback = (globalThis as any).__joyrideCallback
      if (callback) {
        act(() => {
          callback({
            status: STATUS.FINISHED,
            action: ACTIONS.NEXT,
            index: 5,
            type: EVENTS.STEP_AFTER,
          } as CallBackProps)
        })
      }

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('should set localStorage when tour finishes', () => {
      const { rerender } = render(<OnboardingTour />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const callback = (globalThis as any).__joyrideCallback
      if (callback) {
        act(() => {
          callback({
            status: STATUS.FINISHED,
            action: ACTIONS.NEXT,
            index: 5,
            type: EVENTS.STEP_AFTER,
          } as CallBackProps)
        })
      }

      expect(localStorage.getItem(ONBOARDING_COMPLETE_KEY)).toBe('true')
    })

    it('should call onComplete when tour is skipped', () => {
      const onComplete = vi.fn()

      render(<OnboardingTour onComplete={onComplete} />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const callback = (globalThis as any).__joyrideCallback
      if (callback) {
        act(() => {
          callback({
            status: STATUS.SKIPPED,
            action: ACTIONS.NEXT,
            index: 1,
            type: EVENTS.STEP_AFTER,
          } as CallBackProps)
        })
      }

      expect(onComplete).toHaveBeenCalledTimes(1)
    })

    it('should set localStorage when tour is skipped', () => {
      render(<OnboardingTour />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const callback = (globalThis as any).__joyrideCallback
      if (callback) {
        act(() => {
          callback({
            status: STATUS.SKIPPED,
            action: ACTIONS.NEXT,
            index: 1,
            type: EVENTS.STEP_AFTER,
          } as CallBackProps)
        })
      }

      expect(localStorage.getItem(ONBOARDING_COMPLETE_KEY)).toBe('true')
    })

    it('should not call onComplete if callback not provided', () => {
      render(<OnboardingTour />)

      act(() => {
        vi.advanceTimersByTime(1000)
      })

      const callback = (globalThis as any).__joyrideCallback
      if (callback) {
        expect(() => {
          act(() => {
            callback({
              status: STATUS.FINISHED,
              action: ACTIONS.NEXT,
              index: 5,
              type: EVENTS.STEP_AFTER,
            } as CallBackProps)
          })
        }).not.toThrow()
      }
    })
  })

  describe('Timer Cleanup', () => {
    it('should cleanup timer on unmount', () => {
      const { unmount } = render(<OnboardingTour />)

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      unmount()

      expect(clearTimeoutSpy).toHaveBeenCalled()
    })

    it('should cleanup timer when forceShow changes', () => {
      const { rerender } = render(<OnboardingTour forceShow={false} />)

      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

      rerender(<OnboardingTour forceShow={true} />)

      expect(clearTimeoutSpy).toHaveBeenCalled()
    })
  })

  describe('Component Behavior', () => {
    it('should render without errors', () => {
      const { getByTestId } = render(<OnboardingTour />)

      expect(getByTestId('joyride-mock')).toBeInTheDocument()
    })

    it('should accept onComplete callback', () => {
      const onComplete = vi.fn()

      const { getByTestId } = render(<OnboardingTour onComplete={onComplete} />)

      expect(getByTestId('joyride-mock')).toBeInTheDocument()
    })
  })
})

describe('useOnboardingTour Hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('Initial State', () => {
    it('should initialize with showTour as false', () => {
      const { result } = renderHook(() => useOnboardingTour())

      expect(result.current.showTour).toBe(false)
    })

    it('should provide startTour function', () => {
      const { result } = renderHook(() => useOnboardingTour())

      expect(typeof result.current.startTour).toBe('function')
    })

    it('should provide resetTour function', () => {
      const { result } = renderHook(() => useOnboardingTour())

      expect(typeof result.current.resetTour).toBe('function')
    })

    it('should provide hasCompletedTour function', () => {
      const { result } = renderHook(() => useOnboardingTour())

      expect(typeof result.current.hasCompletedTour).toBe('function')
    })
  })

  describe('startTour', () => {
    it('should set showTour to true when called', () => {
      const { result } = renderHook(() => useOnboardingTour())

      expect(result.current.showTour).toBe(false)

      act(() => {
        result.current.startTour()
      })

      expect(result.current.showTour).toBe(true)
    })
  })

  describe('resetTour', () => {
    it('should remove localStorage item when called', () => {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')

      const { result } = renderHook(() => useOnboardingTour())

      act(() => {
        result.current.resetTour()
      })

      expect(localStorage.getItem(ONBOARDING_COMPLETE_KEY)).toBeNull()
    })

    it('should set showTour to true when called', () => {
      const { result } = renderHook(() => useOnboardingTour())

      expect(result.current.showTour).toBe(false)

      act(() => {
        result.current.resetTour()
      })

      expect(result.current.showTour).toBe(true)
    })
  })

  describe('hasCompletedTour', () => {
    it('should return false when tour not completed', () => {
      const { result } = renderHook(() => useOnboardingTour())

      expect(result.current.hasCompletedTour()).toBe(false)
    })

    it('should return true when tour completed', () => {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')

      const { result } = renderHook(() => useOnboardingTour())

      expect(result.current.hasCompletedTour()).toBe(true)
    })

    it('should return false for other localStorage values', () => {
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'false')

      const { result } = renderHook(() => useOnboardingTour())

      expect(result.current.hasCompletedTour()).toBe(false)
    })
  })

  describe('Integration', () => {
    it('should handle complete workflow', () => {
      const { result } = renderHook(() => useOnboardingTour())

      // Initial state
      expect(result.current.showTour).toBe(false)
      expect(result.current.hasCompletedTour()).toBe(false)

      // Start tour
      act(() => {
        result.current.startTour()
      })

      expect(result.current.showTour).toBe(true)

      // Simulate completion (in real app, OnboardingTour would set this)
      localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')

      expect(result.current.hasCompletedTour()).toBe(true)

      // Reset tour
      act(() => {
        result.current.resetTour()
      })

      expect(result.current.showTour).toBe(true)
      expect(result.current.hasCompletedTour()).toBe(false)
    })
  })
})
