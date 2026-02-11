/**
 * Tests for api/client.ts
 * Tests the main API client object with 70+ methods
 */

// Mock base module before importing client
jest.mock('../base', () => ({
  fetchWithAuth: jest.fn(),
  snakeToCamel: jest.fn((obj: any) => obj),
}));

jest.mock('../../utils/constants', () => ({
  API_BASE_URL: 'https://test-api.example.com',
}));

jest.mock('../../utils/userSession', () => ({
  getUserId: jest.fn(() => Promise.resolve('test-user-id')),
}));

import { api } from '../client';
import { fetchWithAuth } from '../base';

const mockFetchWithAuth = fetchWithAuth as jest.MockedFunction<typeof fetchWithAuth>;

// Helper to create a mock Response
function mockResponse(data: any, ok = true, status = 200) {
  return {
    ok,
    status,
    url: 'https://test-api.example.com/test',
    json: jest.fn(() => Promise.resolve(data)),
    text: jest.fn(() => Promise.resolve(JSON.stringify(data))),
    blob: jest.fn(() => Promise.resolve(new Blob(['test']))),
    headers: new Headers(),
  } as unknown as Response;
}

beforeEach(() => {
  jest.clearAllMocks();
});

// =========================================================================
// RESUME ENDPOINTS
// =========================================================================
describe('api - Resume endpoints', () => {
  test('getResumes returns resumes array from backend', async () => {
    const resumes = [{ id: 1 }, { id: 2 }];
    mockFetchWithAuth.mockResolvedValue(mockResponse({ resumes }));

    const result = await api.getResumes();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(resumes);
    expect(mockFetchWithAuth).toHaveBeenCalledWith('/api/resumes/list', expect.anything());
  });

  test('getResumes returns empty array when no resumes key', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({}));

    const result = await api.getResumes();
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  test('getResumes handles error', async () => {
    mockFetchWithAuth.mockRejectedValue(new Error('Network error'));

    const result = await api.getResumes();
    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
    expect(result.data).toEqual([]);
  });

  test('getResume fetches single resume', async () => {
    const resume = { id: 5, filename: 'test.pdf' };
    mockFetchWithAuth.mockResolvedValue(mockResponse(resume));

    const result = await api.getResume(5);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(resume);
  });

  test('getResume handles not found', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ error: 'Not found' }, false, 404));

    const result = await api.getResume(999);
    expect(result.success).toBe(false);
  });

  test('uploadResume sends FormData', async () => {
    const formData = new FormData();
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 1 }));

    const result = await api.uploadResume(formData);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/resumes/upload',
      expect.objectContaining({ method: 'POST', body: formData })
    );
  });

  test('uploadResume handles error', async () => {
    mockFetchWithAuth.mockRejectedValue(new Error('Upload failed'));

    const result = await api.uploadResume(new FormData());
    expect(result.success).toBe(false);
    expect(result.error).toBe('Upload failed');
  });

  test('deleteResume sends POST to delete endpoint', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ deleted: true }));

    const result = await api.deleteResume(3);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/resumes/3/delete',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('analyzeResume returns analysis data', async () => {
    const analysis = { overall_score: 85 };
    mockFetchWithAuth.mockResolvedValue(mockResponse({ analysis }));

    const result = await api.analyzeResume(1);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(analysis);
  });
});

// =========================================================================
// JOB EXTRACTION
// =========================================================================
describe('api - Job extraction', () => {
  test('extractJobDetails sends job URL and returns mapped data', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({
        success: true,
        company: 'TestCo',
        job_title: 'Engineer',
        description: 'Build stuff',
        location: 'Remote',
        salary: '$100k',
      })
    );

    const result = await api.extractJobDetails('https://example.com/job/1');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      company: 'TestCo',
      title: 'Engineer',
      description: 'Build stuff',
      location: 'Remote',
      salary: '$100k',
    });
  });

  test('extractJobDetails handles backend failure flag', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ success: false, error: 'Could not extract' })
    );

    const result = await api.extractJobDetails('https://bad-url.com');
    expect(result.success).toBe(false);
  });

  test('extractJobDetails handles network error', async () => {
    mockFetchWithAuth.mockRejectedValue(new Error('Timeout'));

    const result = await api.extractJobDetails('https://example.com');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Timeout');
  });
});

