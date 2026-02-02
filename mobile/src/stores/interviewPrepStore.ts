import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import {
  PrepData,
  ReadinessScore,
  ValuesAlignment,
  CompanyResearch,
  StrategicNewsItem,
  CompetitiveIntelligence,
  InterviewStrategy,
  ExecutiveInsights,
  CertificationRecommendations,
} from '../components/interviewPrep/types';

interface CachedInterviewPrep {
  interviewPrepId: number;
  tailoredResumeId: number;
  prepData: PrepData;
  readinessScore: ReadinessScore | null;
  valuesAlignment: ValuesAlignment | null;
  companyResearch: CompanyResearch | null;
  strategicNews: StrategicNewsItem[] | null;
  competitiveIntelligence: CompetitiveIntelligence | null;
  interviewStrategy: InterviewStrategy | null;
  executiveInsights: ExecutiveInsights | null;
  certificationRecommendations: CertificationRecommendations | null;
  cachedAt: string;
}

interface InterviewPrepState {
  // Cached interview preps by tailoredResumeId
  cachedPreps: Record<number, CachedInterviewPrep>;

  // Loading states
  loading: boolean;
  generating: boolean;
  loadingReadiness: boolean;
  loadingValuesAlignment: boolean;
  loadingCompanyResearch: boolean;
  loadingStrategicNews: boolean;
  loadingCompetitiveIntelligence: boolean;
  loadingInterviewStrategy: boolean;
  loadingExecutiveInsights: boolean;
  loadingCertifications: boolean;

  // Actions
  getInterviewPrep: (tailoredResumeId: number) => Promise<CachedInterviewPrep | null>;
  generateInterviewPrep: (tailoredResumeId: number) => Promise<CachedInterviewPrep | null>;
  loadEnhancedData: (tailoredResumeId: number, interviewPrepId: number) => Promise<void>;
  deleteInterviewPrep: (tailoredResumeId: number) => void;
  clearAllCache: () => void;
}

