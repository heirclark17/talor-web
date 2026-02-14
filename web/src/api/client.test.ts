import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './client'

// Mock userSession utilities
vi.mock('../utils/userSession', () => ({
  getUserId: vi.fn(() => 'test-user-123'),
  getAuthToken: vi.fn(() => 'test-token-abc')
}))

// Mock fetch globally
global.fetch = vi.fn()

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} })
    })
  })

  describe('API Instance', () => {
    it('should export api singleton', () => {
      expect(api).toBeDefined()
      expect(typeof api).toBe('object')
    })

    it('should have resume methods', () => {
      expect(typeof api.listResumes).toBe('function')
      expect(typeof api.getResume).toBe('function')
      expect(typeof api.uploadResume).toBe('function')
      expect(typeof api.deleteResume).toBe('function')
      expect(typeof api.analyzeResume).toBe('function')
    })

    it('should have tailor methods', () => {
      expect(typeof api.tailorResume).toBe('function')
      expect(typeof api.getTailoredResume).toBe('function')
      expect(typeof api.listTailoredResumes).toBe('function')
      expect(typeof api.updateTailoredResume).toBe('function')
    })

    it('should have interview prep methods', () => {
      expect(typeof api.generateInterviewPrep).toBe('function')
      expect(typeof api.getInterviewPrep).toBe('function')
      expect(typeof api.listInterviewPreps).toBe('function')
      expect(typeof api.deleteInterviewPrep).toBe('function')
    })

    it('should have STAR story methods', () => {
      expect(typeof api.listStarStories).toBe('function')
      expect(typeof api.createStarStory).toBe('function')
      expect(typeof api.getStarStory).toBe('function')
      expect(typeof api.deleteStarStory).toBe('function')
    })

    it('should have career path methods', () => {
      expect(typeof api.generateCareerPlan).toBe('function')
      expect(typeof api.getCareerPlan).toBe('function')
      expect(typeof api.listCareerPlans).toBe('function')
      expect(typeof api.deleteCareerPlan).toBe('function')
    })

    it('should have cover letter methods', () => {
      expect(typeof api.generateCoverLetter).toBe('function')
      expect(typeof api.listCoverLetters).toBe('function')
      expect(typeof api.updateCoverLetter).toBe('function')
      expect(typeof api.deleteCoverLetter).toBe('function')
    })

    it('should have application tracking methods', () => {
      expect(typeof api.createApplication).toBe('function')
      expect(typeof api.listApplications).toBe('function')
      expect(typeof api.updateApplication).toBe('function')
      expect(typeof api.deleteApplication).toBe('function')
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      const result = await api.listResumes()

      expect(result.success).toBe(false)
      expect(result.error).toContain('Network error')
    })

    it('should handle non-ok responses', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ success: false, error: 'Internal Server Error' })
      })

      const result = await api.listResumes()

      expect(result.success).toBe(false)
    })
  })
})
