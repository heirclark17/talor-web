import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useClerkUserSync } from './useClerkUserSync'

// Mock @clerk/clerk-react
const mockGetToken = vi.fn()
const mockUseUser = vi.fn()
const mockUseAuth = vi.fn()

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => mockUseUser(),
  useAuth: () => mockUseAuth()
}))

// Mock userSession
const mockSetClerkUserId = vi.fn()
const mockSetAuthToken = vi.fn()

vi.mock('../utils/userSession', () => ({
  setClerkUserId: (id: string | null) => mockSetClerkUserId(id),
  setAuthToken: (token: string | null) => mockSetAuthToken(token)
}))

describe('useClerkUserSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({ getToken: mockGetToken })
    mockGetToken.mockResolvedValue('test-token-123')
  })

  it('should not sync when not loaded', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: false,
      isSignedIn: false
    })

    renderHook(() => useClerkUserSync())

    expect(mockSetClerkUserId).not.toHaveBeenCalled()
    expect(mockSetAuthToken).not.toHaveBeenCalled()
  })

  it('should set user ID when signed in', () => {
    mockUseUser.mockReturnValue({
      user: { id: 'clerk_abc123' },
      isLoaded: true,
      isSignedIn: true
    })

    renderHook(() => useClerkUserSync())

    expect(mockSetClerkUserId).toHaveBeenCalledWith('clerk_abc123')
    expect(mockGetToken).toHaveBeenCalled()
  })

  it('should clear user ID and token when signed out', () => {
    mockUseUser.mockReturnValue({
      user: null,
      isLoaded: true,
      isSignedIn: false
    })

    renderHook(() => useClerkUserSync())

    expect(mockSetClerkUserId).toHaveBeenCalledWith(null)
    expect(mockSetAuthToken).toHaveBeenCalledWith(null)
  })
})
