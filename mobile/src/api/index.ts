/**
 * API Module Index
 *
 * This module exports all API functions organized by domain.
 * It also provides backwards compatibility with the existing `api` object.
 *
 * Usage:
 *
 * // New modular imports (recommended)
 * import { resumeApi, tailorApi, interviewApi } from '../api';
 * const resumes = await resumeApi.getResumes();
 *
 * // Or import individual functions
 * import { getResumes, tailorResume, generateInterviewPrep } from '../api';
 *
 * // Legacy api object (backwards compatible)
 * import { api } from '../api';
 * const resumes = await api.getResumes();
 */

// Domain-specific APIs
export * from './resumeApi';
export * from './tailorApi';
export * from './interviewApi';

// Base utilities (for advanced usage)
export type { ApiResponse, RequestOptions } from './base';
export { fetchWithAuth, snakeToCamel, camelToSnake, get, post, put, del } from './base';

// Import domain APIs for combined export
import { resumeApi } from './resumeApi';
import { tailorApi } from './tailorApi';
import { interviewApi } from './interviewApi';

// Re-export domain APIs
export { resumeApi, tailorApi, interviewApi };

/**
 * Combined API object for backwards compatibility
 * Maps to the original client.ts structure
 */
export const api = {
  // Resume endpoints
  getResumes: resumeApi.getResumes,
  getResume: resumeApi.getResume,
  uploadResume: resumeApi.uploadResume,
  deleteResume: resumeApi.deleteResume,

  // Job extraction
  extractJobDetails: tailorApi.extractJobDetails,

  // Tailoring endpoints
  tailorResume: tailorApi.tailorResume,
  getTailoredResume: tailorApi.getTailoredResume,
  getTailoredResumes: tailorApi.getTailoredResumes,
  tailorResumeBatch: tailorApi.tailorResumeBatch,

  // Interview prep endpoints
  getInterviewPreps: interviewApi.getInterviewPreps,
  getInterviewPrep: interviewApi.getInterviewPrep,
  generateInterviewPrep: interviewApi.generateInterviewPrep,
  deleteInterviewPrep: interviewApi.deleteInterviewPrep,
  getCommonQuestions: interviewApi.getCommonQuestions,
  getBehavioralQuestions: interviewApi.getBehavioralQuestions,
  getTechnicalQuestions: interviewApi.getTechnicalQuestions,
  regenerateQuestion: interviewApi.regenerateQuestion,
  generatePracticeQuestions: interviewApi.generatePracticeQuestions,
  generatePracticeStarStory: interviewApi.generatePracticeStarStory,
  savePracticeResponse: interviewApi.savePracticeResponse,
  getPracticeHistory: interviewApi.getPracticeHistory,
  getCompanyResearch: interviewApi.getCompanyResearch,
  getCompanyNews: interviewApi.getCompanyNews,
  getValuesAlignment: interviewApi.getValuesAlignment,
  getReadinessScore: interviewApi.getReadinessScore,
  getInterviewStrategy: interviewApi.getInterviewStrategy,
  getCompetitiveIntelligence: interviewApi.getCompetitiveIntelligence,
};

export default api;
