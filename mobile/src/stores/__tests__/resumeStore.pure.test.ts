/**
 * Pure unit tests for resumeStore (src/stores/resumeStore.ts)
 * Tests the zustand store actions, state transitions, and selectors
 */

import { useResumeStore, selectResumeById, selectSelectedResume } from '../resumeStore';

jest.mock('../../api/client', () => ({
  api: {
    getResumes: jest.fn(),
    deleteResume: jest.fn(),
    analyzeResume: jest.fn(),
  },
}));

const { api } = require('../../api/client');

const mockResumes = [
  { id: 1, filename: 'resume1.pdf', skills_count: 5, uploaded_at: '2026-01-01' },
  { id: 2, filename: 'resume2.pdf', skills_count: 8, uploaded_at: '2026-01-02' },
  { id: 3, filename: 'resume3.pdf', skills_count: 3, uploaded_at: '2026-01-03' },
];

const mockAnalysis = {
  overall_score: 85,
  strengths: ['Strong technical skills'],
  weaknesses: ['Missing keywords'],
  keyword_optimization: { score: 70, missing_keywords: ['AWS'], suggestions: 'Add cloud skills' },
  ats_compatibility: { score: 80, issues: [], recommendations: 'Good format' },
  improvement_recommendations: [],
};

describe('resumeStore (src/stores/)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store to initial state
    useResumeStore.setState({
      resumes: [],
      selectedResumeId: null,
      currentAnalysis: null,
      loading: true,
      refreshing: false,
      deletingId: null,
      analyzingId: null,
    });
  });

  describe('initial state', () => {
    it('should have loading: true in initial state', () => {
      const state = useResumeStore.getState();
      expect(state.loading).toBe(true);
      expect(state.resumes).toEqual([]);
      expect(state.selectedResumeId).toBeNull();
      expect(state.currentAnalysis).toBeNull();
      expect(state.refreshing).toBe(false);
      expect(state.deletingId).toBeNull();
      expect(state.analyzingId).toBeNull();
    });
  });

  describe('fetchResumes', () => {
    it('should set resumes array on success', async () => {
      api.getResumes.mockResolvedValue({ success: true, data: mockResumes });

      await useResumeStore.getState().fetchResumes();

      const state = useResumeStore.getState();
      expect(state.resumes).toEqual(mockResumes);
      expect(state.loading).toBe(false);
    });

    it('should set empty array when result.data is not an array', async () => {
      api.getResumes.mockResolvedValue({ success: true, data: 'not an array' });

      await useResumeStore.getState().fetchResumes();

      const state = useResumeStore.getState();
      expect(state.resumes).toEqual([]);
      expect(state.loading).toBe(false);
    });

    it('should set empty array and log error on API failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      api.getResumes.mockResolvedValue({ success: false, error: 'Server error' });

      await useResumeStore.getState().fetchResumes();

      const state = useResumeStore.getState();
      expect(state.resumes).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load resumes:', 'Server error');
      consoleSpy.mockRestore();
    });

    it('should set empty array on exception', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      api.getResumes.mockRejectedValue(new Error('Network error'));

      await useResumeStore.getState().fetchResumes();

      const state = useResumeStore.getState();
      expect(state.resumes).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('Error loading resumes:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should set loading false in all cases (success)', async () => {
      api.getResumes.mockResolvedValue({ success: true, data: mockResumes });

      await useResumeStore.getState().fetchResumes();

      expect(useResumeStore.getState().loading).toBe(false);
    });

    it('should set loading false in all cases (failure)', async () => {
      api.getResumes.mockRejectedValue(new Error('fail'));
      jest.spyOn(console, 'error').mockImplementation();

      await useResumeStore.getState().fetchResumes();

      expect(useResumeStore.getState().loading).toBe(false);
    });
  });

  describe('refreshResumes', () => {
    it('should set resumes and use refreshing flag on success', async () => {
      api.getResumes.mockResolvedValue({ success: true, data: mockResumes });

      const promise = useResumeStore.getState().refreshResumes();

      // refreshing should be true while in progress
      expect(useResumeStore.getState().refreshing).toBe(true);

      await promise;

      const state = useResumeStore.getState();
      expect(state.resumes).toEqual(mockResumes);
      expect(state.refreshing).toBe(false);
    });

    it('should not crash on error and clear refreshing flag', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      api.getResumes.mockRejectedValue(new Error('Refresh failed'));

      await useResumeStore.getState().refreshResumes();

      const state = useResumeStore.getState();
      expect(state.refreshing).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('deleteResume', () => {
    beforeEach(() => {
      useResumeStore.setState({ resumes: [...mockResumes], selectedResumeId: null });
    });

    it('should remove resume from state and return true on success', async () => {
      api.deleteResume.mockResolvedValue({ success: true });

      const result = await useResumeStore.getState().deleteResume(2);

      expect(result).toBe(true);
      const state = useResumeStore.getState();
      expect(state.resumes).toHaveLength(2);
      expect(state.resumes.find((r: any) => r.id === 2)).toBeUndefined();
    });

    it('should clear selection if deleted resume was selected', async () => {
      useResumeStore.setState({ selectedResumeId: 2 });
      api.deleteResume.mockResolvedValue({ success: true });

      await useResumeStore.getState().deleteResume(2);

      expect(useResumeStore.getState().selectedResumeId).toBeNull();
    });

    it('should not clear selection if a different resume was deleted', async () => {
      useResumeStore.setState({ selectedResumeId: 1 });
      api.deleteResume.mockResolvedValue({ success: true });

      await useResumeStore.getState().deleteResume(2);

      expect(useResumeStore.getState().selectedResumeId).toBe(1);
    });

    it('should return false on API failure', async () => {
      api.deleteResume.mockResolvedValue({ success: false });

      const result = await useResumeStore.getState().deleteResume(2);

      expect(result).toBe(false);
      // Resumes should not be removed
      expect(useResumeStore.getState().resumes).toHaveLength(3);
    });

    it('should clear deletingId in finally block', async () => {
      api.deleteResume.mockRejectedValue(new Error('Delete failed'));
      jest.spyOn(console, 'error').mockImplementation();

      await useResumeStore.getState().deleteResume(2);

      expect(useResumeStore.getState().deletingId).toBeNull();
    });
  });

  describe('analyzeResume', () => {
    it('should set currentAnalysis on success and return data', async () => {
      api.analyzeResume.mockResolvedValue({ success: true, data: mockAnalysis });

      const result = await useResumeStore.getState().analyzeResume(1);

      expect(result).toEqual(mockAnalysis);
      expect(useResumeStore.getState().currentAnalysis).toEqual(mockAnalysis);
    });

    it('should return null on failure', async () => {
      api.analyzeResume.mockResolvedValue({ success: false });

      const result = await useResumeStore.getState().analyzeResume(1);

      expect(result).toBeNull();
      expect(useResumeStore.getState().currentAnalysis).toBeNull();
    });

    it('should clear analyzingId in finally block', async () => {
      api.analyzeResume.mockRejectedValue(new Error('Analyze failed'));
      jest.spyOn(console, 'error').mockImplementation();

      await useResumeStore.getState().analyzeResume(1);

      expect(useResumeStore.getState().analyzingId).toBeNull();
    });
  });

  describe('setSelectedResumeId', () => {
    it('should set the selected resume id', () => {
      useResumeStore.getState().setSelectedResumeId(42);

      expect(useResumeStore.getState().selectedResumeId).toBe(42);
    });

    it('should set to null to clear selection', () => {
      useResumeStore.getState().setSelectedResumeId(42);
      useResumeStore.getState().setSelectedResumeId(null);

      expect(useResumeStore.getState().selectedResumeId).toBeNull();
    });
  });

  describe('clearAnalysis', () => {
    it('should set currentAnalysis to null', () => {
      useResumeStore.setState({ currentAnalysis: mockAnalysis as any });

      useResumeStore.getState().clearAnalysis();

      expect(useResumeStore.getState().currentAnalysis).toBeNull();
    });
  });

  describe('reset', () => {
    it('should restore initial state', async () => {
      // Modify the state
      useResumeStore.setState({
        resumes: mockResumes,
        selectedResumeId: 2,
        currentAnalysis: mockAnalysis as any,
        loading: false,
        refreshing: true,
        deletingId: 1,
        analyzingId: 3,
      });

      useResumeStore.getState().reset();

      const state = useResumeStore.getState();
      expect(state.resumes).toEqual([]);
      expect(state.selectedResumeId).toBeNull();
      expect(state.currentAnalysis).toBeNull();
      expect(state.loading).toBe(true);
      expect(state.refreshing).toBe(false);
      expect(state.deletingId).toBeNull();
      expect(state.analyzingId).toBeNull();
    });
  });

  describe('selectors', () => {
    it('selectResumeById should find a resume by id', () => {
      const state = { resumes: mockResumes } as any;

      const result = selectResumeById(state, 2);

      expect(result).toEqual(mockResumes[1]);
    });

    it('selectResumeById should return undefined for non-existent id', () => {
      const state = { resumes: mockResumes } as any;

      const result = selectResumeById(state, 999);

      expect(result).toBeUndefined();
    });

    it('selectSelectedResume should return the selected resume', () => {
      const state = { resumes: mockResumes, selectedResumeId: 2 } as any;

      const result = selectSelectedResume(state);

      expect(result).toEqual(mockResumes[1]);
    });

    it('selectSelectedResume should return null when no resume is selected', () => {
      const state = { resumes: mockResumes, selectedResumeId: null } as any;

      const result = selectSelectedResume(state);

      expect(result).toBeNull();
    });
  });
});
