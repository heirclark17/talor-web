// Type definitions for Interview Prep components

export interface CompanyProfile {
  name: string;
  industry: string;
  locations: string[];
  size_estimate: string;
  overview_paragraph: string;
}

export interface StatedValue {
  name: string;
  title?: string;
  description?: string;
  source_snippet?: string;
  url?: string;
  source_url?: string;
}

export interface ValuesAndCulture {
  stated_values: StatedValue[];
  practical_implications: string[];
  cultural_priorities?: string[];
}

export interface StrategyAndNews {
  recent_events: Array<{
    title?: string;
    headline?: string;
    date?: string;
    summary: string;
    source?: string;
    url?: string;
    source_url?: string;
    impact_summary?: string;
  }>;
  strategic_themes: Array<{
    theme: string;
    name?: string;
    rationale: string;
    description?: string;
  }>;
  technology_focus: Array<{
    technology: string;
    name?: string;
    description: string;
    relevance_to_role: string;
  }>;
}

export interface SkillItem {
  name?: string;
  skill?: string;
}

export interface RoleAnalysis {
  job_title: string;
  seniority_level: string;
  core_responsibilities: string[];
  must_have_skills: Array<string | SkillItem>;
  nice_to_have_skills: Array<string | SkillItem>;
  success_signals_6_12_months: string[];
}

export interface PracticeQuestion {
  question?: string;
  text?: string;
}

export interface InterviewPreparation {
  research_tasks: string[];
  practice_questions_for_candidate: Array<string | PracticeQuestion>;
  day_of_checklist: string[];
}

export interface CandidatePositioning {
  resume_focus_areas: string[];
  story_prompts: Array<{
    title: string;
    description: string;
    star_hint?: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
  }>;
  keyword_map: Array<{
    company_term: string;
    term?: string;
    candidate_equivalent: string;
    equivalent?: string;
    context: string;
  }>;
}

export interface QuestionsToAsk {
  product: string[];
  team: string[];
  culture: string[];
  performance: string[];
  strategy: string[];
}

export interface PrepData {
  company_profile: CompanyProfile;
  values_and_culture: ValuesAndCulture;
  strategy_and_news: StrategyAndNews;
  role_analysis: RoleAnalysis;
  interview_preparation: InterviewPreparation;
  candidate_positioning: CandidatePositioning;
  questions_to_ask_interviewer: QuestionsToAsk;
}

export interface InterviewPrepResponse {
  success: boolean;
  interview_prep_id: number;
  prep_data: PrepData;
  created_at: string;
}

// API Response Types
export interface ReadinessScore {
  confidence_level: number;
  preparation_level: string;
  strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
}

export interface ValuesAlignment {
  alignment_score: number;
  matches?: Array<{
    value: string;
    evidence: string;
    confidence: number;
  }>;
  matched_values?: Array<{
    value: string;
    company_context?: string;
    candidate_evidence?: string;
  }>;
  gaps?: Array<{
    value: string;
    suggestion: string;
  }>;
  value_gaps?: Array<{
    value: string;
    company_context?: string;
    suggestion?: string;
  }>;
  cultural_fit_insights?: string;
}

export interface CompanyResearch {
  company_name?: string;
  industry?: string;
  overview?: string;
  company_overview?: string;
  key_products?: string[];
  key_products_services?: string[];
  recent_news?: Array<{
    headline: string;
    date?: string;
    summary: string;
    source?: string;
  }>;
  competitors?: Array<{
    name: string;
    context?: string;
  }>;
  financial_health?: {
    status: string;
    summary: string;
  };
  employee_sentiment?: {
    sentiment: string;
    rating?: number;
    summary: string;
  };
  culture_highlights?: string[];
  interview_tips?: string[];
}

export interface StrategicNewsItem {
  title?: string;
  headline?: string;
  date: string;
  summary: string;
  relevance?: string;
  relevance_to_interview?: string;
  impact_on_interview?: string;
  source?: string;
  source_url?: string;
  talking_points?: string[];
}

export interface CompetitiveIntelligence {
  company_position?: string;
  key_competitors?: Array<{
    name: string;
    comparison: string;
  }>;
  differentiators?: string[];
  market_trends?: string[];
  talking_points?: string[];
  // Additional properties used by components
  interview_angles?: string[];
  market_position?: string;
  competitive_advantages?: string[];
  challenges?: string[];
  differentiation_strategy?: string;
}

export interface InterviewStrategy {
  approach?: string;
  key_themes?: string[];
  priorities?: Array<{
    priority: string;
    rationale: string;
    execution: string;
  }>;
  talking_points?: string[];
  potential_questions?: string[];
  red_flags_to_avoid?: string[];
  // Additional properties used by components
  recommended_approach?: string;
  key_themes_to_emphasize?: string[];
  stories_to_prepare?: Array<{
    theme: string;
    description: string;
  }>;
  questions_to_ask_interviewer?: string[];
  pre_interview_checklist?: string[];
}

export interface ExecutiveInsights {
  leadership_style?: string;
  key_initiatives?: string[];
  focus_areas?: string[];
  notable_quotes?: Array<{
    quote: string;
    context: string;
    source?: string;
  }>;
  interview_implications?: string[];
  // Additional properties used by components
  executive_priorities?: string[];
  decision_making_factors?: string[];
  strategic_initiatives?: string[];
  c_suite_talking_points?: string[];
}

export interface CertificationExamDetails {
  format?: string;
  duration?: string;
  passing_score?: string;
  validity?: string;
  exam_code?: string;
  num_questions?: number;
}

export interface Certification {
  name: string;
  provider: string;
  level: 'entry' | 'mid' | 'advanced' | 'foundation' | 'intermediate';
  priority?: 'high' | 'medium' | 'low';
  why_recommended: string;
  skills_gained: string[];
  cost: string;
  time_to_complete: string;
  difficulty?: string;
  roi_rating?: string;
  prerequisites?: string;
  study_resources?: string[];
  exam_details?: CertificationExamDetails;
}

export interface CertificationRoadmapStep {
  step: number;
  certification: string;
  timeline: string;
  rationale: string;
}

export interface CertificationRecommendations {
  certifications_by_level: {
    entry?: Certification[];
    mid?: Certification[];
    advanced?: Certification[];
    foundation?: Certification[];
    intermediate?: Certification[];
  };
  recommended_path?: CertificationRoadmapStep[];
  personalized_advice?: string;
}

// Component Props Types
export interface ThemeColors {
  glass: string;
  glassBorder: string;
  text: string;
  textSecondary: string;
  textTertiary?: string;
  background?: string;
  backgroundSecondary?: string;
  backgroundTertiary?: string;
  border?: string;
}
