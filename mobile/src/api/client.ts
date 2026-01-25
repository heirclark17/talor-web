import { API_BASE_URL } from '../utils/constants';
import { getUserId } from '../utils/userSession';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Base fetch with auth headers
const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const userId = await getUserId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-User-ID': userId,
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
};

// API client
export const api = {
  // Resume endpoints
  async getResumes(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/resumes');
      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getResume(resumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/resumes/${resumeId}`);
      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async uploadResume(formData: FormData): Promise<ApiResponse> {
    try {
      const userId = await getUserId();
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'X-User-ID': userId,
        },
        body: formData,
      });
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async deleteResume(resumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Tailor endpoints
  async tailorResume(params: {
    baseResumeId: number;
    jobUrl?: string;
    company?: string;
    jobTitle?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/tailor', {
        method: 'POST',
        body: JSON.stringify({
          base_resume_id: params.baseResumeId,
          job_url: params.jobUrl,
          company: params.company,
          job_title: params.jobTitle,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async extractJobDetails(jobUrl: string): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/job/extract', {
        method: 'POST',
        body: JSON.stringify({ job_url: jobUrl }),
      });
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async getTailoredResume(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/tailor/tailored/${tailoredResumeId}`);
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Interview Prep endpoints
  async getInterviewPrep(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${tailoredResumeId}`);
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async generateInterviewPrep(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/generate`, {
        method: 'POST',
        body: JSON.stringify({ tailored_resume_id: tailoredResumeId }),
      });
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async listInterviewPreps(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/list');
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // Saved Comparisons
  async getSavedComparisons(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/saved-comparisons/list');
      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async saveComparison(params: {
    tailoredResumeId: number;
    title: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/saved-comparisons/save', {
        method: 'POST',
        body: JSON.stringify({
          tailored_resume_id: params.tailoredResumeId,
          title: params.title,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async deleteComparison(comparisonId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/saved-comparisons/${comparisonId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // STAR Stories
  async getStarStories(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/star-stories/list');
      const data = await response.json();
      return { success: response.ok, data, error: data.error };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  async deleteStarStory(storyId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/star-stories/${storyId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { success: response.ok, ...data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};
