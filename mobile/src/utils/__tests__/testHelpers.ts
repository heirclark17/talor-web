/**
 * Shared test utilities for the Talor mobile app
 */

/**
 * Flush all pending promises in the microtask queue
 */
export function flushPromises(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Create a standard mock API response
 */
export function mockApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string
) {
  return { success, data, error };
}

/**
 * Create a mock resume object
 */
export function createMockResume(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    filename: 'test_resume.pdf',
    original_filename: 'test_resume.pdf',
    upload_date: '2026-01-01T00:00:00Z',
    file_size: 1024,
    content_text: 'Mock resume content',
    ...overrides,
  };
}

/**
 * Create a mock tailored resume object
 */
export function createMockTailoredResume(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    base_resume_id: 1,
    company: 'Test Corp',
    job_title: 'Software Engineer',
    job_url: 'https://example.com/job/1',
    created_at: '2026-01-01T00:00:00Z',
    summary: 'Tailored summary',
    competencies: ['JavaScript', 'React'],
    experience: [],
    ...overrides,
  };
}

/**
 * Create a mock interview prep object
 */
export function createMockInterviewPrep(overrides: Record<string, any> = {}) {
  return {
    interview_prep_id: 1,
    tailored_resume_id: 1,
    prep_data: {
      company: 'Test Corp',
      job_title: 'Software Engineer',
      questions: [],
    },
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

/**
 * Create a mock fetch Response object
 */
export function createMockResponse(
  data: any,
  options: { ok?: boolean; status?: number; url?: string } = {}
) {
  const { ok = true, status = 200, url = 'https://example.com' } = options;
  return {
    ok,
    status,
    url,
    json: jest.fn(() => Promise.resolve(data)),
    text: jest.fn(() => Promise.resolve(JSON.stringify(data))),
    blob: jest.fn(() => Promise.resolve(new Blob())),
    headers: new Headers(),
  } as unknown as Response;
}

/**
 * Create a mock STAR story
 */
export function createMockStarStory(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    situation: 'At my previous company...',
    task: 'I needed to...',
    action: 'I implemented...',
    result: 'This led to a 25% improvement...',
    tags: ['leadership', 'problem-solving'],
    ...overrides,
  };
}
