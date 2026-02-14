import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  setClerkUserId,
  getUserId,
  getOldUserId,
  clearUserSession,
  hasExistingSession,
  setAuthToken,
  getAuthToken
} from './userSession'

describe('UserSession Utils', () => {
  beforeEach(() => {
    localStorage.clear()
    setClerkUserId(null)
    setAuthToken(null)
    vi.clearAllMocks()
  })

  describe('setClerkUserId and getUserId', () => {
    it('should prefer Clerk user ID when set', () => {
      setClerkUserId('clerk123')
      expect(getUserId()).toBe('clerk_clerk123')
    })

    it('should prefix Clerk ID with clerk_', () => {
      setClerkUserId('abc123')
      expect(getUserId()).toBe('clerk_abc123')
    })

    it('should clear Clerk ID when set to null', () => {
      setClerkUserId('test')
      setClerkUserId(null)

      const userId = getUserId()
      expect(userId).toMatch(/^user_/)
    })
  })

  describe('getUserId with localStorage', () => {
    it('should generate new user ID if none exists', () => {
      const userId = getUserId()

      expect(userId).toMatch(/^user_[0-9a-f-]+$/)
      expect(localStorage.getItem('talor_user_id')).toBe(userId)
    })

    it('should return existing user ID from localStorage', () => {
      localStorage.setItem('talor_user_id', 'user_test123')

      expect(getUserId()).toBe('user_test123')
    })

    it('should migrate old ID format to new format', () => {
      localStorage.setItem('talor_user_id', 'old_id_without_prefix')

      const userId = getUserId()
      expect(userId).toBe('user_old_id_without_prefix')
      expect(localStorage.getItem('talor_user_id')).toBe('user_old_id_without_prefix')
    })

    it('should not re-migrate already migrated IDs', () => {
      localStorage.setItem('talor_user_id', 'user_already_migrated')

      expect(getUserId()).toBe('user_already_migrated')
    })
  })

  describe('getOldUserId', () => {
    it('should return user ID if it starts with user_', () => {
      localStorage.setItem('talor_user_id', 'user_test123')

      expect(getOldUserId()).toBe('user_test123')
    })

    it('should return null if ID does not start with user_', () => {
      localStorage.setItem('talor_user_id', 'old_format_id')

      expect(getOldUserId()).toBeNull()
    })

    it('should return null if no ID exists', () => {
      expect(getOldUserId()).toBeNull()
    })
  })

  describe('clearUserSession', () => {
    it('should clear localStorage', () => {
      localStorage.setItem('talor_user_id', 'user_test')

      clearUserSession()

      expect(localStorage.getItem('talor_user_id')).toBeNull()
    })

    it('should clear Clerk user ID', () => {
      setClerkUserId('test')
      clearUserSession()

      const userId = getUserId()
      expect(userId).not.toContain('clerk_')
    })
  })

  describe('hasExistingSession', () => {
    it('should return true if user ID exists in localStorage', () => {
      localStorage.setItem('talor_user_id', 'user_test')

      expect(hasExistingSession()).toBe(true)
    })

    it('should return false if no user ID in localStorage', () => {
      expect(hasExistingSession()).toBe(false)
    })
  })

  describe('setAuthToken and getAuthToken', () => {
    it('should store and retrieve auth token', () => {
      setAuthToken('test-token-123')

      expect(getAuthToken()).toBe('test-token-123')
    })

    it('should clear auth token when set to null', () => {
      setAuthToken('test-token')
      setAuthToken(null)

      expect(getAuthToken()).toBeNull()
    })

    it('should return null if no token set', () => {
      expect(getAuthToken()).toBeNull()
    })
  })

  describe('Integration', () => {
    it('should prioritize Clerk ID over localStorage ID', () => {
      localStorage.setItem('talor_user_id', 'user_local123')
      setClerkUserId('clerk456')

      expect(getUserId()).toBe('clerk_clerk456')
    })

    it('should fall back to localStorage after clearing Clerk ID', () => {
      localStorage.setItem('talor_user_id', 'user_local123')
      setClerkUserId('clerk456')
      setClerkUserId(null)

      expect(getUserId()).toBe('user_local123')
    })
  })
})
