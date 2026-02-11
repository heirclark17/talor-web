jest.mock('../../api/client', () => ({
  api: {
    getResumes: jest.fn(),
    listTailoredResumes: jest.fn(),
    uploadResume: jest.fn(),
    deleteResume: jest.fn(),
    tailorResume: jest.fn(),
  },
}));

import { useResumeStore } from '../resumeStore';
import { api } from '../../api/client';

const mockedApi = api as jest.Mocked<typeof api>;

const mockResume = {
  id: 1,
  file_name: 'resume.pdf',
  created_at: '2026-01-15T00:00:00Z',
  tailored_count: 2,
  status: 'active',
};

const mockResume2 = {
  id: 2,
  file_name: 'resume_v2.pdf',
  created_at: '2026-01-20T00:00:00Z',
  tailored_count: 0,
  status: 'active',
};

const mockTailoredResume = {
  id: 10,
  resume_id: 1,
  job_title: 'Security Engineer',
  company: 'Acme Corp',
  created_at: '2026-01-16T00:00:00Z',
  match_score: 85,
};

const mockTailoredResume2 = {
  id: 11,
  resume_id: 1,
  job_title: 'Program Manager',
  company: 'Beta Inc',
  created_at: '2026-01-17T00:00:00Z',
  match_score: 72,
};