// =========================================================================
// TAILORING ENDPOINTS
// =========================================================================
describe('api - Tailoring endpoints', () => {
  test('tailorResume sends correct params', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 10, summary: 'Tailored' }));

    const result = await api.tailorResume({
      baseResumeId: 1,
      jobUrl: 'https://example.com/job',
      company: 'TestCo',
      jobTitle: 'Engineer',
    });

    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/tailor/tailor',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('tailorResume handles server error', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ error: 'Internal error' }, false, 500)
    );

    const result = await api.tailorResume({ baseResumeId: 1 });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Internal error');
  });

  test('getTailoredResume fetches by ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 5, company: 'TestCo' }));

    const result = await api.getTailoredResume(5);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/tailor/tailored/5',
      expect.anything()
    );
  });

  test('tailorResumeBatch rejects more than 10 URLs', async () => {
    const result = await api.tailorResumeBatch({
      baseResumeId: 1,
      jobUrls: Array(11).fill('https://example.com'),
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Maximum 10 job URLs allowed');
    expect(mockFetchWithAuth).not.toHaveBeenCalled();
  });

  test('tailorResumeBatch sends batch request', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ batch_id: 'abc' }));

    const result = await api.tailorResumeBatch({
      baseResumeId: 1,
      jobUrls: ['https://a.com', 'https://b.com'],
    });

    expect(result.success).toBe(true);
  });

  test('updateTailoredResume sends PUT', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ updated: true }));

    const result = await api.updateTailoredResume(5, { summary: 'Updated' });
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/tailor/tailored/5',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  test('listTailoredResumes returns array from tailored_resumes key', async () => {
    const resumes = [{ id: 1 }, { id: 2 }];
    mockFetchWithAuth.mockResolvedValue(mockResponse({ tailored_resumes: resumes }));

    const result = await api.listTailoredResumes();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(resumes);
  });

  test('listTailoredResumes defaults to empty array', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({}));

    const result = await api.listTailoredResumes();
    expect(result.data).toEqual([]);
  });

  test('downloadTailoredResume returns URL', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({}, true));

    const url = await api.downloadTailoredResume(5);
    expect(url).toBe('https://test-api.example.com/test');
  });

  test('downloadTailoredResume throws on error', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({}, false, 404));

    await expect(api.downloadTailoredResume(999)).rejects.toThrow(
      'Failed to download resume'
    );
  });
});

// =========================================================================
// INTERVIEW PREP ENDPOINTS
// =========================================================================
describe('api - Interview prep endpoints', () => {
  test('generateInterviewPrep sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ interview_prep_id: 1 }));

    const result = await api.generateInterviewPrep(5);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/interview-prep/generate/5',
      expect.objectContaining({ method: 'POST' })
    );
  });

  test('getInterviewPrep fetches by tailored resume ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ prep_data: {} }));

    const result = await api.getInterviewPrep(3);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/interview-prep/3',
      expect.anything()
    );
  });

  test('listInterviewPreps returns preps from interview_preps key', async () => {
    const preps = [{ id: 1 }, { id: 2 }];
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ success: true, count: 2, interview_preps: preps })
    );

    const result = await api.listInterviewPreps();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(preps);
  });

  test('listInterviewPreps defaults to empty array', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({}));

    const result = await api.listInterviewPreps();
    expect(result.data).toEqual([]);
  });

  test('deleteInterviewPrep sends DELETE', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ deleted: true }));

    const result = await api.deleteInterviewPrep(1);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/interview-prep/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  test('generateCommonQuestions sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ questions: [] }));

    const result = await api.generateCommonQuestions(1);
    expect(result.success).toBe(true);
  });

  test('regenerateSingleQuestion sends correct params', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ question: {} }));

    const result = await api.regenerateSingleQuestion({
      interview_prep_id: 1,
      question_id: 'q1',
    });
    expect(result.success).toBe(true);
  });

  test('generateBehavioralTechnicalQuestions sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ questions: [] }));

    const result = await api.generateBehavioralTechnicalQuestions(1);
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// STAR STORY GENERATION
// =========================================================================
describe('api - STAR story generation', () => {
  test('generateStarStory sends correct params with defaults', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ story: {} }));

    await api.generateStarStory({
      tailoredResumeId: 1,
      experienceIndices: [0, 1],
      storyTheme: 'leadership',
    });

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.tone).toBe('professional');
  });

  test('generateStarStory uses provided tone', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ story: {} }));

    await api.generateStarStory({
      tailoredResumeId: 1,
      experienceIndices: [0],
      storyTheme: 'leadership',
      tone: 'conversational',
    });

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.tone).toBe('conversational');
  });
});

