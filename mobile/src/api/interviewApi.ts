/**
 * Interview Prep API Module
 * Handles interview preparation, questions, and practice
 */

import { get, post, ApiResponse, fetchWithAuth, snakeToCamel } from './base';

// Types
export interface InterviewPrep {
  id: number;
  tailoredResumeId: number;
  company: string;
  jobTitle: string;
  createdAt: string;
  status?: string;
  companyResearch?: CompanyResearch;
  valuesAlignment?: ValuesAlignment;
  readinessScore?: ReadinessScore;
}

export interface CompanyResearch {
  companyOverview: string;
  recentNews: Array<{
    headline: string;
    date?: string;
    summary: string;
    source?: string;
    url?: string;
  }>;
  keyProductsServices: string[];
  competitors: Array<{
    name: string;
    context?: string;
  }>;
  financialHealth: {
    summary: string;
    status: 'good' | 'fair' | 'poor';
  };
  employeeSentiment: {
    summary: string;
    rating?: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  };
}

export interface ValuesAlignment {
  alignmentScore: number;
  matchedValues: Array<{
    value: string;
    companyContext?: string;
    candidateEvidence?: string;
  }>;
  valueGaps: Array<{
    value: string;
    companyContext?: string;
    suggestion?: string;
  }>;
  culturalFitInsights: string;
}

export interface ReadinessScore {
  confidenceLevel: number;
  preparationLevel: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
}

export interface InterviewQuestion {
  id: number;
  interviewPrepId: number;
  question: string;
  category: string;
  suggestedAnswer?: string;
  tips?: string[];
}

export interface PracticeResponse {
  id: number;
  questionText: string;
  questionCategory?: string;
  responseText?: string;
  starStory?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  practicedAt: string;
  durationSeconds?: number;
  timesPracticed: number;
}

// API Functions

/**
 * Get all interview preps for current user
 */
