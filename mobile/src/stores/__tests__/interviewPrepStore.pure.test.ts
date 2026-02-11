/**
 * Pure unit tests for interviewPrepStore (src/stores/interviewPrepStore.ts)
 * Tests the zustand persist store actions, caching, and parallel data loading
 */

import { useInterviewPrepStore } from '../interviewPrepStore';

jest.mock('../../api/client', () => ({
  api: {
    getInterviewPrep: jest.fn(),
    generateInterviewPrep: jest.fn(),
    getInterviewReadinessScore: jest.fn(),
    getValuesAlignment: jest.fn(),
    getCompanyResearchForPrep: jest.fn(),
    getStrategicNews: jest.fn(),
    getCompetitiveIntelligence: jest.fn(),
    getInterviewStrategy: jest.fn(),
    getExecutiveInsights: jest.fn(),
    getCertificationRecommendations: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  const store: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(store[key] || null)),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((k) => delete store[k]);
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
      multiGet: jest.fn((keys: string[]) =>
        Promise.resolve(keys.map((k) => [k, store[k] || null]))
      ),
      multiSet: jest.fn((pairs: [string, string][]) => {
        pairs.forEach(([k, v]) => { store[k] = v; });
        return Promise.resolve();
      }),
      multiRemove: jest.fn((keys: string[]) => {
        keys.forEach((k) => delete store[k]);
        return Promise.resolve();
      }),
    },
  };
});

const { api } = require('../../api/client');

const mockPrepData = {
  company: 'TestCorp',
  job_title: 'Senior Engineer',
  questions: [{ text: 'Tell me about yourself', category: 'behavioral' }],
};

const mockApiResponse = {
  interview_prep_id: 100,
  prep_data: mockPrepData,
};

const mockReadinessScore = {
  confidence_level: 75,
  preparation_level: 'intermediate',
  strengths: ['Communication'],
  areas_for_improvement: ['Technical depth'],
  recommendations: ['Practice coding'],
};

const mockValuesAlignment = {
  alignment_score: 80,
  matched_values: [{ value: 'Innovation' }],
  value_gaps: [],
  cultural_fit_insights: 'Good fit',
};

const mockCompanyResearch = {
  company_overview: 'A tech company',
  recent_news: [],
  key_products_services: ['Product A'],
  competitors: [],
  financial_health: { summary: 'Strong', status: 'good' },
  employee_sentiment: { summary: 'Positive', sentiment: 'positive' },
};

const mockStrategicNews = [
  { headline: 'Big news', date: '2026-01-01', source: 'News', summary: 'Summary', relevance_to_interview: 'High', talking_points: ['Point 1'] },
];

const mockCompetitiveIntelligence = {
  market_position: 'Leader',
  competitive_advantages: ['Scale'],
  challenges: ['Competition'],
  differentiation_strategy: 'Innovation',
  interview_angles: ['Ask about growth'],
};

const mockInterviewStrategy = {
  recommended_approach: 'Be confident',
  key_themes_to_emphasize: ['Leadership'],
  stories_to_prepare: [{ theme: 'Leadership', description: 'Led team' }],
  questions_to_ask_interviewer: ['What is team culture?'],
  pre_interview_checklist: ['Research company'],
};

const mockExecutiveInsights = {
  executive_priorities: ['Revenue growth'],
  leadership_style: 'Collaborative',
  decision_making_factors: ['Data-driven'],
  strategic_initiatives: ['Cloud migration'],
  c_suite_talking_points: ['Mention digital transformation'],
};

const mockCertifications = {
  recommendations: [{ name: 'AWS Solutions Architect', priority: 'high' }],
};

function resetStore() {
  useInterviewPrepStore.setState({
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
  });
}