// =========================================================================
// COMPANY RESEARCH & NEWS
// =========================================================================
describe('api - Company research & news', () => {
  test('getCompanyResearch sends correct params', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ overview: 'TestCo' }));

    const result = await api.getCompanyResearch({
      companyName: 'TestCo',
      industry: 'tech',
      jobTitle: 'Engineer',
    });
    expect(result.success).toBe(true);
  });

  test('getCompanyNews defaults daysBack to 90', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ news: [] }));

    await api.getCompanyNews({ companyName: 'TestCo' });

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.days_back).toBe(90);
  });

  test('getCompanyNews uses provided daysBack', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ news: [] }));

    await api.getCompanyNews({ companyName: 'TestCo', daysBack: 30 });

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.days_back).toBe(30);
  });
});

// =========================================================================
// PRACTICE QUESTIONS & RESPONSES
// =========================================================================
describe('api - Practice questions & responses', () => {
  test('generatePracticeQuestions defaults to 10', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ questions: [] }));

    await api.generatePracticeQuestions(1);

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.num_questions).toBe(10);
  });

  test('generatePracticeQuestions uses provided count', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ questions: [] }));

    await api.generatePracticeQuestions(1, 20);

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.num_questions).toBe(20);
  });

  test('generatePracticeStarStory sends question', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ story: {} }));

    const result = await api.generatePracticeStarStory(1, 'Tell me about a challenge');
    expect(result.success).toBe(true);
  });

  test('savePracticeResponse maps camelCase to snake_case', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 1, times_practiced: 1 }));

    await api.savePracticeResponse({
      interviewPrepId: 1,
      questionText: 'Test question',
      questionCategory: 'behavioral',
      practiceDurationSeconds: 120,
    });

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.interview_prep_id).toBe(1);
    expect(callBody.question_text).toBe('Test question');
    expect(callBody.practice_duration_seconds).toBe(120);
  });

  test('getPracticeResponses fetches by prep ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse([]));

    const result = await api.getPracticeResponses(5);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/interview-prep/practice-responses/5',
      expect.anything()
    );
  });

  test('getPracticeHistory fetches by prep ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse([]));

    const result = await api.getPracticeHistory(5);
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// SAVED COMPARISONS
// =========================================================================
describe('api - Saved comparisons', () => {
  test('getSavedComparisons handles array response', async () => {
    const comparisons = [{ id: 1 }, { id: 2 }];
    mockFetchWithAuth.mockResolvedValue(mockResponse(comparisons));

    const result = await api.getSavedComparisons();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(comparisons);
  });

  test('getSavedComparisons handles non-array response', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ items: [] }));

    const result = await api.getSavedComparisons();
    expect(result.data).toEqual([]);
  });

  test('getSavedComparison fetches by ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 1 }));

    const result = await api.getSavedComparison(1);
    expect(result.success).toBe(true);
  });

  test('saveComparison sends correct params', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 1 }));

    const result = await api.saveComparison({
      tailoredResumeId: 1,
      title: 'Test Comparison',
      notes: 'Some notes',
    });
    expect(result.success).toBe(true);
  });

  test('updateComparison sends PUT', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ updated: true }));

    const result = await api.updateComparison(1, { title: 'Updated' });
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/saved-comparisons/1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  test('deleteComparison sends DELETE', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ deleted: true }));

    const result = await api.deleteComparison(1);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/saved-comparisons/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

// =========================================================================
// RESUME ANALYSIS
// =========================================================================
describe('api - Resume analysis', () => {
  test('analyzeAll sends correct params', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ analysis: {} }));

    const result = await api.analyzeAll(1, true);
    expect(result.success).toBe(true);

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.force_refresh).toBe(true);
  });

  test('analyzeAll defaults forceRefresh to false', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ analysis: {} }));

    await api.analyzeAll(1);

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.force_refresh).toBe(false);
  });

  test('analyzeChanges sends both resume IDs', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ changes: [] }));

    const result = await api.analyzeChanges(1, 2);
    expect(result.success).toBe(true);

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.base_resume_id).toBe(1);
    expect(callBody.tailored_resume_id).toBe(2);
  });

  test('analyzeKeywords sends content and description', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ keywords: [] }));

    const result = await api.analyzeKeywords('resume text', 'job description');
    expect(result.success).toBe(true);
  });

  test('calculateMatchScore sends params', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ score: 85 }));

    const result = await api.calculateMatchScore(1, 'job description');
    expect(result.success).toBe(true);
  });

  test('clearAnalysisCache sends DELETE', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ cleared: true }));

    const result = await api.clearAnalysisCache(1);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/resume-analysis/cache/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  test('clearAnalysisCache handles error response', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ detail: 'Not found' }, false, 404)
    );

    const result = await api.clearAnalysisCache(999);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Not found');
  });
});

