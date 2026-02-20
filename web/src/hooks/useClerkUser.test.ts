import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useClerkUser } from './useClerkUser'

// Mock AuthContext
const mockUseAuth = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}))

describe('useClerkUser', () => {
  it('should return default values when no user', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false
    })

    const { result } = renderHook(() => useClerkUser())

    expect(result.current.userId).toBe('')
    expect(result.current.clerkId).toBe('')
    expect(result.current.email).toBe('')
    expect(result.current.fullName).toBe('')
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isSignedIn).toBe(false)
  })

  it('should format user data when user is signed in', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'abc123',
        email: 'test@example.com',
        user_metadata: { full_name: 'Test User' }
      },
      isLoaded: true,
      isSignedIn: true
    })

    const { result } = renderHook(() => useClerkUser())

    expect(result.current.userId).toBe('supa_abc123')
    expect(result.current.clerkId).toBe('abc123')
    expect(result.current.email).toBe('test@example.com')
    expect(result.current.fullName).toBe('Test User')
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isSignedIn).toBe(true)
  })

  it('should handle missing email address', () => {
    mockUseAuth.mockReturnValue({
      user: {
        id: 'xyz789',
        email: undefined,
        user_metadata: { full_name: 'No Email User' }
      },
      isLoaded: true,
      isSignedIn: true
    })

    const { result } = renderHook(() => useClerkUser())

    expect(result.current.userId).toBe('supa_xyz789')
    expect(result.current.email).toBe('')
  })

  it('should handle loading state', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false
    })

    const { result } = renderHook(() => useClerkUser())

    expect(result.current.isLoaded).toBe(false)
  })
})
