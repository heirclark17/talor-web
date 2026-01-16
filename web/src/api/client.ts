/**
 * Web API Client - Direct HTTP calls to Railway backend
 * Replaces Electron IPC calls for web deployment
 */

import { getUserId } from '../utils/userSession';

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
      const response = await fetch(`${this.baseUrl}/api/health`);
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

      const response = await fetch(`${this.baseUrl}/api/resumes/upload`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: formData,
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
   * List all uploaded resumes
   */
  async listResumes(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/list`, {
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
