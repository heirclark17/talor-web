/**
 * Tailor API Module
 * Handles resume tailoring and job extraction
 */

import { get, post, ApiResponse, fetchWithAuth, snakeToCamel } from './base';

export interface JobDetails {
  company: string;
  title: string;
  description: string;
  location?: string;
  salary?: string;
}

export interface TailoredResume {
  id: number;
  resumeId: number;
  jobTitle: string;
  company: string;
  createdAt: string;
  matchScore?: number;
  tailoredContent?: Record<string, unknown>;
  originalContent?: Record<string, unknown>;
  jobDescription?: string;
  keywords?: string[];
  changeExplanation?: string;
}

export interface TailorRequest {
  baseResumeId: number;
  jobUrl?: string;
  company?: string;
  jobTitle?: string;
  jobDescription?: string;
}

export interface BatchTailorRequest {
  baseResumeId: number;
  jobUrls: string[];
}

export interface BatchTailorResult {
  successful: TailoredResume[];
  failed: Array<{
    jobUrl: string;
    error: string;
  }>;
}

/**
 * Extract job details from a URL
 */
export async function extractJobDetails(jobUrl: string): Promise<ApiResponse<JobDetails>> {
  try {
    const response = await fetchWithAuth('/api/jobs/extract', {
      method: 'POST',
      body: { job_url: jobUrl },
    });
    const data = await response.json();

    if (!response.ok || data.success === false) {
      return {
        success: false,
        error: data.error || 'Failed to extract job details',
      };
    }

    return {
      success: true,
      data: {
        company: data.company,
        title: data.job_title,
        description: data.description,
        location: data.location,
        salary: data.salary,
      },
    };
  } catch (error) {
    console.error('Error extracting job:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Tailor a resume for a specific job
 */
export async function tailorResume(params: TailorRequest): Promise<ApiResponse<TailoredResume>> {
  try {
    const response = await fetchWithAuth('/api/tailor/tailor', {
      method: 'POST',
      body: {
        base_resume_id: params.baseResumeId,
        job_url: params.jobUrl,
        company: params.company,
        job_title: params.jobTitle,
        job_description: params.jobDescription,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.detail || `Server error: ${response.status}`,
      };
    }

    return { success: true, data: snakeToCamel<TailoredResume>(data) };
  } catch (error) {
    console.error('Error tailoring resume:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get a tailored resume by ID
 */
export async function getTailoredResume(tailoredResumeId: number): Promise<ApiResponse<TailoredResume>> {
  return get<TailoredResume>(`/api/tailor/tailored/${tailoredResumeId}`);
}

/**
 * Get all tailored resumes for a base resume
 */
export async function getTailoredResumes(baseResumeId?: number): Promise<ApiResponse<TailoredResume[]>> {
  const endpoint = baseResumeId
    ? `/api/tailor/tailored-resumes?base_resume_id=${baseResumeId}`
    : '/api/tailor/tailored-resumes';
  return get<TailoredResume[]>(endpoint);
}

/**
 * Batch tailor resume for multiple jobs (max 10)
 */
export async function tailorResumeBatch(params: BatchTailorRequest): Promise<ApiResponse<BatchTailorResult>> {
  if (params.jobUrls.length > 10) {
    return {
      success: false,
      error: 'Maximum 10 job URLs allowed',
    };
  }

  return post<BatchTailorResult>('/api/tailor/batch', {
    base_resume_id: params.baseResumeId,
    job_urls: params.jobUrls,
  });
}

/**
 * Get keywords analysis for a tailored resume
 */
export async function getKeywordAnalysis(tailoredResumeId: number): Promise<ApiResponse<{
  matchedKeywords: string[];
  missingKeywords: string[];
  score: number;
  suggestions: string[];
}>> {
  return get(`/api/tailor/tailored/${tailoredResumeId}/keywords`);
}

/**
 * Update tailored resume content
 */
export async function updateTailoredResume(
  tailoredResumeId: number,
  updates: Partial<TailoredResume>
): Promise<ApiResponse<TailoredResume>> {
  return post<TailoredResume>(`/api/tailor/tailored/${tailoredResumeId}/update`, updates);
}

/**
 * Export tailored resume as PDF or DOCX
 */
export async function exportTailoredResume(
  tailoredResumeId: number,
  format: 'pdf' | 'docx'
): Promise<ApiResponse<{ url: string }>> {
  return get(`/api/tailor/tailored/${tailoredResumeId}/export?format=${format}`);
}

export interface SavedJob {
  id: number;
  jobUrl: string;
  company: string;
  jobTitle: string;
  createdAt: string;
}

/**
 * Get saved jobs, newest first
 */
export async function getSavedJobs(): Promise<ApiResponse<SavedJob[]>> {
  return get<SavedJob[]>('/api/jobs/saved');
}

/**
 * Save a job (upserts by URL)
 */
export async function saveJob(url: string, company: string, title: string): Promise<ApiResponse<SavedJob>> {
  return post<SavedJob>('/api/jobs/save', {
    job_url: url,
    company,
    job_title: title,
  });
}

/**
 * Delete a saved job
 */
export async function deleteSavedJob(jobId: number): Promise<ApiResponse<void>> {
  try {
    const response = await fetchWithAuth(`/api/jobs/saved/${jobId}`, {
      method: 'DELETE',
    });

    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || `Server error: ${response.status}` };
    }
    return { success: true, data: snakeToCamel(data) };
  } catch (error) {
    console.error('Error deleting saved job:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export const tailorApi = {
  extractJobDetails,
  tailorResume,
  getTailoredResume,
  getTailoredResumes,
  tailorResumeBatch,
  getKeywordAnalysis,
  updateTailoredResume,
  exportTailoredResume,
  getSavedJobs,
  saveJob,
  deleteSavedJob,
};

export default tailorApi;