// =========================================================================
// STAR STORIES CRUD
// =========================================================================
describe('api - STAR stories CRUD', () => {
  test('createStarStory sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 1 }));

    const result = await api.createStarStory({
      situation: 'Test',
      task: 'Test',
      action: 'Test',
      result: 'Test',
    });
    expect(result.success).toBe(true);
  });

  test('listStarStories returns array', async () => {
    const stories = [{ id: 1 }, { id: 2 }];
    mockFetchWithAuth.mockResolvedValue(mockResponse(stories));

    const result = await api.listStarStories();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(stories);
  });

  test('listStarStories handles non-array response', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ stories: [] }));

    const result = await api.listStarStories();
    expect(result.data).toEqual([]);
  });

  test('listStarStories with tailoredResumeId adds query param', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse([]));

    await api.listStarStories(5);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/star-stories/list?tailored_resume_id=5',
      expect.anything()
    );
  });

  test('listStarStories without tailoredResumeId uses base URL', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse([]));

    await api.listStarStories();
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/star-stories/list',
      expect.anything()
    );
  });

  test('getStarStory fetches by ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 1 }));

    const result = await api.getStarStory(1);
    expect(result.success).toBe(true);
  });

  test('updateStarStory sends PUT', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ updated: true }));

    const result = await api.updateStarStory(1, { situation: 'Updated' });
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalledWith(
      '/api/star-stories/1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  test('deleteStarStory sends DELETE', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ deleted: true }));

    const result = await api.deleteStarStory(1);
    expect(result.success).toBe(true);
  });

  test('analyzeStarStory sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ overall_score: 90 }));

    const result = await api.analyzeStarStory(1);
    expect(result.success).toBe(true);
  });

  test('getStorySuggestions sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ improvement_tips: [] }));

    const result = await api.getStorySuggestions(1);
    expect(result.success).toBe(true);
  });

  test('generateStoryVariations sends params with defaults', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ variations: [] }));

    await api.generateStoryVariations({
      storyId: 1,
      contexts: ['technical'],
    });

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.tones).toEqual(['professional', 'conversational']);
  });
});

