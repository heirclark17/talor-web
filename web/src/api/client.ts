/**
 * Web API Client - Direct HTTP calls to Railway backend
 * Replaces Electron IPC calls for web deployment
 */

import { getUserId } from '../utils/userSession';

/**
 * Convert snake_case keys to camelCase recursively
 * Handles nested objects and arrays
 */
function snakeToCamel(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }

  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        converted[camelKey] = snakeToCamel(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}

// Use relative path in development (will be proxied by Vite), full URL in production
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'https://resume-ai-backend-production-3134.up.railway.app');

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get common headers with user ID
   */
  private getHeaders(additionalHeaders?: Record<string, string>): HeadersInit {
    return {
      'X-User-ID': getUserId(),
      ...additionalHeaders,
    };
  }

  /**
   * Backend health check
   */
  async backendHealth(): Promise<{ ready: boolean; data?: any; error?: string }> {
    try {
      // Backend health endpoint is at /health, not /api/health
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return { ready: response.ok, data };
    } catch (error: any) {
      return { ready: false, error: error.message };
    }
  }

  /**
   * Upload resume file
   */
  async uploadResume(file: File): Promise<ApiResponse> {
    try {
      const formData = new FormData();
      // Backend expects 'file' not 'resume'
      formData.append('file', file);

      const userId = getUserId();
      console.log(`[API] Uploading resume: ${file.name} (${file.size} bytes) for user: ${userId}`);

      const response = await fetch(`${this.baseUrl}/api/resumes/upload`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`[API] Upload failed: HTTP ${response.status}`, data);
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      console.log(`[API] Upload successful: Resume ID ${data.resume_id}`);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('[API] Upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List all uploaded resumes
   */
  async listResumes(): Promise<ApiResponse> {
    try {
      const userId = getUserId();
      console.log(`[API] Listing resumes for user: ${userId}`);

      const response = await fetch(`${this.baseUrl}/api/resumes/list`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        console.error(`[API] List resumes failed: HTTP ${response.status}`, data);
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      console.log(`[API] Found ${data.resumes?.length || 0} resumes`);
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      console.error('[API] List resumes error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get specific resume by ID
   */
  async getResume(resumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/${resumeId}`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete resume by ID
   */
  async deleteResume(resumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/${resumeId}/delete`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze a resume for strengths, weaknesses, and improvement recommendations
   */
  async analyzeResume(resumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/${resumeId}/analyze`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract job details from URL (company name, job title, description)
   */
  async extractJobDetails(jobUrl: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/jobs/extract`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ job_url: jobUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data, // Expected: { company, job_title, description }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Tailor resume for specific job
   */
  async tailorResume(tailorData: {
    baseResumeId: number;
    jobUrl?: string;
    company?: string;
    jobTitle?: string;
    jobDescription?: string;
  }): Promise<ApiResponse> {
    try {
      // Convert camelCase to snake_case for backend
      const backendData = {
        base_resume_id: tailorData.baseResumeId,
        job_url: tailorData.jobUrl,
        company: tailorData.company,
        job_title: tailorData.jobTitle,
        job_description: tailorData.jobDescription,
      };

      const response = await fetch(`${this.baseUrl}/api/tailor/tailor`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(backendData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Tailor resume for multiple jobs (batch)
   */
  async tailorResumeBatch(tailorData: {
    baseResumeId: number;
    jobUrls: string[];
  }): Promise<ApiResponse> {
    try {
      // Validate max 10 URLs
      if (tailorData.jobUrls.length > 10) {
        return {
          success: false,
          error: 'Maximum 10 job URLs allowed',
        };
      }

      // Convert camelCase to snake_case for backend
      const backendData = {
        base_resume_id: tailorData.baseResumeId,
        job_urls: tailorData.jobUrls,
      };

      const response = await fetch(`${this.baseUrl}/api/tailor/tailor/batch`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(backendData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate interview prep for a tailored resume
   */
  async generateInterviewPrep(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/generate/${tailoredResumeId}`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get existing interview prep for a tailored resume
   */
  async getInterviewPrep(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${tailoredResumeId}`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get app version (web version)
   */
  async getAppVersion(): Promise<string> {
    return '1.0.0-web';
  }

  // =========================================================================
  // INTERVIEW INTELLIGENCE METHODS (Sales Navigator Features)
  // =========================================================================

  /**
   * Score content relevance to specific job
   */
  async scoreContentRelevance(data: {
    content_items: any[];
    job_description: string;
    job_title: string;
    content_type?: 'strategy' | 'news';
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/score-relevance`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate talking points for interview
   */
  async generateTalkingPoints(data: {
    content: any;
    job_description: string;
    job_title: string;
    company_name: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/generate-talking-points`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze job alignment
   */
  async analyzeJobAlignment(data: {
    company_research: any;
    job_description: string;
    job_title: string;
    company_name: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/analyze-job-alignment`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate interview readiness score
   */
  async calculateInterviewReadiness(data: {
    prep_data: any;
    sections_completed: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/calculate-readiness`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate values alignment scorecard
   */
  async generateValuesAlignment(data: {
    stated_values: any[];
    candidate_background: string;
    job_description: string;
    company_name: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/values-alignment`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate job-specific practice questions
   */
  async generatePracticeQuestions(data: {
    interview_prep_id: number;
    num_questions?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/interview-prep/generate-practice-questions`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate STAR story for a practice question
   */
  async generateStarStory(data: {
    interview_prep_id: number;
    question: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/interview-prep/generate-practice-star-story`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Save practice question response
   */
  async savePracticeResponse(data: {
    interview_prep_id: number;
    question_text: string;
    question_category?: string;
    star_story?: any;
    audio_recording_url?: string;
    video_recording_url?: string;
    written_answer?: string;
    practice_duration_seconds?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/interview-prep/save-practice-response`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get practice responses for interview prep
   */
  async getPracticeResponses(interviewPrepId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/interview-prep/practice-responses/${interviewPrepId}`,
        {
          headers: this.getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate career path plan (ASYNC - uses Perplexity + OpenAI)
   * Returns job_id immediately, poll getCareerPlanJobStatus for results
   */
  async generateCareerPlanAsync(intake: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/generate-async`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intake }),
      });

      const result = await response.json();

      if (!response.ok) {
        // For 422 validation errors, include detailed error info
        let errorMsg = result.detail || result.error || `HTTP ${response.status}: ${response.statusText}`;

        // If there's a detail array (FastAPI validation errors), format it
        if (Array.isArray(result.detail)) {
          const validationErrors = result.detail.map((err: any) =>
            `${err.loc?.join('.') || 'field'}: ${err.msg}`
          ).join('; ');
          errorMsg = `Validation errors: ${validationErrors}`;
        }

        return {
          success: false,
          error: errorMsg,
          data: result, // Include full result for debugging
        };
      }

      return {
        success: true,
        data: result, // Contains: { success: true, job_id: "...", message: "..." }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get status of async career plan generation job
   * Poll this endpoint until status === 'completed' or 'failed'
   */
  async getCareerPlanJobStatus(jobId: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/job/${jobId}`, {
        headers: this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Convert snake_case keys from backend to camelCase for frontend
      const convertedResult = {
        ...result,
        plan: result.plan ? snakeToCamel(result.plan) : null,
        planId: result.plan_id || result.planId,
      };

      return {
        success: true,
        data: convertedResult,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate career path plan (SYNCHRONOUS - legacy, skips Perplexity research)
   * Use generateCareerPlanAsync for better results with web research
   */
  async generateCareerPlan(intake: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/generate`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intake }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Convert snake_case keys from backend to camelCase for frontend
      const convertedResult = {
        ...result,
        plan: result.plan ? snakeToCamel(result.plan) : null,
        planId: result.plan_id || result.planId,
      };

      return {
        success: true,
        data: convertedResult,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get career plan by ID
   */
  async getCareerPlan(planId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/${planId}`, {
        headers: this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List all career plans
   */
  async listCareerPlans(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/`, {
        headers: this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Refresh events for a career plan
   */
  async refreshCareerPlanEvents(planId: number, location: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/refresh-events`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id: planId, location }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete career plan
   */
  async deleteCareerPlan(planId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/${planId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteAllCareerPlans(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/all`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Auto-generate typical tasks for a job role.
   * When experienceBullets are provided, extracts tasks from the actual resume.
   * Otherwise generates generic tasks with Perplexity AI.
   */
  async generateTasksForRole(roleTitle: string, industry?: string, experienceBullets?: string[]): Promise<ApiResponse> {
    try {
      const body: Record<string, any> = {
        role_title: roleTitle,
        industry: industry || ''
      }
      if (experienceBullets && experienceBullets.length > 0) {
        body.experience_bullets = experienceBullets
      }

      const response = await fetch(`${this.baseUrl}/api/career-path/generate-tasks`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // =========================================================================
  // INTERVIEW PREP MANAGEMENT METHODS
  // =========================================================================

  /**
   * Delete an interview prep by ID
   */
  async deleteInterviewPrep(prepId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List all interview preps for the user
   */
  async listInterviewPreps(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/list`, {
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate behavioral and technical questions for interview prep
   */
  async generateBehavioralTechnicalQuestions(data: {
    job_title: string;
    company_name: string;
    tailored_resume_id: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/interview-prep/generate-behavioral-technical-questions`,
        {
          method: 'POST',
          headers: {
            ...this.getHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.data || result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // =========================================================================
  // COMPANY RESEARCH METHODS
  // =========================================================================

  /**
   * Get company research data
   */
  async getCompanyResearch(companyName: string, industry?: string, jobTitle?: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/company-research`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: companyName,
          industry: industry || null,
          job_title: jobTitle || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get company news
   */
  async getCompanyNews(companyName: string, industry?: string, jobTitle?: string, daysBack?: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/company-news`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: companyName,
          industry: industry || null,
          job_title: jobTitle || null,
          days_back: daysBack || 90,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get company values
   */
  async getCompanyValues(companyName: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/company-values`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ company_name: companyName }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get interview questions for a company/role
   */
  async getInterviewQuestions(companyName: string, jobTitle?: string, maxQuestions?: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/interview-questions`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_name: companyName,
          job_title: jobTitle || null,
          role_category: null,
          max_questions: maxQuestions || 30,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // =========================================================================
  // RESUME ANALYSIS METHODS
  // =========================================================================

  /**
   * Export resume analysis as PDF or DOCX
   */
  async exportResumeAnalysis(tailoredResumeId: number, format: 'pdf' | 'docx'): Promise<ApiResponse<Blob>> {
    try {
      console.log(`[API] Exporting resume ${tailoredResumeId} as ${format}`);

      const response = await fetch(`${this.baseUrl}/api/resume-analysis/export`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tailored_resume_id: tailoredResumeId,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[API] Export failed: HTTP ${response.status}`, errorData);
        return {
          success: false,
          error: errorData.detail || errorData.error || `HTTP ${response.status}: Export failed`,
        };
      }

      const blob = await response.blob();
      console.log(`[API] Export successful: ${blob.size} bytes`);
      return {
        success: true,
        data: blob,
      };
    } catch (error: any) {
      console.error('[API] Export error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Analyze all aspects of a tailored resume (combined endpoint with caching)
   * Returns analysis, keywords, and match score in one call
   */
  async analyzeAll(tailoredResumeId: number, forceRefresh: boolean = false): Promise<ApiResponse<{
    analysis: any;
    keywords: any;
    match_score: any;
    cached: boolean;
    elapsed_seconds: number;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resume-analysis/analyze-all`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tailored_resume_id: tailoredResumeId,
          force_refresh: forceRefresh,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Clear analysis cache for a tailored resume (to force re-analysis)
   */
  async clearAnalysisCache(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resume-analysis/cache/${tailoredResumeId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // =========================================================================
  // STAR STORIES METHODS
  // =========================================================================

  /**
   * List all STAR stories for the user
   */
  async listStarStories(tailoredResumeId?: number): Promise<ApiResponse> {
    try {
      const url = tailoredResumeId
        ? `${this.baseUrl}/api/star-stories/list?tailored_resume_id=${tailoredResumeId}`
        : `${this.baseUrl}/api/star-stories/list`;

      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.stories || data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Create a new STAR story
   */
  async createStarStory(storyData: {
    tailored_resume_id: number;
    title: string;
    story_theme?: string;
    company_context?: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    key_themes?: string[];
    talking_points?: string[];
    experience_indices?: number[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/star-stories/`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.story || data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update a STAR story
   */
  async updateStarStory(storyId: number, storyData: {
    title?: string;
    situation?: string;
    task?: string;
    action?: string;
    result?: string;
    key_themes?: string[];
    talking_points?: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/star-stories/${storyId}`, {
        method: 'PUT',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a STAR story
   */
  async deleteStarStory(storyId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/star-stories/${storyId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate a STAR story using AI from selected experiences
   */
  async generateStarStoryFromExperience(data: {
    tailored_resume_id: number;
    experience_indices: number[];
    story_theme: string;
    tone?: string;
    company_context?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/generate-star-story`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result.story || result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // =========================================================================
  // SAVED COMPARISONS METHODS
  // =========================================================================

  /**
   * Save a resume comparison
   */
  async saveComparison(data: {
    tailored_resume_id: number;
    title?: string;
    tags?: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/saved-comparisons/save`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * List all saved comparisons
   */
  async listSavedComparisons(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/saved-comparisons/list`, {
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get a specific saved comparison
   */
  async getSavedComparison(comparisonId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/saved-comparisons/${comparisonId}`, {
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update a saved comparison
   */
  async updateSavedComparison(comparisonId: number, data: {
    title?: string;
    is_pinned?: boolean;
    tags?: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/saved-comparisons/${comparisonId}`, {
        method: 'PUT',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Delete a saved comparison
   */
  async deleteSavedComparison(comparisonId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/saved-comparisons/${comparisonId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // =========================================================================
  // CERTIFICATION RECOMMENDATIONS METHODS
  // =========================================================================

  /**
   * Get certification recommendations for a role
   */
  async getCertificationRecommendations(interviewPrepId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/certifications/recommend`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interview_prep_id: interviewPrepId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.certifications || data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // =========================================================================
  // TAILORED RESUME METHODS
  // =========================================================================

  /**
   * Get a specific tailored resume
   */
  async getTailoredResume(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tailor/tailored/${tailoredResumeId}`, {
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Update a tailored resume (summary, skills, alignment)
   */
  async updateTailoredResume(tailoredResumeId: number, updateData: {
    summary?: string;
    competencies?: string[];
    alignment_statement?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tailoring/tailored/${tailoredResumeId}`, {
        method: 'PUT',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Export singleton instance
export const api = new ApiClient();

// For compatibility with Electron IPC interface
export const createWebIPC = () => ({
  getAppVersion: () => api.getAppVersion(),
  backendHealth: () => api.backendHealth(),
  openFileDialog: () => {
    // This will be handled by file input in components
    return Promise.resolve({ canceled: true });
  },
  uploadResume: async (file: File) => api.uploadResume(file),
  listResumes: () => api.listResumes(),
  getResume: (resumeId: number) => api.getResume(resumeId),
  deleteResume: (resumeId: number) => api.deleteResume(resumeId),
  tailorResume: (tailorData: any) => api.tailorResume(tailorData),
});
