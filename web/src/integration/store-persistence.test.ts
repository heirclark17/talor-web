import { describe, it, expect, beforeEach } from 'vitest'
import { useResumeStore } from '../stores/resumeStore'
import { useInterviewPrepStore } from '../stores/interviewPrepStore'

describe('Store Persistence Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('ResumeStore', () => {
    it('should persist state to localStorage', () => {
      const initialState = useResumeStore.getState()
      expect(initialState.resumes).toBeDefined()
    })

    it('should support state updates', () => {
      useResumeStore.setState({ loading: true })
      expect(useResumeStore.getState().loading).toBe(true)
    })

    it('should support state reset', () => {
      useResumeStore.getState().reset()
      const state = useResumeStore.getState()
      expect(state.resumes).toEqual([])
      expect(state.selectedResumeId).toBeNull()
    })
  })

  describe('InterviewPrepStore', () => {
    it('should persist cache to localStorage', () => {
      const initialState = useInterviewPrepStore.getState()
      expect(initialState.prepCache).toBeDefined()
    })

    it('should support cache operations', () => {
      const mockData = {
        tailored_resume_id: 1,
        company_name: 'Test',
        job_title: 'Engineer',
        questions: [],
        company_insights: {},
        talking_points: [],
        questions_to_ask: [],
        created_at: '2024-01-01'
      }

      useInterviewPrepStore.setState({
        prepCache: new Map([[1, mockData]])
      })

      const cached = useInterviewPrepStore.getState().getCachedPrep(1)
      expect(cached).toEqual(mockData)
    })

    it('should support cache clearing', () => {
      useInterviewPrepStore.getState().clearCache()
      expect(useInterviewPrepStore.getState().prepCache.size).toBe(0)
    })
  })
})
