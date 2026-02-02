/**
 * Resume API Module
 * Handles resume upload, retrieval, and management
 */

import { get, post, ApiResponse, fetchWithAuth } from './base';

export interface Resume {
  id: number;
  fileName: string;
  createdAt: string;
  tailoredCount?: number;
  status?: string;
  fullText?: string;
  parsedContent?: {
    name?: string;
    email?: string;
    phone?: string;
    experience?: Array<{
      title: string;
      company: string;
      dates: string;
      bullets: string[];
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
    skills?: string[];
  };
}

export interface ResumeList {
  resumes: Resume[];
}

/**
 * Get all resumes for the current user
 */
export async function getResumes(): Promise<ApiResponse<Resume[]>> {
  try {
    const response = await fetchWithAuth('/api/resumes/list');
    const json = await response.json();
    const data = json.resumes || [];
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a specific resume by ID
 */
export async function getResume(resumeId: number): Promise<ApiResponse<Resume>> {
  return get<Resume>(`/api/resumes/${resumeId}`);
}

/**
 * Upload a new resume
 */
export async function uploadResume(formData: FormData): Promise<ApiResponse<Resume>> {
  return post<Resume>('/api/resumes/upload', formData);
}

/**
 * Delete a resume
 */
export async function deleteResume(resumeId: number): Promise<ApiResponse<void>> {
  return post<void>(`/api/resumes/${resumeId}/delete`);
}

/**
 * Get resume analysis
 */
export async function getResumeAnalysis(resumeId: number): Promise<ApiResponse<{
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  keywordOptimization: {
    score: number;
    missingKeywords: string[];
    suggestions: string;
  };
  atsCompatibility: {
    score: number;
    issues: string[];
    recommendations: string;
  };
  improvementRecommendations: Array<{
    category: string;
    priority: 'high' | 'medium' | 'low';
    recommendation: string;
    example: string;
  }>;
}>> {
  return get(`/api/resumes/${resumeId}/analysis`);
}

export const resumeApi = {
  getResumes,
  getResume,
  uploadResume,
  deleteResume,
  getResumeAnalysis,
};

export default resumeApi;
