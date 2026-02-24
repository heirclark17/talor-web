import { API_BASE_URL } from '../utils/constants';
import { getUserId } from '../utils/userSession';
import { fetchWithAuth as secureFetchWithAuth, snakeToCamel as baseSnakeToCamel } from './base';
import { supabase } from '../lib/supabase';

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
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Convert snake_case to camelCase
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        converted[camelKey] = snakeToCamel(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Interview Readiness Score interface
export interface ReadinessScore {
  confidence_level: number;
  preparation_level: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
}

// Values Alignment interface
export interface ValuesAlignment {
  alignment_score: number;
  matched_values: Array<{
    value: string;
    company_context?: string;
    candidate_evidence?: string;
  }>;
  value_gaps: Array<{
    value: string;
    company_context?: string;
    suggestion?: string;
  }>;
  cultural_fit_insights: string;
}

// Company Research interface
export interface CompanyResearch {
  company_overview: string;
  recent_news: Array<{
    headline: string;
    date?: string;
    summary: string;
    source?: string;
    url?: string;
  }>;
  key_products_services: string[];
  competitors: Array<{
    name: string;
    context?: string;
  }>;
  financial_health: {
    summary: string;
    status: 'good' | 'fair' | 'poor';
  };
  employee_sentiment: {
    summary: string;
    rating?: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  };
}

// Strategic News interface
export interface StrategicNewsItem {
  headline: string;
  date: string;
  source: string;
  summary: string;
  relevance_to_interview: string;
  talking_points: string[];
}

export interface StrategicNews {
  news_items: StrategicNewsItem[];
}

// Competitive Intelligence interface
export interface CompetitiveIntelligence {
  market_position: string;
  competitive_advantages: string[];
  challenges: string[];
  differentiation_strategy: string;
  interview_angles: string[];
}

// Interview Strategy interface
export interface InterviewStrategy {
  recommended_approach: string;
  key_themes_to_emphasize: string[];
  stories_to_prepare: Array<{
    theme: string;
    description: string;
  }>;
  questions_to_ask_interviewer: string[];
  pre_interview_checklist: string[];
}

// Executive Insights interface
export interface ExecutiveInsights {
  executive_priorities: string[];
  leadership_style: string;
  decision_making_factors: string[];
  strategic_initiatives: string[];
  c_suite_talking_points: string[];
}

// Career Trajectory Analysis interface (Feature #13)
export interface CareerTrajectoryAnalysis {
  current_position_assessment: string;
  growth_potential: {
    score: number;
    factors: string[];
  };
  trajectory_path: Array<{
    role: string;
    timeline: string;
    requirements: string[];
  }>;
  recommended_next_steps: string[];
  market_insights: {
    demand: 'high' | 'medium' | 'low';
    salary_range: string;
    top_companies: string[];
  };
}

// Skill Gaps Analysis interface (Feature #14)
export interface SkillGapsAnalysis {
  identified_gaps: Array<{
    skill: string;
    importance: 'critical' | 'high' | 'medium' | 'low';
    current_level: 'none' | 'beginner' | 'intermediate' | 'advanced';
    target_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
  industry_demand: {
    trending_skills: string[];
    market_saturation: Record<string, 'high' | 'medium' | 'low'>;
  };
  learning_resources: Array<{
    skill: string;
    resources: Array<{
      type: 'course' | 'book' | 'certification' | 'bootcamp';
      title: string;
      provider: string;
      url?: string;
      cost?: string;
      duration?: string;
    }>;
  }>;
  priority_ranking: string[];
}

// Detailed Career Plan interface (Feature #15)
export interface DetailedCareerPlan {
  plan_id: number;
  summary: string;
  milestones: Array<{
    title: string;
    description: string;
    timeline: string;
    completion_criteria: string[];
  }>;
  action_items: Array<{
    category: string;
    task: string;
    priority: 'high' | 'medium' | 'low';
    deadline: string;
    resources: string[];
  }>;
  timeline_breakdown: {
    phase_1: { duration: string; focus: string; goals: string[] };
    phase_2: { duration: string; focus: string; goals: string[] };
    phase_3: { duration: string; focus: string; goals: string[] };
  };
  skill_development_path: Array<{
    skill: string;
    current_proficiency: number;
    target_proficiency: number;
    learning_plan: string[];
  }>;
}

// STAR Story Analysis interface (Feature #18)
export interface StarStoryAnalysis {
  overall_score: number;
  component_scores: {
    situation: { score: number; feedback: string };
    task: { score: number; feedback: string };
    action: { score: number; feedback: string };
    result: { score: number; feedback: string };
  };
  strengths: string[];
  areas_for_improvement: string[];
  impact_assessment: {
    quantifiable_results: boolean;
    leadership_demonstrated: boolean;
    problem_solving_shown: boolean;
  };
  suggestions: string[];
}

// Story Suggestions interface (Feature #19)
export interface StorySuggestions {
  improvement_tips: Array<{
    component: 'situation' | 'task' | 'action' | 'result';
    current_text: string;
    suggestion: string;
    reasoning: string;
  }>;
  alternative_framings: Array<{
    perspective: string;
    reframed_story: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
  }>;
  impact_enhancements: Array<{
    type: 'metrics' | 'scope' | 'leadership' | 'innovation';
    enhancement: string;
  }>;
  keyword_recommendations: string[];
}

// Story Variations interface (Feature #20)
export interface StoryVariations {
  variations: Array<{
    context: string;
    tone: string;
    story: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
    optimal_use_case: string;
  }>;
  usage_guide: {
    technical_interviews: string;
    behavioral_interviews: string;
    executive_presentations: string;
    networking_events: string;
  };
}

// Practice Response interfaces
export interface SavePracticeResponseRequest {
  interviewPrepId: number;
  questionText: string;
  questionCategory?: string;
  starStory?: object;
  writtenAnswer?: string;
  practiceDurationSeconds?: number;
}

export interface SavePracticeResponseResponse {
  success: boolean;
  data: {
    id: number;
    times_practiced: number;
    message: string;
  };
}

// Practice History interfaces
export interface PracticeHistoryItem {
  id: number;
  question_text: string;
  question_category?: string;
  response_text?: string;
  star_story?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  practiced_at: string;
  duration_seconds?: number;
  times_practiced: number;
}

// Resume Analysis interfaces
export interface KeywordOptimization {
  score: number;
  missing_keywords: string[];
  suggestions: string;
}

export interface ATSCompatibility {
  score: number;
  issues: string[];
  recommendations: string;
}

export interface ImprovementRecommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
  example: string;
}

export interface ResumeAnalysis {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  keyword_optimization: KeywordOptimization;
  ats_compatibility: ATSCompatibility;
  improvement_recommendations: ImprovementRecommendation[];
}

// Base fetch with auth headers - uses secure fetchWithAuth from base.ts
// This wrapper maintains backwards compatibility while ensuring all API calls
// go through security controls (host validation, rate limiting)
const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Convert RequestInit body to object for base.ts compatibility
  let body: object | FormData | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (typeof options.body === 'string') {
    try {
      body = JSON.parse(options.body);
    } catch {
      // If not JSON, pass as-is (shouldn't happen in normal usage)
      body = undefined;
    }
  }

  return secureFetchWithAuth(endpoint, {
    ...options,
    body,
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
      console.log('[UploadResume] Starting file upload via XMLHttpRequest');

      // Get auth token from Supabase (same pattern as base.ts fetchWithAuth)
      let token: string | null = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token ?? null;
      } catch (e) {
        console.warn('[UploadResume] Failed to get Supabase session:', e);
      }

      // Get user ID (same pattern as base.ts)
      let userId: string | null = null;
      try {
        userId = await getUserId();
      } catch (e) {
        console.warn('[UploadResume] Failed to get user ID:', e);
      }

      if (!token || !userId) {
        console.error('[UploadResume] Missing authentication credentials');
        return {
          success: false,
          error: 'Authentication required. Please sign in again.'
        };
      }

      console.log('[UploadResume] Auth credentials ready:', {
        hasToken: !!token,
        hasUserId: !!userId,
        tokenPrefix: token?.substring(0, 20),
      });

      // Use XMLHttpRequest instead of fetch for better iOS FormData + header support
      // Fetch on iOS has known issues with custom headers when uploading FormData
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();

        xhr.onload = () => {
          console.log('[UploadResume] XHR Response:', {
            status: xhr.status,
            statusText: xhr.statusText,
            bodyPreview: xhr.responseText.substring(0, 200),
          });

          try {
            const data = JSON.parse(xhr.responseText);

            if (xhr.status >= 200 && xhr.status < 300) {
              console.log('[UploadResume] Upload successful');
              resolve({ success: true, data });
            } else {
              const errorMsg = data?.error || data?.detail || data?.message || `Upload failed (${xhr.status})`;
              console.error('[UploadResume] Server error:', { status: xhr.status, data });
              resolve({ success: false, error: errorMsg });
            }
          } catch (e) {
            console.error('[UploadResume] Failed to parse JSON:', e);
            resolve({
              success: false,
              error: `Server error (${xhr.status}): ${xhr.responseText.substring(0, 100)}`
            });
          }
        };

        xhr.onerror = () => {
          console.error('[UploadResume] XHR network error');
          resolve({
            success: false,
            error: 'Network error during upload'
          });
        };

        xhr.ontimeout = () => {
          console.error('[UploadResume] XHR timeout');
          resolve({
            success: false,
            error: 'Upload timed out. Please try again.'
          });
        };

        // Open request
        xhr.open('POST', `${API_BASE_URL}/api/resumes/upload`);

        // Set headers AFTER open() - critical for iOS to properly send them
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('X-User-ID', userId);

        console.log('[UploadResume] Sending XHR with auth headers');

        // Set timeout (2 minutes)
        xhr.timeout = 120000;

        // Send FormData (Content-Type boundary is auto-generated by XMLHttpRequest)
        xhr.send(formData);
      });

    } catch (error: any) {
      console.error('[UploadResume] Upload failed:', error);
      return {
        success: false,
        error: error.message || 'Network error during upload'
      };
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

  // Batch tailoring - tailor resume for multiple jobs at once (max 10)
  async tailorResumeBatch(params: {
    baseResumeId: number;
    jobUrls: string[];
  }): Promise<ApiResponse> {
    try {
      // Validate max 10 URLs
      if (params.jobUrls.length > 10) {
        return {
          success: false,
          error: 'Maximum 10 job URLs allowed',
        };
      }

      const response = await fetchWithAuth('/api/tailor/tailor/batch', {
        method: 'POST',
        body: JSON.stringify({
          base_resume_id: params.baseResumeId,
          job_urls: params.jobUrls,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.detail || `Server error: ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error batch tailoring resume:', error);
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

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[API] Non-JSON response from interview-prep/list:', {
          status: response.status,
          contentType,
          preview: text.substring(0, 200),
        });

        // Extract error message from HTML/text if possible
        const errorMatch = text.match(/<title>(.*?)<\/title>/i) ||
                          text.match(/error[:\s]+([^<\n]+)/i) ||
                          text.match(/Internal Server Error/i);
        const errorMessage = errorMatch ? errorMatch[1] || errorMatch[0] : 'Server returned non-JSON response';

        return {
          success: false,
          data: [],
          error: `Backend error (${response.status}): ${errorMessage}. The interview prep endpoint may not be available.`
        };
      }

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          data: [],
          error: json.error || json.detail || `Server error: ${response.status}`,
        };
      }

      // Backend returns { success, count, interview_preps: [...] }
      const preps = json.interview_preps || [];
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
      if (response.status === 204) return { success: true, data: null };
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting interview prep:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate common interview questions with personalized answers
  async generateCommonQuestions(interviewPrepId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/common-questions/generate', {
        method: 'POST',
        body: JSON.stringify({ interview_prep_id: interviewPrepId }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating common questions:', error);
      return { success: false, error: error.message };
    }
  },

  // Regenerate a single common question with a new personalized answer
  async regenerateSingleQuestion(params: {
    interview_prep_id: number;
    question_id: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/common-questions/regenerate', {
        method: 'POST',
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error regenerating question:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate behavioral and technical interview questions
  async generateBehavioralTechnicalQuestions(interviewPrepId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/generate-behavioral-technical-questions', {
        method: 'POST',
        body: JSON.stringify({ interview_prep_id: interviewPrepId }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating behavioral/technical questions:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate STAR story for a specific experience
  async generateStarStory(params: {
    tailoredResumeId: number;
    experienceIndices: number[];
    storyTheme: string;
    tone?: string;
    companyContext?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/generate-star-story', {
        method: 'POST',
        body: JSON.stringify({
          tailored_resume_id: params.tailoredResumeId,
          experience_indices: params.experienceIndices,
          story_theme: params.storyTheme,
          tone: params.tone || 'professional',
          company_context: params.companyContext,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating STAR story:', error);
      return { success: false, error: error.message };
    }
  },

  // Get company research data
  async getCompanyResearch(params: {
    companyName: string;
    industry?: string;
    jobTitle?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/company-research', {
        method: 'POST',
        body: JSON.stringify({
          company_name: params.companyName,
          industry: params.industry,
          job_title: params.jobTitle,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching company research:', error);
      return { success: false, error: error.message };
    }
  },

  // Get company news
  async getCompanyNews(params: {
    companyName: string;
    industry?: string;
    jobTitle?: string;
    daysBack?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/company-news', {
        method: 'POST',
        body: JSON.stringify({
          company_name: params.companyName,
          industry: params.industry,
          job_title: params.jobTitle,
          days_back: params.daysBack || 90,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching company news:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate practice questions for an interview prep
  async generatePracticeQuestions(interviewPrepId: number, numQuestions?: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/generate-practice-questions', {
        method: 'POST',
        body: JSON.stringify({
          interview_prep_id: interviewPrepId,
          num_questions: numQuestions || 10,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating practice questions:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate STAR story for a practice question
  async generatePracticeStarStory(interviewPrepId: number, question: string): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/generate-practice-star-story', {
        method: 'POST',
        body: JSON.stringify({
          interview_prep_id: interviewPrepId,
          question: question,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating practice STAR story:', error);
      return { success: false, error: error.message };
    }
  },

  // Save practice response
  async savePracticeResponse(params: SavePracticeResponseRequest): Promise<ApiResponse<SavePracticeResponseResponse>> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/save-practice-response', {
        method: 'POST',
        body: JSON.stringify({
          interview_prep_id: params.interviewPrepId,
          question_text: params.questionText,
          question_category: params.questionCategory,
          star_story: params.starStory,
          written_answer: params.writtenAnswer,
          practice_duration_seconds: params.practiceDurationSeconds,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error saving practice response:', error);
      return { success: false, error: error.message };
    }
  },

  // Get practice responses for an interview prep
  async getPracticeResponses(interviewPrepId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/practice-responses/${interviewPrepId}`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching practice responses:', error);
      return { success: false, error: error.message };
    }
  },

  // Get practice history for an interview prep
  async getPracticeHistory(interviewPrepId: number): Promise<ApiResponse<PracticeHistoryItem[]>> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${interviewPrepId}/practice-history`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching practice history:', error);
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
      if (response.status === 204) return { success: true, data: null };
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting comparison:', error);
      return { success: false, error: error.message };
    }
  },

    // Base Resume Analysis endpoint
  async analyzeResume(resumeId: number): Promise<ApiResponse<ResumeAnalysis>> {
    try {
      const response = await fetchWithAuth('/api/resumes/analyze', {
        method: 'POST',
        body: JSON.stringify({ resume_id: resumeId }),
      });
      const data = await response.json();
      return { success: response.ok, data: data.analysis };
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
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
    tailored_resume_id?: number;
    experience_indices?: number[];
    title?: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    tags?: string[];
    key_themes?: string[];
    talking_points?: string[];
    probing_questions?: {
      situation: string[];
      action: string[];
      result: string[];
    };
    challenge_questions?: {
      situation: string[];
      action: string[];
      result: string[];
    };
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

  async listStarStories(tailoredResumeId?: number): Promise<ApiResponse> {
    try {
      const url = tailoredResumeId
        ? `/api/star-stories/list?tailored_resume_id=${tailoredResumeId}`
        : '/api/star-stories/list';
      const response = await fetchWithAuth(url);
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
      if (response.status === 204) return { success: true, data: null };
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting STAR story:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate STAR story from experience bullet points
  async generateStarStoryFromExperience(params: {
    experienceText: string;
    jobTitle?: string;
    companyName?: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/star-stories/generate-from-experience', {
        method: 'POST',
        body: JSON.stringify({
          experience_text: params.experienceText,
          job_title: params.jobTitle,
          company_name: params.companyName,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating STAR story from experience:', error);
      return { success: false, error: error.message };
    }
  },

  // Match STAR stories to interview questions
  async matchStarStoriesToQuestions(params: {
    questions: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/star-stories/match-to-questions', {
        method: 'POST',
        body: JSON.stringify({ questions: params.questions }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error matching STAR stories to questions:', error);
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

      // Convert snake_case keys to camelCase for frontend consistency
      const convertedResult = {
        ...data,
        plan: data.plan ? snakeToCamel(data.plan) : null,
        planId: data.plan_id || data.planId,
      };

      return { success: response.ok, data: convertedResult };
    } catch (error: any) {
      console.error('Error generating career plan:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate career path plan (ASYNC - uses Perplexity + OpenAI)
   * Returns job_id immediately, poll getCareerPlanJobStatus for results
   */
  async generateCareerPlanAsync(intake: any): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/career-path/generate-async', {
        method: 'POST',
        body: JSON.stringify({ intake }),
      });

      const result = await response.json();

      if (!response.ok) {
        // For 422 validation errors, include detailed error info
        let errorMsg = result.detail || result.error || `HTTP ${response.status}`;

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
          data: result,
        };
      }

      return {
        success: true,
        data: result, // Contains: { success: true, job_id: "...", message: "..." }
      };
    } catch (error: any) {
      console.error('Error generating async career plan:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get status of async career plan generation job
   * Poll this endpoint until status === 'completed' or 'failed'
   */
  async getCareerPlanJobStatus(jobId: string): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/career-path/job/${jobId}`);
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
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
      console.error('Error getting career plan job status:', error);
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
      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true, data: null };
      }
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting career plan:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteAllCareerPlans(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/career-path/', {
        method: 'DELETE',
      });
      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true, data: null };
      }
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error deleting all career plans:', error);
      return { success: false, error: error.message };
    }
  },

  // Certification recommendations
  async getCertificationRecommendations(interviewPrepId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/certifications/recommend', {
        method: 'POST',
        body: JSON.stringify({ interview_prep_id: interviewPrepId }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error getting certification recommendations:', error);
      return { success: false, error: error.message };
    }
  },

  // Export resume as PDF or DOCX
  async exportResume(tailoredResumeId: number, format: 'pdf' | 'docx' = 'pdf'): Promise<ApiResponse<string>> {
    try {
      const response = await fetchWithAuth('/api/resume-analysis/export', {
        method: 'POST',
        body: JSON.stringify({
          tailored_resume_id: tailoredResumeId,
          format: format,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.detail || 'Export failed' };
      }

      // Return the download URL or blob URL
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      return { success: true, data: url };
    } catch (error: any) {
      console.error('Error exporting resume:', error);
      return { success: false, error: error.message };
    }
  },

  // Interview readiness score
  async calculateReadiness(interviewPrepId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/calculate-readiness', {
        method: 'POST',
        body: JSON.stringify({ interview_prep_id: interviewPrepId }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error calculating readiness:', error);
      return { success: false, error: error.message };
    }
  },

  // Values alignment for interview
  async getValuesAlignment(interviewPrepId: number): Promise<ApiResponse<ValuesAlignment>> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${interviewPrepId}/values-alignment`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error getting values alignment:', error);
      return { success: false, error: error.message };
    }
  },

  // Save STAR story for a specific question
  async saveQuestionStarStory(params: {
    interviewPrepId: number;
    questionId: string;
    starStory: object;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/save-question-star-story', {
        method: 'POST',
        body: JSON.stringify({
          interview_prep_id: params.interviewPrepId,
          question_id: params.questionId,
          star_story: params.starStory,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error saving question STAR story:', error);
      return { success: false, error: error.message };
    }
  },

  // Get interview readiness score
  async getInterviewReadinessScore(prepId: number): Promise<ApiResponse<ReadinessScore>> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${prepId}/readiness-score`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching interview readiness score:', error);
      return { success: false, error: error.message };
    }
  },

  // Get company research for interview prep
  async getCompanyResearchForPrep(prepId: number): Promise<ApiResponse<CompanyResearch>> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${prepId}/company-research`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching company research:', error);
      return { success: false, error: error.message };
    }
  },

  // Get strategic news for interview prep
  async getStrategicNews(prepId: number): Promise<ApiResponse<StrategicNewsItem[]>> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${prepId}/strategic-news`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching strategic news:', error);
      return { success: false, error: error.message };
    }
  },

  // Get competitive intelligence for interview prep
  async getCompetitiveIntelligence(prepId: number): Promise<ApiResponse<CompetitiveIntelligence>> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${prepId}/competitive-intelligence`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching competitive intelligence:', error);
      return { success: false, error: error.message };
    }
  },

  // Get interview strategy for interview prep
  async getInterviewStrategy(prepId: number): Promise<ApiResponse<InterviewStrategy>> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${prepId}/interview-strategy`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching interview strategy:', error);
      return { success: false, error: error.message };
    }
  },

  // Get executive insights for interview prep
  async getExecutiveInsights(prepId: number): Promise<ApiResponse<ExecutiveInsights>> {
    try {
      const response = await fetchWithAuth(`/api/interview-prep/${prepId}/executive-insights`);
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching executive insights:', error);
      return { success: false, error: error.message };
    }
  },

  // Feature #13: Career Trajectory Analysis
  async analyzeCareerTrajectory(params: {
    resumeId: number;
    targetRole?: string;
    industry?: string;
  }): Promise<ApiResponse<CareerTrajectoryAnalysis>> {
    try {
      const response = await fetchWithAuth('/api/career/analyze-trajectory', {
        method: 'POST',
        body: JSON.stringify({
          resume_id: params.resumeId,
          target_role: params.targetRole,
          industry: params.industry,
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error analyzing career trajectory:', error);
      return { success: false, error: error.message };
    }
  },

  // Feature #14: Skill Gaps Analysis
  async getSkillGaps(params: {
    resumeId: number;
    targetRole: string;
  }): Promise<ApiResponse<SkillGapsAnalysis>> {
    try {
      const response = await fetchWithAuth('/api/career/skill-gaps', {
        method: 'GET',
        headers: {
          'X-Resume-ID': params.resumeId.toString(),
          'X-Target-Role': params.targetRole,
        },
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching skill gaps:', error);
      return { success: false, error: error.message };
    }
  },

  // Feature #15: Career Plan Generation (enhanced)
  async generateDetailedCareerPlan(params: {
    resumeId: number;
    currentRole: string;
    targetRole: string;
    timeline?: string;
  }): Promise<ApiResponse<DetailedCareerPlan>> {
    try {
      const response = await fetchWithAuth('/api/career/generate-plan', {
        method: 'POST',
        body: JSON.stringify({
          resume_id: params.resumeId,
          current_role: params.currentRole,
          target_role: params.targetRole,
          timeline: params.timeline || '6months',
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating career plan:', error);
      return { success: false, error: error.message };
    }
  },

  // Feature #16: Export Saved Items
  async exportSavedItems(format: 'pdf' | 'json' = 'json'): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetchWithAuth(`/api/saved/export?format=${format}`);

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.detail || 'Export failed' };
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error: any) {
      console.error('Error exporting saved items:', error);
      return { success: false, error: error.message };
    }
  },

  // Feature #17: Bulk Delete Saved Items
  async bulkDeleteSavedItems(comparisonIds: number[]): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/saved/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ comparison_ids: comparisonIds }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error bulk deleting saved items:', error);
      return { success: false, error: error.message };
    }
  },

  // Feature #18: STAR Story Analysis
  async analyzeStarStory(storyId: number): Promise<ApiResponse<StarStoryAnalysis>> {
    try {
      const response = await fetchWithAuth(`/api/star-stories/${storyId}/analyze`, {
        method: 'POST',
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error analyzing STAR story:', error);
      return { success: false, error: error.message };
    }
  },

  // Feature #19: Story Suggestions
  async getStorySuggestions(storyId: number): Promise<ApiResponse<StorySuggestions>> {
    try {
      const response = await fetchWithAuth(`/api/star-stories/${storyId}/suggestions`, {
        method: 'POST',
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error fetching story suggestions:', error);
      return { success: false, error: error.message };
    }
  },

  // Feature #20: Generate Story Variations
  async generateStoryVariations(params: {
    storyId: number;
    contexts: string[];
    tones?: string[];
  }): Promise<ApiResponse<StoryVariations>> {
    try {
      const response = await fetchWithAuth(`/api/star-stories/${params.storyId}/variations`, {
        method: 'POST',
        body: JSON.stringify({
          contexts: params.contexts,
          tones: params.tones || ['professional', 'conversational'],
        }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      console.error('Error generating story variations:', error);
      return { success: false, error: error.message };
    }
  },

  // =========================================================================
  // INTERVIEW INTELLIGENCE METHODS (matching web app)
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
      const response = await fetchWithAuth('/api/interview-prep/score-relevance', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error scoring content relevance:', error);
      return { success: false, error: error.message };
    }
  },

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
      const response = await fetchWithAuth('/api/interview-prep/generate-talking-points', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error generating talking points:', error);
      return { success: false, error: error.message };
    }
  },

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
      const response = await fetchWithAuth('/api/interview-prep/analyze-job-alignment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error analyzing job alignment:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Calculate interview readiness score (POST version)
   */
  async calculateInterviewReadiness(data: {
    prep_data: any;
    sections_completed: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/calculate-readiness', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error calculating interview readiness:', error);
      return { success: false, error: error.message };
    }
  },

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
      const response = await fetchWithAuth('/api/interview-prep/values-alignment', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.detail || result.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error generating values alignment:', error);
      return { success: false, error: error.message };
    }
  },

  // =========================================================================
  // ADDITIONAL CAREER PATH METHODS (matching web app)
  // =========================================================================

  /**
   * Refresh events for a career plan
   */
  async refreshCareerPlanEvents(planId: number, location: string): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/career-path/refresh-events', {
        method: 'POST',
        body: JSON.stringify({ plan_id: planId, location }),
      });
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error refreshing career plan events:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Auto-generate typical tasks for a job role using Perplexity AI
   */
  async generateTasksForRole(roleTitle: string, industry?: string, bullets?: string[]): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/career-path/generate-tasks', {
        method: 'POST',
        body: JSON.stringify({
          role_title: roleTitle,
          industry: industry || '',
          bullets: bullets || [],
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error generating tasks for role:', error);
      return { success: false, error: error.message };
    }
  },

  // =========================================================================
  // RESUME ANALYSIS CACHE METHODS (matching web app)
  // =========================================================================

  /**
   * Clear analysis cache for a tailored resume (to force re-analysis)
   */
  async clearAnalysisCache(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/resume-analysis/cache/${tailoredResumeId}`, {
        method: 'DELETE',
      });
      if (response.status === 204) return { success: true, data: null };
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error clearing analysis cache:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Export resume analysis as PDF or DOCX
   */
  async exportResumeAnalysis(tailoredResumeId: number, format: 'pdf' | 'docx'): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetchWithAuth('/api/resume-analysis/export', {
        method: 'POST',
        body: JSON.stringify({
          tailored_resume_id: tailoredResumeId,
          format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.detail || errorData.error || `HTTP ${response.status}`,
        };
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error: any) {
      console.error('Error exporting resume analysis:', error);
      return { success: false, error: error.message };
    }
  },

  // =========================================================================
  // COMPANY RESEARCH METHODS (matching web app)
  // =========================================================================

  /**
   * Get company values
   */
  async getCompanyValues(companyName: string): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/company-values', {
        method: 'POST',
        body: JSON.stringify({ company_name: companyName }),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: data.data || data };
    } catch (error: any) {
      console.error('Error fetching company values:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get interview questions for a company/role
   */
  async getInterviewQuestions(companyName: string, jobTitle?: string, maxQuestions?: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/interview-prep/interview-questions', {
        method: 'POST',
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

      return { success: true, data: data.data || data };
    } catch (error: any) {
      console.error('Error fetching interview questions:', error);
      return { success: false, error: error.message };
    }
  },

  // =========================================================================
  // APPLICATION TRACKER METHODS
  // =========================================================================

  /**
   * List all applications for the user
   */
  async listApplications(status?: string): Promise<ApiResponse> {
    try {
      const url = status ? `/api/applications?status=${status}` : '/api/applications';
      const response = await fetchWithAuth(url, { method: 'GET' });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: data.applications || [] };
    } catch (error: any) {
      console.error('Error listing applications:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get application statistics
   */
  async getApplicationStats(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/applications/stats', { method: 'GET' });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: data.stats || {} };
    } catch (error: any) {
      console.error('Error getting application stats:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get a single application by ID
   */
  async getApplication(applicationId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/applications/${applicationId}`, { method: 'GET' });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error getting application:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Create a new application
   */
  async createApplication(applicationData: {
    jobTitle: string;
    companyName: string;
    jobUrl?: string;
    status?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    appliedDate?: string;
    nextFollowUp?: string;
    contactName?: string;
    contactEmail?: string;
    notes?: string;
    tailoredResumeId?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/applications', {
        method: 'POST',
        body: JSON.stringify({
          job_title: applicationData.jobTitle,
          company_name: applicationData.companyName,
          job_url: applicationData.jobUrl,
          status: applicationData.status || 'saved',
          location: applicationData.location,
          salary_min: applicationData.salaryMin,
          salary_max: applicationData.salaryMax,
          applied_date: applicationData.appliedDate,
          next_follow_up: applicationData.nextFollowUp,
          contact_name: applicationData.contactName,
          contact_email: applicationData.contactEmail,
          notes: applicationData.notes,
          tailored_resume_id: applicationData.tailoredResumeId,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating application:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update an application
   */
  async updateApplication(applicationId: number, updates: {
    jobTitle?: string;
    companyName?: string;
    jobUrl?: string;
    status?: string;
    location?: string;
    salaryMin?: number;
    salaryMax?: number;
    appliedDate?: string;
    nextFollowUp?: string;
    contactName?: string;
    contactEmail?: string;
    notes?: string;
    tailoredResumeId?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/applications/${applicationId}`, {
        method: 'PUT',
        body: JSON.stringify({
          job_title: updates.jobTitle,
          company_name: updates.companyName,
          job_url: updates.jobUrl,
          status: updates.status,
          location: updates.location,
          salary_min: updates.salaryMin,
          salary_max: updates.salaryMax,
          applied_date: updates.appliedDate,
          next_follow_up: updates.nextFollowUp,
          contact_name: updates.contactName,
          contact_email: updates.contactEmail,
          notes: updates.notes,
          tailored_resume_id: updates.tailoredResumeId,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating application:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete an application
   */
  async deleteApplication(applicationId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/applications/${applicationId}`, { method: 'DELETE' });
      if (response.status === 204) return { success: true, data: null };
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error deleting application:', error);
      return { success: false, error: error.message };
    }
  },

  // =========================================================================
  // COVER LETTER METHODS
  // =========================================================================

  /**
   * List all cover letters for the user
   */
  async listCoverLetters(): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/cover-letters', { method: 'GET' });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data: data.cover_letters || [] };
    } catch (error: any) {
      console.error('Error listing cover letters:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate a new cover letter
   */
  async generateCoverLetter(payload: {
    jobTitle: string;
    companyName: string;
    jobDescription?: string;
    jobUrl?: string;
    baseResumeId?: number;
    tone?: 'professional' | 'enthusiastic' | 'strategic' | 'technical';
    length?: 'concise' | 'standard' | 'detailed';
    focus?: 'leadership' | 'technical' | 'program_management' | 'cross_functional';
  }): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth('/api/cover-letters/generate', {
        method: 'POST',
        body: JSON.stringify({
          job_title: payload.jobTitle,
          company_name: payload.companyName,
          job_description: payload.jobDescription,
          job_url: payload.jobUrl,
          base_resume_id: payload.baseResumeId,
          tone: payload.tone || 'professional',
          length: payload.length || 'standard',
          focus: payload.focus || 'program_management',
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error generating cover letter:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get a single cover letter by ID
   */
  async getCoverLetter(coverLetterId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/cover-letters/${coverLetterId}`, { method: 'GET' });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error getting cover letter:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Download cover letter as .docx
   */
  async downloadCoverLetter(coverLetterId: number): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetchWithAuth(`/api/cover-letters/${coverLetterId}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.detail || errorData.error || `HTTP ${response.status}`,
        };
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error: any) {
      console.error('Error downloading cover letter:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update a cover letter
   */
  async updateCoverLetter(
    coverLetterId: number,
    updates: {
      content?: string;
      jobTitle?: string;
      companyName?: string;
    }
  ): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/cover-letters/${coverLetterId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating cover letter:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Export a cover letter in a given format (e.g. docx)
   */
  async exportCoverLetter(coverLetterId: number, format: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetchWithAuth(`/api/cover-letters/${coverLetterId}/export`, {
        method: 'POST',
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.detail || errorData.error || `HTTP ${response.status}`,
        };
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error: any) {
      console.error('Error exporting cover letter:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a cover letter
   */
  async deleteCoverLetter(coverLetterId: number): Promise<ApiResponse> {
    try {
      const response = await fetchWithAuth(`/api/cover-letters/${coverLetterId}`, { method: 'DELETE' });
      if (response.status === 204) return { success: true, data: null };
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || data.error || `HTTP ${response.status}`,
        };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error deleting cover letter:', error);
      return { success: false, error: error.message };
    }
  },
};
