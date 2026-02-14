import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '../api/client'

// Mock fetch
global.fetch = vi.fn()

describe('API Client Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: {} })
    })
  })

  describe('Resume Operations', () => {
    it('should support listing resumes', async () => {
      const result = await api.listResumes()
      expect(result.success).toBe(true)
    })

    it('should support getting a resume', async () => {
      const result = await api.getResume(1)
      expect(result.success).toBe(true)
    })
  })

  describe('Interview Prep Operations', () => {
    it('should support generating interview prep', async () => {
      const result = await api.generateInterviewPrep(1)
      expect(result.success).toBe(true)
    })

    it('should support getting interview prep', async () => {
      const result = await api.getInterviewPrep(1)
      expect(result.success).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ success: false, error: 'Server error' })
      })

      const result = await api.listResumes()
      expect(result.success).toBe(false)
    })
  })
})
