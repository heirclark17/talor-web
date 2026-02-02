/**
 * Custom hook for managing Interview Prep data
 *
 * This hook encapsulates all the state management and API calls
 * for the InterviewPrepScreen, making it easier to test and maintain.
 */

import { useState, useEffect, useCallback } from 'react';
import { interviewApi } from '../../api';
import type {
  InterviewPrep,
  CompanyResearch,
  ValuesAlignment,
  ReadinessScore,
} from '../../api/interviewApi';

// Extended types for prep data sections
export interface CompanyProfile {
  name: string;
  industry: string;
  locations: string[];
  sizeEstimate: string;
  overviewParagraph: string;
}

export interface ValuesAndCulture {
  statedValues: Array<{
    name: string;
    title?: string;
    description?: string;
    sourceSnippet?: string;
    url?: string;
    sourceUrl?: string;
  }>;
  practicalImplications: string[];
  culturalPriorities?: string[];
}

export interface StrategyAndNews {
  recentEvents: Array<{
    title?: string;
    headline?: string;
    date?: string;
    summary: string;
    source?: string;
    url?: string;
    sourceUrl?: string;
    impactSummary?: string;
  }>;
  strategicThemes: Array<{
    theme: string;
    name?: string;
    rationale: string;
    description?: string;
  }>;
  technologyFocus: Array<{
    technology: string;
    name?: string;
    description: string;
  }>;
}

export interface InterviewPrepData {
  id: number;
  tailoredResumeId: number;
  company: string;
  jobTitle: string;
  createdAt: string;
  companyProfile?: CompanyProfile;
  valuesAndCulture?: ValuesAndCulture;
  strategyAndNews?: StrategyAndNews;
  companyResearch?: CompanyResearch;
  valuesAlignment?: ValuesAlignment;
  readinessScore?: ReadinessScore;
}

export interface UseInterviewPrepDataReturn {
  // Data
  prepData: InterviewPrepData | null;
  isLoading: boolean;
  error: string | null;

  // Section loading states
  loadingStates: {
    companyResearch: boolean;
    valuesAlignment: boolean;
    readinessScore: boolean;
    commonQuestions: boolean;
    behavioralQuestions: boolean;
    technicalQuestions: boolean;
  };

  // Actions
  fetchPrepData: () => Promise<void>;
  refreshCompanyResearch: () => Promise<void>;
  refreshValuesAlignment: () => Promise<void>;
  refreshReadinessScore: () => Promise<void>;
  clearError: () => void;
}

export function useInterviewPrepData(prepId: number): UseInterviewPrepDataReturn {
  const [prepData, setPrepData] = useState<InterviewPrepData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loadingStates, setLoadingStates] = useState({
    companyResearch: false,
    valuesAlignment: false,
    readinessScore: false,
    commonQuestions: false,
    behavioralQuestions: false,
    technicalQuestions: false,
  });

  const setLoadingState = useCallback(
    (key: keyof typeof loadingStates, value: boolean) => {
      setLoadingStates((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const fetchPrepData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await interviewApi.getInterviewPrep(prepId);

      if (response.success && response.data) {
        setPrepData(response.data as unknown as InterviewPrepData);
      } else {
        setError(response.error || 'Failed to fetch interview prep data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [prepId]);

  const refreshCompanyResearch = useCallback(async () => {
    if (!prepData?.company) return;

    setLoadingState('companyResearch', true);

    try {
      const response = await interviewApi.getCompanyResearch({
        companyName: prepData.company,
        jobTitle: prepData.jobTitle,
      });

      if (response.success && response.data) {
        setPrepData((prev) =>
          prev ? { ...prev, companyResearch: response.data } : null
        );
      }
    } catch (err) {
      console.error('Error refreshing company research:', err);
    } finally {
      setLoadingState('companyResearch', false);
    }
  }, [prepData?.company, prepData?.jobTitle, setLoadingState]);

  const refreshValuesAlignment = useCallback(async () => {
    setLoadingState('valuesAlignment', true);

    try {
      const response = await interviewApi.getValuesAlignment(prepId);

      if (response.success && response.data) {
        setPrepData((prev) =>
          prev ? { ...prev, valuesAlignment: response.data } : null
        );
      }
    } catch (err) {
      console.error('Error refreshing values alignment:', err);
    } finally {
      setLoadingState('valuesAlignment', false);
    }
  }, [prepId, setLoadingState]);

  const refreshReadinessScore = useCallback(async () => {
    setLoadingState('readinessScore', true);

    try {
      const response = await interviewApi.getReadinessScore(prepId);

      if (response.success && response.data) {
        setPrepData((prev) =>
          prev ? { ...prev, readinessScore: response.data } : null
        );
      }
    } catch (err) {
      console.error('Error refreshing readiness score:', err);
    } finally {
      setLoadingState('readinessScore', false);
    }
  }, [prepId, setLoadingState]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPrepData();
  }, [fetchPrepData]);

  return {
    prepData,
    isLoading,
    error,
    loadingStates,
    fetchPrepData,
    refreshCompanyResearch,
    refreshValuesAlignment,
    refreshReadinessScore,
    clearError,
  };
}

export default useInterviewPrepData;