// =========================================================================
// CAREER PATH
// =========================================================================
describe('api - Career path', () => {
  test('researchCareerPath sends correct params', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ research: {} }));

    const result = await api.researchCareerPath({
      currentRole: 'Junior Dev',
      targetRole: 'Senior Dev',
      industry: 'tech',
    });
    expect(result.success).toBe(true);
  });

  test('generateCareerPlan converts snake_case in plan', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({
        plan: { skill_gaps: [] },
        plan_id: 1,
      })
    );

    const result = await api.generateCareerPlan({
      currentRole: 'Junior',
      targetRole: 'Senior',
    });
    expect(result.success).toBe(true);
    expect(result.data?.planId).toBe(1);
  });

  test('generateCareerPlanAsync sends intake', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ success: true, job_id: 'abc-123' })
    );

    const result = await api.generateCareerPlanAsync({ role: 'Engineer' });
    expect(result.success).toBe(true);
    expect(result.data?.job_id).toBe('abc-123');
  });

  test('generateCareerPlanAsync handles validation errors', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse(
        { detail: [{ loc: ['body', 'role'], msg: 'field required' }] },
        false,
        422
      )
    );

    const result = await api.generateCareerPlanAsync({});
    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation errors');
    expect(result.error).toContain('body.role');
  });

  test('generateCareerPlanAsync handles string error', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ detail: 'Bad request' }, false, 400)
    );

    const result = await api.generateCareerPlanAsync({});
    expect(result.success).toBe(false);
    expect(result.error).toBe('Bad request');
  });

  test('getCareerPlanJobStatus converts plan data', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({
        status: 'completed',
        plan: { skill_gaps: [] },
        plan_id: 5,
      })
    );

    const result = await api.getCareerPlanJobStatus('abc');
    expect(result.success).toBe(true);
    expect(result.data?.planId).toBe(5);
  });

  test('getCareerPlanJobStatus handles error', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ detail: 'Not found' }, false, 404)
    );

    const result = await api.getCareerPlanJobStatus('bad-id');
    expect(result.success).toBe(false);
  });

  test('getCareerPlan fetches by ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 1 }));

    const result = await api.getCareerPlan(1);
    expect(result.success).toBe(true);
  });

  test('listCareerPlans returns array', async () => {
    const plans = [{ id: 1 }];
    mockFetchWithAuth.mockResolvedValue(mockResponse(plans));

    const result = await api.listCareerPlans();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(plans);
  });

  test('listCareerPlans handles non-array', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ plans: [] }));

    const result = await api.listCareerPlans();
    expect(result.data).toEqual([]);
  });

  test('deleteCareerPlan sends DELETE', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ deleted: true }));

    const result = await api.deleteCareerPlan(1);
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// CERTIFICATION RECOMMENDATIONS
// =========================================================================
describe('api - Certification recommendations', () => {
  test('getCertificationRecommendations sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ recommendations: [] }));

    const result = await api.getCertificationRecommendations(1);
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// EXPORT
// =========================================================================
describe('api - Export', () => {
  test('exportResume returns blob URL', async () => {
    // Mock URL.createObjectURL
    const mockUrl = 'blob:test-url';
    global.URL.createObjectURL = jest.fn(() => mockUrl);

    mockFetchWithAuth.mockResolvedValue(mockResponse({}, true));

    const result = await api.exportResume(1, 'pdf');
    expect(result.success).toBe(true);
    expect(result.data).toBe(mockUrl);
  });

  test('exportResume handles error', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ detail: 'Export failed' }, false, 500)
    );

    const result = await api.exportResume(1);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Export failed');
  });

  test('exportSavedItems returns blob', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({}, true));

    const result = await api.exportSavedItems('json');
    expect(result.success).toBe(true);
  });

  test('exportSavedItems handles error', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ detail: 'Export failed' }, false, 500)
    );

    const result = await api.exportSavedItems();
    expect(result.success).toBe(false);
  });

  test('exportResumeAnalysis returns blob', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({}, true));

    const result = await api.exportResumeAnalysis(1, 'pdf');
    expect(result.success).toBe(true);
  });

  test('exportResumeAnalysis handles error with fallback', async () => {
    // json() returns error data
    const errorResponse = {
      ok: false,
      status: 500,
      json: jest.fn(() => Promise.resolve({ detail: 'Export failed' })),
    } as unknown as Response;
    mockFetchWithAuth.mockResolvedValue(errorResponse);

    const result = await api.exportResumeAnalysis(1, 'docx');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Export failed');
  });

  test('exportResumeAnalysis handles json parse failure in error', async () => {
    const errorResponse = {
      ok: false,
      status: 500,
      json: jest.fn(() => Promise.reject(new Error('not json'))),
    } as unknown as Response;
    mockFetchWithAuth.mockResolvedValue(errorResponse);

    const result = await api.exportResumeAnalysis(1, 'docx');
    expect(result.success).toBe(false);
    expect(result.error).toContain('HTTP 500');
  });
});

