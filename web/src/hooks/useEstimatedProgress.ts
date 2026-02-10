import { useState, useEffect, useRef } from 'react'

/**
 * Smooth time-estimated progress for single-call API operations.
 * Uses requestAnimationFrame for 60fps animation with exponential decay curve.
 * Fast start, asymptotically approaches 95%, snaps to 100% on completion.
 */
export function useEstimatedProgress(
  estimatedDurationMs: number,
  isComplete: boolean
): number {
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (isComplete) {
      setProgress(100)
      cancelAnimationFrame(rafRef.current)
      return
    }

    startTimeRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - (startTimeRef.current || now)
      const ratio = Math.min(elapsed / estimatedDurationMs, 1)
      // Exponential decay: fast start, asymptotes at 95%
      const value = 95 * (1 - Math.exp(-3 * ratio))
      setProgress(Math.round(value * 10) / 10)
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(rafRef.current)
  }, [estimatedDurationMs, isComplete])

  return progress
}
