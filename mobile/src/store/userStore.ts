import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserId, clearUserSession, saveSessionData, loadSessionData } from '../utils/userSession';

interface UserState {
  userId: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Preferences
  hasCompletedOnboarding: boolean;
  lastViewedResumeId: number | null;
  lastViewedInterviewPrepId: number | null;

  // Actions
  initialize: () => Promise<void>;
  setUserId: (userId: string) => void;
  clearUser: () => Promise<void>;
  setOnboardingComplete: () => void;
  setLastViewedResume: (resumeId: number) => void;
  setLastViewedInterviewPrep: (interviewPrepId: number) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      isInitialized: false,
      isLoading: false,
      error: null,
      hasCompletedOnboarding: false,
      lastViewedResumeId: null,
      lastViewedInterviewPrepId: null,

      initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true, error: null });
        try {
          const userId = await getUserId();
          set({ userId, isInitialized: true, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize user',
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      setUserId: (userId) => {
        set({ userId });
      },

      clearUser: async () => {
        await clearUserSession();
        set({
          userId: null,
          hasCompletedOnboarding: false,
          lastViewedResumeId: null,
          lastViewedInterviewPrepId: null,
        });
      },

      setOnboardingComplete: () => {
        set({ hasCompletedOnboarding: true });
      },

      setLastViewedResume: (resumeId) => {
        set({ lastViewedResumeId: resumeId });
      },

      setLastViewedInterviewPrep: (interviewPrepId) => {
        set({ lastViewedInterviewPrepId: interviewPrepId });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        lastViewedResumeId: state.lastViewedResumeId,
        lastViewedInterviewPrepId: state.lastViewedInterviewPrepId,
      }),
    }
  )
);

export default useUserStore;
