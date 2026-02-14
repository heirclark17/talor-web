import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useInterviewPrepStore } from './interviewPrepStore'

// Mock API client
const mockGetInterviewPrep = vi.fn()

vi.mock('../api/client', () => ({
  api: {
    getInterviewPrep: (id: number) => mockGetInterviewPrep(id)
  }
}))

describe('InterviewPrepStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store
    useInterviewPrepStore.setState({
      prepCache: new Map(),
      loadingIds: new Set()
    })
  })

  describe('Initial State', () => {
    it('should have empty cache', () => {
      const state = useInterviewPrepStore.getState()
      expect(state.prepCache.size).toBe(0)
    })

    it('should have empty loading set', () => {
      const state = useInterviewPrepStore.getState()
      expect(state.loadingIds.size).toBe(0)
    })
  })

  describe('fetchInterviewPrep', () => {
    it('should fetch and cache interview prep data', async () => {
      const mockPrepData = {
        tailored_resume_id: 1,
        company_name: 'Google',
        job_title: 'Software Engineer',
        questions: [],
        company_insights: {},
        talking_points: [],
        questions_to_ask: [],
        created_at: '2024-01-01'
      }

      mockGetInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData
      })

      const result = await useInterviewPrepStore.getState().fetchInterviewPrep(1)

      expect(result).toEqual(mockPrepData)
      expect(useInterviewPrepStore.getState().prepCache.get(1)).toEqual(mockPrepData)
    })

    it('should return cached data if available', async () => {
      const mockPrepData = {
        tailored_resume_id: 1,
        company_name: 'Google',
        job_title: 'Engineer',
        questions: [],
        company_insights: {},
        talking_points: [],
        questions_to_ask: [],
        created_at: '2024-01-01'
      }

      // Manually set cache
      useInterviewPrepStore.setState({
        prepCache: new Map([[1, mockPrepData]])
      })

      const result = await useInterviewPrepStore.getState().fetchInterviewPrep(1)

      expect(result).toEqual(mockPrepData)
      expect(mockGetInterviewPrep).not.toHaveBeenCalled()
    })

    it('should return null on API error', async () => {
      mockGetInterviewPrep.mockResolvedValue({
        success: false,
        error: 'API error'
      })

      const result = await useInterviewPrepStore.getState().fetchInterviewPrep(1)

      expect(result).toBeNull()
    })

    it('should not fetch if already loading', async () => {
      // Set as loading
      useInterviewPrepStore.setState({
        loadingIds: new Set([1])
      })

      const result = await useInterviewPrepStore.getState().fetchInterviewPrep(1)

      expect(result).toBeNull()
      expect(mockGetInterviewPrep).not.toHaveBeenCalled()
    })
  })

  describe('getCachedPrep', () => {
    it('should return cached prep data', () => {
      const mockPrepData = {
        tailored_resume_id: 1,
        company_name: 'Google',
        job_title: 'Engineer',
        questions: [],
        company_insights: {},
        talking_points: [],
        questions_to_ask: [],
        created_at: '2024-01-01'
      }

      useInterviewPrepStore.setState({
        prepCache: new Map([[1, mockPrepData]])
      })

      const result = useInterviewPrepStore.getState().getCachedPrep(1)

      expect(result).toEqual(mockPrepData)
    })

    it('should return null if not cached', () => {
      const result = useInterviewPrepStore.getState().getCachedPrep(999)

      expect(result).toBeNull()
    })
  })

  describe('clearCache', () => {
    it('should clear all cached data', () => {
      useInterviewPrepStore.setState({
        prepCache: new Map([[1, {} as any], [2, {} as any]])
      })

      useInterviewPrepStore.getState().clearCache()

      expect(useInterviewPrepStore.getState().prepCache.size).toBe(0)
    })
  })

  describe('clearPrepForResume', () => {
    it('should clear prep for specific resume', () => {
      useInterviewPrepStore.setState({
        prepCache: new Map([[1, {} as any], [2, {} as any]])
      })

      useInterviewPrepStore.getState().clearPrepForResume(1)

      expect(useInterviewPrepStore.getState().prepCache.has(1)).toBe(false)
      expect(useInterviewPrepStore.getState().prepCache.has(2)).toBe(true)
    })
  })
})
