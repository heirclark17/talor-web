import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useClerkUserSync } from './useClerkUserSync'

// Mock AuthContext
const mockUseAuth = vi.fn()
vi.mock('../contexts/AuthContext', () => ({
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
  })

  it('should not sync when not loaded', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoaded: false,
      isSignedIn: false
    })

    renderHook(() => useClerkUserSync())

    expect(mockSetClerkUserId).not.toHaveBeenCalled()
    expect(mockSetAuthToken).not.toHaveBeenCalled()
  })

  it('should set user ID and token when signed in', () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'abc123' },
      session: { access_token: 'test-token-123' },
      isLoaded: true,
      isSignedIn: true
    })

    renderHook(() => useClerkUserSync())

    expect(mockSetClerkUserId).toHaveBeenCalledWith('abc123')
    expect(mockSetAuthToken).toHaveBeenCalledWith('test-token-123')
  })

  it('should clear user ID and token when signed out', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      isLoaded: true,
      isSignedIn: false
    })

    renderHook(() => useClerkUserSync())

    expect(mockSetClerkUserId).toHaveBeenCalledWith(null)
    expect(mockSetAuthToken).toHaveBeenCalledWith(null)
  })
})
