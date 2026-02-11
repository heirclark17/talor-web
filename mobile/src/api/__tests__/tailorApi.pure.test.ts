/**
 * Pure unit tests for tailorApi (src/api/tailorApi.ts)
 * Tests the thin wrapper functions around the base API utilities
 */

jest.mock('../base', () => ({
  get: jest.fn(),
  post: jest.fn(),
  fetchWithAuth: jest.fn(),
  snakeToCamel: jest.fn((x: any) => x),
}));

import {
  extractJobDetails,
  tailorResume,
  getTailoredResume,
  getTailoredResumes,
  tailorResumeBatch,
  exportTailoredResume,
  getKeywordAnalysis,
  updateTailoredResume,
} from '../tailorApi';

const { get, post, fetchWithAuth, snakeToCamel } = require('../base');

describe('tailorApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractJobDetails', () => {
    it('should call fetchWithAuth with /api/jobs/extract', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          company: 'TestCorp',
          job_title: 'Engineer',
          description: 'Build things',
          location: 'Remote',
          salary: '$150k',
        }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await extractJobDetails('https://example.com/job/123');

      expect(fetchWithAuth).toHaveBeenCalledWith('/api/jobs/extract', {
        method: 'POST',
        body: { job_url: 'https://example.com/job/123' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        company: 'TestCorp',
        title: 'Engineer',
        description: 'Build things',
        location: 'Remote',
        salary: '$150k',
      });
    });

    it('should return error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({ error: 'Could not parse job' }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await extractJobDetails('https://example.com/bad');

      expect(result.success).toBe(false);
    });

    it('should return error on network failure', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      fetchWithAuth.mockRejectedValue(new Error('Network error'));

      const result = await extractJobDetails('https://example.com/job/123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      (console.error as jest.Mock).mockRestore();
    });
  });

  describe('tailorResume', () => {
    it('should call fetchWithAuth with /api/tailor/tailor', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ id: 1, job_title: 'Engineer' }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      await tailorResume({
        baseResumeId: 5,
        jobUrl: 'https://example.com/job/1',
        company: 'TestCorp',
        jobTitle: 'Engineer',
      });

      expect(fetchWithAuth).toHaveBeenCalledWith('/api/tailor/tailor', {
        method: 'POST',
        body: {
          base_resume_id: 5,
          job_url: 'https://example.com/job/1',
          company: 'TestCorp',
          job_title: 'Engineer',
          job_description: undefined,
        },
      });
    });

    it('should apply snakeToCamel on successful response', async () => {
      const mockData = { id: 1, job_title: 'Engineer' };
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue(mockData),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      await tailorResume({ baseResumeId: 5 });

      expect(snakeToCamel).toHaveBeenCalledWith(mockData);
    });
  });

  describe('getTailoredResume', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { id: 20 } });

      await getTailoredResume(20);

      expect(get).toHaveBeenCalledWith('/api/tailor/tailored/20');
    });
  });

  describe('getTailoredResumes', () => {
    it('should call get without query param when no baseResumeId is provided', async () => {
      get.mockResolvedValue({ success: true, data: [] });

      await getTailoredResumes();

      expect(get).toHaveBeenCalledWith('/api/tailor/tailored-resumes');
    });

    it('should add query param when baseResumeId is provided', async () => {
      get.mockResolvedValue({ success: true, data: [] });

      await getTailoredResumes(10);

      expect(get).toHaveBeenCalledWith('/api/tailor/tailored-resumes?base_resume_id=10');
    });
  });

  describe('tailorResumeBatch', () => {
    it('should reject more than 10 URLs', async () => {
      const tooManyUrls = Array.from({ length: 11 }, (_, i) => `https://example.com/job/${i}`);

      const result = await tailorResumeBatch({
        baseResumeId: 1,
        jobUrls: tooManyUrls,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Maximum 10 job URLs allowed');
      expect(post).not.toHaveBeenCalled();
    });

    it('should call post for valid request', async () => {
      const validUrls = ['https://example.com/job/1', 'https://example.com/job/2'];
      post.mockResolvedValue({ success: true, data: { successful: [], failed: [] } });

      await tailorResumeBatch({
        baseResumeId: 5,
        jobUrls: validUrls,
      });

      expect(post).toHaveBeenCalledWith('/api/tailor/batch', {
        base_resume_id: 5,
        job_urls: validUrls,
      });
    });
  });

  describe('exportTailoredResume', () => {
    it('should call get with format query param', async () => {
      get.mockResolvedValue({ success: true, data: { url: 'https://cdn.example.com/resume.pdf' } });

      await exportTailoredResume(30, 'pdf');

      expect(get).toHaveBeenCalledWith('/api/tailor/tailored/30/export?format=pdf');
    });

    it('should support docx format', async () => {
      get.mockResolvedValue({ success: true, data: { url: 'https://cdn.example.com/resume.docx' } });

      await exportTailoredResume(30, 'docx');

      expect(get).toHaveBeenCalledWith('/api/tailor/tailored/30/export?format=docx');
    });
  });

  describe('getKeywordAnalysis', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({
        success: true,
        data: { matchedKeywords: ['React'], missingKeywords: ['Vue'], score: 80, suggestions: [] },
      });

      await getKeywordAnalysis(15);

      expect(get).toHaveBeenCalledWith('/api/tailor/tailored/15/keywords');
    });
  });

  describe('updateTailoredResume', () => {
    it('should call post with correct endpoint and updates', async () => {
      post.mockResolvedValue({ success: true, data: { id: 10 } });

      await updateTailoredResume(10, { jobTitle: 'Senior Engineer', company: 'NewCorp' });

      expect(post).toHaveBeenCalledWith('/api/tailor/tailored/10/update', {
        jobTitle: 'Senior Engineer',
        company: 'NewCorp',
      });
    });
  });

  describe('extractJobDetails - data.success false branch', () => {
    it('should return error when data.success is false even if response.ok', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: false, error: 'Parse error' }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await extractJobDetails('https://example.com/job/bad');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Parse error');
    });

    it('should use default error when no error field', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ success: false }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await extractJobDetails('https://example.com/job/bad');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to extract job details');
    });
  });

  describe('tailorResume - error paths', () => {
    it('should return error when response is not ok', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValue({ error: 'Server error' }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await tailorResume({ baseResumeId: 1 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('should use detail field when error field is missing', async () => {
      const mockResponse = {
        ok: false,
        status: 422,
        json: jest.fn().mockResolvedValue({ detail: 'Validation failed' }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await tailorResume({ baseResumeId: 1 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });

    it('should use status code when no error or detail', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
        json: jest.fn().mockResolvedValue({}),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await tailorResume({ baseResumeId: 1 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error: 503');
    });

    it('should return error on network failure', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      fetchWithAuth.mockRejectedValue(new Error('Connection refused'));

      const result = await tailorResume({ baseResumeId: 1 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Connection refused');
      (console.error as jest.Mock).mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      fetchWithAuth.mockRejectedValue('string error');

      const result = await tailorResume({ baseResumeId: 1 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
      (console.error as jest.Mock).mockRestore();
    });
  });

  describe('tailorResumeBatch - edge cases', () => {
    it('should allow exactly 10 URLs', async () => {
      const tenUrls = Array.from({ length: 10 }, (_, i) => `https://example.com/job/${i}`);
      post.mockResolvedValue({ success: true, data: { successful: [], failed: [] } });

      const result = await tailorResumeBatch({
        baseResumeId: 1,
        jobUrls: tenUrls,
      });

      expect(post).toHaveBeenCalled();
    });
  });

  describe('module exports', () => {
    it('should export tailorApi as default and named export', () => {
      const mod = require('../tailorApi');
      expect(mod.default).toBeDefined();
      expect(mod.tailorApi).toBeDefined();
      expect(mod.tailorApi.extractJobDetails).toBeDefined();
      expect(mod.tailorApi.tailorResume).toBeDefined();
      expect(mod.tailorApi.getTailoredResume).toBeDefined();
      expect(mod.tailorApi.getTailoredResumes).toBeDefined();
      expect(mod.tailorApi.tailorResumeBatch).toBeDefined();
      expect(mod.tailorApi.getKeywordAnalysis).toBeDefined();
      expect(mod.tailorApi.updateTailoredResume).toBeDefined();
      expect(mod.tailorApi.exportTailoredResume).toBeDefined();
    });
  });
});
