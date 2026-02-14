import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollAnimation } from './useScrollAnimation'

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = () => {}
  unobserve = () => {}
  disconnect = () => {}

  constructor(_callback: IntersectionObserverCallback, public options?: IntersectionObserverInit) {}
}

describe('useScrollAnimation', () => {
  let observerOptions: IntersectionObserverInit | undefined

  beforeEach(() => {
    observerOptions = undefined
    global.IntersectionObserver = class {
      observe = () => {}
      unobserve = () => {}
      disconnect = () => {}

      constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        observerOptions = options
      }
    } as any
  })

  it('should return ref and isVisible false initially', () => {
    const { result } = renderHook(() => useScrollAnimation())

    expect(result.current.ref).toHaveProperty('current')
    expect(result.current.isVisible).toBe(false)
  })

  it('should accept threshold parameter', () => {
    renderHook(() => useScrollAnimation(0.5))

    expect(observerOptions).toBeDefined()
    expect(observerOptions?.threshold).toBe(0.5)
  })

  it('should accept rootMargin parameter', () => {
    renderHook(() => useScrollAnimation(0.1, '10px'))

    expect(observerOptions).toBeDefined()
    expect(observerOptions?.rootMargin).toBe('10px')
  })

  it('should use default values when no params provided', () => {
    renderHook(() => useScrollAnimation())

    expect(observerOptions).toBeDefined()
    expect(observerOptions?.threshold).toBe(0.1)
    expect(observerOptions?.rootMargin).toBe('0px')
  })
})
