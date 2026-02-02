import { create } from 'zustand';
import { api, ResumeAnalysis } from '../api/client';

// Resume interface matching API response
export interface Resume {
  id: number;
  filename: string;
  name?: string;
  email?: string;
  skills_count: number;
  uploaded_at: string;
}

interface ResumeState {
  // Data
  resumes: Resume[];
  selectedResumeId: number | null;
  currentAnalysis: ResumeAnalysis | null;

  // Loading states
  loading: boolean;
  refreshing: boolean;
  deletingId: number | null;
  analyzingId: number | null;

  // Actions
  fetchResumes: () => Promise<void>;
  refreshResumes: () => Promise<void>;
  deleteResume: (resumeId: number) => Promise<boolean>;
  analyzeResume: (resumeId: number) => Promise<ResumeAnalysis | null>;
  setSelectedResumeId: (id: number | null) => void;
  clearAnalysis: () => void;
  reset: () => void;
}

const initialState = {
  resumes: [],
  selectedResumeId: null,
  currentAnalysis: null,
  loading: true,
  refreshing: false,
  deletingId: null,
  analyzingId: null,
};

export const useResumeStore = create<ResumeState>((set, get) => ({
  ...initialState,

  fetchResumes: async () => {
    set({ loading: true });
    try {
      const result = await api.getResumes();
      if (result.success) {
        const resumeList = Array.isArray(result.data) ? result.data : [];
        set({ resumes: resumeList });
      } else {
        console.error('Failed to load resumes:', result.error);
        set({ resumes: [] });
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
      set({ resumes: [] });
    } finally {
      set({ loading: false });
    }
  },

  refreshResumes: async () => {
    set({ refreshing: true });
    try {
      const result = await api.getResumes();
      if (result.success) {
        const resumeList = Array.isArray(result.data) ? result.data : [];
        set({ resumes: resumeList });
      }
    } catch (error) {
      console.error('Error refreshing resumes:', error);
    } finally {
      set({ refreshing: false });
    }
  },

  deleteResume: async (resumeId: number) => {
    set({ deletingId: resumeId });
    try {
      const result = await api.deleteResume(resumeId);
      if (result.success) {
        // Remove from local state
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== resumeId),
          // Clear selection if deleted resume was selected
          selectedResumeId: state.selectedResumeId === resumeId ? null : state.selectedResumeId,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting resume:', error);
      return false;
    } finally {
      set({ deletingId: null });
    }
  },

  analyzeResume: async (resumeId: number) => {
    set({ analyzingId: resumeId });
    try {
      const result = await api.analyzeResume(resumeId);
      if (result.success && result.data) {
        set({ currentAnalysis: result.data });
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Error analyzing resume:', error);
      return null;
    } finally {
      set({ analyzingId: null });
    }
  },

  setSelectedResumeId: (id: number | null) => {
    set({ selectedResumeId: id });
  },

  clearAnalysis: () => {
    set({ currentAnalysis: null });
  },

  reset: () => {
    set(initialState);
  },
}));

// Selectors for common derived state
export const selectResumeById = (state: ResumeState, id: number) =>
  state.resumes.find((r) => r.id === id);

export const selectSelectedResume = (state: ResumeState) =>
  state.selectedResumeId ? selectResumeById(state, state.selectedResumeId) : null;