export async function getInterviewPreps(): Promise<ApiResponse<InterviewPrep[]>> {
  try {
    const response = await fetchWithAuth('/api/interview-prep/list');
    const json = await response.json();
    const data = json.interview_preps || json || [];
    return { success: true, data: snakeToCamel<InterviewPrep[]>(data) };
  } catch (error) {
    console.error('Error fetching interview preps:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a specific interview prep
 */
export async function getInterviewPrep(prepId: number): Promise<ApiResponse<InterviewPrep>> {
  return get<InterviewPrep>(`/api/interview-prep/${prepId}`);
}

/**
 * Generate interview prep for a tailored resume
 */
export async function generateInterviewPrep(tailoredResumeId: number): Promise<ApiResponse<InterviewPrep>> {
  return post<InterviewPrep>('/api/interview-prep/generate', {
    tailored_resume_id: tailoredResumeId,
  });
}

/**
 * Delete an interview prep
 */
export async function deleteInterviewPrep(prepId: number): Promise<ApiResponse<void>> {
  return post<void>(`/api/interview-prep/${prepId}/delete`);
}

/**
 * Get common interview questions
 */
export async function getCommonQuestions(prepId: number): Promise<ApiResponse<{ questions: InterviewQuestion[] }>> {
  return get(`/api/interview-prep/${prepId}/common-questions`);
}

/**
 * Get behavioral questions
 */
export async function getBehavioralQuestions(prepId: number): Promise<ApiResponse<{ questions: InterviewQuestion[] }>> {
  return get(`/api/interview-prep/${prepId}/behavioral-questions`);
}

/**
 * Get technical questions
 */
export async function getTechnicalQuestions(prepId: number): Promise<ApiResponse<{ questions: InterviewQuestion[] }>> {
  return get(`/api/interview-prep/${prepId}/technical-questions`);
}

/**
 * Regenerate a specific question
 */
export async function regenerateQuestion(prepId: number, questionId: number): Promise<ApiResponse<InterviewQuestion>> {
  return post<InterviewQuestion>(`/api/interview-prep/${prepId}/questions/${questionId}/regenerate`);
}

/**
 * Generate practice questions
 */
export async function generatePracticeQuestions(
  prepId: number,
  numQuestions?: number
): Promise<ApiResponse<{ questions: InterviewQuestion[] }>> {
  return post('/api/interview-prep/generate-practice-questions', {
    interview_prep_id: prepId,
    num_questions: numQuestions || 10,
  });
}

/**
 * Generate STAR story for a practice question
 */
export async function generatePracticeStarStory(
  prepId: number,
  question: string
): Promise<ApiResponse<{
  situation: string;
  task: string;
  action: string;
  result: string;
}>> {
  return post('/api/interview-prep/generate-practice-star-story', {
    interview_prep_id: prepId,
    question,
  });
}

/**
 * Save a practice response
 */
export async function savePracticeResponse(params: {
  interviewPrepId: number;
  questionText: string;
  questionCategory?: string;
  starStory?: object;
  writtenAnswer?: string;
  practiceDurationSeconds?: number;
}): Promise<ApiResponse<{ id: number; timesPracticed: number; message: string }>> {
  return post('/api/interview-prep/save-practice-response', {
    interview_prep_id: params.interviewPrepId,
    question_text: params.questionText,
    question_category: params.questionCategory,
    star_story: params.starStory,
    written_answer: params.writtenAnswer,
    practice_duration_seconds: params.practiceDurationSeconds,
  });
}

/**
 * Get practice history
 */
export async function getPracticeHistory(prepId: number): Promise<ApiResponse<{ history: PracticeResponse[] }>> {
  return get(`/api/interview-prep/${prepId}/practice-history`);
}

/**
 * Get company research
 */
export async function getCompanyResearch(params: {
  companyName: string;
  industry?: string;
  jobTitle?: string;
}): Promise<ApiResponse<CompanyResearch>> {
  return post('/api/interview-prep/company-research', {
    company_name: params.companyName,
    industry: params.industry,
    job_title: params.jobTitle,
  });
}

/**
 * Get company news
 */
export async function getCompanyNews(params: {
  companyName: string;
  industry?: string;
  jobTitle?: string;
  daysBack?: number;
}): Promise<ApiResponse<{ newsItems: Array<{
  headline: string;
  date: string;
  source: string;
  summary: string;
  relevanceToInterview: string;
  talkingPoints: string[];
}> }>> {
  return post('/api/interview-prep/company-news', {
    company_name: params.companyName,
    industry: params.industry,
    job_title: params.jobTitle,
    days_back: params.daysBack || 90,
  });
}

/**
 * Get values alignment
 */
export async function getValuesAlignment(prepId: number): Promise<ApiResponse<ValuesAlignment>> {
  return get(`/api/interview-prep/${prepId}/values-alignment`);
}

/**
 * Get readiness score
 */
export async function getReadinessScore(prepId: number): Promise<ApiResponse<ReadinessScore>> {
  return get(`/api/interview-prep/${prepId}/readiness-score`);
}

/**
 * Get interview strategy
 */
export async function getInterviewStrategy(prepId: number): Promise<ApiResponse<{
  recommendedApproach: string;
  keyThemesToEmphasize: string[];
  storiesToPrepare: Array<{ theme: string; description: string }>;
  questionsToAskInterviewer: string[];
  preInterviewChecklist: string[];
}>> {
  return get(`/api/interview-prep/${prepId}/interview-strategy`);
}

/**
 * Get competitive intelligence
 */
export async function getCompetitiveIntelligence(prepId: number): Promise<ApiResponse<{
  marketPosition: string;
  competitiveAdvantages: string[];
  challenges: string[];
  differentiationStrategy: string;
  interviewAngles: string[];
}>> {
  return get(`/api/interview-prep/${prepId}/competitive-intelligence`);
}

export const interviewApi = {
  getInterviewPreps,
  getInterviewPrep,
  generateInterviewPrep,
  deleteInterviewPrep,
  getCommonQuestions,
  getBehavioralQuestions,
  getTechnicalQuestions,
  regenerateQuestion,
  generatePracticeQuestions,
  generatePracticeStarStory,
  savePracticeResponse,
  getPracticeHistory,
  getCompanyResearch,
  getCompanyNews,
  getValuesAlignment,
  getReadinessScore,
  getInterviewStrategy,
  getCompetitiveIntelligence,
};

export default interviewApi;