describe('ResumeStore', () => {
  beforeEach(() => {
    useResumeStore.getState().reset();
    jest.clearAllMocks();
  });

  // ── Initial state ────────────────────────────────────────────

  it('should have correct initial state', () => {
    const state = useResumeStore.getState();

    expect(state.resumes).toEqual([]);
    expect(state.tailoredResumes).toEqual([]);
    expect(state.selectedResume).toBeNull();
    expect(state.selectedTailoredResume).toBeNull();
    expect(state.isLoadingResumes).toBe(false);
    expect(state.isLoadingTailored).toBe(false);
    expect(state.isUploading).toBe(false);
    expect(state.isTailoring).toBe(false);
    expect(state.error).toBeNull();
  });

  // ── fetchResumes ─────────────────────────────────────────────

  it('fetchResumes success: sets resumes from api response', async () => {
    mockedApi.getResumes.mockResolvedValue({
      success: true,
      data: [mockResume, mockResume2],
    });

    await useResumeStore.getState().fetchResumes();

    const state = useResumeStore.getState();
    expect(state.resumes).toEqual([mockResume, mockResume2]);
    expect(state.isLoadingResumes).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchResumes error response: sets error message', async () => {
    mockedApi.getResumes.mockResolvedValue({
      success: false,
      error: 'Unauthorized',
    });

    await useResumeStore.getState().fetchResumes();

    const state = useResumeStore.getState();
    expect(state.resumes).toEqual([]);
    expect(state.error).toBe('Unauthorized');
    expect(state.isLoadingResumes).toBe(false);
  });

  it('fetchResumes exception: sets error from error.message', async () => {
    mockedApi.getResumes.mockRejectedValue(new Error('Network error'));

    await useResumeStore.getState().fetchResumes();

    const state = useResumeStore.getState();
    expect(state.error).toBe('Network error');
    expect(state.isLoadingResumes).toBe(false);
  });

  it('fetchResumes sets default error when response has no error field', async () => {
    mockedApi.getResumes.mockResolvedValue({ success: false });

    await useResumeStore.getState().fetchResumes();

    expect(useResumeStore.getState().error).toBe('Failed to fetch resumes');
  });

  // ── fetchTailoredResumes ─────────────────────────────────────

  it('fetchTailoredResumes success with nested data (response.data.tailored_resumes)', async () => {
    mockedApi.listTailoredResumes.mockResolvedValue({
      success: true,
      data: { tailored_resumes: [mockTailoredResume, mockTailoredResume2] },
    });

    await useResumeStore.getState().fetchTailoredResumes();

    const state = useResumeStore.getState();
    expect(state.tailoredResumes).toEqual([mockTailoredResume, mockTailoredResume2]);
    expect(state.isLoadingTailored).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchTailoredResumes success with flat data', async () => {
    mockedApi.listTailoredResumes.mockResolvedValue({
      success: true,
      data: [mockTailoredResume],
    });

    await useResumeStore.getState().fetchTailoredResumes();

    const state = useResumeStore.getState();
    expect(state.tailoredResumes).toEqual([mockTailoredResume]);
    expect(state.isLoadingTailored).toBe(false);
  });

  it('fetchTailoredResumes error: sets error', async () => {
    mockedApi.listTailoredResumes.mockResolvedValue({
      success: false,
      error: 'Server error',
    });

    await useResumeStore.getState().fetchTailoredResumes();

    const state = useResumeStore.getState();
    expect(state.error).toBe('Server error');
    expect(state.tailoredResumes).toEqual([]);
    expect(state.isLoadingTailored).toBe(false);
  });

  it('fetchTailoredResumes exception: sets error from thrown error', async () => {
    mockedApi.listTailoredResumes.mockRejectedValue(new Error('Timeout'));

    await useResumeStore.getState().fetchTailoredResumes();

    expect(useResumeStore.getState().error).toBe('Timeout');
    expect(useResumeStore.getState().isLoadingTailored).toBe(false);
  });

  // ── selectResume ─────────────────────────────────────────────

  it('selectResume: sets selectedResume', () => {
    useResumeStore.getState().selectResume(mockResume);

    expect(useResumeStore.getState().selectedResume).toEqual(mockResume);
  });

  it('selectResume null: clears selection', () => {
    useResumeStore.getState().selectResume(mockResume);
    useResumeStore.getState().selectResume(null);

    expect(useResumeStore.getState().selectedResume).toBeNull();
  });

  // ── selectTailoredResume ─────────────────────────────────────

  it('selectTailoredResume: sets selectedTailoredResume', () => {
    useResumeStore.getState().selectTailoredResume(mockTailoredResume);

    expect(useResumeStore.getState().selectedTailoredResume).toEqual(mockTailoredResume);
  });

  // ── uploadResume ─────────────────────────────────────────────

  it('uploadResume success: returns true and triggers fetchResumes', async () => {
    mockedApi.uploadResume.mockResolvedValue({ success: true, data: mockResume });
    mockedApi.getResumes.mockResolvedValue({ success: true, data: [mockResume] });

    const formData = new FormData();
    const result = await useResumeStore.getState().uploadResume(formData);

    expect(result).toBe(true);
    expect(mockedApi.uploadResume).toHaveBeenCalledWith(formData);
    expect(mockedApi.getResumes).toHaveBeenCalled();
    expect(useResumeStore.getState().isUploading).toBe(false);
  });

  it('uploadResume failure: returns false and sets error', async () => {
    mockedApi.uploadResume.mockResolvedValue({
      success: false,
      error: 'File too large',
    });

    const formData = new FormData();
    const result = await useResumeStore.getState().uploadResume(formData);

    expect(result).toBe(false);
    expect(useResumeStore.getState().error).toBe('File too large');
    expect(useResumeStore.getState().isUploading).toBe(false);
  });

  it('uploadResume exception: returns false and sets error', async () => {
    mockedApi.uploadResume.mockRejectedValue(new Error('Upload failed'));

    const formData = new FormData();
    const result = await useResumeStore.getState().uploadResume(formData);

    expect(result).toBe(false);
    expect(useResumeStore.getState().error).toBe('Upload failed');
    expect(useResumeStore.getState().isUploading).toBe(false);
  });

  // ── deleteResume ─────────────────────────────────────────────

  it('deleteResume success: removes resume from resumes array', async () => {
    // Seed state with two resumes
    mockedApi.getResumes.mockResolvedValue({
      success: true,
      data: [mockResume, mockResume2],
    });
    await useResumeStore.getState().fetchResumes();

    mockedApi.deleteResume.mockResolvedValue({ success: true });

    const result = await useResumeStore.getState().deleteResume(1);

    expect(result).toBe(true);
    expect(useResumeStore.getState().resumes).toEqual([mockResume2]);
  });

  it('deleteResume success: clears selectedResume if deleted was selected', async () => {
    // Seed state and select the resume we will delete
    mockedApi.getResumes.mockResolvedValue({ success: true, data: [mockResume] });
    await useResumeStore.getState().fetchResumes();
    useResumeStore.getState().selectResume(mockResume);

    mockedApi.deleteResume.mockResolvedValue({ success: true });

    await useResumeStore.getState().deleteResume(1);

    expect(useResumeStore.getState().selectedResume).toBeNull();
  });

  it('deleteResume success: keeps selectedResume if different resume deleted', async () => {
    mockedApi.getResumes.mockResolvedValue({
      success: true,
      data: [mockResume, mockResume2],
    });
    await useResumeStore.getState().fetchResumes();
    useResumeStore.getState().selectResume(mockResume2);

    mockedApi.deleteResume.mockResolvedValue({ success: true });

    await useResumeStore.getState().deleteResume(1);

    expect(useResumeStore.getState().selectedResume).toEqual(mockResume2);
  });

  it('deleteResume failure: sets error and returns false', async () => {
    mockedApi.deleteResume.mockResolvedValue({
      success: false,
      error: 'Not found',
    });

    const result = await useResumeStore.getState().deleteResume(999);

    expect(result).toBe(false);
    expect(useResumeStore.getState().error).toBe('Not found');
  });

  // ── tailorResume ─────────────────────────────────────────────

  it('tailorResume success: prepends to tailoredResumes and returns data', async () => {
    // Seed existing tailored resumes
    mockedApi.listTailoredResumes.mockResolvedValue({
      success: true,
      data: [mockTailoredResume2],
    });
    await useResumeStore.getState().fetchTailoredResumes();

    const newTailored = { ...mockTailoredResume, id: 20, job_title: 'New Role' };
    mockedApi.tailorResume.mockResolvedValue({
      success: true,
      data: newTailored,
    });

    const result = await useResumeStore.getState().tailorResume(1, 'Job description', 'https://example.com/job');

    expect(result).toEqual(newTailored);
    const tailored = useResumeStore.getState().tailoredResumes;
    expect(tailored[0]).toEqual(newTailored);
    expect(tailored[1]).toEqual(mockTailoredResume2);
    expect(useResumeStore.getState().isTailoring).toBe(false);
  });

  it('tailorResume failure: sets error and returns null', async () => {
    mockedApi.tailorResume.mockResolvedValue({
      success: false,
      error: 'AI service unavailable',
    });

    const result = await useResumeStore.getState().tailorResume(1, 'Job description');

    expect(result).toBeNull();
    expect(useResumeStore.getState().error).toBe('AI service unavailable');
    expect(useResumeStore.getState().isTailoring).toBe(false);
  });

  it('tailorResume exception: sets error and returns null', async () => {
    mockedApi.tailorResume.mockRejectedValue(new Error('Connection refused'));

    const result = await useResumeStore.getState().tailorResume(1, 'Job desc');

    expect(result).toBeNull();
    expect(useResumeStore.getState().error).toBe('Connection refused');
    expect(useResumeStore.getState().isTailoring).toBe(false);
  });

  // ── clearError ───────────────────────────────────────────────

  it('clearError: sets error to null', () => {
    // Set an error first
    mockedApi.getResumes.mockResolvedValue({ success: false, error: 'Some error' });

    useResumeStore.setState({ error: 'Some error' });
    useResumeStore.getState().clearError();

    expect(useResumeStore.getState().error).toBeNull();
  });

  // ── reset ────────────────────────────────────────────────────

  it('reset: restores initial state', async () => {
    // Mutate state
    mockedApi.getResumes.mockResolvedValue({ success: true, data: [mockResume] });
    await useResumeStore.getState().fetchResumes();
    useResumeStore.getState().selectResume(mockResume);
    useResumeStore.getState().selectTailoredResume(mockTailoredResume);
    useResumeStore.setState({ error: 'previous error' });

    // Reset
    useResumeStore.getState().reset();

    const state = useResumeStore.getState();
    expect(state.resumes).toEqual([]);
    expect(state.tailoredResumes).toEqual([]);
    expect(state.selectedResume).toBeNull();
    expect(state.selectedTailoredResume).toBeNull();
    expect(state.isLoadingResumes).toBe(false);
    expect(state.isLoadingTailored).toBe(false);
    expect(state.isUploading).toBe(false);
    expect(state.isTailoring).toBe(false);
    expect(state.error).toBeNull();
  });
});
