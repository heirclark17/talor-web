/**
 * Web API Client - Direct HTTP calls to Railway backend
 * Replaces Electron IPC calls for web deployment
 */

import { getUserId, getAuthToken } from '../utils/userSession';

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

// Career Trajectory Analysis interface
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

// Skill Gaps Analysis interface
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

// Detailed Career Plan interface
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

// STAR Story Analysis interface
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

// Story Suggestions interface
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

// Story Variations interface
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

/**
 * Get auth headers for direct fetch calls outside the API client.
 * Includes both X-User-ID and Authorization Bearer token.
 */
export function getApiHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'X-User-ID': getUserId(),
    ...extra,
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get common headers with user ID and auth token
   */
  private getHeaders(additionalHeaders?: Record<string, string>): HeadersInit {
    const headers: Record<string, string> = {
      'X-User-ID': getUserId(),
      ...additionalHeaders,
    };

    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
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
   *
   * Uses a 3-minute AbortController timeout to prevent infinite spinning when
   * Railway/the backend is unresponsive. The backend AI pipeline (Firecrawl +
   * Perplexity + OpenAI) typically takes 30-60 seconds; 180 seconds is a safe
   * upper bound before we surface an actionable error to the user.
   */
  async tailorResume(tailorData: {
    baseResumeId: number;
    jobUrl?: string;
    company?: string;
    jobTitle?: string;
    jobDescription?: string;
  }): Promise<ApiResponse> {
    // 3-minute hard timeout – prevents the spinner from running forever
    const TIMEOUT_MS = 3 * 60 * 1000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Convert camelCase to snake_case for backend
      const backendData = {
        base_resume_id: tailorData.baseResumeId,
        job_url: tailorData.jobUrl,
        company: tailorData.company,
        job_title: tailorData.jobTitle,
        job_description: tailorData.jobDescription,
      };

      console.log('[tailorResume] Sending POST to /api/tailor/tailor', backendData);
      const fetchStart = Date.now();

      const response = await fetch(`${this.baseUrl}/api/tailor/tailor`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(backendData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`[tailorResume] Response received in ${Date.now() - fetchStart}ms, status: ${response.status}`);

      let data: any;
      try {
        const text = await response.text();
        console.log(`[tailorResume] Response body (first 500): ${text.substring(0, 500)}`);
        data = JSON.parse(text);
      } catch (parseError: any) {
        console.error('[tailorResume] JSON parse error:', parseError.message);
        return {
          success: false,
          error: `Server returned invalid response (HTTP ${response.status}). The AI service may be overloaded — please try again.`,
        };
      }

      if (!response.ok) {
        return {
          success: false,
          // Backend raises HTTPException with 'detail', not 'error'
          error: data.detail || data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error(`[tailorResume] Fetch error: ${error.name}: ${error.message}`);
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Resume generation timed out after 3 minutes. Please try again — the AI service may be under heavy load.',
        };
      }
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
    analysis_data?: any;
    keywords_data?: any;
    match_score_data?: any;
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

  // =========================================================================
  // RESUME PARSED DATA UPDATE
  async updateParsedResumeData(resumeId: number, data: Record<string, any>): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/${resumeId}/parsed-data`, {
        method: 'PUT',
        headers: { ...this.getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return { success: response.ok, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // APPLICATION TRACKING METHODS
  // =========================================================================

  async listApplications(status?: string): Promise<ApiResponse> {
    try {
      const url = status
        ? `${this.baseUrl}/api/applications/?status=${status}`
        : `${this.baseUrl}/api/applications/`;
      const response = await fetch(url, { headers: this.getHeaders() });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async createApplication(appData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/applications/`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(appData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateApplication(appId: number, appData: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/applications/${appId}`, {
        method: 'PUT',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(appData),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteApplication(appId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/applications/${appId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getApplicationStats(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/applications/stats`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =========================================================================
  // COVER LETTER METHODS
  // =========================================================================

  async listCoverLetters(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cover-letters/`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async generateCoverLetter(params: {
    job_title: string;
    company_name: string;
    job_description?: string;
    job_url?: string;
    tone?: string;
    tailored_resume_id?: number;
    base_resume_id?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cover-letters/generate`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateCoverLetter(id: number, params: { content?: string; tone?: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cover-letters/${id}`, {
        method: 'PUT',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteCoverLetter(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cover-letters/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async exportCoverLetter(id: number, format: 'docx'): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/cover-letters/${id}/export?format=${format}`, {
        headers: this.getHeaders(),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        return { success: false, error: data.detail || `HTTP ${response.status}` };
      }
      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =========================================================================
  // RESUME VERSION HISTORY METHODS
  // =========================================================================

  async listResumeVersions(tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/${tailoredResumeId}/versions`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async restoreResumeVersion(tailoredResumeId: number, versionId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/${tailoredResumeId}/versions/restore/${versionId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =========================================================================
  // STAR STORY MATCHING METHODS
  // =========================================================================

  async matchStarStoriesToQuestions(data: {
    star_story_ids: number[];
    questions: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/star-stories/match-to-questions`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) return { success: false, error: result.detail || `HTTP ${response.status}` };
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =========================================================================
  // REMINDER METHODS
  // =========================================================================

  async createReminder(data: any): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/reminders/`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) return { success: false, error: result.detail || `HTTP ${response.status}` };
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async listReminders(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/reminders/`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteReminder(id: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/reminders/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      if (!response.ok) return { success: false, error: data.detail || `HTTP ${response.status}` };
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =========================================================================
  // TAILORED RESUME METHODS
  // =========================================================================

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

  /**
   * List all tailored resumes
   */
  async listTailoredResumes(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tailor/tailored/list`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Download tailored resume as file
   */
  async downloadTailoredResume(tailoredResumeId: number, format: 'docx' | 'pdf' = 'docx'): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/tailor/tailored/${tailoredResumeId}/download?format=${format}`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || errorData.error };
      }
      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =========================================================================
  // INTERVIEW PREP - ENHANCED METHODS
  // =========================================================================

  /**
   * Generate 10 common interview questions
   */
  async generateCommonQuestions(interviewPrepId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/common-questions/generate`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ interview_prep_id: interviewPrepId }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Regenerate a single common question
   */
  async regenerateSingleQuestion(params: {
    interview_prep_id: number;
    question_id: string;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/common-questions/regenerate`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get values alignment analysis
   */
  async getValuesAlignment(prepId: number): Promise<ApiResponse<ValuesAlignment>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}/values-alignment`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Save STAR story for a question
   */
  async saveQuestionStarStory(params: {
    interview_prep_id: number;
    question_id: string;
    star_story: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/save-question-story`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get interview readiness score
   */
  async getInterviewReadinessScore(prepId: number): Promise<ApiResponse<ReadinessScore>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}/readiness`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get company research for interview prep
   */
  async getCompanyResearchForPrep(prepId: number): Promise<ApiResponse<CompanyResearch>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}/company-research`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get strategic news
   */
  async getStrategicNews(prepId: number): Promise<ApiResponse<StrategicNews>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}/strategic-news`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get competitive intelligence
   */
  async getCompetitiveIntelligence(prepId: number): Promise<ApiResponse<CompetitiveIntelligence>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}/competitive-intelligence`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get interview strategy
   */
  async getInterviewStrategy(prepId: number): Promise<ApiResponse<InterviewStrategy>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}/interview-strategy`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get executive insights
   */
  async getExecutiveInsights(prepId: number): Promise<ApiResponse<ExecutiveInsights>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}/executive-insights`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate readiness score
   */
  async calculateReadiness(prepId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}/calculate-readiness`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get practice history
   */
  async getPracticeHistory(prepId: number): Promise<ApiResponse<PracticeHistoryItem[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/interview-prep/${prepId}/practice-history`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =========================================================================
  // RESUME ANALYSIS - ENHANCED METHODS
  // =========================================================================

  /**
   * Analyze changes between base and tailored resume
   */
  async analyzeChanges(baseResumeId: number, tailoredResumeId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/resumes/analyze-changes?base_id=${baseResumeId}&tailored_id=${tailoredResumeId}`,
        { headers: this.getHeaders() }
      );
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze keywords
   */
  async analyzeKeywords(resumeContent: string, jobDescription: string): Promise<ApiResponse<KeywordOptimization>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/analyze-keywords`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ resume_content: resumeContent, job_description: jobDescription }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate match score
   */
  async calculateMatchScore(resumeId: number, jobDescription: string): Promise<ApiResponse<{ match_score: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resumes/${resumeId}/match-score`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ job_description: jobDescription }),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =========================================================================
  // STAR STORIES - ENHANCED METHODS
  // =========================================================================

  /**
   * Get individual STAR story
   */
  async getStarStory(storyId: number): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/star-stories/${storyId}`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze STAR story with AI
   */
  async analyzeStarStory(storyId: number): Promise<ApiResponse<StarStoryAnalysis>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/star-stories/${storyId}/analyze`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get story improvement suggestions
   */
  async getStorySuggestions(storyId: number): Promise<ApiResponse<StorySuggestions>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/star-stories/${storyId}/suggestions`, {
        headers: this.getHeaders(),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate story variations
   */
  async generateStoryVariations(params: {
    story_id: number;
    contexts: string[];
  }): Promise<ApiResponse<StoryVariations>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/star-stories/generate-variations`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // =========================================================================
  // CAREER PATH - ENHANCED METHODS
  // =========================================================================

  /**
   * Research career path
   */
  async researchCareerPath(params: {
    current_role: string;
    target_role: string;
    industry?: string;
    years_experience?: number;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/research`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze career trajectory
   */
  async analyzeCareerTrajectory(params: {
    resume_id: number;
    target_role?: string;
  }): Promise<ApiResponse<CareerTrajectoryAnalysis>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/analyze-trajectory`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get skill gaps analysis
   */
  async getSkillGaps(params: {
    resume_id: number;
    target_role: string;
  }): Promise<ApiResponse<SkillGapsAnalysis>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/skill-gaps`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate detailed career plan
   */
  async generateDetailedCareerPlan(params: {
    resume_id: number;
    target_role: string;
    timeline: string;
  }): Promise<ApiResponse<DetailedCareerPlan>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/career-path/detailed-plan`, {
        method: 'POST',
        headers: this.getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(params),
      });
      const data = await response.json();
      return { success: response.ok, data };
    } catch (error: any) {
      return { success: false, error: error.message };
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
