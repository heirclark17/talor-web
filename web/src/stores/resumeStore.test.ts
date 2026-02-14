import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useResumeStore } from './resumeStore'

// Mock API
const mockListResumes = vi.fn()
const mockDeleteResume = vi.fn()
const mockAnalyzeResume = vi.fn()

vi.mock('../api/client', () => ({
  api: {
    listResumes: () => mockListResumes(),
    deleteResume: (id: number) => mockDeleteResume(id),
    analyzeResume: (id: number) => mockAnalyzeResume(id)
  }
}))

describe('ResumeStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store to initial state
    useResumeStore.getState().reset()
  })

  describe('Initial State', () => {
    it('should have empty resumes array', () => {
      const state = useResumeStore.getState()
      expect(state.resumes).toEqual([])
    })

    it('should have null selectedResumeId', () => {
      const state = useResumeStore.getState()
      expect(state.selectedResumeId).toBeNull()
    })

    it('should have loading true initially', () => {
      const state = useResumeStore.getState()
      expect(state.loading).toBe(true)
    })
  })

  describe('fetchResumes', () => {
    it('should fetch and store resumes', async () => {
      const mockResumes = [
        { id: 1, filename: 'resume1.pdf', skills: [], skills_count: 0, uploaded_at: '2024-01-01' },
        { id: 2, filename: 'resume2.pdf', skills: [], skills_count: 0, uploaded_at: '2024-01-02' }
      ]

      mockListResumes.mockResolvedValue({
        success: true,
        data: { resumes: mockResumes }
      })

      await useResumeStore.getState().fetchResumes()

      const state = useResumeStore.getState()
      expect(state.resumes).toEqual(mockResumes)
      expect(state.loading).toBe(false)
    })

    it('should set loading to false on error', async () => {
      mockListResumes.mockRejectedValue(new Error('API error'))

      await useResumeStore.getState().fetchResumes()

      const state = useResumeStore.getState()
      expect(state.loading).toBe(false)
      expect(state.resumes).toEqual([])
    })
  })

  describe('refreshResumes', () => {
    it('should set refreshing state during refresh', async () => {
      mockListResumes.mockResolvedValue({
        success: true,
        data: { resumes: [] }
      })

      const refreshPromise = useResumeStore.getState().refreshResumes()

      // Check refreshing is true while promise pending
      expect(useResumeStore.getState().refreshing).toBe(true)

      await refreshPromise

      expect(useResumeStore.getState().refreshing).toBe(false)
    })
  })

  describe('deleteResume', () => {
    it('should delete resume and update list', async () => {
      mockDeleteResume.mockResolvedValue({ success: true })
      mockListResumes.mockResolvedValue({
        success: true,
        data: { resumes: [] }
      })

      // Set initial resumes
      useResumeStore.setState({
        resumes: [
          { id: 1, filename: 'resume1.pdf', skills: [], skills_count: 0, uploaded_at: '2024-01-01' },
          { id: 2, filename: 'resume2.pdf', skills: [], skills_count: 0, uploaded_at: '2024-01-02' }
        ]
      })

      const result = await useResumeStore.getState().deleteResume(1)

      expect(result).toBe(true)
      expect(mockDeleteResume).toHaveBeenCalledWith(1)
    })

    it('should return false on delete error', async () => {
      mockDeleteResume.mockRejectedValue(new Error('Delete failed'))

      const result = await useResumeStore.getState().deleteResume(1)

      expect(result).toBe(false)
    })
  })

  describe('setSelectedResumeId', () => {
    it('should set selected resume ID', () => {
      useResumeStore.getState().setSelectedResumeId(123)

      expect(useResumeStore.getState().selectedResumeId).toBe(123)
    })

    it('should allow clearing selection', () => {
      useResumeStore.getState().setSelectedResumeId(123)
      useResumeStore.getState().setSelectedResumeId(null)

      expect(useResumeStore.getState().selectedResumeId).toBeNull()
    })
  })

  describe('clearAnalysis', () => {
    it('should clear current analysis', () => {
      useResumeStore.setState({ currentAnalysis: { score: 95 } })

      useResumeStore.getState().clearAnalysis()

      expect(useResumeStore.getState().currentAnalysis).toBeNull()
    })
  })

  describe('reset', () => {
    it('should reset store to initial state', () => {
      useResumeStore.setState({
        resumes: [{ id: 1, filename: 'test.pdf', skills: [], skills_count: 0, uploaded_at: '2024-01-01' }],
        selectedResumeId: 123,
        currentAnalysis: { score: 95 }
      })

      useResumeStore.getState().reset()

      const state = useResumeStore.getState()
      expect(state.resumes).toEqual([])
      expect(state.selectedResumeId).toBeNull()
      expect(state.currentAnalysis).toBeNull()
    })
  })
})
