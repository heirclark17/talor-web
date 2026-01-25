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
    'X-User-ID': userId,
    ...options.headers,
  };

  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

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
      const response = await fetchWithAuth('/api/resumes/list');
      const json = await response.json();
      // Backend returns {"resumes": [...]}
      const data = json.resumes || [];
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching resumes:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async getResume(resumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/resumes/${resumeId}`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching resume:', error);
      return { success: false, error: error.message };
    }
  },

  async uploadResume(formData: FormData): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/resumes/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteResume(resumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/resumes/${resumeId}/delete`, {
        method: 'POST',
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting resume:', error);
      return { success: false, error: error.message };
    }
  },

  // Job extraction
  async extractJobDetails(jobUrl: string): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/jobs/extract', {
        method: 'POST',
        body: JSON.stringify({ job_url: jobUrl }),
      });
      const data = await response.json();
      // Backend returns {success, company, job_title, description, ...}
      return {
        success: data.success !== false,
        data: {
          company: data.company,
          title: data.job_title,
          description: data.description,
          location: data.location,
          salary: data.salary,
        },
      };
    } catch (error: any) {
      console.error('Error extracting job:', error);
      return { success: false, error: error.message };
    }
  },

  // Tailoring endpoints
  async tailorResume(params: {
    baseResumeId: number;
    jobUrl?: string;
    company?: string;
    jobTitle?: string;
  }): Promise<ApiResponse> {
    try {
      console.log('API: Sending tailor request to /api/tailor/tailor');
      const response = await fetchWithAuth('/api/tailor/tailor', {
        method: 'POST',
        body: JSON.stringify({
          base_resume_id: params.baseResumeId,
          job_url: params.jobUrl,
          company: params.company,
          job_title: params.jobTitle,
        }),
      });

      console.log('API: Tailor response status:', response.status);
      const data = await response.json();
      console.log('API: Tailor response data:', data);

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.detail || `Server error: ${response.status}`
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error tailoring resume:', error);
      return { success: false, error: error.message };
    }
  },

  async getTailoredResume(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/tailor/tailored/${tailoredResumeId}`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching tailored resume:', error);
      return { success: false, error: error.message };
    }
  },

  async updateTailoredResume(
    tailoredResumeId: number,
    updates: {
      summary?: string;
      competencies?: string[];
      experience?: any[];
      alignment_statement?: string;
    }
  ): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/tailor/tailored/${tailoredResumeId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error updating tailored resume:', error);
      return { success: false, error: error.message };
    }
  },

  async listTailoredResumes(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/tailor/list');
      const json = await response.json();
      // Backend returns {"tailored_resumes": [...]}
      const data = json.tailored_resumes || [];
      return { success: true, data };
    } catch (error: any) {
      console.error('Error fetching tailored resumes:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async downloadTailoredResume(tailoredResumeId: number): Promise<string> {
    const response = await fetchWithAuth(`/api/tailor/download/${tailoredResumeId}`);
    if (!response.ok) {
      throw new Error('Failed to download resume');
    }
    return response.url;
  },

  // Interview prep endpoints
  async generateInterviewPrep(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(
        `/api/interview-prep/generate/${tailoredResumeId}`,
        { method: 'POST' }
      );
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating interview prep:', error);
      return { success: false, error: error.message };
    }
  },

  async getInterviewPrep(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${tailoredResumeId}`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching interview prep:', error);
      return { success: false, error: error.message };
    }
  },

  async listInterviewPreps(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/list');
      const data = await response.json();
      // Backend returns array directly
      const preps = Array.isArray(data) ? data : [];
      return { success: true, data: preps };
    } catch (error: any) {
      console.error('Error fetching interview preps:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async deleteInterviewPrep(interviewPrepId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${interviewPrepId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting interview prep:', error);
      return { success: false, error: error.message };
    }
  },

  // Saved comparisons endpoints
  async getSavedComparisons(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/saved-comparisons/list');
      const data = await response.json();
      // Backend returns array directly
      const comparisons = Array.isArray(data) ? data : [];
      return { success: true, data: comparisons };
    } catch (error: any) {
      console.error('Error fetching saved comparisons:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async getSavedComparison(comparisonId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/saved-comparisons/${comparisonId}`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching saved comparison:', error);
      return { success: false, error: error.message };
    }
  },

  async saveComparison(params: {
    tailoredResumeId: number;
    title: string;
    notes?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/saved-comparisons/save', {
        method: 'POST',
        body: JSON.stringify({
          tailored_resume_id: params.tailoredResumeId,
          title: params.title,
          notes: params.notes,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error saving comparison:', error);
      return { success: false, error: error.message };
    }
  },

  async updateComparison(
    comparisonId: number,
    updates: {
      title?: string;
      notes?: string;
      is_pinned?: boolean;
      tags?: string[];
    }
  ): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/saved-comparisons/${comparisonId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error updating comparison:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteComparison(comparisonId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/saved-comparisons/${comparisonId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting comparison:', error);
      return { success: false, error: error.message };
    }
  },

  // Resume analysis endpoints
  async analyzeAll(tailoredResumeId: number, forceRefresh = false): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/resume-analysis/analyze-all', {
        method: 'POST',
        body: JSON.stringify({
          tailored_resume_id: tailoredResumeId,
          force_refresh: forceRefresh,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      return { success: false, error: error.message };
    }
  },

  async analyzeChanges(
    baseResumeId: number,
    tailoredResumeId: number
  ): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/resume-analysis/analyze-changes', {
        method: 'POST',
        body: JSON.stringify({
          base_resume_id: baseResumeId,
          tailored_resume_id: tailoredResumeId,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error analyzing changes:', error);
      return { success: false, error: error.message };
    }
  },

  async analyzeKeywords(resumeContent: string, jobDescription: string): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/resume-analysis/analyze-keywords', {
        method: 'POST',
        body: JSON.stringify({
          resume_content: resumeContent,
          job_description: jobDescription,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error analyzing keywords:', error);
      return { success: false, error: error.message };
    }
  },

  async calculateMatchScore(
    tailoredResumeId: number,
    jobDescription: string
  ): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/resume-analysis/match-score', {
        method: 'POST',
        body: JSON.stringify({
          tailored_resume_id: tailoredResumeId,
          job_description: jobDescription,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error calculating match score:', error);
      return { success: false, error: error.message };
    }
  },

  // STAR stories endpoints
  async createStarStory(params: {
    situation: string;
    task: string;
    action: string;
    result: string;
    tags?: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/star-stories/', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error creating STAR story:', error);
      return { success: false, error: error.message };
    }
  },

  async listStarStories(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/star-stories/list');
      const data = await response.json();
      const stories = Array.isArray(data) ? data : [];
      return { success: true, data: stories };
    } catch (error: any) {
      console.error('Error fetching STAR stories:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async getStarStory(storyId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/star-stories/${storyId}`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching STAR story:', error);
      return { success: false, error: error.message };
    }
  },

  async updateStarStory(
    storyId: number,
    updates: {
      situation?: string;
      task?: string;
      action?: string;
      result?: string;
      tags?: string[];
    }
  ): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/star-stories/${storyId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error updating STAR story:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteStarStory(storyId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/star-stories/${storyId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting STAR story:', error);
      return { success: false, error: error.message };
    }
  },

  // Career path endpoints
  async researchCareerPath(params: {
    currentRole: string;
    targetRole: string;
    industry?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/career-path/research', {
        method: 'POST',
        body: JSON.stringify({
          current_role: params.currentRole,
          target_role: params.targetRole,
          industry: params.industry,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error researching career path:', error);
      return { success: false, error: error.message };
    }
  },

  async generateCareerPlan(params: {
    currentRole: string;
    targetRole: string;
    resumeId?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/career-path/generate', {
        method: 'POST',
        body: JSON.stringify({
          current_role: params.currentRole,
          target_role: params.targetRole,
          resume_id: params.resumeId,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating career plan:', error);
      return { success: false, error: error.message };
    }
  },

  async getCareerPlan(planId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/career-path/${planId}`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching career plan:', error);
      return { success: false, error: error.message };
    }
  },

  async listCareerPlans(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/career-path/');
      const data = await response.json();
      const plans = Array.isArray(data) ? data : [];
      return { success: true, data: plans };
    } catch (error: any) {
      console.error('Error fetching career plans:', error);
      return { success: false, data: [], error: error.message };
    }
  },

  async deleteCareerPlan(planId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/career-path/${planId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting career plan:', error);
      return { success: false, error: error.message };
    }
  },
};
