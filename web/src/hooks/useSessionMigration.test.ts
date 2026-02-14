import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSessionMigration } from './useSessionMigration'

// Mock useClerkUser
const mockUseClerkUser = vi.fn()
vi.mock('./useClerkUser', () => ({
  useClerkUser: () => mockUseClerkUser()
}))

// Mock fetch
global.fetch = vi.fn()

describe('useSessionMigration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    ;(global.fetch as any).mockResolvedValue({
      json: async () => ({ success: true })
    })
  })

  it('should not migrate when not loaded', () => {
    mockUseClerkUser.mockReturnValue({
      userId: '',
      isLoaded: false,
      isSignedIn: false
    })

    renderHook(() => useSessionMigration())

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should not migrate when not signed in', () => {
    mockUseClerkUser.mockReturnValue({
      userId: '',
      isLoaded: true,
      isSignedIn: false
    })

    renderHook(() => useSessionMigration())

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should not migrate if no old user ID', () => {
    mockUseClerkUser.mockReturnValue({
      userId: 'clerk_abc123',
      isLoaded: true,
      isSignedIn: true
    })

    renderHook(() => useSessionMigration())

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should not migrate if migration already done', () => {
    localStorage.setItem('talor_migration_done', 'true')
    localStorage.setItem('talor_user_id', 'user_old123')

    mockUseClerkUser.mockReturnValue({
      userId: 'clerk_abc123',
      isLoaded: true,
      isSignedIn: true
    })

    renderHook(() => useSessionMigration())

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('should migrate when conditions are met', () => {
    localStorage.setItem('talor_user_id', 'user_old123')

    mockUseClerkUser.mockReturnValue({
      userId: 'clerk_abc123',
      isLoaded: true,
      isSignedIn: true
    })

    renderHook(() => useSessionMigration())

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/auth/migrate-session'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          old_user_id: 'user_old123',
          new_user_id: 'clerk_abc123'
        })
      })
    )
  })

  it('should not migrate if IDs are the same', () => {
    localStorage.setItem('talor_user_id', 'user_same123')

    mockUseClerkUser.mockReturnValue({
      userId: 'user_same123',
      isLoaded: true,
      isSignedIn: true
    })

    renderHook(() => useSessionMigration())

    expect(global.fetch).not.toHaveBeenCalled()
  })
})
