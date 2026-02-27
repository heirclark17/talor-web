/**
 * Cover Letter API - Generate, CRUD, export
 */
import { api } from './client'
import { post, get, ApiResponse } from './base'

export const coverLetterApi = {
  list: () => api.listCoverLetters(),
  generate: (params: { jobTitle: string; companyName: string; jobDescription?: string; jobUrl?: string; tone?: 'professional' | 'enthusiastic' | 'strategic' | 'technical'; length?: 'concise' | 'standard' | 'detailed'; focus?: 'leadership' | 'technical' | 'program_management' | 'cross_functional'; tailoredResumeId?: number; baseResumeId?: number }) => api.generateCoverLetter(params),
  update: (id: number, params: { content?: string; tone?: string }) => api.updateCoverLetter(id, params),
  delete: (id: number) => api.deleteCoverLetter(id),
  export: (id: number, format: 'docx' = 'docx') => api.exportCoverLetter(id, format),

  /**
   * Start async cover letter generation. Returns { jobId }.
   * Poll with getJobStatus().
   */
  generateAsync: (params: {
    jobTitle: string;
    companyName: string;
    jobDescription?: string;
    jobUrl?: string;
    tone?: string;
    length?: string;
    focus?: string;
    tailoredResumeId?: number;
    baseResumeId?: number;
  }): Promise<ApiResponse<{ jobId: string }>> =>
    post<{ jobId: string }>('/api/cover-letters/generate-async', {
      job_title: params.jobTitle,
      company_name: params.companyName,
      job_description: params.jobDescription,
      job_url: params.jobUrl,
      tone: params.tone,
      length: params.length,
      focus: params.focus,
      tailored_resume_id: params.tailoredResumeId,
      base_resume_id: params.baseResumeId,
    }),

  /**
   * Poll status of an async cover letter generation job.
   */
  getJobStatus: (jobId: string): Promise<ApiResponse<{
    status: string;
    progress: number;
    message: string;
    result?: unknown;
    error?: string;
  }>> => get(`/api/cover-letters/job/${jobId}`),
}