export const useInterviewPrepStore = create<InterviewPrepState>()(
  persist(
    (set, get) => ({
      cachedPreps: {},
      loading: false,
      generating: false,
      loadingReadiness: false,
      loadingValuesAlignment: false,
      loadingCompanyResearch: false,
      loadingStrategicNews: false,
      loadingCompetitiveIntelligence: false,
      loadingInterviewStrategy: false,
      loadingExecutiveInsights: false,
      loadingCertifications: false,

      getInterviewPrep: async (tailoredResumeId: number) => {
        const { cachedPreps } = get();

        // Return cached data if available
        if (cachedPreps[tailoredResumeId]) {
          return cachedPreps[tailoredResumeId];
        }

        // Otherwise fetch from API
        set({ loading: true });
        try {
          const result = await api.getInterviewPrep(tailoredResumeId);
          if (result.success && result.data) {
            const data = result.data as any;
            const cached: CachedInterviewPrep = {
              interviewPrepId: data.interview_prep_id,
              tailoredResumeId,
              prepData: data.prep_data,
              readinessScore: null,
              valuesAlignment: null,
              companyResearch: null,
              strategicNews: null,
              competitiveIntelligence: null,
              interviewStrategy: null,
              executiveInsights: null,
              certificationRecommendations: null,
              cachedAt: new Date().toISOString(),
            };

            set((state) => ({
              cachedPreps: {
                ...state.cachedPreps,
                [tailoredResumeId]: cached,
              },
            }));

            // Load enhanced data in background
            if (data.interview_prep_id) {
              get().loadEnhancedData(tailoredResumeId, data.interview_prep_id);
            }

            return cached;
          }
          return null;
        } catch (error) {
          console.error('Error loading interview prep:', error);
          return null;
        } finally {
          set({ loading: false });
        }
      },

      generateInterviewPrep: async (tailoredResumeId: number) => {
        set({ generating: true });
        try {
          const result = await api.generateInterviewPrep(tailoredResumeId);
          if (result.success && result.data) {
            const data = result.data as any;
            const cached: CachedInterviewPrep = {
              interviewPrepId: data.interview_prep_id,
              tailoredResumeId,
              prepData: data.prep_data,
              readinessScore: null,
              valuesAlignment: null,
              companyResearch: null,
              strategicNews: null,
              competitiveIntelligence: null,
              interviewStrategy: null,
              executiveInsights: null,
              certificationRecommendations: null,
              cachedAt: new Date().toISOString(),
            };

            set((state) => ({
              cachedPreps: {
                ...state.cachedPreps,
                [tailoredResumeId]: cached,
              },
            }));

            // Load enhanced data in background
            if (data.interview_prep_id) {
              get().loadEnhancedData(tailoredResumeId, data.interview_prep_id);
            }

            return cached;
          }
          return null;
        } catch (error) {
          console.error('Error generating interview prep:', error);
          return null;
        } finally {
          set({ generating: false });
        }
      },

      loadEnhancedData: async (tailoredResumeId: number, interviewPrepId: number) => {
        const updateCache = (updates: Partial<CachedInterviewPrep>) => {
          set((state) => {
            const existing = state.cachedPreps[tailoredResumeId];
            if (!existing) return state;
            return {
              cachedPreps: {
                ...state.cachedPreps,
                [tailoredResumeId]: { ...existing, ...updates },
              },
            };
          });
        };

        // Load all enhanced data in parallel
        const loadReadiness = async () => {
          set({ loadingReadiness: true });
          try {
            const result = await api.getInterviewReadinessScore(interviewPrepId);
            if (result.success && result.data) {
              updateCache({ readinessScore: result.data });
            }
          } catch (error) {
            console.error('Error loading readiness score:', error);
          } finally {
            set({ loadingReadiness: false });
          }
        };

        const loadValuesAlignment = async () => {
          set({ loadingValuesAlignment: true });
          try {
            const result = await api.getValuesAlignment(interviewPrepId);
            if (result.success && result.data) {
              updateCache({ valuesAlignment: result.data });
            }
          } catch (error) {
            console.error('Error loading values alignment:', error);
          } finally {
            set({ loadingValuesAlignment: false });
          }
        };

        const loadCompanyResearch = async () => {
          set({ loadingCompanyResearch: true });
          try {
            const result = await api.getCompanyResearchForPrep(interviewPrepId);
            if (result.success && result.data) {
              updateCache({ companyResearch: result.data });
            }
          } catch (error) {
            console.error('Error loading company research:', error);
          } finally {
            set({ loadingCompanyResearch: false });
          }
        };

        const loadStrategicNews = async () => {
          set({ loadingStrategicNews: true });
          try {
            const result = await api.getStrategicNews(interviewPrepId);
            if (result.success && result.data) {
              updateCache({ strategicNews: result.data });
            }
          } catch (error) {
            console.error('Error loading strategic news:', error);
          } finally {
            set({ loadingStrategicNews: false });
          }
        };

        const loadCompetitiveIntelligence = async () => {
          set({ loadingCompetitiveIntelligence: true });
          try {
            const result = await api.getCompetitiveIntelligence(interviewPrepId);
            if (result.success && result.data) {
              updateCache({ competitiveIntelligence: result.data });
            }
          } catch (error) {
            console.error('Error loading competitive intelligence:', error);
          } finally {
            set({ loadingCompetitiveIntelligence: false });
          }
        };

        const loadInterviewStrategy = async () => {
          set({ loadingInterviewStrategy: true });
          try {
            const result = await api.getInterviewStrategy(interviewPrepId);
            if (result.success && result.data) {
              updateCache({ interviewStrategy: result.data });
            }
          } catch (error) {
            console.error('Error loading interview strategy:', error);
          } finally {
            set({ loadingInterviewStrategy: false });
          }
        };

        const loadExecutiveInsights = async () => {
          set({ loadingExecutiveInsights: true });
          try {
            const result = await api.getExecutiveInsights(interviewPrepId);
            if (result.success && result.data) {
              updateCache({ executiveInsights: result.data });
            }
          } catch (error) {
            console.error('Error loading executive insights:', error);
          } finally {
            set({ loadingExecutiveInsights: false });
          }
        };

        const loadCertifications = async () => {
          set({ loadingCertifications: true });
          try {
            const result = await api.getCertificationRecommendations(interviewPrepId);
            if (result.success && result.data) {
              updateCache({ certificationRecommendations: result.data });
            }
          } catch (error) {
            console.error('Error loading certification recommendations:', error);
          } finally {
            set({ loadingCertifications: false });
          }
        };

        // Run all in parallel
        await Promise.all([
          loadReadiness(),
          loadValuesAlignment(),
          loadCompanyResearch(),
          loadStrategicNews(),
          loadCompetitiveIntelligence(),
          loadInterviewStrategy(),
          loadExecutiveInsights(),
          loadCertifications(),
        ]);
      },

      deleteInterviewPrep: (tailoredResumeId: number) => {
        set((state) => {
          const { [tailoredResumeId]: _, ...rest } = state.cachedPreps;
          return { cachedPreps: rest };
        });
      },

      clearAllCache: () => {
        set({ cachedPreps: {} });
      },
    }),
    {
      name: 'interview-prep-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        // Only persist the cached preps, not loading states
        cachedPreps: state.cachedPreps,
      }),
    }
  )
);

// Selector to get cached prep by tailoredResumeId
export const selectCachedPrep = (state: InterviewPrepState, tailoredResumeId: number) =>
  state.cachedPreps[tailoredResumeId] || null;