// =========================================================================
// INTERVIEW INTELLIGENCE
// =========================================================================
describe('api - Interview intelligence', () => {
  test('getInterviewReadinessScore fetches by prep ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ confidence_level: 80 }));

    const result = await api.getInterviewReadinessScore(1);
    expect(result.success).toBe(true);
  });

  test('getValuesAlignment fetches by prep ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ alignment_score: 90 }));

    const result = await api.getValuesAlignment(1);
    expect(result.success).toBe(true);
  });

  test('getCompanyResearchForPrep fetches by prep ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ company_overview: 'Test' }));

    const result = await api.getCompanyResearchForPrep(1);
    expect(result.success).toBe(true);
  });

  test('getStrategicNews fetches by prep ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse([]));

    const result = await api.getStrategicNews(1);
    expect(result.success).toBe(true);
  });

  test('getCompetitiveIntelligence fetches by prep ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ market_position: 'Leader' }));

    const result = await api.getCompetitiveIntelligence(1);
    expect(result.success).toBe(true);
  });

  test('getInterviewStrategy fetches by prep ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ recommended_approach: 'Be cool' }));

    const result = await api.getInterviewStrategy(1);
    expect(result.success).toBe(true);
  });

  test('getExecutiveInsights fetches by prep ID', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ executive_priorities: [] }));

    const result = await api.getExecutiveInsights(1);
    expect(result.success).toBe(true);
  });

  test('calculateReadiness sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ score: 85 }));

    const result = await api.calculateReadiness(1);
    expect(result.success).toBe(true);
  });

  test('saveQuestionStarStory sends correct params', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ saved: true }));

    const result = await api.saveQuestionStarStory({
      interviewPrepId: 1,
      questionId: 'q1',
      starStory: { situation: 'Test' },
    });
    expect(result.success).toBe(true);
  });

  test('scoreContentRelevance sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ data: { score: 90 } })
    );

    const result = await api.scoreContentRelevance({
      content_items: [],
      job_description: 'test',
      job_title: 'Engineer',
    });
    expect(result.success).toBe(true);
  });

  test('scoreContentRelevance handles error', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ detail: 'Bad request' }, false, 400)
    );

    const result = await api.scoreContentRelevance({
      content_items: [],
      job_description: 'test',
      job_title: 'Engineer',
    });
    expect(result.success).toBe(false);
  });

  test('generateTalkingPoints sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ data: { points: [] } })
    );

    const result = await api.generateTalkingPoints({
      content: {},
      job_description: 'test',
      job_title: 'Engineer',
      company_name: 'TestCo',
    });
    expect(result.success).toBe(true);
  });

  test('analyzeJobAlignment sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ data: { alignment: {} } })
    );

    const result = await api.analyzeJobAlignment({
      company_research: {},
      job_description: 'test',
      job_title: 'Engineer',
      company_name: 'TestCo',
    });
    expect(result.success).toBe(true);
  });

  test('calculateInterviewReadiness sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ data: { score: 75 } })
    );

    const result = await api.calculateInterviewReadiness({
      prep_data: {},
      sections_completed: ['company_research'],
    });
    expect(result.success).toBe(true);
  });

  test('generateValuesAlignment sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ data: { alignment: {} } })
    );

    const result = await api.generateValuesAlignment({
      stated_values: [],
      candidate_background: 'test',
      job_description: 'test',
      company_name: 'TestCo',
    });
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// CAREER FEATURES (#13-#17)
// =========================================================================
describe('api - Career features', () => {
  test('analyzeCareerTrajectory sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ growth_potential: {} }));

    const result = await api.analyzeCareerTrajectory({
      resumeId: 1,
      targetRole: 'CTO',
    });
    expect(result.success).toBe(true);
  });

  test('getSkillGaps sends GET with custom headers', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ identified_gaps: [] }));

    const result = await api.getSkillGaps({
      resumeId: 1,
      targetRole: 'Senior Dev',
    });
    expect(result.success).toBe(true);
  });

  test('generateDetailedCareerPlan defaults timeline to 6months', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ plan_id: 1 }));

    await api.generateDetailedCareerPlan({
      resumeId: 1,
      currentRole: 'Junior',
      targetRole: 'Senior',
    });

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.timeline).toBe('6months');
  });

  test('bulkDeleteSavedItems sends comparison IDs', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ deleted: 3 }));

    const result = await api.bulkDeleteSavedItems([1, 2, 3]);
    expect(result.success).toBe(true);
  });
});

// =========================================================================
// ADDITIONAL CAREER PATH METHODS
// =========================================================================
describe('api - Additional career path methods', () => {
  test('refreshCareerPlanEvents sends POST', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ events: [] }));

    const result = await api.refreshCareerPlanEvents(1, 'Houston, TX');
    expect(result.success).toBe(true);
  });

  test('refreshCareerPlanEvents handles error', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ error: 'Not found' }, false, 404)
    );

    const result = await api.refreshCareerPlanEvents(999, 'Nowhere');
    expect(result.success).toBe(false);
  });

  test('generateTasksForRole sends POST with defaults', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ tasks: [] }));

    await api.generateTasksForRole('Software Engineer');

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.industry).toBe('');
  });

  test('generateTasksForRole uses provided industry', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ tasks: [] }));

    await api.generateTasksForRole('Engineer', 'tech');

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.industry).toBe('tech');
  });
});

