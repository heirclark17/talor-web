/**
 * Pure unit tests for interviewApi (src/api/interviewApi.ts)
 * Tests the thin wrapper functions around the base API utilities
 */

jest.mock('../base', () => ({
  get: jest.fn(),
  post: jest.fn(),
  fetchWithAuth: jest.fn(),
  snakeToCamel: jest.fn((x: any) => x),
}));

import {
  getInterviewPreps,
  getInterviewPrep,
  generateInterviewPrep,
  deleteInterviewPrep,
  getCommonQuestions,
  getBehavioralQuestions,
  getTechnicalQuestions,
  regenerateQuestion,
  generatePracticeQuestions,
  generatePracticeStarStory,
  savePracticeResponse,
  getPracticeHistory,
  getCompanyResearch,
  getCompanyNews,
  getValuesAlignment,
  getReadinessScore,
  getInterviewStrategy,
  getCompetitiveIntelligence,
} from '../interviewApi';

const { get, post, fetchWithAuth, snakeToCamel } = require('../base');

describe('interviewApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInterviewPreps', () => {
    it('should call fetchWithAuth and extract interview_preps', async () => {
      const mockPreps = [{ id: 1, company: 'TestCorp' }];
      const mockResponse = {
        json: jest.fn().mockResolvedValue({ interview_preps: mockPreps }),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await getInterviewPreps();

      expect(fetchWithAuth).toHaveBeenCalledWith('/api/interview-prep/list');
      expect(result.success).toBe(true);
      expect(snakeToCamel).toHaveBeenCalledWith(mockPreps);
    });

    it('should fall back to json root if interview_preps key is missing', async () => {
      const mockData = [{ id: 2 }];
      const mockResponse = {
        json: jest.fn().mockResolvedValue(mockData),
      };
      fetchWithAuth.mockResolvedValue(mockResponse);

      const result = await getInterviewPreps();

      expect(result.success).toBe(true);
      // Falls back to json || [] which is the array itself
      expect(snakeToCamel).toHaveBeenCalledWith(mockData);
    });

    it('should return empty array on error', async () => {
      jest.spyOn(console, 'error').mockImplementation();
      fetchWithAuth.mockRejectedValue(new Error('Network error'));

      const result = await getInterviewPreps();

      expect(result.success).toBe(false);
      expect(result.data).toEqual([]);
      expect(result.error).toBe('Network error');
      (console.error as jest.Mock).mockRestore();
    });
  });

  describe('getInterviewPrep', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { id: 5 } });

      await getInterviewPrep(5);

      expect(get).toHaveBeenCalledWith('/api/interview-prep/5');
    });
  });

  describe('generateInterviewPrep', () => {
    it('should call post with tailored_resume_id', async () => {
      post.mockResolvedValue({ success: true, data: { id: 10 } });

      await generateInterviewPrep(42);

      expect(post).toHaveBeenCalledWith('/api/interview-prep/generate', {
        tailored_resume_id: 42,
      });
    });
  });

  describe('deleteInterviewPrep', () => {
    it('should call post with correct endpoint', async () => {
      post.mockResolvedValue({ success: true });

      await deleteInterviewPrep(7);

      expect(post).toHaveBeenCalledWith('/api/interview-prep/7/delete');
    });
  });

  describe('getCommonQuestions', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { questions: [] } });

      await getCommonQuestions(3);

      expect(get).toHaveBeenCalledWith('/api/interview-prep/3/common-questions');
    });
  });

  describe('getBehavioralQuestions', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { questions: [] } });

      await getBehavioralQuestions(4);

      expect(get).toHaveBeenCalledWith('/api/interview-prep/4/behavioral-questions');
    });
  });

  describe('getTechnicalQuestions', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { questions: [] } });

      await getTechnicalQuestions(6);

      expect(get).toHaveBeenCalledWith('/api/interview-prep/6/technical-questions');
    });
  });

  describe('regenerateQuestion', () => {
    it('should call post with correct endpoint', async () => {
      post.mockResolvedValue({ success: true, data: { id: 1 } });

      await regenerateQuestion(10, 25);

      expect(post).toHaveBeenCalledWith('/api/interview-prep/10/questions/25/regenerate');
    });
  });

  describe('savePracticeResponse', () => {
    it('should call post with correct params', async () => {
      post.mockResolvedValue({ success: true, data: { id: 1, timesPracticed: 3 } });

      await savePracticeResponse({
        interviewPrepId: 5,
        questionText: 'Tell me about yourself',
        questionCategory: 'behavioral',
        starStory: { situation: 'S', task: 'T', action: 'A', result: 'R' },
        writtenAnswer: 'My answer',
        practiceDurationSeconds: 120,
      });

      expect(post).toHaveBeenCalledWith('/api/interview-prep/save-practice-response', {
        interview_prep_id: 5,
        question_text: 'Tell me about yourself',
        question_category: 'behavioral',
        star_story: { situation: 'S', task: 'T', action: 'A', result: 'R' },
        written_answer: 'My answer',
        practice_duration_seconds: 120,
      });
    });
  });

  describe('getPracticeHistory', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { history: [] } });

      await getPracticeHistory(8);

      expect(get).toHaveBeenCalledWith('/api/interview-prep/8/practice-history');
    });
  });

  describe('getValuesAlignment', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { alignmentScore: 80 } });

      await getValuesAlignment(12);

      expect(get).toHaveBeenCalledWith('/api/interview-prep/12/values-alignment');
    });
  });

  describe('getReadinessScore', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { confidenceLevel: 75 } });

      await getReadinessScore(15);

      expect(get).toHaveBeenCalledWith('/api/interview-prep/15/readiness-score');
    });
  });

  describe('generatePracticeQuestions', () => {
    it('should call post with prepId and default num_questions', async () => {
      post.mockResolvedValue({ success: true, data: { questions: [] } });

      await generatePracticeQuestions(5);

      expect(post).toHaveBeenCalledWith('/api/interview-prep/generate-practice-questions', {
        interview_prep_id: 5,
        num_questions: 10,
      });
    });

    it('should use custom numQuestions when provided', async () => {
      post.mockResolvedValue({ success: true, data: { questions: [] } });

      await generatePracticeQuestions(5, 20);

      expect(post).toHaveBeenCalledWith('/api/interview-prep/generate-practice-questions', {
        interview_prep_id: 5,
        num_questions: 20,
      });
    });
  });

  describe('generatePracticeStarStory', () => {
    it('should call post with prepId and question', async () => {
      post.mockResolvedValue({ success: true, data: { situation: 'S' } });

      await generatePracticeStarStory(3, 'Tell me about a challenge');

      expect(post).toHaveBeenCalledWith('/api/interview-prep/generate-practice-star-story', {
        interview_prep_id: 3,
        question: 'Tell me about a challenge',
      });
    });
  });

  describe('getCompanyResearch', () => {
    it('should call post with company params', async () => {
      post.mockResolvedValue({ success: true, data: { companyProfile: {} } });

      await getCompanyResearch({
        companyName: 'TestCorp',
        industry: 'tech',
        jobTitle: 'Engineer',
      });

      expect(post).toHaveBeenCalledWith('/api/interview-prep/company-research', {
        company_name: 'TestCorp',
        industry: 'tech',
        job_title: 'Engineer',
      });
    });

    it('should handle optional params', async () => {
      post.mockResolvedValue({ success: true, data: {} });

      await getCompanyResearch({ companyName: 'TestCorp' });

      expect(post).toHaveBeenCalledWith('/api/interview-prep/company-research', {
        company_name: 'TestCorp',
        industry: undefined,
        job_title: undefined,
      });
    });
  });

  describe('getCompanyNews', () => {
    it('should call post with company news params', async () => {
      post.mockResolvedValue({ success: true, data: { newsItems: [] } });

      await getCompanyNews({
        companyName: 'TestCorp',
        industry: 'tech',
        jobTitle: 'PM',
        daysBack: 30,
      });

      expect(post).toHaveBeenCalledWith('/api/interview-prep/company-news', {
        company_name: 'TestCorp',
        industry: 'tech',
        job_title: 'PM',
        days_back: 30,
      });
    });

    it('should default daysBack to 90', async () => {
      post.mockResolvedValue({ success: true, data: { newsItems: [] } });

      await getCompanyNews({ companyName: 'TestCorp' });

      expect(post).toHaveBeenCalledWith('/api/interview-prep/company-news', {
        company_name: 'TestCorp',
        industry: undefined,
        job_title: undefined,
        days_back: 90,
      });
    });
  });

  describe('getInterviewStrategy', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { strategy: {} } });

      await getInterviewStrategy(20);

      expect(get).toHaveBeenCalledWith('/api/interview-prep/20/interview-strategy');
    });
  });

  describe('getCompetitiveIntelligence', () => {
    it('should call get with correct endpoint', async () => {
      get.mockResolvedValue({ success: true, data: { intelligence: {} } });

      await getCompetitiveIntelligence(25);

      expect(get).toHaveBeenCalledWith('/api/interview-prep/25/competitive-intelligence');
    });
  });
});
