import { create } from 'zustand';
import { api } from '../api/client';

export interface Resume {
  id: number;
  file_name: string;
  created_at: string;
  tailored_count?: number;
  status?: string;
}

export interface TailoredResume {
  id: number;
  resume_id: number;
  job_title: string;
  company: string;
  created_at: string;
  match_score?: number;
  tailored_content?: Record<string, unknown>;
  original_content?: Record<string, unknown>;
  job_description?: string;
  keywords?: string[];
}

interface ResumeState {
  // Data
  resumes: Resume[];
  tailoredResumes: TailoredResume[];
  selectedResume: Resume | null;
  selectedTailoredResume: TailoredResume | null;

  // Loading states
  isLoadingResumes: boolean;
  isLoadingTailored: boolean;
  isUploading: boolean;
  isTailoring: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchResumes: () => Promise<void>;
  fetchTailoredResumes: (resumeId?: number) => Promise<void>;
  selectResume: (resume: Resume | null) => void;
  selectTailoredResume: (tailoredResume: TailoredResume | null) => void;
  uploadResume: (formData: FormData) => Promise<boolean>;
  deleteResume: (resumeId: number) => Promise<boolean>;
  tailorResume: (resumeId: number, jobDescription: string, jobUrl?: string) => Promise<TailoredResume | null>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  resumes: [],
  tailoredResumes: [],
  selectedResume: null,
  selectedTailoredResume: null,
  isLoadingResumes: false,
  isLoadingTailored: false,
  isUploading: false,
  isTailoring: false,
  error: null,
};

export const useResumeStore = create<ResumeState>((set, get) => ({
  ...initialState,

  fetchResumes: async () => {
    set({ isLoadingResumes: true, error: null });
    try {
      const response = await api.getResumes();
      if (response.success) {
        set({ resumes: response.data || [], isLoadingResumes: false });
      } else {
        set({ error: response.error || 'Failed to fetch resumes', isLoadingResumes: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch resumes',
        isLoadingResumes: false,
      });
    }
  },

  fetchTailoredResumes: async (_resumeId?: number) => {
    set({ isLoadingTailored: true, error: null });
    try {
      const response = await api.listTailoredResumes();
      if (response.success) {
        set({ tailoredResumes: response.data?.tailored_resumes || response.data || [], isLoadingTailored: false });
      } else {
        set({ error: response.error || 'Failed to fetch tailored resumes', isLoadingTailored: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch tailored resumes',
        isLoadingTailored: false,
      });
    }
  },

  selectResume: (resume) => {
    set({ selectedResume: resume });
  },

  selectTailoredResume: (tailoredResume) => {
    set({ selectedTailoredResume: tailoredResume });
  },

  uploadResume: async (formData) => {
    set({ isUploading: true, error: null });
    try {
      const response = await api.uploadResume(formData);
      if (response.success) {
        // Refresh the resumes list
        await get().fetchResumes();
        set({ isUploading: false });
        return true;
      } else {
        set({ error: response.error || 'Failed to upload resume', isUploading: false });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to upload resume',
        isUploading: false,
      });
      return false;
    }
  },

  deleteResume: async (resumeId) => {
    set({ error: null });
    try {
      const response = await api.deleteResume(resumeId);
      if (response.success) {
        // Remove from local state
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== resumeId),
          selectedResume: state.selectedResume?.id === resumeId ? null : state.selectedResume,
        }));
        return true;
      } else {
        set({ error: response.error || 'Failed to delete resume' });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete resume',
      });
      return false;
    }
  },

  tailorResume: async (resumeId, jobDescription, jobUrl) => {
    set({ isTailoring: true, error: null });
    try {
      const response = await api.tailorResume({
        baseResumeId: resumeId,
        jobUrl: jobUrl,
      });
      if (response.success && response.data) {
        // Add to tailored resumes list
        set((state) => ({
          tailoredResumes: [response.data, ...state.tailoredResumes],
          isTailoring: false,
        }));
        return response.data;
      } else {
        set({ error: response.error || 'Failed to tailor resume', isTailoring: false });
        return null;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to tailor resume',
        isTailoring: false,
      });
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));

export default useResumeStore;
