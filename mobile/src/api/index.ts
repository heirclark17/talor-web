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
export * from './applicationApi';
export * from './careerPathApi';
export * from './coverLetterApi';
export * from './starStoryApi';

// Base utilities (for advanced usage)
export type { ApiResponse, RequestOptions } from './base';
export { fetchWithAuth, snakeToCamel, camelToSnake, get, post, put, del } from './base';

// Import domain APIs for combined export
import { resumeApi } from './resumeApi';
import { tailorApi } from './tailorApi';
import { interviewApi } from './interviewApi';
import { applicationApi } from './applicationApi';
import { careerPathApi } from './careerPathApi';
import { coverLetterApi } from './coverLetterApi';
import { starStoryApi } from './starStoryApi';

// Re-export domain APIs
export { resumeApi, tailorApi, interviewApi, applicationApi, careerPathApi, coverLetterApi, starStoryApi };

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
  listTailoredResumes: tailorApi.listTailoredResumes,
  tailorResumeBatch: tailorApi.tailorResumeBatch,
  deleteTailoredResume: tailorApi.deleteTailoredResume,
  bulkDeleteTailoredResumes: tailorApi.bulkDeleteTailoredResumes,

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

  // Cover letter endpoints
  listCoverLetters: coverLetterApi.list,
  generateCoverLetter: coverLetterApi.generate,
  downloadCoverLetter: coverLetterApi.export,
  updateCoverLetter: coverLetterApi.update,
  deleteCoverLetter: coverLetterApi.delete,

  // Application tracker endpoints
  listApplications: applicationApi.list,
  createApplication: applicationApi.create,
  updateApplication: applicationApi.update,
  deleteApplication: applicationApi.delete,
  getApplicationStats: applicationApi.getStats,
};

export default api;