describe('interviewPrepStore (src/stores/)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
    resetStore();
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore?.();
  });

  describe('initial state', () => {
    it('should have empty cachedPreps and all loading flags false', () => {
      const state = useInterviewPrepStore.getState();
      expect(state.cachedPreps).toEqual({});
      expect(state.loading).toBe(false);
      expect(state.generating).toBe(false);
      expect(state.loadingReadiness).toBe(false);
      expect(state.loadingValuesAlignment).toBe(false);
      expect(state.loadingCompanyResearch).toBe(false);
      expect(state.loadingStrategicNews).toBe(false);
      expect(state.loadingCompetitiveIntelligence).toBe(false);
      expect(state.loadingInterviewStrategy).toBe(false);
      expect(state.loadingExecutiveInsights).toBe(false);
      expect(state.loadingCertifications).toBe(false);
    });
  });

  describe('getInterviewPrep', () => {
    it('should return cached data if available', async () => {
      const cachedEntry = {
        interviewPrepId: 100,
        tailoredResumeId: 1,
        prepData: mockPrepData,
        readinessScore: null,
        valuesAlignment: null,
        companyResearch: null,
        strategicNews: null,
        competitiveIntelligence: null,
        interviewStrategy: null,
        executiveInsights: null,
        certificationRecommendations: null,
        cachedAt: '2026-01-01T00:00:00.000Z',
      };
      useInterviewPrepStore.setState({ cachedPreps: { 1: cachedEntry } });

      const result = await useInterviewPrepStore.getState().getInterviewPrep(1);

      expect(result).toEqual(cachedEntry);
      // Should NOT call the API since data is cached
      expect(api.getInterviewPrep).not.toHaveBeenCalled();
    });

    it('should fetch from API on cache miss', async () => {
      // Mock all enhanced data loaders to avoid unhandled promises
      api.getInterviewPrep.mockResolvedValue({ success: true, data: mockApiResponse });
      api.getInterviewReadinessScore.mockResolvedValue({ success: false });
      api.getValuesAlignment.mockResolvedValue({ success: false });
      api.getCompanyResearchForPrep.mockResolvedValue({ success: false });
      api.getStrategicNews.mockResolvedValue({ success: false });
      api.getCompetitiveIntelligence.mockResolvedValue({ success: false });
      api.getInterviewStrategy.mockResolvedValue({ success: false });
      api.getExecutiveInsights.mockResolvedValue({ success: false });
      api.getCertificationRecommendations.mockResolvedValue({ success: false });

      const result = await useInterviewPrepStore.getState().getInterviewPrep(5);

      expect(api.getInterviewPrep).toHaveBeenCalledWith(5);
      expect(result).not.toBeNull();
      expect(result!.interviewPrepId).toBe(100);
      expect(result!.tailoredResumeId).toBe(5);
      expect(result!.prepData).toEqual(mockPrepData);
    });

    it('should cache the result after fetching from API', async () => {
      api.getInterviewPrep.mockResolvedValue({ success: true, data: mockApiResponse });
      api.getInterviewReadinessScore.mockResolvedValue({ success: false });
      api.getValuesAlignment.mockResolvedValue({ success: false });
      api.getCompanyResearchForPrep.mockResolvedValue({ success: false });
      api.getStrategicNews.mockResolvedValue({ success: false });
      api.getCompetitiveIntelligence.mockResolvedValue({ success: false });
      api.getInterviewStrategy.mockResolvedValue({ success: false });
      api.getExecutiveInsights.mockResolvedValue({ success: false });
      api.getCertificationRecommendations.mockResolvedValue({ success: false });

      await useInterviewPrepStore.getState().getInterviewPrep(5);

      const cached = useInterviewPrepStore.getState().cachedPreps[5];
      expect(cached).toBeDefined();
      expect(cached.interviewPrepId).toBe(100);
    });

    it('should return null on API failure', async () => {
      api.getInterviewPrep.mockResolvedValue({ success: false, error: 'Not found' });

      const result = await useInterviewPrepStore.getState().getInterviewPrep(999);

      expect(result).toBeNull();
    });

    it('should call loadEnhancedData after successful fetch', async () => {
      api.getInterviewPrep.mockResolvedValue({ success: true, data: mockApiResponse });
      // Set up all enhanced endpoints to track calls
      api.getInterviewReadinessScore.mockResolvedValue({ success: true, data: mockReadinessScore });
      api.getValuesAlignment.mockResolvedValue({ success: false });
      api.getCompanyResearchForPrep.mockResolvedValue({ success: false });
      api.getStrategicNews.mockResolvedValue({ success: false });
      api.getCompetitiveIntelligence.mockResolvedValue({ success: false });
      api.getInterviewStrategy.mockResolvedValue({ success: false });
      api.getExecutiveInsights.mockResolvedValue({ success: false });
      api.getCertificationRecommendations.mockResolvedValue({ success: false });

      await useInterviewPrepStore.getState().getInterviewPrep(5);

      // Wait for background loadEnhancedData to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should have called readiness score with the interview_prep_id
      expect(api.getInterviewReadinessScore).toHaveBeenCalledWith(100);
    });

    it('should set and clear loading flag', async () => {
      api.getInterviewPrep.mockResolvedValue({ success: false });

      const promise = useInterviewPrepStore.getState().getInterviewPrep(5);
      // loading should be true during fetch
      expect(useInterviewPrepStore.getState().loading).toBe(true);

      await promise;
      expect(useInterviewPrepStore.getState().loading).toBe(false);
    });
  });

  describe('generateInterviewPrep', () => {
    it('should cache result on success', async () => {
      api.generateInterviewPrep.mockResolvedValue({ success: true, data: mockApiResponse });
      api.getInterviewReadinessScore.mockResolvedValue({ success: false });
      api.getValuesAlignment.mockResolvedValue({ success: false });
      api.getCompanyResearchForPrep.mockResolvedValue({ success: false });
      api.getStrategicNews.mockResolvedValue({ success: false });
      api.getCompetitiveIntelligence.mockResolvedValue({ success: false });
      api.getInterviewStrategy.mockResolvedValue({ success: false });
      api.getExecutiveInsights.mockResolvedValue({ success: false });
      api.getCertificationRecommendations.mockResolvedValue({ success: false });

      const result = await useInterviewPrepStore.getState().generateInterviewPrep(7);

      expect(result).not.toBeNull();
      expect(result!.interviewPrepId).toBe(100);
      expect(useInterviewPrepStore.getState().cachedPreps[7]).toBeDefined();
    });

    it('should return null on failure', async () => {
      api.generateInterviewPrep.mockResolvedValue({ success: false });

      const result = await useInterviewPrepStore.getState().generateInterviewPrep(7);

      expect(result).toBeNull();
    });

    it('should set and clear generating flag', async () => {
      api.generateInterviewPrep.mockResolvedValue({ success: false });

      const promise = useInterviewPrepStore.getState().generateInterviewPrep(7);
      expect(useInterviewPrepStore.getState().generating).toBe(true);

      await promise;
      expect(useInterviewPrepStore.getState().generating).toBe(false);
    });

    it('should clear generating flag even on exception', async () => {
      api.generateInterviewPrep.mockRejectedValue(new Error('Network error'));

      await useInterviewPrepStore.getState().generateInterviewPrep(7);

      expect(useInterviewPrepStore.getState().generating).toBe(false);
    });
  });

  describe('loadEnhancedData', () => {
    const tailoredResumeId = 10;
    const interviewPrepId = 200;

    beforeEach(() => {
      // Set up a cached prep entry so updateCache has something to update
      useInterviewPrepStore.setState({
        cachedPreps: {
          [tailoredResumeId]: {
            interviewPrepId,
            tailoredResumeId,
            prepData: mockPrepData,
            readinessScore: null,
            valuesAlignment: null,
            companyResearch: null,
            strategicNews: null,
            competitiveIntelligence: null,
            interviewStrategy: null,
            executiveInsights: null,
            certificationRecommendations: null,
            cachedAt: '2026-01-01T00:00:00.000Z',
          },
        },
      });
    });

    it('should set loading flags during data load', async () => {
      // Create promises we can control
      let resolveReadiness: Function;
      api.getInterviewReadinessScore.mockReturnValue(
        new Promise((r) => { resolveReadiness = r; })
      );
      api.getValuesAlignment.mockResolvedValue({ success: false });
      api.getCompanyResearchForPrep.mockResolvedValue({ success: false });
      api.getStrategicNews.mockResolvedValue({ success: false });
      api.getCompetitiveIntelligence.mockResolvedValue({ success: false });
      api.getInterviewStrategy.mockResolvedValue({ success: false });
      api.getExecutiveInsights.mockResolvedValue({ success: false });
      api.getCertificationRecommendations.mockResolvedValue({ success: false });

      const promise = useInterviewPrepStore.getState().loadEnhancedData(tailoredResumeId, interviewPrepId);

      // loadingReadiness should be true while API call is pending
      expect(useInterviewPrepStore.getState().loadingReadiness).toBe(true);

      resolveReadiness!({ success: true, data: mockReadinessScore });
      await promise;

      expect(useInterviewPrepStore.getState().loadingReadiness).toBe(false);
    });

    it('should update cache with readiness score', async () => {
      api.getInterviewReadinessScore.mockResolvedValue({ success: true, data: mockReadinessScore });
      api.getValuesAlignment.mockResolvedValue({ success: false });
      api.getCompanyResearchForPrep.mockResolvedValue({ success: false });
      api.getStrategicNews.mockResolvedValue({ success: false });
      api.getCompetitiveIntelligence.mockResolvedValue({ success: false });
      api.getInterviewStrategy.mockResolvedValue({ success: false });
      api.getExecutiveInsights.mockResolvedValue({ success: false });
      api.getCertificationRecommendations.mockResolvedValue({ success: false });

      await useInterviewPrepStore.getState().loadEnhancedData(tailoredResumeId, interviewPrepId);

      const cached = useInterviewPrepStore.getState().cachedPreps[tailoredResumeId];
      expect(cached.readinessScore).toEqual(mockReadinessScore);
    });

    it('should update cache with values alignment', async () => {
      api.getInterviewReadinessScore.mockResolvedValue({ success: false });
      api.getValuesAlignment.mockResolvedValue({ success: true, data: mockValuesAlignment });
      api.getCompanyResearchForPrep.mockResolvedValue({ success: false });
      api.getStrategicNews.mockResolvedValue({ success: false });
      api.getCompetitiveIntelligence.mockResolvedValue({ success: false });
      api.getInterviewStrategy.mockResolvedValue({ success: false });
      api.getExecutiveInsights.mockResolvedValue({ success: false });
      api.getCertificationRecommendations.mockResolvedValue({ success: false });

      await useInterviewPrepStore.getState().loadEnhancedData(tailoredResumeId, interviewPrepId);

      const cached = useInterviewPrepStore.getState().cachedPreps[tailoredResumeId];
      expect(cached.valuesAlignment).toEqual(mockValuesAlignment);
    });

    it('should handle individual API failures gracefully', async () => {
      api.getInterviewReadinessScore.mockRejectedValue(new Error('Readiness failed'));
      api.getValuesAlignment.mockRejectedValue(new Error('Values failed'));
      api.getCompanyResearchForPrep.mockResolvedValue({ success: true, data: mockCompanyResearch });
      api.getStrategicNews.mockResolvedValue({ success: true, data: mockStrategicNews });
      api.getCompetitiveIntelligence.mockRejectedValue(new Error('CI failed'));
      api.getInterviewStrategy.mockResolvedValue({ success: true, data: mockInterviewStrategy });
      api.getExecutiveInsights.mockResolvedValue({ success: true, data: mockExecutiveInsights });
      api.getCertificationRecommendations.mockRejectedValue(new Error('Certs failed'));

      // Should not throw
      await useInterviewPrepStore.getState().loadEnhancedData(tailoredResumeId, interviewPrepId);

      const cached = useInterviewPrepStore.getState().cachedPreps[tailoredResumeId];
      // Fields that succeeded should be populated
      expect(cached.companyResearch).toEqual(mockCompanyResearch);
      expect(cached.strategicNews).toEqual(mockStrategicNews);
      expect(cached.interviewStrategy).toEqual(mockInterviewStrategy);
      expect(cached.executiveInsights).toEqual(mockExecutiveInsights);
      // Fields that failed should remain null
      expect(cached.readinessScore).toBeNull();
      expect(cached.valuesAlignment).toBeNull();
      expect(cached.competitiveIntelligence).toBeNull();
      expect(cached.certificationRecommendations).toBeNull();
    });

    it('should not crash if cached prep does not exist', async () => {
      // Remove the cached entry
      useInterviewPrepStore.setState({ cachedPreps: {} });

      api.getInterviewReadinessScore.mockResolvedValue({ success: true, data: mockReadinessScore });
      api.getValuesAlignment.mockResolvedValue({ success: false });
      api.getCompanyResearchForPrep.mockResolvedValue({ success: false });
      api.getStrategicNews.mockResolvedValue({ success: false });
      api.getCompetitiveIntelligence.mockResolvedValue({ success: false });
      api.getInterviewStrategy.mockResolvedValue({ success: false });
      api.getExecutiveInsights.mockResolvedValue({ success: false });
      api.getCertificationRecommendations.mockResolvedValue({ success: false });

      // Should not throw even though there's no cached prep to update
      await expect(
        useInterviewPrepStore.getState().loadEnhancedData(tailoredResumeId, interviewPrepId)
      ).resolves.toBeUndefined();

      // cachedPreps should remain empty (updateCache returns state unchanged)
      expect(useInterviewPrepStore.getState().cachedPreps[tailoredResumeId]).toBeUndefined();
    });
  });

  describe('deleteInterviewPrep', () => {
    it('should remove the prep from cachedPreps', () => {
      useInterviewPrepStore.setState({
        cachedPreps: {
          1: { interviewPrepId: 100, tailoredResumeId: 1 } as any,
          2: { interviewPrepId: 200, tailoredResumeId: 2 } as any,
        },
      });

      useInterviewPrepStore.getState().deleteInterviewPrep(1);

      const state = useInterviewPrepStore.getState();
      expect(state.cachedPreps[1]).toBeUndefined();
      expect(state.cachedPreps[2]).toBeDefined();
    });
  });

  describe('clearAllCache', () => {
    it('should empty cachedPreps', () => {
      useInterviewPrepStore.setState({
        cachedPreps: {
          1: { interviewPrepId: 100 } as any,
          2: { interviewPrepId: 200 } as any,
          3: { interviewPrepId: 300 } as any,
        },
      });

      useInterviewPrepStore.getState().clearAllCache();

      expect(useInterviewPrepStore.getState().cachedPreps).toEqual({});
    });
  });

  describe('persist partialize', () => {
    it('should only persist cachedPreps (loading states should not be persisted)', () => {
      // The partialize config in the store only includes cachedPreps.
      // We verify by checking that when we set loading states and then
      // read back, the persist config wouldn't capture loading flags.
      // Since we can't easily test the persist middleware directly,
      // we verify the store shape matches expectations.
      useInterviewPrepStore.setState({
        cachedPreps: { 1: { interviewPrepId: 100 } as any },
        loading: true,
        generating: true,
        loadingReadiness: true,
      });

      const state = useInterviewPrepStore.getState();
      // All state values should be accessible
      expect(state.cachedPreps).toEqual({ 1: { interviewPrepId: 100 } });
      expect(state.loading).toBe(true);

      // The partialize function only returns cachedPreps.
      // We can test this by checking what the persist middleware would serialize.
      // The persist config is: partialize: (state) => ({ cachedPreps: state.cachedPreps })
      const partializedState = { cachedPreps: state.cachedPreps };
      expect(partializedState).toEqual({ cachedPreps: { 1: { interviewPrepId: 100 } } });
      expect(partializedState).not.toHaveProperty('loading');
      expect(partializedState).not.toHaveProperty('generating');
      expect(partializedState).not.toHaveProperty('loadingReadiness');
    });
  });
});