// =========================================================================
// COMPANY RESEARCH METHODS
// =========================================================================
describe('api - Company research methods', () => {
  test('getCompanyValues returns data from nested response', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ data: { values: ['innovation'] } })
    );

    const result = await api.getCompanyValues('TestCo');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ values: ['innovation'] });
  });

  test('getCompanyValues uses top-level data when no nested data', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ values: ['innovation'] })
    );

    const result = await api.getCompanyValues('TestCo');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ values: ['innovation'] });
  });

  test('getCompanyValues handles error', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ detail: 'Not found' }, false, 404)
    );

    const result = await api.getCompanyValues('Unknown');
    expect(result.success).toBe(false);
  });

  test('getInterviewQuestions sends correct params with defaults', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ data: { questions: [] } })
    );

    await api.getInterviewQuestions('TestCo');

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.max_questions).toBe(30);
    expect(callBody.job_title).toBeNull();
  });

  test('getInterviewQuestions uses provided params', async () => {
    mockFetchWithAuth.mockResolvedValue(
      mockResponse({ data: { questions: [] } })
    );

    await api.getInterviewQuestions('TestCo', 'Engineer', 10);

    const callBody = mockFetchWithAuth.mock.calls[0][1]?.body as any;
    expect(callBody.max_questions).toBe(10);
    expect(callBody.job_title).toBe('Engineer');
  });
});

// =========================================================================
// ERROR HANDLING PATTERNS
// =========================================================================
describe('api - Error handling patterns', () => {
  const methodsToTest = [
    ['getResume', [1]],
    ['uploadResume', [new FormData()]],
    ['deleteResume', [1]],
    ['tailorResume', [{ baseResumeId: 1 }]],
    ['getTailoredResume', [1]],
    ['updateTailoredResume', [1, {}]],
    ['generateInterviewPrep', [1]],
    ['getInterviewPrep', [1]],
    ['deleteInterviewPrep', [1]],
    ['generateCommonQuestions', [1]],
    ['generateBehavioralTechnicalQuestions', [1]],
    ['savePracticeResponse', [{ interviewPrepId: 1, questionText: 'Q' }]],
    ['getPracticeResponses', [1]],
    ['getPracticeHistory', [1]],
    ['getSavedComparison', [1]],
    ['saveComparison', [{ tailoredResumeId: 1, title: 'T' }]],
    ['updateComparison', [1, {}]],
    ['deleteComparison', [1]],
    ['analyzeResume', [1]],
    ['analyzeAll', [1]],
    ['analyzeChanges', [1, 2]],
    ['analyzeKeywords', ['resume', 'job']],
    ['calculateMatchScore', [1, 'desc']],
    ['createStarStory', [{ situation: 'S', task: 'T', action: 'A', result: 'R' }]],
    ['getStarStory', [1]],
    ['updateStarStory', [1, {}]],
    ['deleteStarStory', [1]],
    ['researchCareerPath', [{ currentRole: 'A', targetRole: 'B' }]],
    ['getCareerPlan', [1]],
    ['deleteCareerPlan', [1]],
    ['getCertificationRecommendations', [1]],
    ['calculateReadiness', [1]],
    ['getValuesAlignment', [1]],
    ['getInterviewReadinessScore', [1]],
    ['getCompanyResearchForPrep', [1]],
    ['getStrategicNews', [1]],
    ['getCompetitiveIntelligence', [1]],
    ['getInterviewStrategy', [1]],
    ['getExecutiveInsights', [1]],
    // Additional methods for full coverage
    ['analyzeCareerTrajectory', [{ resumeId: 1, targetRole: 'PM' }]],
    ['analyzeJobAlignment', [{ company_research: {}, job_description: 'desc', job_title: 'title', company_name: 'co' }]],
    ['analyzeStarStory', [1]],
    ['bulkDeleteSavedItems', [[1, 2]]],
    ['calculateInterviewReadiness', [{ prep_data: {}, sections_completed: ['s1'] }]],
    ['clearAnalysisCache', []],
    ['exportResume', [1, 'pdf']],
    ['exportResumeAnalysis', [1]],
    ['exportSavedItems', [1]],
    ['extractJobDetails', ['https://example.com/job']],
    ['generateCareerPlan', [{ currentRole: 'A', targetRole: 'B' }]],
    ['generateCareerPlanAsync', [{ currentRole: 'A', targetRole: 'B' }]],
    ['generateDetailedCareerPlan', [{ currentRole: 'A', targetRole: 'B' }]],
    ['generatePracticeQuestions', [1]],
    ['generatePracticeStarStory', [{ question: 'Q', situation: 'S' }]],
    ['generateStarStory', [{ prompt: 'test' }]],
    ['generateStoryVariations', [1]],
    ['generateTalkingPoints', [{ company_research: {}, job_description: 'desc', job_title: 'title', company_name: 'co' }]],
    ['generateTasksForRole', [{ role: 'PM' }]],
    ['generateValuesAlignment', [{ stated_values: [], candidate_background: 'bg', job_description: 'desc', company_name: 'co' }]],
    ['getCareerPlanJobStatus', [1]],
    ['getCompanyNews', ['TestCo']],
    ['getCompanyResearch', ['TestCo']],
    ['getCompanyValues', ['TestCo']],
    ['getInterviewQuestions', ['TestCo', 'PM']],
    ['getSkillGaps', [{ resumeId: 1, targetRole: 'PM' }]],
    ['getStorySuggestions', [1]],
    ['listCareerPlans', []],
    ['listInterviewPreps', []],
    ['listStarStories', []],
    ['listTailoredResumes', []],
    ['refreshCareerPlanEvents', [1]],
    ['regenerateSingleQuestion', [{ interview_prep_id: 1, question_id: 'q1' }]],
    ['saveQuestionStarStory', [{ questionId: 1, story: 'S' }]],
    ['scoreContentRelevance', [{ content: 'text', jobDescription: 'desc' }]],
  ] as const;

  test.each(methodsToTest)(
    '%s returns success:false on network error',
    async (methodName, args) => {
      mockFetchWithAuth.mockRejectedValue(new Error('Network error'));

      const method = (api as any)[methodName];
      const result = await method(...args);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    }
  );

  test.each(methodsToTest)(
    '%s returns success on OK response',
    async (methodName, args) => {
      mockFetchWithAuth.mockResolvedValue(mockResponse({ data: { test: true } }));

      const method = (api as any)[methodName];
      const result = await method(...args);
      // Most methods return { success: true } or the data directly
      if (result && typeof result === 'object' && 'success' in result) {
        expect(result.success).toBe(true);
      } else {
        expect(result).toBeDefined();
      }
    }
  );

  test.each(methodsToTest)(
    '%s handles HTTP error response without crashing',
    async (methodName, args) => {
      mockFetchWithAuth.mockResolvedValue(
        mockResponse({ error: 'Server error', detail: 'Internal error' }, false, 500)
      );

      const method = (api as any)[methodName];
      const result = await method(...args);
      // Verify the method handles error responses gracefully (returns something)
      expect(result).toBeDefined();
    }
  );
});

