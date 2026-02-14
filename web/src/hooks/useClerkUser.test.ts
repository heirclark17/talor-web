import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useClerkUser } from './useClerkUser'

// Mock @clerk/clerk-react
const mockUseUser = vi.fn()
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => mockUseUser()
}))

describe('useClerkUser', () => {
  it('should return default values when no user', () => {
    mockUseUser.mockReturnValue({
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
    mockUseUser.mockReturnValue({
      user: {
        id: 'clerk_abc123',
        fullName: 'Test User',
        primaryEmailAddress: {
          emailAddress: 'test@example.com'
        }
      },
      isLoaded: true,
      isSignedIn: true
    })

    const { result } = renderHook(() => useClerkUser())

    expect(result.current.userId).toBe('clerk_clerk_abc123')
    expect(result.current.clerkId).toBe('clerk_abc123')
    expect(result.current.email).toBe('test@example.com')
    expect(result.current.fullName).toBe('Test User')
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.isSignedIn).toBe(true)
  })

  it('should handle missing email address', () => {
    mockUseUser.mockReturnValue({
      user: {
        id: 'clerk_xyz789',
        fullName: 'No Email User',
        primaryEmailAddress: null
      },
      isLoaded: true,
      isSignedIn: true
    })

    const { result } = renderHook(() => useClerkUser())

    expect(result.current.userId).toBe('clerk_clerk_xyz789')
    expect(result.current.email).toBe('')
  })

  it('should handle loading state', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false
    })

    const { result } = renderHook(() => useClerkUser())

    expect(result.current.isLoaded).toBe(false)
  })
})
