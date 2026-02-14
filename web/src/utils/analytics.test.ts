import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initAnalytics, identifyUser, trackEvent, resetAnalytics } from './analytics'

// Mock posthog-js
const mockPostHog = {
  init: vi.fn(),
  identify: vi.fn(),
  capture: vi.fn(),
  reset: vi.fn()
}

vi.mock('posthog-js', () => ({
  default: mockPostHog
}))

describe('Analytics Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset import.meta.env mock
    vi.stubEnv('VITE_POSTHOG_KEY', 'test-key-123')
  })

  describe('initAnalytics', () => {
    it('should initialize PostHog with API key', async () => {
      await initAnalytics()

      expect(mockPostHog.init).toHaveBeenCalledWith('test-key-123', {
        api_host: 'https://us.i.posthog.com',
        autocapture: false,
        capture_pageview: true
      })
    })

    it('should not initialize if no API key', async () => {
      vi.stubEnv('VITE_POSTHOG_KEY', '')

      await initAnalytics()

      expect(mockPostHog.init).not.toHaveBeenCalled()
    })

    it('should handle PostHog import failure gracefully', async () => {
      vi.doMock('posthog-js', () => {
        throw new Error('Module not found')
      })

      await expect(initAnalytics()).resolves.not.toThrow()
    })
  })

  describe('identifyUser', () => {
    it('should call posthog identify with user ID', () => {
      identifyUser('user-123')

      expect(mockPostHog.identify).toHaveBeenCalledWith('user-123', undefined)
    })

    it('should call posthog identify with properties', () => {
      identifyUser('user-123', { email: 'test@example.com', plan: 'pro' })

      expect(mockPostHog.identify).toHaveBeenCalledWith('user-123', {
        email: 'test@example.com',
        plan: 'pro'
      })
    })

    it('should not throw if posthog not initialized', () => {
      expect(() => identifyUser('user-123')).not.toThrow()
    })
  })

  describe('trackEvent', () => {
    it('should call posthog capture with event name', () => {
      trackEvent('button_clicked')

      expect(mockPostHog.capture).toHaveBeenCalledWith('button_clicked', undefined)
    })

    it('should call posthog capture with properties', () => {
      trackEvent('resume_uploaded', { fileSize: 1024, format: 'pdf' })

      expect(mockPostHog.capture).toHaveBeenCalledWith('resume_uploaded', {
        fileSize: 1024,
        format: 'pdf'
      })
    })

    it('should not throw if posthog not initialized', () => {
      expect(() => trackEvent('test_event')).not.toThrow()
    })
  })

  describe('resetAnalytics', () => {
    it('should call posthog reset', () => {
      resetAnalytics()

      expect(mockPostHog.reset).toHaveBeenCalled()
    })

    it('should not throw if posthog not initialized', () => {
      expect(() => resetAnalytics()).not.toThrow()
    })
  })
})
