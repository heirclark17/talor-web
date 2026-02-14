import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useFocusTrap } from './useFocusTrap'

describe('useFocusTrap', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  it('should return a ref object', () => {
    const { result } = renderHook(() => useFocusTrap(false))

    expect(result.current).toHaveProperty('current')
  })

  it('should not trap focus when inactive', () => {
    const { result } = renderHook(() => useFocusTrap(false))

    expect(result.current.current).toBeNull()
  })

  it('should return ref with restoreFocus option', () => {
    const { result } = renderHook(() =>
      useFocusTrap(true, { restoreFocus: true })
    )

    expect(result.current).toHaveProperty('current')
  })

  it('should return ref with initialFocus option', () => {
    const { result } = renderHook(() =>
      useFocusTrap(true, { initialFocus: 'button' })
    )

    expect(result.current).toHaveProperty('current')
  })
})
