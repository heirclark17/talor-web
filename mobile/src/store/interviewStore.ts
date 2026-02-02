import { create } from 'zustand';
import { api, CompanyResearch, ValuesAlignment, ReadinessScore } from '../api/client';

export interface InterviewPrep {
  id: number;
  tailored_resume_id: number;
  company: string;
  job_title: string;
  created_at: string;
  status?: string;
  company_research?: CompanyResearch;
  values_alignment?: ValuesAlignment;
  readiness_score?: ReadinessScore;
}

export interface InterviewQuestion {
  id: number;
  interview_prep_id: number;
  question: string;
  category: string;
  suggested_answer?: string;
  tips?: string[];
}

export interface PracticeResponse {
  id: number;
  question_text: string;
  response_text?: string;
  star_story?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  practiced_at: string;
  duration_seconds?: number;
  times_practiced: number;
}

interface InterviewState {
  // Data
  interviewPreps: InterviewPrep[];
  selectedInterviewPrep: InterviewPrep | null;
  commonQuestions: InterviewQuestion[];
  behavioralQuestions: InterviewQuestion[];
  technicalQuestions: InterviewQuestion[];
  practiceHistory: PracticeResponse[];

  // Loading states
  isLoadingPreps: boolean;
  isLoadingQuestions: boolean;
  isGenerating: boolean;
  isSavingPractice: boolean;

  // Error states
  error: string | null;

  // Actions
  fetchInterviewPreps: () => Promise<void>;
  fetchInterviewPrep: (prepId: number) => Promise<InterviewPrep | null>;
  selectInterviewPrep: (prep: InterviewPrep | null) => void;
  generateInterviewPrep: (tailoredResumeId: number) => Promise<InterviewPrep | null>;
  deleteInterviewPrep: (prepId: number) => Promise<boolean>;

  // Questions
  fetchCommonQuestions: (prepId: number) => Promise<void>;
  fetchBehavioralQuestions: (prepId: number) => Promise<void>;
  fetchTechnicalQuestions: (prepId: number) => Promise<void>;
  regenerateQuestion: (prepId: number, questionId: number, category: string) => Promise<boolean>;

  // Practice
  fetchPracticeHistory: (prepId: number) => Promise<void>;
  savePracticeResponse: (data: {
    interviewPrepId: number;
    questionText: string;
    questionCategory?: string;
    starStory?: object;
    writtenAnswer?: string;
    practiceDurationSeconds?: number;
  }) => Promise<boolean>;

  clearError: () => void;
  reset: () => void;
}

const initialState = {
  interviewPreps: [],
  selectedInterviewPrep: null,
  commonQuestions: [],
  behavioralQuestions: [],
  technicalQuestions: [],
  practiceHistory: [],
  isLoadingPreps: false,
  isLoadingQuestions: false,
  isGenerating: false,
  isSavingPractice: false,
  error: null,
};

