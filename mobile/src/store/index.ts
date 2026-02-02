/**
 * Zustand State Management
 *
 * This module exports all application stores for global state management.
 *
 * Usage:
 * import { useUserStore, useResumeStore, useInterviewStore, useUIStore } from '../store';
 *
 * In components:
 * const { userId, initialize } = useUserStore();
 * const { resumes, fetchResumes } = useResumeStore();
 * const { showToast } = useUIStore();
 */

// Store exports
export { useUserStore, default as userStore } from './userStore';
export { useResumeStore, default as resumeStore } from './resumeStore';
export type { Resume, TailoredResume } from './resumeStore';
export { useInterviewStore, default as interviewStore } from './interviewStore';
export type { InterviewPrep, InterviewQuestion, PracticeResponse } from './interviewStore';
export { useUIStore, useIsLoading, useToasts, useSearchQuery, default as uiStore } from './uiStore';

/**
 * Reset all stores - useful for logout
 */
export const resetAllStores = async () => {
  const { useUserStore } = await import('./userStore');
  const { useResumeStore } = await import('./resumeStore');
  const { useInterviewStore } = await import('./interviewStore');
  const { useUIStore } = await import('./uiStore');

  await useUserStore.getState().clearUser();
  useResumeStore.getState().reset();
  useInterviewStore.getState().reset();
  useUIStore.getState().reset();
};

/**
 * Initialize all stores on app start
 */
export const initializeStores = async () => {
  const { useUserStore } = await import('./userStore');
  await useUserStore.getState().initialize();
};
