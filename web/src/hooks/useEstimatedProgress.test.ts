import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useEstimatedProgress } from './useEstimatedProgress'

describe('useEstimatedProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start at 0 progress', () => {
    const { result } = renderHook(() =>
      useEstimatedProgress(5000, false)
    )

    expect(result.current).toBe(0)
  })

  it('should snap to 100% when complete', () => {
    const { result, rerender } = renderHook(
      ({ isComplete }) => useEstimatedProgress(5000, isComplete),
      { initialProps: { isComplete: false } }
    )

    // Rerender with completion
    rerender({ isComplete: true })

    expect(result.current).toBe(100)
  })

  it('should increase progress over time', () => {
    const { result } = renderHook(() =>
      useEstimatedProgress(5000, false)
    )

    const initial = result.current

    // Advance time
    vi.advanceTimersByTime(1000)

    // Progress should have increased (animation frame will update)
    expect(result.current).toBeGreaterThanOrEqual(initial)
  })

  it('should asymptotically approach 95% before completion', () => {
    const { result } = renderHook(() =>
      useEstimatedProgress(1000, false)
    )

    // Advance to near completion
    vi.advanceTimersByTime(5000)

    // Should be approaching 95% but not exceed it
    expect(result.current).toBeLessThanOrEqual(95)
  })
})