export const useInterviewStore = create<InterviewState>((set, get) => ({
  ...initialState,

  fetchInterviewPreps: async () => {
    set({ isLoadingPreps: true, error: null });
    try {
      const response = await api.listInterviewPreps();
      if (response.success) {
        set({ interviewPreps: response.data?.interview_preps || response.data || [], isLoadingPreps: false });
      } else {
        set({ error: response.error || 'Failed to fetch interview preps', isLoadingPreps: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch interview preps',
        isLoadingPreps: false,
      });
    }
  },

  fetchInterviewPrep: async (prepId) => {
    set({ isLoadingPreps: true, error: null });
    try {
      const response = await api.getInterviewPrep(prepId);
      if (response.success && response.data) {
        set({ selectedInterviewPrep: response.data, isLoadingPreps: false });
        return response.data;
      } else {
        set({ error: response.error || 'Failed to fetch interview prep', isLoadingPreps: false });
        return null;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch interview prep',
        isLoadingPreps: false,
      });
      return null;
    }
  },

  selectInterviewPrep: (prep) => {
    set({ selectedInterviewPrep: prep });
  },

  generateInterviewPrep: async (tailoredResumeId) => {
    set({ isGenerating: true, error: null });
    try {
      const response = await api.generateInterviewPrep(tailoredResumeId);
      if (response.success && response.data) {
        set((state) => ({
          interviewPreps: [response.data, ...state.interviewPreps],
          selectedInterviewPrep: response.data,
          isGenerating: false,
        }));
        return response.data;
      } else {
        set({ error: response.error || 'Failed to generate interview prep', isGenerating: false });
        return null;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to generate interview prep',
        isGenerating: false,
      });
      return null;
    }
  },

  deleteInterviewPrep: async (prepId) => {
    set({ error: null });
    try {
      const response = await api.deleteInterviewPrep(prepId);
      if (response.success) {
        set((state) => ({
          interviewPreps: state.interviewPreps.filter((p) => p.id !== prepId),
          selectedInterviewPrep: state.selectedInterviewPrep?.id === prepId ? null : state.selectedInterviewPrep,
        }));
        return true;
      } else {
        set({ error: response.error || 'Failed to delete interview prep' });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete interview prep',
      });
      return false;
    }
  },

  fetchCommonQuestions: async (prepId) => {
    set({ isLoadingQuestions: true, error: null });
    try {
      const response = await api.generateCommonQuestions(prepId);
      if (response.success) {
        set({ commonQuestions: response.data?.questions || [], isLoadingQuestions: false });
      } else {
        set({ error: response.error || 'Failed to fetch common questions', isLoadingQuestions: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch common questions',
        isLoadingQuestions: false,
      });
    }
  },

  fetchBehavioralQuestions: async (prepId) => {
    set({ isLoadingQuestions: true, error: null });
    try {
      const response = await api.generateBehavioralTechnicalQuestions(prepId);
      if (response.success) {
        // Split behavioral and technical from combined response
        const allQuestions = response.data?.questions || [];
        const behavioral = allQuestions.filter((q: InterviewQuestion) => q.category === 'behavioral');
        set({ behavioralQuestions: behavioral, isLoadingQuestions: false });
      } else {
        set({ error: response.error || 'Failed to fetch behavioral questions', isLoadingQuestions: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch behavioral questions',
        isLoadingQuestions: false,
      });
    }
  },

  fetchTechnicalQuestions: async (prepId) => {
    set({ isLoadingQuestions: true, error: null });
    try {
      const response = await api.generateBehavioralTechnicalQuestions(prepId);
      if (response.success) {
        // Split behavioral and technical from combined response
        const allQuestions = response.data?.questions || [];
        const technical = allQuestions.filter((q: InterviewQuestion) => q.category === 'technical');
        set({ technicalQuestions: technical, isLoadingQuestions: false });
      } else {
        set({ error: response.error || 'Failed to fetch technical questions', isLoadingQuestions: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch technical questions',
        isLoadingQuestions: false,
      });
    }
  },

  regenerateQuestion: async (prepId, questionId, category) => {
    try {
      const response = await api.regenerateSingleQuestion({ interview_prep_id: prepId, question_id: String(questionId) });
      if (response.success && response.data) {
        // Update the appropriate question list
        const updateQuestions = (questions: InterviewQuestion[]) =>
          questions.map((q) => (q.id === questionId ? response.data : q));

        set((state) => ({
          commonQuestions: category === 'common' ? updateQuestions(state.commonQuestions) : state.commonQuestions,
          behavioralQuestions: category === 'behavioral' ? updateQuestions(state.behavioralQuestions) : state.behavioralQuestions,
          technicalQuestions: category === 'technical' ? updateQuestions(state.technicalQuestions) : state.technicalQuestions,
        }));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  fetchPracticeHistory: async (prepId) => {
    try {
      const response = await api.getPracticeHistory(prepId);
      if (response.success && response.data) {
        set({ practiceHistory: Array.isArray(response.data) ? response.data : [] });
      }
    } catch (error) {
      console.error('Error fetching practice history:', error);
    }
  },

  savePracticeResponse: async (data) => {
    set({ isSavingPractice: true });
    try {
      const response = await api.savePracticeResponse(data);
      if (response.success) {
        // Refresh practice history
        await get().fetchPracticeHistory(data.interviewPrepId);
        set({ isSavingPractice: false });
        return true;
      } else {
        set({ isSavingPractice: false });
        return false;
      }
    } catch {
      set({ isSavingPractice: false });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set(initialState);
  },
}));

export default useInterviewStore;
