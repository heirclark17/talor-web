/**
 * Comprehensive tests for useInterviewPrepData hook
 *
 * Migrated from @testing-library/react-hooks (incompatible with React 19)
 * to @testing-library/react-native which natively supports React 19.
 *
 * Key changes:
 * - Import renderHook/act/waitFor from @testing-library/react-native
 * - Replace waitForNextUpdate() with waitFor(() => expect(...)) pattern
 * - Use act(async () => {...}) for async state updates
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useInterviewPrepData } from '../useInterviewPrepData';
import { interviewApi } from '../../../api';

// Mock the interview API
jest.mock('../../../api', () => ({
  interviewApi: {
    getInterviewPrep: jest.fn(),
    getCompanyResearch: jest.fn(),
    getValuesAlignment: jest.fn(),
    getReadinessScore: jest.fn(),
  },
}));

const mockInterviewApi = interviewApi as unknown as {
  getInterviewPrep: jest.Mock;
  getCompanyResearch: jest.Mock;
  getValuesAlignment: jest.Mock;
  getReadinessScore: jest.Mock;
};

const mockPrepData = {
  id: 1,
  tailoredResumeId: 42,
  company: 'Acme Corp',
  jobTitle: 'Senior Security Engineer',
  createdAt: '2026-01-01T00:00:00Z',
  companyProfile: {
    name: 'Acme Corp',
    industry: 'Technology',
    locations: ['San Francisco, CA'],
    sizeEstimate: '1000-5000',
    overviewParagraph: 'Leading tech company',
  },
};

const mockCompanyResearch = {
  overview: 'Company overview',
  recent_news: [],
  values: [],
};

const mockValuesAlignment = {
  company_values: [],
  your_alignment: [],
  talking_points: [],
};

const mockReadinessScore = {
  overall_score: 85,
  breakdown: {},
  recommendations: [],
};

describe('useInterviewPrepData hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization and data fetching', () => {
    it('should start with loading state', () => {
      // Use a promise that never resolves so the hook stays in loading state
      mockInterviewApi.getInterviewPrep.mockReturnValue(
        new Promise(() => {})
      );

      const { result } = renderHook(() => useInterviewPrepData(1));

      expect(result.current.isLoading).toBe(true);
      expect(result.current.prepData).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should fetch prep data on mount', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockInterviewApi.getInterviewPrep).toHaveBeenCalledWith(1);
      expect(result.current.prepData).toEqual(mockPrepData);
      expect(result.current.error).toBeNull();
    });

    it('should handle API error response', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: false,
        error: 'Failed to load data',
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.prepData).toBeNull();
      expect(result.current.error).toBe('Failed to load data');
    });

    it('should handle API error response with no error message', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.prepData).toBeNull();
      expect(result.current.error).toBe('Failed to fetch interview prep data');
    });

    it('should handle API exception', async () => {
      mockInterviewApi.getInterviewPrep.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.prepData).toBeNull();
      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error exception', async () => {
      mockInterviewApi.getInterviewPrep.mockRejectedValue('String error');

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Unknown error');
    });

    it('should handle missing data in successful response', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: null,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // success: true but data: null falls through to the else branch
      // because `response.success && response.data` is falsy when data is null
      expect(result.current.prepData).toBeNull();
    });

    it('should handle success with undefined data', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        // data is undefined
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.prepData).toBeNull();
    });
  });

  describe('loading states', () => {
    it('should initialize all loading states to false', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      // Even before fetch completes, section loading states should be false
      expect(result.current.loadingStates).toEqual({
        companyResearch: false,
        valuesAlignment: false,
        readinessScore: false,
        commonQuestions: false,
        behavioralQuestions: false,
        technicalQuestions: false,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Still false after fetch completes
      expect(result.current.loadingStates).toEqual({
        companyResearch: false,
        valuesAlignment: false,
        readinessScore: false,
        commonQuestions: false,
        behavioralQuestions: false,
        technicalQuestions: false,
      });
    });
  });

  describe('fetchPrepData action', () => {
    it('should refetch prep data when called', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      jest.clearAllMocks();

      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: { ...mockPrepData, company: 'New Corp' },
      });

      await act(async () => {
        await result.current.fetchPrepData();
      });

      expect(mockInterviewApi.getInterviewPrep).toHaveBeenCalledWith(1);
      expect(result.current.prepData).toEqual({
        ...mockPrepData,
        company: 'New Corp',
      });
    });

    it('should clear error before fetching', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValueOnce({
        success: false,
        error: 'Initial error',
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Initial error');

      mockInterviewApi.getInterviewPrep.mockResolvedValueOnce({
        success: true,
        data: mockPrepData,
      });

      await act(async () => {
        await result.current.fetchPrepData();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.prepData).toEqual(mockPrepData);
    });

    it('should set isLoading to true during refetch', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let resolveRefetch: (value: any) => void;
      mockInterviewApi.getInterviewPrep.mockReturnValue(
        new Promise((resolve) => {
          resolveRefetch = resolve;
        })
      );

      // Start refetch but don't await completion
      let fetchPromise: Promise<void>;
      act(() => {
        fetchPromise = result.current.fetchPrepData();
      });

      // isLoading should be true during refetch
      expect(result.current.isLoading).toBe(true);

      // Resolve and complete
      await act(async () => {
        resolveRefetch!({ success: true, data: mockPrepData });
        await fetchPromise!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('refreshCompanyResearch action', () => {
    it('should fetch company research when prepData exists', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getCompanyResearch.mockResolvedValue({
        success: true,
        data: mockCompanyResearch,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshCompanyResearch();
      });

      expect(mockInterviewApi.getCompanyResearch).toHaveBeenCalledWith({
        companyName: 'Acme Corp',
        jobTitle: 'Senior Security Engineer',
      });
      expect(result.current.prepData?.companyResearch).toEqual(
        mockCompanyResearch
      );
    });

    it('should set loading state during fetch', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      let resolveResearch: (value: any) => void;
      mockInterviewApi.getCompanyResearch.mockReturnValue(
        new Promise((resolve) => {
          resolveResearch = resolve;
        })
      );

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshPromise: Promise<void>;
      act(() => {
        refreshPromise = result.current.refreshCompanyResearch();
      });

      expect(result.current.loadingStates.companyResearch).toBe(true);

      await act(async () => {
        resolveResearch!({ success: true, data: mockCompanyResearch });
        await refreshPromise!;
      });

      expect(result.current.loadingStates.companyResearch).toBe(false);
    });

    it('should not fetch if prepData is null', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: null,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshCompanyResearch();
      });

      expect(mockInterviewApi.getCompanyResearch).not.toHaveBeenCalled();
    });

    it('should not fetch if prepData.company is missing', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: { ...mockPrepData, company: '' },
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshCompanyResearch();
      });

      expect(mockInterviewApi.getCompanyResearch).not.toHaveBeenCalled();
    });

    it('should handle fetch error gracefully', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getCompanyResearch.mockRejectedValue(
        new Error('Fetch failed')
      );

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshCompanyResearch();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error refreshing company research:',
        expect.any(Error)
      );
      // Loading state should be reset after error
      expect(result.current.loadingStates.companyResearch).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should not update prepData if response is unsuccessful', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getCompanyResearch.mockResolvedValue({
        success: false,
        error: 'Not found',
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshCompanyResearch();
      });

      // prepData should not have companyResearch added
      expect(result.current.prepData?.companyResearch).toBeUndefined();
    });

    it('should not update prepData if response data is null', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getCompanyResearch.mockResolvedValue({
        success: true,
        data: null,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshCompanyResearch();
      });

      // Should not crash, companyResearch should not be set
      expect(result.current.prepData?.companyResearch).toBeFalsy();
    });
  });

  describe('refreshValuesAlignment action', () => {
    it('should fetch values alignment', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getValuesAlignment.mockResolvedValue({
        success: true,
        data: mockValuesAlignment,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshValuesAlignment();
      });

      expect(mockInterviewApi.getValuesAlignment).toHaveBeenCalledWith(1);
      expect(result.current.prepData?.valuesAlignment).toEqual(
        mockValuesAlignment
      );
    });

    it('should set loading state during fetch', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      let resolveAlignment: (value: any) => void;
      mockInterviewApi.getValuesAlignment.mockReturnValue(
        new Promise((resolve) => {
          resolveAlignment = resolve;
        })
      );

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshPromise: Promise<void>;
      act(() => {
        refreshPromise = result.current.refreshValuesAlignment();
      });

      expect(result.current.loadingStates.valuesAlignment).toBe(true);

      await act(async () => {
        resolveAlignment!({ success: true, data: mockValuesAlignment });
        await refreshPromise!;
      });

      expect(result.current.loadingStates.valuesAlignment).toBe(false);
    });

    it('should handle fetch error gracefully', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getValuesAlignment.mockRejectedValue(
        new Error('Fetch failed')
      );

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshValuesAlignment();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error refreshing values alignment:',
        expect.any(Error)
      );
      expect(result.current.loadingStates.valuesAlignment).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should not update prepData if response is unsuccessful', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getValuesAlignment.mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshValuesAlignment();
      });

      expect(result.current.prepData?.valuesAlignment).toBeUndefined();
    });

    it('should work when prepData is null (still sets loading states)', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: false,
        error: 'Not found',
      });
      mockInterviewApi.getValuesAlignment.mockResolvedValue({
        success: true,
        data: mockValuesAlignment,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // prepData is null, but refreshValuesAlignment still runs (no guard for null)
      await act(async () => {
        await result.current.refreshValuesAlignment();
      });

      // setPrepData updater returns null when prev is null
      expect(result.current.prepData).toBeNull();
    });
  });

  describe('refreshReadinessScore action', () => {
    it('should fetch readiness score', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getReadinessScore.mockResolvedValue({
        success: true,
        data: mockReadinessScore,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshReadinessScore();
      });

      expect(mockInterviewApi.getReadinessScore).toHaveBeenCalledWith(1);
      expect(result.current.prepData?.readinessScore).toEqual(
        mockReadinessScore
      );
    });

    it('should set loading state during fetch', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      let resolveScore: (value: any) => void;
      mockInterviewApi.getReadinessScore.mockReturnValue(
        new Promise((resolve) => {
          resolveScore = resolve;
        })
      );

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshPromise: Promise<void>;
      act(() => {
        refreshPromise = result.current.refreshReadinessScore();
      });

      expect(result.current.loadingStates.readinessScore).toBe(true);

      await act(async () => {
        resolveScore!({ success: true, data: mockReadinessScore });
        await refreshPromise!;
      });

      expect(result.current.loadingStates.readinessScore).toBe(false);
    });

    it('should handle fetch error gracefully', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getReadinessScore.mockRejectedValue(
        new Error('Fetch failed')
      );

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshReadinessScore();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error refreshing readiness score:',
        expect.any(Error)
      );
      expect(result.current.loadingStates.readinessScore).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should not update prepData if response is unsuccessful', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getReadinessScore.mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshReadinessScore();
      });

      expect(result.current.prepData?.readinessScore).toBeUndefined();
    });

    it('should work when prepData is null (still sets loading states)', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: false,
        error: 'Not found',
      });
      mockInterviewApi.getReadinessScore.mockResolvedValue({
        success: true,
        data: mockReadinessScore,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshReadinessScore();
      });

      // setPrepData updater returns null when prev is null
      expect(result.current.prepData).toBeNull();
    });
  });

  describe('clearError action', () => {
    it('should clear error state', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: false,
        error: 'Test error',
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should be a no-op when error is already null', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('prepId changes', () => {
    it('should refetch when prepId changes', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      const { result, rerender } = renderHook(
        ({ id }: { id: number }) => useInterviewPrepData(id),
        { initialProps: { id: 1 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockInterviewApi.getInterviewPrep).toHaveBeenCalledWith(1);

      jest.clearAllMocks();

      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: { ...mockPrepData, id: 2 },
      });

      rerender({ id: 2 });

      await waitFor(() => {
        expect(mockInterviewApi.getInterviewPrep).toHaveBeenCalledWith(2);
      });
    });
  });

  describe('return value shape', () => {
    it('should return all expected properties', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Data properties
      expect(result.current).toHaveProperty('prepData');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('loadingStates');

      // Action properties
      expect(typeof result.current.fetchPrepData).toBe('function');
      expect(typeof result.current.refreshCompanyResearch).toBe('function');
      expect(typeof result.current.refreshValuesAlignment).toBe('function');
      expect(typeof result.current.refreshReadinessScore).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('default export', () => {
    it('should export useInterviewPrepData as default', () => {
      const defaultExport = require('../useInterviewPrepData').default;
      expect(defaultExport).toBe(useInterviewPrepData);
    });
  });

  describe('type exports', () => {
    it('should export type interfaces via the module', () => {
      const mod = require('../useInterviewPrepData');
      // useInterviewPrepData is a named export
      expect(typeof mod.useInterviewPrepData).toBe('function');
    });
  });

  describe('concurrent refresh operations', () => {
    it('should handle multiple refresh operations simultaneously', async () => {
      mockInterviewApi.getInterviewPrep.mockResolvedValue({
        success: true,
        data: mockPrepData,
      });
      mockInterviewApi.getCompanyResearch.mockResolvedValue({
        success: true,
        data: mockCompanyResearch,
      });
      mockInterviewApi.getValuesAlignment.mockResolvedValue({
        success: true,
        data: mockValuesAlignment,
      });
      mockInterviewApi.getReadinessScore.mockResolvedValue({
        success: true,
        data: mockReadinessScore,
      });

      const { result } = renderHook(() => useInterviewPrepData(1));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await Promise.all([
          result.current.refreshCompanyResearch(),
          result.current.refreshValuesAlignment(),
          result.current.refreshReadinessScore(),
        ]);
      });

      expect(result.current.prepData?.companyResearch).toEqual(
        mockCompanyResearch
      );
      expect(result.current.prepData?.valuesAlignment).toEqual(
        mockValuesAlignment
      );
      expect(result.current.prepData?.readinessScore).toEqual(
        mockReadinessScore
      );

      // All loading states should be false after completion
      expect(result.current.loadingStates.companyResearch).toBe(false);
      expect(result.current.loadingStates.valuesAlignment).toBe(false);
      expect(result.current.loadingStates.readinessScore).toBe(false);
    });
  });
});