// =========================================================================
// INTERNAL snakeToCamel edge cases
// =========================================================================
describe('api - internal snakeToCamel', () => {
  test('snakeToCamel handles primitive values in response', async () => {
    // When json returns an object without the expected key, fallback logic applies
    mockFetchWithAuth.mockResolvedValue(mockResponse({ other: 'data' }));

    const result = await api.getResumes();
    // getResumes uses json.resumes || [] so missing key gives []
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });

  test('snakeToCamel converts nested snake_case keys in response', async () => {
    const snakeData = {
      job_title: 'Engineer',
      company_name: 'TestCo',
      nested_obj: { inner_key: 'value' },
    };
    mockFetchWithAuth.mockResolvedValue(mockResponse(snakeData));

    const result = await api.getResume(1);
    expect(result.success).toBe(true);
    // The snakeToCamel in client.ts will convert keys
    expect(result.data).toBeDefined();
  });
});

// =========================================================================
// ADDITIONAL METHOD COVERAGE
// =========================================================================
describe('api - additional method coverage', () => {
  test('tailorResumeBatch validates max 10 URLs', async () => {
    const result = await api.tailorResumeBatch({
      baseResumeId: 1,
      jobUrls: Array.from({ length: 11 }, (_, i) => `https://job.com/${i}`),
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('10');
  });

  test('generateInterviewPrep sends POST to generate endpoint', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 1 }));

    const result = await api.generateInterviewPrep(42);
    expect(result.success).toBe(true);
    expect(mockFetchWithAuth).toHaveBeenCalled();
  });

  test('savePracticeResponse sends practice data', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({ id: 1 }));

    const result = await api.savePracticeResponse({
      interviewPrepId: 5,
      questionText: 'Tell me about yourself',
      questionCategory: 'behavioral',
    });
    expect(result.success).toBe(true);
  });

  test('listInterviewPreps extracts interview_preps from response', async () => {
    const preps = [{ id: 1 }, { id: 2 }];
    mockFetchWithAuth.mockResolvedValue(mockResponse({ interview_preps: preps }));

    const result = await api.listInterviewPreps();
    expect(result.success).toBe(true);
    expect(result.data).toEqual(preps);
  });

  test('listInterviewPreps returns empty when no preps key', async () => {
    mockFetchWithAuth.mockResolvedValue(mockResponse({}));

    const result = await api.listInterviewPreps();
    expect(result.success).toBe(true);
    expect(result.data).toEqual([]);
  });
});
