/**
 * Pure unit tests for resumeApi (src/api/resumeApi.ts)
 * Tests the thin wrapper functions around the base API utilities
 */

jest.mock('../base', () => ({
  get: jest.fn(),
  post: jest.fn(),
  fetchWithAuth: jest.fn(),
}));

import { getResumes, getResume, uploadResume, deleteResume, getResumeAnalysis } from '../resumeApi';
const { get, post, fetchWithAuth } = require('../base');

describe('resumeApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getResumes', () => {
    it('should call fetchWithAuth with /api/resumes/list', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ resumes: [{ id: 1 }] }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      await getResumes();

      expect(fetchWithAuth).toHaveBeenCalledWith('/api/resumes/list');
    });

    it('should extract resumes from json response', async () => {
      const mockResumes = [
        { id: 1, fileName: 'resume1.pdf' },
        { id: 2, fileName: 'resume2.pdf' },
      ];
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ resumes: mockResumes }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await getResumes();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResumes);
    });

    it('should return empty array when resumes key is missing', async () => {
      const mockResponse = {
        json: jest.fn().mockResolvedValue({}),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await getResumes();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should return empty array on error', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      fetchWithAuth.mockRejectedValue(new Error('Network error'));

      const result = await getResumes();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Network error');
      (console.error as jest.Mock).mockRestore();
    });
  });

  describe('getResume', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { id: 42 } });

      await getResume(42);

      expect(get).toHaveBeenCalledWith('/api/resumes/42');
    });
  });

  describe('uploadResume', () => {
    it('should call post with formData', async () => {
      const formData = new FormData();
      post.mockResolvedValue({ success: true, data: { id: 1 } });

      await uploadResume(formData);

      expect(post).toHaveBeenCalledWith('/api/resumes/upload', formData);
    });
  });

  describe('deleteResume', () => {
    it('should call post with correct endpoint', async () => {
      post.mockResolvedValue({ success: true });

      await deleteResume(7);

      expect(post).toHaveBeenCalledWith('/api/resumes/7/delete');
    });
  });

  describe('getResumeAnalysis', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { overallScore: 85 } });

      await getResumeAnalysis(15);

      expect(get).toHaveBeenCalledWith('/api/resumes/15/analysis');
    });
  });

  describe('getResumes - non-Error exception', () => {
    it('should handle non-Error thrown values', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      fetchWithAuth.mockRejectedValue('string error');

      const result = await getResumes();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
      (console.error as jest.Mock).mockRestore();
    });
  });

  describe('module exports', () => {
    it('should export resumeApi as default and named export', () => {
      const mod = require('../resumeApi');
      expect(mod.default).toBeDefined();
      expect(mod.resumeApi).toBeDefined();
      expect(mod.resumeApi.getResumes).toBeDefined();
      expect(mod.resumeApi.getResume).toBeDefined();
      expect(mod.resumeApi.uploadResume).toBeDefined();
      expect(mod.resumeApi.deleteResume).toBeDefined();
      expect(mod.resumeApi.getResumeAnalysis).toBeDefined();
    });
  });
});
